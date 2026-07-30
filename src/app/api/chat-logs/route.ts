import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { unauthorizedResponse, forbiddenResponse } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { randomUUID } from 'crypto'

const createChatLogSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required').max(200),
  userMessage: z.string().min(1, 'User message is required').max(10000),
  botResponse: z.string().min(1, 'Bot response is required').max(10000),
  ipAddress: z.string().max(100).optional(),
  userAgent: z.string().max(1000).optional(),
})

// GET /api/chat-logs - List chat logs (admin only)
export async function GET(request: NextRequest) {
  try {
    const rlResult = checkRateLimit(request, { limit: 60, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to view chat logs')

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const sessionId = searchParams.get('sessionId') || ''
    const search = searchParams.get('search') || ''

    let query = supabaseAdmin
      .from('chat_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, (page - 1) * limit + limit - 1)

    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }
    if (search) {
      query = query.or(`user_message.ilike.%${search}%,bot_response.ilike.%${search}%`)
    }

    const { data: logs, error, count } = await query

    if (error) {
      console.error('Chat logs list error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch chat logs' },
        { status: 500 }
      )
    }

    const total = count ?? 0

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Chat logs list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chat logs' },
      { status: 500 }
    )
  }
}

// POST /api/chat-logs - Log a chat exchange (from bot system)
export async function POST(request: NextRequest) {
  try {
    const rlResult = checkRateLimit(request, { limit: 30, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const body = await request.json()
    const validation = createChatLogSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    const { sessionId, userMessage, botResponse, ipAddress, userAgent } = validation.data

    const { data: chatLog, error } = await supabaseAdmin
      .from('chat_logs')
      .insert([{
        id: randomUUID(),
        session_id: sessionId,
        user_message: userMessage,
        bot_response: botResponse,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
      }])
      .select()
      .single()

    if (error) {
      console.error('Chat log create error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create chat log' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data: chatLog },
      { status: 201 }
    )
  } catch (error) {
    console.error('Chat log create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create chat log' },
      { status: 500 }
    )
  }
}
