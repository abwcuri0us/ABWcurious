import { NextRequest, NextResponse } from 'next/server'
import { partnershipsDb, getUserFromToken } from '@/lib/supabase'
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

const partnershipSchema = z.object({
  company_name: z.string().min(2, 'Company name is required').max(200),
  contact_name: z.string().min(2, 'Contact name is required').max(200),
  phone: z.string().max(30).optional(),
  partnership_type: z.enum(['technology', 'strategic', 'academic', 'reseller', 'other']),
  message: z.string().max(5000),
})

// GET: List user's partnerships
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    const partnerships = await partnershipsDb.listByUser(user!.id)
    return NextResponse.json({ success: true, data: partnerships })
  } catch (err) {
    console.error('Partnerships GET error:', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch partnerships.' }, { status: 500 })
  }
}

// POST: Create partnership request
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
    const validation = partnershipSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validation.error.issues }, { status: 400 })
    }

    const { company_name, contact_name, phone, partnership_type, message } = validation.data

    const partnership = await partnershipsDb.create({
      user_id: user!.id,
      company_name,
      contact_name,
      email: user!.email,
      phone: phone || null,
      partnership_type,
      message,
      status: 'pending',
    })

    if (!partnership) {
      return NextResponse.json({ success: false, error: 'Failed to submit partnership request.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: partnership }, { status: 201 })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Failed to submit partnership request.'
    console.error('Partnerships POST error:', errMsg)
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 })
  }
}
