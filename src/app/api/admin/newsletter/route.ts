import { NextRequest, NextResponse } from 'next/server'
import { supabaseDb } from '@/lib/supabase-db'
import { usersDb, supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { verifyAuthToken } from '@/lib/auth'

// Helper: Verify admin access
async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return false

  const authUser = await verifyAuthToken(token)
  if (!authUser) return false

  const user = await usersDb.findByEmail(authUser.email ?? '')
  if (!user || !['admin', 'editor'].includes(user.role)) return false

  return true
}

// GET: List all newsletter subscribers (admin only)
export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request)
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 30, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests.' },
        { status: 429 }
      )
    }

    // Fetch all newsletter subscribers with full data
    const subscribers = await supabaseDb.listNewsletterSubscribers()
    return NextResponse.json({ success: true, data: subscribers })
  } catch (error) {
    console.error('Admin newsletter list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch subscribers.' }, { status: 500 })
  }
}
