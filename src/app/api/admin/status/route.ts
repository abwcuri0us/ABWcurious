import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyAdmin, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// GET: List all status updates
export async function GET(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const { data: statuses, error } = await supabaseAdmin
      .from('status_updates')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Supabase status fetch error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to fetch status.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: statuses })
  } catch (error) {
    console.error('Status list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch status.' }, { status: 500 })
  }
}

// POST: Create status update
export async function POST(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const body = await request.json()
    const schema = z.object({
      service: z.string().min(2).max(100),
      status: z.enum(['operational', 'degraded', 'outage', 'maintenance']),
      message: z.string().optional().nullable(),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validationResult.error.issues }, { status: 400 })
    }

    const { data: statusUpdate, error } = await supabaseAdmin
      .from('status_updates')
      .insert([validationResult.data])
      .select()
      .single()

    if (error) {
      console.error('Status create error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to create status update.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: statusUpdate }, { status: 201 })
  } catch (error) {
    console.error('Status create error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create status update.' }, { status: 500 })
  }
}

// PATCH: Update status
export async function PATCH(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const body = await request.json()
    const schema = z.object({
      id: z.string(),
      service: z.string().min(2).max(100).optional(),
      status: z.enum(['operational', 'degraded', 'outage', 'maintenance']).optional(),
      message: z.string().optional().nullable(),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed.', details: validationResult.error.issues }, { status: 400 })
    }

    const { id, ...updateData } = validationResult.data

    // Remove undefined fields so Supabase doesn't try to set them to null
    const cleanedData = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined)
    )

    const { data: statusUpdate, error } = await supabaseAdmin
      .from('status_updates')
      .update(cleanedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Status update error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to update status.' }, { status: 500 })
    }

    if (!statusUpdate) {
      return NextResponse.json({ success: false, error: 'Status update not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: statusUpdate })
  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update status.' }, { status: 500 })
  }
}
