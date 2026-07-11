import { NextRequest, NextResponse } from 'next/server'
import { feedbacksDb, getUserFromToken } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// Helper to get user from request
async function getUserFromRequest(request: NextRequest) {
  const cookieToken = request.cookies.get('abwcurious_token')?.value
  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader?.replace('Bearer ', '')
  const accessToken = cookieToken || headerToken

  if (!accessToken) {
    return { user: null, error: NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 }) }
  }

  const user = await getUserFromToken(accessToken)
  if (!user) {
    return { user: null, error: NextResponse.json({ success: false, error: 'Invalid or expired token.' }, { status: 401 }) }
  }

  return { user, error: null }
}

const feedbackSchema = z.object({
  subject: z.string().min(3, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  rating: z.number().min(1).max(5),
})

// GET: List user's feedbacks
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    const feedbacks = await feedbacksDb.listByUser(user!.id)
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

    const { subject, message, rating } = validation.data

    const feedback = await feedbacksDb.create({
      user_id: user!.id,
      name: user!.name || user!.email,
      email: user!.email,
      subject,
      message,
      // `comment` and `rating` columns are NOT NULL in the DB schema; mirror
      // the message into `comment` and persist the user-supplied rating.
      comment: message,
      type: 'feedback',
      rating,
      status: 'open',
    })

    if (!feedback) {
      return NextResponse.json({ success: false, error: 'Failed to submit feedback.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: feedback }, { status: 201 })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Failed to submit feedback.'
    console.error('Feedbacks POST error:', errMsg)
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 })
  }
}
