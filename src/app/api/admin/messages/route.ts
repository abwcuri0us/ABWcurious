import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, messagesDb, usersDb, notificationsDb, verifyAccess } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// GET: List conversations or messages
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    const cookieToken = request.cookies.get('abwcurious_token')?.value
    const accessToken = token || cookieToken

    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const { authorized, user } = await verifyAccess(accessToken, ['admin', 'editor'])
    if (!authorized || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 30, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const otherUserId = searchParams.get('userId')

    if (otherUserId) {
      // Get messages between admin and this user
      const msgs = await messagesDb.findConversation(user.id, otherUserId)

      // Mark unread messages as read
      const unreadMsgs = msgs.filter((m) => m.receiver_id === user.id && !m.is_read)
      for (const m of unreadMsgs) {
        await supabaseAdmin.from('messages').update({ is_read: true }).eq('id', m.id)
      }

      return NextResponse.json({ success: true, data: msgs })
    }

    // Get all conversations for admin
    // Fetch all messages where admin is sender or receiver
    const { data: sentMessages } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false })

    const { data: receivedMessages } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false })

    const allMessages = [...(sentMessages || []), ...(receivedMessages || [])]

    // Group by conversation partner
    const conversationMap = new Map<string, {
      userId: string
      lastMessage: string
      lastMessageTime: string
      unread: number
    }>()

    for (const msg of allMessages) {
      const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
      const existing = conversationMap.get(partnerId)
      const msgTime = new Date(msg.created_at).getTime()

      if (!existing || msgTime > new Date(existing.lastMessageTime).getTime()) {
        conversationMap.set(partnerId, {
          userId: partnerId,
          lastMessage: msg.content.substring(0, 100),
          lastMessageTime: msg.created_at,
          unread: existing?.unread || (msg.receiver_id === user.id && !msg.is_read ? 1 : 0),
        })
      } else if (msg.receiver_id === user.id && !msg.is_read) {
        existing.unread++
      }
    }

    // Fetch user info for each conversation partner
    const conversations: {
      userId: string
      userName: string
      userEmail: string
      lastMessage: string
      lastMessageTime: string
      unread: number
    }[] = []
    for (const [partnerId, conv] of conversationMap) {
      const partner = await usersDb.findById(partnerId)
      conversations.push({
        userId: partnerId,
        userName: partner?.name || partner?.email?.split('@')[0] || 'Unknown',
        userEmail: partner?.email || '',
        lastMessage: conv.lastMessage,
        lastMessageTime: conv.lastMessageTime,
        unread: conv.unread,
      })
    }

    // Sort by last message time
    conversations.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())

    return NextResponse.json({ success: true, data: conversations })
  } catch (error) {
    console.error('Admin messages error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch messages.' }, { status: 500 })
  }
}

// POST: Send a message
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    const cookieToken = request.cookies.get('abwcurious_token')?.value
    const accessToken = token || cookieToken

    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const { authorized, user } = await verifyAccess(accessToken, ['admin', 'editor'])
    if (!authorized || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 20, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const body = await request.json()
    const schema = z.object({
      receiverId: z.string(),
      content: z.string().min(1).max(5000),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed.' }, { status: 400 })
    }

    const { receiverId, content } = validationResult.data

    // Create message
    const message = await messagesDb.create({
      sender_id: user.id,
      receiver_id: receiverId,
      content,
      is_read: false,
    })

    if (!message) {
      return NextResponse.json({ success: false, error: 'Failed to send message.' }, { status: 500 })
    }

    // Create notification for the user
    await notificationsDb.create({
      user_id: receiverId,
      title: 'New Message',
      message: `You have a new message from ${user.email.split('@')[0]}`,
      type: 'message',
      is_read: false,
    })

    return NextResponse.json({ success: true, data: message }, { status: 201 })
  } catch (error) {
    console.error('Admin send message error:', error)
    return NextResponse.json({ success: false, error: 'Failed to send message.' }, { status: 500 })
  }
}
