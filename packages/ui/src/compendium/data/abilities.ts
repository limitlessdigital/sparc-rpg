/**
 * Official SPARC Ability Data (Version E2)
 * 
 * All 7 class special abilities in SPARC RPG.
 */

import type { AbilityEntry } from "../types";

export const ABILITIES: AbilityEntry[] = [
  // WARRIOR - Flurry
  {
    id: "ability-flurry",
    slug: "flurry",
    title: "Flurry",
    type: "ability",
    category: "Abilities",
    subcategory: "Class Abilities",
    summary: "Warrior ability to make an additional attack.",
    content: `# Flurry

*Warrior Class Ability*

Unleash a rapid series of strikes against your enemies.

## Effect
You make one additional attack roll on this turn.

## Usage
Special ability with checkbox on character card.

## Tactical Tips
- Use when you need to finish off a tough enemy
- Great against multiple weakened foes
- Combine with high STR for maximum damage output`,
    stats: {
      abilityType: "active",
      usesPerSession: 1,
      targetType: "enemy"
    },
    tags: ["class-ability", "warrior", "damage", "melee", "extra-attack"],
    relatedEntries: ["class-warrior", "rule-combat-melee"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-29T00:00:00Z",
    version: 2
  },

  // WIZARD - Meteor Swarm
  {
    id: "ability-meteor-swarm",
    slug: "meteor-swarm",
    title: "Meteor Swarm",
    type: "ability",
    category: "Abilities",
    subcategory: "Class Abilities",
    summary: "Wizard ability to attack multiple enemies.",
    content: `# Meteor Swarm

*Wizard Class Ability*

Call down a devastating barrage of magical meteors.

## Effect
Make an INT attack roll contested against the DEX rolls of up to four enemies. These meteors can also damage nearby objects.

## Usage
Special ability with checkbox on character card.

## Tactical Tips
- Wait for enemies to cluster together
- Can be used to destroy cover or obstacles
- Your INT dice vs their DEX dice - target low-DEX enemies`,
    stats: {
      abilityType: "active",
      usesPerSession: 1,
      targetType: "area"
    },
    tags: ["class-ability", "wizard", "damage", "ranged", "area", "magic"],
    relatedEntries: ["class-wizard", "rule-combat-ranged"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-29T00:00:00Z",
    version: 2
  },

  // CLERIC - Heal
  {
    id: "ability-heal",
    slug: "heal",
    title: "Heal",
    type: "ability",
    category: "Abilities",
    subcategory: "Class Abilities",
    summary: "Cleric ability to restore HP and revive allies.",
    content: `# Heal

*Cleric Class Ability*

Channel divine power to mend wounds and restore life.

## Effect
Roll a number of dice equal to your INT and restore HP to a friendly creature equal to the amount rolled. If your target is at 0 HP, you restore them to life and they recover the same amount of HP.

## Usage
Special ability with checkbox on character card.

## Tactical Tips
- Save for emergencies - this can REVIVE fallen allies!
- Higher INT means more healing
- Can be used on yourself if needed`,
    stats: {
      abilityType: "active",
      usesPerSession: 1,
      targetType: "ally"
    },
    tags: ["class-ability", "cleric", "healing", "support", "revive", "divine"],
    relatedEntries: ["class-cleric"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-29T00:00:00Z",
    version: 2
  },

  // ROGUE - Backstab
  {
    id: "ability-backstab",
    slug: "backstab",
    title: "Backstab",
    type: "ability",
    category: "Abilities",
    subcategory: "Class Abilities",
    summary: "Rogue ability for high single-target damage.",
    content: `# Backstab

*Rogue Class Ability*

Strike with lethal precision for devastating damage.

## Effect
You make a Melee attack using your DEX dice. Your damage is the amount you rolled on dice that successfully hit the target.

## Usage
Special ability with checkbox on character card.

## Tactical Tips
- Each die that hits becomes damage!
- High DEX = more dice = more potential damage
- Great for finishing off tough single targets`,
    stats: {
      abilityType: "active",
      usesPerSession: 1,
      targetType: "enemy"
    },
    tags: ["class-ability", "rogue", "damage", "melee", "precision"],
    relatedEntries: ["class-rogue", "rule-combat-melee"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-29T00:00:00Z",
    version: 2
  },

  // RANGER - Multishot
  {
    id: "ability-multishot",
    slug: "multishot",
    title: "Multishot",
    type: "ability",
    category: "Abilities",
    subcategory: "Class Abilities",
    summary: "Ranger ability to attack multiple enemies at range.",
    content: `# Multishot

*Ranger Class Ability*

Fire a volley of arrows that strikes multiple targets.

## Effect
Make a single DEX ranged attack roll against up to four enemies.

## Usage
Special ability with checkbox on character card.

## Tactical Tips
- Most effective when enemies are grouped
- Uses one attack roll against all targets
- Perfect for softening up groups before allies engage`,
    stats: {
      abilityType: "active",
      usesPerSession: 1,
      targetType: "area"
    },
    tags: ["class-ability", "ranger", "damage", "ranged", "area"],
    relatedEntries: ["class-ranger", "rule-combat-ranged"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-29T00:00:00Z",
    version: 2
  },

  // PALADIN - Divine Shield
  {
    id: "ability-divine-shield",
    slug: "divine-shield",
    title: "Divine Shield",
    type: "ability",
    category: "Abilities",
    subcategory: "Class Abilities",
    summary: "Paladin ability to protect allies with divine power.",
    content: `# Divine Shield

*Paladin Class Ability*

Call upon divine protection to shield yourself or an ally.

## Effect
You or a friendly target roll 2 additional dice on a defensive roll. You must declare you are using this special ability before any damage is resolved.

## Usage
Special ability with checkbox on character card.

## Important
Must be declared BEFORE damage is resolved!

## Tactical Tips
- Great for protecting squishy allies like Wizards
- Can use on yourself against big hits
- Declare early - you can't use it after seeing damage`,
    stats: {
      abilityType: "reaction",
      usesPerSession: 1,
      targetType: "ally"
    },
    tags: ["class-ability", "paladin", "defense", "protection", "divine", "support"],
    relatedEntries: ["class-paladin", "rule-combat-defense"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-29T00:00:00Z",
    version: 2
  },

  // NECROMANCER - Transfer Life
  {
    id: "ability-transfer-life",
    slug: "transfer-life",
    title: "Transfer Life",
    type: "ability",
    category: "Abilities",
    subcategory: "Class Abilities",
    summary: "Necromancer ability to convert damage into healing.",
    content: `# Transfer Life

*Necromancer Class Ability*

Drain the life force of enemies to restore your allies.

## Effect
After dealing damage from an INT spell attack, you can restore HP equal to the damage dealt to yourself or an ally.

## Usage
Special ability with checkbox on character card.

## Tactical Tips
- Creates a damage-heal cycle for sustained combat
- Can heal yourself or support a wounded ally
- Higher INT = more damage = more healing`,
    stats: {
      abilityType: "active",
      usesPerSession: 1,
      targetType: "ally"
    },
    tags: ["class-ability", "necromancer", "damage", "healing", "sustain", "dark"],
    relatedEntries: ["class-necromancer"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-29T00:00:00Z",
    version: 2
  }
];
