import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, verifyAccess } from '@/lib/supabase'
import { notFoundResponse } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { randomUUID } from 'crypto'

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.string().min(1).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
})

// GET /api/admin/users/[id] - Get a single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateResult = checkRateLimit(request, { limit: 30, windowMs: 60_000 })
    if (!rateResult.success) return rateLimitResponse()

    const { authorized } = await verifyAccess(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params

    const { data: user, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, name, phone, city, country, pincode, avatar, provider, role, created_at, updated_at')
      .eq('id', id)
      .maybeSingle()

    if (error || !user) return notFoundResponse('User')

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Admin user get error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/users/[id] - Update a user (role, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateResult = checkRateLimit(request, { limit: 10, windowMs: 60_000 })
    if (!rateResult.success) return rateLimitResponse()

    const { authorized, user: authUser } = await verifyAccess(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params

    const { data: existingUser, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (findError || !existingUser) return notFoundResponse('User')

    // Prevent admin from deactivating themselves
    if (authUser?.id === id) {
      const body = await request.json().catch(() => ({}))
      if (body.isActive === false) {
        return NextResponse.json(
          { success: false, error: 'You cannot deactivate your own account' },
          { status: 400 }
        )
      }
    }

    const body = await request.json()
    const validation = updateUserSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    const data = validation.data

    // If role is being changed, verify the new role is valid
    if (data.role) {
      const validRoles = ['admin', 'editor', 'author', 'user']
      if (!validRoles.includes(data.role)) {
        return NextResponse.json(
          { success: false, error: `Role '${data.role}' does not exist` },
          { status: 400 }
        )
      }
    }

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(data)
      .eq('id', id)
      .select('id, email, name, role, updated_at')
      .single()

    if (updateError) {
      console.error('Admin user update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: updatedUser })
  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Soft delete (deactivate) a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateResult = checkRateLimit(request, { limit: 5, windowMs: 60_000 })
    if (!rateResult.success) return rateLimitResponse()

    const { authorized, user: authUser } = await verifyAccess(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params

    // Prevent admin from deleting themselves
    if (authUser?.id === id) {
      return NextResponse.json(
        { success: false, error: 'You cannot delete your own account' },
        { status: 400 }
      )
    }

    const { data: existingUser, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (findError || !existingUser) return notFoundResponse('User')

    // Soft delete: deactivate the user by setting role to 'deactivated'
    const { data: deactivatedUser, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'deactivated' })
      .eq('id', id)
      .select('id, email, name, role')
      .single()

    if (updateError) {
      console.error('Admin user delete error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: deactivatedUser,
      message: 'User has been deactivated',
    })
  } catch (error) {
    console.error('Admin user delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
