import { NextRequest, NextResponse } from 'next/server'
import { notificationsDb } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import { getUserFromRequest } from '@/lib/auth-helpers'

// GET: List user's notifications
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    const notifications = await notificationsDb.findByUserId(user!.id)

    // Also return unread count
    const unreadCount = notifications.filter((n) => !n.is_read).length

    return NextResponse.json({ success: true, data: notifications, unreadCount })
  } catch (err) {
    console.error('Notifications GET error:', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications.' }, { status: 500 })
  }
}

const markReadSchema = z.object({
  notificationId: z.string().optional(),
  markAll: z.boolean().optional(),
})

// PUT: Mark notification(s) as read
export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    const body = await request.json()
    const validation = markReadSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validation.error.issues }, { status: 400 })
    }

    const { notificationId, markAll } = validation.data

    if (markAll) {
      const success = await notificationsDb.markAllAsRead(user!.id)
      if (!success) {
        return NextResponse.json({ success: false, error: 'Failed to mark notifications as read.' }, { status: 500 })
      }
      return NextResponse.json({ success: true, message: 'All notifications marked as read.' })
    }

    if (notificationId) {
      const success = await notificationsDb.markAsRead(notificationId)
      if (!success) {
        return NextResponse.json({ success: false, error: 'Failed to mark notification as read.' }, { status: 500 })
      }
      return NextResponse.json({ success: true, message: 'Notification marked as read.' })
    }

    return NextResponse.json({ success: false, error: 'Provide notificationId or markAll.' }, { status: 400 })
  } catch (err) {
    console.error('Notifications PUT error:', err)
    return NextResponse.json({ success: false, error: 'Failed to update notifications.' }, { status: 500 })
  }
}
