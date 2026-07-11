import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isConfigured } from '@/lib/supabase'

// GET: Public upcoming events
export async function GET(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: true, data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    const now = new Date().toISOString()

    const { data: events, error, count } = await supabaseAdmin
      .from('events')
      .select('id, title, slug, cover_image, date, time, end_date, location, category, type, max_registrations, registered_count, is_published, created_by', { count: 'exact' })
      .gte('date', now)
      .eq('is_active', true)
      .order('date', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Supabase events fetch error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to fetch events.' }, { status: 500 })
    }

    const total = count ?? 0

    return NextResponse.json({
      success: true,
      data: events,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (error) {
    console.error('Public events error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch events.' }, { status: 500 })
  }
}