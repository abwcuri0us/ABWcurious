import { NextRequest, NextResponse } from 'next/server'
import { sponsorshipsDb, getUserFromToken, usersDb } from '@/lib/supabase'
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

const sponsorshipSchema = z.object({
  company_name: z.string().min(2, 'Company name is required').max(200),
  contact_name: z.string().min(2, 'Contact name is required').max(200),
  phone: z.string().max(30).optional(),
  sponsorship_level: z.enum(['platinum', 'gold', 'silver', 'bronze']),
  event_name: z.string().max(200).optional(),
  message: z.string().max(5000),
})

// GET: List user's sponsorships
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    const sponsorships = await sponsorshipsDb.listByUser(user!.id)
    return NextResponse.json({ success: true, data: sponsorships })
  } catch (err) {
    console.error('Sponsorships GET error:', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch sponsorships.' }, { status: 500 })
  }
}

// POST: Create sponsorship request
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
    const validation = sponsorshipSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validation.error.issues }, { status: 400 })
    }

    const { company_name, contact_name, phone, sponsorship_level, event_name, message } = validation.data

    const sponsorship = await sponsorshipsDb.create({
      user_id: user!.id,
      company_name,
      contact_name,
      email: user!.email,
      phone: phone || null,
      sponsorship_level,
      event_name: event_name || null,
      message,
      status: 'pending',
    })

    if (!sponsorship) {
      return NextResponse.json({ success: false, error: 'Failed to submit sponsorship request.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: sponsorship }, { status: 201 })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Failed to submit sponsorship request.'
    console.error('Sponsorships POST error:', errMsg)
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 })
  }
}
