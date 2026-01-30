import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseDiceNotation,
  rollDie,
  roll,
  rollWithAdvantage,
  rollWithDisadvantage,
  formatRoll,
  DiceNotationSchema,
  type DiceRoll,
} from '../dice';

describe('DiceNotationSchema', () => {
  it('validates correct dice notation', () => {
    expect(DiceNotationSchema.safeParse('1d20').success).toBe(true);
    expect(DiceNotationSchema.safeParse('2d6').success).toBe(true);
    expect(DiceNotationSchema.safeParse('4d8+3').success).toBe(true);
    expect(DiceNotationSchema.safeParse('1d12-2').success).toBe(true);
    expect(DiceNotationSchema.safeParse('10d10+10').success).toBe(true);
  });

  it('rejects invalid dice notation', () => {
    expect(DiceNotationSchema.safeParse('d20').success).toBe(false);
    expect(DiceNotationSchema.safeParse('2d').success).toBe(false);
    expect(DiceNotationSchema.safeParse('abc').success).toBe(false);
    expect(DiceNotationSchema.safeParse('').success).toBe(false);
    expect(DiceNotationSchema.safeParse('2d6++3').success).toBe(false);
  });
});

describe('parseDiceNotation', () => {
  it('parses simple dice notation', () => {
    expect(parseDiceNotation('1d20')).toEqual({
      count: 1,
      sides: 20,
      modifier: 0,
    });
    expect(parseDiceNotation('2d6')).toEqual({
      count: 2,
      sides: 6,
      modifier: 0,
    });
  });

  it('parses dice notation with positive modifier', () => {
    expect(parseDiceNotation('1d20+5')).toEqual({
      count: 1,
      sides: 20,
      modifier: 5,
    });
    expect(parseDiceNotation('4d8+3')).toEqual({
      count: 4,
      sides: 8,
      modifier: 3,
    });
  });

  it('parses dice notation with negative modifier', () => {
    expect(parseDiceNotation('1d20-2')).toEqual({
      count: 1,
      sides: 20,
      modifier: -2,
    });
    expect(parseDiceNotation('3d6-1')).toEqual({
      count: 3,
      sides: 6,
      modifier: -1,
    });
  });

  it('parses large numbers', () => {
    expect(parseDiceNotation('100d100+50')).toEqual({
      count: 100,
      sides: 100,
      modifier: 50,
    });
  });

  it('throws on invalid notation', () => {
    expect(() => parseDiceNotation('')).toThrow('Invalid dice notation');
    expect(() => parseDiceNotation('d20')).toThrow('Invalid dice notation');
    expect(() => parseDiceNotation('2d')).toThrow('Invalid dice notation');
    expect(() => parseDiceNotation('abc')).toThrow('Invalid dice notation');
    expect(() => parseDiceNotation('2d6++')).toThrow('Invalid dice notation');
  });
});

describe('rollDie', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns values within valid range for d20', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollDie(20);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(20);
    }
  });

  it('returns values within valid range for d6', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollDie(6);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
    }
  });

  it('returns 1 when random returns 0', () => {
    vi.mocked(Math.random).mockReturnValue(0);
    expect(rollDie(20)).toBe(1);
    expect(rollDie(6)).toBe(1);
  });

  it('returns max value when random approaches 1', () => {
    vi.mocked(Math.random).mockReturnValue(0.9999);
    expect(rollDie(20)).toBe(20);
    expect(rollDie(6)).toBe(6);
  });
});

describe('roll', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rolls dice and calculates total correctly', () => {
    // Mock to return middle-ish values
    vi.mocked(Math.random).mockReturnValue(0.5);
    
    const result = roll('2d6');
    expect(result.notation).toBe('2d6');
    expect(result.rolls).toHaveLength(2);
    expect(result.modifier).toBe(0);
    expect(result.total).toBe(result.rolls.reduce((a, b) => a + b, 0));
  });

  it('applies positive modifiers correctly', () => {
    vi.mocked(Math.random).mockReturnValue(0.5);
    
    const result = roll('1d20+5');
    expect(result.modifier).toBe(5);
    expect(result.total).toBe(result.rolls[0] + 5);
  });

  it('applies negative modifiers correctly', () => {
    vi.mocked(Math.random).mockReturnValue(0.5);
    
    const result = roll('1d20-3');
    expect(result.modifier).toBe(-3);
    expect(result.total).toBe(result.rolls[0] - 3);
  });

  it('detects critical success on natural 20', () => {
    vi.mocked(Math.random).mockReturnValue(0.9999); // Will give 20
    
    const result = roll('1d20');
    expect(result.rolls[0]).toBe(20);
    expect(result.criticalSuccess).toBe(true);
    expect(result.criticalFailure).toBeUndefined();
  });

  it('detects critical failure on natural 1', () => {
    vi.mocked(Math.random).mockReturnValue(0); // Will give 1
    
    const result = roll('1d20');
    expect(result.rolls[0]).toBe(1);
    expect(result.criticalFailure).toBe(true);
    expect(result.criticalSuccess).toBeUndefined();
  });

  it('does not mark crits on non-d20 rolls', () => {
    vi.mocked(Math.random).mockReturnValue(0.9999);
    
    const result = roll('1d6');
    expect(result.criticalSuccess).toBeUndefined();
    expect(result.criticalFailure).toBeUndefined();
  });

  it('does not mark crits on multiple d20 rolls', () => {
    vi.mocked(Math.random).mockReturnValue(0.9999);
    
    const result = roll('2d20');
    expect(result.criticalSuccess).toBeUndefined();
    expect(result.criticalFailure).toBeUndefined();
  });

  it('throws on invalid notation', () => {
    expect(() => roll('invalid')).toThrow('Invalid dice notation');
  });
});

