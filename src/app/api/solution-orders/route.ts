import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getCurrentUser, verifyAdmin, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// POST: Order a solution (authenticated users)
export async function POST(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: false, error: 'Service temporarily unavailable. Please try again later.' }, { status: 503 })
    }

    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 5, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const body = await request.json()
    const schema = z.object({
      solution_id: z.string().uuid('Invalid solution ID'),
      notes: z.string().max(1000).optional().nullable(),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validationResult.error.issues }, { status: 400 })
    }

    const { solution_id, notes } = validationResult.data

    // Verify solution exists and is active
    const { data: solution, error: solutionError } = await supabaseAdmin
      .from('solutions')
      .select('id, name, is_active')
      .eq('id', solution_id)
      .single()

    if (solutionError || !solution) {
      return NextResponse.json({ success: false, error: 'Solution not found.' }, { status: 404 })
    }

    if (!solution.is_active) {
      return NextResponse.json({ success: false, error: 'This solution is not currently available.' }, { status: 400 })
    }

    // Check if user already has a pending order for this solution
    const { data: existing } = await supabaseAdmin
      .from('solution_orders')
      .select('id, status')
      .eq('solution_id', solution_id)
      .eq('user_id', user.id)
      .neq('status', 'cancelled')
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ success: false, error: 'You already have an active order for this solution.' }, { status: 409 })
    }

    const insertData: Record<string, unknown> = {
      solution_id,
      user_id: user.id,
      status: 'pending',
    }

    if (notes) insertData.notes = notes

    const { data: order, error } = await supabaseAdmin
      .from('solution_orders')
      .insert([insertData])
      .select('*, solution:solutions(id, name, slug)')
      .single()

    if (error) {
      console.error('Solution order create error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to place order.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: order, message: 'Order placed successfully.' }, { status: 201 })
  } catch (error) {
    console.error('Solution order error:', error)
    return NextResponse.json({ success: false, error: 'Failed to place order.' }, { status: 500 })
  }
}

// GET: Get user's solution orders (authenticated), or all orders (admin)
export async function GET(request: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json({ success: true, data: [] })
    }

    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    const { authorized } = await verifyAdmin(request)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    if (authorized) {
      // Admin can see all orders
      let query = supabaseAdmin
        .from('solution_orders')
        .select('*, solution:solutions(id, name, slug), profile:profiles(id, name, email)')
        .order('created_at', { ascending: false })

      if (status && ['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
        query = query.eq('status', status)
      }

      const { data: orders, error } = await query

      if (error) {
        console.error('Solution orders fetch error:', error.message)
        return NextResponse.json({ success: false, error: 'Failed to fetch orders.' }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: orders })
    }

    // Regular user sees only their own orders
    let query = supabaseAdmin
      .from('solution_orders')
      .select('*, solution:solutions(id, name, slug)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status && ['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      query = query.eq('status', status)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('User solution orders fetch error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to fetch orders.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: orders })
  } catch (error) {
    console.error('Solution orders error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch orders.' }, { status: 500 })
  }
}

// PATCH: Update solution order status (admin only)
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
      id: z.string().uuid('Invalid order ID'),
      status: z.enum(['pending', 'processing', 'completed', 'cancelled']),
      notes: z.string().max(1000).optional(),
    })

    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: validationResult.error.issues }, { status: 400 })
    }

    const { id, status, notes } = validationResult.data

    const updateData: Record<string, unknown> = { status }
    if (notes !== undefined) updateData.notes = notes

    const { data: order, error } = await supabaseAdmin
      .from('solution_orders')
      .update(updateData)
      .eq('id', id)
      .select('*, solution:solutions(id, name, slug), profile:profiles(id, name, email)')
      .single()

    if (error) {
      console.error('Solution order update error:', error.message)
      return NextResponse.json({ success: false, error: 'Failed to update order.' }, { status: 500 })
    }

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error('Solution order update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update order.' }, { status: 500 })
  }
}
