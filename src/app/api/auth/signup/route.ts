import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, usersDb } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

// Zod schema for signup validation
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  country: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().regex(/^\+?\d{7,15}$/, 'Phone must be 7-15 digits with optional + prefix').optional().or(z.literal('')),
  pincode: z.string().regex(/^[a-zA-Z0-9]{5,10}$/, 'Pincode must be 5-10 alphanumeric characters').optional().or(z.literal('')),
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
        { success: false, error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = signupSchema.safeParse(body)

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

    const { email, password, name, country, city, phone, pincode } = validationResult.data

    // Check if user already exists in our users table
    const existingUser = await usersDb.findByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          country: country || null,
          city: city || null,
          phone: phone || null,
          pincode: pincode || null,
        },
      },
    })

    if (authError) {
      console.error('Supabase auth signup error:', authError)

      if (authError.message?.toLowerCase().includes('already registered')) {
        return NextResponse.json(
          { success: false, error: 'An account with this email already exists.' },
          { status: 409 }
        )
      }

      // If Supabase auth fails for any other reason, do NOT create an orphaned user record
      return NextResponse.json(
        { success: false, error: 'Failed to create authentication account. Please try again.' },
        { status: 500 }
      )
    }

    // Create user record in our users table
    const newUser = await usersDb.create({
      email,
      name,
      country: country || null,
      city: city || null,
      phone: phone || null,
      pincode: pincode || null,
      provider: 'credentials',
      role: 'user',
      avatar: null,
      date_of_birth: null,
    })

    if (!newUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to create user account. Please try again.' },
        { status: 500 }
      )
    }

    const userData = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      avatar: newUser.avatar,
    }

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created successfully! Please check your email to verify your account.',
        data: {
          user: userData,
        },
      },
      { status: 201 }
    )

    // Set httpOnly cookie for access token if session was returned
    if (authData?.session?.access_token) {
      response.cookies.set('abwcurious_token', authData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      // Set readable cookie for user data
      response.cookies.set('abwcurious_user', JSON.stringify(userData), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    return response
  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
