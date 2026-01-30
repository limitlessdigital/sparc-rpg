/**
 * Campaign Management - Utility Functions
 * Based on PRD 23: Campaign Management
 */

import type {
  CampaignPrivacy,
  CampaignStatus,
  CampaignFrequency,
  CampaignRole,
  SessionStatus,
  RsvpStatus,
  ArcStatus,
  WikiCategory,
  KeyMomentType,
  CampaignSettings,
} from './types';

// ============================================
// Default Values
// ============================================

export const DEFAULT_CAMPAIGN_SETTINGS: CampaignSettings = {
  maxPlayers: 4,
  sessionDuration: 120,
  frequency: 'weekly',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  requireApproval: true,
  minPlayersToRun: 2,
  absentXpPolicy: 'half',
  reminderHours: [24, 1],
};

export const ALL_WIKI_CATEGORIES: WikiCategory[] = [
  'npc',
  'location',
  'item',
  'lore',
  'faction',
  'other',
];

// ============================================
// Label Functions
// ============================================

export function getCampaignPrivacyLabel(privacy: CampaignPrivacy): string {
  const labels: Record<CampaignPrivacy, string> = {
    public: 'Public',
    unlisted: 'Unlisted',
    invite_only: 'Invite Only',
  };
  return labels[privacy];
}

export function getCampaignPrivacyDescription(privacy: CampaignPrivacy): string {
  const descriptions: Record<CampaignPrivacy, string> = {
    public: 'Anyone can find and join this campaign',
    unlisted: 'Only people with the link can join',
    invite_only: 'Only invited players can join',
  };
  return descriptions[privacy];
}

export function getCampaignStatusLabel(status: CampaignStatus): string {
  const labels: Record<CampaignStatus, string> = {
    active: 'Active',
    paused: 'Paused',
    completed: 'Completed',
    archived: 'Archived',
  };
  return labels[status];
}

export function getCampaignStatusColor(status: CampaignStatus): string {
  const colors: Record<CampaignStatus, string> = {
    active: 'text-green-500',
    paused: 'text-yellow-500',
    completed: 'text-blue-500',
    archived: 'text-gray-500',
  };
  return colors[status];
}

export function getCampaignStatusIcon(status: CampaignStatus): string {
  const icons: Record<CampaignStatus, string> = {
    active: '🟢',
    paused: '⏸️',
    completed: '✅',
    archived: '📦',
  };
  return icons[status];
}

export function getCampaignFrequencyLabel(frequency: CampaignFrequency): string {
  const labels: Record<CampaignFrequency, string> = {
    weekly: 'Weekly',
    biweekly: 'Biweekly',
    monthly: 'Monthly',
    irregular: 'Irregular',
  };
  return labels[frequency];
}

export function getCampaignRoleLabel(role: CampaignRole): string {
  const labels: Record<CampaignRole, string> = {
    owner: 'Seer (Owner)',
    co_seer: 'Co-Seer',
    player: 'Player',
    spectator: 'Spectator',
  };
  return labels[role];
}

export function getCampaignRoleColor(role: CampaignRole): string {
  const colors: Record<CampaignRole, string> = {
    owner: 'text-purple-500',
    co_seer: 'text-indigo-500',
    player: 'text-blue-500',
    spectator: 'text-gray-500',
  };
  return colors[role];
}

export function getCampaignRoleIcon(role: CampaignRole): string {
  const icons: Record<CampaignRole, string> = {
    owner: '👑',
    co_seer: '🎭',
    player: '⚔️',
    spectator: '👁️',
  };
  return icons[role];
}

