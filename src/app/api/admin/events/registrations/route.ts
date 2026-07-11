import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, eventRegistrationsDb, getUserFromToken } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

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

// GET: List registrations for an event
export async function GET(request: NextRequest) {
  try {
    const { authorized } = await verifyAdminAccess(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 20, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Event ID is required.' }, { status: 400 })
    }

    const registrations = await eventRegistrationsDb.listByEvent(eventId)

    // Fetch user info for each registration
    const regsWithUser = await Promise.all(
      registrations.map(async (reg: Record<string, unknown>) => {
        const userId = reg.user_id as string | null
        if (!userId) return { ...reg, user: null }

        const { data: userData } = await supabaseAdmin
          .from('profiles')
          .select('name, email')
          .eq('id', userId)
          .single()

        return {
          ...reg,
          user: userData ? { name: userData.name, email: userData.email } : null,
        }
      })
    )

    return NextResponse.json({ success: true, data: regsWithUser })
  } catch (error) {
    console.error('Event registrations error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch registrations.' }, { status: 500 })
  }
}
