import { NextRequest, NextResponse } from 'next/server'
import { solutionsDb, getUserFromToken, supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// Helper to get user from request
async function getUserFromRequest(request: NextRequest) {
  const cookieToken = request.cookies.get('abwcurious_token')?.value
  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader?.replace('Bearer ', '')
  const accessToken = cookieToken || headerToken

  if (!accessToken) {
    return { user: null, error: NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 }) }
  }

  const user = await getUserFromToken(accessToken)
  if (!user) {
    return { user: null, error: NextResponse.json({ success: false, error: 'Invalid or expired token.' }, { status: 401 }) }
  }

  return { user, error: null }
}

// GET: List user's submitted solution requests
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    // Fetch solution requests submitted by this user
    const { data: myRequests, error: fetchErr } = await supabaseAdmin
      .from('solutions')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })

    if (fetchErr) {
      console.error('Solutions GET error:', fetchErr.message)
    }

    return NextResponse.json({ success: true, data: { requests: myRequests || [] } })
  } catch (err) {
    console.error('Solutions GET error:', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch solutions.' }, { status: 500 })
  }
}

const solutionRequestSchema = z.object({
  solution_type: z.enum(['software_app', 'website', 'cybersecurity', 'ai_ml', 'digital_marketing', 'consulting', 'other']).default('other'),
  title: z.string().min(3, 'Title is required (min 3 characters)').max(200),
  description: z.string().min(10, 'Description is required (min 10 characters)').max(5000),
  budget: z.string().max(100).optional().nullable(),
  timeline: z.string().max(100).optional().nullable(),
})

// POST: Submit a new solution request
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown'
    const rl = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'Too many requests. Please wait a moment.' }, { status: 429 })
    }

    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    const body = await request.json()
    const validation = solutionRequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validation.error.issues }, { status: 400 })
    }

    const { solution_type, title, description, budget, timeline } = validation.data

    // Insert the solution request directly into the solutions table
    const { data: solution, error: insertErr } = await supabaseAdmin
      .from('solutions')
      .insert([{
        user_id: user!.id,
        name: title,
        slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}-${Date.now().toString(36)}`,
        title,
        description,
        solution_type,
        budget: budget || null,
        timeline: timeline || null,
        email: user!.email,
        status: 'submitted',
        is_active: false,
      }])
      .select()
      .single()

    if (insertErr) {
      console.error('Solution request insert error:', insertErr.message)
      return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: solution }, { status: 201 })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Failed to submit solution request.'
    console.error('Solutions POST error:', errMsg)
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 })
  }
}
