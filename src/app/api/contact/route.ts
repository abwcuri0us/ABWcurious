import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'

// ─── Zod schema for contact form validation ───
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

// ─── In-memory fallback store (used when Supabase is unavailable) ───
interface ContactEntry {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  created_at: string
}

const localContacts: ContactEntry[] = []

function saveLocalContact(data: Omit<ContactEntry, 'id' | 'created_at'>): ContactEntry {
  const entry: ContactEntry = {
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...data,
    created_at: new Date().toISOString(),
  }
  localContacts.push(entry)
  return entry
}

// ─── Helper: try Supabase, fallback to local ───
async function createContact(data: {
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
}): Promise<ContactEntry | null> {
  // Try Supabase first (only if configured)
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseServiceKey) {
      const { contactsDb } = await import('@/lib/supabase')
      const contact = await contactsDb.create(data)
      if (contact) return contact as ContactEntry
    }
  } catch {
    // Supabase unavailable — fall through to local storage
  }

  // Fallback: in-memory local storage
  return saveLocalContact(data)
}

// ─── POST handler ───
export async function POST(request: NextRequest) {
  try {
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

    // Store contact (Supabase or local fallback)
    const contact = await createContact({
      name,
      email,
      phone: phone || null,
      subject,
      message,
    })

    if (!contact) {
      return NextResponse.json(
        { success: false, error: 'Failed to submit contact form. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for contacting us! We will get back to you soon.',
        data: { id: contact.id },
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
