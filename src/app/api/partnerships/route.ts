import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyAdmin, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

/**
 * /api/partnerships — Public partnership submissions + admin listing.
 *
 * POST: Public partnership application submission (no auth required, rate-limited).
 *   Accepts company name, contact info, partnership type, and message from anyone.
 *
 * GET: Admin-only listing of all partnership applications (with optional status filter).
 *
 * NOTE: This is NOT a duplicate of /api/partnership. The routes serve different purposes:
 * - /api/partnership: Authenticated user's own partnership submissions and viewing.
 * - /api/partnerships: Public submission (no auth) + admin-only management listing.
 */

// POST: Submit partnership application (public)
export async function POST(request: NextRequest) {
  try {
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
      partnership_type: z.enum(['technology', 'strategic', 'academic', 'reseller', 'other']).default('other'),
      message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validationResult.error.issues }, { status: 400 })
    }

    const insertData: Record<string, unknown> = {
      organization: validationResult.data.company_name,
      name: validationResult.data.contact_name,
      email: validationResult.data.email,
      partnership_type: validationResult.data.partnership_type,
      message: validationResult.data.message,
      status: 'pending',
    }

    if (validationResult.data.phone) {
      insertData.phone = validationResult.data.phone
    }

    const { data, error } = await supabaseAdmin
      .from('partnerships')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Partnership application error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to submit partnership application.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Partnership application submitted successfully. We will review it and get back to you.',
      data: { id: data?.id },
    }, { status: 201 })
  } catch (error) {
    console.error('Partnership application error:', error)
    return NextResponse.json({ success: false, error: 'Failed to submit partnership application.' }, { status: 500 })
  }
}

// GET: List all partnership applications (admin only)
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
      .from('partnerships')
      .select('*')
      .order('created_at', { ascending: false })

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('status', status)
    }

    const { data: partnerships, error } = await query

    if (error) {
      console.error('Partnerships fetch error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to fetch partnerships.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: partnerships })
  } catch (error) {
    console.error('Partnerships list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch partnerships.' }, { status: 500 })
  }
}
