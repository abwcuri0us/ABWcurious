import { NextRequest, NextResponse } from 'next/server'
import { usersDb, getUserFromToken, supabaseAdmin } from '@/lib/supabase'
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
        pincode: profile.pincode,
        phone: profile.phone,
        date_of_birth: profile.date_of_birth,
        role: profile.role,
        created_at: profile.created_at,
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
      pincode: z.string().regex(/^[a-zA-Z0-9]{5,10}$/).optional().or(z.literal('')).optional(),
      phone: z.string().max(30).optional(),
      date_of_birth: z.string().optional(),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validationResult.error.issues }, { status: 400 })
    }

    const updated = await usersDb.update(user.id, validationResult.data)
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
        pincode: updated.pincode,
        phone: updated.phone,
        date_of_birth: updated.date_of_birth,
        role: updated.role,
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

// POST: Change password
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
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ success: false, error: 'Current password and new password are required.' }, { status: 400 })
      }

      // Update password via Supabase Admin
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
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

      // Delete user from Supabase Auth
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
