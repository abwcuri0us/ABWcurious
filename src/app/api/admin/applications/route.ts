import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyAdmin, isConfigured } from '@/lib/supabase'
import { z } from 'zod'

// GET: List all job applications (admin only)
export async function GET(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const career_id = searchParams.get('career_id')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    let query = supabaseAdmin
      .from('job_applications')
      .select('*, career:careers(id, title, department, location, type), profile:profiles(id, name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'].includes(status)) {
      query = query.eq('status', status)
    }

    if (career_id) {
      query = query.eq('career_id', career_id)
    }

    const { data: applications, count, error } = await query

    if (error) {
      console.error('Admin applications fetch error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to fetch applications.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: applications,
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Admin applications list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch applications.' }, { status: 500 })
  }
}

// PATCH: Update job application status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const body = await request.json()
    const schema = z.object({
      id: z.string().uuid('Invalid application ID'),
      status: z.enum(['reviewed', 'shortlisted', 'rejected', 'hired']),
      notes: z.string().max(2000).optional(),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validationResult.error.issues }, { status: 400 })
    }

    const { id, status, notes } = validationResult.data

    const updateData: Record<string, unknown> = { status }
    if (notes !== undefined) updateData.notes = notes

    const { data: application, error } = await supabaseAdmin
      .from('job_applications')
      .update(updateData)
      .eq('id', id)
      .select('*, career:careers(id, title, department), profile:profiles(id, name, email)')
      .single()

    if (error) {
      console.error('Application update error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to update application.' }, { status: 500 })
    }

    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found.' }, { status: 404 })
    }

    // Create notification for the applicant
    const notifType = status === 'hired' ? 'success' : status === 'rejected' ? 'error' : 'info'
    const notifTitle = status === 'hired' ? 'Congratulations!' : status === 'rejected' ? 'Application Update' : 'Application Status Update'
    const notifMessage = status === 'hired'
      ? `Congratulations! You have been hired for the ${application.career?.title || 'position'}.`
      : status === 'rejected'
        ? `Your application for ${application.career?.title || 'the position'} has been reviewed. We appreciate your interest.`
        : `Your application for ${application.career?.title || 'the position'} has been updated to: ${status}.`

    await supabaseAdmin
      .from('notifications')
      .insert([{
        user_id: application.user_id,
        title: notifTitle,
        message: notifMessage,
        type: notifType,
        is_read: false,
      }])

    return NextResponse.json({ success: true, data: application })
  } catch (error) {
    console.error('Application update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update application.' }, { status: 500 })
  }
}
