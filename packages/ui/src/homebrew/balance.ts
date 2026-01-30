/**
 * Balance Validation Utilities
 * Automatically calculates challenge ratings and flags potential balance issues
 */

import {
  MonsterData,
  ItemData,
  AbilityData,
  ClassData,
  BalanceWarning,
  BalanceCheck,
} from "./types";

// ============================================
// Monster Balance
// ============================================

/**
 * Calculate Challenge Rating for a monster based on stats
 */
export function calculateMonsterCR(monster: MonsterData): number {
  // CR calculation factors:
  // - HP contributes ~40%
  // - AC contributes ~20%
  // - Damage output (attacks) ~30%
  // - Special abilities ~10%

  const hpFactor = monster.hitPoints / 15; // ~15 HP per CR
  const acFactor = (monster.armorClass - 8) / 3; // AC 10 = ~0.67, AC 16 = 2.67
  
  // Calculate average damage per round
  const avgDamage = monster.attacks.reduce((sum, attack) => {
    // Average d6 = 3.5, so diceCount * 3.5
    return sum + (attack.diceCount * 3.5);
  }, 0);
  const damageFactor = avgDamage / 6; // ~6 damage per CR
  
  // Abilities add ~0.5 CR each
  const abilityFactor = monster.abilities.length * 0.5;
  
  // Weighted average
  const rawCR = (hpFactor * 0.4) + (acFactor * 0.2) + (damageFactor * 0.3) + (abilityFactor * 0.1);
  
  // Round to nearest 0.5
  return Math.max(0.5, Math.round(rawCR * 2) / 2);
}

/**
 * Validate monster stats and return balance warnings
 */
export function validateMonsterBalance(monster: MonsterData): BalanceWarning[] {
  const warnings: BalanceWarning[] = [];
  const cr = calculateMonsterCR(monster);

  // HP expectations per CR
  const expectedHP = cr * 15;
  const hpVariance = Math.abs(monster.hitPoints - expectedHP) / expectedHP;
  
  if (hpVariance > 0.5) {
    if (monster.hitPoints > expectedHP) {
      warnings.push({
        severity: 'warning',
        field: 'hitPoints',
        message: `HP (${monster.hitPoints}) is very high for CR ${cr}.`,
        suggestion: `Consider reducing to ${Math.round(expectedHP * 0.8)}-${Math.round(expectedHP * 1.2)} or increasing other stats to match.`,
      });
    } else {
      warnings.push({
        severity: 'info',
        field: 'hitPoints',
        message: `HP (${monster.hitPoints}) is low for CR ${cr}.`,
        suggestion: `This creature will die quickly. Consider this a "glass cannon" build.`,
      });
    }
  }

  // AC checks
  if (monster.armorClass > 18) {
    warnings.push({
      severity: 'warning',
      field: 'armorClass',
      message: `AC ${monster.armorClass} is very high and may frustrate players.`,
      suggestion: 'Consider 14-16 for most monsters, or give weaknesses to balance high AC.',
    });
  }

  // Attribute checks (max should be 6)
  const attrs = [monster.might, monster.grace, monster.wit, monster.heart];
  const maxAttr = Math.max(...attrs);
  const totalAttrs = attrs.reduce((a, b) => a + b, 0);
  
  if (maxAttr > 6) {
    warnings.push({
      severity: 'error',
      field: 'attributes',
      message: 'Attributes cannot exceed 6.',
      suggestion: 'Reduce the highest attribute to 6.',
    });
  }
  
  if (totalAttrs > 16) {
    warnings.push({
      severity: 'warning',
      field: 'attributes',
      message: `Total attributes (${totalAttrs}) are very high.`,
      suggestion: 'Most balanced monsters have 8-14 total attribute points.',
    });
  }

  // Attack validation
  if (monster.attacks.length === 0) {
    warnings.push({
      severity: 'info',
      field: 'attacks',
      message: 'Monster has no attacks.',
      suggestion: 'Add at least one attack unless this is a non-combat creature.',
    });
  }

  // Check for very high damage attacks
  monster.attacks.forEach(attack => {
    if (attack.diceCount > 6) {
      warnings.push({
        severity: 'warning',
        field: 'attacks',
        message: `Attack "${attack.name}" deals ${attack.diceCount}d6 damage, which is very high.`,
        suggestion: 'Consider 2-4 dice for normal attacks, 5-6 for powerful attacks.',
      });
    }
  });

  // Ability cooldown checks
  monster.abilities.forEach(ability => {
    if (ability.cooldown === 0 || ability.cooldown === undefined) {
      if (ability.description.toLowerCase().includes('damage') ||
          ability.description.toLowerCase().includes('stun') ||
          ability.description.toLowerCase().includes('disable')) {
        warnings.push({
          severity: 'info',
          field: 'abilities',
          message: `Ability "${ability.name}" has no cooldown.`,
          suggestion: 'Powerful abilities usually need cooldowns to be balanced.',
        });
      }
    }
  });

  return warnings;
}