export function getSessionStatusLabel(status: SessionStatus): string {
  const labels: Record<SessionStatus, string> = {
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return labels[status];
}

export function getSessionStatusColor(status: SessionStatus): string {
  const colors: Record<SessionStatus, string> = {
    scheduled: 'text-blue-500',
    in_progress: 'text-green-500',
    completed: 'text-gray-500',
    cancelled: 'text-red-500',
  };
  return colors[status];
}

export function getSessionStatusIcon(status: SessionStatus): string {
  const icons: Record<SessionStatus, string> = {
    scheduled: '📅',
    in_progress: '🎮',
    completed: '✅',
    cancelled: '❌',
  };
  return icons[status];
}

export function getRsvpStatusLabel(status: RsvpStatus): string {
  const labels: Record<RsvpStatus, string> = {
    yes: 'Going',
    no: 'Not Going',
    maybe: 'Maybe',
    pending: 'Pending',
  };
  return labels[status];
}

export function getRsvpStatusColor(status: RsvpStatus): string {
  const colors: Record<RsvpStatus, string> = {
    yes: 'text-green-500',
    no: 'text-red-500',
    maybe: 'text-yellow-500',
    pending: 'text-gray-500',
  };
  return colors[status];
}

export function getRsvpStatusIcon(status: RsvpStatus): string {
  const icons: Record<RsvpStatus, string> = {
    yes: '✅',
    no: '❌',
    maybe: '❓',
    pending: '⏳',
  };
  return icons[status];
}

export function getArcStatusLabel(status: ArcStatus): string {
  const labels: Record<ArcStatus, string> = {
    upcoming: 'Upcoming',
    active: 'Active',
    completed: 'Completed',
  };
  return labels[status];
}

export function getArcStatusColor(status: ArcStatus): string {
  const colors: Record<ArcStatus, string> = {
    upcoming: 'text-blue-500',
    active: 'text-green-500',
    completed: 'text-gray-500',
  };
  return colors[status];
}

export function getWikiCategoryLabel(category: WikiCategory): string {
  const labels: Record<WikiCategory, string> = {
    npc: 'NPCs',
    location: 'Locations',
    item: 'Items',
    lore: 'Lore',
    faction: 'Factions',
    other: 'Other',
  };
  return labels[category];
}

export function getWikiCategoryIcon(category: WikiCategory): string {
  const icons: Record<WikiCategory, string> = {
    npc: '👤',
    location: '🗺️',
    item: '🎒',
    lore: '📜',
    faction: '⚔️',
    other: '📝',
  };
  return icons[category];
}

export function getKeyMomentTypeLabel(type: KeyMomentType): string {
  const labels: Record<KeyMomentType, string> = {
    combat: 'Combat',
    roleplay: 'Roleplay',
    discovery: 'Discovery',
    failure: 'Failure',
    heroic: 'Heroic',
  };
  return labels[type];
}

export function getKeyMomentTypeIcon(type: KeyMomentType): string {
  const icons: Record<KeyMomentType, string> = {
    combat: '⚔️',
    roleplay: '🎭',
    discovery: '🔍',
    failure: '💔',
    heroic: '🦸',
  };
  return icons[type];
}

// ============================================
// Time Formatting
// ============================================

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

export function formatPlayTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr${hours !== 1 ? 's' : ''}`;
  }
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''}`;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 0) {
    // Future
    const absDiffMin = Math.floor(Math.abs(diffMs) / 60000);
    const absDiffHour = Math.floor(absDiffMin / 60);
    const absDiffDay = Math.floor(absDiffHour / 24);

    if (absDiffMin < 60) {
      return `in ${absDiffMin} min`;
    }
    if (absDiffHour < 24) {
      return `in ${absDiffHour} hr${absDiffHour !== 1 ? 's' : ''}`;
    }
    if (absDiffDay < 7) {
      return `in ${absDiffDay} day${absDiffDay !== 1 ? 's' : ''}`;
    }
    return date.toLocaleDateString();
  }

  if (diffSec < 60) {
    return 'just now';
  }
  if (diffMin < 60) {
    return `${diffMin} min ago`;
  }
  if (diffHour < 24) {
    return `${diffHour} hr${diffHour !== 1 ? 's' : ''} ago`;
  }
  if (diffDay < 7) {
    return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  }
  return date.toLocaleDateString();
}

export function formatScheduledTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const timeStr = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (isToday) {
    return `Today at ${timeStr}`;
  }
  if (isTomorrow) {
    return `Tomorrow at ${timeStr}`;
  }

  const dayStr = date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  return `${dayStr} at ${timeStr}`;
}

export function getTimeUntil(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();

  if (diffMs < 0) {
    return 'Past';
  }

  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 60) {
    return `${diffMin} min`;
  }
  if (diffHour < 24) {
    return `${diffHour} hr${diffHour !== 1 ? 's' : ''}`;
  }
  return `${diffDay} day${diffDay !== 1 ? 's' : ''}`;
}

// ============================================
// Validation
// ============================================

export function validateCampaignName(name: string): string | null {
  if (name.length < 3) {
    return 'Campaign name must be at least 3 characters';
  }
  if (name.length > 100) {
    return 'Campaign name must be 100 characters or less';
  }
  return null;
}

export function validateCampaignDescription(description: string): string | null {
  if (description.length > 2000) {
    return 'Description must be 2000 characters or less';
  }
  return null;
}

export function validateSessionTitle(title: string): string | null {
  if (title.length > 200) {
    return 'Session title must be 200 characters or less';
  }
  return null;
}

export function validateArcName(name: string): string | null {
  if (name.length < 1) {
    return 'Arc name is required';
  }
  if (name.length > 200) {
    return 'Arc name must be 200 characters or less';
  }
  return null;
}

export function validateWikiTitle(title: string): string | null {
  if (title.length < 1) {
    return 'Page title is required';
  }
  if (title.length > 200) {
    return 'Page title must be 200 characters or less';
  }
  return null;
}

// ============================================
// Helpers
// ============================================

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function calculateArcProgress(
  completedSessions: number,
  totalSessions: number
): number {
  if (totalSessions === 0) return 0;
  return Math.round((completedSessions / totalSessions) * 100);
}

export function canManageCampaign(role: CampaignRole): boolean {
  return role === 'owner' || role === 'co_seer';
}

export function canEditWiki(role: CampaignRole): boolean {
  return role === 'owner' || role === 'co_seer' || role === 'player';
}

export function canViewSeerOnlyContent(role: CampaignRole): boolean {
  return role === 'owner' || role === 'co_seer';
}

export function getRsvpSummary(attendees: Array<{ rsvp: RsvpStatus }>): {
  yes: number;
  no: number;
  maybe: number;
  pending: number;
} {
  return attendees.reduce(
    (acc, a) => {
      acc[a.rsvp]++;
      return acc;
    },
    { yes: 0, no: 0, maybe: 0, pending: 0 }
  );
}

export function isSessionUpcoming(session: { status: SessionStatus; scheduledFor?: string }): boolean {
  if (session.status !== 'scheduled') return false;
  if (!session.scheduledFor) return false;
  return new Date(session.scheduledFor) > new Date();
}

export function getNextSession(
  sessions: Array<{ status: SessionStatus; scheduledFor?: string }>
): typeof sessions[0] | undefined {
  return sessions
    .filter(isSessionUpcoming)
    .sort((a, b) => {
      if (!a.scheduledFor || !b.scheduledFor) return 0;
      return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
    })[0];
}
