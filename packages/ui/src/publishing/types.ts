/**
 * Publishing System - Type Definitions
 * Based on PRD 12
 */

// Visibility options
export type AdventureVisibility = 'private' | 'unlisted' | 'public';

// Difficulty levels
export type AdventureDifficulty = 'beginner' | 'intermediate' | 'advanced';

// Published adventure data
export interface PublishedAdventure {
  id: string;
  adventureId: string;
  authorId: string;
  authorName: string;
  
  // Metadata
  title: string;
  description: string;
  coverImageUrl?: string;
  tags: string[];
  difficulty: AdventureDifficulty;
  estimatedDurationMinutes: number;
  recommendedPlayers: {
    min: number;
    max: number;
  };
  
  // Content versioning
  contentVersion: number;
  contentHash: string;
  
  // Visibility
  visibility: AdventureVisibility;
  
  // Stats
  playCount: number;
  completionCount: number;
  completionRate: number;
  averageRating: number | null;
  ratingCount: number;
  
  // Timestamps
  publishedAt: string;
  lastUpdatedAt: string;
  
  // Version info
  currentVersion: string;
  versions: AdventureVersion[];
}

// Adventure version snapshot
export interface AdventureVersion {
  id: string;
  adventureId: string;
  versionNumber: string;
  changelog?: string;
  publishedAt: string;
}

// Rating data
export interface AdventureRating {
  id: string;
  adventureId: string;
  userId: string;
  sessionId: string;
  rating: number;
  review?: string;
  completedAt: string;
  createdAt: string;
  updatedAt?: string;
}

// Tag data
export interface AdventureTag {
  id: string;
  name: string;
  slug: string;
  adventureCount: number;
}

// Publish request
export interface PublishRequest {
  visibility: AdventureVisibility;
  tags: string[];
  difficulty: AdventureDifficulty;
  coverImageUrl?: string;
  recommendedPlayers?: {
    min: number;
    max: number;
  };
}

// Publish metadata form state
export interface PublishMetadata {
  title: string;
  description: string;
  coverImageUrl?: string;
  tags: string[];
  difficulty: AdventureDifficulty;
  visibility: AdventureVisibility;
  recommendedPlayers: {
    min: number;
    max: number;
  };
}

// Validation state for publishing
export interface PublishValidation {
  isValid: boolean;
  canPublish: boolean;
  errors: string[];
  warnings: string[];
}

// Version history item
export interface VersionHistoryItem {
  version: string;
  publishedAt: string;
  changelog?: string;
  isCurrent: boolean;
}

// Analytics summary (placeholder)
export interface AdventureAnalytics {
  totalPlays: number;
  uniquePlayers: number;
  completions: number;
  completionRate: number;
  averagePlayTime: number;
  averageRating: number | null;
  ratingCount: number;
  playsByDay: Array<{
    date: string;
    plays: number;
  }>;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// Suggested tags by category
export const SUGGESTED_TAGS = {
  theme: ['fantasy', 'horror', 'mystery', 'comedy', 'scifi'],
  tone: ['serious', 'lighthearted', 'dark', 'epic'],
  focus: ['combat-heavy', 'story-heavy', 'puzzle-focused'],
  setting: ['dungeon', 'wilderness', 'urban', 'underwater'],
} as const;

// All suggested tags flat
export const ALL_SUGGESTED_TAGS = Object.values(SUGGESTED_TAGS).flat();
