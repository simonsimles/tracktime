/**
 * Frontend authentication service for managing JWT tokens.
 * Handles token storage, expiration checking, and API authentication.
 */

class AuthService {
  private readonly TOKEN_KEY = "tracktime_auth_token";
  private readonly TOKEN_EXPIRY_KEY = "tracktime_auth_expiry";
  private readonly API_BASE = "/api";

  /**
   * Login with password and store the resulting JWT token.
   * @param password The user's password
   * @returns Promise resolving to true on success, false on failure
   */
  async login(password: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.token, data.expiresIn);
        return true;
      } else {
        const errorData = await response.json();
        console.error("Login failed:", errorData.error);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  }

  /**
   * Store JWT token and expiration time.
   * @param token The JWT token
   * @param expiresIn Number of seconds until expiration
   */
  private setToken(token: string, expiresIn: number): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    const expiryTime = Date.now() + expiresIn * 1000;
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
  }

  /**
   * Get the stored JWT token.
   * @returns The token or null if not stored
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if user is currently authenticated (token exists and not expired).
   * @returns True if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const expiryStr = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiryStr) return false;

    const expiryTime = parseInt(expiryStr, 10);
    return Date.now() < expiryTime;
  }

  /**
   * Get remaining time until token expiration in milliseconds.
   * @returns Milliseconds until expiration, or 0 if expired/not set
   */
  getTimeUntilExpiry(): number {
    const expiryStr = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiryStr) return 0;

    const expiryTime = parseInt(expiryStr, 10);
    const remaining = expiryTime - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Clear the stored token (logout).
   */
  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }

  /**
   * Validate token is still valid.
   * Useful for checking on app load.
   * @returns True if token exists and not expired
   */
  isTokenValid(): boolean {
    return this.isAuthenticated();
  }
}

// Export singleton instance
export const authService = new AuthService();
