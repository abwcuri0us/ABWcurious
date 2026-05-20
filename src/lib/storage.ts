import { supabaseAdmin } from '@/lib/supabase'
import {
  uploadToB2,
  deleteFromB2,
  buildKey,
  getFileCategory,
  extractB2KeyFromUrl,
  FILE_SIZE_LIMITS,
  ALLOWED_MIME_TYPES,
  type FileCategory,
} from '@/lib/backblaze'
import path from 'path'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUPABASE_BUCKET = 'profile-photos'

// ---------------------------------------------------------------------------
// Profile photo (Supabase Storage)
// ---------------------------------------------------------------------------

/**
 * Upload a profile photo to Supabase Storage.
 *
 * Path: profiles/<userId>/<filename>
 * Bucket: profile-photos
 */
export async function uploadProfilePhoto(
  file: Buffer,
  userId: string,
  filename: string,
): Promise<string> {
  // Validate MIME type
  const ext = path.extname(filename).toLowerCase()
  const mimeMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  }
  const contentType = mimeMap[ext]
  if (!contentType) {
    throw new Error(`Invalid image type. Allowed: ${Object.keys(mimeMap).join(', ')}`)
  }

  // Validate size
  if (file.length > FILE_SIZE_LIMITS.image) {
    throw new Error(`Image exceeds 5 MB limit (got ${(file.length / 1024 / 1024).toFixed(1)} MB)`)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error('Supabase is not configured. Profile photo upload requires Supabase Storage.')
  }

  const key = `profiles/${userId}/${filename}`

  const { error } = await supabaseAdmin.storage
    .from(SUPABASE_BUCKET)
    .upload(key, file, {
      contentType,
      upsert: true,
    })

  if (error) {
    console.error('[Storage] Supabase upload error:', error)
    throw new Error(`Failed to upload profile photo: ${error.message}`)
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(key)

  return urlData.publicUrl
}

/**
 * Delete a profile photo from Supabase Storage.
 */
export async function deleteProfilePhoto(userId: string, filename: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error('Supabase is not configured.')
  }

  const key = `profiles/${userId}/${filename}`

  const { error } = await supabaseAdmin.storage
    .from(SUPABASE_BUCKET)
    .remove([key])

  if (error) {
    console.error('[Storage] Supabase delete error:', error)
    throw new Error(`Failed to delete profile photo: ${error.message}`)
  }
}

// ---------------------------------------------------------------------------
// Blog images (Backblaze B2)
// ---------------------------------------------------------------------------

/**
 * Upload a blog image to Backblaze B2.
 */
export async function uploadBlogImage(
  file: Buffer,
  filename: string,
): Promise<string> {
  const ext = path.extname(filename).toLowerCase()
  const mimeMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  }
  const contentType = mimeMap[ext]
  if (!contentType) {
    throw new Error(`Invalid image type. Allowed: ${Object.keys(mimeMap).join(', ')}`)
  }

  if (file.length > FILE_SIZE_LIMITS.image) {
    throw new Error(`Image exceeds 5 MB limit (got ${(file.length / 1024 / 1024).toFixed(1)} MB)`)
  }

  const key = buildKey('image', filename)
  return uploadToB2(file, key, contentType)
}

// ---------------------------------------------------------------------------
// Documents (Backblaze B2)
// ---------------------------------------------------------------------------

/**
 * Upload a document to Backblaze B2.
 */
export async function uploadDocument(
  file: Buffer,
  filename: string,
): Promise<string> {
  const ext = path.extname(filename).toLowerCase()
  const mimeMap: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
  }
  const contentType = mimeMap[ext]
  if (!contentType) {
    throw new Error(`Invalid document type. Allowed: ${Object.keys(mimeMap).join(', ')}`)
  }

  if (file.length > FILE_SIZE_LIMITS.document) {
    throw new Error(`Document exceeds 10 MB limit (got ${(file.length / 1024 / 1024).toFixed(1)} MB)`)
  }

  const key = buildKey('document', filename)
  return uploadToB2(file, key, contentType)
}

// ---------------------------------------------------------------------------
// Videos (Backblaze B2)
// ---------------------------------------------------------------------------

/**
 * Upload a video to Backblaze B2.
 */
export async function uploadVideo(
  file: Buffer,
  filename: string,
): Promise<string> {
  const ext = path.extname(filename).toLowerCase()
  const mimeMap: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
  }
  const contentType = mimeMap[ext]
  if (!contentType) {
    throw new Error(`Invalid video type. Allowed: ${Object.keys(mimeMap).join(', ')}`)
  }

  if (file.length > FILE_SIZE_LIMITS.video) {
    throw new Error(`Video exceeds 50 MB limit (got ${(file.length / 1024 / 1024).toFixed(1)} MB)`)
  }

  const key = buildKey('video', filename)
  return uploadToB2(file, key, contentType)
}

// ---------------------------------------------------------------------------
// Unified delete
// ---------------------------------------------------------------------------

/**
 * Delete a file by its URL.
 *
 * Routes to Supabase (profile-photos bucket) or Backblaze B2 based on the URL.
 */
export async function deleteFile(url: string): Promise<void> {
  // Check if the URL belongs to Supabase Storage
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  if (supabaseUrl && url.startsWith(supabaseUrl)) {
    // Extract the path from the Supabase URL
    // Typical format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const storagePrefix = `/storage/v1/object/public/${SUPABASE_BUCKET}/`
    const idx = url.indexOf(storagePrefix)
    if (idx !== -1) {
      const filePath = decodeURIComponent(url.slice(idx + storagePrefix.length))
      const { error } = await supabaseAdmin.storage
        .from(SUPABASE_BUCKET)
        .remove([filePath])

      if (error) {
        console.error('[Storage] Supabase delete error:', error)
        throw new Error(`Failed to delete file from Supabase: ${error.message}`)
      }
      return
    }
  }

  // Try Backblaze B2
  const b2Key = extractB2KeyFromUrl(url)
  if (b2Key) {
    await deleteFromB2(b2Key)
    return
  }

  throw new Error('Cannot determine storage provider from the provided URL.')
}

// ---------------------------------------------------------------------------
// Validation helpers (re-exported for convenience)
// ---------------------------------------------------------------------------

export { getFileCategory, FILE_SIZE_LIMITS, ALLOWED_MIME_TYPES, type FileCategory }
