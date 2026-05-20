import { NextRequest, NextResponse } from 'next/server'
import { feedbacksDb } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import { getUserFromRequest } from '@/lib/auth-helpers'

const feedbackSchema = z.object({
  type: z.enum(['Feedback', 'Problem', 'Solution', 'Complaint']),
  subject: z.string().min(3, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
})

// GET: List user's feedbacks
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    const feedbacks = await feedbacksDb.findByUserId(user!.id)
    return NextResponse.json({ success: true, data: feedbacks })
  } catch (err) {
    console.error('Feedbacks GET error:', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch feedbacks.' }, { status: 500 })
  }
}

// POST: Create feedback
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown'
    const rl = rateLimit(ip, { limit: 5, windowMs: 60_000 })
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    const body = await request.json()
    const validation = feedbackSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validation.error.issues }, { status: 400 })
    }

    const { type, subject, message } = validation.data

    const feedback = await feedbacksDb.create({
      user_id: user!.id,
      type,
      subject,
      message,
      status: 'open',
    })

    if (!feedback) {
      return NextResponse.json({ success: false, error: 'Failed to submit feedback.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: feedback }, { status: 201 })
  } catch (err) {
    console.error('Feedbacks POST error:', err)
    return NextResponse.json({ success: false, error: 'Failed to submit feedback.' }, { status: 500 })
  }
}
