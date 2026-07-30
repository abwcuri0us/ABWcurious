import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { generateSlug, unauthorizedResponse, forbiddenResponse } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { randomUUID } from 'crypto'

const createNewsletterIssueSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  issueNumber: z.number().int().positive('Issue number must be a positive integer'),
  coverImage: z.string().url().optional().or(z.literal('')),
  isPublished: z.boolean().optional().default(false),
})

// GET /api/newsletter-issues - List published newsletter issues (public)
export async function GET(request: NextRequest) {
  try {
    const rlResult = checkRateLimit(request, { limit: 60, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const search = searchParams.get('search') || ''

    const user = await getCurrentUser(request)
    const showUnpublished = user && ['admin', 'editor'].includes(user.role)

    let query = supabaseAdmin
      .from('newsletter_issues')
      .select('id, title, slug, issue_number, status, published_at', { count: 'exact' })
      .order('issue_number', { ascending: false })
      .range((page - 1) * limit, (page - 1) * limit + limit - 1)

    if (!showUnpublished) {
      query = query.eq('is_published', true)
    }
    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    const { data: issues, error, count } = await query

    if (error) {
      console.error('Newsletter issues list error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch newsletter issues' },
        { status: 500 }
      )
    }

    const total = count ?? 0

    return NextResponse.json({
      success: true,
      data: issues,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (error) {
    console.error('Newsletter issues list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch newsletter issues' },
      { status: 500 }
    )
  }
}

// POST /api/newsletter-issues - Create a newsletter issue (admin only)
export async function POST(request: NextRequest) {
  try {
    const rlResult = checkRateLimit(request, { limit: 5, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to create newsletter issues')

    const body = await request.json()
    const validation = createNewsletterIssueSchema.safeParse(body)
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

    const { title, content, issueNumber, coverImage, isPublished } = validation.data

    const slug = generateSlug(title)

    // Check if slug already exists
    const { data: existingSlug } = await supabaseAdmin
      .from('newsletter_issues')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: 'A newsletter issue with a similar title already exists' },
        { status: 409 }
      )
    }

    // Check if issue number already exists
    const { data: existingIssueNumber } = await supabaseAdmin
      .from('newsletter_issues')
      .select('id')
      .eq('issue_number', issueNumber)
      .maybeSingle()

    if (existingIssueNumber) {
      return NextResponse.json(
        { success: false, error: `Issue number ${issueNumber} already exists` },
        { status: 409 }
      )
    }

    const { data: issue, error } = await supabaseAdmin
      .from('newsletter_issues')
      .insert([{
        id: randomUUID(),
        title,
        slug,
        content,
        issue_number: issueNumber,
        cover_image: coverImage || null,
        is_published: isPublished ?? false,
        published_at: isPublished ? new Date().toISOString() : null,
      }])
      .select()
      .single()

    if (error) {
      console.error('Newsletter issue create error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create newsletter issue' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data: issue },
      { status: 201 }
    )
  } catch (error) {
    console.error('Newsletter issue create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create newsletter issue' },
      { status: 500 }
    )
  }
}
