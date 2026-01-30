/**
 * Homebrew System - Component Exports
 * Based on PRD 25: Homebrew System
 */

// Types
export type {
  // Core
  Attribute,
  HomebrewCategory,
  HomebrewStatus,
  HomebrewVisibility,
  HomebrewBase,
  HomebrewVersion,
  HomebrewData,
  Homebrew,
  
  // Monster
  CreatureType,
  CreatureSize,
  DamageType,
  MonsterAttack,
  MonsterAbility,
  MonsterData,
  HomebrewMonster,
  
  // Item
  ItemType,
  ItemRarity,
  WeaponType,
  StatModifier,
  SpecialEffect,
  ItemRequirement,
  ItemData,
  HomebrewItem,
  
  // Ability/Spell
  AbilityType,
  TargetType,
  EffectType,
  AbilityEffect,
  AbilityData,
  HomebrewAbility,
  
  // Class
  ClassAbility,
  ClassData,
  HomebrewClass,
  
  // Reviews
  CreatorResponse,
  HomebrewReview,
  
  // Library
  HomebrewReference,
  ImportedHomebrew,
  UserHomebrewLibrary,
  
  // Balance
  BalanceWarningSeverity,
  BalanceWarning,
  BalanceCheck,
  
  // Browse
  HomebrewSummary,
  HomebrewSortBy,
  HomebrewBrowseFilters,
  HomebrewBrowseFacets,
  
  // Export
  HomebrewExport,
} from "./types";

// Constants
export {
  CREATURE_TYPES,
  CREATURE_SIZES,
  DAMAGE_TYPES,
  ITEM_TYPES,
  ITEM_RARITIES,
  WEAPON_TYPES,
  ABILITY_TYPES,
  TARGET_TYPES,
  EFFECT_TYPES,
  ATTRIBUTES,
  PARTY_ROLES,
  SUGGESTED_HOMEBREW_TAGS,
} from "./types";

// Balance utilities
export {
  calculateMonsterCR,
  validateMonsterBalance,
  calculateItemPowerLevel,
  validateItemBalance,
  calculateAbilityPowerLevel,
  validateAbilityBalance,
  validateClassBalance,
  performBalanceCheck,
} from "./balance";

// Creator Components
export { MonsterCreator } from "./MonsterCreator";
export type { MonsterCreatorProps } from "./MonsterCreator";

export { ItemCreator } from "./ItemCreator";
export type { ItemCreatorProps } from "./ItemCreator";

export { AbilityCreator } from "./AbilityCreator";
export type { AbilityCreatorProps } from "./AbilityCreator";

export { ClassCreator } from "./ClassCreator";
export type { ClassCreatorProps } from "./ClassCreator";

// Browser & Library
export { HomebrewBrowser } from "./HomebrewBrowser";
export type { HomebrewBrowserProps } from "./HomebrewBrowser";

export { HomebrewLibrary } from "./HomebrewLibrary";
export type { HomebrewLibraryProps } from "./HomebrewLibrary";
