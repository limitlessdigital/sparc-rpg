/**
 * Homebrew System Types
 * Based on PRD 25: Homebrew System
 */

// Core Attributes
export type Attribute = 'might' | 'grace' | 'wit' | 'heart';

// Homebrew Categories
export type HomebrewCategory = 'monster' | 'item' | 'ability' | 'spell' | 'class';
export type HomebrewStatus = 'draft' | 'published' | 'archived' | 'flagged';
export type HomebrewVisibility = 'private' | 'unlisted' | 'public';

// Monster Types
export type CreatureType =
  | 'beast' | 'humanoid' | 'undead' | 'construct'
  | 'elemental' | 'fiend' | 'celestial' | 'aberration'
  | 'dragon' | 'giant' | 'plant' | 'ooze';

export type CreatureSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';
export type DamageType = 'physical' | 'fire' | 'ice' | 'lightning' | 'poison' | 'necrotic' | 'radiant';

// Item Types
export type ItemType = 'weapon' | 'armor' | 'shield' | 'accessory' | 'consumable' | 'artifact' | 'tool';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type WeaponType = 'sword' | 'axe' | 'mace' | 'dagger' | 'bow' | 'staff' | 'spear';

// Ability Types
export type AbilityType = 'attack' | 'heal' | 'buff' | 'debuff' | 'utility' | 'summon';
export type TargetType = 'self' | 'ally' | 'enemy' | 'any' | 'all_allies' | 'all_enemies' | 'area';
export type EffectType =
  | 'damage' | 'heal' | 'buff_attribute' | 'debuff_attribute'
  | 'stun' | 'poison' | 'burn' | 'freeze' | 'blind'
  | 'shield' | 'regeneration' | 'haste' | 'slow';

// ============================================
// Base Homebrew Entity
// ============================================

export interface HomebrewBase {
  id: string;
  creatorId: string;
  creatorName: string;

  // Metadata
  name: string;
  description: string;
  tags: string[];
  category: HomebrewCategory;

  // Media
  iconUrl?: string;
  artUrl?: string;

  // State
  status: HomebrewStatus;
  visibility: HomebrewVisibility;

  // Versioning
  currentVersion: string;
  versions: HomebrewVersion[];

  // Stats
  usageCount: number;
  favoriteCount: number;
  averageRating: number;
  ratingCount: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface HomebrewVersion {
  id: string;
  homebrewId: string;
  version: string;
  changelog?: string;
  data: HomebrewData;
  createdAt: string;
}

export type HomebrewData = MonsterData | ItemData | AbilityData | ClassData;

// ============================================
// Monster Data
// ============================================

export interface MonsterAttack {
  id: string;
  name: string;
  attribute: Attribute;
  diceCount: number;
  damageType: DamageType;
  description?: string;
}

export interface MonsterAbility {
  id: string;
  name: string;
  description: string;
  cooldown?: number;
  effect?: AbilityEffect;
}

export interface MonsterData {
  // Core stats
  hitPoints: number;
  armorClass: number;

  // Attributes
  might: number;
  grace: number;
  wit: number;
  heart: number;

  // Combat
  attacks: MonsterAttack[];
  abilities: MonsterAbility[];

  // Classification
  type: CreatureType;
  size: CreatureSize;
  challengeRating: number;

  // Behavior
  tactics?: string;
  motivations?: string;
  weaknesses?: string;

  // Lore
  lore?: string;
  habitat?: string;
}

export interface HomebrewMonster extends HomebrewBase {
  category: 'monster';
  data: MonsterData;
}

// ============================================
// Item Data
// ============================================

export interface StatModifier {
  attribute: Attribute;
  modifier: number;
}

export interface SpecialEffect {
  id: string;
  name: string;
  description: string;
  trigger: 'always' | 'on_hit' | 'on_crit' | 'on_use' | 'on_damage';
}

export interface ItemRequirement {
  type: 'attribute' | 'class' | 'level';
  attribute?: Attribute;
  class?: string;
  minValue?: number;
}

export interface ItemData {
  itemType: ItemType;
  rarity: ItemRarity;

  // Effects
  statModifiers?: StatModifier[];
  specialEffects?: SpecialEffect[];

  // For consumables
  uses?: number;
  consumable?: boolean;

  // For weapons
  weaponType?: WeaponType;
  diceBonus?: number;
  damageType?: DamageType;

  // For armor
  armorBonus?: number;

  // Flavor
  flavorText?: string;
  lore?: string;
  weight?: number;
  value?: number;

