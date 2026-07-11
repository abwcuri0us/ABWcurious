import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { randomUUID } from 'crypto'
import { logActivity } from '@/lib/activity-logger'
import { validateCsrfRequest } from '@/lib/csrf'

/**
 * /api/feedback — Authenticated user feedback management (canonical write endpoint).
 *
 * POST: Authenticated user submits feedback (CSRF-protected, rate-limited, activity-logged).
 * GET: Returns the authenticated user's own submitted feedback.
 *
 * NOTE: /api/feedbacks is a separate PUBLIC endpoint that returns approved/rated
 * feedback as testimonials — it does NOT accept submissions.
 */

const createFeedbackSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  rating: z.number().min(1).max(5).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    // List feedback by user_id
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Feedback list error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch feedback.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Feedback GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch feedback.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfRequest(request)) {
      return NextResponse.json({ success: false, error: 'Invalid CSRF token' }, { status: 403 })
    }

    const ip = getClientIp(request)
    const rateLimitResult = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = createFeedbackSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { subject, message, rating } = validationResult.data

    const { data: feedback, error } = await supabaseAdmin
      .from('feedback')
      .insert([{
        id: randomUUID(),
        user_id: user.id,
        name: user.name ?? user.email,
        email: user.email,
        subject,
        message,
        // Mirror message into comment (column has NOT NULL constraint in production DB)
        comment: message,
        type: 'feedback',
        rating: rating ?? null,
        status: 'open',
      }])
      .select()
      .single()

    if (error) {
      console.error('Feedback POST error:', error)
      return NextResponse.json({ success: false, error: 'Failed to submit feedback.' }, { status: 500 })
    }

    // Log feedback submission
    await logActivity('feedback', 'feedback_submitted', `Feedback from ${user.name ?? user.email}: ${subject} (rating: ${rating ?? 'N/A'})`, user.id, user.email, request)

    return NextResponse.json({ success: true, data: feedback }, { status: 201 })
  } catch (error) {
    console.error('Feedback POST error:', error)
    return NextResponse.json({ success: false, error: 'Failed to submit feedback.' }, { status: 500 })
  }
}
