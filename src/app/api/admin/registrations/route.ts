import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyAdmin, isConfigured } from '@/lib/supabase'
import { z } from 'zod'

// GET: List all event registrations (admin only)
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
    const event_id = searchParams.get('event_id')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    let query = supabaseAdmin
      .from('event_registrations')
      .select('*, event:events(id, title, date, location, type), profile:profiles(id, name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && ['registered', 'attended', 'cancelled'].includes(status)) {
      query = query.eq('status', status)
    }

    if (event_id) {
      query = query.eq('event_id', event_id)
    }

    const { data: registrations, count, error } = await query

    if (error) {
      console.error('Admin registrations fetch error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to fetch registrations.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: registrations,
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Admin registrations list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch registrations.' }, { status: 500 })
  }
}

// PATCH: Update event registration status (admin only)
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
      id: z.string().uuid('Invalid registration ID'),
      status: z.enum(['registered', 'attended', 'cancelled']),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validationResult.error.issues }, { status: 400 })
    }

    const { id, status } = validationResult.data

    const { data: registration, error } = await supabaseAdmin
      .from('event_registrations')
      .update({ status })
      .eq('id', id)
      .select('*, event:events(id, title, date), profile:profiles(id, name, email)')
      .single()

    if (error) {
      console.error('Registration update error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to update registration.' }, { status: 500 })
    }

    if (!registration) {
      return NextResponse.json({ success: false, error: 'Registration not found.' }, { status: 404 })
    }

    // Create notification for the registrant
    const notifType = status === 'attended' ? 'success' : status === 'cancelled' ? 'warning' : 'info'
    const notifMessage = status === 'attended'
      ? `Your attendance for "${registration.event?.title || 'the event'}" has been confirmed.`
      : status === 'cancelled'
        ? `Your registration for "${registration.event?.title || 'the event'}" has been cancelled.`
        : `Your registration for "${registration.event?.title || 'the event'}" has been updated.`

    await supabaseAdmin
      .from('notifications')
      .insert([{
        user_id: registration.user_id,
        title: 'Event Registration Update',
        message: notifMessage,
        type: notifType,
        is_read: false,
      }])

    return NextResponse.json({ success: true, data: registration })
  } catch (error) {
    console.error('Registration update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update registration.' }, { status: 500 })
  }
}
