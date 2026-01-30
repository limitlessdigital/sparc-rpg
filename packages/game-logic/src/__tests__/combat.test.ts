import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  makeAttackRoll,
  rollDamage,
  getAttackBonus,
  attack,
  applyDamage,
  heal,
  isUnconscious,
  type AttackModifier,
  type AttackResult,
} from '../combat';
import { createCharacter, type Character, type Attributes } from '../character';

// Helper to create test characters
function createTestCharacter(overrides: Partial<Character> = {}): Character {
  const baseAttributes: Attributes = {
    strength: 16, // +3 modifier
    dexterity: 14, // +2 modifier
    constitution: 14, // +2 modifier
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  };

  const base = createCharacter('Test Hero', 'warrior', baseAttributes);
  return {
    ...base,
    ...overrides,
    id: overrides.id ?? 'test-id-123',
  };
}

describe('makeAttackRoll', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a roll result with hit determination', () => {
    vi.mocked(Math.random).mockReturnValue(0.5); // ~11 on d20
    
    const result = makeAttackRoll(5, 15);
    
    expect(result.roll).toBeDefined();
    expect(result.roll.notation).toBe('1d20');
    expect(typeof result.hit).toBe('boolean');
    expect(typeof result.critical).toBe('boolean');
  });

  it('hits when total meets AC', () => {
    vi.mocked(Math.random).mockReturnValue(0.45); // 10 on d20
    
    const result = makeAttackRoll(5, 15); // 10 + 5 = 15 vs AC 15
    
    expect(result.roll.total).toBe(15);
    expect(result.hit).toBe(true);
  });

  it('hits when total exceeds AC', () => {
    vi.mocked(Math.random).mockReturnValue(0.7); // ~15 on d20
    
    const result = makeAttackRoll(5, 15); // 15 + 5 = 20 vs AC 15
    
    expect(result.roll.total).toBeGreaterThan(15);
    expect(result.hit).toBe(true);
  });

  it('misses when total is below AC', () => {
    vi.mocked(Math.random).mockReturnValue(0.2); // ~5 on d20
    
    const result = makeAttackRoll(0, 15); // 5 + 0 = 5 vs AC 15
    
    expect(result.roll.total).toBeLessThan(15);
    expect(result.hit).toBe(false);
  });

  it('critical hit on natural 20 always hits', () => {
    vi.mocked(Math.random).mockReturnValue(0.9999); // 20 on d20
    
    const result = makeAttackRoll(0, 99); // Even absurdly high AC
    
    expect(result.roll.criticalSuccess).toBe(true);
    expect(result.critical).toBe(true);
    expect(result.hit).toBe(true);
  });

  it('critical failure on natural 1 always misses', () => {
    vi.mocked(Math.random).mockReturnValue(0); // 1 on d20
    
    const result = makeAttackRoll(100, 1); // Even with huge bonus and low AC
    
    expect(result.roll.criticalFailure).toBe(true);
    expect(result.hit).toBe(false);
  });

  it('applies advantage correctly', () => {
    // First roll low, second roll high
    vi.mocked(Math.random)
      .mockReturnValueOnce(0.1)  // ~3 on d20
      .mockReturnValueOnce(0.8); // ~17 on d20
    
    const result = makeAttackRoll(0, 10, 'advantage');
    
    // Should use the higher roll
    expect(result.roll.rolls[0]).toBeGreaterThan(14);
  });

  it('applies disadvantage correctly', () => {
    // First roll high, second roll low
    vi.mocked(Math.random)
      .mockReturnValueOnce(0.8)  // ~17 on d20
      .mockReturnValueOnce(0.1); // ~3 on d20
    
    const result = makeAttackRoll(0, 10, 'disadvantage');
    
    // Should use the lower roll
    expect(result.roll.rolls[0]).toBeLessThan(6);
  });

  it('adds attack bonus to total', () => {
    vi.mocked(Math.random).mockReturnValue(0.45); // 10 on d20
    
    const result = makeAttackRoll(7, 15);
    
    expect(result.roll.total).toBe(17); // 10 + 7
  });
});

