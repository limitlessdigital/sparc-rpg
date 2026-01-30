/**
 * SPARC Session Join Code System
 * 
 * Join codes are 6-character uppercase alphanumeric strings (e.g., ABC123)
 * Codes expire after 24 hours
 */

import type { SessionCode } from './types';

const CODE_LENGTH = 6;
const CODE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes ambiguous: 0, O, I, 1

/**
 * Generate a random 6-character join code
 * Format: ABC123 (uppercase alphanumeric)
 */
export function generateJoinCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * CODE_CHARS.length);
    code += CODE_CHARS[randomIndex];
  }
  return code;
}

/**
 * Validate join code format
 * Must be exactly 6 uppercase alphanumeric characters
 */
export function validateJoinCode(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  const normalized = code.toUpperCase().trim();
  
  if (normalized.length !== CODE_LENGTH) {
    return false;
  }
  
  // Check each character is valid
  for (const char of normalized) {
    if (!CODE_CHARS.includes(char)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Check if a session code has expired
 * Codes expire 24 hours after creation
 */
export function isCodeExpired(sessionCode: SessionCode): boolean {
  const now = new Date();
  return now >= sessionCode.expiresAt;
}

/**
 * Create a new SessionCode object
 */
export function createSessionCode(sessionId: string, createdBy: string): SessionCode {
  const now = new Date();
  return {
    code: generateJoinCode(),
    sessionId,
    createdAt: now,
    expiresAt: new Date(now.getTime() + CODE_EXPIRY_MS),
    createdBy,
  };
}

/**
 * Normalize a join code (uppercase, trimmed)
 */
export function normalizeJoinCode(code: string): string {
  return code.toUpperCase().trim();
}
