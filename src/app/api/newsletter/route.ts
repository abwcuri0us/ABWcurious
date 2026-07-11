import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { logActivity } from '@/lib/activity-logger'
import { validateCsrfRequest } from '@/lib/csrf'

// Zod schema for newsletter subscription
const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfRequest(request)) {
      return NextResponse.json({ success: false, error: 'Invalid CSRF token' }, { status: 403 })
    }

    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Service temporarily unavailable. Please try again later.' }, { status: 503 })
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    const rateLimitResult = rateLimit(ip, { limit: 5, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = newsletterSchema.safeParse(body)

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

    // Check if already subscribed
    const { data: existing } = await supabaseAdmin
      .from('newsletters')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This email is already subscribed to our newsletter.' },
        { status: 409 }
      )
    }

    // Insert into Supabase newsletter table
    const { data, error } = await supabaseAdmin
      .from('newsletters')
      .insert([{ email }])
      .select()
      .single()

    if (error) {
      // Unique constraint violation from Supabase
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'This email is already subscribed to our newsletter.' },
          { status: 409 }
        )
      }
      console.error('Supabase newsletter insert error:', error.message)
      return NextResponse.json(
        { success: false, error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      )
    }

    // Log newsletter subscription
    await logActivity('newsletter', 'newsletter_subscribed', `New subscriber: ${email}`, null, email, request)

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully subscribed to our newsletter!',
        data: { id: data?.id },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Newsletter API error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
