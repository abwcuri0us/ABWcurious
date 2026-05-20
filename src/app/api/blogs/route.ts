import { NextRequest, NextResponse } from 'next/server'
import { blogsDb, getUserFromToken } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// Helper to get access token from both Bearer header and cookie
function getAccessToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader?.replace('Bearer ', '')
  const cookieToken = request.cookies.get('abwcurious_token')?.value
  return headerToken || cookieToken || null
}

// GET: Public blog posts (published only)
export async function GET() {
  try {
    const posts = await blogsDb.findPublished()
    return NextResponse.json({ success: true, data: posts })
  } catch (error) {
    console.error('Public blogs error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch blogs.' }, { status: 500 })
  }
}

// POST: Create a new blog post (auth required, any logged-in user)
export async function POST(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request)
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const user = await getUserFromToken(accessToken)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const body = await request.json()
    const schema = z.object({
      title: z.string().min(3, 'Title must be at least 3 characters').max(200),
      slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').optional(),
      excerpt: z.string().max(500).optional(),
      content: z.string().min(10, 'Content must be at least 10 characters'),
      cover_image: z.string().url().optional().or(z.literal('')),
      published: z.boolean().default(false),
      category_id: z.string().optional(),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validationResult.error.issues }, { status: 400 })
    }

    const data = validationResult.data
    // Auto-generate slug from title if not provided
    const slug = data.slug || data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 200)

    // Ensure slug uniqueness
    const existing = await blogsDb.findBySlug(slug)
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const post = await blogsDb.create({
      title: data.title,
      slug: finalSlug,
      excerpt: data.excerpt || null,
      content: data.content,
      cover_image: data.cover_image || null,
      published: data.published,
      author_id: user.id,
      category_id: data.category_id || null,
    })

    if (!post) {
      return NextResponse.json({ success: false, error: 'Failed to create blog post.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: post }, { status: 201 })
  } catch (error) {
    console.error('Blog create error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create blog post.' }, { status: 500 })
  }
}

// PATCH: Update own blog post (auth required, owner only or admin/editor)
export async function PATCH(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request)
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const user = await getUserFromToken(accessToken)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const body = await request.json()
    const schema = z.object({
      id: z.string(),
      title: z.string().min(3).max(200).optional(),
      slug: z.string().min(3).max(200).optional(),
      excerpt: z.string().max(500).optional(),
      content: z.string().min(10).optional(),
      cover_image: z.string().url().optional().or(z.literal('')),
      published: z.boolean().optional(),
      category_id: z.string().optional(),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed.' }, { status: 400 })
    }

    const { id, ...data } = validationResult.data

    // Check ownership or admin/editor role
    const existingPost = await blogsDb.findById(id)
    if (!existingPost) {
      return NextResponse.json({ success: false, error: 'Blog post not found.' }, { status: 404 })
    }

    if (existingPost.author_id !== user.id && !['admin', 'editor'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'You can only edit your own posts.' }, { status: 403 })
    }

    const post = await blogsDb.update(id, data)
    if (!post) {
      return NextResponse.json({ success: false, error: 'Failed to update blog post.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: post })
  } catch (error) {
    console.error('Blog update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update blog post.' }, { status: 500 })
  }
}

// DELETE: Delete own blog post (auth required, owner only or admin/editor)
export async function DELETE(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request)
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const user = await getUserFromToken(accessToken)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Blog post ID is required.' }, { status: 400 })
    }

    // Check ownership or admin/editor role
    const existingPost = await blogsDb.findById(id)
    if (!existingPost) {
      return NextResponse.json({ success: false, error: 'Blog post not found.' }, { status: 404 })
    }

    if (existingPost.author_id !== user.id && !['admin', 'editor'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'You can only delete your own posts.' }, { status: 403 })
    }

    const deleted = await blogsDb.delete(id)
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Failed to delete blog post.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Blog post deleted.' })
  } catch (error) {
    console.error('Blog delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete blog post.' }, { status: 500 })
  }
}
