import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { unauthorizedResponse, forbiddenResponse } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { randomUUID } from 'crypto'

const createMaintenanceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  service: z.string().min(1, 'Service is required').max(100),
  scheduledStart: z.string().datetime('Invalid start date format'),
  scheduledEnd: z.string().datetime('Invalid end date format'),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional().default('scheduled'),
})

// GET /api/maintenance - List maintenance schedules
// Public: can see scheduled/in_progress maintenance only
// Admin: can see all maintenance schedules
export async function GET(request: NextRequest) {
  try {
    const rlResult = checkRateLimit(request, { limit: 60, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const status = searchParams.get('status') || ''
    const service = searchParams.get('service') || ''

    // Check if user is admin
    const user = await getCurrentUser(request)

    let query = supabaseAdmin
      .from('maintenance_schedules')
      .select('id, title, service, status, scheduled_start, scheduled_end, created_at', { count: 'exact' })
      .order('scheduled_start', { ascending: true })
      .range((page - 1) * limit, (page - 1) * limit + limit - 1)

    // Public users can only see scheduled and in_progress maintenance
    if (!user || !['admin', 'editor'].includes(user.role)) {
      query = query.in('status', ['scheduled', 'in_progress'])
    } else if (status) {
      query = query.eq('status', status)
    }
    if (service) {
      query = query.ilike('service', `%${service}%`)
    }

    const { data: schedules, error, count } = await query

    if (error) {
      console.error('Maintenance list error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch maintenance schedules' },
        { status: 500 }
      )
    }

    const total = count ?? 0

    return NextResponse.json({
      success: true,
      data: schedules,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Maintenance list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch maintenance schedules' },
      { status: 500 }
    )
  }
}

// POST /api/maintenance - Create a maintenance schedule (admin only)
export async function POST(request: NextRequest) {
  try {
    const rlResult = checkRateLimit(request, { limit: 5, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to create maintenance schedules')

    const body = await request.json()
    const validation = createMaintenanceSchema.safeParse(body)
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

    const { title, description, service, scheduledStart, scheduledEnd, status } = validation.data

    // Validate that end is after start
    const start = new Date(scheduledStart)
    const end = new Date(scheduledEnd)
    if (end <= start) {
      return NextResponse.json(
        { success: false, error: 'Scheduled end must be after scheduled start' },
        { status: 400 }
      )
    }

    const { data: schedule, error } = await supabaseAdmin
      .from('maintenance_schedules')
      .insert([{
        id: randomUUID(),
        title,
        description,
        service,
        scheduled_start: start.toISOString(),
        scheduled_end: end.toISOString(),
        status: status ?? 'scheduled',
        created_by: user.id,
      }])
      .select()
      .single()

    if (error) {
      console.error('Maintenance create error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create maintenance schedule' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Maintenance schedule created successfully.',
        data: schedule,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Maintenance create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create maintenance schedule' },
      { status: 500 }
    )
  }
}
