import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { unauthorizedResponse, forbiddenResponse } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { randomUUID } from 'crypto'
import { validateCsrfRequest } from '@/lib/csrf'

const createSuggestionSchema = z.object({
  name: z.string().max(100).optional().default(''),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  category: z.enum(['Feature Request', 'Improvement', 'Bug Report', 'Content', 'Other'], {
    message: 'Please select a valid category',
  }),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional().default('Medium'),
})

// POST /api/suggestions - Public: Submit a suggestion
export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfRequest(request)) {
      return NextResponse.json({ success: false, error: 'Invalid CSRF token' }, { status: 403 })
    }

    const rlResult = checkRateLimit(request, { limit: 5, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const body = await request.json()
    const validation = createSuggestionSchema.safeParse(body)
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

    const { name, email, category, title, description, priority } = validation.data

    const { data: suggestion, error } = await supabaseAdmin
      .from('suggestions')
      .insert([{
        id: randomUUID(),
        name: name || null,
        email: email || null,
        category,
        title,
        description,
        priority: priority || 'Medium',
        status: 'new',
      }])
      .select()
      .single()

    if (error) {
      console.error('Suggestion create error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to submit suggestion. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Suggestion submitted successfully! Our team reviews every suggestion.', data: { id: suggestion.id } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Suggestion create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit suggestion. Please try again.' },
      { status: 500 }
    )
  }
}

// GET /api/suggestions - Admin: List all suggestions
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
    const category = searchParams.get('category') || ''
    const priority = searchParams.get('priority') || ''
    const search = searchParams.get('search') || ''

    let query = supabaseAdmin
      .from('suggestions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, (page - 1) * limit + limit - 1)

    if (status) query = query.eq('status', status)
    if (category) query = query.eq('category', category)
    if (priority) query = query.eq('priority', priority)
    if (search) {
      const safeSearch = search.replace(/[%_,.()*]/g, '')
      query = query.or(`name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%,title.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`)
    }

    const { data: suggestions, error, count } = await query

    if (error) {
      console.error('Suggestions list error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch suggestions' },
        { status: 500 }
      )
    }

    const total = count ?? 0

    return NextResponse.json({
      success: true,
      data: suggestions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Suggestions list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suggestions' },
      { status: 500 }
    )
  }
}
