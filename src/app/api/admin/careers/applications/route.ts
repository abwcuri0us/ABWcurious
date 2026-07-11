import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, careerApplicationsDb, getUserFromToken } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// Helper to verify admin/editor access from token
async function verifyAdminAccess(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  const cookieToken = request.cookies.get('abwcurious_token')?.value
  const accessToken = token || cookieToken

  if (!accessToken) return { authorized: false, user: null }

  const user = await getUserFromToken(accessToken)
  if (!user || !['admin', 'editor'].includes(user.role)) {
    return { authorized: false, user: null }
  }

  return { authorized: true, user }
}

// GET: List applications for a career
export async function GET(request: NextRequest) {
  try {
    const { authorized } = await verifyAdminAccess(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 20, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const careerId = searchParams.get('careerId')
    if (!careerId) {
      return NextResponse.json({ success: false, error: 'Career ID is required.' }, { status: 400 })
    }

    const applications = await careerApplicationsDb.listByCareer(careerId)

    // Fetch user info for each application
    const appsWithUser = await Promise.all(
      applications.map(async (app: Record<string, unknown>) => {
        const userId = app.user_id as string | null
        if (!userId) return { ...app, user: null }

        const { data: userData } = await supabaseAdmin
          .from('profiles')
          .select('name, email')
          .eq('id', userId)
          .single()

        return {
          ...app,
          user: userData ? { name: userData.name, email: userData.email } : null,
        }
      })
    )

    return NextResponse.json({ success: true, data: appsWithUser })
  } catch (error) {
    console.error('Career applications error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch applications.' }, { status: 500 })
  }
}

// PATCH: Update application status
export async function PATCH(request: NextRequest) {
  try {
    const { authorized } = await verifyAdminAccess(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 20, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const body = await request.json()
    const schema = z.object({
      applicationId: z.string(),
      status: z.enum(['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted']),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed.' }, { status: 400 })
    }

    const { applicationId, status } = validationResult.data

    const { data, error } = await supabaseAdmin
      .from('job_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', applicationId)
      .select()
      .single()

    if (error) {
      console.error('Application status update error:', error)
      return NextResponse.json({ success: false, error: 'Failed to update status.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Career application update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update application.' }, { status: 500 })
  }
}
