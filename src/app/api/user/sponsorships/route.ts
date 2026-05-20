import { NextRequest, NextResponse } from 'next/server'
import { sponsorshipsDb } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import { getUserFromRequest } from '@/lib/auth-helpers'

const sponsorshipSchema = z.object({
  organizationName: z.string().min(2, 'Organization name is required').max(200),
  sponsorshipType: z.enum(['Event', 'Educational', 'Technology', 'Community', 'Other']),
  message: z.string().max(5000).optional(),
})

// GET: List user's sponsorships
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    const sponsorships = await sponsorshipsDb.findByUserId(user!.id)
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

    const { organizationName, sponsorshipType, message } = validation.data

    const sponsorship = await sponsorshipsDb.create({
      user_id: user!.id,
      organization_name: organizationName,
      sponsorship_type: sponsorshipType,
      message: message || null,
      status: 'pending',
    })

    if (!sponsorship) {
      return NextResponse.json({ success: false, error: 'Failed to submit sponsorship request.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: sponsorship }, { status: 201 })
  } catch (err) {
    console.error('Sponsorships POST error:', err)
    return NextResponse.json({ success: false, error: 'Failed to submit sponsorship request.' }, { status: 500 })
  }
}
