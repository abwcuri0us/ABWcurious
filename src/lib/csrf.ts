import crypto from 'crypto'

const CSRF_COOKIE_NAME = 'abwcurious_csrf'
const CSRF_HEADER_NAME = 'x-csrf-token'
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

/**
 * Double-submit cookie CSRF validation for mutating requests.
 *
 * For same-site cookies, sameSite=lax provides CSRF protection for most cases.
 * This adds the double-submit cookie pattern as defense-in-depth:
 * - Server sets a non-httpOnly CSRF cookie on session creation
 * - Frontend reads it and sends the value in the x-csrf-token header
 * - Server compares cookie value with header value
 *
 * Safe methods (GET, HEAD, OPTIONS) always pass.
 */
export function validateCsrfRequest(req: Request): boolean {
  const method = req.method.toUpperCase()
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return true

  // Extract CSRF token from cookie and header
  const cookieToken = (req as Request & { cookies?: { get: (name: string) => { value: string } | undefined } }).cookies?.get(CSRF_COOKIE_NAME)?.value
  const headerToken = req.headers.get(CSRF_HEADER_NAME)

  if (!cookieToken || !headerToken) return false

  try {
    const bufA = Buffer.from(cookieToken, 'utf8')
    const bufB = Buffer.from(headerToken, 'utf8')
    if (bufA.length !== bufB.length) return false
    return crypto.timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

export function getCsrfCookieName(): string {
  return CSRF_COOKIE_NAME
}

export function getCsrfHeaderName(): string {
  return CSRF_HEADER_NAME
}

/**
 * Generate a CSRF cookie config to set on session creation.
 * The cookie is non-httpOnly so the frontend can read it.
 */
export function getCsrfCookieConfig(): { name: string; value: string; options: { httpOnly: boolean; secure: boolean; sameSite: 'lax'; path: string; maxAge: number } } {
  return {
    name: CSRF_COOKIE_NAME,
    value: generateCsrfToken(),
    options: {
      httpOnly: false, // Frontend needs to read this
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    },
  }
}