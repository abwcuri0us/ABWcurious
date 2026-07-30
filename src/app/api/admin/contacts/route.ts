import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

// GET: List all contact submissions (admin only)
export async function GET(request: NextRequest) {
  try {
    const { authorized } = await verifyAdmin(request)
    if (!authorized) {
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

    const { data: contacts, error } = await supabaseAdmin
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Admin contacts list error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch contacts.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: contacts })
  } catch (error) {
    console.error('Admin contacts list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch contacts.' }, { status: 500 })
  }
}