describe('rollDamage', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rolls damage dice correctly', () => {
    vi.mocked(Math.random).mockReturnValue(0.5);
    
    const result = rollDamage('1d8+3');
    
    expect(result.notation).toBe('1d8+3');
    expect(result.rolls).toHaveLength(1);
    expect(result.total).toBeGreaterThan(0);
  });

  it('doubles dice on critical hit (not modifier)', () => {
    // Both dice rolls return same value for predictability
    vi.mocked(Math.random).mockReturnValue(0.5); // ~5 on d8
    
    const normal = rollDamage('1d8+3', false);
    
    // Reset for critical
    vi.mocked(Math.random).mockReturnValue(0.5);
    const critical = rollDamage('1d8+3', true);
    
    // Critical should have twice the dice
    expect(critical.rolls).toHaveLength(2);
    // Modifier should be doubled (from two rolls) minus one modifier
    // The implementation doubles the roll, so we just check it's higher
    expect(critical.total).toBeGreaterThan(normal.total);
  });

  it('handles multi-die damage', () => {
    vi.mocked(Math.random).mockReturnValue(0.5);
    
    const result = rollDamage('2d6+2');
    
    expect(result.rolls).toHaveLength(2);
    expect(result.modifier).toBe(2);
  });

  it('critical with multi-die damage doubles all dice', () => {
    vi.mocked(Math.random).mockReturnValue(0.5);
    
    const critical = rollDamage('2d6+2', true);
    
    // 2d6 becomes 4d6 (2 from first roll + 2 from second roll)
    expect(critical.rolls).toHaveLength(4);
  });
});

describe('getAttackBonus', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', {
      randomUUID: () => 'test-uuid-123',
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calculates attack bonus with strength', () => {
    const char = createTestCharacter({ level: 1 });
    // Level 1: proficiency +2, STR 16 (+3) = +5
    expect(getAttackBonus(char, true)).toBe(5);
  });

  it('calculates attack bonus with dexterity', () => {
    const char = createTestCharacter({ level: 1 });
    // Level 1: proficiency +2, DEX 14 (+2) = +4
    expect(getAttackBonus(char, false)).toBe(4);
  });

  it('proficiency increases with level', () => {
    // Level 1-4: +2, Level 5-8: +3, etc.
    const level1 = createTestCharacter({ level: 1 });
    const level5 = createTestCharacter({ level: 5 });
    const level9 = createTestCharacter({ level: 9 });
    
    expect(getAttackBonus(level1, true)).toBeLessThan(getAttackBonus(level5, true));
    expect(getAttackBonus(level5, true)).toBeLessThan(getAttackBonus(level9, true));
  });

  it('level 1 has +2 proficiency bonus', () => {
    const char = createTestCharacter({
      level: 1,
      attributes: {
        strength: 10, // +0 modifier
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
    });
    
    expect(getAttackBonus(char, true)).toBe(2); // Just proficiency
  });

  it('level 5 has +3 proficiency bonus', () => {
    const char = createTestCharacter({
      level: 5,
      attributes: {
        strength: 10, // +0 modifier
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
    });
    
    expect(getAttackBonus(char, true)).toBe(3);
  });
});

