import { getSupabaseClient } from "./client";
import type { Database, CharacterClass, Equipment, SpecialAbility, CharacterWithAttributes } from "./types";

type CharacterRow = Database["public"]["Tables"]["characters"]["Row"];
type CharacterInsert = Database["public"]["Tables"]["characters"]["Insert"];
type CharacterUpdate = Database["public"]["Tables"]["characters"]["Update"];

// Class templates with default stats and abilities
const CLASS_TEMPLATES: Record<CharacterClass, {
  might: number;
  grace: number;
  wit: number;
  heart: number;
  maxHitPoints: number;
  equipment: Equipment[];
  specialAbility: SpecialAbility;
}> = {
  warrior: {
    might: 5, grace: 3, wit: 2, heart: 2,
    maxHitPoints: 6,
    equipment: [
      { id: "w1", name: "Longsword", type: "weapon", equipped: true, damage: 2 },
      { id: "w2", name: "Shield", type: "armor", equipped: true, defense: 1 },
      { id: "w3", name: "Chain Mail", type: "armor", equipped: true, defense: 2 },
    ],
    specialAbility: {
      name: "Battle Cry",
      description: "Intimidate all enemies, giving allies +1 die on their next attack",
      usesPerEncounter: 1,
      effect: { type: "buff", targetType: "all_allies", value: 1, duration: 1 },
    },
  },
  rogue: {
    might: 2, grace: 5, wit: 3, heart: 2,
    maxHitPoints: 5,
    equipment: [
      { id: "r1", name: "Daggers (pair)", type: "weapon", equipped: true, damage: 1 },
      { id: "r2", name: "Leather Armor", type: "armor", equipped: true, defense: 1 },
      { id: "r3", name: "Lockpicks", type: "accessory", equipped: true },
    ],
    specialAbility: {
      name: "Sneak Attack",
      description: "Deal double damage when attacking an unaware enemy",
      usesPerEncounter: 1,
      effect: { type: "damage_boost", targetType: "enemy", value: 2 },
    },
  },
  wizard: {
    might: 1, grace: 2, wit: 5, heart: 4,
    maxHitPoints: 4,
    equipment: [
      { id: "wz1", name: "Staff", type: "weapon", equipped: true, damage: 1 },
      { id: "wz2", name: "Spellbook", type: "accessory", equipped: true },
      { id: "wz3", name: "Robes", type: "armor", equipped: true, defense: 0 },
    ],
    specialAbility: {
      name: "Arcane Bolt",
      description: "Launch a magical projectile that ignores armor",
      usesPerEncounter: 2,
      effect: { type: "damage_boost", targetType: "enemy", value: 3 },
    },
  },
  cleric: {
    might: 2, grace: 2, wit: 3, heart: 5,
    maxHitPoints: 5,
    equipment: [
      { id: "c1", name: "Mace", type: "weapon", equipped: true, damage: 1 },
      { id: "c2", name: "Holy Symbol", type: "accessory", equipped: true },
      { id: "c3", name: "Scale Mail", type: "armor", equipped: true, defense: 2 },
    ],
    specialAbility: {
      name: "Divine Heal",
      description: "Restore 2 HP to yourself or an ally",
      usesPerEncounter: 2,
      effect: { type: "heal", targetType: "ally", value: 2 },
    },
  },
  ranger: {
    might: 3, grace: 4, wit: 3, heart: 2,
    maxHitPoints: 5,
    equipment: [
      { id: "rn1", name: "Longbow", type: "weapon", equipped: true, damage: 2 },
      { id: "rn2", name: "Short Sword", type: "weapon", equipped: false, damage: 1 },
      { id: "rn3", name: "Leather Armor", type: "armor", equipped: true, defense: 1 },
    ],
    specialAbility: {
      name: "Hunter's Mark",
      description: "Mark a target, gaining +2 dice on all attacks against them",
      usesPerEncounter: 1,
      effect: { type: "buff", targetType: "self", value: 2, duration: 3 },
    },
  },
  paladin: {
    might: 4, grace: 2, wit: 2, heart: 4,
    maxHitPoints: 6,
    equipment: [
      { id: "p1", name: "Blessed Sword", type: "weapon", equipped: true, damage: 2 },
      { id: "p2", name: "Tower Shield", type: "armor", equipped: true, defense: 2 },
      { id: "p3", name: "Plate Armor", type: "armor", equipped: true, defense: 3 },
    ],
    specialAbility: {
      name: "Smite Evil",
      description: "Channel divine energy for +3 damage against undead or demons",
      usesPerEncounter: 1,
      effect: { type: "damage_boost", targetType: "enemy", value: 3 },
    },
  },
  necromancer: {
    might: 1, grace: 2, wit: 5, heart: 4,
    maxHitPoints: 4,
    equipment: [
      { id: "n1", name: "Bone Staff", type: "weapon", equipped: true, damage: 1 },
      { id: "n2", name: "Grimoire", type: "accessory", equipped: true },
      { id: "n3", name: "Dark Robes", type: "armor", equipped: true, defense: 0 },
    ],
    specialAbility: {
      name: "Raise Dead",
      description: "Animate a defeated enemy to fight for you (2 HP, attacks for 1 damage)",
      usesPerEncounter: 1,
      effect: { type: "custom", targetType: "enemy", value: 0 },
    },
  },
};

