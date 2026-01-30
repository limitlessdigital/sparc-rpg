import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AttributeNames,
  AttributesSchema,
  CharacterClasses,
  CharacterSchema,
  getAttributeModifier,
  calculateBaseHitPoints,
  calculateArmorClass,
  getExperienceForLevel,
  createCharacter,
  type Character,
  type Attributes,
  type CharacterClass,
} from '../character';

describe('AttributeNames', () => {
  it('contains all six D&D-style attributes', () => {
    expect(AttributeNames).toContain('strength');
    expect(AttributeNames).toContain('dexterity');
    expect(AttributeNames).toContain('constitution');
    expect(AttributeNames).toContain('intelligence');
    expect(AttributeNames).toContain('wisdom');
    expect(AttributeNames).toContain('charisma');
    expect(AttributeNames).toHaveLength(6);
  });
});

describe('CharacterClasses', () => {
  it('contains expected character classes', () => {
    expect(CharacterClasses).toContain('warrior');
    expect(CharacterClasses).toContain('mage');
    expect(CharacterClasses).toContain('rogue');
    expect(CharacterClasses).toContain('cleric');
    expect(CharacterClasses).toContain('ranger');
    expect(CharacterClasses).toContain('bard');
    expect(CharacterClasses).toHaveLength(6);
  });
});

describe('AttributesSchema', () => {
  it('validates correct attributes', () => {
    const validAttributes = {
      strength: 10,
      dexterity: 14,
      constitution: 12,
      intelligence: 8,
      wisdom: 15,
      charisma: 13,
    };
    
    expect(AttributesSchema.safeParse(validAttributes).success).toBe(true);
  });

  it('accepts minimum values (1)', () => {
    const minAttributes = {
      strength: 1,
      dexterity: 1,
      constitution: 1,
      intelligence: 1,
      wisdom: 1,
      charisma: 1,
    };
    
    expect(AttributesSchema.safeParse(minAttributes).success).toBe(true);
  });

  it('accepts maximum values (30)', () => {
    const maxAttributes = {
      strength: 30,
      dexterity: 30,
      constitution: 30,
      intelligence: 30,
      wisdom: 30,
      charisma: 30,
    };
    
    expect(AttributesSchema.safeParse(maxAttributes).success).toBe(true);
  });

  it('rejects values below minimum', () => {
    const invalidAttributes = {
      strength: 0,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    };
    
    expect(AttributesSchema.safeParse(invalidAttributes).success).toBe(false);
  });

  it('rejects values above maximum', () => {
    const invalidAttributes = {
      strength: 31,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    };
    
    expect(AttributesSchema.safeParse(invalidAttributes).success).toBe(false);
  });

  it('rejects missing attributes', () => {
    const incompleteAttributes = {
      strength: 10,
      dexterity: 10,
    };
    
    expect(AttributesSchema.safeParse(incompleteAttributes).success).toBe(false);
  });
});

