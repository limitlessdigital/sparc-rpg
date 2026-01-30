/**
 * @sparc/ui Compendium Types
 * 
 * Based on PRD 21: Compendium & Rules Reference
 * Type definitions for all compendium-related data structures.
 */

// Core entry types
export type CompendiumType = 
  | "rule"
  | "class"
  | "ability"
  | "item"
  | "monster"
  | "condition";

export type ItemType = "weapon" | "armor" | "consumable" | "misc";

export type MonsterChallenge = "minion" | "standard" | "elite" | "boss";

// Official SPARC Attributes (Version E2)
export type Attribute = "str" | "dex" | "int" | "cha";

// Stats union type
export type EntryStats = ItemStats | MonsterStats | ClassStats | AbilityStats | ConditionStats | RuleStats;

// Base compendium entry
export interface CompendiumEntry {
  id: string;
  slug: string;
  title: string;
  type: CompendiumType;
  category: string;
  subcategory?: string;
  summary: string;
  content: string;
  stats?: EntryStats;
  tags: string[];
  relatedEntries: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

// Item-specific stats
export interface ItemStats {
  itemType: ItemType;
  damage?: string;
  defense?: number;
  range?: string;
  properties: string[];
  weight?: number;
  value?: number;
}

// Monster-specific stats
export interface MonsterStats {
  hitPoints: number;
  str: number;
  dex: number;
  int: number;
  cha: number;
  abilities: string[];
  challenge: MonsterChallenge;
  loot?: string[];
}

// Class-specific stats
export interface ClassStats {
  primaryAttribute: Attribute;
  hitPoints: number;
  specialAbility: string;
  startingEquipment: string[];
  description: string;
  hitDie?: number;
  startingAttributes: {
    str: number;
    dex: number;
    int: number;
    cha: number;
  };
}

// Ability-specific stats
export interface AbilityStats {
  abilityType: "passive" | "active" | "reaction";
  usesPerSession?: number;
  targetType?: "self" | "ally" | "enemy" | "area";
  range?: string;
  duration?: string;
  cost?: string;
}

// Condition-specific stats
export interface ConditionStats {
  duration: string;
  effects: string[];
  removedBy?: string[];
}

// Rule-specific stats
export interface RuleStats {
  category: "core" | "combat" | "exploration" | "social" | "magic" | "advanced";
  complexity: "basic" | "intermediate" | "advanced";
}

// Typed entry helpers
export interface ItemEntry extends Omit<CompendiumEntry, 'type' | 'stats'> {
  type: "item";
  stats: ItemStats;
}

export interface MonsterEntry extends Omit<CompendiumEntry, 'type' | 'stats'> {
  type: "monster";
  stats: MonsterStats;
}

export interface ClassEntry extends Omit<CompendiumEntry, 'type' | 'stats'> {
  type: "class";
  stats: ClassStats;
}

export interface AbilityEntry extends Omit<CompendiumEntry, 'type' | 'stats'> {
  type: "ability";
  stats: AbilityStats;
}

export interface ConditionEntry extends Omit<CompendiumEntry, 'type' | 'stats'> {
  type: "condition";
  stats: ConditionStats;
}

export interface RuleEntry extends Omit<CompendiumEntry, 'type' | 'stats'> {
  type: "rule";
  stats: RuleStats;
}

// Search types
export interface SearchResult {
  entry: CompendiumEntry;
  score: number;
  highlights: {
    field: string;
    snippet: string;
  }[];
}

export interface SearchFilters {
  query: string;
  type?: CompendiumType;
  category?: string;
  tags?: string[];
}

// Tooltip data (minimal for fast loading)
export interface TooltipData {
  id: string;
  title: string;
  type: CompendiumType;
  summary: string;
  keyStats: Record<string, string>;
}

// Bookmark types
export interface Bookmark {
  id: string;
  userId: string;
  entryId: string;
  folderId?: string;
  createdAt: string;
}

export interface BookmarkFolder {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

// Category summary
export interface CategoryInfo {
  type: CompendiumType;
  name: string;
  icon: string;
  description: string;
  count: number;
  subcategories: {
    name: string;
    count: number;
  }[];
}

// Compendium state
export interface CompendiumState {
  // Search
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  
  // Navigation
  currentCategory: CompendiumType | null;
  currentSubcategory: string | null;
  categoryEntries: CompendiumEntry[];
  
  // Selected entry
  selectedEntry: CompendiumEntry | null;
  
  // Bookmarks
  bookmarks: Bookmark[];
  folders: BookmarkFolder[];
  
  // Offline
  offlineAvailable: boolean;
  lastSynced: string | null;
  
  // UI
  pinnedCards: CompendiumEntry[];
  recentlyViewed: string[];
}
