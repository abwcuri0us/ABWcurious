import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUserFromToken } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

// Helper to verify admin/editor access from token
async function verifyAdminAccess(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  const cookieToken = request.cookies.get('abwcurious_token')?.value
  const accessToken = token || cookieToken

  if (!accessToken) return { authorized: false }

  const user = await getUserFromToken(accessToken)
  if (!user || !['admin', 'editor'].includes(user.role)) {
    return { authorized: false }
  }

  return { authorized: true }
}

// GET: Admin overview stats
export async function GET(request: NextRequest) {
  try {
    const authorized = (await verifyAdminAccess(request)).authorized
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 30, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    // Fetch all counts in parallel
    const [
      usersResult,
      eventsResult,
      careersResult,
      contactsResult,
      newsletterResult,
      partnershipsResult,
      sponsorshipsResult,
      applicationsResult,
      feedbackResult,
      registrationsResult,
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('events').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('careers').select('id, is_active', { count: 'exact' }),
      supabaseAdmin.from('contact_submissions').select('id, created_at'),
      supabaseAdmin.from('newsletters').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('partnerships').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('sponsorships').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('job_applications').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('feedback').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('event_registrations').select('*', { count: 'exact', head: true }),
    ])

    // Count active careers
    const allCareers = careersResult.data || []
    const activeCareers = allCareers.filter((c: { is_active: boolean }) => c.is_active).length

    // Count new contacts this month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const newContacts = (contactsResult.data || []).filter(
      (c: { created_at: string }) => c.created_at >= startOfMonth
    ).length

    // Recent activity feed - get last 10 items from contacts and events
    const [recentContacts, recentEvents] = await Promise.all([
      supabaseAdmin.from('contact_submissions').select('id, name, subject, created_at').order('created_at', { ascending: false }).limit(4),
      supabaseAdmin.from('events').select('id, title, date, created_at').order('created_at', { ascending: false }).limit(3),
    ])

    type ActivityItem = {
      id: string;
      type: 'contact' | 'event';
      text: string;
      time: string;
    }

    const activities: ActivityItem[] = []

    for (const c of (recentContacts.data || [])) {
      activities.push({
        id: c.id,
        type: 'contact',
        text: `New contact from ${c.name}: ${c.subject}`,
        time: c.created_at,
      })
    }

    for (const e of (recentEvents.data || [])) {
      activities.push({
        id: e.id,
        type: 'event',
        text: `Event: ${e.title}`,
        time: e.created_at,
      })
    }

    // Sort by time descending and take top 10
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    const recentActivity = activities.slice(0, 10)

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: usersResult.count || 0,
        totalEvents: eventsResult.count || 0,
        activeCareers,
        newContacts,
        newsletterSubscribers: newsletterResult.count || 0,
        totalPartnerships: partnershipsResult.count || 0,
        totalSponsorships: sponsorshipsResult.count || 0,
        totalApplications: applicationsResult.count || 0,
        totalFeedback: feedbackResult.count || 0,
        totalRegistrations: registrationsResult.count || 0,
        recentActivity,
      },
    })
  } catch (error) {
    console.error('Admin overview error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch overview.' }, { status: 500 })
  }
}
