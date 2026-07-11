import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { unauthorizedResponse, forbiddenResponse } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { randomUUID } from 'crypto'
import { validateCsrfRequest } from '@/lib/csrf'

const createInternshipSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().refine(
    (val) => !val || /^[\+]?[\d\s\-\(\)]{7,20}$/.test(val),
    'Invalid phone number format'
  ),
  college: z.string().min(2, 'College/University name is required').max(200),
  degree: z.string().min(2, 'Degree is required').max(200),
  graduationYear: z.string().min(4, 'Graduation year is required').max(4),
  role: z.enum(['Cybersecurity Intern', 'AI/ML Intern', 'Full Stack Developer Intern', 'UI/UX Design Intern', 'Digital Marketing Intern']).optional(),
  resumeUrl: z.string().url('Invalid resume URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
  message: z.string().min(20, 'Cover letter must be at least 20 characters').max(5000),
})

// POST /api/internships - Public: Submit an internship application
export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfRequest(request)) {
      return NextResponse.json({ success: false, error: 'Invalid CSRF token' }, { status: 403 })
    }

    const rlResult = checkRateLimit(request, { limit: 3, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const body = await request.json()
    const validation = createInternshipSchema.safeParse(body)
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

    const { name, email, phone, college, degree, graduationYear, role, resumeUrl, portfolioUrl, message } = validation.data

    const { data: internship, error } = await supabaseAdmin
      .from('internship_applications')
      .insert([{
        id: randomUUID(),
        name,
        email,
        phone: phone || null,
        college,
        degree,
        graduation_year: graduationYear,
        role: role || null,
        resume_url: resumeUrl || null,
        portfolio_url: portfolioUrl || null,
        message,
        status: 'new',
      }])
      .select()
      .single()

    if (error) {
      console.error('Internship create error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to submit application. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Internship application submitted successfully! We will review it shortly.', data: { id: internship.id } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Internship create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    )
  }
}

// GET /api/internships - Admin: List all internship applications
export async function GET(request: NextRequest) {
  try {
    const rlResult = checkRateLimit(request, { limit: 60, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required')

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const status = searchParams.get('status') || ''
    const role = searchParams.get('role') || ''
    const search = searchParams.get('search') || ''

    let query = supabaseAdmin
      .from('internship_applications')
      .select('id, name, email, phone, college, degree, graduation_year, role, status, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, (page - 1) * limit + limit - 1)

    if (status) query = query.eq('status', status)
    if (role) query = query.eq('role', role)
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,college.ilike.%${search}%,message.ilike.%${search}%`)
    }

    const { data: internships, error, count } = await query

    if (error) {
      console.error('Internships list error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch internship applications' },
        { status: 500 }
      )
    }

    const total = count ?? 0

    return NextResponse.json({
      success: true,
      data: internships,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Internships list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch internship applications' },
      { status: 500 }
    )
  }
}
