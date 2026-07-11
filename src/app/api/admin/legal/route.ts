import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, legalPagesDb, getUserFromToken } from '@/lib/supabase'
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

// GET: List all legal pages
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

    const { data, error } = await supabaseAdmin
      .from('legal_pages')
      .select('*')
      .order('type', { ascending: true })

    if (error) {
      console.error('Legal pages list error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch legal pages.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error) {
    console.error('Admin legal pages error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch legal pages.' }, { status: 500 })
  }
}

// PUT: Update/Upsert a legal page
export async function PUT(request: NextRequest) {
  try {
    const { authorized, user } = await verifyAdminAccess(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const body = await request.json()
    const schema = z.object({
      type: z.enum(['terms', 'privacy', 'cookies', 'disclaimer', 'refund']),
      title: z.string().min(3).max(200),
      content: z.string().min(10),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed.' }, { status: 400 })
    }

    const { type, title, content } = validationResult.data

    const page = await legalPagesDb.upsert({
      type,
      title,
      content,
      updated_at: new Date().toISOString(),
      updated_by: user?.email || null,
    })

    if (!page) {
      return NextResponse.json({ success: false, error: 'Failed to save legal page.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: page })
  } catch (error) {
    console.error('Admin legal page save error:', error)
    return NextResponse.json({ success: false, error: 'Failed to save legal page.' }, { status: 500 })
  }
}
