import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { randomUUID } from 'crypto'
import { validateCsrfRequest } from '@/lib/csrf'

const sendMessageSchema = z.object({
  receiver_id: z.string().min(1, 'Receiver ID is required'),
  subject: z.string().max(200).optional(),
  message: z.string().min(1, 'Message is required').max(5000),
})

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('user_messages')
      .select('*, sender:profiles!user_messages_sender_id_fkey(id, name, email, avatar), receiver:profiles!user_messages_receiver_id_fkey(id, name, email, avatar)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Messages list error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch messages.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Messages GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch messages.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfRequest(request)) {
      return NextResponse.json({ success: false, error: 'Invalid CSRF token' }, { status: 403 })
    }

    const ip = getClientIp(request)
    const rateLimitResult = rateLimit(ip, { limit: 20, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = sendMessageSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { receiver_id, subject, message } = validationResult.data

    // Verify receiver exists
    const { data: receiver, error: receiverError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', receiver_id)
      .maybeSingle()

    if (receiverError || !receiver) {
      return NextResponse.json({ success: false, error: 'Receiver not found.' }, { status: 404 })
    }

    const { data: msg, error } = await supabaseAdmin
      .from('user_messages')
      .insert([{
        id: randomUUID(),
        sender_id: user.id,
        receiver_id,
        subject: subject ?? null,
        message,
        is_read: false,
      }])
      .select()
      .single()

    if (error) {
      console.error('Message create error:', error)
      return NextResponse.json({ success: false, error: 'Failed to send message.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: msg }, { status: 201 })
  } catch (error) {
    console.error('Messages POST error:', error)
    return NextResponse.json({ success: false, error: 'Failed to send message.' }, { status: 500 })
  }
}
