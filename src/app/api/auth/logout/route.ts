import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { getSessionFromRequest, revokeSession, getSessionCookieName } from '@/lib/sessions'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests.' },
        { status: 429 }
      )
    }

    // Revoke the session server-side if possible
    const sessionResult = await getSessionFromRequest(request)
    if (sessionResult.token) {
      await revokeSession(sessionResult.token)
    }

    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully.' },
      { status: 200 }
    )

    // Clear the httpOnly session cookie
    response.cookies.set(getSessionCookieName(), '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    })

    // Clear the CSRF cookie
    response.cookies.set('abwcurious_csrf', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    })

    // Clear legacy cookies
    response.cookies.set('abwcurious_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    })

    response.cookies.set('abwcurious_user', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error('Logout API error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}