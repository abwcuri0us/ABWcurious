import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, notificationsDb, getUserFromToken } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// Helper to verify admin/editor access from token
async function verifyAdminAccess(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  const cookieToken = request.cookies.get('abwcurious_token')?.value
  const accessToken = token || cookieToken

  if (!accessToken) return { authorized: false, user: null }

  const user = await getUserFromToken(accessToken)
  if (!user || !['admin', 'editor'].includes(user.role)) {
    return { authorized: false, user: null }
  }

  return { authorized: true, user }
}

// POST: Send notification to all users about an event/newsletter
export async function POST(request: NextRequest) {
  try {
    const { authorized, user } = await verifyAdminAccess(request)
    if (!authorized || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 5, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const body = await request.json()
    const schema = z.object({
      message: z.string().min(5).max(1000),
      eventId: z.string().optional(),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed.' }, { status: 400 })
    }

    const { message, eventId } = validationResult.data

    // Get all users from profiles table
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('id')

    if (usersError || !users) {
      return NextResponse.json({ success: false, error: 'Failed to fetch users.' }, { status: 500 })
    }

    // Create notification for each user (batch insert)
    const notifications = users.map((u: { id: string }) => ({
      user_id: u.id,
      title: 'Event Notification',
      message,
      type: 'event_reminder',
      is_read: false,
    }))

    const { error: insertError } = await supabaseAdmin
      .from('notifications')
      .insert(notifications)

    if (insertError) {
      console.error('Newsletter notification error:', insertError)
      return NextResponse.json({ success: false, error: 'Failed to send notifications.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${users.length} users.`,
      data: { recipientCount: users.length },
    })
  } catch (error) {
    console.error('Admin newsletter error:', error)
    return NextResponse.json({ success: false, error: 'Failed to send notification.' }, { status: 500 })
  }
}
