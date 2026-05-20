import crypto from 'crypto'

const CSRF_TOKEN_LENGTH = 32

/**
 * Generate a cryptographically secure CSRF token.
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex')
}

/**
 * Validate a CSRF token using timing-safe comparison.
 * Prevents timing attacks that could leak token information.
 */
export function validateCsrfToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) return false
  const bufA = Buffer.from(token, 'utf8')
  const bufB = Buffer.from(expectedToken, 'utf8')
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}
