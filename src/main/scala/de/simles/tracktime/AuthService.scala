package de.simles.tracktime

import akka.actor.typed.Behavior
import akka.actor.typed.scaladsl.Behaviors
import scala.concurrent.Future
import scala.util.{Success, Failure}

sealed trait AuthCommand

final case class Login(password: String, replyTo: akka.actor.typed.ActorRef[LoginResponse]) extends AuthCommand

sealed trait LoginResponse
final case class LoginSuccess(token: String, expiresIn: Int) extends LoginResponse
final case class LoginFailure(error: String) extends LoginResponse

object AuthService {
  def apply(): Behavior[AuthCommand] = Behaviors.receive { (context, message) =>
    message match {
      case Login(password, replyTo) =>
        if (!ConfigManager.isPasswordConfigured()) {
          replyTo ! LoginFailure("Authentication not configured. Please set a password using password-hash-generator.js")
        } else if (!ConfigManager.verifyPassword(password)) {
          replyTo ! LoginFailure("Invalid password")
        } else {
          val secretKey = ConfigManager.getSecretKey()
          val token = Auth.generateToken(secretKey, 24)
          val expiresIn = 24 * 3600  // 24 hours in seconds
          replyTo ! LoginSuccess(token, expiresIn)
        }
        Behaviors.same
    }
  }
}
