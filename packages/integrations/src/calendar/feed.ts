/**
 * Calendar feed management for subscription calendars
 */

import { randomUUID, randomBytes } from 'crypto';
import type { CalendarEvent, CalendarFeed, CalendarFeedType, ReminderSettings } from './types';
import { generateICalendar } from './ical';

// ============================================================================
// Feed Storage Interface
// ============================================================================

export interface CalendarFeedStorage {
  getFeed(feedId: string): Promise<CalendarFeed | null>;
  getFeedByToken(token: string): Promise<CalendarFeed | null>;
  getFeedsByUser(userId: string): Promise<CalendarFeed[]>;
  saveFeed(feed: CalendarFeed): Promise<void>;
  deleteFeed(feedId: string): Promise<void>;
  updateFeedAccess(feedId: string): Promise<void>;
}

export interface CalendarEventSource {
  getEventsForUser(
    userId: string,
    options: {
      campaignIds?: string[];
      includeAsPlayer?: boolean;
      includeAsSeer?: boolean;
      startAfter?: Date;
      startBefore?: Date;
    }
  ): Promise<CalendarEvent[]>;
}

// ============================================================================
// Feed URL Generation
// ============================================================================

/**
 * Generate a feed token
 */
export function generateFeedToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Generate feed URL
 */
export function generateFeedUrl(baseUrl: string, feedId: string, token: string): string {
  return `${baseUrl}/calendar/feed/${feedId}?token=${token}`;
}

/**
 * Generate webcal URL (for "subscribe" functionality)
 */
export function generateWebcalUrl(baseUrl: string, feedId: string, token: string): string {
  const url = generateFeedUrl(baseUrl, feedId, token);
  return url.replace(/^https?:/, 'webcal:');
}

// ============================================================================
// Calendar Feed Manager
// ============================================================================

export class CalendarFeedManager {
  constructor(
    private storage: CalendarFeedStorage,
    private eventSource: CalendarEventSource,
    private baseUrl: string
  ) {}

  /**
   * Create a new calendar feed
   */
  async createFeed(params: {
    userId: string;
    type: CalendarFeedType;
    name: string;
    filter?: {
      campaignIds?: string[];
      includeAsPlayer?: boolean;
      includeAsSeer?: boolean;
    };
  }): Promise<{ feed: CalendarFeed; url: string; webcalUrl: string }> {
    const feedId = randomUUID();
    const token = generateFeedToken();
    const now = new Date().toISOString();

    const feed: CalendarFeed = {
      id: feedId,
      userId: params.userId,
      type: params.type,
      filter: {
        campaignIds: params.filter?.campaignIds,
        includeAsPlayer: params.filter?.includeAsPlayer ?? true,
        includeAsSeer: params.filter?.includeAsSeer ?? true,
      },
      feedToken: token,
      feedName: params.name,
      isEnabled: true,
      createdAt: now,
    };

    await this.storage.saveFeed(feed);

    return {
      feed,
      url: generateFeedUrl(this.baseUrl, feedId, token),
      webcalUrl: generateWebcalUrl(this.baseUrl, feedId, token),
    };
  }

  /**
   * Get feed by ID
   */
  async getFeed(feedId: string): Promise<CalendarFeed | null> {
    return this.storage.getFeed(feedId);
  }

  /**
   * Get feed by token (for feed access)
   */
  async getFeedByToken(token: string): Promise<CalendarFeed | null> {
    return this.storage.getFeedByToken(token);
  }

  /**
   * List feeds for a user
   */
  async listFeeds(userId: string): Promise<CalendarFeed[]> {
    return this.storage.getFeedsByUser(userId);
  }

  /**
   * Regenerate feed token (invalidates old URLs)
   */
  async regenerateToken(feedId: string): Promise<{ url: string; webcalUrl: string } | null> {
    const feed = await this.storage.getFeed(feedId);
    if (!feed) return null;

    const newToken = generateFeedToken();
    const updated: CalendarFeed = {
      ...feed,
      feedToken: newToken,
    };

    await this.storage.saveFeed(updated);

    return {
      url: generateFeedUrl(this.baseUrl, feedId, newToken),
      webcalUrl: generateWebcalUrl(this.baseUrl, feedId, newToken),
    };
  }

  /**
   * Delete a feed
   */
  async deleteFeed(feedId: string): Promise<void> {
    await this.storage.deleteFeed(feedId);
  }

  /**
   * Generate iCal content for a feed
   */
  async generateFeedContent(
    feedId: string,
    token: string,
    reminders?: ReminderSettings
  ): Promise<string | null> {
    const feed = await this.storage.getFeedByToken(token);
    
    if (!feed || feed.id !== feedId || !feed.isEnabled) {
      return null;
    }

    // Update last accessed time
    await this.storage.updateFeedAccess(feedId);

    // Get events based on feed filter
    const now = new Date();
    const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const events = await this.eventSource.getEventsForUser(feed.userId, {
      campaignIds: feed.filter.campaignIds,
      includeAsPlayer: feed.filter.includeAsPlayer,
      includeAsSeer: feed.filter.includeAsSeer,
      startAfter: now,
      startBefore: threeMonthsFromNow,
    });

    return generateICalendar({
      name: feed.feedName,
      description: `SPARC RPG sessions for ${feed.feedName}`,
      events,
      reminders,
      refreshInterval: 60, // Refresh every hour
    });
  }
}

// ============================================================================
// Feed Endpoint Handler
// ============================================================================

export interface FeedResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

export async function handleFeedRequest(
  manager: CalendarFeedManager,
  feedId: string,
  token: string
): Promise<FeedResponse> {
  if (!feedId || !token) {
    return {
      status: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Missing feed ID or token',
    };
  }

  const content = await manager.generateFeedContent(feedId, token);

  if (!content) {
    return {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Feed not found or disabled',
    };
  }

  return {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sparc-sessions.ics"',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
    body: content,
  };
}

// ============================================================================
// Factory Function
// ============================================================================

export function createCalendarFeedManager(
  storage: CalendarFeedStorage,
  eventSource: CalendarEventSource,
  baseUrl: string
): CalendarFeedManager {
  return new CalendarFeedManager(storage, eventSource, baseUrl);
}
