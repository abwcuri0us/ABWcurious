import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyAdmin, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import { validateCsrfRequest } from '@/lib/csrf'

/**
 * /api/sponsorships — Public sponsorship submissions + admin management.
 *
 * POST: Public sponsorship application submission (no auth required, CSRF-protected, rate-limited).
 *   Accepts company name, contact info, sponsorship level, and message from anyone.
 *
 * GET: Admin-only listing of all sponsorship applications (with optional status filter).
 * PATCH: Admin-only status update (approve/reject).
 *
 * NOTE: This is NOT a duplicate of /api/sponsorship. The routes serve different purposes:
 * - /api/sponsorship: Authenticated user's own sponsorship submissions and viewing.
 * - /api/sponsorships: Public submission (no auth) + admin-only listing/management.
 */

// POST: Submit sponsorship application (public)
export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfRequest(request)) {
      return NextResponse.json({ success: false, error: 'Invalid CSRF token' }, { status: 403 })
    }

    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Service temporarily unavailable. Please try again later.' }, { status: 503 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 3, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const body = await request.json()
    const schema = z.object({
      company_name: z.string().min(2, 'Company name must be at least 2 characters').max(200),
      contact_name: z.string().min(2, 'Contact name must be at least 2 characters').max(200),
      email: z.string().email('Invalid email address'),
      phone: z.string().optional().refine(
        (val) => !val || /^[\+]?[\d\s\-\(\)]{7,20}$/.test(val),
        'Invalid phone number format'
      ),
      sponsorship_level: z.enum(['platinum', 'gold', 'silver', 'bronze']).default('bronze'),
      event_name: z.string().max(200).optional().nullable(),
      message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validationResult.error.issues }, { status: 400 })
    }

    const insertData: Record<string, unknown> = {
      company_name: validationResult.data.company_name,
      contact_name: validationResult.data.contact_name,
      name: validationResult.data.contact_name,
      email: validationResult.data.email,
      sponsorship_level: validationResult.data.sponsorship_level,
      message: validationResult.data.message,
      status: 'pending',
    }

    if (validationResult.data.phone) {
      insertData.phone = validationResult.data.phone
    }
    if (validationResult.data.event_name) {
      insertData.event_name = validationResult.data.event_name
    }

    const { data, error } = await supabaseAdmin
      .from('sponsorships')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Sponsorship application error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to submit sponsorship application.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Sponsorship application submitted successfully. We will review it and get back to you.',
      data: { id: data?.id },
    }, { status: 201 })
  } catch (error) {
    console.error('Sponsorship application error:', error)
    return NextResponse.json({ success: false, error: 'Failed to submit sponsorship application.' }, { status: 500 })
  }
}

// GET: List all sponsorship applications (admin only)
export async function GET(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabaseAdmin
      .from('sponsorships')
      .select('*')
      .order('created_at', { ascending: false })

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('status', status)
    }

    const { data: sponsorships, error } = await query

    if (error) {
      console.error('Sponsorships fetch error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to fetch sponsorships.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: sponsorships })
  } catch (error) {
    console.error('Sponsorships list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch sponsorships.' }, { status: 500 })
  }
}

// PATCH: Update sponsorship status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const body = await request.json()
    const schema = z.object({
      id: z.string().uuid('Invalid sponsorship ID'),
      status: z.enum(['approved', 'rejected']),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validationResult.error.issues }, { status: 400 })
    }

    const { id, status } = validationResult.data

    const { data: sponsorship, error } = await supabaseAdmin
      .from('sponsorships')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Sponsorship update error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to update sponsorship.' }, { status: 500 })
    }

    if (!sponsorship) {
      return NextResponse.json({ success: false, error: 'Sponsorship application not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: sponsorship })
  } catch (error) {
    console.error('Sponsorship update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update sponsorship.' }, { status: 500 })
  }
}
