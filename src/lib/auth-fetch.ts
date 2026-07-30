/**
 * Build fetch headers for authenticated API requests.
 * When token is 'cookie' or empty, relies on httpOnly cookie-based auth (session).
 * Otherwise sends the Authorization header with a Bearer token.
 */
export function getAuthHeaders(token: string, contentType?: string): Record<string, string> {
  const headers: Record<string, string> = {};
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  // When using cookie-based session auth, don't send Bearer token
  // The httpOnly cookie (abwcurious_session) handles auth automatically
  if (token && token !== 'cookie' && token !== 'cookie-auth') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}