/**
 * Transform database row to frontend-friendly format
 */
function rowToCharacter(row: CharacterRow): CharacterWithAttributes {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    class: row.class,
    attributes: {
      might: row.might,
      grace: row.grace,
      wit: row.wit,
      heart: row.heart,
    },
    hitPoints: {
      current: row.hit_points,
      max: row.max_hit_points,
    },
    experience: row.experience,
    level: row.level,
    equipment: row.equipment as Equipment[],
    specialAbility: row.special_ability as SpecialAbility,
    lastPlayedAt: row.last_played_at ? new Date(row.last_played_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Character Service - CRUD operations for characters
 */
export const characterService = {
  /**
   * Get all characters for the current user
   */
  async list(): Promise<CharacterWithAttributes[]> {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Not authenticated");
    }

    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("user_id", user.id)
      .order("last_played_at", { ascending: false, nullsFirst: false });

    if (error) {
      console.error("Failed to fetch characters:", error);
      throw new Error("Failed to fetch characters");
    }

    return (data || []).map(rowToCharacter);
  },

  /**
   * Get a single character by ID
   */
  async get(id: string): Promise<CharacterWithAttributes | null> {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Not authenticated");
    }

    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      console.error("Failed to fetch character:", error);
      throw new Error("Failed to fetch character");
    }

    return rowToCharacter(data);
  },

  /**
   * Create a new character
   */
  async create(name: string, characterClass: CharacterClass): Promise<CharacterWithAttributes> {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Validate name
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      throw new Error("Character name must be 2-50 characters");
    }

    // Get class template
    const template = CLASS_TEMPLATES[characterClass];
    if (!template) {
      throw new Error("Invalid character class");
    }

    const insert: CharacterInsert = {
      user_id: user.id,
      name: trimmedName,
      class: characterClass,
      might: template.might,
      grace: template.grace,
      wit: template.wit,
      heart: template.heart,
      hit_points: template.maxHitPoints,
      max_hit_points: template.maxHitPoints,
      equipment: template.equipment,
      special_ability: template.specialAbility,
    };

    const { data, error } = await supabase
      .from("characters")
      // @ts-ignore - Supabase DB types issue
      .insert(insert)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("You already have a character with this name");
      }
      if (error.message?.includes("Character limit")) {
        throw new Error("Maximum 10 characters allowed");
      }
      console.error("Failed to create character:", error);
      throw new Error("Failed to create character");
    }

    return rowToCharacter(data);
  },

  /**
   * Update a character
   */
  async update(id: string, updates: {
    name?: string;
    hitPoints?: number;
    equipment?: Equipment[];
  }): Promise<CharacterWithAttributes> {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Not authenticated");
    }

    const updateData: CharacterUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) {
      const trimmedName = updates.name.trim();
      if (trimmedName.length < 2 || trimmedName.length > 50) {
        throw new Error("Character name must be 2-50 characters");
      }
      updateData.name = trimmedName;
    }

    if (updates.hitPoints !== undefined) {
      updateData.hit_points = updates.hitPoints;
    }

    if (updates.equipment !== undefined) {
      updateData.equipment = updates.equipment;
    }

    const { data, error } = await supabase
      .from("characters")
      // @ts-ignore - Supabase DB types issue
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update character:", error);
      throw new Error("Failed to update character");
    }

    return rowToCharacter(data);
  },

  /**
   * Delete a character
   */
  async delete(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Not authenticated");
    }

    const { error } = await supabase
      .from("characters")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to delete character:", error);
      throw new Error("Failed to delete character");
    }
  },

  /**
   * Update last played timestamp
   */
  async updateLastPlayed(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Not authenticated");
    }

    const { error } = await supabase
      .from("characters")
      // @ts-ignore - Supabase DB types issue
      .update({
        last_played_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to update last played:", error);
    }
  },

  /**
   * Get class template info
   */
  getClassTemplate(characterClass: CharacterClass) {
    return CLASS_TEMPLATES[characterClass];
  },

  /**
   * Get all class templates
   */
  getAllClassTemplates() {
    return CLASS_TEMPLATES;
  },
};

export type { CharacterWithAttributes };
