import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getCurrentUser, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { uploadResume } from '@/lib/storage'
import { z } from 'zod'
import { validateCsrfRequest } from '@/lib/csrf'

/**
 * /api/careers/apply — Canonical user-facing career application endpoint (with file upload).
 *
 * POST: Authenticated user applies to a career listing using FormData (supports resume file
 *   upload to Supabase Storage, CSRF-protected). This is the primary endpoint for the
 *   frontend application form with file upload support.
 *
 * GET: Returns the authenticated user's own job applications.
 *
 * NOTE: /api/career-applications is a separate admin & management route that provides
 * GET (admin-filtered listing), POST (JSON-based apply without file upload), PATCH (admin
 * status updates), and DELETE (withdraw). It is NOT a duplicate of this endpoint.
 */

// POST: Apply to a career listing (authenticated users, with resume upload to Supabase Storage)
export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfRequest(request)) {
      return NextResponse.json({ success: false, error: 'Invalid CSRF token' }, { status: 403 })
    }

    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Service temporarily unavailable. Please try again later.' }, { status: 503 })
    }

    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 3, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    // Parse as FormData for file upload support
    const formData = await request.formData()
    const careerId = formData.get('career_id') as string | null
    const coverLetter = formData.get('cover_letter') as string | null
    const resumeFile = formData.get('resume') as File | null

    const schema = z.object({
      career_id: z.string().uuid('Invalid career ID'),
      cover_letter: z.string().max(5000).optional().nullable(),
    })

    const validationResult = schema.safeParse({
      career_id: careerId,
      cover_letter: coverLetter,
    })

    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validationResult.error.issues }, { status: 400 })
    }

    const { career_id } = validationResult.data

    // Verify career exists and is active
    const { data: career, error: careerError } = await supabaseAdmin
      .from('careers')
      .select('id, title, is_active')
      .eq('id', career_id)
      .single()

    if (careerError || !career) {
      return NextResponse.json({ success: false, error: 'Career listing not found.' }, { status: 404 })
    }

    if (!career.is_active) {
      return NextResponse.json({ success: false, error: 'This position is no longer accepting applications.' }, { status: 400 })
    }

    // Check if already applied
    const { data: existing } = await supabaseAdmin
      .from('job_applications')
      .select('id')
      .eq('career_id', career_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ success: false, error: 'You have already applied for this position.' }, { status: 409 })
    }

    // Upload resume to Supabase Storage if provided
    let resumeUrl: string | null = null
    if (resumeFile && resumeFile.size > 0) {
      // Validate file size (max 5MB)
      if (resumeFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ success: false, error: 'Resume file must be under 5MB.' }, { status: 400 })
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(resumeFile.type)) {
        return NextResponse.json({ success: false, error: 'Resume must be a PDF or Word document.' }, { status: 400 })
      }

      try {
        const buffer = Buffer.from(await resumeFile.arrayBuffer())
        const result = await uploadResume(buffer, resumeFile.name)
        resumeUrl = result.url
      } catch (uploadError) {
        console.error('Resume upload error:', uploadError)
        return NextResponse.json({ success: false, error: 'Failed to upload resume. Please try again.' }, { status: 500 })
      }
    }

    // Create job application
    const insertData: Record<string, unknown> = {
      career_id,
      user_id: user.id,
      name: user.name ?? user.email.split('@')[0],
      email: user.email,
      status: 'pending',
    }

    if (coverLetter) insertData.cover_letter = coverLetter
    if (resumeUrl) insertData.resume_url = resumeUrl

    const { data: application, error } = await supabaseAdmin
      .from('job_applications')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Job application create error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to submit application.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: application, message: 'Application submitted successfully.' }, { status: 201 })
  } catch (error) {
    console.error('Job application error:', error)
    return NextResponse.json({ success: false, error: 'Failed to submit application.' }, { status: 500 })
  }
}

// GET: Get user's job applications
export async function GET(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: true, data: [] })
    }

    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const { data: applications, error } = await supabaseAdmin
      .from('job_applications')
      .select('*, career:careers(id, title, department, location, type)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('User applications fetch error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to fetch applications.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: applications })
  } catch (error) {
    console.error('User applications error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch applications.' }, { status: 500 })
  }
}
