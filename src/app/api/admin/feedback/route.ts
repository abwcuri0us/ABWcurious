import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, verifyAdmin, isConfigured, feedbacksDb } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const { data, error } = await supabaseAdmin
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Admin feedback list error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch feedback.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Admin feedback GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch feedback.' }, { status: 500 })
  }
}

// PATCH: Update feedback status (admin only)
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
      id: z.string().min(1, 'ID is required'),
      status: z.enum(['open', 'new', 'read', 'in_progress', 'resolved', 'closed']).optional(),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { id, status } = validationResult.data

    const updateData: Record<string, unknown> = {}
    if (status !== undefined) updateData.status = status

    const updated = await feedbacksDb.update(id, updateData)

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Admin feedback PATCH error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update feedback.' }, { status: 500 })
  }
}

// DELETE: Remove feedback (admin only)
export async function DELETE(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Feedback ID is required.' }, { status: 400 })
    }

    await feedbacksDb.delete(id)

    return NextResponse.json({ success: true, message: 'Feedback deleted.' })
  } catch (error) {
    console.error('Admin feedback DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete feedback.' }, { status: 500 })
  }
}
