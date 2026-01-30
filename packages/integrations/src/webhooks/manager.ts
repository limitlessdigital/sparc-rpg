/**
 * Webhook management service
 */

import { randomUUID } from 'crypto';
import type {
  WebhookConfig,
  WebhookPayload,
  WebhookStats,
  WebhookEventFilter,
} from './types';
import { generateWebhookSecret } from './verification';
import type { WebhookDeliveryService } from './delivery';
import type { IntegrationEvent, IntegrationEventType } from '../types';

// ============================================================================
// Webhook Storage Interface
// ============================================================================

export interface WebhookManagerStorage {
  // Webhook CRUD
  getWebhook(id: string): Promise<WebhookConfig | null>;
  getWebhooksByApp(appId: string): Promise<WebhookConfig[]>;
  getWebhooksByUser(userId: string): Promise<WebhookConfig[]>;
  getWebhooksForEvent(eventType: string, userId: string): Promise<WebhookConfig[]>;
  saveWebhook(webhook: WebhookConfig): Promise<void>;
  deleteWebhook(id: string): Promise<void>;
  
  // Stats
  getWebhookStats(webhookId: string): Promise<WebhookStats | null>;
}

// ============================================================================
// Create Webhook Input
// ============================================================================

export interface CreateWebhookInput {
  appId: string;
  userId: string;
  url: string;
  events: IntegrationEventType[];
}

export interface UpdateWebhookInput {
  url?: string;
  events?: IntegrationEventType[];
  status?: 'active' | 'disabled';
}

// ============================================================================
// Webhook Manager
// ============================================================================

export class WebhookManager {
  constructor(
    private storage: WebhookManagerStorage,
    private deliveryService: WebhookDeliveryService
  ) {}

