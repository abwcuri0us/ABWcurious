import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

// GET /api/chat-logs/[id] - Get a single chat log (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 60, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to view chat logs')

    const { id } = await params
    const { data: chatLog, error } = await supabaseAdmin
      .from('chat_logs')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error || !chatLog) return notFoundResponse('Chat log')

    return NextResponse.json({ success: true, data: chatLog })
  } catch (error) {
    console.error('Chat log get error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chat log' },
      { status: 500 }
    )
  }
}

// DELETE /api/chat-logs/[id] - Delete a chat log (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 5, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to delete chat logs')

    const { id } = await params
    const { data: chatLog, error: findError } = await supabaseAdmin
      .from('chat_logs')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (findError || !chatLog) return notFoundResponse('Chat log')

    const { error: deleteError } = await supabaseAdmin
      .from('chat_logs')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Chat log delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete chat log' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Chat log deleted successfully',
    })
  } catch (error) {
    console.error('Chat log delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete chat log' },
      { status: 500 }
    )
  }
}
