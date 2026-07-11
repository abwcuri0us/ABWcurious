import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { validateCsrfRequest } from '@/lib/csrf'
import { sanitizePostgrestFilter } from '@/lib/sanitize'

// Zod schema for sending OTP (email verification)
const sendOtpSchema = z.object({
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

    const rateLimitResult = rateLimit(ip, { limit: 5, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = sendOtpSchema.safeParse(body)

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

    // Verify the user exists in Supabase Auth
    const { data } = await supabaseAdmin.auth.admin.listUsers({
      filter: `email eq "${sanitizePostgrestFilter(email.toLowerCase())}"`,
    } as Parameters<typeof supabaseAdmin.auth.admin.listUsers>[0])
    const authUser = data?.users?.[0]

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email address.' },
        { status: 404 }
      )
    }

    // Send OTP using Supabase's built-in email provider
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.abwcurious.com'

    const { error: otpError } = await supabaseAdmin.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${baseUrl}/api/auth/callback`,
      },
    })

    if (otpError) {
      console.error('Supabase OTP send error:', otpError.message)
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'A verification code has been sent to your email.',
        data: { email },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Send OTP API error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
