import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { getSessionFromRequest, getSessionCookieName, getSessionMaxAge } from '@/lib/sessions'
import { getCsrfCookieConfig } from '@/lib/csrf'

export async function GET(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Authentication service not configured.' }, { status: 503 })
    }

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

    // Try to validate session from httpOnly cookie or Authorization header
    const sessionResult = await getSessionFromRequest(request)

    if (sessionResult.valid && sessionResult.userId) {
      // Look up profile — only select fields needed by the client
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, email, name, avatar, role, provider, country, city, phone')
        .eq('id', sessionResult.userId)
        .maybeSingle()

      const user = profile
        ? {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            avatar: profile.avatar,
            role: profile.role,
            provider: profile.provider,
            country: profile.country,
            city: profile.city,
            phone: profile.phone,
          }
        : {
            id: sessionResult.userId,
            email: sessionResult.email || '',
            name: null,
            avatar: null,
            role: sessionResult.role || 'user',
            provider: null,
            country: null,
            city: null,
            phone: null,
          }

      // Ensure CSRF cookie is present (renew if missing/expired)
      const response = NextResponse.json(
        {
          success: true,
          data: {
            user,
            auth: {
              id: user.id,
              email_confirmed: true,
              last_sign_in: null,
            },
          },
        },
        { status: 200 }
      )

      // Set/renew CSRF cookie if not present
      const existingCsrf = request.cookies.get('abwcurious_csrf')?.value
      if (!existingCsrf) {
        const csrfConfig = getCsrfCookieConfig()
        response.cookies.set(csrfConfig.name, csrfConfig.value, csrfConfig.options)
      }

      return response
    }

    // No valid session found — return unauthorized
    return NextResponse.json(
      { success: false, error: 'No valid session found.' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}