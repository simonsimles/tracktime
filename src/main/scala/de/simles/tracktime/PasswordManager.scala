package de.simles.tracktime

import at.favre.lib.crypto.bcrypt.BCrypt

object PasswordManager {
  /**
   * Hash a plaintext password using bcrypt.
   * @param plaintext The plaintext password to hash
   * @return The bcrypt hash string
   */
  def hashPassword(plaintext: String): String = {
    BCrypt.withDefaults().hashToString(12, plaintext.toCharArray)
  }

  /**
   * Verify a plaintext password against a bcrypt hash.
   * @param plaintext The plaintext password to verify
   * @param hash The bcrypt hash to verify against
   * @return True if the password matches the hash, false otherwise
   */
  def verifyPassword(plaintext: String, hash: String): Boolean = {
    BCrypt.verifyer().verify(plaintext.toCharArray, hash).verified
  }
}
