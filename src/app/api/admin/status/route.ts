import { NextRequest, NextResponse } from 'next/server'
import { statusDb, verifyAccess } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// Helper to get access token from both Bearer header and cookie
function getAccessToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader?.replace('Bearer ', '')
  const cookieToken = request.cookies.get('abwcurious_token')?.value
  return headerToken || cookieToken || null
}

// GET: List all status updates
export async function GET() {
  try {
    const statuses = await statusDb.list()
    return NextResponse.json({ success: true, data: statuses })
  } catch (error) {
    console.error('Status list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch status.' }, { status: 500 })
  }
}

// POST: Create status update
export async function POST(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request)
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const { authorized } = await verifyAccess(accessToken, ['admin'])
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
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
      service: z.string().min(2).max(100),
      status: z.enum(['operational', 'degraded', 'outage', 'maintenance']),
      message: z.string().optional(),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validationResult.error.issues }, { status: 400 })
    }

    const statusUpdate = await statusDb.create({
      service: validationResult.data.service,
      status: validationResult.data.status,
      message: validationResult.data.message ?? null,
    })
    if (!statusUpdate) {
      return NextResponse.json({ success: false, error: 'Failed to create status update.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: statusUpdate }, { status: 201 })
  } catch (error) {
    console.error('Status create error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create status update.' }, { status: 500 })
  }
}

// PATCH: Update status
export async function PATCH(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request)
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const { authorized } = await verifyAccess(accessToken, ['admin'])
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const body = await request.json()
    const schema = z.object({
      id: z.string(),
      service: z.string().min(2).max(100).optional(),
      status: z.enum(['operational', 'degraded', 'outage', 'maintenance']).optional(),
      message: z.string().optional(),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed.' }, { status: 400 })
    }

    const { id, ...data } = validationResult.data
    const statusUpdate = await statusDb.update(id, data)
    if (!statusUpdate) {
      return NextResponse.json({ success: false, error: 'Failed to update status.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: statusUpdate })
  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update status.' }, { status: 500 })
  }
}
