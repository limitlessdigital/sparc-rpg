/**
 * Webhook types
 */

import { z } from 'zod';
import type { IntegrationEventType } from '../types';

// ============================================================================
// Webhook Configuration
// ============================================================================

export const WebhookStatusSchema = z.enum(['active', 'disabled', 'failing']);
export type WebhookStatus = z.infer<typeof WebhookStatusSchema>;

export const WebhookConfigSchema = z.object({
  id: z.string(),
  appId: z.string(), // Developer app that owns this webhook
  userId: z.string(), // User who authorized the webhook
  
  // Endpoint
  url: z.string().url(),
  secret: z.string(), // For HMAC signature
  
  // Subscribed events
  events: z.array(z.string()), // IntegrationEventType values
  
  // Status
  status: WebhookStatusSchema.default('active'),
  
  // Delivery tracking
  failureCount: z.number().int().min(0).default(0),
  lastSuccessAt: z.string().datetime().optional(),
  lastFailureAt: z.string().datetime().optional(),
  lastFailureReason: z.string().optional(),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type WebhookConfig = z.infer<typeof WebhookConfigSchema>;

// ============================================================================
// Webhook Payload
// ============================================================================

export const WebhookPayloadSchema = z.object({
  id: z.string(), // Unique event ID
  type: z.string(), // IntegrationEventType
  timestamp: z.string().datetime(),
  apiVersion: z.string().default('2024-01'),
  data: z.unknown(),
});
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;

// ============================================================================
// Webhook Delivery
// ============================================================================

export const WebhookDeliveryStatusSchema = z.enum([
  'pending',
  'delivered',
  'failed',
  'retrying',
]);
export type WebhookDeliveryStatus = z.infer<typeof WebhookDeliveryStatusSchema>;

export const WebhookDeliverySchema = z.object({
  id: z.string(),
  webhookId: z.string(),
  eventId: z.string(),
  
  // Payload
  payload: WebhookPayloadSchema,
  
  // Delivery status
  status: WebhookDeliveryStatusSchema,
  attempts: z.number().int().min(0),
  maxAttempts: z.number().int().default(5),
  
  // Response tracking
  lastAttemptAt: z.string().datetime().optional(),
  lastResponseStatus: z.number().int().optional(),
  lastResponseBody: z.string().optional(),
  
  // Scheduling
  nextAttemptAt: z.string().datetime().optional(),
  
  createdAt: z.string().datetime(),
});
export type WebhookDelivery = z.infer<typeof WebhookDeliverySchema>;

// ============================================================================
// Webhook Request Headers
// ============================================================================

export interface WebhookRequestHeaders {
  'Content-Type': 'application/json';
  'X-SPARC-Signature': string;
  'X-SPARC-Event-ID': string;
  'X-SPARC-Event-Type': string;
  'X-SPARC-Timestamp': string;
  'X-SPARC-Delivery-ID': string;
  'User-Agent': string;
}

// ============================================================================
// Event Filter
// ============================================================================

export interface WebhookEventFilter {
  sessionId?: string;
  campaignId?: string;
  characterId?: string;
}

// ============================================================================
// Retry Configuration
// ============================================================================

export interface WebhookRetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_CONFIG: WebhookRetryConfig = {
  maxAttempts: 5,
  initialDelayMs: 1000, // 1 second
  maxDelayMs: 3600000,  // 1 hour
  backoffMultiplier: 2,
};

// ============================================================================
// Webhook Statistics
// ============================================================================

export interface WebhookStats {
  webhookId: string;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageLatencyMs: number;
  lastDeliveredAt?: string;
}
