import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyAccess } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

// GET: List files in profile-photos bucket
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    const cookieToken = request.cookies.get('abwcurious_token')?.value
    const accessToken = token || cookieToken

    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const { authorized } = await verifyAccess(accessToken, ['admin', 'editor'])
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 20, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    // List files in profile-photos bucket
    const { data, error } = await supabaseAdmin.storage
      .from('profile-photos')
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) {
      console.error('Storage list error:', error)
      return NextResponse.json({ success: false, error: 'Failed to list files.' }, { status: 500 })
    }

    const files = (data || []).map((file) => ({
      id: file.id,
      name: file.name,
      size: file.metadata?.size || 0,
      created_at: file.created_at,
      metadata: {
        uploadedBy: file.metadata?.uploadedBy || null,
      },
    }))

    const totalSize = files.reduce((sum, f) => sum + f.size, 0)

    return NextResponse.json({ success: true, data: { files, totalSize } })
  } catch (error) {
    console.error('Admin storage error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch storage.' }, { status: 500 })
  }
}

// DELETE: Remove a file
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    const cookieToken = request.cookies.get('abwcurious_token')?.value
    const accessToken = token || cookieToken

    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const { authorized } = await verifyAccess(accessToken, ['admin', 'editor'])
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const rateLimitResult = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('name')
    if (!fileName) {
      return NextResponse.json({ success: false, error: 'File name is required.' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.storage
      .from('profile-photos')
      .remove([fileName])

    if (error) {
      console.error('Storage delete error:', error)
      return NextResponse.json({ success: false, error: 'Failed to delete file.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'File deleted.' })
  } catch (error) {
    console.error('Admin storage delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete file.' }, { status: 500 })
  }
}
