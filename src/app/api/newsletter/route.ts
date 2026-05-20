import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { newsletterDb } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

// Zod schema for newsletter subscription
const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
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
    const existing = await newsletterDb.findByEmail(email)
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This email is already subscribed to our newsletter.' },
        { status: 409 }
      )
    }

    // Subscribe
    const subscription = await newsletterDb.create(email)
    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully subscribed to our newsletter!',
        data: { id: subscription.id },
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
