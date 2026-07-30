import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isConfigured } from '@/lib/supabase'

/**
 * /api/feedbacks — Public testimonials endpoint (read-only, no auth required).
 *
 * GET: Returns approved/rated feedback (≥ 3 stars, status resolved/closed) formatted
 *   as public testimonials with avatar lookups. This is for the public testimonials section.
 *
 * NOTE: This is NOT a duplicate of /api/feedback. The routes serve different purposes:
 * - /api/feedback: Authenticated user feedback CRUD (POST to submit, GET own feedback).
 * - /api/feedbacks: Public read-only endpoint for displaying approved testimonials.
 */
export async function GET(_request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    // Fetch feedbacks that are approved for public display
    // Only show those with a rating and resolved/closed status (i.e. verified)
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .select('id, user_id, name, email, subject, message, rating, status, created_at')
      .not('rating', 'is', null)
      .in('status', ['resolved', 'closed'])
      .gte('rating', 3)
      .order('created_at', { ascending: false })
      .limit(12)

    if (error) {
      console.error('Public feedbacks fetch error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch feedbacks.' }, { status: 500 })
    }

    // Also fetch avatars for users who submitted feedback
    const userIds = (data || [])
      .filter((f: { user_id: string | null }) => f.user_id)
      .map((f: { user_id: string | null }) => f.user_id as string)

    let avatarMap: Record<string, { avatar: string | null; name: string | null }> = {}
    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, avatar, name')
        .in('id', userIds)

      if (profiles) {
        avatarMap = profiles.reduce<Record<string, { avatar: string | null; name: string | null }>>((acc, p: { id: string; avatar: string | null; name: string | null }) => {
          acc[p.id] = { avatar: p.avatar, name: p.name }
          return acc
        }, {})
      }
    }

    // Map feedbacks to public testimonial format
    const feedbacks = (data || []).map((f: { id: string; user_id: string | null; name: string; email: string; subject: string; message: string; rating: number | null; status: string; created_at: string }) => ({
      id: f.id,
      name: f.name || f.email?.split('@')[0] || 'Anonymous',
      avatar: f.user_id && avatarMap[f.user_id] ? avatarMap[f.user_id].avatar : null,
      rating: f.rating,
      message: f.message,
      subject: f.subject,
      date: f.created_at,
      verified: !!f.user_id, // "Verified User" if submitted by a logged-in user
    }))

    return NextResponse.json({ success: true, data: feedbacks })
  } catch (error) {
    console.error('Public feedbacks GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch feedbacks.' }, { status: 500 })
  }
}
