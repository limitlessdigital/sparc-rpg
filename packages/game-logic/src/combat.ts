// SPARC RPG Combat System
import { roll, rollWithAdvantage, rollWithDisadvantage, type DiceRoll } from "./dice";
import { getAttributeModifier, type Character } from "./character";

export type AttackModifier = "normal" | "advantage" | "disadvantage";

export interface AttackResult {
  attackRoll: DiceRoll;
  hit: boolean;
  damage?: DiceRoll;
  criticalHit?: boolean;
}

export interface CombatRound {
  attacker: string;
  defender: string;
  result: AttackResult;
  timestamp: Date;
}

/**
 * Make an attack roll
 * @param attackModifier - The attack bonus
 * @param targetAC - The target's armor class
 * @param modifier - Advantage, disadvantage, or normal
 */
export function makeAttackRoll(
  attackBonus: number,
  targetAC: number,
  modifier: AttackModifier = "normal"
): { roll: DiceRoll; hit: boolean; critical: boolean } {
  let attackRoll: DiceRoll;

  switch (modifier) {
    case "advantage":
      attackRoll = rollWithAdvantage("1d20");
      break;
    case "disadvantage":
      attackRoll = rollWithDisadvantage("1d20");
      break;
    default:
      attackRoll = roll("1d20");
  }

  // Apply attack bonus
  const totalAttack = attackRoll.total + attackBonus;

  // Check for critical hit (natural 20) or miss (natural 1)
  const isCritical = attackRoll.criticalSuccess === true;
  const isAutoMiss = attackRoll.criticalFailure === true;

  // Hit if total >= AC (unless auto miss) or critical hit
  const hit = isCritical || (!isAutoMiss && totalAttack >= targetAC);

  return {
    roll: { ...attackRoll, total: totalAttack },
    hit,
    critical: isCritical,
  };
}

/**
 * Roll damage for an attack
 * @param damageDice - The damage dice notation (e.g., "1d8+3")
 * @param critical - Whether this is a critical hit
 */
export function rollDamage(
  damageDice: string,
  critical: boolean = false
): DiceRoll {
  if (critical) {
    // On critical, roll damage dice twice
    const roll1 = roll(damageDice);
    const roll2 = roll(damageDice);
    return {
      notation: damageDice,
      rolls: [...roll1.rolls, ...roll2.rolls],
      modifier: roll1.modifier + roll2.modifier,
      total: roll1.total + roll2.total - roll1.modifier, // Don't double the modifier
    };
  }

  return roll(damageDice);
}

/**
 * Calculate attack bonus for a character
 */
export function getAttackBonus(
  character: Character,
  useStrength: boolean = true
): number {
  const proficiencyBonus = Math.ceil(character.level / 4) + 1;
  const attributeModifier = useStrength
    ? getAttributeModifier(character.attributes.strength)
    : getAttributeModifier(character.attributes.dexterity);

  return proficiencyBonus + attributeModifier;
}

/**
 * Perform a full attack action
 */
export function attack(
  attacker: Character,
  defender: Character,
  damageDice: string,
  attackModifier: AttackModifier = "normal",
  useStrength: boolean = true
): AttackResult {
  const attackBonus = getAttackBonus(attacker, useStrength);
  const { roll: attackRoll, hit, critical } = makeAttackRoll(
    attackBonus,
    defender.armorClass,
    attackModifier
  );

  const result: AttackResult = {
    attackRoll,
    hit,
  };

  if (hit) {
    result.damage = rollDamage(damageDice, critical);
    if (critical) {
      result.criticalHit = true;
    }
  }

  return result;
}

/**
 * Apply damage to a character
 */
export function applyDamage(character: Character, damage: number): Character {
  return {
    ...character,
    hitPoints: {
      ...character.hitPoints,
      current: Math.max(0, character.hitPoints.current - damage),
    },
  };
}

/**
 * Heal a character
 */
export function heal(character: Character, amount: number): Character {
  return {
    ...character,
    hitPoints: {
      ...character.hitPoints,
      current: Math.min(
        character.hitPoints.max,
        character.hitPoints.current + amount
      ),
    },
  };
}

/**
 * Check if a character is unconscious (0 HP)
 */
export function isUnconscious(character: Character): boolean {
  return character.hitPoints.current <= 0;
}
