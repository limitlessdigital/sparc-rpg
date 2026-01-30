/**
 * Webhook delivery service with retry logic
 */

import { randomUUID } from 'crypto';
import type {
  WebhookConfig,
  WebhookDelivery,
  WebhookPayload,
  WebhookRetryConfig,
  DEFAULT_RETRY_CONFIG,
} from './types';
import { generateWebhookHeaders } from './verification';

// ============================================================================
// HTTP Client Interface
// ============================================================================

export interface HttpClient {
  post(
    url: string,
    body: string,
    headers: Record<string, string>
  ): Promise<{ status: number; body?: string }>;
}

// ============================================================================
// Delivery Storage Interface
// ============================================================================

export interface DeliveryStorage {
  saveDelivery(delivery: WebhookDelivery): Promise<void>;
  getDelivery(id: string): Promise<WebhookDelivery | null>;
  getPendingDeliveries(limit: number): Promise<WebhookDelivery[]>;
  getDeliveriesDueForRetry(limit: number): Promise<WebhookDelivery[]>;
  updateDeliveryStatus(
    id: string,
    status: WebhookDelivery['status'],
    updates: Partial<WebhookDelivery>
  ): Promise<void>;
}

// ============================================================================
// Webhook Storage Interface
// ============================================================================

export interface WebhookStorage {
  getWebhook(id: string): Promise<WebhookConfig | null>;
  getWebhooksForEvent(
    eventType: string,
    userId: string
  ): Promise<WebhookConfig[]>;
  updateWebhookStatus(
    id: string,
    status: WebhookConfig['status'],
    failureInfo?: { count: number; reason: string }
  ): Promise<void>;
}

// ============================================================================
// Delivery Result
// ============================================================================

export interface DeliveryResult {
  success: boolean;
  deliveryId: string;
  statusCode?: number;
  error?: string;
  retryScheduled?: boolean;
  nextRetryAt?: Date;
}

// ============================================================================
// Webhook Delivery Service
// ============================================================================

export class WebhookDeliveryService {
  private retryConfig: WebhookRetryConfig;

  constructor(
    private httpClient: HttpClient,
    private deliveryStorage: DeliveryStorage,
    private webhookStorage: WebhookStorage,
    retryConfig?: Partial<WebhookRetryConfig>
  ) {
    this.retryConfig = {
      maxAttempts: retryConfig?.maxAttempts ?? 5,
      initialDelayMs: retryConfig?.initialDelayMs ?? 1000,
      maxDelayMs: retryConfig?.maxDelayMs ?? 3600000,
      backoffMultiplier: retryConfig?.backoffMultiplier ?? 2,
    };
  }

  /**
   * Queue a webhook delivery
   */
  async queueDelivery(
    webhook: WebhookConfig,
    payload: WebhookPayload
  ): Promise<string> {
    const deliveryId = randomUUID();
    const now = new Date().toISOString();

    const delivery: WebhookDelivery = {
      id: deliveryId,
      webhookId: webhook.id,
      eventId: payload.id,
      payload,
      status: 'pending',
      attempts: 0,
      maxAttempts: this.retryConfig.maxAttempts,
      createdAt: now,
    };

    await this.deliveryStorage.saveDelivery(delivery);
    return deliveryId;
  }

  /**
   * Deliver a webhook immediately
   */
  async deliver(deliveryId: string): Promise<DeliveryResult> {
    const delivery = await this.deliveryStorage.getDelivery(deliveryId);
    if (!delivery) {
      return {
        success: false,
        deliveryId,
        error: 'Delivery not found',
      };
    }

    const webhook = await this.webhookStorage.getWebhook(delivery.webhookId);
    if (!webhook) {
      await this.deliveryStorage.updateDeliveryStatus(deliveryId, 'failed', {
        lastResponseBody: 'Webhook configuration not found',
      });
      return {
        success: false,
        deliveryId,
        error: 'Webhook not found',
      };
    }

    if (webhook.status !== 'active') {
      await this.deliveryStorage.updateDeliveryStatus(deliveryId, 'failed', {
        lastResponseBody: 'Webhook is disabled',
      });
      return {
        success: false,
        deliveryId,
        error: 'Webhook disabled',
      };
    }

    return this.attemptDelivery(delivery, webhook);
  }

