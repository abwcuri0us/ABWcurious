import { NextRequest, NextResponse } from 'next/server'
import { partnershipsDb, verifyAccess } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// Helper to get access token from both Bearer header and cookie
function getAccessToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader?.replace('Bearer ', '')
  const cookieToken = request.cookies.get('abwcurious_token')?.value
  return headerToken || cookieToken || null
}

// GET: List all partnerships
export async function GET(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request)
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const { authorized } = await verifyAccess(accessToken, ['admin', 'editor'])
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const partnerships = await partnershipsDb.list()
    return NextResponse.json({ success: true, data: partnerships })
  } catch (error) {
    console.error('Partnerships list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch partnerships.' }, { status: 500 })
  }
}

// PATCH: Update partnership status
export async function PATCH(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request)
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const { authorized } = await verifyAccess(accessToken, ['admin', 'editor'])
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 20, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const body = await request.json()
    const schema = z.object({
      id: z.string(),
      status: z.enum(['pending', 'approved', 'rejected', 'active', 'inactive']).optional(),
      partnership_type: z.string().optional(),
      message: z.string().optional(),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed.', details: validationResult.error.issues }, { status: 400 })
    }

    const { id, ...data } = validationResult.data
    const partnership = await partnershipsDb.update(id, data)
    if (!partnership) {
      return NextResponse.json({ success: false, error: 'Failed to update partnership.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: partnership })
  } catch (error) {
    console.error('Partnership update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update partnership.' }, { status: 500 })
  }
}

// DELETE: Remove partnership
export async function DELETE(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request)
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const { authorized } = await verifyAccess(accessToken, ['admin', 'editor'])
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'Partnership ID is required.' }, { status: 400 })

    const deleted = await partnershipsDb.delete(id)
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Failed to delete partnership.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Partnership deleted.' })
  } catch (error) {
    console.error('Partnership delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete partnership.' }, { status: 500 })
  }
}
