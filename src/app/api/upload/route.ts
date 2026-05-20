import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, usersDb, getUserFromToken } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import {
  uploadProfilePhoto,
  uploadBlogImage,
  uploadDocument,
  uploadVideo,
  deleteFile,
} from '@/lib/storage'
import { getFileCategory, FILE_SIZE_LIMITS, type FileCategory } from '@/lib/backblaze'

// ---------------------------------------------------------------------------
// Upload type definition
// ---------------------------------------------------------------------------

type UploadType = 'profile-photo' | 'blog-image' | 'document' | 'video'

const VALID_UPLOAD_TYPES: UploadType[] = ['profile-photo', 'blog-image', 'document', 'video']

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

async function verifyAuth(request: NextRequest): Promise<{ userId: string; email: string } | null> {
  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader?.replace('Bearer ', '')
  const cookieToken = request.cookies.get('abwcurious_token')?.value
  const accessToken = headerToken || cookieToken

  if (!accessToken) return null

  const user = await getUserFromToken(accessToken)
  if (!user) return null

  return { userId: user.id, email: user.email }
}

// ---------------------------------------------------------------------------
// POST — Upload a file
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    const rateLimitResult = rateLimit(ip, { limit: 20, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many upload attempts. Please try again later.' },
        { status: 429 },
      )
    }

    // Auth check
    const authUser = await verifyAuth(request)
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 },
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided.' },
        { status: 400 },
      )
    }

    if (!type || !VALID_UPLOAD_TYPES.includes(type as UploadType)) {
      return NextResponse.json(
        { success: false, error: `Invalid upload type. Must be one of: ${VALID_UPLOAD_TYPES.join(', ')}` },
        { status: 400 },
      )
    }

    const uploadType = type as UploadType

    // Validate MIME type and size
    const mimeType = file.type
    const fileSize = file.size

    // Determine expected category
    const expectedCategory: FileCategory | null =
      uploadType === 'profile-photo' || uploadType === 'blog-image'
        ? 'image'
        : uploadType === 'video'
          ? 'video'
          : 'document'

    const actualCategory = getFileCategory(mimeType)
    if (!actualCategory || actualCategory !== expectedCategory) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type "${mimeType}" for upload type "${uploadType}". Expected ${expectedCategory} file.`,
        },
        { status: 400 },
      )
    }

    // Validate size
    const sizeLimit = FILE_SIZE_LIMITS[expectedCategory]
    if (fileSize > sizeLimit) {
      const limitMB = sizeLimit / (1024 * 1024)
      const fileMB = fileSize / (1024 * 1024)
      return NextResponse.json(
        {
          success: false,
          error: `File exceeds ${limitMB} MB size limit for ${expectedCategory}s (got ${fileMB.toFixed(1)} MB).`,
        },
        { status: 400 },
      )
    }

    // Convert to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Route to appropriate storage
    let url: string

    switch (uploadType) {
      case 'profile-photo':
        url = await uploadProfilePhoto(buffer, authUser.userId, file.name)
        break
      case 'blog-image':
        url = await uploadBlogImage(buffer, file.name)
        break
      case 'document':
        url = await uploadDocument(buffer, file.name)
        break
      case 'video':
        url = await uploadVideo(buffer, file.name)
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Unknown upload type.' },
          { status: 400 },
        )
    }

    // If it's a profile photo, also update the user's avatar in the DB
    if (uploadType === 'profile-photo') {
      await usersDb.update(authUser.userId, { avatar: url })
    }

    return NextResponse.json(
      { success: true, url },
      { status: 200 },
    )
  } catch (error) {
    console.error('[Upload API] Error:', error)
    const message = error instanceof Error ? error.message : 'Upload failed.'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// DELETE — Remove a file
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    const rateLimitResult = rateLimit(ip, { limit: 20, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests.' },
        { status: 429 },
      )
    }

    // Auth check
    const authUser = await verifyAuth(request)
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 },
      )
    }

    const body = await request.json()
    const deleteSchema = z.object({
      url: z.string().url('A valid file URL is required.'),
    })
    const validation = deleteSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.issues },
        { status: 400 },
      )
    }

    const { url } = validation.data

    await deleteFile(url)

    // If the URL was the user's avatar, clear it
    const user = await usersDb.findById(authUser.userId)
    if (user?.avatar === url) {
      await usersDb.update(authUser.userId, { avatar: null })
    }

    return NextResponse.json(
      { success: true, message: 'File deleted successfully.' },
      { status: 200 },
    )
  } catch (error) {
    console.error('[Upload API] Delete error:', error)
    const message = error instanceof Error ? error.message : 'Delete failed.'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    )
  }
}
