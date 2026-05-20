import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    const rateLimitResult = rateLimit(ip, { limit: 30, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests.' },
        { status: 429 }
      )
    }

    // First try reading token from httpOnly cookie
    const cookieToken = request.cookies.get('abwcurious_token')?.value

    // Fall back to Authorization header for backward compatibility
    const authHeader = request.headers.get('authorization')
    const headerToken = authHeader?.replace('Bearer ', '')

    const accessToken = cookieToken || headerToken

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'No access token provided.' },
        { status: 401 }
      )
    }

    // Verify token with Supabase and get user
    const user = await getUserFromToken(accessToken)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
          },
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
