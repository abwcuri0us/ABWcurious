import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin, isConfigured } from '@/lib/supabase'
import { createSession, getSessionCookieName, getSessionMaxAge } from '@/lib/sessions'
import { getCsrfCookieConfig } from '@/lib/csrf'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.abwcurious.com'

  if (!isConfigured()) {
    return NextResponse.redirect(`${baseUrl}/?auth_error=${encodeURIComponent('Authentication service not configured.')}`)
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error_description = searchParams.get('error_description')

  if (!code) {
    if (error_description) {
      console.error('[OAuth Callback] No code received. Provider error:', decodeURIComponent(error_description))
    }
    return NextResponse.redirect(`${baseUrl}/?auth_error=${encodeURIComponent('No authorization code received from provider.')}`)
  }

  try {
    // Use the anon client for code exchange — this is the client that
    // generated the PKCE challenge in signInWithOAuth
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !data.user) {
      console.error('[OAuth Callback] Exchange error:', error?.message)
      return NextResponse.redirect(`${baseUrl}/?auth_error=${encodeURIComponent('Failed to exchange authorization code. Please try again.')}`)
    }

    const userId = data.user.id
    const email = data.user.email!
    const name =
      data.user.user_metadata?.full_name ||
      data.user.user_metadata?.name ||
      data.user.user_metadata?.preferred_username ||
      email.split('@')[0]
    const avatar =
      data.user.user_metadata?.avatar_url ||
      data.user.user_metadata?.picture ||
      null
    const provider = data.user.app_metadata?.provider || 'oauth'

    console.log(`[OAuth Callback] Successful login: ${email} via ${provider}`)

    // Upsert profile into database
    try {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert(
          [
            {
              id: userId,
              email,
              name,
              avatar,
              provider,
              role: 'user',
            },
          ],
          { onConflict: 'id' }
        )

      if (profileError) {
        console.error('[OAuth Callback] Failed to upsert profile:', profileError.message)
        // Don't fail the login — the user can still be authenticated
      }
    } catch (profileErr) {
      console.error('[OAuth Callback] Profile upsert exception:', profileErr)
    }

    // Create a server-side session and set httpOnly + CSRF cookies
    const sessionToken = await createSession(
      { userId, email, role: 'user' },
      request
    )
    const csrfConfig = getCsrfCookieConfig()

    const isProduction = baseUrl.includes('abwcurious.com')
    const redirectUrl = `${baseUrl}/#dashboard`
    const response = NextResponse.redirect(redirectUrl)

    response.cookies.set(getSessionCookieName(), sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: getSessionMaxAge(),
    })
    response.cookies.set(csrfConfig.name, csrfConfig.value, csrfConfig.options)

    return response
  } catch (err) {
    console.error('[OAuth Callback] Unexpected error:', err)
    return NextResponse.redirect(`${baseUrl}/?auth_error=${encodeURIComponent('An unexpected error occurred during authentication.')}`)
  }
}
