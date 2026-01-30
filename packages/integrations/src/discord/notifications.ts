/**
 * Discord notification service for session announcements and reminders
 */

import type { DiscordServerConfig, SessionRSVP, RSVPStatus } from './types';
import { buildSessionAnnouncementEmbed, buildSessionReminderEmbed } from './embeds';
import type { SessionInfo } from '../types';

// ============================================================================
// Notification Types
// ============================================================================

export interface SessionAnnouncementOptions {
  session: SessionInfo;
  serverConfig: DiscordServerConfig;
  mentionRole?: boolean;
}

export interface SessionReminderOptions {
  session: SessionInfo;
  serverConfig: DiscordServerConfig;
  minutesBefore: number;
  attendees?: Array<{ discordUserId: string; discordUsername: string }>;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  channelId?: string;
  error?: string;
}

// ============================================================================
// Discord REST Client Interface
// ============================================================================

export interface DiscordRestClient {
  sendMessage(channelId: string, payload: {
    content?: string;
    embeds?: Array<Record<string, unknown>>;
    components?: Array<Record<string, unknown>>;
  }): Promise<{ id: string }>;
  
  editMessage(channelId: string, messageId: string, payload: {
    content?: string;
    embeds?: Array<Record<string, unknown>>;
  }): Promise<void>;
  
  addReaction(channelId: string, messageId: string, emoji: string): Promise<void>;
  
  getReactions(channelId: string, messageId: string, emoji: string): Promise<Array<{
    id: string;
    username: string;
  }>>;
}

// ============================================================================
// Notification Service
// ============================================================================

export class DiscordNotificationService {
  constructor(private client: DiscordRestClient) {}

  /**
   * Post a session announcement to the configured channel
   */
  async announceSession(options: SessionAnnouncementOptions): Promise<NotificationResult> {
    const { session, serverConfig } = options;

    if (!serverConfig.announcementChannelId) {
      return {
        success: false,
        error: 'No announcement channel configured',
      };
    }

    if (!serverConfig.features.sessionAnnouncements) {
      return {
        success: false,
        error: 'Session announcements are disabled',
      };
    }

    try {
      const embed = buildSessionAnnouncementEmbed(session);
      
      let content = '';
      if (options.mentionRole && serverConfig.notifications.mentionRole) {
        content = `<@&${serverConfig.notifications.mentionRole}>`;
      }

      const message = await this.client.sendMessage(serverConfig.announcementChannelId, {
        content: content || undefined,
        embeds: [embed as unknown as Record<string, unknown>],
      });

      // Add RSVP reactions
      await this.client.addReaction(serverConfig.announcementChannelId, message.id, '✅');
      await this.client.addReaction(serverConfig.announcementChannelId, message.id, '🤔');
      await this.client.addReaction(serverConfig.announcementChannelId, message.id, '❌');

      return {
        success: true,
        messageId: message.id,
        channelId: serverConfig.announcementChannelId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send announcement',
      };
    }
  }

  /**
   * Send a session reminder
   */
  async sendSessionReminder(options: SessionReminderOptions): Promise<NotificationResult> {
    const { session, serverConfig, minutesBefore, attendees } = options;

    if (!serverConfig.announcementChannelId) {
      return {
        success: false,
        error: 'No announcement channel configured',
      };
    }

    if (!serverConfig.notifications.sessionReminders) {
      return {
        success: false,
        error: 'Session reminders are disabled',
      };
    }

    try {
      const embed = buildSessionReminderEmbed(session, minutesBefore);
      
      // Mention attendees who RSVP'd yes
      let content = '';
      if (attendees && attendees.length > 0) {
        const mentions = attendees.map(a => `<@${a.discordUserId}>`).join(' ');
        content = `🔔 Reminder for: ${mentions}`;
      }

      const message = await this.client.sendMessage(serverConfig.announcementChannelId, {
        content: content || undefined,
        embeds: [embed as unknown as Record<string, unknown>],
      });

      return {
        success: true,
        messageId: message.id,
        channelId: serverConfig.announcementChannelId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send reminder',
      };
    }
  }

  /**
   * Collect RSVPs from message reactions
   */
  async collectRSVPs(
    channelId: string,
    messageId: string
  ): Promise<SessionRSVP[]> {
    const rsvps: SessionRSVP[] = [];
    const now = new Date().toISOString();

    const emojiToStatus: Record<string, RSVPStatus> = {
      '✅': 'yes',
      '🤔': 'maybe',
      '❌': 'no',
    };

    for (const [emoji, status] of Object.entries(emojiToStatus)) {
      try {
        const reactions = await this.client.getReactions(channelId, messageId, emoji);
        for (const user of reactions) {
          // Skip bot reactions
          rsvps.push({
            sessionId: messageId, // Using message ID as session reference
            discordUserId: user.id,
            discordUsername: user.username,
            status,
            respondedAt: now,
          });
        }
      } catch {
        // Ignore errors fetching individual reactions
      }
    }

    return rsvps;
  }

  /**
   * Update an announcement with current RSVP status
   */
  async updateAnnouncementRSVPs(
    session: SessionInfo,
    channelId: string,
    messageId: string,
    rsvps: SessionRSVP[]
  ): Promise<void> {
    const rsvpData = rsvps.map(r => ({
      username: r.discordUsername,
      status: r.status,
    }));

    const embed = buildSessionAnnouncementEmbed(session, rsvpData);

    await this.client.editMessage(channelId, messageId, {
      embeds: [embed as unknown as Record<string, unknown>],
    });
  }
}

// ============================================================================
// Scheduler for Reminders
// ============================================================================

export interface ScheduledReminder {
  sessionId: string;
  guildId: string;
  scheduledFor: Date;
  minutesBefore: number;
}

export class ReminderScheduler {
  private reminders: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Schedule a reminder for a session
   */
  scheduleReminder(
    reminder: ScheduledReminder,
    callback: (reminder: ScheduledReminder) => Promise<void>
  ): void {
    const key = `${reminder.sessionId}-${reminder.minutesBefore}`;
    
    // Cancel existing reminder if any
    this.cancelReminder(reminder.sessionId, reminder.minutesBefore);

    const delay = reminder.scheduledFor.getTime() - Date.now();
    
    if (delay <= 0) {
      // Already past, trigger immediately
      void callback(reminder);
      return;
    }

    const timeout = setTimeout(() => {
      this.reminders.delete(key);
      void callback(reminder);
    }, delay);

    this.reminders.set(key, timeout);
  }

  /**
   * Cancel a scheduled reminder
   */
  cancelReminder(sessionId: string, minutesBefore: number): void {
    const key = `${sessionId}-${minutesBefore}`;
    const timeout = this.reminders.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.reminders.delete(key);
    }
  }

  /**
   * Cancel all reminders for a session
   */
  cancelAllForSession(sessionId: string): void {
    for (const [key, timeout] of this.reminders.entries()) {
      if (key.startsWith(sessionId)) {
        clearTimeout(timeout);
        this.reminders.delete(key);
      }
    }
  }

  /**
   * Get count of scheduled reminders
   */
  getScheduledCount(): number {
    return this.reminders.size;
  }

  /**
   * Clear all reminders
   */
  clearAll(): void {
    for (const timeout of this.reminders.values()) {
      clearTimeout(timeout);
    }
    this.reminders.clear();
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createNotificationService(
  client: DiscordRestClient
): DiscordNotificationService {
  return new DiscordNotificationService(client);
}

export function createReminderScheduler(): ReminderScheduler {
  return new ReminderScheduler();
}
