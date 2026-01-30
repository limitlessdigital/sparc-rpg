// Client-side exports only - server.ts must be imported directly where needed
export { createClient, getSupabaseClient } from "./client";
export { characterService } from "./characters";
export type { 
  Database, 
  CharacterClass, 
  Equipment, 
  SpecialAbility, 
  CharacterWithAttributes,
  UserRole,
  DifficultyLevel,
  AdventureStatus,
} from "./types";
