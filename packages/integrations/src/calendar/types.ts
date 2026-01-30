/**
 * Calendar integration types
 */

import { z } from 'zod';

// ============================================================================
// Calendar Event
// ============================================================================

export const CalendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  
  // Timing
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  timezone: z.string().default('UTC'),
  isAllDay: z.boolean().default(false),
  
  // Location
  location: z.string().optional(), // Could be virtual link
  onlineUrl: z.string().url().optional(), // Video call link
  
  // SPARC specific
  sessionId: z.string(),
  campaignId: z.string().optional(),
  campaignName: z.string().optional(),
  seerName: z.string(),
  
  // Recurrence
  recurrence: z.object({
    frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
    interval: z.number().int().min(1).default(1),
    until: z.string().datetime().optional(),
    count: z.number().int().min(1).optional(),
  }).optional(),
  
  // Metadata
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

// ============================================================================
// Calendar Feed Configuration
// ============================================================================

export const CalendarFeedTypeSchema = z.enum(['user', 'campaign', 'session']);
export type CalendarFeedType = z.infer<typeof CalendarFeedTypeSchema>;

export const CalendarFeedSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: CalendarFeedTypeSchema,
  
  // Filter (what events to include)
  filter: z.object({
    campaignIds: z.array(z.string()).optional(),
    includeAsPlayer: z.boolean().default(true),
    includeAsSeer: z.boolean().default(true),
  }),
  
  // Feed settings
  feedToken: z.string(), // Secret token for feed URL
  feedName: z.string(),
  
  // Enabled status
  isEnabled: z.boolean().default(true),
  
  createdAt: z.string().datetime(),
  lastAccessedAt: z.string().datetime().optional(),
});
export type CalendarFeed = z.infer<typeof CalendarFeedSchema>;

// ============================================================================
// Google Calendar Integration
// ============================================================================

export const GoogleCalendarConnectionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  
  // OAuth tokens
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenExpiresAt: z.string().datetime(),
  
  // Selected calendar
  calendarId: z.string().default('primary'),
  calendarName: z.string().optional(),
  
  // Sync settings
  syncEnabled: z.boolean().default(true),
  syncDirection: z.enum(['export', 'import', 'bidirectional']).default('export'),
  
  // Event mapping
  eventMappings: z.record(z.string()).default({}), // sessionId -> googleEventId
  
  createdAt: z.string().datetime(),
  lastSyncAt: z.string().datetime().optional(),
});
export type GoogleCalendarConnection = z.infer<typeof GoogleCalendarConnectionSchema>;

// ============================================================================
// Reminder Settings
// ============================================================================

export const ReminderSettingsSchema = z.object({
  emailReminders: z.array(z.number().int().min(0)), // Minutes before
  pushReminders: z.array(z.number().int().min(0)),
  discordReminders: z.array(z.number().int().min(0)),
});
export type ReminderSettings = z.infer<typeof ReminderSettingsSchema>;

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  emailReminders: [1440, 60], // 24h and 1h before
  pushReminders: [60, 15],    // 1h and 15min before
  discordReminders: [60, 15],
};

// ============================================================================
// iCal Constants
// ============================================================================

export const ICAL_PRODID = '-//SPARC RPG//Calendar//EN';
export const ICAL_VERSION = '2.0';
export const ICAL_CALNAME_PREFIX = 'SPARC RPG';
