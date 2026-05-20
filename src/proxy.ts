import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ============================================================================
// Supabase Client for Proxy (Edge Runtime compatible)
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/** Lazy-initialized Supabase client for proxy use */
function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

// ============================================================================
// Security Headers
// ============================================================================

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

// ============================================================================
// Route Classification Helpers
// ============================================================================

/** Routes that are publicly accessible without authentication */
const PUBLIC_ROUTE_PATTERNS: Array<{ pattern: RegExp; methods?: string[] }> = [
  { pattern: /^\/api\/auth(\/.*)?$/ },
  { pattern: /^\/api\/chat(\/.*)?$/ },
  { pattern: /^\/api\/contact(\/.*)?$/ },
  { pattern: /^\/api\/newsletter(\/.*)?$/ },
  { pattern: /^\/api\/status(\/.*)?$/ },
  { pattern: /^\/api\/blogs(\/.*)?$/, methods: ['GET'] },
  { pattern: /^\/api\/careers(\/.*)?$/, methods: ['GET'] },
  { pattern: /^\/api\/events(\/.*)?$/, methods: ['GET'] },
]

/** Check if a route is public (no auth required) */
function isPublicRoute(pathname: string, method: string): boolean {
  return PUBLIC_ROUTE_PATTERNS.some(({ pattern, methods }) => {
    if (!pattern.test(pathname)) return false
    if (!methods) return true
    return methods.includes(method.toUpperCase())
  })
}

/** Check if route requires admin/editor role */
function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/api/admin/')
}

/** Check if route requires authentication (any role) */
function isUserRoute(pathname: string): boolean {
  return pathname.startsWith('/api/user/')
}

/** Check if route requires authentication (upload) */
function isUploadRoute(pathname: string): boolean {
  return pathname.startsWith('/api/upload')
}

// ============================================================================
// Auth Verification Helpers
// ============================================================================

interface AuthResult {
  authenticated: boolean
  user: { id: string; email: string; role: string } | null
  error: string | null
}

/**
 * Verify the access token from the `abwcurious_token` cookie
 * against Supabase Auth.
 */
async function verifyToken(accessToken: string): Promise<AuthResult> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { authenticated: false, user: null, error: 'Auth service unavailable' }
  }

  try {
    const { data, error } = await supabase.auth.getUser(accessToken)

    if (error || !data.user) {
      return {
        authenticated: false,
        user: null,
        error: error?.message || 'Invalid or expired token',
      }
    }

    return {
      authenticated: true,
      user: {
        id: data.user.id,
        email: data.user.email || '',
        role: data.user.role || 'authenticated',
      },
      error: null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Token verification failed'
    return { authenticated: false, user: null, error: message }
  }
}

/**
 * Parse the `abwcurious_user` cookie to extract the user's role.
 */
function parseUserCookie(
  cookieValue: string | undefined
): { id: string; email: string; name: string; role: string } | null {
  if (!cookieValue) return null

  try {
    const parsed = JSON.parse(decodeURIComponent(cookieValue))
    if (parsed && typeof parsed === 'object' && typeof parsed.role === 'string') {
      return {
        id: parsed.id || '',
        email: parsed.email || '',
        name: parsed.name || '',
        role: parsed.role,
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Check if the user's role is authorized for admin routes.
 */
function isAdminRole(role: string | undefined | null): boolean {
  return role === 'admin' || role === 'editor'
}

// ============================================================================
// Response Helpers
// ============================================================================

/** Create a JSON error response with security headers */
function errorResponse(status: number, code: string, message: string): NextResponse {
  return NextResponse.json(
    { error: { code, message } },
    { status }
  )
}

/** Add security headers to any NextResponse */
function withSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

// ============================================================================
// Main Proxy Function
// ============================================================================

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  // -----------------------------------------------------------------------
  // 1. Add CSP header for all responses
  // -----------------------------------------------------------------------
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: blob: https://*.supabase.co https://*.backblazeb2.com`,
    `connect-src 'self' https://*.supabase.co https://api.mistral.ai https://*.backblazeb2.com`,
    `frame-src https://www.youtube.com https://youtube.com https://*.google.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ].join('; ')

  // -----------------------------------------------------------------------
  // 2. Public routes: allow without auth, add security headers
  // -----------------------------------------------------------------------
  if (isPublicRoute(pathname, method)) {
    const response = NextResponse.next()
    response.headers.set('Content-Security-Policy', csp)
    return withSecurityHeaders(response)
  }

  // -----------------------------------------------------------------------
  // 3. Determine if the route requires authentication
  // -----------------------------------------------------------------------
  const requiresAdmin = isAdminRoute(pathname)
  const requiresAuth = requiresAdmin || isUserRoute(pathname) || isUploadRoute(pathname)

  if (!requiresAuth) {
    // Not a protected route and not a public route — just pass through
    const response = NextResponse.next()
    response.headers.set('Content-Security-Policy', csp)
    return withSecurityHeaders(response)
  }

  // -----------------------------------------------------------------------
  // 4. Extract and verify the access token
  // -----------------------------------------------------------------------
  const accessToken = request.cookies.get('abwcurious_token')?.value

  if (!accessToken) {
    const response = errorResponse(401, 'UNAUTHORIZED', 'Authentication required. Please log in.')
    response.headers.set('Content-Security-Policy', csp)
    return withSecurityHeaders(response)
  }

  const authResult = await verifyToken(accessToken)

  if (!authResult.authenticated) {
    const response = errorResponse(401, 'UNAUTHORIZED', authResult.error || 'Invalid or expired token. Please log in again.')
    response.headers.set('Content-Security-Policy', csp)
    return withSecurityHeaders(response)
  }

  // -----------------------------------------------------------------------
  // 5. Admin route: verify admin/editor role
  // -----------------------------------------------------------------------
  if (requiresAdmin) {
    const userCookieValue = request.cookies.get('abwcurious_user')?.value
    const userCookie = parseUserCookie(userCookieValue)
    const userRole = userCookie?.role || authResult.user?.role

    if (!isAdminRole(userRole)) {
      const response = errorResponse(403, 'FORBIDDEN', 'Access denied. Admin or editor role required.')
      response.headers.set('Content-Security-Policy', csp)
      return withSecurityHeaders(response)
    }

    // Admin/editor authorized — add user info to request headers
    const response = NextResponse.next()
    response.headers.set('Content-Security-Policy', csp)
    response.headers.set('x-user-id', authResult.user?.id || userCookie?.id || '')
    response.headers.set('x-user-email', authResult.user?.email || userCookie?.email || '')
    response.headers.set('x-user-role', userRole || 'user')
    return withSecurityHeaders(response)
  }

  // -----------------------------------------------------------------------
  // 6. Authenticated user routes: any valid role is fine
  // -----------------------------------------------------------------------
  const userCookieValue2 = request.cookies.get('abwcurious_user')?.value
  const userCookie2 = parseUserCookie(userCookieValue2)
  const userRole2 = userCookie2?.role || authResult.user?.role || 'user'

  const response2 = NextResponse.next()
  response2.headers.set('Content-Security-Policy', csp)
  response2.headers.set('x-user-id', authResult.user?.id || userCookie2?.id || '')
  response2.headers.set('x-user-email', authResult.user?.email || userCookie2?.email || '')
  response2.headers.set('x-user-role', userRole2)
  return withSecurityHeaders(response2)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png|sw.js|manifest.json|robots.txt|sitemap.xml).*)',
  ],
}
