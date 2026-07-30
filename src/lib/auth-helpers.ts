import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/sessions'

/**
 * Helper to extract and verify user from request.
 * Uses the session-based auth system (httpOnly cookie `abwcurious_session`).
 * Falls back to Authorization header Bearer token for backward compatibility.
 * Returns the user object or a NextResponse error.
 */
export async function getUserFromRequest(request: NextRequest) {
  // Try session-based auth first (primary mechanism)
  const sessionResult = await getSessionFromRequest(request)

  if (sessionResult.valid && sessionResult.userId) {
    const user = {
      id: sessionResult.userId,
      email: sessionResult.email || '',
      name: null as string | null,
      avatar: null as string | null,
      role: sessionResult.role || 'user',
    }
    return { user, error: null }
  }

  // Fallback: check Authorization header (backward compatibility)
  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader?.replace('Bearer ', '')

  if (headerToken && headerToken !== 'cookie' && headerToken !== 'cookie-auth') {
    // Try as a Supabase access token
    const { getUserFromToken } = await import('@/lib/supabase')
    const user = await getUserFromToken(headerToken)
    if (user) {
      return { user, error: null }
    }
  }

  return { user: null, error: NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 }) }
}

/**
 * Verify that the authenticated user has admin or editor role.
 * Returns { authorized: true, user } or { authorized: false, user: null }.
 */
export async function verifyAdminAccess(request: NextRequest) {
  const { user, error } = await getUserFromRequest(request)
  if (error || !user) {
    return { authorized: false, user: null }
  }
  if (!['admin', 'editor'].includes(user.role)) {
    return { authorized: false, user: null }
  }
  return { authorized: true, user }
}
