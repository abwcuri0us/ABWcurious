import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyAdmin, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

// GET: Comprehensive analytics data for admin dashboard
export async function GET(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
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

    // Date ranges for growth calculation
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const lastMonthEnd = thisMonthStart

    // Fetch all counts + created_at data for growth calculations in parallel
    const [
      usersResult,
      usersThisMonth,
      usersLastMonth,
      eventsResult,
      eventsThisMonth,
      eventsLastMonth,
      careersResult,
      contactsResult,
      contactsThisMonth,
      contactsLastMonth,
      newsletterResult,
      newsletterThisMonth,
      newsletterLastMonth,
      partnershipsResult,
      partnershipsThisMonth,
      partnershipsLastMonth,
      sponsorshipsResult,
      sponsorshipsThisMonth,
      sponsorshipsLastMonth,
      registrationsResult,
      registrationsThisMonth,
      registrationsLastMonth,
      applicationsResult,
      applicationsThisMonth,
      applicationsLastMonth,
      feedbackResult,
      feedbackThisMonth,
      feedbackLastMonth,
      usersWithRoles,
    ] = await Promise.all([
      // Total counts
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', thisMonthStart),
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', lastMonthStart).lt('created_at', lastMonthEnd),

      supabaseAdmin.from('events').select('id, is_active', { count: 'exact' }),
      supabaseAdmin.from('events').select('id', { count: 'exact', head: true }).gte('created_at', thisMonthStart),
      supabaseAdmin.from('events').select('id', { count: 'exact', head: true }).gte('created_at', lastMonthStart).lt('created_at', lastMonthEnd),

      supabaseAdmin.from('careers').select('id, is_active', { count: 'exact' }),

      supabaseAdmin.from('contact_submissions').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('contact_submissions').select('id', { count: 'exact', head: true }).gte('created_at', thisMonthStart),
      supabaseAdmin.from('contact_submissions').select('id', { count: 'exact', head: true }).gte('created_at', lastMonthStart).lt('created_at', lastMonthEnd),

      supabaseAdmin.from('newsletters').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('newsletters').select('id', { count: 'exact', head: true }).gte('created_at', thisMonthStart),
      supabaseAdmin.from('newsletters').select('id', { count: 'exact', head: true }).gte('created_at', lastMonthStart).lt('created_at', lastMonthEnd),

      supabaseAdmin.from('partnerships').select('id, status', { count: 'exact' }),
      supabaseAdmin.from('partnerships').select('id', { count: 'exact', head: true }).gte('created_at', thisMonthStart),
      supabaseAdmin.from('partnerships').select('id', { count: 'exact', head: true }).gte('created_at', lastMonthStart).lt('created_at', lastMonthEnd),

      supabaseAdmin.from('sponsorships').select('id, status', { count: 'exact' }),
      supabaseAdmin.from('sponsorships').select('id', { count: 'exact', head: true }).gte('created_at', thisMonthStart),
      supabaseAdmin.from('sponsorships').select('id', { count: 'exact', head: true }).gte('created_at', lastMonthStart).lt('created_at', lastMonthEnd),

      supabaseAdmin.from('event_registrations').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('event_registrations').select('id', { count: 'exact', head: true }).gte('created_at', thisMonthStart),
      supabaseAdmin.from('event_registrations').select('id', { count: 'exact', head: true }).gte('created_at', lastMonthStart).lt('created_at', lastMonthEnd),

      supabaseAdmin.from('job_applications').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('job_applications').select('id', { count: 'exact', head: true }).gte('created_at', thisMonthStart),
      supabaseAdmin.from('job_applications').select('id', { count: 'exact', head: true }).gte('created_at', lastMonthStart).lt('created_at', lastMonthEnd),

      supabaseAdmin.from('feedback').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('feedback').select('id', { count: 'exact', head: true }).gte('created_at', thisMonthStart),
      supabaseAdmin.from('feedback').select('id', { count: 'exact', head: true }).gte('created_at', lastMonthStart).lt('created_at', lastMonthEnd),

      // User role breakdown
      supabaseAdmin.from('profiles').select('role'),
    ])

    // Helper: calculate growth percentage
    const calcGrowth = (thisMonth: number, lastMonth: number): number => {
      if (lastMonth === 0) return thisMonth > 0 ? 100 : 0
      return Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
    }

    // Events breakdown
    const allEvents: { id: string; is_active: boolean }[] = eventsResult.data || []
    const activeEvents = allEvents.filter((e) => e.is_active).length

    // Careers breakdown
    const allCareers: { id: string; is_active: boolean }[] = careersResult.data || []
    const activeCareers = allCareers.filter((c) => c.is_active).length

    // Partnerships breakdown
    const allPartnerships: { id: string; status: string }[] = partnershipsResult.data || []
    const pendingPartnerships = allPartnerships.filter((p) => p.status === 'pending').length
    const approvedPartnerships = allPartnerships.filter((p) => p.status === 'approved').length

    // Sponsorships breakdown
    const allSponsorships: { id: string; status: string }[] = sponsorshipsResult.data || []
    const pendingSponsorships = allSponsorships.filter((s) => s.status === 'pending').length
    const approvedSponsorships = allSponsorships.filter((s) => s.status === 'approved').length

    // Recent activity - fetch from multiple sources
    const [recentContacts, recentEvents, recentPartnerships, recentRegistrations, recentApplications] = await Promise.all([
      supabaseAdmin.from('contact_submissions').select('id, name, subject, created_at').order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('events').select('id, title, created_at').order('created_at', { ascending: false }).limit(3),
      supabaseAdmin.from('partnerships').select('id, organization, status, created_at').order('created_at', { ascending: false }).limit(3),
      supabaseAdmin.from('event_registrations').select('id, event:events(title), profile:profiles(name), created_at').order('created_at', { ascending: false }).limit(3),
      supabaseAdmin.from('job_applications').select('id, career:careers(title), profile:profiles(name), created_at').order('created_at', { ascending: false }).limit(3),
    ])

    type ActivityItem = {
      id: string
      type: 'contact' | 'event' | 'partnership' | 'registration' | 'application'
      text: string
      time: string
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

    for (const p of (recentPartnerships.data || [])) {
      activities.push({
        id: p.id,
        type: 'partnership',
        text: `Partnership: ${p.organization || 'Unknown'} (${p.status})`,
        time: p.created_at,
      })
    }

    for (const r of (recentRegistrations.data || [])) {
      const eventName = (r.event as unknown as { title: string } | null)?.title || 'an event'
      const profileName = (r.profile as unknown as { name: string } | null)?.name || 'Someone'
      activities.push({
        id: r.id,
        type: 'registration',
        text: `${profileName} registered for ${eventName}`,
        time: r.created_at,
      })
    }

    for (const a of (recentApplications.data || [])) {
      const careerTitle = (a.career as unknown as { title: string } | null)?.title || 'a position'
      const profileName = (a.profile as unknown as { name: string } | null)?.name || 'Someone'
      activities.push({
        id: a.id,
        type: 'application',
        text: `${profileName} applied for ${careerTitle}`,
        time: a.created_at,
      })
    }

    // Sort by time descending and take top 10
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    const recentActivity = activities.slice(0, 10)

    // User role breakdown
    const roleCounts: Record<string, number> = {}
    for (const u of (usersWithRoles.data || [])) {
      const role = u.role || 'user'
      roleCounts[role] = (roleCounts[role] || 0) + 1
    }

    const totalUsers = usersResult.count || 0
    const totalEvents = eventsResult.count || 0
    const totalCareers = allCareers.length
    const totalContacts = contactsResult.count || 0
    const totalNewsletter = newsletterResult.count || 0
    const totalPartnerships = allPartnerships.length
    const totalSponsorships = allSponsorships.length
    const totalRegistrations = registrationsResult.count || 0
    const totalApplications = applicationsResult.count || 0
    const totalFeedback = feedbackResult.count || 0

    return NextResponse.json({
      success: true,
      data: {
        // Core stats with growth
        stats: {
          totalUsers: { count: totalUsers, thisMonth: usersThisMonth.count || 0, lastMonth: usersLastMonth.count || 0, growth: calcGrowth(usersThisMonth.count || 0, usersLastMonth.count || 0) },
          totalEvents: { count: totalEvents, thisMonth: eventsThisMonth.count || 0, lastMonth: eventsLastMonth.count || 0, growth: calcGrowth(eventsThisMonth.count || 0, eventsLastMonth.count || 0), active: activeEvents },
          totalCareers: { count: totalCareers, active: activeCareers },
          totalContacts: { count: totalContacts, thisMonth: contactsThisMonth.count || 0, lastMonth: contactsLastMonth.count || 0, growth: calcGrowth(contactsThisMonth.count || 0, contactsLastMonth.count || 0) },
          totalNewsletter: { count: totalNewsletter, thisMonth: newsletterThisMonth.count || 0, lastMonth: newsletterLastMonth.count || 0, growth: calcGrowth(newsletterThisMonth.count || 0, newsletterLastMonth.count || 0) },
          totalPartnerships: { count: totalPartnerships, thisMonth: partnershipsThisMonth.count || 0, lastMonth: partnershipsLastMonth.count || 0, growth: calcGrowth(partnershipsThisMonth.count || 0, partnershipsLastMonth.count || 0), pending: pendingPartnerships, approved: approvedPartnerships },
          totalSponsorships: { count: totalSponsorships, thisMonth: sponsorshipsThisMonth.count || 0, lastMonth: sponsorshipsLastMonth.count || 0, growth: calcGrowth(sponsorshipsThisMonth.count || 0, sponsorshipsLastMonth.count || 0), pending: pendingSponsorships, approved: approvedSponsorships },
          totalRegistrations: { count: totalRegistrations, thisMonth: registrationsThisMonth.count || 0, lastMonth: registrationsLastMonth.count || 0, growth: calcGrowth(registrationsThisMonth.count || 0, registrationsLastMonth.count || 0) },
          totalApplications: { count: totalApplications, thisMonth: applicationsThisMonth.count || 0, lastMonth: applicationsLastMonth.count || 0, growth: calcGrowth(applicationsThisMonth.count || 0, applicationsLastMonth.count || 0) },
          totalFeedback: { count: totalFeedback, thisMonth: feedbackThisMonth.count || 0, lastMonth: feedbackLastMonth.count || 0, growth: calcGrowth(feedbackThisMonth.count || 0, feedbackLastMonth.count || 0) },
        },
        // Breakdown data
        userRoles: Object.entries(roleCounts)
          .map(([role, count]) => ({ role, count }))
          .sort((a, b) => b.count - a.count),
        // Recent activity
        recentActivity,
      },
    }, {
      headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' },
    })
  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics.' }, { status: 500 })
  }
}
