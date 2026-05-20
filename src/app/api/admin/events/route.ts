import { NextRequest, NextResponse } from 'next/server'
import { eventsDb, verifyAccess } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// Helper to get access token from both Bearer header and cookie
function getAccessToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader?.replace('Bearer ', '')
  const cookieToken = request.cookies.get('abwcurious_token')?.value
  return headerToken || cookieToken || null
}

// GET: List all events
export async function GET(request: NextRequest) {
  try {
    const events = await eventsDb.list()
    return NextResponse.json({ success: true, data: events })
  } catch (error) {
    console.error('Events list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch events.' }, { status: 500 })
  }
}

// POST: Create event
export async function POST(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request)
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const { authorized } = await verifyAccess(accessToken, ['admin', 'editor'])
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
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
      title: z.string().min(3).max(200),
      description: z.string().optional(),
      date: z.string(),
      location: z.string().optional(),
      type: z.enum(['webinar', 'conference', 'workshop', 'meetup']).default('webinar'),
      registration_url: z.string().url().optional().or(z.literal('')),
      is_registration_open: z.boolean().default(true),
      max_registrations: z.number().int().positive().optional().nullable(),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validationResult.error.issues }, { status: 400 })
    }

    const d = validationResult.data
    const event = await eventsDb.create({
      title: d.title,
      description: d.description ?? null,
      date: d.date,
      location: d.location ?? null,
      type: d.type,
      registration_url: d.registration_url || null,
      is_registration_open: d.is_registration_open,
      max_registrations: d.max_registrations ?? null,
    })

    if (!event) {
      return NextResponse.json({ success: false, error: 'Failed to create event.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: event }, { status: 201 })
  } catch (error) {
    console.error('Event create error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create event.' }, { status: 500 })
  }
}

// PATCH: Update event
export async function PATCH(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request)
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const { authorized } = await verifyAccess(accessToken, ['admin', 'editor'])
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const body = await request.json()
    const schema = z.object({
      id: z.string(),
      title: z.string().min(3).max(200).optional(),
      description: z.string().optional(),
      date: z.string().optional(),
      location: z.string().optional(),
      type: z.enum(['webinar', 'conference', 'workshop', 'meetup']).optional(),
      registration_url: z.string().url().optional().or(z.literal('')),
      is_registration_open: z.boolean().optional(),
      max_registrations: z.number().int().positive().optional().nullable(),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed.' }, { status: 400 })
    }

    const { id, ...data } = validationResult.data
    const event = await eventsDb.update(id, data)
    if (!event) {
      return NextResponse.json({ success: false, error: 'Failed to update event.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: event })
  } catch (error) {
    console.error('Event update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update event.' }, { status: 500 })
  }
}

// DELETE: Remove event
export async function DELETE(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request)
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const { authorized } = await verifyAccess(accessToken, ['admin', 'editor'])
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'Event ID is required.' }, { status: 400 })

    const deleted = await eventsDb.delete(id)
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Failed to delete event.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Event deleted.' })
  } catch (error) {
    console.error('Event delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete event.' }, { status: 500 })
  }
}
