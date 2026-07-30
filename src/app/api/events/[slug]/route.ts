import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { generateSlug, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { randomUUID } from 'crypto'

const updateEventSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(1000).optional(),
  content: z.string().min(10).optional(),
  coverImage: z.string().url().optional().or(z.literal('')).optional(),
  eventType: z.enum(['webinar', 'workshop', 'conference', 'meetup']).optional(),
  location: z.string().max(200).optional(),
  eventDate: z.string().optional(),
  endDate: z.string().optional(),
  registrationUrl: z.string().url().optional().or(z.literal('')).optional(),
  isPublished: z.boolean().optional(),
})

// GET /api/events/[slug] - Get a single event (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 60, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const { slug } = await params

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error || !event) return notFoundResponse('Event')

    // If not published (is_active), only admin/editor can see it
    if (!event.is_active) {
      const user = await getCurrentUser(request)
      if (!user || !['admin', 'editor', 'author'].includes(user.role)) {
        return notFoundResponse('Event')
      }
    }

    return NextResponse.json({ success: true, data: event })
  } catch (error) {
    console.error('Event get error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

// PATCH /api/events/[slug] - Update an event (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 10, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to update events')

    const { slug } = await params

    const { data: event, error: findError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (findError || !event) return notFoundResponse('Event')

    const body = await request.json()
    const validation = updateEventSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}

    if (validation.data.title !== undefined) updateData.title = validation.data.title
    if (validation.data.description !== undefined) updateData.description = validation.data.description
    if (validation.data.coverImage !== undefined) updateData.cover_image = validation.data.coverImage || null
    if (validation.data.eventType !== undefined) updateData.type = validation.data.eventType
    if (validation.data.location !== undefined) updateData.location = validation.data.location
    if (validation.data.eventDate !== undefined) updateData.date = validation.data.eventDate
    if (validation.data.endDate !== undefined) updateData.end_date = validation.data.endDate
    if (validation.data.registrationUrl !== undefined) updateData.registration_url = validation.data.registrationUrl || null
    if (validation.data.isPublished !== undefined) updateData.is_active = validation.data.isPublished

    if (validation.data.title && validation.data.title !== event.title) {
      const newSlug = generateSlug(validation.data.title)
      const { data: existingSlug } = await supabaseAdmin
        .from('events')
        .select('id')
        .eq('slug', newSlug)
        .maybeSingle()

      if (existingSlug && existingSlug.id !== event.id) {
        return NextResponse.json(
          { success: false, error: 'An event with a similar title already exists' },
          { status: 409 }
        )
      }
      updateData.slug = newSlug
    }

    const { data: updatedEvent, error: updateError } = await supabaseAdmin
      .from('events')
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single()

    if (updateError) {
      console.error('Event update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: updatedEvent })
  } catch (error) {
    console.error('Event update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[slug] - Delete an event (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 5, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to delete events')

    const { slug } = await params

    const { data: event, error: findError } = await supabaseAdmin
      .from('events')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (findError || !event) return notFoundResponse('Event')

    const { error: deleteError } = await supabaseAdmin
      .from('events')
      .delete()
      .eq('slug', slug)

    if (deleteError) {
      console.error('Event delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete event' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    })
  } catch (error) {
    console.error('Event delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
