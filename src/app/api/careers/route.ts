import { NextResponse } from 'next/server'
import { careersDb } from '@/lib/supabase'

// GET: Public active career listings
export async function GET() {
  try {
    const careers = await careersDb.list({ activeOnly: true })
    return NextResponse.json({ success: true, data: careers })
  } catch (error) {
    console.error('Public careers error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch careers.' }, { status: 500 })
  }
}
