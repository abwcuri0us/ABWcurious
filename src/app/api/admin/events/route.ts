import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyAdmin, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// GET: List all events
export async function GET(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      console.error('Supabase events fetch error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to fetch events.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: events })
  } catch (error) {
    console.error('Events list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch events.' }, { status: 500 })
  }
}

// POST: Create event
export async function POST(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
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
      end_date: z.string().optional(),
      location: z.string().optional(),
      type: z.enum(['webinar', 'conference', 'workshop', 'meetup', 'training']).default('webinar'),
      registration_url: z.string().url().optional().or(z.literal('')),
      cover_image: z.string().url().optional().or(z.literal('')),
      max_registrations: z.number().int().positive().optional().nullable(),
      registration_enabled: z.boolean().default(true),
      category: z.string().optional().default('webinar'),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validationResult.error.issues }, { status: 400 })
    }

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .insert([{
        ...validationResult.data,
        is_published: true,
      }])
      .select()
      .single()

    if (error) {
      console.error('Event create error:', error.message)
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
      title: z.string().min(3).max(200).optional(),
      description: z.string().optional(),
      date: z.string().optional(),
      end_date: z.string().optional().nullable(),
      location: z.string().optional().nullable(),
      type: z.enum(['webinar', 'conference', 'workshop', 'meetup', 'training']).optional(),
      registration_url: z.string().url().optional().or(z.literal('')).nullable(),
      cover_image: z.string().url().optional().or(z.literal('')).nullable(),
      max_registrations: z.number().int().positive().optional().nullable(),
      registration_enabled: z.boolean().optional(),
      is_published: z.boolean().optional(),
      category: z.string().optional(),
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

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .update(cleanedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Event update error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to update event.' }, { status: 500 })
    }

    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 })
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
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'Event ID is required.' }, { status: 400 })

    const { error } = await supabaseAdmin
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Event delete error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to delete event.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Event deleted.' })
  } catch (error) {
    console.error('Event delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete event.' }, { status: 500 })
  }
}
