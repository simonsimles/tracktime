package de.simles.tracktime

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import java.time.Instant
import java.util.Date

object Auth {
  /**
   * Generate a JWT token with 24-hour expiration.
   * @param secret The secret key for signing the token
   * @param expirationHours Number of hours until token expires (default: 24)
   * @return JWT token string
   */
  def generateToken(secret: String, expirationHours: Int = 24): String = {
    val algorithm = Algorithm.HMAC256(secret)
    val now = Date.from(Instant.now())
    val expiresAt = Date.from(Instant.now().plusSeconds(expirationHours.toLong * 3600))

    JWT.create()
      .withIssuedAt(now)
      .withExpiresAt(expiresAt)
      .sign(algorithm)
  }

  /**
   * Validate a JWT token and extract claims if valid.
   * @param token The JWT token string
   * @param secret The secret key used to sign the token
   * @return Some(expirationTime) if valid, None if invalid or expired
   */
  def validateToken(token: String, secret: String): Option[Long] = {
    try {
      val algorithm = Algorithm.HMAC256(secret)
      val verifier = JWT.require(algorithm).build()
      val decodedJWT = verifier.verify(token)
      val expiresAt = decodedJWT.getExpiresAtAsInstant
      Some(expiresAt.getEpochSecond)
    } catch {
      case _: Exception => None
    }
  }

  /**
   * Extract the JWT token from the Authorization header.
   * Expected format: "Bearer <token>"
   * @param authHeader The Authorization header value
   * @return Some(token) if valid format, None otherwise
   */
  def extractToken(authHeader: String): Option[String] = {
    if (authHeader.startsWith("Bearer ")) {
      Some(authHeader.substring(7))
    } else {
      None
    }
  }
}
