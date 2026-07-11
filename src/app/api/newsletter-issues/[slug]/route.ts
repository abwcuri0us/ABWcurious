import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { generateSlug, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

const updateNewsletterIssueSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  content: z.string().min(10).optional(),
  issueNumber: z.number().int().positive().optional(),
  coverImage: z.string().url().optional().or(z.literal('')).optional(),
  isPublished: z.boolean().optional(),
})

// GET /api/newsletter-issues/[slug] - Get a single newsletter issue (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 60, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const { slug } = await params

    const { data: issue, error } = await supabaseAdmin
      .from('newsletter_issues')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error || !issue) return notFoundResponse('Newsletter issue')

    // If not published, only admin can see it
    if (!issue.is_published) {
      const user = await getCurrentUser(request)
      if (!user || !['admin', 'editor'].includes(user.role)) {
        return notFoundResponse('Newsletter issue')
      }
    }

    return NextResponse.json({ success: true, data: issue })
  } catch (error) {
    console.error('Newsletter issue get error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch newsletter issue' },
      { status: 500 }
    )
  }
}

// PATCH /api/newsletter-issues/[slug] - Update a newsletter issue (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 10, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to update newsletter issues')

    const { slug } = await params

    const { data: issue, error: findError } = await supabaseAdmin
      .from('newsletter_issues')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (findError || !issue) return notFoundResponse('Newsletter issue')

    const body = await request.json()
    const validation = updateNewsletterIssueSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}

    if (validation.data.title !== undefined) updateData.title = validation.data.title
    if (validation.data.content !== undefined) updateData.content = validation.data.content
    if (validation.data.issueNumber !== undefined) updateData.issue_number = validation.data.issueNumber
    if (validation.data.coverImage !== undefined) updateData.cover_image = validation.data.coverImage || null
    if (validation.data.isPublished !== undefined) updateData.is_published = validation.data.isPublished

    if (validation.data.title && validation.data.title !== issue.title) {
      const newSlug = generateSlug(validation.data.title)
      const { data: existingSlug } = await supabaseAdmin
        .from('newsletter_issues')
        .select('id')
        .eq('slug', newSlug)
        .maybeSingle()

      if (existingSlug && existingSlug.id !== issue.id) {
        return NextResponse.json(
          { success: false, error: 'A newsletter issue with a similar title already exists' },
          { status: 409 }
        )
      }
      updateData.slug = newSlug
    }

    // Check if issue number is being changed and if it conflicts
    if (validation.data.issueNumber && validation.data.issueNumber !== issue.issue_number) {
      const { data: existingIssueNumber } = await supabaseAdmin
        .from('newsletter_issues')
        .select('id')
        .eq('issue_number', validation.data.issueNumber)
        .maybeSingle()

      if (existingIssueNumber) {
        return NextResponse.json(
          { success: false, error: `Issue number ${validation.data.issueNumber} already exists` },
          { status: 409 }
        )
      }
    }

    if (validation.data.isPublished === true && !issue.is_published) {
      updateData.published_at = new Date().toISOString()
    }

    const { data: updatedIssue, error: updateError } = await supabaseAdmin
      .from('newsletter_issues')
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single()

    if (updateError) {
      console.error('Newsletter issue update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update newsletter issue' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: updatedIssue })
  } catch (error) {
    console.error('Newsletter issue update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update newsletter issue' },
      { status: 500 }
    )
  }
}

// DELETE /api/newsletter-issues/[slug] - Delete a newsletter issue (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 5, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to delete newsletter issues')

    const { slug } = await params

    const { data: issue, error: findError } = await supabaseAdmin
      .from('newsletter_issues')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (findError || !issue) return notFoundResponse('Newsletter issue')

    const { error: deleteError } = await supabaseAdmin
      .from('newsletter_issues')
      .delete()
      .eq('slug', slug)

    if (deleteError) {
      console.error('Newsletter issue delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete newsletter issue' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Newsletter issue deleted successfully',
    })
  } catch (error) {
    console.error('Newsletter issue delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete newsletter issue' },
      { status: 500 }
    )
  }
}
