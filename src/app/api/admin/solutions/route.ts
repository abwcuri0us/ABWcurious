import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyAdmin, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// GET: List all solutions (admin only)
export async function GET(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const { data: solutions, error } = await supabaseAdmin
      .from('solutions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Solutions fetch error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to fetch solutions.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: solutions })
  } catch (error) {
    console.error('Solutions list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch solutions.' }, { status: 500 })
  }
}

// POST: Create a new solution (admin only)
export async function POST(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const body = await request.json()
    const schema = z.object({
      name: z.string().min(2, 'Name must be at least 2 characters').max(200),
      slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
      tagline: z.string().max(300).optional().nullable(),
      description: z.string().min(10, 'Description must be at least 10 characters'),
      features: z.array(z.string()).optional().nullable(),
      pricing: z.string().max(200).optional().nullable(),
      demo_url: z.string().url().optional().or(z.literal('')).nullable(),
      is_active: z.boolean().default(true),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validationResult.error.issues }, { status: 400 })
    }

    const { data: solution, error } = await supabaseAdmin
      .from('solutions')
      .insert([validationResult.data])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: 'A solution with this slug already exists.' }, { status: 409 })
      }
      console.error('Solution create error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to create solution.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: solution }, { status: 201 })
  } catch (error) {
    console.error('Solution create error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create solution.' }, { status: 500 })
  }
}

// PATCH: Update a solution (admin only)
export async function PATCH(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
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
      name: z.string().min(2).max(200).optional(),
      slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/).optional(),
      tagline: z.string().max(300).optional().nullable(),
      description: z.string().min(10).optional(),
      features: z.array(z.string()).optional().nullable(),
      pricing: z.string().max(200).optional().nullable(),
      demo_url: z.string().url().optional().or(z.literal('')).nullable(),
      is_active: z.boolean().optional(),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed.', details: validationResult.error.issues }, { status: 400 })
    }

    const { id, ...updateData } = validationResult.data

    // Remove undefined fields so Supabase doesn't try to set them to null
    const cleanedData = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined)
    )

    const { data: solution, error } = await supabaseAdmin
      .from('solutions')
      .update(cleanedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: 'A solution with this slug already exists.' }, { status: 409 })
      }
      console.error('Solution update error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to update solution.' }, { status: 500 })
    }

    if (!solution) {
      return NextResponse.json({ success: false, error: 'Solution not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: solution })
  } catch (error) {
    console.error('Solution update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update solution.' }, { status: 500 })
  }
}

// DELETE: Remove solution (admin only)
export async function DELETE(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
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

    const { error } = await supabaseAdmin
      .from('solutions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Solution delete error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to delete solution.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Solution deleted.' })
  } catch (error) {
    console.error('Solution delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete solution.' }, { status: 500 })
  }
}
