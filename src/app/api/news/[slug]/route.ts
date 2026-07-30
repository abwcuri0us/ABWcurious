import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { generateSlug, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

const updateNewsSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(10).optional(),
  coverImage: z.string().url().optional().or(z.literal('')).optional(),
  category: z.enum(['Company', 'Industry', 'Security Alert']).optional(),
  isPublished: z.boolean().optional(),
})

// GET /api/news/[slug] - Get a single news article (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 60, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const { slug } = await params

    const { data: news, error } = await supabaseAdmin
      .from('news')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error || !news) return notFoundResponse('News article')

    // If not published, only admin/editor can see it
    if (!news.is_published) {
      const user = await getCurrentUser(request)
      if (!user || !['admin', 'editor'].includes(user.role)) {
        return notFoundResponse('News article')
      }
    }

    return NextResponse.json({ success: true, data: news })
  } catch (error) {
    console.error('News get error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news article' },
      { status: 500 }
    )
  }
}

// PATCH /api/news/[slug] - Update news (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 10, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to update news')

    const { slug } = await params

    const { data: news, error: findError } = await supabaseAdmin
      .from('news')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (findError || !news) return notFoundResponse('News article')

    const body = await request.json()
    const validation = updateNewsSchema.safeParse(body)
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
    if (validation.data.excerpt !== undefined) updateData.excerpt = validation.data.excerpt
    if (validation.data.content !== undefined) updateData.content = validation.data.content
    if (validation.data.coverImage !== undefined) updateData.cover_image = validation.data.coverImage || null
    if (validation.data.category !== undefined) updateData.category = validation.data.category
    if (validation.data.isPublished !== undefined) updateData.is_published = validation.data.isPublished

    if (validation.data.title && validation.data.title !== news.title) {
      const newSlug = generateSlug(validation.data.title)
      const { data: existingSlug } = await supabaseAdmin
        .from('news')
        .select('id')
        .eq('slug', newSlug)
        .maybeSingle()

      if (existingSlug && existingSlug.id !== news.id) {
        return NextResponse.json(
          { success: false, error: 'A news article with a similar title already exists' },
          { status: 409 }
        )
      }
      updateData.slug = newSlug
    }

    if (validation.data.isPublished === true && !news.is_published) {
      updateData.published_at = new Date().toISOString()
    }

    const { data: updatedNews, error: updateError } = await supabaseAdmin
      .from('news')
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single()

    if (updateError) {
      console.error('News update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update news' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: updatedNews })
  } catch (error) {
    console.error('News update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update news' },
      { status: 500 }
    )
  }
}

// DELETE /api/news/[slug] - Delete news (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 5, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to delete news')

    const { slug } = await params

    const { data: news, error: findError } = await supabaseAdmin
      .from('news')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (findError || !news) return notFoundResponse('News article')

    const { error: deleteError } = await supabaseAdmin
      .from('news')
      .delete()
      .eq('slug', slug)

    if (deleteError) {
      console.error('News delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete news' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'News article deleted successfully',
    })
  } catch (error) {
    console.error('News delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete news' },
      { status: 500 }
    )
  }
}
