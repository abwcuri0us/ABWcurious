import { NextRequest, NextResponse } from 'next/server'
import { usersDb } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { verifyAuthToken } from '@/lib/auth'
import { supabaseDb } from '@/lib/supabase-db'
import { sendNewsletterBatch } from '@/lib/email'
import { z } from 'zod'

// Helper: Verify admin access via Supabase Auth
async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return false

  const authUser = await verifyAuthToken(token)
  if (!authUser) return false

  const user = await usersDb.findByEmail(authUser.email ?? '')
  if (!user || !['admin', 'editor'].includes(user.role)) return false

  return true
}

/**
 * POST: Send a newsletter to all subscribers
 * Admin-only endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request)
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const rateLimitErr = (() => {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown'
      const result = rateLimit(ip, { limit: 5, windowMs: 60_000 })
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      }
      return null
    })()
    if (rateLimitErr) return rateLimitErr

    const body = await request.json()
    const schema = z.object({
      subject: z.string().min(3).max(500),
      htmlContent: z.string().min(10),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { subject, htmlContent } = validationResult.data

    // Fetch all newsletter subscriber emails
    const emails = await supabaseDb.listNewsletterEmails()

    if (emails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No newsletter subscribers found.',
        recipientCount: 0,
      })
    }

    // Send newsletter emails via Resend in batches
    const { sentCount, errors } = await sendNewsletterBatch(emails, subject, htmlContent)

    if (errors.length > 0 && sentCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to send newsletter emails.', details: errors },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Newsletter sent to ${sentCount} of ${emails.length} subscribers.`,
      recipientCount: sentCount,
      totalSubscribers: emails.length,
      ...(errors.length > 0 && { partialErrors: errors }),
    })
  } catch (error) {
    console.error('Newsletter send error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send newsletter.' },
      { status: 500 }
    )
  }
}