describe('attack', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random');
    vi.stubGlobal('crypto', {
      randomUUID: () => 'test-uuid-123',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns attack result with hit and damage', () => {
    vi.mocked(Math.random).mockReturnValue(0.9); // High roll = hit
    
    const attacker = createTestCharacter({ name: 'Attacker' });
    const defender = createTestCharacter({ name: 'Defender', armorClass: 10 });
    
    const result = attack(attacker, defender, '1d8+3');
    
    expect(result.attackRoll).toBeDefined();
    expect(result.hit).toBe(true);
    expect(result.damage).toBeDefined();
  });

  it('no damage on miss', () => {
    vi.mocked(Math.random).mockReturnValue(0.1); // Low roll = miss
    
    const attacker = createTestCharacter({ name: 'Attacker' });
    const defender = createTestCharacter({ name: 'Defender', armorClass: 20 });
    
    const result = attack(attacker, defender, '1d8+3');
    
    expect(result.hit).toBe(false);
    expect(result.damage).toBeUndefined();
  });

  it('marks critical hit with extra damage', () => {
    vi.mocked(Math.random).mockReturnValue(0.9999); // Natural 20
    
    const attacker = createTestCharacter({ name: 'Attacker' });
    const defender = createTestCharacter({ name: 'Defender' });
    
    const result = attack(attacker, defender, '1d8+3');
    
    expect(result.hit).toBe(true);
    expect(result.criticalHit).toBe(true);
    expect(result.damage).toBeDefined();
  });

  it('uses strength for melee attacks by default', () => {
    vi.mocked(Math.random).mockReturnValue(0.5);
    
    const attacker = createTestCharacter({
      attributes: {
        strength: 18, // +4
        dexterity: 10, // +0
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
    });
    const defender = createTestCharacter({ armorClass: 10 });
    
    // With STR 18, attack bonus should be higher
    const result = attack(attacker, defender, '1d8');
    
    // Attack bonus = proficiency (+2) + STR (+4) = +6
    expect(result.attackRoll.total).toBeGreaterThan(10);
  });

  it('uses dexterity when specified', () => {
    vi.mocked(Math.random).mockReturnValue(0.5);
    
    const attacker = createTestCharacter({
      attributes: {
        strength: 10, // +0
        dexterity: 18, // +4
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
    });
    const defender = createTestCharacter({ armorClass: 10 });
    
    const result = attack(attacker, defender, '1d8', 'normal', false);
    
    // Attack bonus = proficiency (+2) + DEX (+4) = +6
    expect(result.attackRoll.total).toBeGreaterThan(10);
  });

  it('supports advantage modifier', () => {
    // Make first roll low, second high
    vi.mocked(Math.random)
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.9);
    
    const attacker = createTestCharacter();
    const defender = createTestCharacter({ armorClass: 15 });
    
    const result = attack(attacker, defender, '1d8', 'advantage');
    
    // Should have used the higher roll
    expect(result.hit).toBe(true);
  });

  it('supports disadvantage modifier', () => {
    // Make first roll high, second low
    vi.mocked(Math.random)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.1);
    
    const attacker = createTestCharacter();
    const defender = createTestCharacter({ armorClass: 15 });
    
    const result = attack(attacker, defender, '1d8', 'disadvantage');
    
    // Should have used the lower roll
    expect(result.hit).toBe(false);
  });
});

describe('applyDamage', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', {
      randomUUID: () => 'test-uuid-123',
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reduces current HP by damage amount', () => {
    const char = createTestCharacter({
      hitPoints: { current: 50, max: 50 },
    });
    
    const damaged = applyDamage(char, 15);
    
    expect(damaged.hitPoints.current).toBe(35);
  });

  it('does not reduce HP below 0', () => {
    const char = createTestCharacter({
      hitPoints: { current: 10, max: 50 },
    });
    
    const damaged = applyDamage(char, 100);
    
    expect(damaged.hitPoints.current).toBe(0);
  });

  it('does not modify max HP', () => {
    const char = createTestCharacter({
      hitPoints: { current: 50, max: 50 },
    });
    
    const damaged = applyDamage(char, 25);
    
    expect(damaged.hitPoints.max).toBe(50);
  });

  it('returns a new character object (immutable)', () => {
    const char = createTestCharacter({
      hitPoints: { current: 50, max: 50 },
    });
    
    const damaged = applyDamage(char, 10);
    
    expect(damaged).not.toBe(char);
    expect(char.hitPoints.current).toBe(50); // Original unchanged
  });

  it('handles 0 damage', () => {
    const char = createTestCharacter({
      hitPoints: { current: 50, max: 50 },
    });
    
    const result = applyDamage(char, 0);
    
    expect(result.hitPoints.current).toBe(50);
  });
});

