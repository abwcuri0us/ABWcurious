import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, usersDb } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Supabase OAuth sends tokens in query params after the provider redirects back
  const accessToken = searchParams.get('access_token')
  const refreshToken = searchParams.get('refresh_token')
  const type = searchParams.get('type')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    // Redirect to home with error in hash
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(errorDescription || error)}`, request.url)
    )
  }

  if (!accessToken) {
    // No access token in query params — this may be a hash-fragment based callback.
    // Serve an HTML page that extracts the hash fragment and posts back to this route.
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>Authenticating...</title></head>
<body style="display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:system-ui,sans-serif;background:#0a0a0a;color:#fafafa">
  <div style="text-align:center">
    <div style="width:40px;height:40px;border:3px solid rgba(255,255,255,0.2);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px"></div>
    <p style="font-size:14px;opacity:0.7">Authenticating...</p>
  </div>
  <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
  <script>
    // Supabase puts tokens in the URL hash fragment (#access_token=...&refresh_token=...)
    // Hash fragments are NOT sent to the server, so we extract them client-side
    // and redirect to this same endpoint with query params.
    (function() {
      var hash = window.location.hash.substring(1);
      if (!hash) return;
      var params = new URLSearchParams(hash);
      var accessToken = params.get('access_token');
      var refreshToken = params.get('refresh_token');
      var error = params.get('error');
      var errorDescription = params.get('error_description');
      if (error) {
        window.location.href = '/?auth_error=' + encodeURIComponent(errorDescription || error);
        return;
      }
      if (accessToken) {
        var redirectUrl = '/auth/callback?access_token=' + encodeURIComponent(accessToken);
        if (refreshToken) redirectUrl += '&refresh_token=' + encodeURIComponent(refreshToken);
        if (params.get('type')) redirectUrl += '&type=' + encodeURIComponent(params.get('type'));
        window.location.href = redirectUrl;
      }
    })();
  </script>
</body>
</html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  // Verify the token with Supabase
  const { data: userData, error: verifyError } = await supabaseAdmin.auth.getUser(accessToken)

  if (verifyError || !userData.user) {
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent('Authentication failed')}`, request.url)
    )
  }

  const user = userData.user
  const email = user.email || ''
  const name = user.user_metadata?.full_name || user.user_metadata?.name || null
  const avatar = user.user_metadata?.avatar_url || null
  const provider = user.app_metadata?.provider || 'oauth'

  // Find or create user in our profiles table
  let dbUser = await usersDb.findByEmail(email)

  if (!dbUser) {
    // Create profile directly via supabaseAdmin
    const { data: newProfile, error: createError } = await supabaseAdmin
      .from('profiles')
      .insert([{
        id: user.id,
        email,
        name,
        avatar,
        provider,
        role: 'user',
      }])
      .select()
      .single()

    if (!createError && newProfile) {
      dbUser = newProfile
    }
  } else {
    // Update existing profile with latest OAuth info (avatar, name)
    const updates: Record<string, unknown> = {}
    if (avatar && !dbUser.avatar) updates.avatar = avatar
    if (name && !dbUser.name) updates.name = name
    if (provider && dbUser.provider !== provider) updates.provider = provider

    if (Object.keys(updates).length > 0) {
      const { data: updatedProfile } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', dbUser.id)
        .select()
        .single()

      if (updatedProfile) dbUser = updatedProfile
    }
  }

  const userCookieData = {
    id: dbUser?.id || user.id,
    email,
    name: dbUser?.name || name,
    avatar: dbUser?.avatar || avatar,
    role: dbUser?.role || 'user',
  }

  // Redirect to home with dashboard active via hash
  const response = NextResponse.redirect(new URL('/#dashboard', request.url))

  // Both cookies must be httpOnly: false so the client-side AuthContext
  // can read them via document.cookie after the OAuth redirect.
  response.cookies.set('abwcurious_token', accessToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  // Set readable cookie for user data (for client-side AuthContext)
  response.cookies.set('abwcurious_user', JSON.stringify(userCookieData), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  if (refreshToken) {
    response.cookies.set('abwcurious_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  }

  return response
}
