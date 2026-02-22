package de.simles.tracktime

import java.nio.file.{Files, Paths}
import spray.json._
import DefaultJsonProtocol._
import scala.util.{Success, Failure, Try}
import scala.io.Source
import scala.math.BigDecimal
import java.util.Base64

case class Config(
  secretKey: String,
  hashedPassword: Option[String] = None
)

object ConfigManager {
  private val configPath = Paths.get("data", "config.json")
  private var cachedConfig: Option[Config] = None

  // JSON format for Config
  implicit val configFormat: RootJsonFormat[Config] = new RootJsonFormat[Config] {
    def read(json: JsValue): Config = {
      val obj = json.asJsObject
      val secretKey = obj.fields.get("secretKey").map(_.convertTo[String]).getOrElse(generateSecretKey())
      val hashedPassword = obj.fields.get("hashedPassword").map(_.convertTo[String])
      Config(secretKey, hashedPassword)
    }

    def write(obj: Config): JsValue = {
      JsObject(
        "secretKey" -> JsString(obj.secretKey),
        "hashedPassword" -> obj.hashedPassword.map(JsString(_)).getOrElse(JsNull)
      )
    }
  }

  /**
   * Load or initialize the configuration.
   * If config.json doesn't exist, create it with a new secret key.
   * @return The configuration object
   */
  def loadConfig(): Config = {
    cachedConfig match {
      case Some(config) => config
      case None =>
        if (Files.exists(configPath)) {
          // Load existing config
          val content = new String(Files.readAllBytes(configPath))
          val config = content.parseJson.convertTo[Config]
          cachedConfig = Some(config)
          config
        } else {
          // Create new config with generated secret key
          Files.createDirectories(configPath.getParent)
          val newConfig = Config(generateSecretKey(), None)
          saveConfig(newConfig)
          cachedConfig = Some(newConfig)
          newConfig
        }
    }
  }

  /**
   * Update the configuration (e.g., when user sets password).
   * @param config The updated configuration
   */
  def saveConfig(config: Config): Unit = {
    Files.createDirectories(configPath.getParent)
    val json = config.toJson.prettyPrint
    Files.write(configPath, json.getBytes)
    cachedConfig = Some(config)
  }

  /**
   * Generate a random 32-byte secret key encoded as base64.
   * @return The secret key
   */
  private def generateSecretKey(): String = {
    val random = new scala.util.Random
    val bytes = new Array[Byte](32)
    random.nextBytes(bytes)
    Base64.getEncoder.encodeToString(bytes)
  }

  /**
   * Verify a password against the stored hashed password.
   * @param plaintext The plaintext password to verify
   * @return True if password matches, false otherwise
   */
  def verifyPassword(plaintext: String): Boolean = {
    val config = loadConfig()
    config.hashedPassword match {
      case Some(hash) => PasswordManager.verifyPassword(plaintext, hash)
      case None =>
        // No password set yet
        false
    }
  }

  /**
   * Get the secret key for JWT signing.
   * @return The secret key
   */
  def getSecretKey(): String = {
    loadConfig().secretKey
  }

  /**
   * Check if a password has been set.
   * @return True if password is configured, false otherwise
   */
  def isPasswordConfigured(): Boolean = {
    loadConfig().hashedPassword.isDefined
  }
}
