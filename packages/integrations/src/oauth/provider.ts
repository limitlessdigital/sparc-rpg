/**
 * OAuth 2.0 Provider implementation
 */

import { randomUUID } from 'crypto';
import type {
  AuthorizationRequest,
  AuthorizationCode,
  TokenRequest,
  TokenResponse,
  AccessToken,
  RefreshToken,
  OAuthClient,
  OAuthScope,
  OAuthError,
  UserAuthorization,
} from './types';
import {
  generateAuthCode,
  createAccessToken,
  createRefreshToken,
  verifyCodeChallenge,
  hashToken,
  isExpired,
  parseScopes,
  formatScopes,
  validateScopes,
  type TokenConfig,
  DEFAULT_TOKEN_CONFIG,
} from './tokens';

// ============================================================================
// Storage Interfaces
// ============================================================================

export interface OAuthStorage {
  // Clients
  getClient(clientId: string): Promise<OAuthClient | null>;
  
  // Authorization codes
  saveAuthCode(code: AuthorizationCode, codeString: string): Promise<void>;
  getAuthCode(codeHash: string): Promise<AuthorizationCode | null>;
  deleteAuthCode(codeHash: string): Promise<void>;
  
  // Access tokens
  saveAccessToken(token: AccessToken): Promise<void>;
  getAccessToken(tokenHash: string): Promise<AccessToken | null>;
  deleteAccessToken(tokenHash: string): Promise<void>;
  deleteAccessTokensByUser(userId: string, appId: string): Promise<void>;
  
  // Refresh tokens
  saveRefreshToken(token: RefreshToken): Promise<void>;
  getRefreshToken(tokenHash: string): Promise<RefreshToken | null>;
  deleteRefreshToken(tokenHash: string): Promise<void>;
  updateRefreshTokenUsage(tokenHash: string): Promise<void>;
  
  // User authorizations
  getUserAuthorizations(userId: string): Promise<UserAuthorization[]>;
  saveUserAuthorization(auth: UserAuthorization): Promise<void>;
  deleteUserAuthorization(userId: string, appId: string): Promise<void>;
}

// ============================================================================
// OAuth Provider
// ============================================================================

export class OAuthProvider {
  private tokenConfig: TokenConfig;

  constructor(
    private storage: OAuthStorage,
    config?: Partial<TokenConfig>
  ) {
    this.tokenConfig = { ...DEFAULT_TOKEN_CONFIG, ...config };
  }

  // ============================================================================
  // Authorization Endpoint
  // ============================================================================

  /**
   * Validate authorization request and return authorization URL params
   */
  async validateAuthorizationRequest(
    request: AuthorizationRequest
  ): Promise<{ valid: true; client: OAuthClient; scopes: OAuthScope[] } | { valid: false; error: OAuthError }> {
    // Get client
    const client = await this.storage.getClient(request.client_id);
    if (!client) {
      return {
        valid: false,
        error: {
          error: 'unauthorized_client',
          error_description: 'Unknown client_id',
        },
      };
    }

    // Validate redirect URI
    if (!client.redirectUris.includes(request.redirect_uri)) {
      return {
        valid: false,
        error: {
          error: 'invalid_request',
          error_description: 'Invalid redirect_uri',
        },
      };
    }

    // Parse and validate scopes
    const requestedScopes = parseScopes(request.scope);
    const scopeValidation = validateScopes(requestedScopes, client.allowedScopes);
    
    if (!scopeValidation.valid) {
      return {
        valid: false,
        error: {
          error: 'invalid_scope',
          error_description: `Invalid scopes: ${scopeValidation.invalid.join(', ')}`,
        },
      };
    }

    return {
      valid: true,
      client,
      scopes: requestedScopes as OAuthScope[],
    };
  }

  /**
   * Create authorization code after user grants permission
   */
  async createAuthorizationCode(params: {
    clientId: string;
    userId: string;
    redirectUri: string;
    scopes: OAuthScope[];
    codeChallenge: string;
  }): Promise<string> {
    const code = generateAuthCode();
    const codeHash = hashToken(code);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.tokenConfig.codeExpirySeconds * 1000);

    const authCode: AuthorizationCode = {
      code: codeHash, // Store hash, not plain code
      clientId: params.clientId,
      userId: params.userId,
      redirectUri: params.redirectUri,
      scopes: params.scopes,
      codeChallenge: params.codeChallenge,
      expiresAt: expiresAt.toISOString(),
      createdAt: now.toISOString(),
    };

