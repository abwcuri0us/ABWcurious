import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, verifyAccess } from '@/lib/supabase'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { randomUUID } from 'crypto'

const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Role name must be at least 2 characters')
    .max(50, 'Role name is too long')
    .regex(/^[a-z_]+$/, 'Role name must be lowercase letters and underscores only'),
  description: z.string().max(255).optional(),
  permissions: z.string().optional(),
})

// GET /api/admin/roles - List all roles (admin only)
export async function GET(request: NextRequest) {
  try {
    const rateResult = checkRateLimit(request, { limit: 30, windowMs: 60_000 })
    if (!rateResult.success) return rateLimitResponse()

    const { authorized } = await verifyAccess(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const { data: roles, error } = await supabaseAdmin
      .from('roles')
      .select('*')
      .order('is_system', { ascending: false })

    if (error) {
      console.error('Admin roles list error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch roles' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: roles })
  } catch (error) {
    console.error('Admin roles list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
}

// POST /api/admin/roles - Create a custom role (admin only)
export async function POST(request: NextRequest) {
  try {
    const rateResult = checkRateLimit(request, { limit: 10, windowMs: 60_000 })
    if (!rateResult.success) return rateLimitResponse()

    const { authorized } = await verifyAccess(request)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const validation = createRoleSchema.safeParse(body)
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

    const { name, description, permissions } = validation.data

    // Check if role already exists
    const { data: existing } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', name)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Role '${name}' already exists` },
        { status: 409 }
      )
    }

    const { data: role, error: createError } = await supabaseAdmin
      .from('roles')
      .insert([{
        id: randomUUID(),
        name,
        description: description || null,
        permissions: permissions || '',
        is_system: false,
      }])
      .select()
      .single()

    if (createError) {
      console.error('Admin role create error:', createError)
      return NextResponse.json(
        { success: false, error: 'Failed to create role' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data: role },
      { status: 201 }
    )
  } catch (error) {
    console.error('Admin role create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create role' },
      { status: 500 }
    )
  }
}
