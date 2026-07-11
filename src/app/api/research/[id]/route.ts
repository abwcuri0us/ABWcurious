import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/auth'

const updateResearchSchema = z.object({
  status: z.enum(['new', 'in_review', 'accepted', 'rejected', 'completed']).optional(),
  notes: z.string().max(5000).optional(),
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  organization: z.string().max(200).optional(),
  researchTopic: z.string().min(3).max(300).optional(),
  description: z.string().min(10).max(5000).optional(),
  collaborationType: z.enum(['Joint Research', 'Consultancy', 'Whitepaper', 'Other']).optional(),
})

// GET /api/research/[id] - Get a single research inquiry (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateResult = checkRateLimit(request, { limit: 60, windowMs: 60_000 })
    if (!rateResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to view research inquiries')

    const { id } = await params
    const { data: inquiry, error } = await supabaseAdmin
      .from('research_inquiries')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error || !inquiry) return notFoundResponse('Research inquiry')

    return NextResponse.json({ success: true, data: inquiry })
  } catch (error) {
    console.error('Research inquiry get error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch research inquiry' },
      { status: 500 }
    )
  }
}

// PATCH /api/research/[id] - Update a research inquiry (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateResult = checkRateLimit(request, { limit: 10, windowMs: 60_000 })
    if (!rateResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to update research inquiries')

    const { id } = await params
    const { data: existing, error: findError } = await supabaseAdmin
      .from('research_inquiries')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (findError || !existing) return notFoundResponse('Research inquiry')

    const body = await request.json()
    const validation = updateResearchSchema.safeParse(body)
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

    // Map camelCase to snake_case for Supabase
    const updateData: Record<string, unknown> = {}
    if (validation.data.status !== undefined) updateData.status = validation.data.status
    if (validation.data.notes !== undefined) updateData.notes = validation.data.notes
    if (validation.data.name !== undefined) updateData.name = validation.data.name
    if (validation.data.email !== undefined) updateData.email = validation.data.email
    if (validation.data.organization !== undefined) updateData.organization = validation.data.organization
    if (validation.data.researchTopic !== undefined) updateData.research_topic = validation.data.researchTopic
    if (validation.data.description !== undefined) updateData.description = validation.data.description
    if (validation.data.collaborationType !== undefined) updateData.collaboration_type = validation.data.collaborationType

    const { data: updatedInquiry, error: updateError } = await supabaseAdmin
      .from('research_inquiries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Research inquiry update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update research inquiry' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: updatedInquiry })
  } catch (error) {
    console.error('Research inquiry update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update research inquiry' },
      { status: 500 }
    )
  }
}

// DELETE /api/research/[id] - Delete a research inquiry (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateResult = checkRateLimit(request, { limit: 5, windowMs: 60_000 })
    if (!rateResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to delete research inquiries')

    const { id } = await params
    const { data: existing, error: findError } = await supabaseAdmin
      .from('research_inquiries')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (findError || !existing) return notFoundResponse('Research inquiry')

    const { error: deleteError } = await supabaseAdmin
      .from('research_inquiries')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Research inquiry delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete research inquiry' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Research inquiry deleted successfully',
    })
  } catch (error) {
    console.error('Research inquiry delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete research inquiry' },
      { status: 500 }
    )
  }
}
