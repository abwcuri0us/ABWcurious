import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { logActivity } from '@/lib/activity-logger'
import { sanitizePostgrestFilter } from '@/lib/sanitize'

// Zod schema for signup validation
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  country: z.string().optional(),
  city: z.string().optional(),
  captchaToken: z.string().optional(),
})

/** Verify hCaptcha token if secret key is configured */
async function verifyCaptcha(token: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET_KEY
  if (!secret) return true // No secret configured, skip verification

  try {
    const response = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    })
    const data = await response.json()
    return !!data.success
  } catch {
    console.error('hCaptcha verification error')
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
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
        { success: false, error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = signupSchema.safeParse(body)

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

    const { email, password, name, country, city, captchaToken } = validationResult.data

    // Verify hCaptcha if secret key is configured
    if (process.env.HCAPTCHA_SECRET_KEY) {
      if (!captchaToken) {
        return NextResponse.json(
          { success: false, error: 'Captcha verification is required.' },
          { status: 400 }
        )
      }
      const captchaValid = await verifyCaptcha(captchaToken)
      if (!captchaValid) {
        return NextResponse.json(
          { success: false, error: 'Captcha verification failed. Please try again.' },
          { status: 400 }
        )
      }
    }

    // Check if user already exists in Supabase profiles table
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    // Also check Supabase Auth to avoid duplicate auth users
    const { data } = await supabaseAdmin.auth.admin.listUsers({
      filter: `email eq "${sanitizePostgrestFilter(email.toLowerCase())}"`,
    } as Parameters<typeof supabaseAdmin.auth.admin.listUsers>[0])
    const existingAuthUser = data?.users?.[0]

    if (existingAuthUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    // Create user in Supabase Auth using admin API
    // email_confirm: false — user will verify via Supabase's built-in OTP email
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // User will verify via OTP sent by Supabase
      user_metadata: {
        name,
        country: country || null,
        city: city || null,
      },
    })

    if (authError) {
      console.error('Supabase auth signup error:', authError)

      if (authError.message?.toLowerCase().includes('already registered') || authError.message?.toLowerCase().includes('already exists')) {
        return NextResponse.json(
          { success: false, error: 'An account with this email already exists.' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Failed to create account. Please try again.' },
        { status: 500 }
      )
    }

    const userId = authData.user?.id

    // Create user profile in Supabase profiles table
    if (userId) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert([{
          id: userId,
          email,
          name,
          provider: 'credentials',
          role: 'user',
          avatar: null,
          country: country || null,
          city: city || null,
        }])

      if (profileError) {
        console.error('Failed to create user profile:', profileError.message)
      }
    }

    // Log signup activity
    await logActivity('auth', 'user_signup', `New user signed up: ${email}`, userId, email, request)

    // Send OTP email using Supabase's built-in email provider
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.abwcurious.com'

      const { error: otpError } = await supabaseAdmin.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${baseUrl}/api/auth/callback`,
        },
      })

      if (otpError) {
        console.error('Supabase OTP send error:', otpError.message)
        // Account was created but OTP failed — user can request a new OTP
        return NextResponse.json(
          {
            success: true,
            message: 'Account created, but we could not send the verification email. Please use "Resend Code" to try again.',
            data: {
              user: { id: userId, email, name, role: 'user' },
              otpSent: false,
            },
          },
          { status: 201 }
        )
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Account created! A verification code has been sent to your email.',
          data: {
            user: { id: userId, email, name, role: 'user' },
            otpSent: true,
          },
        },
        { status: 201 }
      )
    } catch (otpSendError) {
      console.error('Failed to send OTP via Supabase:', otpSendError)
      return NextResponse.json(
        {
          success: true,
          message: 'Account created, but we could not send the verification email. Please use "Resend Code" to try again.',
          data: {
            user: { id: userId, email, name, role: 'user' },
            otpSent: false,
          },
        },
        { status: 201 }
      )
    }
  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