describe('heal', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', {
      randomUUID: () => 'test-uuid-123',
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('increases current HP by heal amount', () => {
    const char = createTestCharacter({
      hitPoints: { current: 30, max: 50 },
    });
    
    const healed = heal(char, 10);
    
    expect(healed.hitPoints.current).toBe(40);
  });

  it('does not exceed max HP', () => {
    const char = createTestCharacter({
      hitPoints: { current: 45, max: 50 },
    });
    
    const healed = heal(char, 100);
    
    expect(healed.hitPoints.current).toBe(50);
  });

  it('does not modify max HP', () => {
    const char = createTestCharacter({
      hitPoints: { current: 30, max: 50 },
    });
    
    const healed = heal(char, 15);
    
    expect(healed.hitPoints.max).toBe(50);
  });

  it('returns a new character object (immutable)', () => {
    const char = createTestCharacter({
      hitPoints: { current: 30, max: 50 },
    });
    
    const healed = heal(char, 10);
    
    expect(healed).not.toBe(char);
    expect(char.hitPoints.current).toBe(30); // Original unchanged
  });

  it('can heal from 0 HP (unconscious)', () => {
    const char = createTestCharacter({
      hitPoints: { current: 0, max: 50 },
    });
    
    const healed = heal(char, 5);
    
    expect(healed.hitPoints.current).toBe(5);
  });

  it('handles 0 healing', () => {
    const char = createTestCharacter({
      hitPoints: { current: 30, max: 50 },
    });
    
    const result = heal(char, 0);
    
    expect(result.hitPoints.current).toBe(30);
  });
});

describe('isUnconscious', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', {
      randomUUID: () => 'test-uuid-123',
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns true when HP is 0', () => {
    const char = createTestCharacter({
      hitPoints: { current: 0, max: 50 },
    });
    
    expect(isUnconscious(char)).toBe(true);
  });

  it('returns false when HP is above 0', () => {
    const char = createTestCharacter({
      hitPoints: { current: 1, max: 50 },
    });
    
    expect(isUnconscious(char)).toBe(false);
  });

  it('returns false when HP is full', () => {
    const char = createTestCharacter({
      hitPoints: { current: 50, max: 50 },
    });
    
    expect(isUnconscious(char)).toBe(false);
  });

  it('returns true for negative HP (edge case)', () => {
    // While we prevent negative HP, schema allows 0
    // If somehow negative HP existed, should still be unconscious
    const char = createTestCharacter({
      hitPoints: { current: -5, max: 50 },
    }) as Character;
    
    expect(isUnconscious(char)).toBe(true);
  });
});

describe('Combat integration', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random');
    vi.stubGlobal('crypto', {
      randomUUID: () => 'test-uuid-123',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('full combat round: attack, damage, apply', () => {
    vi.mocked(Math.random).mockReturnValue(0.9); // Ensure hit
    
    const attacker = createTestCharacter({ name: 'Fighter' });
    const defender = createTestCharacter({
      name: 'Goblin',
      armorClass: 12,
      hitPoints: { current: 20, max: 20 },
    });
    
    const attackResult = attack(attacker, defender, '1d8+3');
    
    expect(attackResult.hit).toBe(true);
    expect(attackResult.damage).toBeDefined();
    
    if (attackResult.damage) {
      const damagedDefender = applyDamage(defender, attackResult.damage.total);
      expect(damagedDefender.hitPoints.current).toBeLessThan(20);
    }
  });

  it('combat until unconscious', () => {
    vi.mocked(Math.random).mockReturnValue(0.9);
    
    let defender = createTestCharacter({
      name: 'Target',
      hitPoints: { current: 15, max: 15 },
    });
    const attacker = createTestCharacter({ name: 'Attacker' });
    
    // Keep attacking until unconscious
    while (!isUnconscious(defender)) {
      const result = attack(attacker, defender, '1d8+3');
      if (result.hit && result.damage) {
        defender = applyDamage(defender, result.damage.total);
      }
    }
    
    expect(isUnconscious(defender)).toBe(true);
    expect(defender.hitPoints.current).toBe(0);
  });

  it('heal after combat', () => {
    vi.mocked(Math.random).mockReturnValue(0.9);
    
    let char = createTestCharacter({
      hitPoints: { current: 50, max: 50 },
    });
    
    // Take damage
    char = applyDamage(char, 30);
    expect(char.hitPoints.current).toBe(20);
    
    // Heal
    char = heal(char, 15);
    expect(char.hitPoints.current).toBe(35);
    
    // Full heal
    char = heal(char, 100);
    expect(char.hitPoints.current).toBe(50);
  });
});
