/**
 * Token generation and validation utilities
 */

import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import type { AccessToken, RefreshToken, OAuthScope } from './types';

// ============================================================================
// Token Configuration
// ============================================================================

export interface TokenConfig {
  accessTokenTtlSeconds: number;  // Default: 3600 (1 hour)
  refreshTokenTtlSeconds: number; // Default: 2592000 (30 days)
  codeExpirySeconds: number;      // Default: 600 (10 minutes)
}

export const DEFAULT_TOKEN_CONFIG: TokenConfig = {
  accessTokenTtlSeconds: 3600,
  refreshTokenTtlSeconds: 2592000,
  codeExpirySeconds: 600,
};

// ============================================================================
// PKCE Utilities
// ============================================================================

/**
 * Generate a code verifier for PKCE
 */
export function generateCodeVerifier(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Generate a code challenge from a verifier
 */
export function generateCodeChallenge(verifier: string): string {
  return createHash('sha256')
    .update(verifier)
    .digest('base64url');
}

/**
 * Verify a code challenge against a verifier
 */
export function verifyCodeChallenge(verifier: string, challenge: string): boolean {
  const expected = generateCodeChallenge(verifier);
  try {
    return timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(challenge)
    );
  } catch {
    return false;
  }
}

// ============================================================================
// Token Generation
// ============================================================================

/**
 * Generate a secure random token
 */
export function generateToken(prefix: string = ''): string {
  const token = randomBytes(32).toString('base64url');
  return prefix ? `${prefix}_${token}` : token;
}

/**
 * Generate an authorization code
 */
export function generateAuthCode(): string {
  return generateToken('sparc_code');
}

/**
 * Generate an access token
 */
export function generateAccessToken(): string {
  return generateToken('sparc_at');
}

/**
 * Generate a refresh token
 */
export function generateRefreshToken(): string {
  return generateToken('sparc_rt');
}

// ============================================================================
// Token Hashing (for storage)
// ============================================================================

/**
 * Hash a token for secure storage
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Verify a token against its hash
 */
export function verifyTokenHash(token: string, hash: string): boolean {
  const tokenHash = hashToken(token);
  try {
    return timingSafeEqual(
      Buffer.from(tokenHash),
      Buffer.from(hash)
    );
  } catch {
    return false;
  }
}

// ============================================================================
// Token Expiry Calculation
// ============================================================================

/**
 * Calculate expiry time from now
 */
export function calculateExpiry(ttlSeconds: number): Date {
  return new Date(Date.now() + ttlSeconds * 1000);
}

/**
 * Check if a token is expired
 */
export function isExpired(expiresAt: string | Date): boolean {
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return expiry.getTime() <= Date.now();
}

// ============================================================================
// Token Builder
// ============================================================================

export interface CreateAccessTokenParams {
  appId: string;
  userId: string;
  scopes: OAuthScope[];
  ttlSeconds?: number;
}

export interface AccessTokenResult {
  token: string;
  tokenHash: string;
  accessToken: AccessToken;
}

export function createAccessToken(
  params: CreateAccessTokenParams,
  config: TokenConfig = DEFAULT_TOKEN_CONFIG
): AccessTokenResult {
  const token = generateAccessToken();
  const tokenHash = hashToken(token);
  const now = new Date();
  const expiresAt = calculateExpiry(params.ttlSeconds ?? config.accessTokenTtlSeconds);

  const accessToken: AccessToken = {
    id: tokenHash, // Use hash as ID for lookup
    appId: params.appId,
    userId: params.userId,
    scopes: params.scopes,
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
  };

  return { token, tokenHash, accessToken };
}

export interface CreateRefreshTokenParams {
  appId: string;
  userId: string;
  scopes: OAuthScope[];
  accessTokenId: string;
  ttlSeconds?: number;
}

export interface RefreshTokenResult {
  token: string;
  tokenHash: string;
  refreshToken: RefreshToken;
}

export function createRefreshToken(
  params: CreateRefreshTokenParams,
  config: TokenConfig = DEFAULT_TOKEN_CONFIG
): RefreshTokenResult {
  const token = generateRefreshToken();
  const tokenHash = hashToken(token);
  const now = new Date();
  const expiresAt = calculateExpiry(params.ttlSeconds ?? config.refreshTokenTtlSeconds);

  const refreshToken: RefreshToken = {
    id: tokenHash,
    appId: params.appId,
    userId: params.userId,
    scopes: params.scopes,
    accessTokenId: params.accessTokenId,
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
  };

  return { token, tokenHash, refreshToken };
}

// ============================================================================
// Scope Utilities
// ============================================================================

/**
 * Parse scope string into array
 */
export function parseScopes(scopeString: string): string[] {
  return scopeString.split(' ').filter(s => s.length > 0);
}

/**
 * Format scope array into string
 */
export function formatScopes(scopes: string[]): string {
  return scopes.join(' ');
}

/**
 * Check if requested scopes are subset of allowed scopes
 */
export function validateScopes(
  requested: string[],
  allowed: string[]
): { valid: boolean; invalid: string[] } {
  const allowedSet = new Set(allowed);
  const invalid = requested.filter(s => !allowedSet.has(s));
  return {
    valid: invalid.length === 0,
    invalid,
  };
}

/**
 * Check if a token has required scope
 */
export function hasScope(tokenScopes: string[], requiredScope: string): boolean {
  return tokenScopes.includes(requiredScope);
}

/**
 * Check if a token has all required scopes
 */
export function hasAllScopes(tokenScopes: string[], requiredScopes: string[]): boolean {
  return requiredScopes.every(s => tokenScopes.includes(s));
}

/**
 * Check if a token has any of the required scopes
 */
export function hasAnyScope(tokenScopes: string[], requiredScopes: string[]): boolean {
  return requiredScopes.some(s => tokenScopes.includes(s));
}
