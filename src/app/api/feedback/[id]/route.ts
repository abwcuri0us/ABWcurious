import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

const updateFeedbackSchema = z.object({
  status: z.enum(['new', 'reviewed', 'addressed']).optional(),
  adminReply: z.string().max(5000).optional(),
  name: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal('')).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  category: z.enum(['General', 'Product', 'Service', 'Support', 'Website']).optional(),
  message: z.string().min(10).max(5000).optional(),
  isAnonymous: z.boolean().optional(),
})

// GET /api/feedback/[id] - Get a single feedback (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 60, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to view feedback')

    const { id } = await params
    const { data: feedback, error } = await supabaseAdmin
      .from('feedback')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error || !feedback) return notFoundResponse('Feedback')

    return NextResponse.json({ success: true, data: feedback })
  } catch (error) {
    console.error('Feedback get error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

// PATCH /api/feedback/[id] - Update feedback (admin reply / status update, admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 10, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to update feedback')

    const { id } = await params
    const { data: feedback, error: findError } = await supabaseAdmin
      .from('feedback')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (findError || !feedback) return notFoundResponse('Feedback')

    const body = await request.json()
    const validation = updateFeedbackSchema.safeParse(body)
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
    if (validation.data.adminReply !== undefined) updateData.admin_reply = validation.data.adminReply
    if (validation.data.name !== undefined) updateData.name = validation.data.name
    if (validation.data.email !== undefined) updateData.email = validation.data.email || null
    if (validation.data.rating !== undefined) updateData.rating = validation.data.rating
    if (validation.data.category !== undefined) updateData.type = validation.data.category
    if (validation.data.message !== undefined) updateData.message = validation.data.message
    // isAnonymous is not stored in DB — ignore it silently

    const { data: updatedFeedback, error: updateError } = await supabaseAdmin
      .from('feedback')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Feedback update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: updatedFeedback })
  } catch (error) {
    console.error('Feedback update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update feedback' },
      { status: 500 }
    )
  }
}

// DELETE /api/feedback/[id] - Delete feedback (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 5, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to delete feedback')

    const { id } = await params
    const { data: feedback, error: findError } = await supabaseAdmin
      .from('feedback')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (findError || !feedback) return notFoundResponse('Feedback')

    const { error: deleteError } = await supabaseAdmin
      .from('feedback')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Feedback delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback deleted successfully',
    })
  } catch (error) {
    console.error('Feedback delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete feedback' },
      { status: 500 }
    )
  }
}
