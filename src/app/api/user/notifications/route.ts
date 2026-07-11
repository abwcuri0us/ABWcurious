import { NextRequest, NextResponse } from 'next/server'
import { notificationsDb, getUserFromToken } from '@/lib/supabase'
import { z } from 'zod'

// Helper to get user from request
async function getUserFromRequest(request: NextRequest) {
  const cookieToken = request.cookies.get('abwcurious_token')?.value
  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader?.replace('Bearer ', '')
  const accessToken = cookieToken || headerToken

  if (!accessToken) {
    return { user: null, error: NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 }) }
  }

  const user = await getUserFromToken(accessToken)
  if (!user) {
    return { user: null, error: NextResponse.json({ success: false, error: 'Invalid or expired token.' }, { status: 401 }) }
  }

  return { user, error: null }
}

// GET: List user's notifications
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    const notifications = await notificationsDb.listByUser(user!.id)

    // Also return unread count
    const unreadCount = notifications.filter((n: { is_read: boolean }) => !n.is_read).length

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
      await notificationsDb.markAllRead(user!.id)
      return NextResponse.json({ success: true, message: 'All notifications marked as read.' })
    }

    if (notificationId) {
      await notificationsDb.markRead(notificationId)
      return NextResponse.json({ success: true, message: 'Notification marked as read.' })
    }

    return NextResponse.json({ success: false, error: 'Provide notificationId or markAll.' }, { status: 400 })
  } catch (err) {
    console.error('Notifications PUT error:', err)
    return NextResponse.json({ success: false, error: 'Failed to update notifications.' }, { status: 500 })
  }
}