  /**
   * Attempt to deliver a webhook
   */
  private async attemptDelivery(
    delivery: WebhookDelivery,
    webhook: WebhookConfig
  ): Promise<DeliveryResult> {
    const now = new Date();
    const payloadString = JSON.stringify(delivery.payload);
    const headers = generateWebhookHeaders(
      delivery.payload,
      webhook.secret,
      delivery.id
    );

    try {
      const response = await this.httpClient.post(
        webhook.url,
        payloadString,
        headers
      );

      const isSuccess = response.status >= 200 && response.status < 300;

      if (isSuccess) {
        // Success
        await this.deliveryStorage.updateDeliveryStatus(delivery.id, 'delivered', {
          attempts: delivery.attempts + 1,
          lastAttemptAt: now.toISOString(),
          lastResponseStatus: response.status,
          lastResponseBody: response.body?.substring(0, 1000),
        });

        await this.webhookStorage.updateWebhookStatus(webhook.id, 'active');

        return {
          success: true,
          deliveryId: delivery.id,
          statusCode: response.status,
        };
      } else {
        // HTTP error, may be retryable
        return this.handleFailure(
          delivery,
          webhook,
          response.status,
          `HTTP ${response.status}: ${response.body?.substring(0, 200)}`
        );
      }
    } catch (error) {
      // Network or other error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.handleFailure(delivery, webhook, undefined, errorMessage);
    }
  }

  /**
   * Handle delivery failure
   */
  private async handleFailure(
    delivery: WebhookDelivery,
    webhook: WebhookConfig,
    statusCode: number | undefined,
    errorMessage: string
  ): Promise<DeliveryResult> {
    const now = new Date();
    const newAttempts = delivery.attempts + 1;
    const shouldRetry = newAttempts < delivery.maxAttempts && this.isRetryable(statusCode);

    if (shouldRetry) {
      const nextRetryAt = this.calculateNextRetry(newAttempts);

      await this.deliveryStorage.updateDeliveryStatus(delivery.id, 'retrying', {
        attempts: newAttempts,
        lastAttemptAt: now.toISOString(),
        lastResponseStatus: statusCode,
        lastResponseBody: errorMessage,
        nextAttemptAt: nextRetryAt.toISOString(),
      });

      return {
        success: false,
        deliveryId: delivery.id,
        statusCode,
        error: errorMessage,
        retryScheduled: true,
        nextRetryAt,
      };
    } else {
      // Final failure
      await this.deliveryStorage.updateDeliveryStatus(delivery.id, 'failed', {
        attempts: newAttempts,
        lastAttemptAt: now.toISOString(),
        lastResponseStatus: statusCode,
        lastResponseBody: errorMessage,
      });

      // Update webhook failure status
      const newFailureCount = webhook.failureCount + 1;
      const newStatus = newFailureCount >= 5 ? 'failing' as const : webhook.status;
      
      await this.webhookStorage.updateWebhookStatus(webhook.id, newStatus, {
        count: newFailureCount,
        reason: errorMessage,
      });

      return {
        success: false,
        deliveryId: delivery.id,
        statusCode,
        error: errorMessage,
        retryScheduled: false,
      };
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(statusCode?: number): boolean {
    if (!statusCode) return true; // Network errors are retryable
    
    // Retry on server errors and rate limiting
    return statusCode >= 500 || statusCode === 429;
  }

  /**
   * Calculate next retry time with exponential backoff
   */
  private calculateNextRetry(attemptNumber: number): Date {
    const delayMs = Math.min(
      this.retryConfig.initialDelayMs * Math.pow(this.retryConfig.backoffMultiplier, attemptNumber - 1),
      this.retryConfig.maxDelayMs
    );

    // Add jitter (±10%)
    const jitter = delayMs * 0.1 * (Math.random() * 2 - 1);
    const finalDelay = delayMs + jitter;

    return new Date(Date.now() + finalDelay);
  }

  /**
   * Process pending deliveries
   */
  async processPendingDeliveries(batchSize: number = 10): Promise<DeliveryResult[]> {
    const pending = await this.deliveryStorage.getPendingDeliveries(batchSize);
    const results: DeliveryResult[] = [];

    for (const delivery of pending) {
      const result = await this.deliver(delivery.id);
      results.push(result);
    }

    return results;
  }

  /**
   * Process deliveries due for retry
   */
  async processRetries(batchSize: number = 10): Promise<DeliveryResult[]> {
    const retries = await this.deliveryStorage.getDeliveriesDueForRetry(batchSize);
    const results: DeliveryResult[] = [];

    for (const delivery of retries) {
      const result = await this.deliver(delivery.id);
      results.push(result);
    }

    return results;
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createWebhookDeliveryService(
  httpClient: HttpClient,
  deliveryStorage: DeliveryStorage,
  webhookStorage: WebhookStorage,
  retryConfig?: Partial<WebhookRetryConfig>
): WebhookDeliveryService {
  return new WebhookDeliveryService(
    httpClient,
    deliveryStorage,
    webhookStorage,
    retryConfig
  );
}
