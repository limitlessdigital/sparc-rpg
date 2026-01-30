// @sparc/db - Database Types
// These types match the Supabase schema defined in migrations/
// Run `supabase gen types typescript --local > types.ts` to regenerate from live DB

// ============================================
// ENUM TYPES
// ============================================

export type CharacterClass =
  | 'warrior'
  | 'rogue'
  | 'wizard'
  | 'cleric'
  | 'paladin'
  | 'ranger'
  | 'necromancer';

export type Attribute = 'might' | 'grace' | 'wit' | 'heart';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type AdventureStatus = 'draft' | 'published' | 'archived';

export type SessionStatus =
  | 'waiting'
  | 'starting_soon'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export type RollOutcome =
  | 'critical_success'
  | 'success'
  | 'failure'
  | 'critical_failure';

export type RollType =
  | 'attribute_check'
  | 'attack'
  | 'defense'
  | 'initiative'
  | 'damage'
  | 'healing'
  | 'ability'
  | 'heroic_save';

export type TutorialPath = 'player' | 'seer';

export type UserRole = 'player' | 'seer' | 'admin';

// ============================================
// JSON TYPES
// ============================================

export interface EquipmentItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'item' | 'consumable';
  description?: string;
  bonus?: number;
  equipped?: boolean;
}

export interface SpecialAbility {
  id: string;
  name: string;
  description: string;
  attribute?: Attribute;
  usesPerSession?: number;
  usesRemaining?: number;
}

export interface RollModifier {
  source: string;
  value: number;
  reason?: string;
}

export interface GameState {
  turnOrder?: string[]; // Character IDs
  currentTurn?: number;
  round?: number;
  customData?: Record<string, unknown>;
}

export interface AdventureContent {
  scenes?: AdventureScene[];
  encounters?: AdventureEncounter[];
  npcs?: AdventureNPC[];
  items?: AdventureItem[];
}

export interface AdventureScene {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  connections: string[]; // Scene IDs
}

export interface AdventureEncounter {
  id: string;
  sceneId: string;
  name: string;
  description: string;
  creatures: string[]; // Creature IDs
}

export interface AdventureNPC {
  id: string;
  name: string;
  description: string;
  dialogue?: string[];
}

export interface AdventureItem {
  id: string;
  name: string;
  description: string;
  type: string;
}

