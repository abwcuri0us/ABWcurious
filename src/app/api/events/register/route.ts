import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getCurrentUser, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import { validateCsrfRequest } from '@/lib/csrf'

/**
 * /api/events/register — Canonical user-facing event registration endpoint.
 *
 * POST: Authenticated user registers for an event (CSRF-protected).
 *   - Validates event_id as UUID, checks event existence/active status/capacity.
 *   - Supports re-registration after cancellation.
 *
 * GET: Returns the authenticated user's own event registrations.
 *
 * NOTE: /api/event-registrations is a separate admin-management route that provides
 * GET (admin-filtered listing), POST (alternative registration), PATCH (status update),
 * and DELETE (cancel) — it is NOT a duplicate of this endpoint.
 */

// POST: Register for an event (authenticated users)
export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfRequest(request)) {
      return NextResponse.json({ success: false, error: 'Invalid CSRF token' }, { status: 403 })
    }

    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Service temporarily unavailable. Please try again later.' }, { status: 503 })
    }

    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 5, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const body = await request.json()
    const schema = z.object({
      event_id: z.string().uuid('Invalid event ID'),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validationResult.error.issues }, { status: 400 })
    }

    const { event_id } = validationResult.data

    // Verify event exists and is active
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, title, max_registrations, is_active')
      .eq('id', event_id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 })
    }

    if (!event.is_active) {
      return NextResponse.json({ success: false, error: 'Event is not available for registration.' }, { status: 400 })
    }

    // Check capacity if set
    if (event.max_registrations !== null) {
      const { count, error: countError } = await supabaseAdmin
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event_id)
        .neq('status', 'cancelled')

      if (countError) {
        console.error('Event registration count error:', countError.message)
        return NextResponse.json({ success: false, error: 'Failed to check event capacity.' }, { status: 500 })
      }

      if (count !== null && count >= event.max_registrations) {
        return NextResponse.json({ success: false, error: 'Event has reached maximum capacity.' }, { status: 400 })
      }
    }

    // Check if already registered
    const { data: existing } = await supabaseAdmin
      .from('event_registrations')
      .select('id, status')
      .eq('event_id', event_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      if (existing.status === 'cancelled') {
        // Re-register if previously cancelled
        const { data: registration, error: updateError } = await supabaseAdmin
          .from('event_registrations')
          .update({ status: 'registered' })
          .eq('id', existing.id)
          .select()
          .single()

        if (updateError) {
          console.error('Event re-registration error:', updateError.message)
          return NextResponse.json({ success: false, error: 'Failed to re-register for event.' }, { status: 500 })
        }

        return NextResponse.json({ success: true, data: registration, message: 'Successfully re-registered for event.' })
      }
      return NextResponse.json({ success: false, error: 'You are already registered for this event.' }, { status: 409 })
    }

    // Create registration
    const { data: registration, error } = await supabaseAdmin
      .from('event_registrations')
      .insert([{
        event_id,
        user_id: user.id,
        name: user.name ?? user.email.split('@')[0],
        email: user.email,
        status: 'registered',
      }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: 'You are already registered for this event.' }, { status: 409 })
      }
      console.error('Event registration error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to register for event.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: registration, message: 'Successfully registered for event.' }, { status: 201 })
  } catch (error) {
    console.error('Event registration error:', error)
    return NextResponse.json({ success: false, error: 'Failed to register for event.' }, { status: 500 })
  }
}

// GET: Get user's event registrations
export async function GET(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: true, data: [] })
    }

    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const { data: registrations, error } = await supabaseAdmin
      .from('event_registrations')
      .select('*, event:events(id, title, date, location, type)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('User registrations fetch error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to fetch registrations.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: registrations })
  } catch (error) {
    console.error('User registrations error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch registrations.' }, { status: 500 })
  }
}
