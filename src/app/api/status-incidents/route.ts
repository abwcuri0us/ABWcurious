import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { unauthorizedResponse, forbiddenResponse } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { randomUUID } from 'crypto'

const createStatusIncidentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  severity: z.enum(['minor', 'major', 'critical']).optional(),
  service: z.string().min(1, 'Affected service is required').max(100),
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']).optional(),
  startedAt: z.string().min(1, 'Start time is required'),
  resolvedAt: z.string().optional(),
})

// GET /api/status-incidents - List all incidents (public)
export async function GET(request: NextRequest) {
  try {
    const rlResult = checkRateLimit(request, { limit: 60, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const severity = searchParams.get('severity') || ''
    const status = searchParams.get('status') || ''
    const service = searchParams.get('service') || ''

    let query = supabaseAdmin
      .from('status_incidents')
      .select('*', { count: 'exact' })
      .order('started_at', { ascending: false })
      .range((page - 1) * limit, (page - 1) * limit + limit - 1)

    if (severity) {
      query = query.eq('severity', severity)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (service) {
      query = query.ilike('service', `%${service}%`)
    }

    const { data: incidents, error, count } = await query

    if (error) {
      console.error('Status incidents list error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch status incidents' },
        { status: 500 }
      )
    }

    const total = count ?? 0

    return NextResponse.json({
      success: true,
      data: incidents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Status incidents list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch status incidents' },
      { status: 500 }
    )
  }
}

// POST /api/status-incidents - Create a status incident (admin only)
export async function POST(request: NextRequest) {
  try {
    const rlResult = checkRateLimit(request, { limit: 5, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to create status incidents')

    const body = await request.json()
    const validation = createStatusIncidentSchema.safeParse(body)
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

    const { title, description, severity, service, status, startedAt, resolvedAt } = validation.data

    const { data: incident, error } = await supabaseAdmin
      .from('status_incidents')
      .insert([{
        id: randomUUID(),
        title,
        description,
        severity: severity || 'minor',
        service,
        status: status || 'investigating',
        started_at: new Date(startedAt).toISOString(),
        resolved_at: resolvedAt ? new Date(resolvedAt).toISOString() : null,
      }])
      .select()
      .single()

    if (error) {
      console.error('Status incident create error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create status incident' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data: incident },
      { status: 201 }
    )
  } catch (error) {
    console.error('Status incident create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create status incident' },
      { status: 500 }
    )
  }
}
