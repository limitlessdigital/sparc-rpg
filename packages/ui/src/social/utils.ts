/**
 * Social System - Utility Functions
 */

import type {
  ReputationTier,
  OnlineStatus,
  BadgeRarity,
  PlayStyleTag,
  ExperienceLevel,
  ActivityType,
} from './types';

// ============================================
// Reputation Utilities
// ============================================

export function calculateReputationScore(
  positiveRatings: number,
  neutralRatings: number,
  sessionsCompleted: number,
  reportsAgainst: number
): number {
  // Base score from sessions
  let score = Math.min(sessionsCompleted * 2, 100);
  
  // Bonus from positive ratings
  score += positiveRatings * 5;
  
  // Small bonus from neutral
  score += neutralRatings * 1;
  
  // Penalty from reports
  score -= reportsAgainst * 20;
  
  return Math.max(0, Math.min(score, 500));
}

export function getReputationTier(score: number, sessions: number): ReputationTier {
  if (sessions < 5) return 'new';
  if (score >= 200) return 'exemplary';
  if (score >= 100) return 'trusted';
  if (score >= 30) return 'reliable';
  return 'new';
}

export function getReputationColor(tier: ReputationTier): string {
  switch (tier) {
    case 'exemplary': return 'text-yellow-400';
    case 'trusted': return 'text-green-400';
    case 'reliable': return 'text-blue-400';
    case 'new': return 'text-gray-400';
  }
}

export function getReputationIcon(tier: ReputationTier): string {
  switch (tier) {
    case 'exemplary': return '⭐';
    case 'trusted': return '✓';
    case 'reliable': return '○';
    case 'new': return '•';
  }
}

// ============================================
// Online Status Utilities
// ============================================

export function getOnlineStatusColor(status: OnlineStatus): string {
  switch (status) {
    case 'online': return 'bg-green-500';
    case 'idle': return 'bg-yellow-500';
    case 'in-session': return 'bg-purple-500';
    case 'offline': return 'bg-gray-500';
  }
}

export function getOnlineStatusText(status: OnlineStatus): string {
  switch (status) {
    case 'online': return 'Online';
    case 'idle': return 'Idle';
    case 'in-session': return 'In Session';
    case 'offline': return 'Offline';
  }
}

// ============================================
// Badge Utilities
// ============================================

export function getBadgeRarityColor(rarity: BadgeRarity): string {
  switch (rarity) {
    case 'legendary': return 'text-yellow-400 border-yellow-400';
    case 'epic': return 'text-purple-400 border-purple-400';
    case 'rare': return 'text-blue-400 border-blue-400';
    case 'uncommon': return 'text-green-400 border-green-400';
    case 'common': return 'text-gray-400 border-gray-400';
  }
}

export function getBadgeRarityGlow(rarity: BadgeRarity): string {
  switch (rarity) {
    case 'legendary': return 'shadow-yellow-500/50';
    case 'epic': return 'shadow-purple-500/50';
    case 'rare': return 'shadow-blue-500/50';
    case 'uncommon': return 'shadow-green-500/50';
    case 'common': return '';
  }
}

// ============================================
// Play Style Utilities
// ============================================

export function getPlayStyleLabel(tag: PlayStyleTag): string {
  switch (tag) {
    case 'roleplay-focused': return 'Roleplay Focused';
    case 'combat-focused': return 'Combat Focused';
    case 'casual': return 'Casual';
    case 'serious': return 'Serious';
    case 'newbie-friendly': return 'Newbie Friendly';
    case 'experienced-players': return 'Experienced Players';
  }
}

export function getPlayStyleIcon(tag: PlayStyleTag): string {
  switch (tag) {
    case 'roleplay-focused': return '🎭';
    case 'combat-focused': return '⚔️';
    case 'casual': return '🌴';
    case 'serious': return '📚';
    case 'newbie-friendly': return '🌱';
    case 'experienced-players': return '🏆';
  }
}

// ============================================
// Experience Level Utilities
// ============================================

export function getExperienceLevelLabel(level: ExperienceLevel): string {
  switch (level) {
    case 'any': return 'All Welcome';
    case 'newbie': return 'Newbie Friendly';
    case 'experienced': return 'Experienced';
  }
}

export function getExperienceLevelIcon(level: ExperienceLevel): string {
  switch (level) {
    case 'any': return '👋';
    case 'newbie': return '🌱';
    case 'experienced': return '🏆';
  }
}

// ============================================
// Activity Utilities
// ============================================

