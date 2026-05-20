import { NextRequest, NextResponse } from 'next/server'
import { careersDb, verifyAccess } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// Helper to get access token from both Bearer header and cookie
function getAccessToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader?.replace('Bearer ', '')
  const cookieToken = request.cookies.get('abwcurious_token')?.value
  return headerToken || cookieToken || null
}

// GET: List all careers
export async function GET(request: NextRequest) {
  try {
    const careers = await careersDb.list()
    return NextResponse.json({ success: true, data: careers })
  } catch (error) {
    console.error('Careers list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch careers.' }, { status: 500 })
  }
}

// POST: Create career listing
export async function POST(request: NextRequest) {
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
      || request.headers.get('x-real-ip')
      || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const body = await request.json()
    const schema = z.object({
      title: z.string().min(3).max(200),
      department: z.string().min(2).max(100),
      location: z.string().min(2).max(200),
      type: z.enum(['full-time', 'part-time', 'internship', 'contract']).default('full-time'),
      description: z.string().min(10),
      requirements: z.string().optional(),
      is_active: z.boolean().default(true),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validationResult.error.issues }, { status: 400 })
    }

    const data = validationResult.data
    const career = await careersDb.create({
      title: data.title,
      department: data.department,
      location: data.location,
      type: data.type,
      description: data.description,
      requirements: data.requirements ?? null,
      is_active: data.is_active,
    })
    if (!career) {
      return NextResponse.json({ success: false, error: 'Failed to create career.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: career }, { status: 201 })
  } catch (error) {
    console.error('Career create error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create career.' }, { status: 500 })
  }
}

// PATCH: Update career
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
    const rateLimitResult = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const body = await request.json()
    const schema = z.object({
      id: z.string(),
      title: z.string().min(3).max(200).optional(),
      department: z.string().min(2).max(100).optional(),
      location: z.string().min(2).max(200).optional(),
      type: z.enum(['full-time', 'part-time', 'internship', 'contract']).optional(),
      description: z.string().min(10).optional(),
      requirements: z.string().optional(),
      is_active: z.boolean().optional(),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed.' }, { status: 400 })
    }

    const { id, ...data } = validationResult.data
    const career = await careersDb.update(id, data)
    if (!career) {
      return NextResponse.json({ success: false, error: 'Failed to update career.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: career })
  } catch (error) {
    console.error('Career update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update career.' }, { status: 500 })
  }
}

// DELETE: Remove career
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
    if (!id) return NextResponse.json({ success: false, error: 'Career ID is required.' }, { status: 400 })

    const deleted = await careersDb.delete(id)
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Failed to delete career.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Career deleted.' })
  } catch (error) {
    console.error('Career delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete career.' }, { status: 500 })
  }
}
