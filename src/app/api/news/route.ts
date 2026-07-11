import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { generateSlug, unauthorizedResponse, forbiddenResponse } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { randomUUID } from 'crypto'

const createNewsSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  coverImage: z.string().url().optional().or(z.literal('')),
  category: z.enum(['Company', 'Industry', 'Security Alert']).optional(),
  isPublished: z.boolean().optional().default(false),
})

// GET /api/news - List published news (public)
export async function GET(request: NextRequest) {
  try {
    const rlResult = checkRateLimit(request, { limit: 60, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''

    const user = await getCurrentUser(request)
    const showUnpublished = user && ['admin', 'editor', 'author'].includes(user.role)

    let query = supabaseAdmin
      .from('news')
      .select('id, title, slug, excerpt, cover_image, category, is_published, published_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, (page - 1) * limit + limit - 1)

    if (!showUnpublished) {
      query = query.eq('is_published', true)
    }
    if (category) {
      query = query.eq('category', category)
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`)
    }

    const { data: news, error, count } = await query

    if (error) {
      console.error('News list error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch news' },
        { status: 500 }
      )
    }

    const total = count ?? 0

    return NextResponse.json({
      success: true,
      data: news,
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
    console.error('News list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}

// POST /api/news - Create news (admin/editor only)
export async function POST(request: NextRequest) {
  try {
    const rlResult = checkRateLimit(request, { limit: 5, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor', 'author'].includes(user.role)) {
      return forbiddenResponse('Admin or editor access required to create news')
    }

    const body = await request.json()
    const validation = createNewsSchema.safeParse(body)
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

    const { title, excerpt, content, coverImage, category, isPublished } = validation.data

    const slug = generateSlug(title)

    // Check if slug already exists
    const { data: existingSlug } = await supabaseAdmin
      .from('news')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: 'A news article with a similar title already exists' },
        { status: 409 }
      )
    }

    const { data: news, error } = await supabaseAdmin
      .from('news')
      .insert([{
        id: randomUUID(),
        title,
        slug,
        excerpt: excerpt || null,
        content,
        cover_image: coverImage || null,
        category: category || 'Company',
        author_id: user.id,
        is_published: isPublished ?? false,
        published_at: isPublished ? new Date().toISOString() : null,
      }])
      .select()
      .single()

    if (error) {
      console.error('News create error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create news' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data: news },
      { status: 201 }
    )
  } catch (error) {
    console.error('News create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create news' },
      { status: 500 }
    )
  }
}
