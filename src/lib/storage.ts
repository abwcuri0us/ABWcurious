/**
 * Supabase Storage Library
 *
 * Handles file uploads and deletions for:
 * - User profile photos
 * - Career resumes & documents
 * - Event images
 * - General media storage
 *
 * Uses the Supabase admin client (service role) for full storage access.
 * The bucket "abwcurious-uploads" must be created in the Supabase dashboard.
 */

import { supabaseAdmin } from '@/lib/supabase'

const STORAGE_BUCKET = 'ABWcurious'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

function validateFile(fileName: string, contentType: string, size: number): { valid: boolean; error?: string } {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `File extension .${ext} is not allowed` }
  }
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    return { valid: false, error: 'File type is not allowed' }
  }
  if (size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds 5MB limit' }
  }
  return { valid: true }
}

export interface UploadResult {
  fileName: string
  url: string
}

/**
 * Upload a file to Supabase Storage
 * @param buffer - File content as Buffer
 * @param fileName - Target path in the bucket (e.g. "content/covers/123-abc.jpg")
 * @param contentType - MIME type
 * @param size - File size in bytes (required for validation)
 * @returns UploadResult with fileName and public URL
 */
export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  contentType: string = 'application/octet-stream',
  size?: number
): Promise<UploadResult> {
  try {
    if (size !== undefined) {
      const validation = validateFile(fileName, contentType, size)
      if (!validation.valid) {
        throw new Error(validation.error)
      }
    }
    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, buffer, {
        contentType,
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Supabase Storage upload failed: ${uploadError.message}`)
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName)

    const url = urlData.publicUrl

    return { fileName, url }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Unknown error during file upload')
  }
}

/**
 * Delete a file from Supabase Storage
 * @param fileName - Path of the file in the bucket to delete
 */
export async function deleteFile(fileName: string): Promise<void> {
  try {
    const { error: deleteError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([fileName])

    if (deleteError) {
      throw new Error(`Supabase Storage delete failed: ${deleteError.message}`)
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Unknown error during file deletion')
  }
}

/**
 * Get the public URL for a file in Supabase Storage
 * @param fileName - Path of the file in the bucket
 * @returns Public URL string
 */
export function getFileUrl(fileName: string): string {
  const { data } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(fileName)

  return data.publicUrl
}

/**
 * Upload a content cover image
 * Path: content/covers/{timestamp}-{random}.{ext}
 */
export async function uploadContentCover(buffer: Buffer, originalName: string): Promise<UploadResult> {
  const ext = originalName.split('.').pop() || 'jpg'
  const fileName = `content/covers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const contentType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`
  return uploadFile(buffer, fileName, contentType)
}

/**
 * Upload a content image
 * Path: content/images/{timestamp}-{random}.{ext}
 */
export async function uploadContentImage(buffer: Buffer, originalName: string): Promise<UploadResult> {
  const ext = originalName.split('.').pop() || 'jpg'
  const fileName = `content/images/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const contentType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`
  return uploadFile(buffer, fileName, contentType)
}

/**
 * Upload a resume document
 * Path: careers/resumes/{timestamp}-{random}.{ext}
 */
export async function uploadResume(buffer: Buffer, originalName: string): Promise<UploadResult> {
  const ext = originalName.split('.').pop() || 'pdf'
  const fileName = `careers/resumes/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const contentType = ext === 'pdf' ? 'application/pdf' : 'application/octet-stream'
  return uploadFile(buffer, fileName, contentType)
}

/**
 * Upload a user profile photo
 * Path: profiles/{userId}/{timestamp}.{ext}
 */
export async function uploadProfilePhoto(buffer: Buffer, originalName: string, userId: string): Promise<UploadResult> {
  const ext = originalName.split('.').pop() || 'jpg'
  const fileName = `profiles/${userId}/${Date.now()}.${ext}`
  const contentType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`
  return uploadFile(buffer, fileName, contentType)
}

/**
 * Upload an event image
 * Path: events/{timestamp}-{random}.{ext}
 */
export async function uploadEventImage(buffer: Buffer, originalName: string): Promise<UploadResult> {
  const ext = originalName.split('.').pop() || 'jpg'
  const fileName = `events/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const contentType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`
  return uploadFile(buffer, fileName, contentType)
}
