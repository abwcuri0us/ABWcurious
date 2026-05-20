import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, usersDb } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

// Zod schema for login validation
const loginSchema = z.object({
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

    const { email, password } = validationResult.data

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error('Supabase auth login error:', authError)

      const errorMessage = authError.message?.toLowerCase() || ''

      if (
        errorMessage.includes('invalid login credentials') ||
        errorMessage.includes('invalid credentials') ||
        errorMessage.includes('wrong password') ||
        errorMessage.includes('email not confirmed')
      ) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password. Please try again.' },
          { status: 401 }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Login failed. Please try again.' },
        { status: 500 }
      )
    }

    // Find or create user in our users table
    let user = await usersDb.findByEmail(email)

    if (!user) {
      // Create user record if it doesn't exist
      user = await usersDb.create({
        email,
        name: authData.user?.user_metadata?.name || null,
        avatar: authData.user?.user_metadata?.avatar_url || null,
        provider: 'credentials',
        role: 'user',
        country: null,
        city: null,
        pincode: null,
        phone: null,
        date_of_birth: null,
      })
    } else {
      // Update the user's name from Supabase metadata if available
      const metadataName = authData.user?.user_metadata?.name
      if (metadataName && user.name !== metadataName) {
        user = await usersDb.update(user.id, { name: metadataName })
      }
    }

    const userData = user
      ? {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
        }
      : {
          id: authData.user.id,
          email: authData.user.email || '',
          name: authData.user.user_metadata?.name || null,
          avatar: authData.user.user_metadata?.avatar_url || null,
          role: 'user',
        }

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful.',
        data: {
          user: userData,
        },
      },
      { status: 200 }
    )

    // Set httpOnly cookie for access token (secure, SameSite=Strict)
    if (authData.session?.access_token) {
      response.cookies.set('abwcurious_token', authData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    // Set readable cookie for user data (not httpOnly, so frontend can read it)
    response.cookies.set('abwcurious_user', JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
