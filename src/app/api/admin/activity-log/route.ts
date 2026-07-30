import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyAdmin, isConfigured } from '@/lib/supabase'
import { logActivity } from '@/lib/activity-logger'

/**
 * GET /api/admin/activity-log
 * Fetch all activity logs (admin only)
 * Supports filtering by category, date range, and search
 */
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
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = (page - 1) * limit

    // Build query
    let query = supabaseAdmin
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`action.ilike.%${search}%,details.ilike.%${search}%,user_email.ilike.%${search}%`)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Activity log GET error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch activity logs.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Activity log GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch activity logs.' }, { status: 500 })
  }
}

/**
 * POST /api/admin/activity-log
 * Create a new activity log entry (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized, user: adminUser } = await verifyAdmin(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const body = await request.json()
    const { category, action, details, userId, userEmail } = body

    if (!action) {
      return NextResponse.json({ success: false, error: 'Action is required.' }, { status: 400 })
    }

    await logActivity(
      category || 'system',
      action,
      details,
      userId || adminUser?.id,
      userEmail || adminUser?.email,
      request
    )

    return NextResponse.json({ success: true, message: 'Activity logged.' }, { status: 201 })
  } catch (error) {
    console.error('Activity log POST error:', error)
    return NextResponse.json({ success: false, error: 'Failed to log activity.' }, { status: 500 })
  }
}
