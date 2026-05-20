import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  S3ClientConfig,
} from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import path from 'path'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const B2_KEY_ID = process.env.BACKBLAZE_KEY_ID || ''
const B2_APPLICATION_KEY = process.env.BACKBLAZE_APPLICATION_KEY || ''
const B2_BUCKET_NAME = process.env.BACKBLAZE_BUCKET_NAME || ''
const B2_ENDPOINT = process.env.BACKBLAZE_ENDPOINT || 'https://s3.us-west-004.backblazeb2.com'

// ---------------------------------------------------------------------------
// File-size limits (bytes)
// ---------------------------------------------------------------------------

export const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024,     // 5 MB
  video: 50 * 1024 * 1024,    // 50 MB
  document: 10 * 1024 * 1024, // 10 MB
} as const

export type FileCategory = keyof typeof FILE_SIZE_LIMITS

// ---------------------------------------------------------------------------
// Allowed MIME types
// ---------------------------------------------------------------------------

export const ALLOWED_MIME_TYPES: Record<FileCategory, string[]> = {
  image: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  video: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
  ],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ],
}

// ---------------------------------------------------------------------------
// S3 client singleton
// ---------------------------------------------------------------------------

let _client: S3Client | null = null

function getClient(): S3Client {
  if (_client) return _client

  const config: S3ClientConfig = {
    region: 'us-west-004',
    endpoint: B2_ENDPOINT,
    credentials: {
      accessKeyId: B2_KEY_ID,
      secretAccessKey: B2_APPLICATION_KEY,
    },
    // B2 does not support chunked encoding for uploads via the S3 API
    forcePathStyle: true,
  }

  _client = new S3Client(config)
  return _client
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Determine the file category from a MIME type.
 */
export function getFileCategory(mimeType: string): FileCategory | null {
  for (const [category, types] of Object.entries(ALLOWED_MIME_TYPES)) {
    if (types.includes(mimeType)) return category as FileCategory
  }
  return null
}

/**
 * Build a unique key with the prescribed folder structure.
 *
 * - images  → uploads/images/<uuid>.<ext>
 * - videos  → uploads/videos/<uuid>.<ext>
 * - documents → uploads/documents/<uuid>.<ext>
 */
export function buildKey(category: FileCategory, originalFilename: string): string {
  const ext = path.extname(originalFilename) || ''
  const uuid = randomUUID()
  return `uploads/${category}s/${uuid}${ext}`
}

/**
 * Return the public URL for a given B2 object key.
 */
export function getB2Url(key: string): string {
  // B2 friendly URL pattern: https://f004.backblazeb2.com/file/<bucket>/<key>
  // We also keep the S3-style URL as a fallback
  const bucket = B2_BUCKET_NAME
  return `https://f004.backblazeb2.com/file/${bucket}/${key}`
}

// ---------------------------------------------------------------------------
// Core operations
// ---------------------------------------------------------------------------

/**
 * Upload a file buffer to Backblaze B2.
 *
 * @param file   - Buffer of the file contents
 * @param key    - Object key (use `buildKey` to generate)
 * @param contentType - MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadToB2(
  file: Buffer,
  key: string,
  contentType: string,
): Promise<string> {
  if (!B2_KEY_ID || !B2_APPLICATION_KEY || !B2_BUCKET_NAME) {
    throw new Error(
      'Backblaze B2 is not configured. Set BACKBLAZE_KEY_ID, BACKBLAZE_APPLICATION_KEY, and BACKBLAZE_BUCKET_NAME environment variables.',
    )
  }

  const client = getClient()

  const command = new PutObjectCommand({
    Bucket: B2_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  })

  await client.send(command)

  return getB2Url(key)
}

/**
 * Delete a file from Backblaze B2 by its object key.
 *
 * @param key - The object key to delete
 */
export async function deleteFromB2(key: string): Promise<void> {
  if (!B2_KEY_ID || !B2_APPLICATION_KEY || !B2_BUCKET_NAME) {
    throw new Error('Backblaze B2 is not configured.')
  }

  const client = getClient()

  const command = new DeleteObjectCommand({
    Bucket: B2_BUCKET_NAME,
    Key: key,
  })

  await client.send(command)
}

/**
 * Extract the B2 object key from a public URL.
 *
 * Accepts both the friendly URL format and the S3-style URL format.
 * Returns `null` if the URL cannot be parsed.
 */
export function extractB2KeyFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url)

    // Friendly URL: https://f004.backblazeb2.com/file/<bucket>/<key>
    const friendlyPrefix = `/file/${B2_BUCKET_NAME}/`
    if (parsed.pathname.startsWith(friendlyPrefix)) {
      return decodeURIComponent(parsed.pathname.slice(friendlyPrefix.length))
    }

    // S3-style URL: https://s3.us-west-004.backblazeb2.com/<bucket>/<key>
    const s3Prefix = `/${B2_BUCKET_NAME}/`
    if (parsed.pathname.startsWith(s3Prefix)) {
      return decodeURIComponent(parsed.pathname.slice(s3Prefix.length))
    }

    return null
  } catch {
    return null
  }
}
