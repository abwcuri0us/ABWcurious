import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { randomUUID } from 'crypto'
import { validateCsrfRequest } from '@/lib/csrf'

/**
 * /api/sponsorship — Authenticated user sponsorship submissions.
 *
 * GET: Returns the authenticated user's own sponsorship requests (filtered by their email).
 * POST: Authenticated user submits a sponsorship request (CSRF-protected, user-scoped).
 *
 * NOTE: This is NOT a duplicate of /api/sponsorships. The routes serve different purposes:
 * - /api/sponsorship: Authenticated user's own sponsorship submissions and viewing.
 * - /api/sponsorships: Public submission (no auth) + admin-only listing/management.
 */

const createSponsorshipSchema = z.object({
  sponsorship_type: z.enum(['event', 'content', 'general']),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  organization: z.string().max(200).optional(),
  budget: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
})

export async function GET(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Service unavailable.' }, { status: 503 })
    }

    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const { data: sponsorships, error } = await supabaseAdmin
      .from('sponsorships')
      .select('*')
      .eq('email', user.email)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Sponsorship GET error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to fetch sponsorships.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: sponsorships })
  } catch (error) {
    console.error('Sponsorship GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch sponsorships.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfRequest(request)) {
      return NextResponse.json({ success: false, error: 'Invalid CSRF token' }, { status: 403 })
    }

    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Service unavailable.' }, { status: 503 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 5, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = createSponsorshipSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { sponsorship_type, message, organization, budget, phone } = validationResult.data

    const { data: sponsorship, error } = await supabaseAdmin
      .from('sponsorships')
      .insert([{
        id: randomUUID(),
        user_id: user.id,
        name: user.name ?? user.email,
        email: user.email,
        phone: phone ?? null,
        organization: organization ?? null,
        sponsorship_type,
        message,
        budget: budget ?? null,
        status: 'pending',
      }])
      .select()
      .single()

    if (error) {
      console.error('Sponsorship POST error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to submit sponsorship request.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: sponsorship }, { status: 201 })
  } catch (error) {
    console.error('Sponsorship POST error:', error)
    return NextResponse.json({ success: false, error: 'Failed to submit sponsorship request.' }, { status: 500 })
  }
}
