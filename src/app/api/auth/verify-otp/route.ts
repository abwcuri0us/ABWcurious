import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { createSession, getSessionCookieName, getSessionMaxAge } from '@/lib/sessions'
import { getCsrfCookieConfig } from '@/lib/csrf'

// Zod schema for OTP verification
const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().min(4, 'OTP must be at least 4 digits').max(10, 'OTP is too long'),
  type: z.enum(['signup', 'login', 'email']).default('email'),
})

export async function POST(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Authentication service not configured.' },
        { status: 503 }
      )
    }

    // Rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const rateLimitResult = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many verification attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = verifyOtpSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    const { email, otp, type } = validationResult.data

    // Verify OTP using Supabase's built-in verification
    const { data: verifyData, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
      email,
      token: otp,
      type: 'email', // Always 'email' type for signup/login verification
    })

    if (verifyError) {
      console.error('Supabase OTP verification error:', verifyError.message)

      // Map common Supabase errors to user-friendly messages
      const errorMessage = verifyError.message?.toLowerCase() || ''

      if (errorMessage.includes('token has expired') || errorMessage.includes('expired')) {
        return NextResponse.json(
          { success: false, error: 'Verification code has expired. Please request a new one.' },
          { status: 401 }
        )
      }

      if (errorMessage.includes('invalid') || errorMessage.includes('wrong')) {
        return NextResponse.json(
          { success: false, error: 'Invalid verification code. Please check and try again.' },
          { status: 401 }
        )
      }

      if (errorMessage.includes('not found') || errorMessage.includes('user not found')) {
        return NextResponse.json(
          { success: false, error: 'No account found with this email address.' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Verification failed. Please try again.' },
        { status: 401 }
      )
    }

    const authUser = verifyData.user
    const session = verifyData.session

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Verification failed. No user data returned.' },
        { status: 401 }
      )
    }

    const userId = authUser.id

    // Ensure the user's email is confirmed in Supabase Auth
    if (!authUser.email_confirmed_at) {
      const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        email_confirm: true,
      })
      if (confirmError) {
        console.error('Failed to confirm user email:', confirmError.message)
      }
    }

    // Look up or create user profile
    let userData: { id: string; email: string; name: string | null; avatar: string | null; role: string } | null = null

    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      userData = existingProfile
    } else {
      const metadataName = authUser.user_metadata?.name || authUser.user_metadata?.full_name || null
      const metadataAvatar = authUser.user_metadata?.avatar_url || null

      const { data: newProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            id: userId,
            email,
            name: metadataName,
            avatar: metadataAvatar,
            provider: 'credentials',
            role: 'user',
          },
        ])
        .select()
        .single()

      if (profileError) {
        console.error('Failed to create user profile:', profileError.message)
        userData = {
          id: userId,
          email,
          name: metadataName,
          avatar: metadataAvatar,
          role: 'user',
        }
      } else {
        userData = newProfile
      }
    }

    // Create server-side session and set httpOnly + CSRF cookies
    const sessionToken = await createSession(
      { userId: userData?.id || userId || '', email: userData?.email || email, role: userData?.role || 'user' },
      request
    )
    const csrfConfig = getCsrfCookieConfig()

    const response = NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully!',
        data: {
          user: {
            id: userData?.id || userId || '',
            email: userData?.email || email,
            name: userData?.name || null,
            avatar: userData?.avatar || null,
            role: userData?.role || 'user',
          },
        },
      },
      { status: 200 }
    )

    response.cookies.set(getSessionCookieName(), sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: getSessionMaxAge(),
      path: '/',
    })
    response.cookies.set(csrfConfig.name, csrfConfig.value, csrfConfig.options)

    return response
  } catch (error) {
    console.error('Verify OTP API error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
