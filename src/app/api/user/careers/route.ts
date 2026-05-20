import { NextRequest, NextResponse } from 'next/server'
import { careersDb, careerApplicationsDb } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import { getUserFromRequest } from '@/lib/auth-helpers'

// GET: List active careers + user's applications
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    const [careers, applications] = await Promise.all([
      careersDb.list({ activeOnly: true }),
      careerApplicationsDb.findByUserId(user!.id),
    ])

    return NextResponse.json({ success: true, data: { careers, applications } })
  } catch (err) {
    console.error('Careers GET error:', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch careers.' }, { status: 500 })
  }
}

const applySchema = z.object({
  careerId: z.string().min(1),
  coverLetter: z.string().max(5000).optional(),
  resumeUrl: z.string().url().optional().or(z.literal('')),
})

// POST: Apply for a career
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown'
    const rl = rateLimit(ip, { limit: 5, windowMs: 60_000 })
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const { user, error } = await getUserFromRequest(request)
    if (error) return error

    const body = await request.json()
    const validation = applySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validation.error.issues }, { status: 400 })
    }

    const { careerId, coverLetter, resumeUrl } = validation.data

    // Check career exists and is active
    const career = await careersDb.list({ activeOnly: true })
    const found = career.find((c) => c.id === careerId)
    if (!found) {
      return NextResponse.json({ success: false, error: 'Career position not found or no longer active.' }, { status: 404 })
    }

    // Check if already applied
    const existingApps = await careerApplicationsDb.findByUserId(user!.id)
    if (existingApps.some((a) => a.career_id === careerId)) {
      return NextResponse.json({ success: false, error: 'You have already applied for this position.' }, { status: 409 })
    }

    const application = await careerApplicationsDb.create({
      career_id: careerId,
      user_id: user!.id,
      cover_letter: coverLetter || null,
      resume_url: resumeUrl || null,
      status: 'pending',
    })

    if (!application) {
      return NextResponse.json({ success: false, error: 'Failed to submit application.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: application }, { status: 201 })
  } catch (err) {
    console.error('Careers POST error:', err)
    return NextResponse.json({ success: false, error: 'Failed to submit application.' }, { status: 500 })
  }
}
