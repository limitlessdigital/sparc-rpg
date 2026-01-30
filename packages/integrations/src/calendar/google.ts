/**
 * Google Calendar integration
 */

import type { CalendarEvent, GoogleCalendarConnection } from './types';

// ============================================================================
// Google Calendar API Types
// ============================================================================

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  conferenceData?: {
    createRequest?: {
      requestId: string;
      conferenceSolutionKey: { type: string };
    };
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
  extendedProperties?: {
    private?: Record<string, string>;
    shared?: Record<string, string>;
  };
}

export interface GoogleCalendarList {
  items: Array<{
    id: string;
    summary: string;
    primary?: boolean;
    accessRole: string;
  }>;
}

// ============================================================================
// Google Calendar Client Interface
// ============================================================================

export interface GoogleCalendarApiClient {
  // Calendar operations
  listCalendars(accessToken: string): Promise<GoogleCalendarList>;
  
  // Event operations
  createEvent(
    accessToken: string,
    calendarId: string,
    event: GoogleCalendarEvent
  ): Promise<{ id: string }>;
  
  updateEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
    event: GoogleCalendarEvent
  ): Promise<void>;
  
  deleteEvent(
    accessToken: string,
    calendarId: string,
    eventId: string
  ): Promise<void>;
  
  getEvent(
    accessToken: string,
    calendarId: string,
    eventId: string
  ): Promise<GoogleCalendarEvent | null>;
  
  // Token refresh
  refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresAt: Date;
  }>;
}

// ============================================================================
// Storage Interface
// ============================================================================

export interface GoogleCalendarStorage {
  getConnection(userId: string): Promise<GoogleCalendarConnection | null>;
  saveConnection(connection: GoogleCalendarConnection): Promise<void>;
  deleteConnection(userId: string): Promise<void>;
  updateEventMapping(
    userId: string,
    sessionId: string,
    googleEventId: string | null
  ): Promise<void>;
}

// ============================================================================
// Google Calendar Service
// ============================================================================

export class GoogleCalendarService {
  constructor(
    private apiClient: GoogleCalendarApiClient,
    private storage: GoogleCalendarStorage
  ) {}

  /**
   * Get user's connection (refreshing token if needed)
   */
  async getConnection(userId: string): Promise<GoogleCalendarConnection | null> {
    const connection = await this.storage.getConnection(userId);
    if (!connection) return null;

    // Check if token needs refresh
    const expiresAt = new Date(connection.tokenExpiresAt);
    const now = new Date();
    const fiveMinutes = 5 * 60 * 1000;

    if (expiresAt.getTime() - now.getTime() < fiveMinutes) {
      // Token expires soon, refresh it
      try {
        const refreshed = await this.apiClient.refreshToken(connection.refreshToken);
        const updated: GoogleCalendarConnection = {
          ...connection,
          accessToken: refreshed.accessToken,
          tokenExpiresAt: refreshed.expiresAt.toISOString(),
        };
        await this.storage.saveConnection(updated);
        return updated;
      } catch (error) {
        console.error('Failed to refresh Google token:', error);
        return null;
      }
    }

    return connection;
  }

  /**
   * List user's calendars
   */
  async listCalendars(userId: string): Promise<Array<{ id: string; name: string; isPrimary: boolean }>> {
    const connection = await this.getConnection(userId);
    if (!connection) return [];

    const result = await this.apiClient.listCalendars(connection.accessToken);
    
    return result.items.map(cal => ({
      id: cal.id,
      name: cal.summary,
      isPrimary: cal.primary || false,
    }));
  }

  /**
   * Set the calendar to sync to
   */
  async setTargetCalendar(userId: string, calendarId: string, calendarName: string): Promise<void> {
    const connection = await this.getConnection(userId);
    if (!connection) throw new Error('No Google Calendar connection');

    const updated: GoogleCalendarConnection = {
      ...connection,
      calendarId,
      calendarName,
    };
    await this.storage.saveConnection(updated);
  }

  /**
   * Sync a SPARC session to Google Calendar
   */
  async syncSession(userId: string, event: CalendarEvent): Promise<string | null> {
    const connection = await this.getConnection(userId);
    if (!connection || !connection.syncEnabled) return null;

    const googleEvent = this.convertToGoogleEvent(event);
    const existingEventId = connection.eventMappings[event.sessionId];

    try {
      if (existingEventId) {
        // Update existing event
        await this.apiClient.updateEvent(
          connection.accessToken,
          connection.calendarId,
          existingEventId,
          googleEvent
        );
        return existingEventId;
      } else {
        // Create new event
        const result = await this.apiClient.createEvent(
          connection.accessToken,
          connection.calendarId,
          googleEvent
        );
        
        // Save mapping
        await this.storage.updateEventMapping(userId, event.sessionId, result.id);
        return result.id;
      }
    } catch (error) {
      console.error('Failed to sync to Google Calendar:', error);
      return null;
    }
  }

  /**
   * Remove a session from Google Calendar
   */
  async removeSession(userId: string, sessionId: string): Promise<void> {
    const connection = await this.getConnection(userId);
    if (!connection) return;

    const eventId = connection.eventMappings[sessionId];
    if (!eventId) return;

    try {
      await this.apiClient.deleteEvent(
        connection.accessToken,
        connection.calendarId,
        eventId
      );
      await this.storage.updateEventMapping(userId, sessionId, null);
    } catch (error) {
      console.error('Failed to remove from Google Calendar:', error);
    }
  }

  /**
   * Disconnect Google Calendar
   */
  async disconnect(userId: string): Promise<void> {
    await this.storage.deleteConnection(userId);
  }

  /**
   * Convert SPARC event to Google Calendar event
   */
  private convertToGoogleEvent(event: CalendarEvent): GoogleCalendarEvent {
    const googleEvent: GoogleCalendarEvent = {
      summary: event.title,
      description: this.buildDescription(event),
      start: {
        dateTime: event.startTime,
        timeZone: event.timezone,
      },
      end: {
        dateTime: event.endTime,
        timeZone: event.timezone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },
          { method: 'popup', minutes: 15 },
        ],
      },
      extendedProperties: {
        private: {
          sparcSessionId: event.sessionId,
          sparcCampaignId: event.campaignId || '',
          sparcSeer: event.seerName,
        },
      },
    };

    if (event.location) {
      googleEvent.location = event.location;
    }

    if (event.onlineUrl) {
      googleEvent.description += `\n\nJoin online: ${event.onlineUrl}`;
    }

    return googleEvent;
  }

  /**
   * Build event description
   */
  private buildDescription(event: CalendarEvent): string {
    const parts: string[] = [];
    
    if (event.description) {
      parts.push(event.description);
    }
    
    parts.push('');
    parts.push(`🎭 Seer: ${event.seerName}`);
    
    if (event.campaignName) {
      parts.push(`📖 Campaign: ${event.campaignName}`);
    }
    
    parts.push('');
    parts.push('Powered by SPARC RPG - https://sparc-rpg.com');
    
    return parts.join('\n');
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createGoogleCalendarService(
  apiClient: GoogleCalendarApiClient,
  storage: GoogleCalendarStorage
): GoogleCalendarService {
  return new GoogleCalendarService(apiClient, storage);
}
