import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, verifyAccess, getCurrentUser } from '@/lib/supabase'
import { generateSlug, notFoundResponse } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

const updateCareerSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  requirements: z.string().min(10).optional(),
  location: z.string().min(1).max(200).optional(),
  type: z.enum(['full-time', 'part-time', 'internship', 'contract']).optional(),
  department: z.string().max(100).optional(),
  salary_range: z.string().max(100).optional(),
  is_active: z.boolean().optional(),
})

// GET /api/careers/[slug] - Get a single career (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const rateResult = checkRateLimit(request, { limit: 60, windowMs: 60_000 })
    if (!rateResult.success) return rateLimitResponse()

    const { slug } = await params

    const { data: career, error } = await supabaseAdmin
      .from('careers')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error || !career) return notFoundResponse('Career')

    // If inactive, only admin can see it
    if (!career.is_active) {
      const user = await getCurrentUser(request)
      if (!user || !['admin', 'editor'].includes(user.role)) {
        return notFoundResponse('Career')
      }
    }

    return NextResponse.json({ success: true, data: career })
  } catch (error) {
    console.error('Career get error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch career' },
      { status: 500 }
    )
  }
}

// PATCH /api/careers/[slug] - Update a career (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const rateResult = checkRateLimit(request, { limit: 10, windowMs: 60_000 })
    if (!rateResult.success) return rateLimitResponse()

    const { authorized } = await verifyAccess(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Admin access required to update career postings' }, { status: 403 })
    }

    const { slug } = await params

    const { data: career, error: findError } = await supabaseAdmin
      .from('careers')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (findError || !career) return notFoundResponse('Career')

    const body = await request.json()
    const validation = updateCareerSchema.safeParse(body)
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

    const data: Record<string, unknown> = { ...validation.data }

    if (data.title && data.title !== career.title) {
      const newSlug = generateSlug(data.title as string)
      const { data: existingSlug } = await supabaseAdmin
        .from('careers')
        .select('id')
        .eq('slug', newSlug)
        .maybeSingle()

      if (existingSlug && existingSlug.id !== career.id) {
        return NextResponse.json(
          { success: false, error: 'A career posting with a similar title already exists' },
          { status: 409 }
        )
      }
      data.slug = newSlug
    }

    const { data: updatedCareer, error: updateError } = await supabaseAdmin
      .from('careers')
      .update(data)
      .eq('slug', slug)
      .select()
      .single()

    if (updateError) {
      console.error('Career update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update career' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: updatedCareer })
  } catch (error) {
    console.error('Career update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update career' },
      { status: 500 }
    )
  }
}

// DELETE /api/careers/[slug] - Delete a career (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const rateResult = checkRateLimit(request, { limit: 5, windowMs: 60_000 })
    if (!rateResult.success) return rateLimitResponse()

    const { authorized } = await verifyAccess(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Admin access required to delete career postings' }, { status: 403 })
    }

    const { slug } = await params

    const { data: career, error: findError } = await supabaseAdmin
      .from('careers')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (findError || !career) return notFoundResponse('Career')

    const { error: deleteError } = await supabaseAdmin
      .from('careers')
      .delete()
      .eq('slug', slug)

    if (deleteError) {
      console.error('Career delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete career' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Career posting deleted successfully',
    })
  } catch (error) {
    console.error('Career delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete career' },
      { status: 500 }
    )
  }
}
