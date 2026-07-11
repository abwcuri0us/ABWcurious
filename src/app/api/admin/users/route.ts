import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyAdmin, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// GET: List all users
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    const rlResult = rateLimit(ip, { limit: 30, windowMs: 60_000 })
    if (!rlResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 })
    }

    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, name, role, provider, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase users fetch error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to fetch users.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('Admin users list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch users.' }, { status: 500 })
  }
}

// POST: Create a new user (admin creates team members)
export async function POST(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized, user: adminUser } = await verifyAdmin(request)
    if (!authorized || !adminUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
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
      email: z.string().email('Invalid email address'),
      name: z.string().min(2, 'Name must be at least 2 characters').max(100),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      role: z.enum(['admin', 'editor', 'author', 'user']).default('user'),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { email, name, password, role } = validationResult.data

    // Check if user already exists in profiles table
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ success: false, error: 'User with this email already exists.' }, { status: 409 })
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    })

    if (authError) {
      console.error('Supabase user creation failed:', authError.message)
      return NextResponse.json({ success: false, error: 'Failed to create user in auth system.' }, { status: 500 })
    }

    // Create profile in Supabase profiles table
    const userId = authData.user?.id
    if (userId) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert([{
          id: userId,
          email,
          name,
          role,
          provider: 'credentials',
        }])

      if (profileError) {
        console.error('Failed to create user profile:', profileError.message)
      }
    }

    return NextResponse.json(
      { success: true, message: 'User created successfully.', data: { id: userId, email, name, role } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Admin create user error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create user.' }, { status: 500 })
  }
}

// PATCH: Update user role
export async function PATCH(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const body = await request.json()
    const schema = z.object({
      userId: z.string(),
      role: z.enum(['admin', 'editor', 'author', 'user']),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed.', details: validationResult.error.issues }, { status: 400 })
    }

    const { userId, role } = validationResult.data

    const { data: user, error } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select('id, email, role')
      .single()

    if (error) {
      console.error('Admin update user error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to update user.' }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: { id: user.id, email: user.email, role: user.role } })
  } catch (error) {
    console.error('Admin update user error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update user.' }, { status: 500 })
  }
}

// DELETE: Remove a user
export async function DELETE(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured.' }, { status: 503 })
    }

    const { authorized } = await verifyAdmin(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 })
    }

    // Delete from profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Admin delete user profile error:', profileError.message)
      return NextResponse.json({ success: false, error: 'Failed to delete user.' }, { status: 500 })
    }

    // Also try to delete from Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (authError) {
      console.warn('Failed to delete user from Supabase Auth:', authError.message)
    }

    return NextResponse.json({ success: true, message: 'User deleted.' })
  } catch (error) {
    console.error('Admin delete user error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete user.' }, { status: 500 })
  }
}
