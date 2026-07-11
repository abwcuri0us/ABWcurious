import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getCurrentUser, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: true, data: [] })
    }

    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const careerId = searchParams.get('career_id')

    // Admin can list all applications for a specific career
    if (careerId && user.role === 'admin') {
      const { data, error } = await supabaseAdmin
        .from('job_applications')
        .select('*, career:careers(id, title, department, location, type)')
        .eq('career_id', careerId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Career applications list error:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch applications.' }, { status: 500 })
      }
      return NextResponse.json({ success: true, data })
    }

    // Regular user: list own applications
    const { data: applications, error } = await supabaseAdmin
      .from('job_applications')
      .select('*, career:careers(id, title, department, location, type)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Career applications list error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch applications.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: applications })
  } catch (error) {
    console.error('Career applications GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch applications.' }, { status: 500 })
  }
}
