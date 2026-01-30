/**
 * Twitch EventSub integration for channel events
 */

import { createHmac, timingSafeEqual } from 'crypto';
import type {
  TwitchConfig,
  EventSubSubscription,
  EventSubSubscriptionType,
  ChannelPointRedemption,
} from './types';

// ============================================================================
// EventSub Signature Verification
// ============================================================================

export interface EventSubHeaders {
  'twitch-eventsub-message-id': string;
  'twitch-eventsub-message-timestamp': string;
  'twitch-eventsub-message-signature': string;
  'twitch-eventsub-message-type': 'webhook_callback_verification' | 'notification' | 'revocation';
  'twitch-eventsub-subscription-type': string;
  'twitch-eventsub-subscription-version': string;
}

export function verifyEventSubSignature(
  headers: EventSubHeaders,
  body: string,
  secret: string
): boolean {
  const message = headers['twitch-eventsub-message-id'] +
    headers['twitch-eventsub-message-timestamp'] +
    body;

  const hmac = createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  const expectedSignature = `sha256=${hmac}`;
  const actualSignature = headers['twitch-eventsub-message-signature'];

  try {
    return timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(actualSignature)
    );
  } catch {
    return false;
  }
}

// ============================================================================
// EventSub Payload Types
// ============================================================================

export interface EventSubVerificationPayload {
  challenge: string;
  subscription: {
    id: string;
    type: string;
    version: string;
    status: string;
    condition: Record<string, string>;
  };
}

export interface EventSubNotificationPayload<T = unknown> {
  subscription: {
    id: string;
    type: EventSubSubscriptionType;
    version: string;
    status: string;
    condition: Record<string, string>;
  };
  event: T;
}

// Event-specific payloads
export interface ChannelPointRedemptionEvent {
  id: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  user_id: string;
  user_login: string;
  user_name: string;
  user_input: string;
  status: 'unfulfilled' | 'fulfilled' | 'canceled';
  reward: {
    id: string;
    title: string;
    cost: number;
    prompt: string;
  };
  redeemed_at: string;
}

export interface PollBeginEvent {
  id: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  title: string;
  choices: Array<{
    id: string;
    title: string;
  }>;
  bits_voting: {
    is_enabled: boolean;
    amount_per_vote: number;
  };
  channel_points_voting: {
    is_enabled: boolean;
    amount_per_vote: number;
  };
  started_at: string;
  ends_at: string;
}

export interface PollEndEvent {
  id: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  title: string;
  choices: Array<{
    id: string;
    title: string;
    bits_votes: number;
    channel_points_votes: number;
    votes: number;
  }>;
  bits_voting: {
    is_enabled: boolean;
    amount_per_vote: number;
  };
  channel_points_voting: {
    is_enabled: boolean;
    amount_per_vote: number;
  };
  status: 'completed' | 'archived' | 'terminated';
  started_at: string;
  ended_at: string;
}

export interface StreamOnlineEvent {
  id: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  type: 'live' | 'playlist' | 'watch_party' | 'premiere' | 'rerun';
  started_at: string;
}

export interface StreamOfflineEvent {
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
}

// ============================================================================
// EventSub Manager
// ============================================================================

export interface EventSubStorage {
  getSubscription(id: string): Promise<EventSubSubscription | null>;
  getSubscriptionsByStreamer(streamerId: string): Promise<EventSubSubscription[]>;
  saveSubscription(subscription: EventSubSubscription): Promise<void>;
  deleteSubscription(id: string): Promise<void>;
  
  getRedemptionConfig(streamerId: string, rewardId: string): Promise<ChannelPointRedemption | null>;
}

export interface TwitchApiClient {
  createEventSubSubscription(params: {
    type: EventSubSubscriptionType;
    version: string;
    condition: Record<string, string>;
    transport: {
      method: 'webhook';
      callback: string;
      secret: string;
    };
  }): Promise<{ id: string }>;
  
  deleteEventSubSubscription(subscriptionId: string): Promise<void>;
}

export type EventHandler<T> = (event: T, streamerId: string) => Promise<void>;

export class EventSubManager {
  private handlers: Map<EventSubSubscriptionType, EventHandler<unknown>> = new Map();

  constructor(
    private config: TwitchConfig,
    private storage: EventSubStorage,
    private apiClient: TwitchApiClient
  ) {}

  /**
   * Register event handler
   */
  on<T>(type: EventSubSubscriptionType, handler: EventHandler<T>): void {
    this.handlers.set(type, handler as EventHandler<unknown>);
  }

