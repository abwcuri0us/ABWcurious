import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { validateCsrfRequest } from '@/lib/csrf'

// Zod schema for sending OTP (email verification)
const sendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Zod schema for verifying OTP
const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().min(4, 'OTP must be at least 4 digits').max(10, 'OTP is too long'),
})

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_REQUESTS = 3;
const MAX_VERIFY_REQUESTS = 5;

/**
 * POST /api/auth/verify-email
 * Send a verification code to the given email address via Supabase's built-in email.
 */
export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfRequest(request)) {
      return NextResponse.json({ success: false, error: 'Invalid CSRF token' }, { status: 403 });
    }

    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Authentication service not configured.' }, { status: 503 });
    }

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
    const normalizedEmail = email.toLowerCase().trim()

    // Rate limit: 3 OTP requests per email per 10 minutes
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    const rateLimitResult = rateLimit(
      `otp-send:${ip}:${normalizedEmail}`,
      { limit: MAX_OTP_REQUESTS, windowMs: RATE_LIMIT_WINDOW_MS }
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many OTP requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Send OTP using Supabase's built-in email provider
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.abwcurious.com';

    const { error: otpError } = await supabaseAdmin.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${baseUrl}/api/auth/callback`,
      },
    });

    if (otpError) {
      console.error('Supabase OTP send error:', otpError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Verification code sent to your email address.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/auth/verify-email:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/verify-email
 * Verify the OTP for the given email address using Supabase's built-in verification.
 */
export async function PUT(request: NextRequest) {
  try {
    if (!validateCsrfRequest(request)) {
      return NextResponse.json({ success: false, error: 'Invalid CSRF token' }, { status: 403 });
    }

    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Authentication service not configured.' }, { status: 503 });
    }

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

    const { email, otp } = validationResult.data
    const normalizedEmail = email.toLowerCase().trim()

    // Rate limit: 5 verification attempts per 10 minutes
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    const rateLimitResult = rateLimit(
      `otp-verify:${ip}:${normalizedEmail}`,
      { limit: MAX_VERIFY_REQUESTS, windowMs: RATE_LIMIT_WINDOW_MS }
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many verification attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Verify OTP using Supabase's built-in verification
    const { data: verifyData, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
      email: normalizedEmail,
      token: otp,
      type: 'email',
    });

    if (verifyError) {
      const errorMessage = verifyError.message?.toLowerCase() || '';

      if (errorMessage.includes('expired')) {
        return NextResponse.json(
          { success: false, error: 'Verification code has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      if (errorMessage.includes('invalid') || errorMessage.includes('wrong')) {
        return NextResponse.json(
          { success: false, error: 'Invalid verification code. Please try again.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Verification failed. Please try again.' },
        { status: 400 }
      );
    }

    // Ensure email is confirmed
    const userId = verifyData.user?.id;
    if (userId && !verifyData.user?.email_confirmed_at) {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        email_confirm: true,
      });
    }

    return NextResponse.json(
      { success: true, message: 'Email verified successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/auth/verify-email:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}