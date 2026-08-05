/**
 * Basic isomorphic HTML sanitization.
 * 
 * In a full production environment with heavy user-generated HTML, 
 * this should wrap DOMPurify (which requires jsdom in Node.js).
 * For this sprint, we provide a robust regex-based sanitizer to strip script tags,
 * event handlers, and dangerous protocols from user strings.
 */

export function sanitizeHtml(html: string): string {
  if (!html) return '';

  let clean = html;

  // 1. Remove script tags completely
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Remove inline event handlers (onerror=, onload=, onclick=, etc.)
  clean = clean.replace(/on\w+\s*=\s*(['"])(?:(?!\1).)*\1/gi, '');
  clean = clean.replace(/on\w+\s*=\s*[^>\s]+/gi, ''); // unquoted handlers

  // 3. Remove javascript: protocols from links
  clean = clean.replace(/href\s*=\s*(['"])\s*javascript:[^>]*\1/gi, 'href="#"');
  clean = clean.replace(/href\s*=\s*javascript:[^>\s]+/gi, 'href="#"'); // unquoted links

  // 4. Remove iframes and objects
  clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  clean = clean.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  clean = clean.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');

  return clean;
}

/**
 * Strips all HTML tags, returning plain text.
 * Useful for fields like Name, Title, etc. that should never contain HTML.
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').trim();
}
