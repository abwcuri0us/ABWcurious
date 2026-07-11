import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { unauthorizedResponse, forbiddenResponse } from '@/lib/auth'
import { randomUUID } from 'crypto'
import { validateCsrfRequest } from '@/lib/csrf'

const createResearchSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  organization: z.string().max(200).optional(),
  researchTopic: z.string().min(3, 'Research topic is required').max(300),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  collaborationType: z.enum(['Joint Research', 'Consultancy', 'Whitepaper', 'Other'], {
    message: 'Please select a valid collaboration type',
  }),
})

// POST /api/research - Public: Submit a research inquiry
export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfRequest(request)) {
      return NextResponse.json({ success: false, error: 'Invalid CSRF token' }, { status: 403 })
    }

    const rateResult = checkRateLimit(request, { limit: 3, windowMs: 60_000 })
    if (!rateResult.success) return rateLimitResponse()

    const body = await request.json()
    const validation = createResearchSchema.safeParse(body)
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

    const { name, email, organization, researchTopic, description, collaborationType } = validation.data

    const id = randomUUID()
    const { data: inquiry, error } = await supabaseAdmin
      .from('research_inquiries')
      .insert([{
        id,
        name,
        email,
        organization: organization || null,
        research_topic: researchTopic,
        description,
        collaboration_type: collaborationType,
        status: 'new',
      }])
      .select()
      .single()

    if (error) {
      console.error('Research create error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to submit research inquiry. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Research inquiry submitted successfully! Our team will get back to you.', data: { id: inquiry.id } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Research create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit research inquiry. Please try again.' },
      { status: 500 }
    )
  }
}

// GET /api/research - Admin: List all research inquiries
export async function GET(request: NextRequest) {
  try {
    const rateResult = checkRateLimit(request, { limit: 60, windowMs: 60_000 })
    if (!rateResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required')

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const status = searchParams.get('status') || ''
    const collaborationType = searchParams.get('collaborationType') || ''
    const search = searchParams.get('search') || ''

    let query = supabaseAdmin
      .from('research_inquiries')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, (page - 1) * limit + limit - 1)

    if (status) query = query.eq('status', status)
    if (collaborationType) query = query.eq('collaboration_type', collaborationType)
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,organization.ilike.%${search}%,research_topic.ilike.%${search}%,description.ilike.%${search}%`)

    const { data: inquiries, error, count } = await query

    if (error) {
      console.error('Research list error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch research inquiries' },
        { status: 500 }
      )
    }

    const total = count ?? 0
    return NextResponse.json({
      success: true,
      data: inquiries,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Research list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch research inquiries' },
      { status: 500 }
    )
  }
}
