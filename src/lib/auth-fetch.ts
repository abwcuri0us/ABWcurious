/**
 * Build fetch headers for authenticated API requests.
 * When token is 'cookie-auth' or empty, relies on httpOnly cookie-based auth.
 * Otherwise sends the Authorization header with a Bearer token.
 */
export function getAuthHeaders(token: string, contentType?: string): Record<string, string> {
  const headers: Record<string, string> = {};
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  if (token && token !== 'cookie-auth') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}