export function getActivityIcon(type: ActivityType): string {
  switch (type) {
    case 'session_completed': return '✅';
    case 'badge_earned': return '🏆';
    case 'achievement_unlocked': return '🎉';
    case 'group_joined': return '👥';
    case 'session_scheduled': return '📅';
    case 'friend_added': return '🤝';
    case 'level_up': return '⬆️';
  }
}

export function getActivityText(type: ActivityType, data: Record<string, unknown>): string {
  switch (type) {
    case 'session_completed':
      return `completed "${data.adventureName || 'a session'}"`;
    case 'badge_earned':
      return `earned the "${data.badgeName}" badge`;
    case 'achievement_unlocked':
      return `unlocked an achievement`;
    case 'group_joined':
      return `joined ${data.groupName}`;
    case 'session_scheduled':
      return `scheduled a session for ${data.adventureName || 'an adventure'}`;
    case 'friend_added':
      return `became friends with ${data.friendName}`;
    case 'level_up':
      return `reached level ${data.level}`;
    default:
      return 'did something';
  }
}

// ============================================
// Time Utilities
// ============================================

export function formatRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return then.toLocaleDateString();
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatPlayTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  if (hours < 1) return `${minutes} minutes`;
  if (hours < 24) return `${hours} hours`;
  const days = Math.floor(hours / 24);
  return `${days} days`;
}

// ============================================
// Validation Utilities
// ============================================

export function validateDisplayName(name: string): { valid: boolean; error?: string } {
  if (!name || name.length < 3) {
    return { valid: false, error: 'Name must be at least 3 characters' };
  }
  if (name.length > 30) {
    return { valid: false, error: 'Name must be 30 characters or less' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    return { valid: false, error: 'Name can only contain letters, numbers, underscores, and hyphens' };
  }
  return { valid: true };
}

export function validateBio(bio: string): { valid: boolean; error?: string } {
  if (bio.length > 500) {
    return { valid: false, error: 'Bio must be 500 characters or less' };
  }
  return { valid: true };
}

export function validateGroupName(name: string): { valid: boolean; error?: string } {
  if (!name || name.length < 3) {
    return { valid: false, error: 'Group name must be at least 3 characters' };
  }
  if (name.length > 50) {
    return { valid: false, error: 'Group name must be 50 characters or less' };
  }
  return { valid: true };
}

// ============================================
// Default Values
// ============================================

export const DEFAULT_PRIVACY_SETTINGS = {
  profileVisibility: 'public' as const,
  statsVisibility: 'friends' as const,
  activityFeed: true,
  discoverability: true,
  onlineStatus: 'visible' as const,
  friendRequests: 'anyone' as const,
};

export const ALL_PLAY_STYLE_TAGS: PlayStyleTag[] = [
  'roleplay-focused',
  'combat-focused',
  'casual',
  'serious',
  'newbie-friendly',
  'experienced-players',
];

// ============================================
// Mock Badges (for development)
// ============================================

export const SAMPLE_BADGES = [
  {
    id: 'first-adventure',
    name: 'First Adventure',
    description: 'Complete your first session',
    category: 'player' as const,
    rarity: 'common' as const,
    criteria: { sessionsPlayed: 1 },
  },
  {
    id: 'seer-novice',
    name: 'Seer Novice',
    description: 'Run your first session as Seer',
    category: 'seer' as const,
    rarity: 'common' as const,
    criteria: { sessionsRun: 1 },
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Complete 10 sessions',
    category: 'milestone' as const,
    rarity: 'uncommon' as const,
    criteria: { sessionsPlayed: 10 },
  },
  {
    id: 'master-seer',
    name: 'Master Seer',
    description: 'Run 25 sessions as Seer',
    category: 'seer' as const,
    rarity: 'rare' as const,
    criteria: { sessionsRun: 25 },
  },
  {
    id: 'all-rounder',
    name: 'All-Rounder',
    description: 'Play all 7 classes',
    category: 'player' as const,
    rarity: 'uncommon' as const,
    criteria: { uniqueClassesPlayed: 7 },
  },
  {
    id: 'helpful',
    name: 'Helpful',
    description: 'Receive 10 positive ratings',
    category: 'community' as const,
    rarity: 'uncommon' as const,
    criteria: { positiveRatings: 10 },
  },
  {
    id: 'legendary-hero',
    name: 'Legendary Hero',
    description: 'Complete 100 sessions',
    category: 'milestone' as const,
    rarity: 'epic' as const,
    criteria: { sessionsPlayed: 100 },
  },
  {
    id: 'community-star',
    name: 'Community Star',
    description: 'Receive 50+ positive ratings',
    category: 'community' as const,
    rarity: 'rare' as const,
    criteria: { positiveRatings: 50 },
  },
];
