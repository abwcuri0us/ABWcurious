import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { logActivity } from '@/lib/activity-logger'
import { validateCsrfRequest } from '@/lib/csrf'

// Zod schema for contact form validation
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().refine(
    (val) => !val || /^[\+]?[\d\s\-\(\)]{7,20}$/.test(val),
    'Invalid phone number format'
  ),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200, 'Subject is too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message is too long'),
})

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfRequest(request)) {
      return NextResponse.json({ success: false, error: 'Invalid CSRF token' }, { status: 403 })
    }

    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Service temporarily unavailable. Please try again later.' }, { status: 503 })
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    const rateLimitResult = rateLimit(ip, { limit: 3, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = contactSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    const { name, email, phone, subject, message } = validationResult.data

    // Insert into Supabase contact_submissions table
    const insertData: Record<string, unknown> = {
      name,
      email,
      subject,
      message,
    }

    if (phone) {
      insertData.phone = phone
    }

    const { data, error } = await supabaseAdmin
      .from('contact_submissions')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Supabase contact insert error:', error.message)
      return NextResponse.json(
        { success: false, error: 'Failed to submit contact form. Please try again.' },
        { status: 500 }
      )
    }

    // Log contact form submission
    await logActivity('contact', 'contact_form_submitted', `Contact from ${name} (${email}): ${subject}`, null, email, request)

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for contacting us! We will get back to you soon.',
        data: { id: data?.id },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
