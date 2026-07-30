import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, supabase, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { logActivity } from '@/lib/activity-logger'

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

    // Also check Supabase Auth to avoid duplicate auth users
    let existingAuthUser = null
    try {
      const { data } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
      existingAuthUser = data?.users?.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      ) ?? null
    } catch {
      // If listUsers fails, proceed with signup attempt
    }


    if (existingAuthUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.abwcurious.com'

    // Use standard signUp to automatically send the magic link email
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          full_name: name,
          country: country || null,
          city: city || null,
        },
        emailRedirectTo: `${baseUrl}/auth/callback`,
      }
    })

    if (authError) {
      console.error('Supabase auth signup error:', authError)
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: authError.status || 500 }
      )
    }

    const userId = authData.user?.id

    // Log signup activity
    await logActivity('auth', 'user_signup', `New user signed up: ${email}`, userId, email, request)

    return NextResponse.json(
      {
        success: true,
        message: 'Account created! Please check your email for the verification link.',
        data: {
          user: { id: userId, email, name, role: 'user' },
          magicLinkSent: true,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