  // Requirements
  requirements?: ItemRequirement[];
}

export interface HomebrewItem extends HomebrewBase {
  category: 'item';
  data: ItemData;
}

// ============================================
// Ability/Spell Data
// ============================================

export interface AbilityEffect {
  id: string;
  type: EffectType;
  value?: number;
  duration?: number;
  condition?: string;
}

export interface AbilityData {
  abilityType: AbilityType;

  // Targeting
  targetType: TargetType;
  range?: 'self' | 'touch' | 'ranged';
  areaOfEffect?: 'single' | 'line' | 'cone' | 'circle';

  // Mechanics
  attribute?: Attribute;
  difficulty?: number;

  // Effects
  effects: AbilityEffect[];

  // Cost/Limits
  cooldown?: number;
  usesPerEncounter?: number;
  usesPerDay?: number;

  // Flavor
  description: string;
  castingDescription?: string;
  visualEffect?: string;
}

export interface HomebrewAbility extends HomebrewBase {
  category: 'ability' | 'spell';
  data: AbilityData;
}

// ============================================
// Class Template Data
// ============================================

export interface ClassAbility {
  name: string;
  description: string;
  effect?: AbilityEffect;
  cooldown?: string;
}

export interface ClassData {
  // Base Stats
  primaryAttribute: Attribute;
  attributes: {
    might: number;
    grace: number;
    wit: number;
    heart: number;
  };
  hitPoints: number;

  // Starting Gear
  startingEquipment: string[];

  // Class Ability
  classAbility: ClassAbility;

  // Flavor
  archetype: string;
  background: string;
  playstyle: string;
  roleInParty: string;

  // Visual
  suggestedAppearance?: string;
}

export interface HomebrewClass extends HomebrewBase {
  category: 'class';
  data: ClassData;
}

// ============================================
// Union Types
// ============================================

export type Homebrew = HomebrewMonster | HomebrewItem | HomebrewAbility | HomebrewClass;

// ============================================
// Reviews & Ratings
// ============================================

export interface CreatorResponse {
  text: string;
  respondedAt: string;
}

export interface HomebrewReview {
  id: string;
  homebrewId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;

  rating: number;
  review?: string;

  helpfulCount: number;
  reportCount: number;

  creatorResponse?: CreatorResponse;

