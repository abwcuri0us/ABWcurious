import { NextResponse } from 'next/server'
import { supabaseAdmin, isConfigured } from '@/lib/supabase'

// GET: Public status page
export async function GET() {
  try {
    if (!isConfigured()) {
      return NextResponse.json({
        success: true,
        data: {
          overall: 'operational',
          services: [],
          lastChecked: new Date().toISOString(),
        },
      })
    }

    const { data: statuses, error } = await supabaseAdmin
      .from('status_updates')
      .select('id, service, status, message, updated_at')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Supabase status fetch error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to fetch status.' }, { status: 500 })
    }

    const overallStatus = statuses?.some(s => s.status === 'outage')
      ? 'outage'
      : statuses?.some(s => s.status === 'degraded')
        ? 'degraded'
        : statuses?.some(s => s.status === 'maintenance')
          ? 'maintenance'
          : 'operational'

    return NextResponse.json({
      success: true,
      data: {
        overall: overallStatus,
        services: statuses || [],
        lastChecked: new Date().toISOString(),
      },
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (error) {
    console.error('Public status error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch status.' }, { status: 500 })
  }
}
