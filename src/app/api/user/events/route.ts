import { NextRequest, NextResponse } from 'next/server'
import { eventsDb, eventRegistrationsDb } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import { getUserFromRequest } from '@/lib/auth-helpers'

// GET: List upcoming events + user's registrations
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    const [events, registrations] = await Promise.all([
      eventsDb.list({ upcoming: true }),
      eventRegistrationsDb.findByUserId(user!.id),
    ])

    return NextResponse.json({ success: true, data: { events, registrations } })
  } catch (err) {
    console.error('Events GET error:', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch events.' }, { status: 500 })
  }
}

const registerSchema = z.object({
  eventId: z.string().min(1),
})

// POST: Register for an event
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown'
    const rl = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    const body = await request.json()
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validation.error.issues }, { status: 400 })
    }

    const { eventId } = validation.data

    // Check event exists and registration is open
    const events = await eventsDb.list({ upcoming: true })
    const event = events.find((e) => e.id === eventId)
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 })
    }

    if (!event.is_registration_open) {
      return NextResponse.json({ success: false, error: 'Registration is closed for this event.' }, { status: 400 })
    }

    // Check if already registered
    const existingRegs = await eventRegistrationsDb.findByUserId(user!.id)
    if (existingRegs.some((r) => r.event_id === eventId)) {
      return NextResponse.json({ success: false, error: 'You are already registered for this event.' }, { status: 409 })
    }

    // Check capacity
    if (event.max_registrations) {
      const currentRegs = await eventRegistrationsDb.findByEventId(eventId)
      if (currentRegs.length >= event.max_registrations) {
        return NextResponse.json({ success: false, error: 'This event has reached its maximum capacity.' }, { status: 400 })
      }
    }

    const registration = await eventRegistrationsDb.create({
      event_id: eventId,
      user_id: user!.id,
    })

    if (!registration) {
      return NextResponse.json({ success: false, error: 'Failed to register for event.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: registration }, { status: 201 })
  } catch (err) {
    console.error('Events POST error:', err)
    return NextResponse.json({ success: false, error: 'Failed to register for event.' }, { status: 500 })
  }
}
