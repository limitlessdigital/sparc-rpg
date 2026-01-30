/**
 * Supabase Database Types for SPARC RPG
 * Generated based on migration schemas
 */

export type CharacterClass = 
  | "warrior" 
  | "wizard" 
  | "cleric" 
  | "rogue" 
  | "ranger" 
  | "paladin" 
  | "necromancer";

export type UserRole = "player" | "seer" | "admin";
export type DifficultyLevel = "easy" | "medium" | "hard" | "deadly";
export type AdventureStatus = "draft" | "review" | "published" | "archived";

export interface Equipment {
  id: string;
  name: string;
  type: "weapon" | "armor" | "accessory" | "consumable" | "misc";
  equipped?: boolean;
  description?: string;
  damage?: number;
  defense?: number;
}

export interface SpecialAbility {
  name: string;
  description: string;
  usesPerEncounter: number;
  currentUses?: number;
  effect?: {
    type: string;
    targetType: string;
    value: number;
    duration?: number;
  };
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          is_verified: boolean;
          games_played: number;
          games_run: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          is_verified?: boolean;
          games_played?: number;
          games_run?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          is_verified?: boolean;
          games_played?: number;
          games_run?: number;
          updated_at?: string;
        };
      };
      characters: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          class: CharacterClass;
          might: number;
          grace: number;
          wit: number;
          heart: number;
          hit_points: number;
          max_hit_points: number;
          experience: number;
          level: number;
          equipment: Equipment[];
          special_ability: SpecialAbility;
          last_played_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          class: CharacterClass;
          might: number;
          grace: number;
          wit: number;
          heart: number;
          hit_points?: number;
          max_hit_points?: number;
          experience?: number;
          level?: number;
          equipment?: Equipment[];
          special_ability: SpecialAbility;
          last_played_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          hit_points?: number;
          max_hit_points?: number;
          experience?: number;
          level?: number;
          equipment?: Equipment[];
          special_ability?: SpecialAbility;
          last_played_at?: string | null;
          updated_at?: string;
        };
      };
      adventures: {
        Row: {
          id: string;
          creator_id: string;
          name: string;
          description: string | null;
          thumbnail_url: string | null;
          artwork_url: string | null;
          difficulty: DifficultyLevel;
          estimated_duration: number;
          min_players: number;
          max_players: number;
          content: Record<string, unknown>;
          status: AdventureStatus;
          published_at: string | null;
          is_valid: boolean;
          validation_errors: unknown[];
          times_played: number;
          average_rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          name: string;
          description?: string | null;
          thumbnail_url?: string | null;
          artwork_url?: string | null;
          difficulty?: DifficultyLevel;
          estimated_duration?: number;
          min_players?: number;
          max_players?: number;
          content?: Record<string, unknown>;
          status?: AdventureStatus;
          published_at?: string | null;
          is_valid?: boolean;
          validation_errors?: unknown[];
          times_played?: number;
          average_rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          artwork_url?: string | null;
          difficulty?: DifficultyLevel;
          estimated_duration?: number;
          min_players?: number;
          max_players?: number;
          content?: Record<string, unknown>;
          status?: AdventureStatus;
          published_at?: string | null;
          is_valid?: boolean;
          validation_errors?: unknown[];
          times_played?: number;
          average_rating?: number | null;
          updated_at?: string;
        };
      };
    };
  };
}

// Helper type for character with computed properties
export interface CharacterWithAttributes {
  id: string;
  userId: string;
  name: string;
  class: CharacterClass;
  attributes: {
    might: number;
    grace: number;
    wit: number;
    heart: number;
  };
  hitPoints: {
    current: number;
    max: number;
  };
  experience: number;
  level: number;
  equipment: Equipment[];
  specialAbility: SpecialAbility;
  lastPlayedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
