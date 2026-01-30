// @sparc/db - Database Package
// Exports Supabase client and TypeScript types

// Client exports
export {
  createClient,
  createServerClient,
  createAdminClient,
  getClient,
  type TypedSupabaseClient,
} from './client';

// Type exports
export type {
  // Database schema
  Database,
  
  // Enum types
  CharacterClass,
  Attribute,
  DifficultyLevel,
  AdventureStatus,
  SessionStatus,
  RollOutcome,
  RollType,
  TutorialPath,
  UserRole,
  
  // JSON types
  EquipmentItem,
  SpecialAbility,
  RollModifier,
  GameState,
  AdventureContent,
  AdventureScene,
  AdventureEncounter,
  AdventureNPC,
  AdventureItem,
  
  // Table row types
  User,
  UserRoleRow,
  Character,
  Adventure,
  Creature,
  Session,
  SessionPlayer,
  SessionEvent,
  DiceRoll,
  TutorialProgressRow,
  LinkedProvider,
  
  // Insert types
  UserInsert,
  CharacterInsert,
  AdventureInsert,
  SessionInsert,
  DiceRollInsert,
  
  // Update types
  UserUpdate,
  CharacterUpdate,
  AdventureUpdate,
  SessionUpdate,
  
  // Helper types
  Tables,
  Enums,
} from './types';
