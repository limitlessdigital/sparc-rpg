/**
 * iCal generation utilities
 */

import type { CalendarEvent, ReminderSettings } from './types';
import { ICAL_PRODID, ICAL_VERSION, ICAL_CALNAME_PREFIX } from './types';

// ============================================================================
// iCal Formatting
// ============================================================================

/**
 * Format a date for iCal (YYYYMMDDTHHMMSSZ format)
 */
export function formatICalDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Format a date for iCal with timezone
 */
export function formatICalDateWithTZ(date: Date | string, timezone: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  // For simplicity, we'll use UTC format
  // In production, you'd want to use a library like luxon for proper timezone handling
  return `TZID=${timezone}:${formatICalDate(d).replace('Z', '')}`;
}

/**
 * Escape special characters for iCal text fields
 */
export function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Fold long lines (iCal spec requires lines max 75 chars)
 */
export function foldLine(line: string): string {
  const maxLength = 75;
  if (line.length <= maxLength) return line;

  const result: string[] = [];
  let remaining = line;

  while (remaining.length > maxLength) {
    result.push(remaining.substring(0, maxLength));
    remaining = ' ' + remaining.substring(maxLength); // Continuation lines start with space
  }
  result.push(remaining);

  return result.join('\r\n');
}

// ============================================================================
// iCal Event Generation
// ============================================================================

export interface ICalEventOptions {
  event: CalendarEvent;
  reminders?: ReminderSettings;
  organizerEmail?: string;
  organizerName?: string;
}

/**
 * Generate a single VEVENT component
 */
