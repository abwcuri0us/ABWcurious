import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, usersDb } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { getSessionFromRequest } from '@/lib/sessions'
import { z } from 'zod'

// GET: Get current user profile
export async function GET(request: NextRequest) {
  try {
    const sessionResult = await getSessionFromRequest(request)
    if (!sessionResult.valid || !sessionResult.userId) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const profile = await usersDb.findById(sessionResult.userId)
    if (!profile) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: profile.id,
        email: profile.email,
        name: profile.name || profile.full_name,
        avatar: profile.avatar || profile.avatar_url,
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
    const sessionResult = await getSessionFromRequest(request)
    if (!sessionResult.valid || !sessionResult.userId) {
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

    const updated = await usersDb.update(sessionResult.userId, updateData)
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Failed to update profile.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        email: updated.email,
        name: updated.name || updated.full_name,
        avatar: updated.avatar || updated.avatar_url,
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
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update profile.' }, { status: 500 })
  }
}

// POST: Change password or delete account
export async function POST(request: NextRequest) {
  try {
    const sessionResult = await getSessionFromRequest(request)
    if (!sessionResult.valid || !sessionResult.userId) {
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

      // Get user email from profile
      const profile = await usersDb.findById(sessionResult.userId)
      if (!profile) {
        return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 })
      }

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email: profile.email,
        password: currentPassword,
      })
      if (signInError) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 401 }
        )
      }

      // Update password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(sessionResult.userId, {
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

      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(sessionResult.userId)
      if (deleteError) {
        console.error('Account delete error:', deleteError)
        return NextResponse.json({ success: false, error: 'Failed to delete account.' }, { status: 500 })
      }

      await usersDb.delete(sessionResult.userId)

      const response = NextResponse.json({ success: true, message: 'Account deleted successfully.' })
      response.cookies.set('abwcurious_session', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 })
      response.cookies.set('abwcurious_csrf', '', { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 })
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
