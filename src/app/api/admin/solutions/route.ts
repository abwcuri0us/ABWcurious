import { NextRequest, NextResponse } from 'next/server'
import { solutionsDb, verifyAccess } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// Helper to get access token from both Bearer header and cookie
function getAccessToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader?.replace('Bearer ', '')
  const cookieToken = request.cookies.get('abwcurious_token')?.value
  return headerToken || cookieToken || null
}

// GET: List all solutions
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

    const solutions = await solutionsDb.list()
    return NextResponse.json({ success: true, data: solutions })
  } catch (error) {
    console.error('Solutions list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch solutions.' }, { status: 500 })
  }
}

// PATCH: Update solution status
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
      status: z.enum(['pending', 'in-progress', 'completed', 'cancelled']).optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      type: z.string().optional(),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed.', details: validationResult.error.issues }, { status: 400 })
    }

    const { id, ...data } = validationResult.data
    const solution = await solutionsDb.update(id, data)
    if (!solution) {
      return NextResponse.json({ success: false, error: 'Failed to update solution.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: solution })
  } catch (error) {
    console.error('Solution update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update solution.' }, { status: 500 })
  }
}

// DELETE: Remove solution
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
    if (!id) return NextResponse.json({ success: false, error: 'Solution ID is required.' }, { status: 400 })

    const deleted = await solutionsDb.delete(id)
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Failed to delete solution.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Solution deleted.' })
  } catch (error) {
    console.error('Solution delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete solution.' }, { status: 500 })
  }
}
