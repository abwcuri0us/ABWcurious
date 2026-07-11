import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase, isConfigured } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

// Zod schema for OAuth initiation
const oauthSchema = z.object({
  provider: z.enum(['google', 'github']),
})

export async function POST(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ success: false, error: 'Auth not configured' }, { status: 503 })
  }

  // Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'

  const rateLimitResult = rateLimit(`oauth:${ip}`, { limit: 10, windowMs: 60_000 })
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many OAuth attempts. Please try again later.' },
      { status: 429 }
    )
  }

  // Parse and validate request body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 })
  }

  const validationResult = oauthSchema.safeParse(body)
  if (!validationResult.success) {
    return NextResponse.json({ success: false, error: 'Invalid provider. Supported: google, github' }, { status: 400 })
  }

  const { provider } = validationResult.data

  // Use the production APP URL for OAuth redirect
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.abwcurious.com'
  const redirectTo = `${baseUrl}/api/auth/callback`

  try {
    // Use the anon client for signInWithOAuth — this generates the proper
    // OAuth URL with the correct PKCE challenge that exchangeCodeForSession
    // expects. The service_role client generates a different challenge that
    // can't be exchanged later.
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    })

    if (error) {
      console.error(`[OAuth] signInWithOAuth error for ${provider}:`, error.message)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const oauthUrl = data.url || ''

    // Validate the returned URL does NOT contain localhost
    if (oauthUrl.includes('localhost') || oauthUrl.includes('127.0.0.1')) {
      console.error(`[OAuth] WARNING: Generated OAuth URL contains localhost for ${provider}.`)
      console.error(`[OAuth] Supabase Dashboard Site URL must be set to: ${baseUrl}`)
      return NextResponse.json({
        success: false,
        error: `OAuth is not configured correctly. Please contact support.`,
      }, { status: 500 })
    }

    console.log(`[OAuth] Generated URL for ${provider}, redirectTo: ${redirectTo}`)

    return NextResponse.json({ success: true, url: oauthUrl })
  } catch (err) {
    console.error(`[OAuth] Unexpected error for ${provider}:`, err)
    return NextResponse.json({ success: false, error: 'Failed to initiate OAuth login.' }, { status: 500 })
  }
}