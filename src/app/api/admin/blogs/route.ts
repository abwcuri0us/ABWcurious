import { NextRequest, NextResponse } from 'next/server'
import { blogsDb, verifyAccess } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// Helper to get access token from both Bearer header and cookie
function getAccessToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader?.replace('Bearer ', '')
  const cookieToken = request.cookies.get('abwcurious_token')?.value
  return headerToken || cookieToken || null
}

// GET: List all blog posts (with optional authorId filtering) — admin only
export async function GET(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request)
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const { authorized } = await verifyAccess(accessToken, ['admin', 'editor'])
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const authorId = searchParams.get('authorId')

    const posts = await blogsDb.list({ authorId: authorId || undefined })

    return NextResponse.json({ success: true, data: posts })
  } catch (error) {
    console.error('Blogs list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch blogs.' }, { status: 500 })
  }
}

// POST: Create a new blog post
export async function POST(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request)
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Author access required.' }, { status: 403 })
    }

    const { authorized } = await verifyAccess(accessToken, ['admin', 'editor', 'author'])
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Author access required.' }, { status: 403 })
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
      slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
      excerpt: z.string().max(500).optional(),
      content: z.string().min(10, 'Content must be at least 10 characters'),
      cover_image: z.string().url().optional().or(z.literal('')),
      published: z.boolean().default(false),
      author_id: z.string(),
      category_id: z.string().optional(),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validationResult.error.issues }, { status: 400 })
    }

    const data = validationResult.data
    const post = await blogsDb.create({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt ?? null,
      content: data.content,
      cover_image: data.cover_image || null,
      published: data.published,
      author_id: data.author_id,
      category_id: data.category_id ?? null,
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

// PATCH: Update a blog post
export async function PATCH(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request)
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const { authorized } = await verifyAccess(accessToken, ['admin', 'editor', 'author'])
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
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

// DELETE: Remove a blog post
export async function DELETE(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request)
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const { authorized } = await verifyAccess(accessToken, ['admin', 'editor', 'author'])
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
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
