import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getCurrentUser, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

// POST: Refresh session token
export async function POST(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Service unavailable.' },
        { status: 503 }
      )
    }

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

    const user = await getCurrentUser(request)
    if (!user) {
      const response = NextResponse.json(
        { success: false, error: 'Session expired. Please log in again.' },
        { status: 401 }
      )
      response.cookies.set('abwcurious_token', '', { maxAge: 0, path: '/' })
      response.cookies.set('abwcurious_user', '', { maxAge: 0, path: '/' })
      return response
    }

    const refreshedUserData = {
      id: user.id,
      email: user.email,
      name: user.name || null,
      role: user.role,
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
