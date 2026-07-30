import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, eventRegistrationsDb } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth-helpers'
import { rateLimit } from '@/lib/rate-limit'

// Helper to verify admin/editor access
async function verifyAdminAccess(request: NextRequest) {
  const { user, error } = await getUserFromRequest(request)
  if (error || !user || !['admin', 'editor'].includes(user.role)) {
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
