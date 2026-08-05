import { NextRequest } from 'next/server';

/**
 * Checks for common bot user agents and returns true if it looks like an automated script.
 */
export function isKnownBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  
  // Common bot signatures
  const botSignatures = [
    'bot', 'crawl', 'spider', 'slurp', 'scraper', 'curl', 'wget', 'postman', 
    'insomnia', 'python-requests', 'headless', 'phantom', 'puppeteer', 'playwright',
    'cypress', 'selenium', 'java', 'go-http-client', 'okhttp', 'axios'
  ];

  return botSignatures.some(signature => ua.includes(signature));
}

/**
 * Extracts and checks the honeypot field.
 * Returns true if the honeypot is filled out (meaning it's likely a bot).
 * 
 * @param body The parsed JSON body of the request
 * @param honeypotField The name of the honeypot field (default: 'website')
 */
export function isHoneypotTriggered(body: any, honeypotField = 'website'): boolean {
  if (!body) return false;
  
  // If the honeypot field exists and is not empty, a bot filled it out
  if (body[honeypotField] && typeof body[honeypotField] === 'string' && body[honeypotField].trim().length > 0) {
    return true;
  }
  
  return false;
}

/**
 * Comprehensive bot check combining User-Agent, Honeypot, and generic heuristics.
 */
export function detectBot(req: NextRequest, body?: any): { isBot: boolean, reason?: string } {
  const ua = req.headers.get('user-agent');
  
  // 1. Missing User-Agent is highly suspicious
  if (!ua) {
    return { isBot: true, reason: 'Missing User-Agent' };
  }

  // 2. Check for known bot signatures in User-Agent
  if (isKnownBot(ua)) {
    return { isBot: true, reason: 'Known Bot Signature' };
  }

  // 3. Honeypot check
  if (body && isHoneypotTriggered(body)) {
    return { isBot: true, reason: 'Honeypot Triggered' };
  }

  return { isBot: false };
}