describe('rollWithAdvantage', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('takes the higher of two rolls', () => {
    // First roll returns 5, second roll returns 15
    vi.mocked(Math.random)
      .mockReturnValueOnce(0.2) // ~5 on d20
      .mockReturnValueOnce(0.7); // ~15 on d20
    
    const result = rollWithAdvantage('1d20');
    // Should take the higher roll
    expect(result.rolls[0]).toBeGreaterThanOrEqual(14);
  });

  it('works correctly when first roll is higher', () => {
    vi.mocked(Math.random)
      .mockReturnValueOnce(0.9) // High roll
      .mockReturnValueOnce(0.1); // Low roll
    
    const result = rollWithAdvantage('1d20');
    expect(result.rolls[0]).toBeGreaterThanOrEqual(17);
  });

  it('takes first roll when rolls are equal', () => {
    vi.mocked(Math.random).mockReturnValue(0.5);
    
    const result = rollWithAdvantage('1d20');
    // Both rolls should be the same, returns first
    expect(result.notation).toBe('1d20');
  });
});

describe('rollWithDisadvantage', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('takes the lower of two rolls', () => {
    // First roll returns 15, second roll returns 5
    vi.mocked(Math.random)
      .mockReturnValueOnce(0.7) // ~15 on d20
      .mockReturnValueOnce(0.2); // ~5 on d20
    
    const result = rollWithDisadvantage('1d20');
    // Should take the lower roll
    expect(result.rolls[0]).toBeLessThanOrEqual(6);
  });

  it('works correctly when second roll is higher', () => {
    vi.mocked(Math.random)
      .mockReturnValueOnce(0.1) // Low roll
      .mockReturnValueOnce(0.9); // High roll
    
    const result = rollWithDisadvantage('1d20');
    expect(result.rolls[0]).toBeLessThanOrEqual(4);
  });

  it('takes first roll when rolls are equal', () => {
    vi.mocked(Math.random).mockReturnValue(0.5);
    
    const result = rollWithDisadvantage('1d20');
    expect(result.notation).toBe('1d20');
  });
});

describe('formatRoll', () => {
  it('formats basic roll correctly', () => {
    const roll: DiceRoll = {
      notation: '2d6',
      rolls: [3, 4],
      modifier: 0,
      total: 7,
    };
    
    expect(formatRoll(roll)).toBe('2d6: [3 + 4] = 7');
  });

  it('formats roll with positive modifier', () => {
    const roll: DiceRoll = {
      notation: '1d20+5',
      rolls: [15],
      modifier: 5,
      total: 20,
    };
    
    expect(formatRoll(roll)).toBe('1d20+5: [15] + 5 = 20');
  });

  it('formats roll with negative modifier', () => {
    const roll: DiceRoll = {
      notation: '1d20-3',
      rolls: [10],
      modifier: -3,
      total: 7,
    };
    
    expect(formatRoll(roll)).toBe('1d20-3: [10] - 3 = 7');
  });

  it('formats critical success', () => {
    const roll: DiceRoll = {
      notation: '1d20',
      rolls: [20],
      modifier: 0,
      total: 20,
      criticalSuccess: true,
    };
    
    expect(formatRoll(roll)).toContain('CRITICAL SUCCESS');
    expect(formatRoll(roll)).toContain('🎯');
  });

  it('formats critical failure', () => {
    const roll: DiceRoll = {
      notation: '1d20',
      rolls: [1],
      modifier: 0,
      total: 1,
      criticalFailure: true,
    };
    
    expect(formatRoll(roll)).toContain('CRITICAL FAILURE');
    expect(formatRoll(roll)).toContain('💀');
  });

  it('formats multiple dice', () => {
    const roll: DiceRoll = {
      notation: '4d6',
      rolls: [2, 3, 5, 6],
      modifier: 0,
      total: 16,
    };
    
    expect(formatRoll(roll)).toBe('4d6: [2 + 3 + 5 + 6] = 16');
  });
});