  /**
   * Create a new webhook
   */
  async createWebhook(input: CreateWebhookInput): Promise<{ webhook: WebhookConfig; secret: string }> {
    const id = randomUUID();
    const secret = generateWebhookSecret();
    const now = new Date().toISOString();

    const webhook: WebhookConfig = {
      id,
      appId: input.appId,
      userId: input.userId,
      url: input.url,
      secret,
      events: input.events,
      status: 'active',
      failureCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    await this.storage.saveWebhook(webhook);

    // Return secret only on creation (never stored in plain text after this)
    return { webhook, secret };
  }

  /**
   * Get webhook by ID
   */
  async getWebhook(id: string): Promise<WebhookConfig | null> {
    return this.storage.getWebhook(id);
  }

  /**
   * List webhooks for an app
   */
  async listWebhooksByApp(appId: string): Promise<WebhookConfig[]> {
    return this.storage.getWebhooksByApp(appId);
  }

  /**
   * List webhooks for a user
   */
  async listWebhooksByUser(userId: string): Promise<WebhookConfig[]> {
    return this.storage.getWebhooksByUser(userId);
  }

  /**
   * Update a webhook
   */
  async updateWebhook(id: string, updates: UpdateWebhookInput): Promise<WebhookConfig | null> {
    const webhook = await this.storage.getWebhook(id);
    if (!webhook) return null;

    const updated: WebhookConfig = {
      ...webhook,
      url: updates.url ?? webhook.url,
      events: updates.events ?? webhook.events,
      status: updates.status ?? webhook.status,
      updatedAt: new Date().toISOString(),
    };

    await this.storage.saveWebhook(updated);
    return updated;
  }

  /**
   * Rotate webhook secret
   */
  async rotateSecret(id: string): Promise<{ webhook: WebhookConfig; secret: string } | null> {
    const webhook = await this.storage.getWebhook(id);
    if (!webhook) return null;

    const newSecret = generateWebhookSecret();
    const updated: WebhookConfig = {
      ...webhook,
      secret: newSecret,
      updatedAt: new Date().toISOString(),
    };

    await this.storage.saveWebhook(updated);
    return { webhook: updated, secret: newSecret };
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(id: string): Promise<boolean> {
    const webhook = await this.storage.getWebhook(id);
    if (!webhook) return false;

    await this.storage.deleteWebhook(id);
    return true;
  }

  /**
   * Get webhook statistics
   */
  async getStats(webhookId: string): Promise<WebhookStats | null> {
    return this.storage.getWebhookStats(webhookId);
  }

  /**
   * Dispatch an event to all subscribed webhooks
   */
  async dispatchEvent<T>(
    event: IntegrationEvent<T>,
    filter?: WebhookEventFilter
  ): Promise<{ queued: number; webhookIds: string[] }> {
    // This is a simplified version - in production, you'd want to
    // filter by the event's context (sessionId, campaignId, etc.)
    // For now, we'll need the userId to be passed or extracted from the event

    // Get all webhooks subscribed to this event type
    // In a real implementation, you'd filter by userId based on the event context
    const webhooks = await this.storage.getWebhooksForEvent(event.type, '');
    
    const activeWebhooks = webhooks.filter(w => 
      w.status === 'active' && 
      w.events.includes(event.type)
    );

    const payload: WebhookPayload = {
      id: event.id,
      type: event.type,
      timestamp: event.timestamp,
      apiVersion: '2024-01',
      data: event.data,
    };

    const webhookIds: string[] = [];

    for (const webhook of activeWebhooks) {
      await this.deliveryService.queueDelivery(webhook, payload);
      webhookIds.push(webhook.id);
    }

    return {
      queued: webhookIds.length,
      webhookIds,
    };
  }

  /**
   * Test a webhook by sending a test event
   */
  async testWebhook(id: string): Promise<{
    success: boolean;
    statusCode?: number;
    error?: string;
  }> {
    const webhook = await this.storage.getWebhook(id);
    if (!webhook) {
      return { success: false, error: 'Webhook not found' };
    }

    const testPayload: WebhookPayload = {
      id: randomUUID(),
      type: 'test.webhook',
      timestamp: new Date().toISOString(),
      apiVersion: '2024-01',
      data: {
        message: 'This is a test webhook from SPARC RPG',
        webhookId: id,
      },
    };

    const deliveryId = await this.deliveryService.queueDelivery(webhook, testPayload);
    const result = await this.deliveryService.deliver(deliveryId);

    return {
      success: result.success,
      statusCode: result.statusCode,
      error: result.error,
    };
  }
}

// ============================================================================
// Event Dispatcher (for use by other services)
// ============================================================================

export class EventDispatcher {
  private webhookManager: WebhookManager;

  constructor(webhookManager: WebhookManager) {
    this.webhookManager = webhookManager;
  }

  /**
   * Emit a session event
   */
  async emitSessionEvent(
    type: 'session.created' | 'session.started' | 'session.ended',
    data: {
      sessionId: string;
      sessionName: string;
      seerId: string;
      campaignId?: string;
    }
  ): Promise<void> {
    const event: IntegrationEvent = {
      id: randomUUID(),
      type,
      timestamp: new Date().toISOString(),
      data,
    };

    await this.webhookManager.dispatchEvent(event);
  }

  /**
   * Emit a dice roll event
   */
  async emitDiceRollEvent(data: {
    sessionId: string;
    characterId: string;
    characterName: string;
    attribute: string;
    diceCount: number;
    results: number[];
    total: number;
    difficulty: number;
    success: boolean;
  }): Promise<void> {
    const event: IntegrationEvent = {
      id: randomUUID(),
      type: 'dice.rolled',
      timestamp: new Date().toISOString(),
      data,
    };

    await this.webhookManager.dispatchEvent(event);
  }

  /**
   * Emit a character event
   */
  async emitCharacterEvent(
    type: 'character.created' | 'character.updated' | 'character.deleted',
    data: {
      characterId: string;
      characterName: string;
      userId: string;
      campaignId?: string;
    }
  ): Promise<void> {
    const event: IntegrationEvent = {
      id: randomUUID(),
      type,
      timestamp: new Date().toISOString(),
      data,
    };

    await this.webhookManager.dispatchEvent(event);
  }

  /**
   * Emit a combat event
   */
  async emitCombatEvent(
    type: 'combat.started' | 'combat.ended',
    data: {
      sessionId: string;
      combatId: string;
      participants: Array<{ characterId: string; characterName: string }>;
    }
  ): Promise<void> {
    const event: IntegrationEvent = {
      id: randomUUID(),
      type,
      timestamp: new Date().toISOString(),
      data,
    };

    await this.webhookManager.dispatchEvent(event);
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createWebhookManager(
  storage: WebhookManagerStorage,
  deliveryService: WebhookDeliveryService
): WebhookManager {
  return new WebhookManager(storage, deliveryService);
}

export function createEventDispatcher(
  webhookManager: WebhookManager
): EventDispatcher {
  return new EventDispatcher(webhookManager);
}
