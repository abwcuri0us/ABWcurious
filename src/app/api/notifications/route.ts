import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getCurrentUser, verifyAdmin, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// GET: Get user's notifications
export async function GET(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: true, data: [], pagination: { total: 0, unread: 0, limit: 50, offset: 0 } })
    }

    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const type = searchParams.get('type')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    let query = supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    if (type && ['info', 'warning', 'success', 'error', 'announcement'].includes(type)) {
      query = query.eq('type', type)
    }

    const { data: notifications, count, error } = await query

    if (error) {
      console.error('Notifications fetch error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to fetch notifications.' }, { status: 500 })
    }

    // Count unread
    const { count: unreadCount, error: unreadError } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .eq('is_read', false)

    if (unreadError) {
      console.error('Unread count error:', unreadError.message)
    }

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        total: count || 0,
        unread: unreadCount || 0,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications.' }, { status: 500 })
  }
}

// PATCH: Mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Service temporarily unavailable. Please try again later.' }, { status: 503 })
    }

    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const body = await request.json()
    const schema = z.object({
      id: z.string().optional(),
      mark_all: z.boolean().optional(),
      // Support notificationIds array format (from NotificationBell)
      notificationIds: z.array(z.string()).optional(),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validationResult.error.issues }, { status: 400 })
    }

    const { id, mark_all, notificationIds } = validationResult.data

    // Handle notificationIds array (from NotificationBell)
    if (notificationIds && notificationIds.length > 0) {
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .in('id', notificationIds)

      if (error) {
        console.error('Mark notificationIds read error:', error.message)
        return NextResponse.json({ success: false, error: 'Failed to mark notifications as read.' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: `${notificationIds.length} notification(s) marked as read.` })
    }

    if (mark_all) {
      // Mark all user's notifications as read
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .eq('is_read', false)

      if (error) {
        console.error('Mark all read error:', error.message)
        return NextResponse.json({ success: false, error: 'Failed to mark notifications as read.' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'All notifications marked as read.' })
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Notification ID or mark_all is required.' }, { status: 400 })
    }

    // Mark single notification as read
    const { data: notification, error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .select()
      .single()

    if (error) {
      console.error('Mark read error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to mark notification as read.' }, { status: 500 })
    }

    if (!notification) {
      return NextResponse.json({ success: false, error: 'Notification not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: notification })
  } catch (error) {
    console.error('Notification mark read error:', error)
    return NextResponse.json({ success: false, error: 'Failed to mark notification as read.' }, { status: 500 })
  }
}

// POST: Create a notification (admin only) or send bulk notification
export async function POST(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 20, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const body = await request.json()

    const singleSchema = z.object({
      user_id: z.string().uuid().optional().nullable(),
      title: z.string().min(1, 'Title is required').max(200),
      message: z.string().min(1, 'Message is required').max(2000),
      type: z.enum(['info', 'warning', 'success', 'error', 'announcement']).default('info'),
      link: z.string().max(500).optional().nullable(),
    })

    const bulkSchema = z.object({
      bulk: z.literal(true),
      user_ids: z.array(z.string().uuid()).min(1).max(500),
      title: z.string().min(1).max(200),
      message: z.string().min(1).max(2000),
      type: z.enum(['info', 'warning', 'success', 'error', 'announcement']).default('info'),
      link: z.string().max(500).optional().nullable(),
    })

    // Try bulk first
    const bulkResult = bulkSchema.safeParse(body)
    if (bulkResult.success) {
      const { user_ids, title, message, type, link } = bulkResult.data

      const insertData = user_ids.map(uid => ({
        user_id: uid,
        title,
        message,
        type,
        link: link || null,
        is_read: false,
      }))

      const { data: notifications, error } = await supabaseAdmin
        .from('notifications')
        .insert(insertData)
        .select()

      if (error) {
        console.error('Bulk notification create error:', error.message)
        return NextResponse.json({ success: false, error: 'Failed to send bulk notifications.' }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: notifications, message: `Sent ${notifications.length} notifications.` }, { status: 201 })
    }

    // Try single notification
    const singleResult = singleSchema.safeParse(body)
    if (!singleResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: singleResult.error.issues }, { status: 400 })
    }

    const { user_id, title, message, type, link } = singleResult.data

    // If user_id is null, this is a broadcast notification
    const insertData: Record<string, unknown> = {
      user_id: user_id || null,
      title,
      message,
      type,
      link: link || null,
      is_read: false,
    }

    const { data: notification, error } = await supabaseAdmin
      .from('notifications')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Notification create error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to create notification.' }, { status: 500 })
    }

    const isBroadcast = !user_id
    return NextResponse.json({
      success: true,
      data: notification,
      message: isBroadcast ? 'Broadcast notification sent.' : 'Notification sent.',
    }, { status: 201 })
  } catch (error) {
    console.error('Notification create error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create notification.' }, { status: 500 })
  }
}
