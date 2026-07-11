import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { validateCsrfRequest } from '@/lib/csrf'

// Zod schema for reset password
const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().min(4, 'Reset code must be at least 4 digits').max(10, 'Reset code is too long'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
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

    const rateLimitResult = rateLimit(`reset-password:${ip}`, { limit: 5, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = resetPasswordSchema.safeParse(body)

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

    const { email, otp, newPassword } = validationResult.data

    // Step 1: Verify the OTP first
    const { data: verifyData, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })

    if (verifyError) {
      const errorMessage = verifyError.message?.toLowerCase() || ''

      if (errorMessage.includes('expired')) {
        return NextResponse.json(
          { success: false, error: 'Reset code has expired. Please request a new one.' },
          { status: 401 }
        )
      }

      if (errorMessage.includes('invalid') || errorMessage.includes('wrong')) {
        return NextResponse.json(
          { success: false, error: 'Invalid reset code. Please check and try again.' },
          { status: 401 }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Verification failed. Please try again.' },
        { status: 401 }
      )
    }

    // Step 2: Update the user's password
    const userId = verifyData.user?.id
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not found. Please try again.' },
        { status: 404 }
      )
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (updateError) {
      console.error('[Reset Password] Failed to update password:', updateError.message)
      return NextResponse.json(
        { success: false, error: 'Failed to update password. Please try again.' },
        { status: 500 }
      )
    }

    // Step 3: Ensure email is confirmed
    if (verifyData.user && !verifyData.user.email_confirmed_at) {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        email_confirm: true,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully! You can now sign in with your new password.',
    })
  } catch (error) {
    console.error('Reset Password API error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
