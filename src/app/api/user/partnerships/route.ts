import { NextRequest, NextResponse } from 'next/server'
import { partnershipsDb } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import { getUserFromRequest } from '@/lib/auth-helpers'

const partnershipSchema = z.object({
  organizationName: z.string().min(2, 'Organization name is required').max(200),
  partnershipType: z.enum(['Technology', 'Education', 'Business', 'Strategic', 'Other']),
  message: z.string().max(5000).optional(),
})

// GET: List user's partnerships
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    const partnerships = await partnershipsDb.findByUserId(user!.id)
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

    const { organizationName, partnershipType, message } = validation.data

    const partnership = await partnershipsDb.create({
      user_id: user!.id,
      organization_name: organizationName,
      partnership_type: partnershipType,
      message: message || null,
      status: 'pending',
    })

    if (!partnership) {
      return NextResponse.json({ success: false, error: 'Failed to submit partnership request.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: partnership }, { status: 201 })
  } catch (err) {
    console.error('Partnerships POST error:', err)
    return NextResponse.json({ success: false, error: 'Failed to submit partnership request.' }, { status: 500 })
  }
}
