/**
 * Client-side cookie utilities for reading auth data.
 * Auth tokens are now stored in httpOnly cookies (set server-side),
 * so they cannot be accessed from JavaScript. User data is stored
 * in a readable (non-httpOnly) cookie for display purposes.
 */

/**
 * Get user data from the readable cookie.
 * Returns null if not found or invalid.
 */
export function getCookieUser(): {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  role?: string;
} | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split('; ');
  const userCookie = cookies.find((c) => c.startsWith('abwcurious_user='));
  if (!userCookie) return null;
  try {
    const value = decodeURIComponent(userCookie.split('=').slice(1).join('='));
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/**
 * Check if the user is authenticated by checking if the user cookie exists.
 * The actual access token is in an httpOnly cookie that JavaScript can't read.
 */
export function isCookieAuthenticated(): boolean {
  return getCookieUser() !== null;
}
