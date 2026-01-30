/**
 * OAuth types and schemas
 */

import { z } from 'zod';

// ============================================================================
// OAuth Scopes
// ============================================================================

export const OAuthScopeSchema = z.enum([
  'profile:read',       // Read user profile
  'characters:read',    // Read user's characters
  'characters:write',   // Create/edit characters
  'sessions:read',      // View sessions
  'sessions:write',     // Join/interact with sessions
  'adventures:read',    // Read published adventures
  'campaigns:read',     // Read user's campaigns
  'campaigns:write',    // Create/manage campaigns
]);
export type OAuthScope = z.infer<typeof OAuthScopeSchema>;

export const SCOPE_DESCRIPTIONS: Record<OAuthScope, string> = {
  'profile:read': 'View your profile information',
  'characters:read': 'View your characters',
  'characters:write': 'Create and edit your characters',
  'sessions:read': 'View sessions you participate in',
  'sessions:write': 'Join sessions and take actions',
  'adventures:read': 'Access published adventures',
  'campaigns:read': 'View your campaigns',
  'campaigns:write': 'Create and manage campaigns',
};

// ============================================================================
// Authorization Request
// ============================================================================

export const AuthorizationRequestSchema = z.object({
  response_type: z.literal('code'),
  client_id: z.string(),
  redirect_uri: z.string().url(),
  scope: z.string(), // Space-separated scopes
  state: z.string().min(32), // CSRF protection
  code_challenge: z.string().min(43).max(128), // PKCE
  code_challenge_method: z.literal('S256'),
});
export type AuthorizationRequest = z.infer<typeof AuthorizationRequestSchema>;

// ============================================================================
// Authorization Code
// ============================================================================

export const AuthorizationCodeSchema = z.object({
  code: z.string(),
  clientId: z.string(),
  userId: z.string(),
  redirectUri: z.string().url(),
  scopes: z.array(OAuthScopeSchema),
  codeChallenge: z.string(),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});
export type AuthorizationCode = z.infer<typeof AuthorizationCodeSchema>;

// ============================================================================
// Token Request
// ============================================================================

export const TokenRequestSchema = z.object({
  grant_type: z.enum(['authorization_code', 'refresh_token']),
  code: z.string().optional(),
  redirect_uri: z.string().url().optional(),
  client_id: z.string(),
  client_secret: z.string().optional(), // Required for confidential clients
  code_verifier: z.string().optional(), // PKCE
  refresh_token: z.string().optional(),
});
export type TokenRequest = z.infer<typeof TokenRequestSchema>;

// ============================================================================
// Token Response
// ============================================================================

export const TokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal('Bearer'),
  expires_in: z.number().int(), // Seconds
  refresh_token: z.string().optional(),
  scope: z.string(),
});
export type TokenResponse = z.infer<typeof TokenResponseSchema>;

// ============================================================================
// Access Token (internal representation)
// ============================================================================

export const AccessTokenSchema = z.object({
  id: z.string(),
  appId: z.string(),
  userId: z.string(),
  scopes: z.array(OAuthScopeSchema),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});
export type AccessToken = z.infer<typeof AccessTokenSchema>;

// ============================================================================
// Refresh Token (internal representation)
// ============================================================================

export const RefreshTokenSchema = z.object({
  id: z.string(),
  appId: z.string(),
  userId: z.string(),
  scopes: z.array(OAuthScopeSchema),
  accessTokenId: z.string(),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  lastUsedAt: z.string().datetime().optional(),
});
export type RefreshToken = z.infer<typeof RefreshTokenSchema>;

// ============================================================================
// User Authorization (granted permissions)
// ============================================================================

export const UserAuthorizationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  appId: z.string(),
  appName: z.string(),
  scopes: z.array(OAuthScopeSchema),
  grantedAt: z.string().datetime(),
  lastUsedAt: z.string().datetime().optional(),
});
export type UserAuthorization = z.infer<typeof UserAuthorizationSchema>;

// ============================================================================
// OAuth Error Codes
// ============================================================================

export type OAuthErrorCode =
  | 'invalid_request'
  | 'unauthorized_client'
  | 'access_denied'
  | 'unsupported_response_type'
  | 'invalid_scope'
  | 'server_error'
  | 'temporarily_unavailable'
  | 'invalid_client'
  | 'invalid_grant'
  | 'unsupported_grant_type';

export interface OAuthError {
  error: OAuthErrorCode;
  error_description?: string;
  error_uri?: string;
}

// ============================================================================
// Client Configuration
// ============================================================================

export const OAuthClientSchema = z.object({
  clientId: z.string(),
  clientSecretHash: z.string().optional(), // Only for confidential clients
  appId: z.string(),
  appName: z.string(),
  redirectUris: z.array(z.string().url()),
  allowedScopes: z.array(OAuthScopeSchema),
  clientType: z.enum(['public', 'confidential']),
  logoUrl: z.string().url().optional(),
});
export type OAuthClient = z.infer<typeof OAuthClientSchema>;
