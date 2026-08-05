import { NextRequest } from 'next/server';

/**
 * Web Application Firewall (WAF) basic implementation.
 * Protects against common injection patterns before they reach the business logic.
 */

const SQL_INJECTION_PATTERN = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b.*?['"])|(--)|(\/\*)|(\bOR\b.*=)/i;
const XSS_PATTERN = /(<script.*?>.*?<\/script>)|(javascript:)|(onerror=)|(onload=)|(<iframe.*?>)/i;
const PATH_TRAVERSAL_PATTERN = /(\.\.\/)|(\.\.\\)/;
const SSRF_PATTERN = /((http|https):\/\/(127\.0\.0\.1|localhost|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.))/i;

export interface WafResult {
  blocked: boolean;
  reason?: string;
}

/**
 * Scans a string for malicious payloads.
 */
export function scanPayload(payload: string): WafResult {
  if (!payload) return { blocked: false };

  // This is a fast, naive check. In production, consider using a dedicated WAF solution like AWS WAF or Cloudflare.
  if (SQL_INJECTION_PATTERN.test(payload)) {
    return { blocked: true, reason: 'SQL_INJECTION' };
  }
  if (XSS_PATTERN.test(payload)) {
    return { blocked: true, reason: 'XSS' };
  }
  if (PATH_TRAVERSAL_PATTERN.test(payload)) {
    return { blocked: true, reason: 'PATH_TRAVERSAL' };
  }
  
  return { blocked: false };
}

/**
 * Validates URLs to prevent SSRF against internal services.
 */
export function scanUrl(url: string): WafResult {
  if (SSRF_PATTERN.test(url)) {
    return { blocked: true, reason: 'SSRF' };
  }
  return { blocked: false };
}

/**
 * Middleware entrypoint for WAF.
 */
export function applyWaf(req: NextRequest, rawBody?: string): WafResult {
  // 1. Scan query parameters
  for (const [key, value] of req.nextUrl.searchParams.entries()) {
    const res = scanPayload(value);
    if (res.blocked) return res;
  }

  // 2. Scan Body (if provided)
  if (rawBody) {
    const res = scanPayload(rawBody);
    if (res.blocked) return res;
  }

  return { blocked: false };
}
