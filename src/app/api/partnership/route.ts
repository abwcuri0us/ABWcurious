import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { randomUUID } from 'crypto'
import { validateCsrfRequest } from '@/lib/csrf'

/**
 * /api/partnership — Authenticated user partnership submissions.
 *
 * GET: Returns the authenticated user's own partnership requests (filtered by their email).
 * POST: Authenticated user submits a partnership request (CSRF-protected, user-scoped).
 *
 * NOTE: This is NOT a duplicate of /api/partnerships. The routes serve different purposes:
 * - /api/partnership: Authenticated user's own partnership submissions and viewing.
 * - /api/partnerships: Public submission form (no auth) + admin-only listing of all partnerships.
 */

const createPartnershipSchema = z.object({
  partnership_type: z.enum(['technology', 'education', 'business', 'other']),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  organization: z.string().max(200).optional(),
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

    const { data: partnerships, error } = await supabaseAdmin
      .from('partnerships')
      .select('*')
      .eq('email', user.email)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Partnership GET error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to fetch partnerships.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: partnerships })
  } catch (error) {
    console.error('Partnership GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch partnerships.' }, { status: 500 })
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
    const validationResult = createPartnershipSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { partnership_type, message, organization, phone } = validationResult.data

    const { data: partnership, error } = await supabaseAdmin
      .from('partnerships')
      .insert([{
        id: randomUUID(),
        user_id: user.id,
        name: user.name ?? user.email,
        email: user.email,
        phone: phone ?? null,
        organization: organization ?? null,
        partnership_type,
        message,
        status: 'pending',
      }])
      .select()
      .single()

    if (error) {
      console.error('Partnership POST error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to submit partnership request.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: partnership }, { status: 201 })
  } catch (error) {
    console.error('Partnership POST error:', error)
    return NextResponse.json({ success: false, error: 'Failed to submit partnership request.' }, { status: 500 })
  }
}
