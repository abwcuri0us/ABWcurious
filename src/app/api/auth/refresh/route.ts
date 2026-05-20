import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, usersDb } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

// POST: Refresh session token
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    const rateLimitResult = rateLimit(ip, { limit: 20, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests.' },
        { status: 429 }
      )
    }

    // Get the current token from cookies or Authorization header
    const cookieToken = request.cookies.get('abwcurious_token')?.value
    const authHeader = request.headers.get('authorization')
    const headerToken = authHeader?.replace('Bearer ', '')
    const accessToken = cookieToken || headerToken

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'No active session to refresh.' },
        { status: 401 }
      )
    }

    // Try to verify the token with Supabase
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken)

    if (userError || !userData.user) {
      // Token is invalid or expired - clear cookies and return 401
      const response = NextResponse.json(
        { success: false, error: 'Session expired. Please log in again.' },
        { status: 401 }
      )
      response.cookies.set('abwcurious_token', '', { maxAge: 0, path: '/' })
      response.cookies.set('abwcurious_user', '', { maxAge: 0, path: '/' })
      return response
    }

    // Get user from our users table
    const dbUser = await usersDb.findByEmail(userData.user.email || '')

    const refreshedUserData = {
      id: dbUser?.id || userData.user.id,
      email: dbUser?.email || userData.user.email || '',
      name: dbUser?.name || userData.user.user_metadata?.name || null,
      role: dbUser?.role || 'user',
      avatar: dbUser?.avatar || userData.user.user_metadata?.avatar_url || null,
    }

    // Create response with refreshed user data
    const response = NextResponse.json({
      success: true,
      message: 'Session refreshed.',
      data: { user: refreshedUserData },
    })

    // Update the user cookie with fresh data
    response.cookies.set('abwcurious_user', JSON.stringify(refreshedUserData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Session refresh error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to refresh session.' },
      { status: 500 }
    )
  }
}
