/**
 * Sanitize a value for safe interpolation into a PostgREST filter string.
 * Escapes double-quotes and backslashes to prevent filter injection.
 */
export function sanitizePostgrestFilter(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

/**
 * Basic HTML sanitizer to prevent XSS attacks.
 * Strips dangerous tags and attributes while preserving safe formatting.
 * No external dependencies required.
 */

const ALLOWED_TAGS = new Set([
  'p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'strike',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'a', 'img', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'video', 'source',
])

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel']),
  img: new Set(['src', 'alt', 'width', 'height', 'loading']),
  video: new Set(['src', 'width', 'height', 'controls', 'autoplay']),
  source: new Set(['src', 'type']),
  span: new Set(['style', 'class']),
  td: new Set(['style', 'class']),
  th: new Set(['style', 'class']),
}

const ALLOWED_STYLES = /^(color|background-color|font-size|font-weight|text-align|font-style|text-decoration|margin|padding|border)\s*:/i

export function sanitizeHtml(html: string): string {
  if (!html) return ''

  // Remove script tags entirely
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove event handlers (onclick, onerror, etc.)
  cleaned = cleaned.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
  cleaned = cleaned.replace(/\son\w+\s*=\s*[^\s>]*/gi, '')

  // Remove javascript: URLs
  cleaned = cleaned.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')

  // Remove data: URLs in src (except images - data:image is allowed for img)
  cleaned = cleaned.replace(/src\s*=\s*["']data:text\/html[^"']*["']/gi, 'src=""')

  // Filter tags - only allow safe ones
  cleaned = cleaned.replace(/<\/?(\w+)[^>]*>/g, (match, tagName) => {
    const tag = tagName.toLowerCase()
    if (!ALLOWED_TAGS.has(tag)) return ''

    // For closing tags, just return them
    if (match.startsWith('</')) return match

    // Filter attributes for opening tags
    return match.replace(/(\w+)\s*=\s*["']([^"']*?)["']/g, (attrMatch, attrName, attrValue) => {
      const attr = attrName.toLowerCase()
      const allowedForTag = ALLOWED_ATTRS[tag]

      if (allowedForTag?.has(attr)) {
        // Extra validation for specific attributes
        if (attr === 'href' && attrValue.toLowerCase().startsWith('javascript:')) {
          return ''
        }
        if (attr === 'src' && attrValue.toLowerCase().startsWith('data:text/html')) {
          return ''
        }
        return attrMatch
      }

      // Allow style attribute on any element, but sanitize it
      if (attr === 'style') {
        const declarations = attrValue.split(';').filter((d: string) => ALLOWED_STYLES.test(d.trim()))
        if (declarations.length > 0) {
          return `style="${declarations.join('')}"`
        }
      }

      // Allow class attribute
      if (attr === 'class') return attrMatch

      return ''
    })
  })

  return cleaned
}
