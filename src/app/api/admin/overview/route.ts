import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyAccess } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

// GET: Admin overview stats
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    const cookieToken = request.cookies.get('abwcurious_token')?.value
    const accessToken = token || cookieToken

    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const { authorized } = await verifyAccess(accessToken, ['admin', 'editor'])
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
      blogsResult,
      eventsResult,
      careersResult,
      contactsResult,
      newsletterResult,
    ] = await Promise.all([
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('blog_posts').select('id, published', { count: 'exact' }),
      supabaseAdmin.from('events').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('careers').select('id, is_active', { count: 'exact' }),
      supabaseAdmin.from('contacts').select('id, created_at'),
      supabaseAdmin.from('newsletters').select('id', { count: 'exact', head: true }),
    ])

    // Count published vs draft blogs
    const allBlogs = blogsResult.data || []
    const publishedBlogs = allBlogs.filter((b: { published: boolean }) => b.published).length
    const draftBlogs = allBlogs.length - publishedBlogs

    // Count active careers
    const allCareers = careersResult.data || []
    const activeCareers = allCareers.filter((c: { is_active: boolean }) => c.is_active).length

    // Count new contacts this month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const newContacts = (contactsResult.data || []).filter(
      (c: { created_at: string }) => c.created_at >= startOfMonth
    ).length

    // Recent activity feed - get last 10 items from contacts, blog posts, events
    const [recentContacts, recentBlogs, recentEvents] = await Promise.all([
      supabaseAdmin.from('contacts').select('id, name, subject, created_at').order('created_at', { ascending: false }).limit(4),
      supabaseAdmin.from('blog_posts').select('id, title, published, created_at').order('created_at', { ascending: false }).limit(3),
      supabaseAdmin.from('events').select('id, title, date, created_at').order('created_at', { ascending: false }).limit(3),
    ])

    type ActivityItem = {
      id: string;
      type: 'contact' | 'blog' | 'event';
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

    for (const b of (recentBlogs.data || [])) {
      activities.push({
        id: b.id,
        type: 'blog',
        text: `${b.published ? 'Published' : 'Draft'}: ${b.title}`,
        time: b.created_at,
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
        totalBlogs: allBlogs.length,
        publishedBlogs,
        draftBlogs,
        totalEvents: eventsResult.count || 0,
        activeCareers,
        newContacts,
        newsletterSubscribers: newsletterResult.count || 0,
        recentActivity,
      },
    })
  } catch (error) {
    console.error('Admin overview error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch overview.' }, { status: 500 })
  }
}
