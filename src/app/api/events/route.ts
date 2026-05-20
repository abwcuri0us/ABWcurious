import { NextResponse } from 'next/server'
import { eventsDb } from '@/lib/supabase'

// GET: Public upcoming events
export async function GET() {
  try {
    const events = await eventsDb.list({ upcoming: true })
    return NextResponse.json({ success: true, data: events })
  } catch (error) {
    console.error('Public events error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch events.' }, { status: 500 })
  }
}