export function generateVEvent(options: ICalEventOptions): string {
  const { event, reminders, organizerEmail, organizerName } = options;
  
  const lines: string[] = [
    'BEGIN:VEVENT',
    `UID:${event.id}@sparc-rpg.com`,
    `DTSTAMP:${formatICalDate(new Date())}`,
    `DTSTART:${formatICalDate(event.startTime)}`,
    `DTEND:${formatICalDate(event.endTime)}`,
    `SUMMARY:${escapeICalText(event.title)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICalText(event.description)}`);
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeICalText(event.location)}`);
  }

  if (event.onlineUrl) {
    lines.push(`URL:${event.onlineUrl}`);
  }

  if (organizerEmail) {
    const cn = organizerName ? `;CN=${escapeICalText(organizerName)}` : '';
    lines.push(`ORGANIZER${cn}:mailto:${organizerEmail}`);
  }

  // Add SPARC-specific properties as X-properties
  lines.push(`X-SPARC-SESSION-ID:${event.sessionId}`);
  if (event.campaignId) {
    lines.push(`X-SPARC-CAMPAIGN-ID:${event.campaignId}`);
  }
  if (event.campaignName) {
    lines.push(`X-SPARC-CAMPAIGN-NAME:${escapeICalText(event.campaignName)}`);
  }
  lines.push(`X-SPARC-SEER:${escapeICalText(event.seerName)}`);

  // Add recurrence rule
  if (event.recurrence) {
    const rrule = generateRRule(event.recurrence);
    lines.push(`RRULE:${rrule}`);
  }

  // Add reminders (VALARM)
  if (reminders) {
    for (const minutes of reminders.emailReminders) {
      lines.push(...generateAlarm(minutes, 'EMAIL'));
    }
    for (const minutes of reminders.pushReminders) {
      lines.push(...generateAlarm(minutes, 'DISPLAY'));
    }
  }

  lines.push(
    `CREATED:${formatICalDate(event.createdAt)}`,
    `LAST-MODIFIED:${formatICalDate(event.updatedAt)}`,
    'END:VEVENT'
  );

  return lines.map(foldLine).join('\r\n');
}

/**
 * Generate RRULE string
 */
function generateRRule(recurrence: NonNullable<CalendarEvent['recurrence']>): string {
  const parts: string[] = [];
  
  const freqMap = {
    daily: 'DAILY',
    weekly: 'WEEKLY',
    biweekly: 'WEEKLY',
    monthly: 'MONTHLY',
  };
  
  parts.push(`FREQ=${freqMap[recurrence.frequency]}`);
  
  if (recurrence.frequency === 'biweekly') {
    parts.push('INTERVAL=2');
  } else if (recurrence.interval > 1) {
    parts.push(`INTERVAL=${recurrence.interval}`);
  }
  
  if (recurrence.until) {
    parts.push(`UNTIL=${formatICalDate(recurrence.until)}`);
  } else if (recurrence.count) {
    parts.push(`COUNT=${recurrence.count}`);
  }
  
  return parts.join(';');
}

/**
 * Generate VALARM component
 */
function generateAlarm(minutesBefore: number, action: 'EMAIL' | 'DISPLAY'): string[] {
  return [
    'BEGIN:VALARM',
    `TRIGGER:-PT${minutesBefore}M`,
    `ACTION:${action}`,
    action === 'EMAIL' 
      ? 'DESCRIPTION:SPARC RPG Session Reminder'
      : 'DESCRIPTION:Your SPARC RPG session is starting soon!',
    'END:VALARM',
  ];
}

// ============================================================================
// iCal Calendar Generation
// ============================================================================

export interface ICalCalendarOptions {
  name: string;
  description?: string;
  events: CalendarEvent[];
  reminders?: ReminderSettings;
  refreshInterval?: number; // Minutes
}

/**
 * Generate a complete iCal calendar
 */
export function generateICalendar(options: ICalCalendarOptions): string {
  const { name, description, events, reminders, refreshInterval } = options;
  
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    `VERSION:${ICAL_VERSION}`,
    `PRODID:${ICAL_PRODID}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${ICAL_CALNAME_PREFIX} - ${escapeICalText(name)}`,
  ];

  if (description) {
    lines.push(`X-WR-CALDESC:${escapeICalText(description)}`);
  }

  // Add refresh interval for subscription calendars
  if (refreshInterval) {
    lines.push(`REFRESH-INTERVAL;VALUE=DURATION:PT${refreshInterval}M`);
    lines.push(`X-PUBLISHED-TTL:PT${refreshInterval}M`);
  }

  // Add events
  for (const event of events) {
    lines.push(generateVEvent({ event, reminders }));
  }

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

// ============================================================================
// iCal Parsing (basic)
// ============================================================================

export interface ParsedICalEvent {
  uid: string;
  summary: string;
  description?: string;
  dtstart: Date;
  dtend: Date;
  location?: string;
}

/**
 * Parse a simple iCal VEVENT (basic implementation)
 */
export function parseVEvent(icalString: string): ParsedICalEvent | null {
  const lines = icalString.split(/\r?\n/);
  const event: Partial<ParsedICalEvent> = {};
  
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    const value = valueParts.join(':');
    const baseKey = key.split(';')[0];
    
    switch (baseKey) {
      case 'UID':
        event.uid = value;
        break;
      case 'SUMMARY':
        event.summary = value.replace(/\\n/g, '\n').replace(/\\,/g, ',');
        break;
      case 'DESCRIPTION':
        event.description = value.replace(/\\n/g, '\n').replace(/\\,/g, ',');
        break;
      case 'DTSTART':
        event.dtstart = parseICalDate(value);
        break;
      case 'DTEND':
        event.dtend = parseICalDate(value);
        break;
      case 'LOCATION':
        event.location = value;
        break;
    }
  }
  
  if (event.uid && event.summary && event.dtstart && event.dtend) {
    return event as ParsedICalEvent;
  }
  
  return null;
}

/**
 * Parse iCal date format
 */
function parseICalDate(icalDate: string): Date {
  // Handle both YYYYMMDDTHHMMSSZ and YYYYMMDDTHHMMSS formats
  const cleaned = icalDate.replace(/[^0-9TZ]/g, '');
  
  if (cleaned.endsWith('Z')) {
    // UTC format
    const match = cleaned.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/);
    if (match) {
      return new Date(Date.UTC(
        parseInt(match[1]),
        parseInt(match[2]) - 1,
        parseInt(match[3]),
        parseInt(match[4]),
        parseInt(match[5]),
        parseInt(match[6])
      ));
    }
  }
  
  // Local time format
  const match = cleaned.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
  if (match) {
    return new Date(
      parseInt(match[1]),
      parseInt(match[2]) - 1,
      parseInt(match[3]),
      parseInt(match[4]),
      parseInt(match[5]),
      parseInt(match[6])
    );
  }
  
  // Fallback
  return new Date(icalDate);
}
