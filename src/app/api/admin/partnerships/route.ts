import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyAdmin, isConfigured } from '@/lib/supabase'
import { z } from 'zod'

// GET: List all partnership applications (admin only)
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
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    let query = supabaseAdmin
      .from('partnerships')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('status', status)
    }

    const { data: partnerships, count, error } = await query

    if (error) {
      console.error('Admin partnerships fetch error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to fetch partnerships.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: partnerships,
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Admin partnerships list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch partnerships.' }, { status: 500 })
  }
}

// PATCH: Approve or reject a partnership application (admin only)
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
      id: z.string().uuid('Invalid partnership ID'),
      status: z.enum(['approved', 'rejected']),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validationResult.error.issues }, { status: 400 })
    }

    const { id, status } = validationResult.data

    const { data: partnership, error } = await supabaseAdmin
      .from('partnerships')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Partnership update error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to update partnership.' }, { status: 500 })
    }

    if (!partnership) {
      return NextResponse.json({ success: false, error: 'Partnership application not found.' }, { status: 404 })
    }

    // Create notification for the partnership contact (if they have an account)
    const { data: contactUser } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', partnership.email)
      .maybeSingle()

    if (contactUser) {
      await supabaseAdmin
        .from('notifications')
        .insert([{
          user_id: contactUser.id,
          title: status === 'approved' ? 'Partnership Approved' : 'Partnership Update',
          message: status === 'approved'
            ? `Your partnership application with ${partnership.company_name} has been approved!`
            : `Your partnership application with ${partnership.company_name} has been reviewed. Thank you for your interest.`,
          type: status === 'approved' ? 'success' : 'info',
          is_read: false,
        }])
    }

    return NextResponse.json({ success: true, data: partnership })
  } catch (error) {
    console.error('Partnership update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update partnership.' }, { status: 500 })
  }
}
