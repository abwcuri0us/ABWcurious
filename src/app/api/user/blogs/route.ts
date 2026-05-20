import { NextRequest, NextResponse } from 'next/server'
import { blogsDb, getUserFromToken } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import { sanitizeHtml } from '@/lib/sanitize'
import { getUserFromRequest } from '@/lib/auth-helpers'

const blogSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(300),
  slug: z.string().max(300).optional(),
  excerpt: z.string().max(1000).optional(),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  coverImage: z.string().url().optional().or(z.literal('')),
  published: z.boolean().optional(),
  categoryId: z.string().optional(),
})

// GET: List user's blog posts
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    const posts = await blogsDb.list({ authorId: user!.id })
    return NextResponse.json({ success: true, data: posts })
  } catch (err) {
    console.error('Blogs GET error:', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch blog posts.' }, { status: 500 })
  }
}

// POST: Create new blog post
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown'
    const rl = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    const body = await request.json()
    const validation = blogSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validation.error.issues }, { status: 400 })
    }

    const { title, slug, excerpt, content, coverImage, published, categoryId } = validation.data

    // Auto-generate slug if not provided
    let finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 200)

    // Ensure slug uniqueness
    const existing = await blogsDb.findBySlug(finalSlug)
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString(36)}`
    }

    const post = await blogsDb.create({
      title,
      slug: finalSlug,
      excerpt: excerpt || null,
      content: sanitizeHtml(content),
      cover_image: coverImage || null,
      published: published ?? false,
      author_id: user!.id,
      category_id: categoryId || null,
    })

    if (!post) {
      return NextResponse.json({ success: false, error: 'Failed to create blog post.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: post }, { status: 201 })
  } catch (err) {
    console.error('Blogs POST error:', err)
    return NextResponse.json({ success: false, error: 'Failed to create blog post.' }, { status: 500 })
  }
}

// PUT: Update blog post (only if author or admin)
export async function PUT(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown'
    const rl = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    const body = await request.json()
    const updateSchema = z.object({
      id: z.string(),
      title: z.string().min(3).max(300).optional(),
      slug: z.string().max(300).optional(),
      excerpt: z.string().max(1000).optional(),
      content: z.string().min(10).optional(),
      coverImage: z.string().url().optional().or(z.literal('')).optional(),
      published: z.boolean().optional(),
      categoryId: z.string().optional(),
    })

    const validation = updateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validation.error.issues }, { status: 400 })
    }

    const { id, ...updates } = validation.data

    // Check ownership
    const existingPost = await blogsDb.findById(id)
    if (!existingPost) {
      return NextResponse.json({ success: false, error: 'Blog post not found.' }, { status: 404 })
    }

    if (existingPost.author_id !== user!.id && user!.role !== 'admin' && user!.role !== 'editor') {
      return NextResponse.json({ success: false, error: 'You can only edit your own posts.' }, { status: 403 })
    }

    const updateData: Record<string, unknown> = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.slug !== undefined) updateData.slug = updates.slug
    if (updates.excerpt !== undefined) updateData.excerpt = updates.excerpt || null
    if (updates.content !== undefined) updateData.content = sanitizeHtml(updates.content)
    if (updates.coverImage !== undefined) updateData.cover_image = updates.coverImage || null
    if (updates.published !== undefined) updateData.published = updates.published
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId || null

    const updated = await blogsDb.update(id, updateData)
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Failed to update blog post.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    console.error('Blogs PUT error:', err)
    return NextResponse.json({ success: false, error: 'Failed to update blog post.' }, { status: 500 })
  }
}

// DELETE: Delete blog post (only if author or admin)
export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Post ID is required.' }, { status: 400 })
    }

    const existingPost = await blogsDb.findById(id)
    if (!existingPost) {
      return NextResponse.json({ success: false, error: 'Blog post not found.' }, { status: 404 })
    }

    if (existingPost.author_id !== user!.id && user!.role !== 'admin' && user!.role !== 'editor') {
      return NextResponse.json({ success: false, error: 'You can only delete your own posts.' }, { status: 403 })
    }

    const deleted = await blogsDb.delete(id)
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Failed to delete blog post.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Blog post deleted.' })
  } catch (err) {
    console.error('Blogs DELETE error:', err)
    return NextResponse.json({ success: false, error: 'Failed to delete blog post.' }, { status: 500 })
  }
}
