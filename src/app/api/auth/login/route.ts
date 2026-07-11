import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { logActivity } from '@/lib/activity-logger'
import { createSession, getSessionCookieName, getSessionMaxAge } from '@/lib/sessions'
import { getCsrfCookieConfig } from '@/lib/csrf'
import { sanitizePostgrestFilter } from '@/lib/sanitize'
import { safeEqual } from '@/lib/auth'

// Zod schema for login (email + password for all users)
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
})

export async function POST(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Authentication service not configured.' }, { status: 503 })
    }

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
    const validationResult = loginSchema.safeParse(body)

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

    const { email, password, rememberMe } = validationResult.data

    // Check if this is the admin email — use admin login flow
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (adminEmail && adminPassword && email.toLowerCase() === adminEmail.toLowerCase()) {
      if (!safeEqual(password, adminPassword)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid email or password.',
        }, { status: 401 })
      }

      // Admin password matches — look up or create admin profile
      let userData: { id: string; email: string; name: string | null; avatar: string | null; role: string } | null = null

      const ADMIN_PROFILE_UUID = '00000000-0000-0000-0000-000000000001'

      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', ADMIN_PROFILE_UUID)
        .maybeSingle()

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
        if (profile.role !== 'admin') {
          await supabaseAdmin
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', profile.id)
          userData = { ...profile, role: 'admin' }
        }
      } else {
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
          const { data: seededProfile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', ADMIN_PROFILE_UUID)
            .maybeSingle()
          userData = seededProfile || {
            id: ADMIN_PROFILE_UUID,
            email: adminEmail,
            name: 'Admin',
            avatar: null,
            role: 'admin',
          }
        } else {
          userData = newProfile
        }
      }

      const adminUserData = userData!
      await logActivity('auth', 'admin_login', `Admin login: ${email}`, adminUserData.id, email, request)

      // Create server-side session and set httpOnly + CSRF cookies
      const sessionToken = await createSession(
        { userId: adminUserData.id, email: adminUserData.email, role: 'admin' },
        request
      )
      const csrfConfig = getCsrfCookieConfig()

      const response = NextResponse.json({
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
        rememberMe,
      }, { status: 200 })

      response.cookies.set(getSessionCookieName(), sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: getSessionMaxAge(),
        path: '/',
      })
      response.cookies.set(csrfConfig.name, csrfConfig.value, csrfConfig.options)

      return response
    }

    // ---- Regular user login ----

    // Step 1: Check if the user exists in Supabase Auth (before attempting signInWithPassword)
    // This lets us give a specific "no account" vs "wrong password" error.
    const { data } = await supabaseAdmin.auth.admin.listUsers({
      filter: `email eq "${sanitizePostgrestFilter(email.toLowerCase())}"`,
    } as Parameters<typeof supabaseAdmin.auth.admin.listUsers>[0])
    const existingAuthUser = data?.users?.[0]

    if (!existingAuthUser) {
      console.error('[Login] No account found for email:', email)
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password.',
      }, { status: 401 })
    }

    // Step 2: Check if email is confirmed
    if (!existingAuthUser.email_confirmed_at) {
      // Send Supabase OTP to verify email
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.abwcurious.com'

      const { error: otpError } = await supabaseAdmin.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${baseUrl}/api/auth/callback`,
        },
      })

      if (!otpError) {
        console.error('[Login] Email not verified:', email)
        return NextResponse.json({
          success: false,
          error: 'Invalid email or password.',
        }, { status: 401 })
      }

      console.error('[Login] Email not verified (OTP send also failed):', email)
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password.',
      }, { status: 401 })
    }

    // Step 3: Attempt to sign in with password
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      const errorMessage = authError.message?.toLowerCase() || ''

      // Supabase returns "Invalid login credentials" for wrong password
      // Since we already verified the user exists and email is confirmed,
      // this must be a wrong password
      if (errorMessage.includes('invalid') || errorMessage.includes('password')) {
        console.error('[Login] Wrong password for email:', email)
        return NextResponse.json({
          success: false,
          error: 'Invalid email or password.',
        }, { status: 401 })
      }

      console.error('[Login] Auth error for email:', email, authError.message)
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password.',
      }, { status: 401 })
    }

    // Step 4: Successful login — look up or create profile
    const authUser = authData.user
    const userId = authUser?.id

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Login failed. Please try again.',
      }, { status: 500 })
    }

    let userData: { id: string; email: string; name: string | null; avatar: string | null; role: string } | null = null

    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (existingProfile) {
      userData = existingProfile
      await supabaseAdmin
        .from('profiles')
        .update({ avatar: authUser.user_metadata?.avatar_url || existingProfile.avatar })
        .eq('id', userId)
    } else {
      const metadataName = authUser.user_metadata?.name || authUser.user_metadata?.full_name || null
      const metadataAvatar = authUser.user_metadata?.avatar_url || null
      const metadataCountry = authUser.user_metadata?.country || null
      const metadataCity = authUser.user_metadata?.city || null
      const provider = authUser.app_metadata?.provider || 'credentials'

      const { data: newProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert([{
          id: userId,
          email,
          name: metadataName,
          avatar: metadataAvatar,
          provider,
          role: 'user',
          country: metadataCountry,
          city: metadataCity,
        }])
        .select()
        .single()

      if (profileError) {
        console.error('Failed to create user profile on login:', profileError.message)
        userData = { id: userId, email, name: metadataName, avatar: metadataAvatar, role: 'user' }
      } else {
        userData = newProfile
      }
    }

    await logActivity('auth', 'user_login', `User logged in: ${email}`, userId, email, request)

    // Create server-side session and set httpOnly + CSRF cookies
    const sessionToken = await createSession(
      { userId: userData?.id || userId, email: userData?.email || email, role: userData?.role || 'user' },
      request
    )
    const csrfConfig = getCsrfCookieConfig()

    const response = NextResponse.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: userData?.id || userId,
          email: userData?.email || email,
          name: userData?.name || null,
          avatar: userData?.avatar || null,
          role: userData?.role || 'user',
        },
        rememberMe,
      },
    }, { status: 200 })

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
    console.error('Login API error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
