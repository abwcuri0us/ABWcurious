import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, verifyAccess } from '@/lib/supabase'
import { unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

const updatePartnershipSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  notes: z.string().max(5000).optional(),
  company_name: z.string().max(200).optional(),
  contact_name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  partnership_type: z.enum(['technology', 'strategic', 'academic', 'reseller', 'other']).optional(),
  message: z.string().min(10).max(5000).optional(),
})

// GET /api/partnerships/[id] - Get a single partnership (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateResult = checkRateLimit(request, { limit: 60, windowMs: 60_000 })
    if (!rateResult.success) return rateLimitResponse()

    const { authorized } = await verifyAccess(request)
    if (!authorized) return unauthorizedResponse()

    const { id } = await params
    const { data: partnership, error } = await supabaseAdmin
      .from('partnerships')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error || !partnership) return notFoundResponse('Partnership')

    return NextResponse.json({ success: true, data: partnership })
  } catch (error) {
    console.error('Partnership get error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partnership' },
      { status: 500 }
    )
  }
}

// PATCH /api/partnerships/[id] - Update a partnership (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateResult = checkRateLimit(request, { limit: 10, windowMs: 60_000 })
    if (!rateResult.success) return rateLimitResponse()

    const { authorized } = await verifyAccess(request)
    if (!authorized) return unauthorizedResponse()

    const { id } = await params
    const { data: existing, error: findError } = await supabaseAdmin
      .from('partnerships')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (findError || !existing) return notFoundResponse('Partnership')

    const body = await request.json()
    const validation = updatePartnershipSchema.safeParse(body)
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

    const { data: updatedPartnership, error: updateError } = await supabaseAdmin
      .from('partnerships')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Partnership update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update partnership' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: updatedPartnership })
  } catch (error) {
    console.error('Partnership update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update partnership' },
      { status: 500 }
    )
  }
}

// DELETE /api/partnerships/[id] - Delete a partnership (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateResult = checkRateLimit(request, { limit: 5, windowMs: 60_000 })
    if (!rateResult.success) return rateLimitResponse()

    const { authorized } = await verifyAccess(request)
    if (!authorized) return unauthorizedResponse()

    const { id } = await params
    const { data: partnership, error: findError } = await supabaseAdmin
      .from('partnerships')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (findError || !partnership) return notFoundResponse('Partnership')

    const { error: deleteError } = await supabaseAdmin
      .from('partnerships')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Partnership delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete partnership' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Partnership deleted successfully',
    })
  } catch (error) {
    console.error('Partnership delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete partnership' },
      { status: 500 }
    )
  }
}
