import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyAdmin, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { sendNotificationEmail, sendNewsletterBatch } from '@/lib/email'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// HTML escape helper (local, not exported from email.ts)
// ---------------------------------------------------------------------------
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// ---------------------------------------------------------------------------
// Notification HTML content builder
// ---------------------------------------------------------------------------
function buildNotificationHtml(title: string, message: string, link?: string | null): string {
  const linkUrl = link || 'https://abwcurious.com'
  return `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #111827;">${escapeHtml(title)}</h2>
    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.7; color: #374151;">${escapeHtml(message)}</p>
    <p style="margin: 0;"><a href="${escapeHtml(linkUrl)}" style="display: inline-block; padding: 10px 24px; background-color: #0891b2; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">View on ABWcurious &rarr;</a></p>
  `
}

// POST: Send notification to user(s) (admin only)
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

    // --- Schemas (order matters for parsing) ---

    const broadcastSchema = z.object({
      broadcast: z.literal(true),
      title: z.string().min(1).max(200),
      message: z.string().min(1).max(2000),
      type: z.enum(['info', 'warning', 'success', 'error', 'announcement']).default('announcement'),
      link: z.string().max(500).optional().nullable(),
      send_email: z.boolean().default(true),
    })

    const roleTargetSchema = z.object({
      target_type: z.literal('role'),
      role: z.enum(['admin', 'editor', 'author', 'user']),
      title: z.string().min(1).max(200),
      message: z.string().min(1).max(2000),
      type: z.enum(['info', 'warning', 'success', 'error', 'announcement']).default('info'),
      link: z.string().max(500).optional().nullable(),
      send_email: z.boolean().default(true),
    })

    const bulkSchema = z.object({
      bulk: z.literal(true),
      user_ids: z.array(z.string().uuid()).min(1, 'At least one user ID is required').max(500, 'Maximum 500 users per bulk notification'),
      title: z.string().min(1).max(200),
      message: z.string().min(1).max(2000),
      type: z.enum(['info', 'warning', 'success', 'error', 'announcement']).default('info'),
      link: z.string().max(500).optional().nullable(),
    })

    const singleSchema = z.object({
      user_id: z.string().uuid().optional().nullable(),
      title: z.string().min(1, 'Title is required').max(200),
      message: z.string().min(1, 'Message is required').max(2000),
      type: z.enum(['info', 'warning', 'success', 'error', 'announcement']).default('info'),
      link: z.string().max(500).optional().nullable(),
    })

    // =========================================================================
    // 1. BROADCAST — notify ALL users + optional email
    // =========================================================================
    const broadcastResult = broadcastSchema.safeParse(body)
    if (broadcastResult.success) {
      const { title, message, type, link, send_email } = broadcastResult.data

      // Fetch ALL users
      const { data: profiles, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, name')

      if (fetchError) {
        console.error('Broadcast: failed to fetch profiles:', fetchError.message)
        return NextResponse.json({ success: false, error: 'Failed to fetch user profiles for broadcast.' }, { status: 500 })
      }

      if (!profiles || profiles.length === 0) {
        return NextResponse.json({ success: true, data: [], message: 'No users found to notify.', stats: { totalUsers: 0, notificationsCreated: 0, emailsSent: 0, emailErrors: [] } }, { status: 201 })
      }

      // Create individual notification rows (batch insert, max 500 at a time)
      const allInsertData = profiles.map(p => ({
        user_id: p.id,
        title,
        message,
        type,
        link: link || null,
        is_read: false,
      }))

      let createdNotifications: unknown[] = []
      const INSERT_BATCH = 500

      for (let i = 0; i < allInsertData.length; i += INSERT_BATCH) {
        const batch = allInsertData.slice(i, i + INSERT_BATCH)
        const { data, error } = await supabaseAdmin
          .from('notifications')
          .insert(batch)
          .select()

        if (error) {
          console.error(`Broadcast: batch insert error (offset ${i}):`, error.message)
          return NextResponse.json({ success: false, error: 'Failed to create notifications for some users.' }, { status: 500 })
        }
        if (data) createdNotifications.push(...data)
      }

      // Send emails if requested
      let emailsSent = 0
      const emailErrors: { email: string; error: string }[] = []

      if (send_email) {
        const verifiedEmails = profiles
          .map(p => p.email)
          .filter((email): email is string => !!email)

        try {
          const notificationHtml = buildNotificationHtml(title, message, link)
          const result = await sendNewsletterBatch(verifiedEmails, title, notificationHtml)
          emailsSent = result.sentCount
          emailErrors.push(...result.errors)
        } catch (emailErr) {
          console.error('Broadcast: email sending failed:', emailErr)
          const errorMsg = emailErr instanceof Error ? emailErr.message : String(emailErr)
          emailErrors.push({ email: 'batch', error: errorMsg })
        }
      }

      return NextResponse.json({
        success: true,
        data: createdNotifications,
        message: `Broadcast sent to ${profiles.length} users. ${emailsSent} email${emailsSent !== 1 ? 's' : ''} sent.`,
        stats: {
          totalUsers: profiles.length,
          notificationsCreated: createdNotifications.length,
          emailsSent,
          emailErrors,
        },
      }, { status: 201 })
    }

    // =========================================================================
    // 2. ROLE-BASED TARGETING — notify users with a specific role + optional email
    // =========================================================================
    const roleTargetResult = roleTargetSchema.safeParse(body)
    if (roleTargetResult.success) {
      const { role, title, message, type, link, send_email } = roleTargetResult.data

      // Fetch users with the specified role
      const { data: profiles, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, name')
        .eq('role', role)

      if (fetchError) {
        console.error('Role-target: failed to fetch profiles:', fetchError.message)
        return NextResponse.json({ success: false, error: 'Failed to fetch user profiles.' }, { status: 500 })
      }

      if (!profiles || profiles.length === 0) {
        return NextResponse.json({ success: true, data: [], message: `No users found with role '${role}'.`, stats: { totalUsers: 0, notificationsCreated: 0, emailsSent: 0, emailErrors: [] } }, { status: 201 })
      }

      // Create individual notification rows (batch insert, max 500 at a time)
      const allInsertData = profiles.map(p => ({
        user_id: p.id,
        title,
        message,
        type,
        link: link || null,
        is_read: false,
      }))

      let createdNotifications: unknown[] = []
      const INSERT_BATCH = 500

      for (let i = 0; i < allInsertData.length; i += INSERT_BATCH) {
        const batch = allInsertData.slice(i, i + INSERT_BATCH)
        const { data, error } = await supabaseAdmin
          .from('notifications')
          .insert(batch)
          .select()

        if (error) {
          console.error(`Role-target: batch insert error (offset ${i}):`, error.message)
          return NextResponse.json({ success: false, error: 'Failed to create notifications for some users.' }, { status: 500 })
        }
        if (data) createdNotifications.push(...data)
      }

      // Send emails if requested (individual sends for role-based, smaller lists)
      let emailsSent = 0
      const emailErrors: { email: string; error: string }[] = []

      if (send_email) {
        const verifiedEmails = profiles
          .map(p => p.email)
          .filter((email): email is string => !!email)

        try {
          const notificationHtml = buildNotificationHtml(title, message, link)
          const result = await sendNewsletterBatch(verifiedEmails, title, notificationHtml)
          emailsSent = result.sentCount
          emailErrors.push(...result.errors)
        } catch (emailErr) {
          console.error('Role-target: email sending failed:', emailErr)
          const errorMsg = emailErr instanceof Error ? emailErr.message : String(emailErr)
          emailErrors.push({ email: 'batch', error: errorMsg })
        }
      }

      return NextResponse.json({
        success: true,
        data: createdNotifications,
        message: `Notification sent to ${profiles.length} ${role}${profiles.length !== 1 ? 's' : ''}. ${emailsSent} email${emailsSent !== 1 ? 's' : ''} sent.`,
        stats: {
          totalUsers: profiles.length,
          notificationsCreated: createdNotifications.length,
          emailsSent,
          emailErrors,
        },
      }, { status: 201 })
    }

    // =========================================================================
    // 3. BULK — notify specific user IDs
    // =========================================================================
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
        console.error('Bulk notification error:', error.message)
        return NextResponse.json({ success: false, error: 'Failed to send bulk notifications.' }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: notifications, message: `Sent ${notifications.length} notifications.` }, { status: 201 })
    }

    // =========================================================================
    // 4. SINGLE — notify one user (or system with user_id: null)
    // =========================================================================
    const singleResult = singleSchema.safeParse(body)
    if (!singleResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed. Provide a notification, bulk notification, role-targeted, or broadcast.', details: singleResult.error.issues }, { status: 400 })
    }

    const { user_id, title, message, type, link } = singleResult.data

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

    return NextResponse.json({ success: true, data: notification }, { status: 201 })
  } catch (error) {
    console.error('Admin notification create error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create notification.' }, { status: 500 })
  }
}

// GET: List all sent notifications (admin only)
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
    const type = searchParams.get('type')
    const user_id = searchParams.get('user_id')
    const is_read = searchParams.get('is_read')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    let query = supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (type && ['info', 'warning', 'success', 'error', 'announcement'].includes(type)) {
      query = query.eq('type', type)
    }

    if (user_id) {
      query = query.eq('user_id', user_id)
    }

    if (is_read === 'true') {
      query = query.eq('is_read', true)
    } else if (is_read === 'false') {
      query = query.eq('is_read', false)
    }

    const { data: notifications, count, error } = await query

    if (error) {
      console.error('Admin notifications fetch error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to fetch notifications.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Admin notifications list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications.' }, { status: 500 })
  }
}

// DELETE: Remove a notification (admin only)
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
      return NextResponse.json({ success: false, error: 'Notification ID is required.' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Notification delete error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to delete notification.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Notification deleted.' })
  } catch (error) {
    console.error('Admin notification delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete notification.' }, { status: 500 })
  }
}