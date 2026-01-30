/**
 * Webhook signature verification utilities
 */

import { createHmac, timingSafeEqual, randomBytes } from 'crypto';
import type { WebhookPayload, WebhookRequestHeaders } from './types';

// ============================================================================
// Signature Generation
// ============================================================================

/**
 * Generate HMAC-SHA256 signature for webhook payload
 */
export function generateSignature(payload: string, secret: string): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  return `sha256=${hmac.digest('hex')}`;
}

/**
 * Generate webhook request headers
 */
export function generateWebhookHeaders(
  payload: WebhookPayload,
  secret: string,
  deliveryId: string
): WebhookRequestHeaders {
  const payloadString = JSON.stringify(payload);
  const signature = generateSignature(payloadString, secret);

  return {
    'Content-Type': 'application/json',
    'X-SPARC-Signature': signature,
    'X-SPARC-Event-ID': payload.id,
    'X-SPARC-Event-Type': payload.type,
    'X-SPARC-Timestamp': payload.timestamp,
    'X-SPARC-Delivery-ID': deliveryId,
    'User-Agent': 'SPARC-Webhooks/1.0',
  };
}

// ============================================================================
// Signature Verification
// ============================================================================

/**
 * Verify webhook signature (for consumers to use)
 */
export function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = generateSignature(payload, secret);
  
  try {
    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

/**
 * Verify webhook request headers and payload
 */
export function verifyWebhookRequest(
  headers: Record<string, string | undefined>,
  body: string,
  secret: string,
  options?: {
    maxAgeSeconds?: number; // Reject old webhooks (replay protection)
  }
): { valid: boolean; error?: string } {
  const signature = headers['x-sparc-signature'];
  const timestamp = headers['x-sparc-timestamp'];
  const eventId = headers['x-sparc-event-id'];

  // Check required headers
  if (!signature) {
    return { valid: false, error: 'Missing X-SPARC-Signature header' };
  }
  if (!timestamp) {
    return { valid: false, error: 'Missing X-SPARC-Timestamp header' };
  }
  if (!eventId) {
    return { valid: false, error: 'Missing X-SPARC-Event-ID header' };
  }

  // Check timestamp (replay protection)
  if (options?.maxAgeSeconds) {
    const webhookTime = new Date(timestamp).getTime();
    const now = Date.now();
    const age = (now - webhookTime) / 1000;

    if (age > options.maxAgeSeconds) {
      return { valid: false, error: 'Webhook timestamp too old (possible replay)' };
    }

    if (webhookTime > now + 60000) {
      return { valid: false, error: 'Webhook timestamp in the future' };
    }
  }

  // Verify signature
  if (!verifySignature(body, signature, secret)) {
    return { valid: false, error: 'Invalid signature' };
  }

  return { valid: true };
}

// ============================================================================
// Secret Generation
// ============================================================================

/**
 * Generate a secure webhook secret
 */
export function generateWebhookSecret(): string {
  return `whsec_${randomBytes(32).toString('hex')}`;
}

// ============================================================================
// Payload Parsing
// ============================================================================

/**
 * Parse and validate webhook payload
 */
export function parseWebhookPayload(body: string): WebhookPayload | null {
  try {
    const parsed = JSON.parse(body);
    
    // Basic structure validation
    if (
      typeof parsed.id !== 'string' ||
      typeof parsed.type !== 'string' ||
      typeof parsed.timestamp !== 'string'
    ) {
      return null;
    }

    return parsed as WebhookPayload;
  } catch {
    return null;
  }
}

// ============================================================================
// SDK Helper for Consumers
// ============================================================================

/**
 * Webhook verification helper for SDK users
 */
export class WebhookVerifier {
  constructor(private secret: string) {}

  /**
   * Verify and parse a webhook request
   */
  verify(
    headers: Record<string, string | undefined>,
    body: string
  ): { payload: WebhookPayload; eventType: string } | { error: string } {
    const result = verifyWebhookRequest(headers, body, this.secret, {
      maxAgeSeconds: 300, // 5 minutes
    });

    if (!result.valid) {
      return { error: result.error || 'Verification failed' };
    }

    const payload = parseWebhookPayload(body);
    if (!payload) {
      return { error: 'Invalid payload format' };
    }

    return {
      payload,
      eventType: payload.type,
    };
  }
}

export function createWebhookVerifier(secret: string): WebhookVerifier {
  return new WebhookVerifier(secret);
}
