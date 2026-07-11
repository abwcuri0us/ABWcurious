import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

const updateMaintenanceSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  service: z.string().min(1).max(100).optional(),
  scheduledStart: z.string().datetime().optional(),
  scheduledEnd: z.string().datetime().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
})

// GET /api/maintenance/[id] - Get a single maintenance schedule
// Public: can see scheduled/in_progress only; Admin: can see all
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 60, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    const { id } = await params

    const { data: schedule, error } = await supabaseAdmin
      .from('maintenance_schedules')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error || !schedule) return notFoundResponse('Maintenance schedule')

    // Non-admin can only see scheduled or in_progress
    if ((!user || !['admin', 'editor'].includes(user.role)) && !['scheduled', 'in_progress'].includes(schedule.status)) {
      return notFoundResponse('Maintenance schedule')
    }

    return NextResponse.json({ success: true, data: schedule })
  } catch (error) {
    console.error('Maintenance get error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch maintenance schedule' },
      { status: 500 }
    )
  }
}

// PATCH /api/maintenance/[id] - Update a maintenance schedule (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 10, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to update maintenance schedules')

    const { id } = await params
    const { data: schedule, error: findError } = await supabaseAdmin
      .from('maintenance_schedules')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (findError || !schedule) return notFoundResponse('Maintenance schedule')

    const body = await request.json()
    const validation = updateMaintenanceSchema.safeParse(body)
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

    // Validate date range if both provided or one changes
    const start = validation.data.scheduledStart
      ? new Date(validation.data.scheduledStart)
      : new Date(schedule.scheduled_start)
    const end = validation.data.scheduledEnd
      ? new Date(validation.data.scheduledEnd)
      : new Date(schedule.scheduled_end)
    if (end <= start) {
      return NextResponse.json(
        { success: false, error: 'Scheduled end must be after scheduled start' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (validation.data.title !== undefined) updateData.title = validation.data.title
    if (validation.data.description !== undefined) updateData.description = validation.data.description
    if (validation.data.service !== undefined) updateData.service = validation.data.service
    if (validation.data.status !== undefined) updateData.status = validation.data.status
    if (validation.data.scheduledStart !== undefined) updateData.scheduled_start = new Date(validation.data.scheduledStart).toISOString()
    if (validation.data.scheduledEnd !== undefined) updateData.scheduled_end = new Date(validation.data.scheduledEnd).toISOString()

    const { data: updatedSchedule, error: updateError } = await supabaseAdmin
      .from('maintenance_schedules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Maintenance update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update maintenance schedule' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: updatedSchedule })
  } catch (error) {
    console.error('Maintenance update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update maintenance schedule' },
      { status: 500 }
    )
  }
}

// DELETE /api/maintenance/[id] - Delete a maintenance schedule (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 5, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to delete maintenance schedules')

    const { id } = await params
    const { data: schedule, error: findError } = await supabaseAdmin
      .from('maintenance_schedules')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (findError || !schedule) return notFoundResponse('Maintenance schedule')

    const { error: deleteError } = await supabaseAdmin
      .from('maintenance_schedules')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Maintenance delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete maintenance schedule' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Maintenance schedule deleted successfully',
    })
  } catch (error) {
    console.error('Maintenance delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete maintenance schedule' },
      { status: 500 }
    )
  }
}