// ============================================
// DATABASE SCHEMA TYPES
// ============================================

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
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: UserRole;
          granted_at: string;
          granted_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: UserRole;
          granted_at?: string;
          granted_by?: string | null;
        };
        Update: {
          role?: UserRole;
          granted_by?: string | null;
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
          equipment: EquipmentItem[];
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
          equipment?: EquipmentItem[];
          special_ability: SpecialAbility;
          last_played_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          class?: CharacterClass;
          might?: number;
          grace?: number;
          wit?: number;
          heart?: number;
          hit_points?: number;
          max_hit_points?: number;
          experience?: number;
          level?: number;
          equipment?: EquipmentItem[];
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
          content: AdventureContent;
          status: AdventureStatus;
          published_at: string | null;
          is_valid: boolean;
          validation_errors: string[];
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
          content?: AdventureContent;
          status?: AdventureStatus;
          published_at?: string | null;
          is_valid?: boolean;
          validation_errors?: string[];
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
          content?: AdventureContent;
          status?: AdventureStatus;
          published_at?: string | null;
          is_valid?: boolean;
          validation_errors?: string[];
          times_played?: number;
          average_rating?: number | null;
          updated_at?: string;
        };
      };
      creatures: {
        Row: {
          id: string;
          adventure_id: string;
          name: string;
          description: string | null;
          stats: Record<string, unknown>;
          abilities: unknown[];
          hit_points: number;
          armor: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          adventure_id: string;
          name: string;
          description?: string | null;
          stats?: Record<string, unknown>;
          abilities?: unknown[];
          hit_points?: number;
          armor?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          stats?: Record<string, unknown>;
          abilities?: unknown[];
          hit_points?: number;
          armor?: number;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          seer_id: string;
          adventure_id: string;
          code: string;
          is_public: boolean;
          max_players: number;
          looking_for: string | null;
          scheduled_start: string | null;
          status: SessionStatus;
          current_scene_id: string | null;
          current_encounter_id: string | null;
          game_state: GameState;
          started_at: string | null;
          ended_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seer_id: string;
          adventure_id: string;
          code?: string;
          is_public?: boolean;
          max_players?: number;
          looking_for?: string | null;
          scheduled_start?: string | null;
          status?: SessionStatus;
          current_scene_id?: string | null;
          current_encounter_id?: string | null;
          game_state?: GameState;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          is_public?: boolean;
          max_players?: number;
          looking_for?: string | null;
          scheduled_start?: string | null;
          status?: SessionStatus;
          current_scene_id?: string | null;
          current_encounter_id?: string | null;
          game_state?: GameState;
          started_at?: string | null;
          ended_at?: string | null;
          updated_at?: string;
        };
      };
      session_players: {
        Row: {
          session_id: string;
          user_id: string;
          character_id: string;
          is_active: boolean;
          heroic_saves_used: number;
          joined_at: string;
          left_at: string | null;
        };
        Insert: {
          session_id: string;
          user_id: string;
          character_id: string;
          is_active?: boolean;
          heroic_saves_used?: number;
          joined_at?: string;
          left_at?: string | null;
        };
        Update: {
          character_id?: string;
          is_active?: boolean;
          heroic_saves_used?: number;
          left_at?: string | null;
        };
      };
      session_events: {
        Row: {
          id: string;
          session_id: string;
          event_type: string;
          payload: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          event_type: string;
          payload?: Record<string, unknown>;
          created_at?: string;
        };
        Update: never;
      };
      dice_rolls: {
        Row: {
          id: string;
          session_id: string;
          character_id: string;
          character_name: string;
          attribute: Attribute;
          dice_count: number;
          difficulty: number;
          roll_type: RollType;
          modifiers: RollModifier[];
          results: number[];
          total: number;
          modified_total: number;
          success: boolean;
          outcome: RollOutcome;
          margin: number;
          description: string | null;
          animation_seed: number | null;
          original_roll_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          character_id: string;
          character_name: string;
          attribute: Attribute;
          dice_count: number;
          difficulty: number;
          roll_type: RollType;
          modifiers?: RollModifier[];
          results: number[];
          total: number;
          modified_total: number;
          success: boolean;
          outcome: RollOutcome;
          margin: number;
          description?: string | null;
          animation_seed?: number | null;
          original_roll_id?: string | null;
          created_at?: string;
        };
        Update: never;
      };
      tutorial_progress: {
        Row: {
          user_id: string;
          path: TutorialPath | null;
          current_step: string;
          completed_steps: string[];
          started_at: string;
          completed_at: string | null;
          skipped: boolean;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          path?: TutorialPath | null;
          current_step?: string;
          completed_steps?: string[];
          started_at?: string;
          completed_at?: string | null;
          skipped?: boolean;
          updated_at?: string;
        };
        Update: {
          path?: TutorialPath | null;
          current_step?: string;
          completed_steps?: string[];
          completed_at?: string | null;
          skipped?: boolean;
          updated_at?: string;
        };
      };
      linked_providers: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          provider_user_id: string;
          linked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: string;
          provider_user_id: string;
          linked_at?: string;
        };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_session_details: {
        Args: { p_session_id: string };
        Returns: {
          session_data: Record<string, unknown>;
          players: Record<string, unknown>[];
          adventure_data: Record<string, unknown>;
        }[];
      };
      user_has_role: {
        Args: { p_user_id: string; p_role: UserRole };
        Returns: boolean;
      };
      get_user_roles: {
        Args: { p_user_id: string };
        Returns: UserRole[];
      };
      find_session_by_code: {
        Args: { p_code: string };
        Returns: {
          id: string;
          adventure_name: string;
          seer_name: string;
          status: SessionStatus;
          player_count: number;
          max_players: number;
          is_public: boolean;
        }[];
      };
      get_browse_sessions: {
        Args: {
          p_difficulty?: DifficultyLevel | null;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: {
          session_id: string;
          code: string;
          status: SessionStatus;
          adventure_name: string;
          adventure_thumbnail: string | null;
          difficulty: DifficultyLevel;
          seer_name: string;
          seer_avatar: string | null;
          player_count: number;
          max_players: number;
          scheduled_start: string | null;
          looking_for: string | null;
        }[];
      };
      calculate_roll_outcome: {
        Args: {
          p_total: number;
          p_difficulty: number;
          p_results: number[];
        };
        Returns: {
          success: boolean;
          outcome: RollOutcome;
          margin: number;
        }[];
      };
    };
    Enums: {
      character_class: CharacterClass;
      attribute: Attribute;
      difficulty_level: DifficultyLevel;
      adventure_status: AdventureStatus;
      session_status: SessionStatus;
      roll_outcome: RollOutcome;
      roll_type: RollType;
      tutorial_path: TutorialPath;
      user_role: UserRole;
    };
  };
}

// ============================================
// HELPER TYPES
// ============================================

// Easy access to table row types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

// Easy access to enum types
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

// Convenience type aliases
export type User = Tables<'users'>;
export type UserRoleRow = Tables<'user_roles'>;
export type Character = Tables<'characters'>;
export type Adventure = Tables<'adventures'>;
export type Creature = Tables<'creatures'>;
export type Session = Tables<'sessions'>;
export type SessionPlayer = Tables<'session_players'>;
export type SessionEvent = Tables<'session_events'>;
export type DiceRoll = Tables<'dice_rolls'>;
export type TutorialProgressRow = Tables<'tutorial_progress'>;
export type LinkedProvider = Tables<'linked_providers'>;

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type CharacterInsert = Database['public']['Tables']['characters']['Insert'];
export type AdventureInsert = Database['public']['Tables']['adventures']['Insert'];
export type SessionInsert = Database['public']['Tables']['sessions']['Insert'];
export type DiceRollInsert = Database['public']['Tables']['dice_rolls']['Insert'];

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type CharacterUpdate = Database['public']['Tables']['characters']['Update'];
export type AdventureUpdate = Database['public']['Tables']['adventures']['Update'];
export type SessionUpdate = Database['public']['Tables']['sessions']['Update'];