    await this.storage.saveAuthCode(authCode, code);
    return code;
  }

  // ============================================================================
  // Token Endpoint
  // ============================================================================

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCode(request: TokenRequest): Promise<TokenResponse | OAuthError> {
    if (request.grant_type !== 'authorization_code') {
      return {
        error: 'unsupported_grant_type',
        error_description: 'Only authorization_code is supported',
      };
    }

    if (!request.code || !request.redirect_uri || !request.code_verifier) {
      return {
        error: 'invalid_request',
        error_description: 'Missing required parameters',
      };
    }

    // Get client
    const client = await this.storage.getClient(request.client_id);
    if (!client) {
      return {
        error: 'invalid_client',
        error_description: 'Unknown client',
      };
    }

    // Validate client secret for confidential clients
    if (client.clientType === 'confidential') {
      if (!request.client_secret || !client.clientSecretHash) {
        return {
          error: 'invalid_client',
          error_description: 'Client authentication required',
        };
      }
      // In production, use constant-time comparison
      const secretHash = hashToken(request.client_secret);
      if (secretHash !== client.clientSecretHash) {
        return {
          error: 'invalid_client',
          error_description: 'Invalid client credentials',
        };
      }
    }

    // Get and validate authorization code
    const codeHash = hashToken(request.code);
    const authCode = await this.storage.getAuthCode(codeHash);
    
    if (!authCode) {
      return {
        error: 'invalid_grant',
        error_description: 'Invalid authorization code',
      };
    }

    // Delete code immediately (one-time use)
    await this.storage.deleteAuthCode(codeHash);

    // Check expiry
    if (isExpired(authCode.expiresAt)) {
      return {
        error: 'invalid_grant',
        error_description: 'Authorization code expired',
      };
    }

    // Validate client ID matches
    if (authCode.clientId !== request.client_id) {
      return {
        error: 'invalid_grant',
        error_description: 'Client mismatch',
      };
    }

    // Validate redirect URI matches
    if (authCode.redirectUri !== request.redirect_uri) {
      return {
        error: 'invalid_grant',
        error_description: 'Redirect URI mismatch',
      };
    }

    // Verify PKCE code challenge
    if (!verifyCodeChallenge(request.code_verifier, authCode.codeChallenge)) {
      return {
        error: 'invalid_grant',
        error_description: 'Invalid code_verifier',
      };
    }

    // Create tokens
    const accessTokenResult = createAccessToken({
      appId: client.appId,
      userId: authCode.userId,
      scopes: authCode.scopes,
    }, this.tokenConfig);

    const refreshTokenResult = createRefreshToken({
      appId: client.appId,
      userId: authCode.userId,
      scopes: authCode.scopes,
      accessTokenId: accessTokenResult.tokenHash,
    }, this.tokenConfig);

    // Save tokens
    await this.storage.saveAccessToken(accessTokenResult.accessToken);
    await this.storage.saveRefreshToken(refreshTokenResult.refreshToken);

    // Save user authorization record
    const authorization: UserAuthorization = {
      id: randomUUID(),
      userId: authCode.userId,
      appId: client.appId,
      appName: client.appName,
      scopes: authCode.scopes,
      grantedAt: new Date().toISOString(),
    };
    await this.storage.saveUserAuthorization(authorization);

    return {
      access_token: accessTokenResult.token,
      token_type: 'Bearer',
      expires_in: this.tokenConfig.accessTokenTtlSeconds,
      refresh_token: refreshTokenResult.token,
      scope: formatScopes(authCode.scopes),
    };
  }

  /**
   * Refresh an access token
   */
  async refreshAccessToken(request: TokenRequest): Promise<TokenResponse | OAuthError> {
    if (request.grant_type !== 'refresh_token') {
      return {
        error: 'unsupported_grant_type',
      };
    }

    if (!request.refresh_token) {
      return {
        error: 'invalid_request',
        error_description: 'Missing refresh_token',
      };
    }

    const tokenHash = hashToken(request.refresh_token);
    const refreshToken = await this.storage.getRefreshToken(tokenHash);

    if (!refreshToken) {
      return {
        error: 'invalid_grant',
        error_description: 'Invalid refresh token',
      };
    }

    if (isExpired(refreshToken.expiresAt)) {
      await this.storage.deleteRefreshToken(tokenHash);
      return {
        error: 'invalid_grant',
        error_description: 'Refresh token expired',
      };
    }

    // Get client
    const client = await this.storage.getClient(request.client_id);
    if (!client || client.appId !== refreshToken.appId) {
      return {
        error: 'invalid_client',
      };
    }

    // Delete old access token
    await this.storage.deleteAccessToken(refreshToken.accessTokenId);

    // Create new access token
    const accessTokenResult = createAccessToken({
      appId: refreshToken.appId,
      userId: refreshToken.userId,
      scopes: refreshToken.scopes,
    }, this.tokenConfig);

    // Update refresh token reference and usage
    refreshToken.accessTokenId = accessTokenResult.tokenHash;
    await this.storage.saveRefreshToken(refreshToken);
    await this.storage.updateRefreshTokenUsage(tokenHash);

    // Save new access token
    await this.storage.saveAccessToken(accessTokenResult.accessToken);

    return {
      access_token: accessTokenResult.token,
      token_type: 'Bearer',
      expires_in: this.tokenConfig.accessTokenTtlSeconds,
      scope: formatScopes(refreshToken.scopes),
    };
  }

  // ============================================================================
  // Token Validation
  // ============================================================================

  /**
   * Validate an access token
   */
  async validateAccessToken(token: string): Promise<AccessToken | null> {
    const tokenHash = hashToken(token);
    const accessToken = await this.storage.getAccessToken(tokenHash);

    if (!accessToken) {
      return null;
    }

    if (isExpired(accessToken.expiresAt)) {
      await this.storage.deleteAccessToken(tokenHash);
      return null;
    }

    return accessToken;
  }

  // ============================================================================
  // Token Revocation
  // ============================================================================

  /**
   * Revoke all tokens for a user's app authorization
   */
  async revokeAuthorization(userId: string, appId: string): Promise<void> {
    await this.storage.deleteAccessTokensByUser(userId, appId);
    await this.storage.deleteUserAuthorization(userId, appId);
  }

  /**
   * Get user's active authorizations
   */
  async getUserAuthorizations(userId: string): Promise<UserAuthorization[]> {
    return this.storage.getUserAuthorizations(userId);
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createOAuthProvider(
  storage: OAuthStorage,
  config?: Partial<TokenConfig>
): OAuthProvider {
  return new OAuthProvider(storage, config);
}
