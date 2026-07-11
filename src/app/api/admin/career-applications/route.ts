import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAdmin, supabaseAdmin, isConfigured } from '@/lib/supabase'

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
    const careerId = searchParams.get('career_id')

    let query = supabaseAdmin
      .from('job_applications')
      .select('*, career:careers(id, title, department, location, type)')
      .order('created_at', { ascending: false })

    if (careerId) {
      query = query.eq('career_id', careerId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Admin career applications list error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch applications.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Admin career applications GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch applications.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
      id: z.string().min(1, 'ID is required'),
      status: z.enum(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { id, status } = validationResult.data

    const { data, error } = await supabaseAdmin
      .from('job_applications')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Admin career application update error:', error)
      return NextResponse.json({ success: false, error: 'Failed to update application.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Admin career applications PUT error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update application.' }, { status: 500 })
  }
}
