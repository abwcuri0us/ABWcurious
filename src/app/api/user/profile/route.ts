import { NextRequest, NextResponse } from 'next/server'
import { usersDb, getUserFromToken } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// GET: Get current user profile
export async function GET(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get('abwcurious_token')?.value
    const authHeader = request.headers.get('authorization')
    const headerToken = authHeader?.replace('Bearer ', '')
    const token = cookieToken || headerToken

    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const profile = await usersDb.findById(user.id)
    if (!profile) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatar: profile.avatar,
        country: profile.country,
        city: profile.city,
        bio: profile.bio,
        phone: profile.phone,
        role: profile.role,
        provider: profile.provider,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      },
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch profile.' }, { status: 500 })
  }
}

// PATCH: Update current user profile
export async function PATCH(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get('abwcurious_token')?.value
    const authHeader = request.headers.get('authorization')
    const headerToken = authHeader?.replace('Bearer ', '')
    const token = cookieToken || headerToken

    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const body = await request.json()
    const schema = z.object({
      name: z.string().min(1).max(100).optional(),
      avatar: z.string().url().optional().or(z.literal('')).optional(),
      country: z.string().max(100).optional(),
      city: z.string().max(100).optional(),
      bio: z.string().max(500).optional(),
      phone: z.string().max(30).optional(),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validationResult.error.issues }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    const data = validationResult.data
    if (data.name !== undefined) updateData.name = data.name
    if (data.avatar !== undefined) updateData.avatar = data.avatar || null
    if (data.country !== undefined) updateData.country = data.country
    if (data.city !== undefined) updateData.city = data.city
    if (data.bio !== undefined) updateData.bio = data.bio
    if (data.phone !== undefined) updateData.phone = data.phone

    const updated = await usersDb.update(user.id, updateData)
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Failed to update profile.' }, { status: 500 })
    }

    // Update the user cookie with new data
    const response = NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        avatar: updated.avatar,
        country: updated.country,
        city: updated.city,
        bio: updated.bio,
        phone: updated.phone,
        role: updated.role,
        provider: updated.provider,
        created_at: updated.created_at,
        updated_at: updated.updated_at,
      },
    })

    // Update readable user cookie
    const userData = {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      avatar: updated.avatar,
      role: updated.role,
    }
    response.cookies.set('abwcurious_user', JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update profile.' }, { status: 500 })
  }
}

// POST: Change password or delete account
export async function POST(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get('abwcurious_token')?.value
    const authHeader = request.headers.get('authorization')
    const headerToken = authHeader?.replace('Bearer ', '')
    const token = cookieToken || headerToken

    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown'
    const rl = rateLimit(ip, { limit: 3, windowMs: 60_000 })
    if (!rl.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const body = await request.json()
    const schema = z.object({
      action: z.enum(['change-password', 'delete-account']),
      currentPassword: z.string().min(1).optional(),
      newPassword: z.string().min(8).max(128).optional(),
      confirmDelete: z.string().optional(),
    })

    const validation = schema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validation.error.issues }, { status: 400 })
    }

    const { action, currentPassword, newPassword, confirmDelete } = validation.data

    if (action === 'change-password') {
      if (!newPassword) {
        return NextResponse.json({ success: false, error: 'New password is required.' }, { status: 400 })
      }

      if (!currentPassword) {
        return NextResponse.json({ success: false, error: 'Current password is required.' }, { status: 400 })
      }

      // Verify current password by attempting to sign in
      const { supabaseAdmin: admin } = await import('@/lib/supabase')
      const { error: signInError } = await admin.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })
      if (signInError) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 401 }
        )
      }

      // Only update if current password is correct
      const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
        password: newPassword,
      })

      if (updateError) {
        console.error('Password change error:', updateError)
        return NextResponse.json({ success: false, error: 'Failed to change password.' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Password changed successfully.' })
    }

    if (action === 'delete-account') {
      if (confirmDelete !== 'DELETE') {
        return NextResponse.json({ success: false, error: 'Please type DELETE to confirm account deletion.' }, { status: 400 })
      }

      const { supabaseAdmin } = await import('@/lib/supabase')
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
      if (deleteError) {
        console.error('Account delete error:', deleteError)
        return NextResponse.json({ success: false, error: 'Failed to delete account.' }, { status: 500 })
      }

      // Delete user from our table
      await usersDb.delete(user.id)

      const response = NextResponse.json({ success: true, message: 'Account deleted successfully.' })

      // Clear cookies
      response.cookies.set('abwcurious_token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 })
      response.cookies.set('abwcurious_user', '', { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 })

      return response
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 })
  } catch (error) {
    console.error('Profile POST error:', error)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
