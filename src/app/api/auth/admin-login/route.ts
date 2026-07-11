import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { createSession, getSessionCookieName, getSessionMaxAge } from '@/lib/sessions'
import { getCsrfCookieConfig } from '@/lib/csrf'
import { safeEqual } from '@/lib/auth'

// Zod schema for admin login (email + password)
const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    const rateLimitResult = rateLimit(ip, { limit: 5, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = adminLoginSchema.safeParse(body)

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

    const { email, password } = validationResult.data

    // Check admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Admin login is not configured.' },
        { status: 503 }
      )
    }

    if (!safeEqual(email.toLowerCase(), adminEmail.toLowerCase()) || !safeEqual(password, adminPassword)) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials.' },
        { status: 401 }
      )
    }

    // Admin credentials are valid — look up or create the admin profile.
    // Prefer the canonical admin UUID (seeded by FINAL_SCHEMA.sql); fall back
    // to an email lookup with .limit(1) to avoid multi-row .maybeSingle() errors.
    let userData: { id: string; email: string; name: string | null; avatar: string | null; role: string } | null = null

    const ADMIN_PROFILE_UUID = '00000000-0000-0000-0000-000000000001'

    // First check if admin profile exists by canonical UUID
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', ADMIN_PROFILE_UUID)
      .maybeSingle()

    // Fallback: look up by email (limit 1 to avoid multi-row error)
    let profile = existingProfile
    if (!profile) {
      const { data: emailProfile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', adminEmail)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      profile = emailProfile
    }

    if (profile) {
      userData = profile
      // Ensure the role is admin
      if (profile.role !== 'admin') {
        await supabaseAdmin
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', profile.id)
        userData = { ...profile, role: 'admin' }
      }
    } else {
      // Create admin profile with the canonical admin UUID.
      // The profiles.id column is UUID type, so we MUST use a valid UUID.
      // The canonical admin UUID (seeded by FINAL_SCHEMA.sql) is
      // 00000000-0000-0000-0000-000000000001.

      const { data: newProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert([{
          id: ADMIN_PROFILE_UUID,
          email: adminEmail,
          name: 'Admin',
          avatar: null,
          provider: 'admin',
          role: 'admin',
        }])
        .select()
        .single()

      if (profileError) {
        console.error('Failed to create admin profile:', profileError.message)
        // Fallback: try to find the profile by canonical UUID (may have been seeded)
        const { data: seededProfile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', ADMIN_PROFILE_UUID)
          .maybeSingle()
        if (seededProfile) {
          userData = seededProfile
        } else {
          // Last resort: use the canonical UUID anyway so the token is valid
          userData = {
            id: ADMIN_PROFILE_UUID,
            email: adminEmail,
            name: 'Admin',
            avatar: null,
            role: 'admin',
          }
        }
      } else {
        userData = newProfile
      }
    }

    // userData is guaranteed to be set by this point
    const adminUserData = userData!

    // Create server-side session and set httpOnly + CSRF cookies
    const sessionToken = await createSession(
      { userId: adminUserData.id, email: adminUserData.email, role: 'admin' },
      request
    )
    const csrfConfig = getCsrfCookieConfig()

    const response = NextResponse.json(
      {
        success: true,
        message: 'Admin login successful.',
        data: {
          user: {
            id: adminUserData.id,
            email: adminUserData.email,
            name: adminUserData.name,
            avatar: adminUserData.avatar,
            role: 'admin',
          },
        },
      },
      { status: 200 }
    )

    response.cookies.set(getSessionCookieName(), sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: getSessionMaxAge(),
      path: '/',
    })
    response.cookies.set(csrfConfig.name, csrfConfig.value, csrfConfig.options)

    return response
  } catch (error) {
    console.error('Admin login API error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
