import { NextRequest, NextResponse } from 'next/server'
import { getFileUrl } from '@/lib/storage'

/**
 * GET /api/files?path=<filePath>
 * Proxies file downloads from Cloudflare R2 storage.
 * If R2_PUBLIC_URL is configured and bucket is public, redirects directly.
 * Otherwise, generates a presigned URL and redirects.
 */
export async function GET(request: NextRequest) {
  try {
    const filePath = request.nextUrl.searchParams.get('path')
    if (!filePath) {
      return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 })
    }

    // Security: prevent path traversal
    if (filePath.includes('..') || filePath.startsWith('/')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    const publicUrl = process.env.R2_PUBLIC_URL || ''

    // If we have a public URL configured, redirect directly
    if (publicUrl) {
      const directUrl = `${publicUrl}/${filePath}`
      return NextResponse.redirect(directUrl)
    }

    // Otherwise, use the public URL from Supabase Storage
    try {
      const publicUrl = getFileUrl(filePath)
      return NextResponse.redirect(publicUrl)
    } catch (urlError) {
      console.error('[Files API] Failed to get file URL:', urlError)
      return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
    }
  } catch (error) {
    console.error('[Files API] Error:', error)
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
  }
}
