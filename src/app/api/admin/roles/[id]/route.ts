import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, verifyAccess } from '@/lib/supabase'
import { notFoundResponse } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

const updateRoleSchema = z.object({
  description: z.string().max(255).optional(),
  permissions: z.string().optional(),
  name: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z_]+$/, 'Role name must be lowercase letters and underscores only')
    .optional(),
})

// PATCH /api/admin/roles/[id] - Update role permissions (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateResult = checkRateLimit(request, { limit: 10, windowMs: 60_000 })
    if (!rateResult.success) return rateLimitResponse()

    const { authorized } = await verifyAccess(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params

    const { data: existingRole, error: findError } = await supabaseAdmin
      .from('roles')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (findError || !existingRole) return notFoundResponse('Role')

    const body = await request.json()
    const validation = updateRoleSchema.safeParse(body)
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

    // If renaming, check for conflicts
    if (data.name && data.name !== existingRole.name) {
      const { data: conflict } = await supabaseAdmin
        .from('roles')
        .select('id')
        .eq('name', data.name)
        .maybeSingle()

      if (conflict) {
        return NextResponse.json(
          { success: false, error: `Role '${data.name}' already exists` },
          { status: 409 }
        )
      }
    }

    // If renaming a system role, prevent it
    if (existingRole.is_system && data.name && data.name !== existingRole.name) {
      return NextResponse.json(
        { success: false, error: 'Cannot rename a system role' },
        { status: 400 }
      )
    }

    const { data: updatedRole, error: updateError } = await supabaseAdmin
      .from('roles')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Admin role update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update role' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: updatedRole })
  } catch (error) {
    console.error('Admin role update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update role' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/roles/[id] - Delete a role (only non-system roles)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateResult = checkRateLimit(request, { limit: 5, windowMs: 60_000 })
    if (!rateResult.success) return rateLimitResponse()

    const { authorized } = await verifyAccess(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params

    const { data: existingRole, error: findError } = await supabaseAdmin
      .from('roles')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (findError || !existingRole) return notFoundResponse('Role')

    // Cannot delete system roles
    if (existingRole.is_system) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete system roles' },
        { status: 400 }
      )
    }

    // Check if any users have this role
    const { count: usersWithRole, error: countError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', existingRole.name)

    if (!countError && usersWithRole && usersWithRole > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete role '${existingRole.name}' because ${usersWithRole} user(s) are assigned to it. Reassign users first.`,
        },
        { status: 400 }
      )
    }

    const { error: deleteError } = await supabaseAdmin
      .from('roles')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Admin role delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete role' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Role '${existingRole.name}' has been deleted`,
    })
  } catch (error) {
    console.error('Admin role delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete role' },
      { status: 500 }
    )
  }
}