// ============================================
// Item Balance
// ============================================

/**
 * Calculate power level for an item (1-5 scale matching rarity)
 */
export function calculateItemPowerLevel(item: ItemData): number {
  let power = 0;

  // Stat modifiers
  if (item.statModifiers) {
    power += item.statModifiers.reduce((sum, mod) => sum + Math.abs(mod.modifier), 0);
  }

  // Dice bonus for weapons
  if (item.diceBonus) {
    power += item.diceBonus * 1.5;
  }

  // Armor bonus
  if (item.armorBonus) {
    power += item.armorBonus;
  }

  // Special effects
  if (item.specialEffects) {
    power += item.specialEffects.length * 1.5;
  }

  // Consumable reduction (single use)
  if (item.consumable) {
    power *= 0.6;
  }

  // Map to 1-5 scale
  if (power <= 1) return 1;       // Common
  if (power <= 2.5) return 2;     // Uncommon
  if (power <= 4) return 3;       // Rare
  if (power <= 6) return 4;       // Epic
  return 5;                        // Legendary
}

/**
 * Validate item balance
 */
export function validateItemBalance(item: ItemData): BalanceWarning[] {
  const warnings: BalanceWarning[] = [];
  const powerLevel = calculateItemPowerLevel(item);
  
  // Map rarity to expected power level
  const rarityPower: Record<string, number> = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
  };
  
  const expectedPower = rarityPower[item.rarity] || 3;

  if (powerLevel > expectedPower + 1) {
    warnings.push({
      severity: 'warning',
      field: 'rarity',
      message: `Item is more powerful than its ${item.rarity} rarity suggests.`,
      suggestion: `Consider increasing rarity or reducing effects.`,
    });
  }

  if (powerLevel < expectedPower - 1) {
    warnings.push({
      severity: 'info',
      field: 'rarity',
      message: `Item is less powerful than typical ${item.rarity} items.`,
      suggestion: `Consider decreasing rarity or adding effects.`,
    });
  }

  // High dice bonus check
  if (item.diceBonus && item.diceBonus > 3) {
    warnings.push({
      severity: 'warning',
      field: 'diceBonus',
      message: `+${item.diceBonus} dice is very powerful.`,
      suggestion: 'Legendary weapons typically have +2 or +3 dice bonus.',
    });
  }

  // Stat modifier checks
  if (item.statModifiers) {
    item.statModifiers.forEach(mod => {
      if (mod.modifier > 2) {
        warnings.push({
          severity: 'warning',
          field: 'statModifiers',
          message: `+${mod.modifier} to ${mod.attribute} is very high.`,
          suggestion: 'Most items provide +1 or +2 to an attribute.',
        });
      }
    });
  }

  return warnings;
}

// ============================================
// Ability Balance
// ============================================

/**
 * Calculate ability power level
 */
export function calculateAbilityPowerLevel(ability: AbilityData): number {
  let power = 0;

  // Effect power
  ability.effects.forEach(effect => {
    switch (effect.type) {
      case 'damage':
        power += (effect.value || 0) / 5;
        break;
      case 'heal':
        power += (effect.value || 0) / 4;
        break;
      case 'stun':
      case 'blind':
        power += 3;
        break;
      case 'buff_attribute':
      case 'debuff_attribute':
        power += 2;
        break;
      default:
        power += 1;
    }
    
    // Duration multiplier
    if (effect.duration && effect.duration > 1) {
      power *= 1 + (effect.duration * 0.2);
    }
  });

  // Target type multiplier
  switch (ability.targetType) {
    case 'all_allies':
    case 'all_enemies':
    case 'area':
      power *= 1.5;
      break;
  }

  // Cooldown reduction
  if (ability.cooldown) {
    power *= Math.max(0.5, 1 - (ability.cooldown * 0.1));
  }

  return Math.round(power * 10) / 10;
}

/**
 * Validate ability balance
 */