describe('CharacterSchema', () => {
  const validCharacter: Character = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Hero',
    class: 'warrior',
    level: 5,
    experience: 6500,
    attributes: {
      strength: 16,
      dexterity: 12,
      constitution: 14,
      intelligence: 10,
      wisdom: 8,
      charisma: 10,
    },
    hitPoints: {
      current: 45,
      max: 50,
    },
    armorClass: 16,
  };

  it('validates a complete character', () => {
    expect(CharacterSchema.safeParse(validCharacter).success).toBe(true);
  });

  it('rejects empty name', () => {
    const invalid = { ...validCharacter, name: '' };
    expect(CharacterSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects name over 50 characters', () => {
    const invalid = { ...validCharacter, name: 'A'.repeat(51) };
    expect(CharacterSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects invalid class', () => {
    const invalid = { ...validCharacter, class: 'druid' };
    expect(CharacterSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects level below 1', () => {
    const invalid = { ...validCharacter, level: 0 };
    expect(CharacterSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects level above 20', () => {
    const invalid = { ...validCharacter, level: 21 };
    expect(CharacterSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects negative experience', () => {
    const invalid = { ...validCharacter, experience: -100 };
    expect(CharacterSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects negative current HP', () => {
    const invalid = { ...validCharacter, hitPoints: { current: -5, max: 50 } };
    expect(CharacterSchema.safeParse(invalid).success).toBe(false);
  });

  it('allows 0 current HP (unconscious)', () => {
    const valid = { ...validCharacter, hitPoints: { current: 0, max: 50 } };
    expect(CharacterSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects max HP below 1', () => {
    const invalid = { ...validCharacter, hitPoints: { current: 0, max: 0 } };
    expect(CharacterSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects negative armor class', () => {
    const invalid = { ...validCharacter, armorClass: -1 };
    expect(CharacterSchema.safeParse(invalid).success).toBe(false);
  });
});

describe('getAttributeModifier', () => {
  it('calculates modifier for score of 10 (average)', () => {
    expect(getAttributeModifier(10)).toBe(0);
    expect(getAttributeModifier(11)).toBe(0);
  });

  it('calculates negative modifiers correctly', () => {
    expect(getAttributeModifier(1)).toBe(-5);
    expect(getAttributeModifier(2)).toBe(-4);
    expect(getAttributeModifier(3)).toBe(-4);
    expect(getAttributeModifier(8)).toBe(-1);
    expect(getAttributeModifier(9)).toBe(-1);
  });

  it('calculates positive modifiers correctly', () => {
    expect(getAttributeModifier(12)).toBe(1);
    expect(getAttributeModifier(13)).toBe(1);
    expect(getAttributeModifier(14)).toBe(2);
    expect(getAttributeModifier(15)).toBe(2);
    expect(getAttributeModifier(16)).toBe(3);
    expect(getAttributeModifier(18)).toBe(4);
    expect(getAttributeModifier(20)).toBe(5);
  });

  it('handles maximum score of 30', () => {
    expect(getAttributeModifier(30)).toBe(10);
  });

  it('follows the formula: floor((score - 10) / 2)', () => {
    for (let score = 1; score <= 30; score++) {
      const expected = Math.floor((score - 10) / 2);
      expect(getAttributeModifier(score)).toBe(expected);
    }
  });
});

describe('calculateBaseHitPoints', () => {
  it('calculates warrior HP correctly (d10 hit die)', () => {
    // Level 1 warrior with 14 CON (+2 modifier)
    // 10 (max d10) + 2 (CON mod) = 12
    expect(calculateBaseHitPoints('warrior', 14, 1)).toBe(12);
  });

  it('calculates mage HP correctly (d6 hit die)', () => {
    // Level 1 mage with 10 CON (+0 modifier)
    // 6 (max d6) + 0 = 6
    expect(calculateBaseHitPoints('mage', 10, 1)).toBe(6);
  });

  it('calculates rogue HP correctly (d8 hit die)', () => {
    // Level 1 rogue with 12 CON (+1 modifier)
    // 8 (max d8) + 1 = 9
    expect(calculateBaseHitPoints('rogue', 12, 1)).toBe(9);
  });

  it('scales HP with level', () => {
    // Level 5 warrior with 16 CON (+3 modifier)
    // First level: 10 + 3 = 13
    // Levels 2-5: 4 levels * (5 + 1 + 3) = 4 * 9 = 36
    // Total: 13 + 36 = 49
    expect(calculateBaseHitPoints('warrior', 16, 5)).toBe(49);
  });

  it('handles low constitution', () => {
    // Level 1 mage with 6 CON (-2 modifier)
    // 6 (max d6) + (-2) = 4
    expect(calculateBaseHitPoints('mage', 6, 1)).toBe(4);
  });

  it('never returns less than 1 HP', () => {
    // Even with very low CON, minimum is 1
    expect(calculateBaseHitPoints('mage', 1, 1)).toBeGreaterThanOrEqual(1);
  });

  it('handles all character classes', () => {
    const classes: CharacterClass[] = ['warrior', 'mage', 'rogue', 'cleric', 'ranger', 'bard'];
    
    for (const charClass of classes) {
      const hp = calculateBaseHitPoints(charClass, 10, 1);
      expect(hp).toBeGreaterThanOrEqual(1);
    }
  });

  it('cleric has d8 hit die', () => {
    // Level 1 cleric with 10 CON
    expect(calculateBaseHitPoints('cleric', 10, 1)).toBe(8);
  });

  it('ranger has d10 hit die', () => {
    // Level 1 ranger with 10 CON
    expect(calculateBaseHitPoints('ranger', 10, 1)).toBe(10);
  });

  it('bard has d8 hit die', () => {
    // Level 1 bard with 10 CON
    expect(calculateBaseHitPoints('bard', 10, 1)).toBe(8);
  });
});

describe('calculateArmorClass', () => {
  it('calculates base AC of 10 for no modifiers', () => {
    // DEX 10 = +0 modifier
    expect(calculateArmorClass(10, 0, 0)).toBe(10);
  });

  it('adds dexterity modifier', () => {
    // DEX 14 = +2 modifier
    expect(calculateArmorClass(14, 0, 0)).toBe(12);
  });

  it('adds armor bonus', () => {
    // DEX 10, +3 armor
    expect(calculateArmorClass(10, 3, 0)).toBe(13);
  });

  it('adds shield bonus', () => {
    // DEX 10, no armor, +2 shield
    expect(calculateArmorClass(10, 0, 2)).toBe(12);
  });

  it('combines all bonuses', () => {
    // DEX 16 (+3), armor +5, shield +2
    expect(calculateArmorClass(16, 5, 2)).toBe(20);
  });

  it('handles negative dexterity modifiers', () => {
    // DEX 8 = -1 modifier
    expect(calculateArmorClass(8, 0, 0)).toBe(9);
  });

  it('defaults armor and shield bonus to 0', () => {
    // Just dexterity
    expect(calculateArmorClass(14)).toBe(12);
  });
});

describe('getExperienceForLevel', () => {
  it('returns 0 XP for level 1', () => {
    expect(getExperienceForLevel(1)).toBe(0);
  });

  it('returns correct XP for early levels', () => {
    expect(getExperienceForLevel(2)).toBe(300);
    expect(getExperienceForLevel(3)).toBe(900);
    expect(getExperienceForLevel(4)).toBe(2700);
    expect(getExperienceForLevel(5)).toBe(6500);
  });

  it('returns correct XP for mid levels', () => {
    expect(getExperienceForLevel(10)).toBe(64000);
    expect(getExperienceForLevel(11)).toBe(85000);
  });

  it('returns correct XP for high levels', () => {
    expect(getExperienceForLevel(15)).toBe(165000);
    expect(getExperienceForLevel(20)).toBe(355000);
  });

  it('returns 0 for invalid levels', () => {
    expect(getExperienceForLevel(0)).toBe(0);
    expect(getExperienceForLevel(-1)).toBe(0);
    expect(getExperienceForLevel(21)).toBe(0);
  });

  it('XP requirements increase with level', () => {
    for (let level = 1; level < 20; level++) {
      const current = getExperienceForLevel(level);
      const next = getExperienceForLevel(level + 1);
      expect(next).toBeGreaterThan(current);
    }
  });
});

describe('createCharacter', () => {
  const defaultAttributes: Attributes = {
    strength: 14,
    dexterity: 12,
    constitution: 16,
    intelligence: 10,
    wisdom: 10,
    charisma: 8,
  };

  beforeEach(() => {
    // Mock crypto.randomUUID for consistent testing
    vi.stubGlobal('crypto', {
      randomUUID: () => 'test-uuid-123',
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates a character with correct name', () => {
    const char = createCharacter('Hero', 'warrior', defaultAttributes);
    expect(char.name).toBe('Hero');
  });

  it('creates a character with correct class', () => {
    const char = createCharacter('Merlin', 'mage', defaultAttributes);
    expect(char.class).toBe('mage');
  });

  it('starts at level 1', () => {
    const char = createCharacter('Hero', 'warrior', defaultAttributes);
    expect(char.level).toBe(1);
  });

  it('starts with 0 experience', () => {
    const char = createCharacter('Hero', 'warrior', defaultAttributes);
    expect(char.experience).toBe(0);
  });

  it('generates a unique ID', () => {
    const char = createCharacter('Hero', 'warrior', defaultAttributes);
    expect(char.id).toBe('test-uuid-123');
  });

  it('copies attributes correctly', () => {
    const char = createCharacter('Hero', 'warrior', defaultAttributes);
    expect(char.attributes).toEqual(defaultAttributes);
  });

  it('calculates max HP based on class and constitution', () => {
    const char = createCharacter('Hero', 'warrior', defaultAttributes);
    // Warrior d10 + CON 16 (+3) = 13
    expect(char.hitPoints.max).toBe(13);
    expect(char.hitPoints.current).toBe(13);
  });

  it('sets current HP equal to max HP', () => {
    const char = createCharacter('Hero', 'mage', defaultAttributes);
    expect(char.hitPoints.current).toBe(char.hitPoints.max);
  });

  it('calculates armor class based on dexterity', () => {
    const char = createCharacter('Hero', 'rogue', defaultAttributes);
    // DEX 12 = +1 modifier, base AC 10 + 1 = 11
    expect(char.armorClass).toBe(11);
  });

  it('creates valid character according to schema', () => {
    const char = createCharacter('Hero', 'warrior', defaultAttributes);
    expect(CharacterSchema.safeParse(char).success).toBe(true);
  });

  it('works for all character classes', () => {
    const classes: CharacterClass[] = ['warrior', 'mage', 'rogue', 'cleric', 'ranger', 'bard'];
    
    for (const charClass of classes) {
      const char = createCharacter('Test', charClass, defaultAttributes);
      expect(CharacterSchema.safeParse(char).success).toBe(true);
      expect(char.class).toBe(charClass);
    }
  });
});
