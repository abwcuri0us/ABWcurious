import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { validateCsrfRequest } from '@/lib/csrf'
import { sanitizePostgrestFilter } from '@/lib/sanitize'

// Zod schema for forgot password
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfRequest(request)) {
      return NextResponse.json({ success: false, error: 'Invalid CSRF token' }, { status: 403 })
    }

    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Authentication service not configured.' }, { status: 503 })
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    const rateLimitResult = rateLimit(`forgot-password:${ip}`, { limit: 3, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = forgotPasswordSchema.safeParse(body)

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

    const { email } = validationResult.data

    // Check if user exists in Supabase Auth
    const { data } = await supabaseAdmin.auth.admin.listUsers({
      filter: `email eq "${sanitizePostgrestFilter(email.toLowerCase())}"`,
    } as Parameters<typeof supabaseAdmin.auth.admin.listUsers>[0])
    const existingUser = data?.users?.[0]

    if (!existingUser) {
      // Don't reveal that the email doesn't exist for security reasons
      // But return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a password reset code has been sent.',
      })
    }

    // Check if the user signed up via OAuth (no password to reset)
    if (existingUser.app_metadata?.provider === 'google' || existingUser.app_metadata?.provider === 'github') {
      return NextResponse.json({
        success: false,
        error: `This account was created using ${existingUser.app_metadata.provider === 'google' ? 'Google' : 'GitHub'}. Please log in with ${existingUser.app_metadata.provider === 'google' ? 'Google' : 'GitHub'} instead.`,
        errorType: 'oauth_account',
      }, { status: 400 })
    }

    // Send password reset OTP using Supabase's built-in email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.abwcurious.com'

    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/api/auth/callback`,
    })

    if (resetError) {
      console.error('[Forgot Password] Supabase resetPasswordForEmail error:', resetError.message)

      // Fallback: use signInWithOtp to send a verification code
      const { error: otpError } = await supabaseAdmin.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${baseUrl}/api/auth/callback`,
        },
      })

      if (otpError) {
        console.error('[Forgot Password] Fallback OTP send error:', otpError.message)
        // Still return success to prevent email enumeration
        return NextResponse.json({
          success: true,
          message: 'If an account with this email exists, a reset code has been sent.',
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'A password reset code has been sent to your email.',
    })
  } catch (error) {
    console.error('Forgot Password API error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