  createdAt: string;
  updatedAt?: string;
}

// ============================================
// User Library
// ============================================

export interface HomebrewReference {
  homebrewId: string;
  name: string;
  category: HomebrewCategory;
  status: HomebrewStatus;
}

export interface ImportedHomebrew {
  homebrewId: string;
  importedVersion: string;
  pinnedVersion?: string;
  importedAt: string;
}

export interface UserHomebrewLibrary {
  userId: string;
  created: HomebrewReference[];
  imported: ImportedHomebrew[];
  favorites: string[];
}

// ============================================
// Balance Validation
// ============================================

export type BalanceWarningSeverity = 'info' | 'warning' | 'error';

export interface BalanceWarning {
  severity: BalanceWarningSeverity;
  field: string;
  message: string;
  suggestion?: string;
}

export interface BalanceCheck {
  homebrewId: string;
  category: HomebrewCategory;
  calculatedRating: number;
  balanceWarnings: BalanceWarning[];
  comparable: {
    id: string;
    name: string;
    rating: number;
  }[];
}

// ============================================
// Browse & Discovery
// ============================================

export interface HomebrewSummary {
  id: string;
  name: string;
  description: string;
  category: HomebrewCategory;
  creatorName: string;
  creatorId: string;
  iconUrl?: string;
  averageRating: number;
  ratingCount: number;
  usageCount: number;
  tags: string[];
  updatedAt: string;
}

export type HomebrewSortBy = 'rating' | 'popular' | 'newest' | 'updated';

export interface HomebrewBrowseFilters {
  category?: HomebrewCategory;
  tags?: string[];
  search?: string;
  sortBy?: HomebrewSortBy;
  minRating?: number;
  creatorId?: string;
}

export interface HomebrewBrowseFacets {
  categories: { category: HomebrewCategory; count: number }[];
  tags: { tag: string; count: number }[];
}

// ============================================
// Export Format
// ============================================

export interface HomebrewExport {
  format: 'sparc-homebrew-v1';
  exportedAt: string;
  homebrew: HomebrewBase;
  allVersions: HomebrewVersion[];
}

// ============================================
// Constants
// ============================================

export const CREATURE_TYPES: { value: CreatureType; label: string }[] = [
  { value: 'beast', label: 'Beast' },
  { value: 'humanoid', label: 'Humanoid' },
  { value: 'undead', label: 'Undead' },
  { value: 'construct', label: 'Construct' },
  { value: 'elemental', label: 'Elemental' },
  { value: 'fiend', label: 'Fiend' },
  { value: 'celestial', label: 'Celestial' },
  { value: 'aberration', label: 'Aberration' },
  { value: 'dragon', label: 'Dragon' },
  { value: 'giant', label: 'Giant' },
  { value: 'plant', label: 'Plant' },
  { value: 'ooze', label: 'Ooze' },
];

export const CREATURE_SIZES: { value: CreatureSize; label: string }[] = [
  { value: 'tiny', label: 'Tiny' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'huge', label: 'Huge' },
  { value: 'gargantuan', label: 'Gargantuan' },
];

export const DAMAGE_TYPES: { value: DamageType; label: string }[] = [
  { value: 'physical', label: 'Physical' },
  { value: 'fire', label: 'Fire' },
  { value: 'ice', label: 'Ice' },
  { value: 'lightning', label: 'Lightning' },
  { value: 'poison', label: 'Poison' },
  { value: 'necrotic', label: 'Necrotic' },
  { value: 'radiant', label: 'Radiant' },
];

export const ITEM_TYPES: { value: ItemType; label: string }[] = [
  { value: 'weapon', label: 'Weapon' },
  { value: 'armor', label: 'Armor' },
  { value: 'shield', label: 'Shield' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'consumable', label: 'Consumable' },
  { value: 'artifact', label: 'Artifact' },
  { value: 'tool', label: 'Tool' },
];

export const ITEM_RARITIES: { value: ItemRarity; label: string; color: string }[] = [
  { value: 'common', label: 'Common', color: 'text-gray-400' },
  { value: 'uncommon', label: 'Uncommon', color: 'text-green-400' },
  { value: 'rare', label: 'Rare', color: 'text-blue-400' },
  { value: 'epic', label: 'Epic', color: 'text-purple-400' },
  { value: 'legendary', label: 'Legendary', color: 'text-orange-400' },
];

export const WEAPON_TYPES: { value: WeaponType; label: string }[] = [
  { value: 'sword', label: 'Sword' },
  { value: 'axe', label: 'Axe' },
  { value: 'mace', label: 'Mace' },
  { value: 'dagger', label: 'Dagger' },
  { value: 'bow', label: 'Bow' },
  { value: 'staff', label: 'Staff' },
  { value: 'spear', label: 'Spear' },
];

export const ABILITY_TYPES: { value: AbilityType; label: string }[] = [
  { value: 'attack', label: 'Attack' },
  { value: 'heal', label: 'Heal' },
  { value: 'buff', label: 'Buff' },
  { value: 'debuff', label: 'Debuff' },
  { value: 'utility', label: 'Utility' },
  { value: 'summon', label: 'Summon' },
];

export const TARGET_TYPES: { value: TargetType; label: string }[] = [
  { value: 'self', label: 'Self' },
  { value: 'ally', label: 'Single Ally' },
  { value: 'enemy', label: 'Single Enemy' },
  { value: 'any', label: 'Any Target' },
  { value: 'all_allies', label: 'All Allies' },
  { value: 'all_enemies', label: 'All Enemies' },
  { value: 'area', label: 'Area Effect' },
];

export const EFFECT_TYPES: { value: EffectType; label: string }[] = [
  { value: 'damage', label: 'Damage' },
  { value: 'heal', label: 'Heal' },
  { value: 'buff_attribute', label: 'Buff Attribute' },
  { value: 'debuff_attribute', label: 'Debuff Attribute' },
  { value: 'stun', label: 'Stun' },
  { value: 'poison', label: 'Poison' },
  { value: 'burn', label: 'Burn' },
  { value: 'freeze', label: 'Freeze' },
  { value: 'blind', label: 'Blind' },
  { value: 'shield', label: 'Shield' },
  { value: 'regeneration', label: 'Regeneration' },
  { value: 'haste', label: 'Haste' },
  { value: 'slow', label: 'Slow' },
];

export const ATTRIBUTES: { value: Attribute; label: string; icon: string }[] = [
  { value: 'might', label: 'Might', icon: '💪' },
  { value: 'grace', label: 'Grace', icon: '🎯' },
  { value: 'wit', label: 'Wit', icon: '🧠' },
  { value: 'heart', label: 'Heart', icon: '❤️' },
];

export const PARTY_ROLES = ['Tank', 'DPS', 'Healer', 'Support', 'Utility', 'Controller'];

export const SUGGESTED_HOMEBREW_TAGS = [
  'boss', 'minion', 'swarm', 'legendary', 'undead', 'dragon', 'elemental',
  'stealth', 'magic', 'melee', 'ranged', 'support', 'tank', 'dps',
  'fire', 'ice', 'lightning', 'poison', 'necrotic', 'radiant',
  'starter', 'balanced', 'powerful', 'niche', 'utility',
];
