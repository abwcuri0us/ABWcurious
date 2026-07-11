import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, isConfigured } from '@/lib/supabase'
import { usersDb, getUserFromToken } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizePostgrestFilter } from '@/lib/sanitize'

// POST: Send OTP to new email for verification
const sendOtpSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Authentication service not configured.' }, { status: 503 })
    }

    const cookieToken = request.cookies.get('abwcurious_token')?.value
    const authHeader = request.headers.get('authorization')
    const headerToken = authHeader?.replace('Bearer ', '')
    const token = cookieToken || headerToken

    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown'
    const rl = rateLimit(`change-email-send:${ip}`, { limit: 3, windowMs: 60_000 })
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const body = await request.json()
    const validation = sendOtpSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validation.error.issues }, { status: 400 })
    }

    const { newEmail } = validation.data

    // Check if new email is same as current
    if (newEmail.toLowerCase() === user.email?.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'New email must be different from your current email.' }, { status: 400 })
    }

    // Check if new email is already taken
    const { data } = await supabaseAdmin.auth.admin.listUsers({
      filter: `email eq "${sanitizePostgrestFilter(newEmail.toLowerCase())}"`,
    } as Parameters<typeof supabaseAdmin.auth.admin.listUsers>[0])
    const existingUser = data?.users?.[0]
    if (existingUser && existingUser.id !== user.id) {
      return NextResponse.json({ success: false, error: 'This email is already associated with another account.' }, { status: 409 })
    }

    // Send OTP to the new email using Supabase
    // We use signInWithOtp to trigger the Supabase email template
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.abwcurious.com'

    const { error: otpError } = await supabaseAdmin.auth.signInWithOtp({
      email: newEmail,
      options: {
        emailRedirectTo: `${baseUrl}/api/auth/callback`,
      },
    })

    if (otpError) {
      console.error('[Change Email] OTP send error:', otpError.message)
      return NextResponse.json({ success: false, error: 'Failed to send verification code. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'A 6-digit verification code has been sent to your new email.',
      data: { newEmail },
    })
  } catch (error) {
    console.error('Change email send error:', error)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 })
  }
}

// PUT: Verify OTP and update email
const verifyOtpSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
})

export async function PUT(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Authentication service not configured.' }, { status: 503 })
    }

    const cookieToken = request.cookies.get('abwcurious_token')?.value
    const authHeader = request.headers.get('authorization')
    const headerToken = authHeader?.replace('Bearer ', '')
    const token = cookieToken || headerToken

    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown'
    const rl = rateLimit(`change-email-verify:${ip}`, { limit: 5, windowMs: 60_000 })
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'Too many verification attempts. Please try again later.' }, { status: 429 })
    }

    const body = await request.json()
    const validation = verifyOtpSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validation.error.issues }, { status: 400 })
    }

    const { newEmail, otp } = validation.data

    // Verify OTP using Supabase
    const { data: verifyData, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
      email: newEmail,
      token: otp,
      type: 'email',
    })

    if (verifyError) {
      const msg = verifyError.message?.toLowerCase() || ''
      if (msg.includes('expired')) {
        return NextResponse.json({ success: false, error: 'Verification code has expired. Please request a new one.' }, { status: 401 })
      }
      if (msg.includes('invalid') || msg.includes('wrong')) {
        return NextResponse.json({ success: false, error: 'Invalid verification code. Please try again.' }, { status: 401 })
      }
      return NextResponse.json({ success: false, error: 'Verification failed. Please try again.' }, { status: 401 })
    }

    // Update the user's email in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email: newEmail,
      email_confirm: true,
    })

    if (updateError) {
      console.error('[Change Email] Supabase update error:', updateError.message)
      return NextResponse.json({ success: false, error: 'Failed to update email. Please try again.' }, { status: 500 })
    }

    // Update email in profiles table
    await usersDb.update(user.id, { email: newEmail })

    // Build response with updated user cookie
    const response = NextResponse.json({
      success: true,
      message: 'Email updated successfully!',
      data: {
        newEmail,
        user: {
          id: user.id,
          email: newEmail,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
        },
      },
    })

    // Update the readable user cookie
    const userData = {
      id: user.id,
      email: newEmail,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
    }
    response.cookies.set('abwcurious_user', JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error('Change email verify error:', error)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
