// SPARC RPG Dice System
import { z } from "zod";

// Dice notation schema (e.g., "2d6+3", "1d20", "4d8-2")
export const DiceNotationSchema = z.string().regex(/^(\d+)d(\d+)([+-]\d+)?$/);

export type DiceNotation = z.infer<typeof DiceNotationSchema>;

export interface DiceRoll {
  notation: string;
  rolls: number[];
  modifier: number;
  total: number;
  criticalSuccess?: boolean;
  criticalFailure?: boolean;
}

/**
 * Parse dice notation into components
 * @param notation - Dice notation string (e.g., "2d6+3")
 */
export function parseDiceNotation(notation: string): {
  count: number;
  sides: number;
  modifier: number;
} {
  const match = notation.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!match) {
    throw new Error(`Invalid dice notation: ${notation}`);
  }

  return {
    count: parseInt(match[1], 10),
    sides: parseInt(match[2], 10),
    modifier: match[3] ? parseInt(match[3], 10) : 0,
  };
}

/**
 * Roll a single die
 * @param sides - Number of sides on the die
 */
export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll dice using standard notation
 * @param notation - Dice notation string (e.g., "2d6+3")
 */
export function roll(notation: string): DiceRoll {
  const { count, sides, modifier } = parseDiceNotation(notation);

  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(rollDie(sides));
  }

  const rollTotal = rolls.reduce((sum, r) => sum + r, 0);
  const total = rollTotal + modifier;

  // Check for critical success/failure on d20
  const criticalSuccess = sides === 20 && count === 1 && rolls[0] === 20;
  const criticalFailure = sides === 20 && count === 1 && rolls[0] === 1;

  return {
    notation,
    rolls,
    modifier,
    total,
    ...(criticalSuccess && { criticalSuccess }),
    ...(criticalFailure && { criticalFailure }),
  };
}

/**
 * Roll with advantage (roll twice, take higher)
 * @param notation - Dice notation string
 */
export function rollWithAdvantage(notation: string): DiceRoll {
  const roll1 = roll(notation);
  const roll2 = roll(notation);
  return roll1.total >= roll2.total ? roll1 : roll2;
}

/**
 * Roll with disadvantage (roll twice, take lower)
 * @param notation - Dice notation string
 */
export function rollWithDisadvantage(notation: string): DiceRoll {
  const roll1 = roll(notation);
  const roll2 = roll(notation);
  return roll1.total <= roll2.total ? roll1 : roll2;
}

/**
 * Format a dice roll result for display
 */
export function formatRoll(result: DiceRoll): string {
  const rollsStr = result.rolls.join(" + ");
  const modifierStr =
    result.modifier !== 0
      ? result.modifier > 0
        ? ` + ${result.modifier}`
        : ` - ${Math.abs(result.modifier)}`
      : "";

  let output = `${result.notation}: [${rollsStr}]${modifierStr} = ${result.total}`;

  if (result.criticalSuccess) {
    output += " 🎯 CRITICAL SUCCESS!";
  } else if (result.criticalFailure) {
    output += " 💀 CRITICAL FAILURE!";
  }

  return output;
}
