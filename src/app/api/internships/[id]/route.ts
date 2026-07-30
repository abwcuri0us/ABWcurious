import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

const updateInternshipSchema = z.object({
  status: z.enum(['new', 'reviewing', 'shortlisted', 'accepted', 'rejected']).optional(),
  notes: z.string().max(5000).optional(),
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  college: z.string().max(200).optional(),
  degree: z.string().max(200).optional(),
  graduationYear: z.string().max(10).optional(),
  role: z.enum(['Cybersecurity Intern', 'AI/ML Intern', 'Full Stack Developer Intern', 'UI/UX Design Intern', 'Digital Marketing Intern']).optional(),
  resumeUrl: z.string().url().optional().or(z.literal('')).optional(),
  portfolioUrl: z.string().url().optional().or(z.literal('')).optional(),
  message: z.string().min(10).max(5000).optional(),
})

// GET /api/internships/[id] - Get a single internship application (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 60, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to view internship applications')

    const { id } = await params
    const { data: application, error } = await supabaseAdmin
      .from('internship_applications')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error || !application) return notFoundResponse('Internship application')

    return NextResponse.json({ success: true, data: application })
  } catch (error) {
    console.error('Internship get error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch internship application' },
      { status: 500 }
    )
  }
}

// PATCH /api/internships/[id] - Update an internship application (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 10, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to update internship applications')

    const { id } = await params
    const { data: application, error: findError } = await supabaseAdmin
      .from('internship_applications')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (findError || !application) return notFoundResponse('Internship application')

    const body = await request.json()
    const validation = updateInternshipSchema.safeParse(body)
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

    // Map camelCase to snake_case
    const updateData: Record<string, unknown> = {}
    if (validation.data.status !== undefined) updateData.status = validation.data.status
    if (validation.data.notes !== undefined) updateData.notes = validation.data.notes
    if (validation.data.name !== undefined) updateData.name = validation.data.name
    if (validation.data.email !== undefined) updateData.email = validation.data.email
    if (validation.data.phone !== undefined) updateData.phone = validation.data.phone
    if (validation.data.college !== undefined) updateData.college = validation.data.college
    if (validation.data.degree !== undefined) updateData.degree = validation.data.degree
    if (validation.data.graduationYear !== undefined) updateData.graduation_year = validation.data.graduationYear
    if (validation.data.role !== undefined) updateData.role = validation.data.role
    if (validation.data.resumeUrl !== undefined) updateData.resume_url = validation.data.resumeUrl || null
    if (validation.data.portfolioUrl !== undefined) updateData.portfolio_url = validation.data.portfolioUrl || null
    if (validation.data.message !== undefined) updateData.message = validation.data.message

    const { data: updatedApplication, error: updateError } = await supabaseAdmin
      .from('internship_applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Internship update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update internship application' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: updatedApplication })
  } catch (error) {
    console.error('Internship update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update internship application' },
      { status: 500 }
    )
  }
}

// DELETE /api/internships/[id] - Delete an internship application (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 5, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to delete internship applications')

    const { id } = await params
    const { data: application, error: findError } = await supabaseAdmin
      .from('internship_applications')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (findError || !application) return notFoundResponse('Internship application')

    const { error: deleteError } = await supabaseAdmin
      .from('internship_applications')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Internship delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete internship application' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Internship application deleted successfully',
    })
  } catch (error) {
    console.error('Internship delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete internship application' },
      { status: 500 }
    )
  }
}
