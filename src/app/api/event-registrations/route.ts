import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { randomUUID } from 'crypto'
import { z } from 'zod'

/**
 * /api/event-registrations — Admin & management route for event registrations.
 *
 * This is NOT a duplicate of /api/events/register. The routes serve different purposes:
 * - /api/events/register: Canonical user-facing registration (CSRF-protected, UUID-validated,
 *   supports re-registration). That is the primary endpoint for frontend registration forms.
 * - /api/event-registrations: Admin/editor management route providing GET (with filtering
 *   by userId/eventId, admin can see all), POST (alternative registration without CSRF),
 *   PATCH (admin updates registration status), and DELETE (cancel registration).
 */

// ── Auth helper ──────────────────────────────────────────────────────────────
async function verifyAuth(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return { authorized: false }
  return { authorized: true, user }
}

// ── GET: List registrations ─────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authorized || !authResult.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filterUserId = searchParams.get('userId')
    const filterEventId = searchParams.get('eventId')

    const isAdminOrEditor = ['admin', 'editor'].includes(authResult.user.role)

    // Build query
    let query = supabaseAdmin
      .from('event_registrations')
      .select('*, profile:profiles(id, name, email, avatar), event:events(id, title, date, location, type)')
      .order('created_at', { ascending: false })

    // Non-admin users can only see their own registrations
    if (!isAdminOrEditor) {
      query = query.eq('user_id', authResult.user.id)
    } else if (filterUserId) {
      query = query.eq('user_id', filterUserId)
    }

    if (filterEventId) {
      query = query.eq('event_id', filterEventId)
    }

    const { data: registrations, error } = await query

    if (error) {
      console.error('Event registrations list error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch registrations.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: registrations })
  } catch (error) {
    console.error('Event registrations list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch registrations.' }, { status: 500 })
  }
}

// ── POST: Register for an event ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authorized || !authResult.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 })
    }

    // Rate limit: 5/min
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 5, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const body = await request.json()
    const schema = z.object({
      eventId: z.string().min(1, 'Event ID is required.'),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed.', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { eventId } = validationResult.data

    // Check event exists and is active
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', eventId)
      .maybeSingle()

    if (eventError || !event) {
      return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 })
    }
    if (!event.is_active) {
      return NextResponse.json({ success: false, error: 'Event is not active.' }, { status: 400 })
    }

    // Check capacity
    if (event.max_registrations !== null && event.max_registrations !== undefined) {
      const { count, error: countError } = await supabaseAdmin
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .neq('status', 'cancelled')

      if (!countError && count !== null && count >= event.max_registrations) {
        return NextResponse.json({ success: false, error: 'Event has reached its capacity.' }, { status: 400 })
      }
    }

    // Check user hasn't already registered
    const { data: existing } = await supabaseAdmin
      .from('event_registrations')
      .select('id')
      .eq('user_id', authResult.user.id)
      .eq('event_id', eventId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You are already registered for this event.' },
        { status: 409 }
      )
    }

    const { data: registration, error: regError } = await supabaseAdmin
      .from('event_registrations')
      .insert([{
        id: randomUUID(),
        user_id: authResult.user.id,
        event_id: eventId,
        status: 'registered',
      }])
      .select('*, profile:profiles(id, name, email, avatar), event:events(id, title, date, location, type)')
      .single()

    if (regError) {
      console.error('Event registration create error:', regError)
      return NextResponse.json({ success: false, error: 'Failed to register for event.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: registration }, { status: 201 })
  } catch (error) {
    console.error('Event registration create error:', error)
    return NextResponse.json({ success: false, error: 'Failed to register for event.' }, { status: 500 })
  }
}

// ── PATCH: Update registration status (admin/editor only) ───────────────────
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authorized || !authResult.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 })
    }

    if (!['admin', 'editor'].includes(authResult.user.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin or editor access required.' }, { status: 403 })
    }

    const body = await request.json()
    const schema = z.object({
      id: z.string().min(1, 'Registration ID is required.'),
      status: z.enum(['registered', 'attended', 'cancelled'], { message: 'Status is required.' }),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed.', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { id, status } = validationResult.data

    // Verify registration exists
    const { data: existing } = await supabaseAdmin
      .from('event_registrations')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Registration not found.' }, { status: 404 })
    }

    const { data: registration, error: updateError } = await supabaseAdmin
      .from('event_registrations')
      .update({ status })
      .eq('id', id)
      .select('*, profile:profiles(id, name, email, avatar), event:events(id, title, date, location, type)')
      .single()

    if (updateError) {
      console.error('Event registration update error:', updateError)
      return NextResponse.json({ success: false, error: 'Failed to update registration.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: registration })
  } catch (error) {
    console.error('Event registration update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update registration.' }, { status: 500 })
  }
}

// ── DELETE: Cancel registration ──────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authorized || !authResult.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'Registration ID is required.' }, { status: 400 })
    }

    // Verify registration exists
    const { data: registration, error: findError } = await supabaseAdmin
      .from('event_registrations')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (findError || !registration) {
      return NextResponse.json({ success: false, error: 'Registration not found.' }, { status: 404 })
    }

    // Non-admin users can only cancel their own registrations
    const isAdminOrEditor = ['admin', 'editor'].includes(authResult.user.role)
    if (!isAdminOrEditor && registration.user_id !== authResult.user.id) {
      return NextResponse.json({ success: false, error: 'You can only cancel your own registration.' }, { status: 403 })
    }

    // Update status to cancelled instead of deleting the record
    const { error: updateError } = await supabaseAdmin
      .from('event_registrations')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (updateError) {
      console.error('Event registration cancel error:', updateError)
      return NextResponse.json({ success: false, error: 'Failed to cancel registration.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Registration cancelled.' })
  } catch (error) {
    console.error('Event registration cancel error:', error)
    return NextResponse.json({ success: false, error: 'Failed to cancel registration.' }, { status: 500 })
  }
}
