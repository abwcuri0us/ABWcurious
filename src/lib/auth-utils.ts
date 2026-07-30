import crypto from 'crypto'

/**
 * Timing-safe string comparison to prevent timing attacks.
 * Uses constant-time comparison so attackers cannot determine string
 * contents based on response time.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) {
    // Still do a comparison to avoid leaking length info
    return crypto.timingSafeEqual(bufA, bufA) && false
  }
  return crypto.timingSafeEqual(bufA, bufB)
}

/**
 * Hash a password using PBKDF2 with a salt.
 * Returns both the hash and the salt for storage.
 */
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(32).toString('hex')
  const hash = crypto.pbkdf2Sync(password, actualSalt, 100000, 64, 'sha512').toString('hex')
  return { hash, salt: actualSalt }
}

/**
 * Verify a password against a stored hash and salt.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: newHash } = hashPassword(password, salt)
  return timingSafeEqual(newHash, hash)
}