  /**
   * Subscribe to EventSub events for a streamer
   */
  async subscribe(
    streamerId: string,
    twitchUserId: string,
    types: EventSubSubscriptionType[]
  ): Promise<EventSubSubscription[]> {
    const subscriptions: EventSubSubscription[] = [];

    for (const type of types) {
      const condition = this.getConditionForType(type, twitchUserId);
      
      const result = await this.apiClient.createEventSubSubscription({
        type,
        version: '1',
        condition,
        transport: {
          method: 'webhook',
          callback: this.config.webhookCallbackUrl,
          secret: this.config.webhookSecret,
        },
      });

      const subscription: EventSubSubscription = {
        id: `${streamerId}-${type}`,
        streamerId,
        type,
        twitchSubscriptionId: result.id,
        status: 'webhook_callback_verification_pending',
        createdAt: new Date().toISOString(),
      };

      await this.storage.saveSubscription(subscription);
      subscriptions.push(subscription);
    }

    return subscriptions;
  }

  /**
   * Unsubscribe from EventSub events
   */
  async unsubscribe(streamerId: string): Promise<void> {
    const subscriptions = await this.storage.getSubscriptionsByStreamer(streamerId);
    
    for (const sub of subscriptions) {
      await this.apiClient.deleteEventSubSubscription(sub.twitchSubscriptionId);
      await this.storage.deleteSubscription(sub.id);
    }
  }

  /**
   * Handle incoming EventSub webhook
   */
  async handleWebhook(
    headers: EventSubHeaders,
    body: string
  ): Promise<{ status: number; body?: string }> {
    // Verify signature
    if (!verifyEventSubSignature(headers, body, this.config.webhookSecret)) {
      return { status: 403 };
    }

    const messageType = headers['twitch-eventsub-message-type'];
    const payload = JSON.parse(body);

    // Handle verification challenge
    if (messageType === 'webhook_callback_verification') {
      const verificationPayload = payload as EventSubVerificationPayload;
      return {
        status: 200,
        body: verificationPayload.challenge,
      };
    }

    // Handle revocation
    if (messageType === 'revocation') {
      // Log and clean up
      console.log('EventSub subscription revoked:', payload.subscription.id);
      return { status: 204 };
    }

    // Handle notification
    if (messageType === 'notification') {
      const notification = payload as EventSubNotificationPayload;
      const handler = this.handlers.get(notification.subscription.type);
      
      if (handler) {
        const streamerId = notification.subscription.condition.broadcaster_user_id;
        await handler(notification.event, streamerId);
      }
      
      return { status: 204 };
    }

    return { status: 400 };
  }

  private getConditionForType(
    type: EventSubSubscriptionType,
    broadcasterId: string
  ): Record<string, string> {
    switch (type) {
      case 'channel.follow':
        return { broadcaster_user_id: broadcasterId, moderator_user_id: broadcasterId };
      case 'stream.online':
      case 'stream.offline':
        return { broadcaster_user_id: broadcasterId };
      default:
        return { broadcaster_user_id: broadcasterId };
    }
  }
}

// ============================================================================
// Channel Point Redemption Handler
// ============================================================================

export interface RedemptionActionContext {
  streamerId: string;
  sessionId?: string;
  viewerUsername: string;
  viewerInput?: string;
}

export type RedemptionAction = (
  context: RedemptionActionContext,
  config: Record<string, unknown>
) => Promise<void>;

export class RedemptionHandler {
  private actions: Map<string, RedemptionAction> = new Map();

  /**
   * Register a redemption action handler
   */
  registerAction(actionType: string, handler: RedemptionAction): void {
    this.actions.set(actionType, handler);
  }

  /**
   * Handle a channel point redemption
   */
  async handleRedemption(
    event: ChannelPointRedemptionEvent,
    redemptionConfig: ChannelPointRedemption | null,
    sessionId?: string
  ): Promise<void> {
    if (!redemptionConfig || !redemptionConfig.isEnabled) {
      return;
    }

    const action = this.actions.get(redemptionConfig.action);
    if (!action) {
      console.warn(`Unknown redemption action: ${redemptionConfig.action}`);
      return;
    }

    await action(
      {
        streamerId: redemptionConfig.streamerId,
        sessionId,
        viewerUsername: event.user_name,
        viewerInput: event.user_input,
      },
      redemptionConfig.actionConfig || {}
    );
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createEventSubManager(
  config: TwitchConfig,
  storage: EventSubStorage,
  apiClient: TwitchApiClient
): EventSubManager {
  return new EventSubManager(config, storage, apiClient);
}

export function createRedemptionHandler(): RedemptionHandler {
  const handler = new RedemptionHandler();

  // Register default actions
  handler.registerAction('trigger_random_event', async (context, config) => {
    console.log(`Triggering random event for ${context.viewerUsername}`, config);
    // Implementation would emit an event to the game session
  });

  handler.registerAction('add_modifier', async (context, config) => {
    console.log(`Adding modifier for ${context.viewerUsername}`, config);
    // Implementation would add a temporary modifier to dice rolls
  });

  handler.registerAction('heal_character', async (context, config) => {
    console.log(`Healing character for ${context.viewerUsername}`, config);
    // Implementation would heal a character in the session
  });

  return handler;
}
