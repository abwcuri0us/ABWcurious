import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { validateCsrfRequest } from '@/lib/csrf'

const VALID_SERVICES = [
  'ai-and-machine-learning',
  'electronic-security-system',
  'cyber-security',
  'website-development',
  'application-development',
  'it-supports',
  'digital-marketing',
  'amc',
  'hiring-and-career-guidance',
] as const

const serviceInquirySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  email: z.string().email('Invalid email address').max(254, 'Email is too long'),
  phone: z.string().max(30, 'Phone number is too long').optional(),
  service: z.enum(VALID_SERVICES, { message: 'Invalid service selection.' }),
  company: z.string().max(200, 'Company name is too long').optional(),
  message: z.string().min(1, 'Message is required').max(5000, 'Message is too long'),
  budget: z.string().max(100, 'Budget is too long').optional(),
  timeline: z.string().max(100, 'Timeline is too long').optional(),
})

export async function POST(request: Request) {
  try {
    if (!validateCsrfRequest(request)) {
      return NextResponse.json({ success: false, error: 'Invalid CSRF token' }, { status: 403 })
    }

    // Rate limit
    const rateResult = checkRateLimit(request, { limit: 5, windowMs: 60_000 })
    if (!rateResult.success) return rateLimitResponse()

    const body = await request.json()
    const validationResult = serviceInquirySchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    const { name, email, phone, service, company, message, budget, timeline } = validationResult.data

    // Insert into suggestions table
    const { data, error } = await supabaseAdmin
      .from('suggestions')
      .insert([{
        name,
        email,
        phone: phone || null,
        service,
        company: company || null,
        message,
        budget: budget || null,
        timeline: timeline || null,
        status: 'new',
      }])
      .select()
      .single()

    if (error) {
      console.error('[Service Inquiry] Insert error:', error.message)
      return NextResponse.json(
        { success: false, error: 'Failed to process inquiry. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Your service inquiry has been submitted successfully. Our team will contact you within 24 hours.',
      data,
    })
  } catch (err) {
    console.error('[Service Inquiry] Unexpected error:', err)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}

// List service inquiries (admin only)
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request)
    if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')

    let query = supabaseAdmin
      .from('suggestions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('[Service Inquiry] GET error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to load inquiries.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      inquiries: data ?? [],
      total: count ?? 0,
    })
  } catch (err) {
    console.error('[Service Inquiry] GET error:', err)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
