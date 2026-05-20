import { NextRequest, NextResponse } from 'next/server'
import { solutionsDb } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import { getUserFromRequest } from '@/lib/auth-helpers'

const solutionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(5000).optional(),
  type: z.enum(['Software App', 'Website', 'Game', 'Security Solution', 'Other']),
  budget: z.string().max(100).optional(),
  timeline: z.string().max(100).optional(),
})

// GET: List user's solutions
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    const solutions = await solutionsDb.findByUserId(user!.id)
    return NextResponse.json({ success: true, data: solutions })
  } catch (err) {
    console.error('Solutions GET error:', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch solutions.' }, { status: 500 })
  }
}

// POST: Create new solution request
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown'
    const rl = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    const body = await request.json()
    const validation = solutionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validation.error.issues }, { status: 400 })
    }

    const { title, description, type, budget, timeline } = validation.data
    const solution = await solutionsDb.create({
      user_id: user!.id,
      title,
      description: description || null,
      type,
      status: 'pending',
      budget: budget || null,
      timeline: timeline || null,
    })

    if (!solution) {
      return NextResponse.json({ success: false, error: 'Failed to create solution request.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: solution }, { status: 201 })
  } catch (err) {
    console.error('Solutions POST error:', err)
    return NextResponse.json({ success: false, error: 'Failed to create solution request.' }, { status: 500 })
  }
}
