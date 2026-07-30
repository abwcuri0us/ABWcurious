import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { randomUUID } from 'crypto'

/**
 * /api/career-applications — Admin & management route for job applications.
 *
 * This is NOT a duplicate of /api/careers/apply. The routes serve different purposes:
 * - /api/careers/apply: Canonical user-facing application endpoint (FormData, resume file
 *   upload to Supabase Storage, CSRF-protected). That is the primary endpoint for frontend.
 * - /api/career-applications: Admin/editor management route providing GET (with filtering
 *   by userId/careerId, admin can see all with profile joins), POST (JSON-based apply
 *   without file upload), PATCH (admin updates application status), and DELETE (withdraw).
 */

// --- Valid status values ---

const VALID_STATUSES = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'] as const

function isAdmin(role: string): boolean {
  return ['admin', 'editor'].includes(role)
}

// --- GET: List applications ---

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filterUserId = searchParams.get('userId')
    const filterCareerId = searchParams.get('careerId')

    let query = supabaseAdmin
      .from('job_applications')
      .select('*, profile:profiles(id, name, email, avatar), career:careers(id, title, department, location, type)')
      .order('created_at', { ascending: false })

    if (isAdmin(user.role)) {
      // Admin/editor can see all; optionally filter by userId or careerId
      if (filterUserId) query = query.eq('user_id', filterUserId)
      if (filterCareerId) query = query.eq('career_id', filterCareerId)
    } else {
      // Regular user can only see their own applications
      query = query.eq('user_id', user.id)
      if (filterCareerId) query = query.eq('career_id', filterCareerId)
    }

    const { data: applications, error } = await query

    if (error) {
      console.error('Career applications list error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch applications.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: applications })
  } catch (error) {
    console.error('Career applications list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch applications.' }, { status: 500 })
  }
}

// --- POST: Apply for a job ---

const applySchema = z.object({
  careerId: z.string().min(1, 'Career ID is required'),
  coverLetter: z.string().optional(),
  resumeUrl: z.string().url('Invalid resume URL').optional().or(z.literal('')),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 })
    }

    // Rate limit: 5 applications per minute per user
    const ip = getClientIp(request)
    const rateLimitResult = rateLimit(`career-app:${user.id}:${ip}`, {
      limit: 5,
      windowMs: 60_000,
    })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const body = await request.json()
    const validationResult = applySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 },
      )
    }

    const { careerId, coverLetter, resumeUrl } = validationResult.data

    // Check career exists and is active
    const { data: career, error: careerError } = await supabaseAdmin
      .from('careers')
      .select('*')
      .eq('id', careerId)
      .maybeSingle()

    if (careerError || !career) {
      return NextResponse.json({ success: false, error: 'Career listing not found.' }, { status: 404 })
    }
    if (!career.is_active) {
      return NextResponse.json({ success: false, error: 'This position is no longer accepting applications.' }, { status: 400 })
    }

    // Check user hasn't already applied
    const { data: existingApplication } = await supabaseAdmin
      .from('job_applications')
      .select('id')
      .eq('user_id', user.id)
      .eq('career_id', careerId)
      .maybeSingle()

    if (existingApplication) {
      return NextResponse.json({ success: false, error: 'You have already applied for this position.' }, { status: 409 })
    }

    const { data: application, error: insertError } = await supabaseAdmin
      .from('job_applications')
      .insert([{
        id: randomUUID(),
        user_id: user.id,
        career_id: careerId,
        name: user.name ?? user.email.split('@')[0],
        email: user.email,
        cover_letter: coverLetter || null,
        resume_url: resumeUrl || null,
        status: 'pending',
      }])
      .select('*, profile:profiles(id, name, email, avatar), career:careers(id, title, department, location, type)')
      .single()

    if (insertError) {
      console.error('Career application create error:', insertError)
      return NextResponse.json({ success: false, error: 'Failed to submit application.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: application }, { status: 201 })
  } catch (error) {
    console.error('Career application create error:', error)
    return NextResponse.json({ success: false, error: 'Failed to submit application.' }, { status: 500 })
  }
}

// --- PATCH: Update application status (admin only) ---

const updateStatusSchema = z.object({
  id: z.string().min(1, 'Application ID is required'),
  status: z.enum(VALID_STATUSES, { message: `Status must be one of: ${VALID_STATUSES.join(', ')}` }),
})

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 })
    }

    if (!isAdmin(user.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin access required.' }, { status: 403 })
    }

    const body = await request.json()
    const validationResult = updateStatusSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 },
      )
    }

    const { id, status } = validationResult.data

    // Verify application exists
    const { data: existing, error: findError } = await supabaseAdmin
      .from('job_applications')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (findError || !existing) {
      return NextResponse.json({ success: false, error: 'Application not found.' }, { status: 404 })
    }

    const { data: application, error: updateError } = await supabaseAdmin
      .from('job_applications')
      .update({ status })
      .eq('id', id)
      .select('*, profile:profiles(id, name, email, avatar), career:careers(id, title, department, location, type)')
      .single()

    if (updateError) {
      console.error('Career application update error:', updateError)
      return NextResponse.json({ success: false, error: 'Failed to update application.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: application })
  } catch (error) {
    console.error('Career application update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update application.' }, { status: 500 })
  }
}

// --- DELETE: Withdraw / delete application ---

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'Application ID is required.' }, { status: 400 })
    }

    // Find the application
    const { data: application, error: findError } = await supabaseAdmin
      .from('job_applications')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (findError || !application) {
      return NextResponse.json({ success: false, error: 'Application not found.' }, { status: 404 })
    }

    // Regular users can only withdraw their own; admins can delete any
    if (!isAdmin(user.role) && application.user_id !== user.id) {
      return NextResponse.json({ success: false, error: 'You can only withdraw your own application.' }, { status: 403 })
    }

    const { error: deleteError } = await supabaseAdmin
      .from('job_applications')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Career application delete error:', deleteError)
      return NextResponse.json({ success: false, error: 'Failed to withdraw application.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Application withdrawn.' })
  } catch (error) {
    console.error('Career application delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to withdraw application.' }, { status: 500 })
  }
}
