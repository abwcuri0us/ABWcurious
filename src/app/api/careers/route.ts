import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isConfigured } from '@/lib/supabase'

// GET: Public active career listings
export async function GET(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: true, data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    const { data: careers, error, count } = await supabaseAdmin
      .from('careers')
      .select('id, title, slug, department, location, type, salary_min, salary_max, is_active, deadline', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Supabase careers fetch error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to fetch careers.' }, { status: 500 })
    }

    const total = count ?? 0

    return NextResponse.json({
      success: true,
      data: careers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (error) {
    console.error('Public careers error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch careers.' }, { status: 500 })
  }
}