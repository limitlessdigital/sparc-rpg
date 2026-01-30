// SPARC RPG Character System
import { z } from "zod";

// Core attributes
export const AttributeNames = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
] as const;

export type AttributeName = (typeof AttributeNames)[number];

export const AttributesSchema = z.object({
  strength: z.number().min(1).max(30),
  dexterity: z.number().min(1).max(30),
  constitution: z.number().min(1).max(30),
  intelligence: z.number().min(1).max(30),
  wisdom: z.number().min(1).max(30),
  charisma: z.number().min(1).max(30),
});

export type Attributes = z.infer<typeof AttributesSchema>;

// Character classes
export const CharacterClasses = [
  "warrior",
  "mage",
  "rogue",
  "cleric",
  "ranger",
  "bard",
] as const;

export type CharacterClass = (typeof CharacterClasses)[number];

// Character schema
export const CharacterSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  class: z.enum(CharacterClasses),
  level: z.number().min(1).max(20),
  experience: z.number().min(0),
  attributes: AttributesSchema,
  hitPoints: z.object({
    current: z.number().min(0),
    max: z.number().min(1),
  }),
  armorClass: z.number().min(0),
});

export type Character = z.infer<typeof CharacterSchema>;

/**
 * Calculate the modifier for an attribute score
 * @param score - The attribute score (1-30)
 */
export function getAttributeModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Calculate base hit points for a class and constitution
 */
export function calculateBaseHitPoints(
  characterClass: CharacterClass,
  constitution: number,
  level: number
): number {
  const hitDice: Record<CharacterClass, number> = {
    warrior: 10,
    cleric: 8,
    ranger: 10,
    rogue: 8,
    mage: 6,
    bard: 8,
  };

  const baseDie = hitDice[characterClass];
  const conModifier = getAttributeModifier(constitution);

  // First level gets max hit die, subsequent levels average
  const firstLevelHP = baseDie + conModifier;
  const additionalHP = (level - 1) * (Math.floor(baseDie / 2) + 1 + conModifier);

  return Math.max(firstLevelHP + additionalHP, 1);
}

/**
 * Calculate armor class based on dexterity and equipment
 */
export function calculateArmorClass(
  dexterity: number,
  armorBonus: number = 0,
  shieldBonus: number = 0
): number {
  const dexModifier = getAttributeModifier(dexterity);
  return 10 + dexModifier + armorBonus + shieldBonus;
}

/**
 * Experience points required for each level
 */
export function getExperienceForLevel(level: number): number {
  const xpTable: Record<number, number> = {
    1: 0,
    2: 300,
    3: 900,
    4: 2700,
    5: 6500,
    6: 14000,
    7: 23000,
    8: 34000,
    9: 48000,
    10: 64000,
    11: 85000,
    12: 100000,
    13: 120000,
    14: 140000,
    15: 165000,
    16: 195000,
    17: 225000,
    18: 265000,
    19: 305000,
    20: 355000,
  };

  return xpTable[level] ?? 0;
}

/**
 * Create a new character with default values
 */
export function createCharacter(
  name: string,
  characterClass: CharacterClass,
  attributes: Attributes
): Character {
  const maxHP = calculateBaseHitPoints(
    characterClass,
    attributes.constitution,
    1
  );

  return {
    id: crypto.randomUUID(),
    name,
    class: characterClass,
    level: 1,
    experience: 0,
    attributes,
    hitPoints: {
      current: maxHP,
      max: maxHP,
    },
    armorClass: calculateArmorClass(attributes.dexterity),
  };
}
