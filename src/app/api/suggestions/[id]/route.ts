import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

const updateSuggestionSchema = z.object({
  status: z.enum(['new', 'considering', 'planned', 'implemented', 'rejected']).optional(),
  adminNotes: z.string().max(5000).optional(),
  name: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal('')).optional(),
  category: z.enum(['Feature Request', 'Improvement', 'Bug Report', 'Content', 'Other']).optional(),
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
})

// GET /api/suggestions/[id] - Get a single suggestion (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 60, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to view suggestions')

    const { id } = await params
    const { data: suggestion, error } = await supabaseAdmin
      .from('suggestions')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error || !suggestion) return notFoundResponse('Suggestion')

    return NextResponse.json({ success: true, data: suggestion })
  } catch (error) {
    console.error('Suggestion get error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suggestion' },
      { status: 500 }
    )
  }
}

// PATCH /api/suggestions/[id] - Update a suggestion (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 10, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to update suggestions')

    const { id } = await params
    const { data: suggestion, error: findError } = await supabaseAdmin
      .from('suggestions')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (findError || !suggestion) return notFoundResponse('Suggestion')

    const body = await request.json()
    const validation = updateSuggestionSchema.safeParse(body)
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
    if (validation.data.adminNotes !== undefined) updateData.admin_notes = validation.data.adminNotes
    if (validation.data.name !== undefined) updateData.name = validation.data.name
    if (validation.data.email !== undefined) updateData.email = validation.data.email || null
    if (validation.data.category !== undefined) updateData.category = validation.data.category
    if (validation.data.title !== undefined) updateData.title = validation.data.title
    if (validation.data.description !== undefined) updateData.description = validation.data.description
    if (validation.data.priority !== undefined) updateData.priority = validation.data.priority

    const { data: updatedSuggestion, error: updateError } = await supabaseAdmin
      .from('suggestions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Suggestion update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update suggestion' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: updatedSuggestion })
  } catch (error) {
    console.error('Suggestion update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update suggestion' },
      { status: 500 }
    )
  }
}

// DELETE /api/suggestions/[id] - Delete a suggestion (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 5, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to delete suggestions')

    const { id } = await params
    const { data: suggestion, error: findError } = await supabaseAdmin
      .from('suggestions')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (findError || !suggestion) return notFoundResponse('Suggestion')

    const { error: deleteError } = await supabaseAdmin
      .from('suggestions')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Suggestion delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete suggestion' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Suggestion deleted successfully',
    })
  } catch (error) {
    console.error('Suggestion delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete suggestion' },
      { status: 500 }
    )
  }
}
