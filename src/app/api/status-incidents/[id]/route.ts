import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

const updateStatusIncidentSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  severity: z.enum(['minor', 'major', 'critical']).optional(),
  service: z.string().min(1).max(100).optional(),
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']).optional(),
  startedAt: z.string().optional(),
  resolvedAt: z.string().optional(),
})

// GET /api/status-incidents/[id] - Get a single status incident (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 60, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const { id } = await params

    const { data: incident, error } = await supabaseAdmin
      .from('status_incidents')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error || !incident) return notFoundResponse('Status incident')

    return NextResponse.json({ success: true, data: incident })
  } catch (error) {
    console.error('Status incident get error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch status incident' },
      { status: 500 }
    )
  }
}

// PATCH /api/status-incidents/[id] - Update a status incident (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 10, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to update status incidents')

    const { id } = await params

    const { data: incident, error: findError } = await supabaseAdmin
      .from('status_incidents')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (findError || !incident) return notFoundResponse('Status incident')

    const body = await request.json()
    const validation = updateStatusIncidentSchema.safeParse(body)
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
    if (validation.data.severity !== undefined) updateData.severity = validation.data.severity
    if (validation.data.service !== undefined) updateData.service = validation.data.service
    if (validation.data.status !== undefined) updateData.status = validation.data.status
    if (validation.data.startedAt !== undefined) updateData.started_at = new Date(validation.data.startedAt).toISOString()
    if (validation.data.resolvedAt !== undefined) updateData.resolved_at = new Date(validation.data.resolvedAt).toISOString()

    // If status is being set to resolved, auto-set resolvedAt
    if (validation.data.status === 'resolved' && !incident.resolved_at && !validation.data.resolvedAt) {
      updateData.resolved_at = new Date().toISOString()
    }

    const { data: updatedIncident, error: updateError } = await supabaseAdmin
      .from('status_incidents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Status incident update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update status incident' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: updatedIncident })
  } catch (error) {
    console.error('Status incident update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update status incident' },
      { status: 500 }
    )
  }
}

// DELETE /api/status-incidents/[id] - Delete a status incident (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 5, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to delete status incidents')

    const { id } = await params

    const { data: incident, error: findError } = await supabaseAdmin
      .from('status_incidents')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (findError || !incident) return notFoundResponse('Status incident')

    const { error: deleteError } = await supabaseAdmin
      .from('status_incidents')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Status incident delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete status incident' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Status incident deleted successfully',
    })
  } catch (error) {
    console.error('Status incident delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete status incident' },
      { status: 500 }
    )
  }
}
