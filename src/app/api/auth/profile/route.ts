import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, usersDb, supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

/**
 * GET: Return current user profile (from JWT token)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      )
    }

    const profile = await usersDb.findById(user.id)
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatar: profile.avatar,
        role: profile.role,
        provider: profile.provider,
        country: profile.country,
        city: profile.city,
        bio: profile.bio,
        phone: profile.phone,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      },
    })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile.' },
      { status: 500 }
    )
  }
}

/**
 * PATCH: Update user profile (name, phone, city, country, bio, avatar)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    const rateLimitResult = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Check if this is a password change request
    if (body.currentPassword && body.newPassword) {
      const passwordSchema = z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string()
          .min(8, 'Password must be at least 8 characters')
          .max(128, 'Password is too long')
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
          ),
      })

      const validationResult = passwordSchema.safeParse(body)
      if (!validationResult.success) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: validationResult.error.issues },
          { status: 400 }
        )
      }

      // Verify current password by attempting to sign in
      if (supabaseAdmin) {
        const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
          email: user.email,
          password: validationResult.data.currentPassword,
        })
        if (signInError) {
          return NextResponse.json(
            { success: false, error: 'Current password is incorrect' },
            { status: 401 }
          )
        }

        // Only update if current password is correct
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          user.id,
          { password: validationResult.data.newPassword }
        )

        if (updateError) {
          return NextResponse.json(
            { success: false, error: 'Failed to update password. Please try again.' },
            { status: 500 }
          )
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully.',
      })
    }

    // Profile update request
    const profileSchema = z.object({
      name: z.string().min(2).max(100).optional(),
      phone: z.string().max(30).optional(),
      city: z.string().max(100).optional(),
      country: z.string().max(100).optional(),
      bio: z.string().max(500).optional(),
      avatar: z.string().url().optional().or(z.literal('')).optional(),
    })

    const validationResult = profileSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (validationResult.data.name !== undefined) updateData.name = validationResult.data.name
    if (validationResult.data.phone !== undefined) updateData.phone = validationResult.data.phone
    if (validationResult.data.city !== undefined) updateData.city = validationResult.data.city
    if (validationResult.data.country !== undefined) updateData.country = validationResult.data.country
    if (validationResult.data.bio !== undefined) updateData.bio = validationResult.data.bio
    if (validationResult.data.avatar !== undefined) updateData.avatar = validationResult.data.avatar || null

    const updatedUser = await usersDb.update(user.id, updateData)

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        phone: updatedUser.phone,
        city: updatedUser.city,
        country: updatedUser.country,
        bio: updatedUser.bio,
        provider: updatedUser.provider,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
      },
    })
  } catch (error) {
    console.error('Profile PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile.' },
      { status: 500 }
    )
  }
}
