import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

/**
 * GET: Return event registrations for the current user
 */
export async function GET(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: true, data: [] })
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    const rateLimitResult = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Get user from auth token
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      )
    }

    // Fetch registrations for this user
    const { data: registrations, error } = await supabaseAdmin
      .from('event_registrations')
      .select('*, event:events(id, title, date, location, type)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('My registrations GET error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch registrations.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: registrations || [],
    })
  } catch (error) {
    console.error('My registrations GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch registrations.' },
      { status: 500 }
    )
  }
}
