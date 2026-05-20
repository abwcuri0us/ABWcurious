import { NextResponse } from 'next/server'
import { statusDb } from '@/lib/supabase'

// GET: Public status page
export async function GET() {
  try {
    const statuses = await statusDb.list()

    const overallStatus = statuses.some(s => s.status === 'outage')
      ? 'outage'
      : statuses.some(s => s.status === 'degraded')
        ? 'degraded'
        : statuses.some(s => s.status === 'maintenance')
          ? 'maintenance'
          : 'operational'

    return NextResponse.json({
      success: true,
      data: {
        overall: overallStatus,
        services: statuses,
        lastChecked: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Public status error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch status.' }, { status: 500 })
  }
}
