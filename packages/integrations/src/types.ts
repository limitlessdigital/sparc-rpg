/**
 * Shared types for SPARC integrations
 */

import { z } from 'zod';

// ============================================================================
// API Key Types
// ============================================================================

export const ApiKeyTierSchema = z.enum(['free', 'registered', 'partner']);
export type ApiKeyTier = z.infer<typeof ApiKeyTierSchema>;

export const ApiKeySchema = z.object({
  id: z.string(),
  appId: z.string(),
  keyHash: z.string(),
  tier: ApiKeyTierSchema,
  createdAt: z.string().datetime(),
  lastUsedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean(),
});
export type ApiKey = z.infer<typeof ApiKeySchema>;

// ============================================================================
// Developer App Types
// ============================================================================

export const DeveloperAppStatusSchema = z.enum(['development', 'review', 'approved', 'suspended']);
export type DeveloperAppStatus = z.infer<typeof DeveloperAppStatusSchema>;

export const DeveloperAppSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(1000),
  developerId: z.string(),
  
  // OAuth settings
  clientId: z.string(),
  clientSecretHash: z.string(),
  redirectUris: z.array(z.string().url()),
  scopes: z.array(z.string()),
  
  // Metadata
  logoUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  privacyPolicyUrl: z.string().url().optional(),
  
  // Status
  status: DeveloperAppStatusSchema,
  tier: ApiKeyTierSchema,
  
  // Analytics
  totalRequests: z.number().int().min(0),
  activeUsers: z.number().int().min(0),
  lastRequestAt: z.string().datetime().optional(),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type DeveloperApp = z.infer<typeof DeveloperAppSchema>;

// ============================================================================
// Rate Limiting
// ============================================================================

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerDay: number;
}

export const RATE_LIMITS: Record<ApiKeyTier, RateLimitConfig> = {
  free: {
    requestsPerMinute: 100,
    requestsPerDay: 10000,
  },
  registered: {
    requestsPerMinute: 1000,
    requestsPerDay: 100000,
  },
  partner: {
    requestsPerMinute: 5000,
    requestsPerDay: 500000,
  },
};

export interface RateLimitState {
  remaining: number;
  limit: number;
  resetAt: number;
}

export interface RateLimitHeaders {
  'X-RateLimit-Limit': number;
  'X-RateLimit-Remaining': number;
  'X-RateLimit-Reset': number;
  'Retry-After'?: number;
}

// ============================================================================
// Integration Events
// ============================================================================

export const IntegrationEventTypeSchema = z.enum([
  'session.created',
  'session.started', 
  'session.ended',
  'session.player_joined',
  'session.player_left',
  'dice.rolled',
  'combat.started',
  'combat.ended',
  'character.created',
  'character.updated',
  'character.deleted',
  'campaign.created',
  'campaign.updated',
]);
export type IntegrationEventType = z.infer<typeof IntegrationEventTypeSchema>;

export interface IntegrationEvent<T = unknown> {
  id: string;
  type: IntegrationEventType;
  timestamp: string;
  data: T;
}

// ============================================================================
// Platform Connection Types
// ============================================================================

export const PlatformTypeSchema = z.enum(['discord', 'twitch', 'google', 'youtube']);
export type PlatformType = z.infer<typeof PlatformTypeSchema>;

export const PlatformConnectionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  platform: PlatformTypeSchema,
  platformUserId: z.string(),
  platformUsername: z.string(),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  tokenExpiresAt: z.string().datetime().optional(),
  scopes: z.array(z.string()),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type PlatformConnection = z.infer<typeof PlatformConnectionSchema>;

// ============================================================================
// Dice Roll Result (for sharing across integrations)
// ============================================================================

export interface DiceRollResult {
  characterId: string;
  characterName: string;
  attribute: string;
  diceCount: number;
  results: number[];
  total: number;
  difficulty: number;
  success: boolean;
  margin: number;
  isCritical: boolean;
  isFumble: boolean;
}

// ============================================================================
// Session Info (for notifications)
// ============================================================================

export interface SessionInfo {
  id: string;
  name: string;
  description?: string;
  seerId: string;
  seerName: string;
  campaignId?: string;
  campaignName?: string;
  scheduledAt?: string;
  timezone?: string;
  maxPlayers: number;
  currentPlayers: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}
