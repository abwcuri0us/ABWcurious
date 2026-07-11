import { NextRequest, NextResponse } from 'next/server'
import { eventsDb, eventRegistrationsDb, getUserFromToken, type EventRow } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// Helper to get user from request
async function getUserFromRequest(request: NextRequest) {
  const cookieToken = request.cookies.get('abwcurious_token')?.value
  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader?.replace('Bearer ', '')
  const accessToken = cookieToken || headerToken

  if (!accessToken) {
    return { user: null, error: NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 }) }
  }

  const user = await getUserFromToken(accessToken)
  if (!user) {
    return { user: null, error: NextResponse.json({ success: false, error: 'Invalid or expired token.' }, { status: 401 }) }
  }

  return { user, error: null }
}

// GET: List upcoming events + user's registrations
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    const [eventsResult, registrations] = await Promise.all([
      eventsDb.listActive(),
      eventRegistrationsDb.listByUser(user!.id),
    ])

    return NextResponse.json({ success: true, data: { events: eventsResult.events, registrations } })
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

    // Check event exists. Use listActive for active events, fallback to findById for any event.
    let event: EventRow | null = null
    const { events } = await eventsDb.listActive()
    event = (events.find((e: { id: string }) => e.id === eventId) as EventRow | undefined) ?? null
    if (!event) {
      // Fallback: check if event exists at all (admin-created events might not be "active" in the same way)
      event = await eventsDb.findById(eventId)
    }
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 })
    }

    // Registration is open unless explicitly disabled (registration_enabled === false)
    // Both undefined/null/true mean registration is allowed
    if (event.registration_enabled === false) {
      return NextResponse.json({ success: false, error: 'Registration is closed for this event.' }, { status: 400 })
    }

    // Check if already registered
    const existingRegs = await eventRegistrationsDb.listByUser(user!.id)
    if (existingRegs.some((r: { event_id: string }) => r.event_id === eventId)) {
      return NextResponse.json({ success: false, error: 'You are already registered for this event.' }, { status: 409 })
    }

    // Check capacity
    if (event.max_registrations) {
      const currentRegs = await eventRegistrationsDb.listByEvent(eventId)
      if (currentRegs.length >= event.max_registrations) {
        return NextResponse.json({ success: false, error: 'This event has reached its maximum capacity.' }, { status: 400 })
      }
    }

    const registration = await eventRegistrationsDb.create({
      event_id: eventId,
      user_id: user!.id,
      name: user!.name ?? user!.email.split('@')[0],
      email: user!.email,
    })

    if (!registration) {
      return NextResponse.json({ success: false, error: 'Failed to register for event.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: registration }, { status: 201 })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Failed to register for event.'
    console.error('Events POST error:', errMsg)
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 })
  }
}
