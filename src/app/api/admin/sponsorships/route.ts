import { NextRequest, NextResponse } from 'next/server'
import { sponsorshipsDb, verifyAccess } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// Helper to get access token from both Bearer header and cookie
function getAccessToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader?.replace('Bearer ', '')
  const cookieToken = request.cookies.get('abwcurious_token')?.value
  return headerToken || cookieToken || null
}

// GET: List all sponsorships
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

    const sponsorships = await sponsorshipsDb.list()
    return NextResponse.json({ success: true, data: sponsorships })
  } catch (error) {
    console.error('Sponsorships list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch sponsorships.' }, { status: 500 })
  }
}

// PATCH: Update sponsorship status
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
      sponsorship_type: z.string().optional(),
      message: z.string().optional(),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed.', details: validationResult.error.issues }, { status: 400 })
    }

    const { id, ...data } = validationResult.data
    const sponsorship = await sponsorshipsDb.update(id, data)
    if (!sponsorship) {
      return NextResponse.json({ success: false, error: 'Failed to update sponsorship.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: sponsorship })
  } catch (error) {
    console.error('Sponsorship update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update sponsorship.' }, { status: 500 })
  }
}

// DELETE: Remove sponsorship
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
    if (!id) return NextResponse.json({ success: false, error: 'Sponsorship ID is required.' }, { status: 400 })

    const deleted = await sponsorshipsDb.delete(id)
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Failed to delete sponsorship.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Sponsorship deleted.' })
  } catch (error) {
    console.error('Sponsorship delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete sponsorship.' }, { status: 500 })
  }
}
