import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, usersDb, verifyAccess, getUserFromToken } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// GET: List all users
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    // Also try cookie-based auth
    const cookieToken = request.cookies.get('abwcurious_token')?.value
    const accessToken = token || cookieToken

    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const { authorized } = await verifyAccess(accessToken, ['admin', 'editor'])
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const users = await usersDb.listWithSelect('id, email, name, role, provider, created_at')

    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('Admin users list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch users.' }, { status: 500 })
  }
}

// POST: Create a new user (admin creates team members)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    const cookieToken = request.cookies.get('abwcurious_token')?.value
    const accessToken = token || cookieToken

    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const { authorized, user: adminUser } = await verifyAccess(accessToken, ['admin', 'editor'])
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

    // Check if user already exists
    const existing = await usersDb.findByEmail(email)
    if (existing) {
      return NextResponse.json({ success: false, error: 'User with this email already exists.' }, { status: 409 })
    }

    // Create in Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    })

    if (authError) {
      console.warn('Supabase user creation failed:', authError.message)
    }

    // Create in our users table
    const newUser = await usersDb.create({
      email,
      name,
      role,
      provider: 'credentials',
      avatar: null,
      country: null,
      city: null,
      pincode: null,
      phone: null,
      date_of_birth: null,
    })

    if (!newUser) {
      return NextResponse.json({ success: false, error: 'Failed to create user.' }, { status: 500 })
    }

    return NextResponse.json(
      { success: true, message: 'User created successfully.', data: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } },
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
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    const cookieToken = request.cookies.get('abwcurious_token')?.value
    const accessToken = token || cookieToken

    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const { authorized, user: requestingUser } = await verifyAccess(accessToken, ['admin', 'editor'])
    if (!authorized || !requestingUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const body = await request.json()
    const schema = z.object({
      userId: z.string(),
      role: z.enum(['admin', 'editor', 'author', 'user']),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed.' }, { status: 400 })
    }

    const { userId, role } = validationResult.data

    // Self-protection: a user cannot change their own role
    if (userId === requestingUser.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot change your own role.' },
        { status: 403 }
      )
    }

    const user = await usersDb.update(userId, { role })

    if (!user) {
      return NextResponse.json({ success: false, error: 'Failed to update user.' }, { status: 500 })
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
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    const cookieToken = request.cookies.get('abwcurious_token')?.value
    const accessToken = token || cookieToken

    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const { authorized, user: requestingUser } = await verifyAccess(accessToken, ['admin', 'editor'])
    if (!authorized || !requestingUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 })
    }

    // Self-protection: a user cannot delete themselves
    if (userId === requestingUser.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot delete your own account.' },
        { status: 403 }
      )
    }

    // Look up the target user to check their role
    const targetUser = await usersDb.findById(userId)
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 })
    }

    // Prevent deletion of the last admin
    if (targetUser.role === 'admin') {
      const allUsers = await usersDb.listWithSelect('id, role')
      const adminCount = allUsers.filter((u) => u.role === 'admin').length
      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete the last admin user. Assign another admin first.' },
          { status: 403 }
        )
      }
    }

    const deleted = await usersDb.delete(userId)
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Failed to delete user.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'User deleted.' })
  } catch (error) {
    console.error('Admin delete user error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete user.' }, { status: 500 })
  }
}
