import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, getCurrentUser } from '@/lib/supabase'
import { unauthorizedResponse, forbiddenResponse } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { randomUUID } from 'crypto'
import { validateCsrfRequest } from '@/lib/csrf'

const createOrderSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().refine(
    (val) => !val || /^[\+]?[\d\s\-\(\)]{7,20}$/.test(val),
    'Invalid phone number format'
  ),
  company: z.string().max(200).optional(),
  orderType: z.enum(['Website', 'Software App', 'Security Solution', 'Consulting', 'Custom'], {
    message: 'Please select a valid order type',
  }),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  budget: z.enum(['Under ₹50K', '₹50K-2L', '₹2L-5L', '₹5L-10L', '₹10L+', 'Not Sure']).optional(),
  timeline: z.enum(['ASAP', '1 Month', '2-3 Months', '3-6 Months', 'Flexible']).optional(),
})

// POST /api/orders - Public: Submit an order
export async function POST(request: NextRequest) {
  try {
    if (!validateCsrfRequest(request)) {
      return NextResponse.json({ success: false, error: 'Invalid CSRF token' }, { status: 403 })
    }

    const rlResult = checkRateLimit(request, { limit: 3, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const body = await request.json()
    const validation = createOrderSchema.safeParse(body)
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

    const { name, email, phone, company, orderType, description, budget, timeline } = validation.data

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert([{
        id: randomUUID(),
        name,
        email,
        phone: phone || null,
        company: company || null,
        order_type: orderType,
        description,
        budget: budget || null,
        timeline: timeline || null,
        status: 'new',
      }])
      .select()
      .single()

    if (error) {
      console.error('Order create error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to submit order. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Order submitted successfully! We will contact you soon.', data: { id: order.id } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Order create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit order. Please try again.' },
      { status: 500 }
    )
  }
}

// GET /api/orders - Admin: List all orders
export async function GET(request: NextRequest) {
  try {
    const rlResult = checkRateLimit(request, { limit: 60, windowMs: 60 * 1000 })
    if (!rlResult.success) return rateLimitResponse()

    const user = await getCurrentUser(request)
    if (!user) return unauthorizedResponse()
    if (!['admin', 'editor'].includes(user.role)) return forbiddenResponse('Admin access required')

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const status = searchParams.get('status') || ''
    const orderType = searchParams.get('orderType') || ''

    let query = supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, (page - 1) * limit + limit - 1)

    if (status) query = query.eq('status', status)
    if (orderType) query = query.eq('order_type', orderType)

    const { data: orders, error, count } = await query

    if (error) {
      console.error('Orders list error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    const total = count ?? 0

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Orders list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
