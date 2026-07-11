import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

const updateOrderSchema = z.object({
  status: z.enum(['new', 'in_review', 'accepted', 'rejected', 'completed']).optional(),
  notes: z.string().max(5000).optional(),
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().max(200).optional(),
  orderType: z.enum(['Website', 'Software App', 'Security Solution', 'Consulting', 'Custom']).optional(),
  description: z.string().min(10).max(5000).optional(),
  budget: z.enum(['Under ₹50K', '₹50K-2L', '₹2L-5L', '₹5L-10L', '₹10L+', 'Not Sure']).optional(),
  timeline: z.enum(['ASAP', '1 Month', '2-3 Months', '3-6 Months', 'Flexible']).optional(),
})

// GET /api/orders/[id] - Get a single order (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 60, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to view orders')

    const { id } = await params
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error || !order) return notFoundResponse('Order')

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error('Order get error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PATCH /api/orders/[id] - Update an order (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 10, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to update orders')

    const { id } = await params
    const { data: order, error: findError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (findError || !order) return notFoundResponse('Order')

    const body = await request.json()
    const validation = updateOrderSchema.safeParse(body)
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

    // Map camelCase to snake_case for Supabase
    const updateData: Record<string, unknown> = {}
    if (validation.data.status !== undefined) updateData.status = validation.data.status
    if (validation.data.notes !== undefined) updateData.notes = validation.data.notes
    if (validation.data.name !== undefined) updateData.name = validation.data.name
    if (validation.data.email !== undefined) updateData.email = validation.data.email
    if (validation.data.phone !== undefined) updateData.phone = validation.data.phone
    if (validation.data.company !== undefined) updateData.company = validation.data.company
    if (validation.data.orderType !== undefined) updateData.order_type = validation.data.orderType
    if (validation.data.description !== undefined) updateData.description = validation.data.description
    if (validation.data.budget !== undefined) updateData.budget = validation.data.budget
    if (validation.data.timeline !== undefined) updateData.timeline = validation.data.timeline

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Order update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update order' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: updatedOrder })
  } catch (error) {
    console.error('Order update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

// DELETE /api/orders/[id] - Delete an order (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlResult = checkRateLimit(request, { limit: 5, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required to delete orders')

    const { id } = await params
    const { data: order, error: findError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (findError || !order) return notFoundResponse('Order')

    const { error: deleteError } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Order delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete order' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
    })
  } catch (error) {
    console.error('Order delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}
