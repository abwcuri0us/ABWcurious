import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyAdmin, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// GET: List all careers
export async function GET(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const { data: careers, error } = await supabaseAdmin
      .from('careers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase careers fetch error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to fetch careers.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: careers })
  } catch (error) {
    console.error('Careers list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch careers.' }, { status: 500 })
  }
}

// POST: Create career listing
export async function POST(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
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
      requirements: z.string().optional().nullable(),
      is_active: z.boolean().default(true),
      slug: z.string().min(3).max(200),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validationResult.error.issues }, { status: 400 })
    }

    const { data: career, error } = await supabaseAdmin
      .from('careers')
      .insert([validationResult.data])
      .select()
      .single()

    if (error) {
      console.error('Career create error:', error.message)
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
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const body = await request.json()
    const schema = z.object({
      id: z.string(),
      title: z.string().min(3).max(200).optional(),
      department: z.string().min(2).max(100).optional(),
      location: z.string().min(2).max(200).optional(),
      type: z.enum(['full-time', 'part-time', 'internship', 'contract']).optional(),
      description: z.string().min(10).optional(),
      requirements: z.string().optional().nullable(),
      is_active: z.boolean().optional(),
      slug: z.string().min(3).max(200).optional(),
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

    const { data: career, error } = await supabaseAdmin
      .from('careers')
      .update(cleanedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Career update error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to update career.' }, { status: 500 })
    }

    if (!career) {
      return NextResponse.json({ success: false, error: 'Career not found.' }, { status: 404 })
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
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'Career ID is required.' }, { status: 400 })

    const { error } = await supabaseAdmin
      .from('careers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Career delete error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to delete career.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Career deleted.' })
  } catch (error) {
    console.error('Career delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete career.' }, { status: 500 })
  }
}