export function validateAbilityBalance(ability: AbilityData): BalanceWarning[] {
  const warnings: BalanceWarning[] = [];
  const power = calculateAbilityPowerLevel(ability);

  // Very powerful abilities
  if (power > 6) {
    warnings.push({
      severity: 'warning',
      field: 'power',
      message: `This ability (power: ${power}) is very strong.`,
      suggestion: 'Consider adding a longer cooldown or limiting uses.',
    });
  }

  // No cooldown on powerful abilities
  if (power > 3 && (!ability.cooldown || ability.cooldown === 0)) {
    warnings.push({
      severity: 'warning',
      field: 'cooldown',
      message: 'Powerful ability has no cooldown.',
      suggestion: 'Add a 1-3 round cooldown for balance.',
    });
  }

  // AoE without limits
  if (['all_enemies', 'all_allies', 'area'].includes(ability.targetType)) {
    if (!ability.usesPerEncounter && !ability.usesPerDay) {
      warnings.push({
        severity: 'info',
        field: 'targetType',
        message: 'Area/multi-target ability has no use limits.',
        suggestion: 'Consider limiting uses per encounter or adding cooldown.',
      });
    }
  }

  // High damage values
  ability.effects.forEach(effect => {
    if (effect.type === 'damage' && (effect.value || 0) > 30) {
      warnings.push({
        severity: 'warning',
        field: 'effects',
        message: `${effect.value} damage is very high for a single ability.`,
        suggestion: 'Most abilities deal 10-20 damage. Higher values should be rare.',
      });
    }
  });

  return warnings;
}

// ============================================
// Class Balance
// ============================================

/**
 * Validate class template balance
 */
export function validateClassBalance(classData: ClassData): BalanceWarning[] {
  const warnings: BalanceWarning[] = [];

  // Check total attribute points (should be around 10)
  const totalAttrs = classData.attributes.might + 
                     classData.attributes.grace + 
                     classData.attributes.wit + 
                     classData.attributes.heart;

  if (totalAttrs > 12) {
    warnings.push({
      severity: 'error',
      field: 'attributes',
      message: `Total attributes (${totalAttrs}) exceed maximum of 12.`,
      suggestion: 'Reduce attributes to total 10-12 points.',
    });
  } else if (totalAttrs < 8) {
    warnings.push({
      severity: 'warning',
      field: 'attributes',
      message: `Total attributes (${totalAttrs}) are below typical minimum.`,
      suggestion: 'Classes typically have 10 total attribute points.',
    });
  }

  // Check individual attributes
  Object.entries(classData.attributes).forEach(([attr, value]) => {
    if (value > 5) {
      warnings.push({
        severity: 'warning',
        field: 'attributes',
        message: `${attr} (${value}) is very high for a starting class.`,
        suggestion: 'Starting attributes are usually 1-4, with one at 4.',
      });
    }
    if (value < 1) {
      warnings.push({
        severity: 'error',
        field: 'attributes',
        message: `${attr} must be at least 1.`,
      });
    }
  });

  // HP check
  if (classData.hitPoints < 10 || classData.hitPoints > 30) {
    warnings.push({
      severity: 'warning',
      field: 'hitPoints',
      message: `Starting HP of ${classData.hitPoints} is unusual.`,
      suggestion: 'Most classes start with 15-25 HP.',
    });
  }

  // Starting equipment count
  if (classData.startingEquipment.length > 5) {
    warnings.push({
      severity: 'info',
      field: 'startingEquipment',
      message: 'Many starting items.',
      suggestion: 'Most classes start with 3-4 items.',
    });
  }

  return warnings;
}

// ============================================
// Full Balance Check
// ============================================

export function performBalanceCheck(
  category: 'monster' | 'item' | 'ability' | 'spell' | 'class',
  data: MonsterData | ItemData | AbilityData | ClassData,
  homebrewId: string = 'preview'
): BalanceCheck {
  let calculatedRating = 0;
  let balanceWarnings: BalanceWarning[] = [];

  switch (category) {
    case 'monster':
      calculatedRating = calculateMonsterCR(data as MonsterData);
      balanceWarnings = validateMonsterBalance(data as MonsterData);
      break;
    case 'item':
      calculatedRating = calculateItemPowerLevel(data as ItemData);
      balanceWarnings = validateItemBalance(data as ItemData);
      break;
    case 'ability':
    case 'spell':
      calculatedRating = calculateAbilityPowerLevel(data as AbilityData);
      balanceWarnings = validateAbilityBalance(data as AbilityData);
      break;
    case 'class':
      calculatedRating = 1; // Classes don't have a power rating
      balanceWarnings = validateClassBalance(data as ClassData);
      break;
  }

  return {
    homebrewId,
    category,
    calculatedRating,
    balanceWarnings,
    comparable: [], // Would be populated from database
  };
}
