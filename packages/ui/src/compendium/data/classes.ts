/**
 * Official SPARC Class Data (Version E2)
 * 
 * All 7 playable classes in SPARC RPG with their official stats and abilities.
 */

import type { ClassEntry } from "../types";

export const CLASSES: ClassEntry[] = [
  {
    id: "class-warrior",
    slug: "warrior",
    title: "Warrior",
    type: "class",
    category: "Classes",
    subcategory: "Martial",
    summary: "A master of martial combat who excels at direct confrontation.",
    content: `# Warrior

The Warrior is the quintessential frontline fighter, trained for direct combat and relentless offense. Warriors overpower enemies through sheer strength and the ability to strike multiple times.

## Role in the Party
Warriors serve as the party's primary damage dealers. They engage enemies directly and can overwhelm foes with multiple attacks.

## Playing a Warrior
- **Positioning:** Stay at the front lines, engaging the most dangerous enemies
- **Special Ability:** Use Flurry when you need to finish off a tough enemy or multiple weakened foes
- **Attributes:** Focus on STR for damage, DEX for defense

## Class Ability
**Flurry:** You make one additional attack roll on this turn.

## Starting Equipment
- Longsword
- Chainmail Armor
- Shield
- Traveler's Pack`,
    stats: {
      primaryAttribute: "str",
      hitPoints: 12,
      specialAbility: "Flurry - Make one additional attack roll this turn",
      startingEquipment: ["Longsword", "Chainmail Armor", "Shield", "Traveler's Pack"],
      description: "A master of martial combat who excels at direct confrontation",
      startingAttributes: { str: 3, dex: 2, int: 0, cha: 0 }
    },
    tags: ["martial", "melee", "damage", "frontline"],
    relatedEntries: ["item-longsword", "item-chainmail"],
    imageUrl: "/images/classes/warrior.png",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-29T00:00:00Z",
    version: 2
  },
  {
    id: "class-wizard",
    slug: "wizard",
    title: "Wizard",
    type: "class",
    category: "Classes",
    subcategory: "Spellcaster",
    summary: "A scholar who has mastered devastating arcane attacks.",
    content: `# Wizard

The Wizard has dedicated their life to mastering the arcane arts through rigorous study. They wield devastating area-of-effect magic capable of striking multiple enemies at once.

## Role in the Party
Wizards provide powerful area damage. They can turn the tide of battle by hitting multiple enemies simultaneously.

## Playing a Wizard
- **Positioning:** Stay behind front-line fighters - you're fragile!
- **Special Ability:** Use Meteor Swarm when enemies are clustered
- **Attributes:** INT is everything for a Wizard

## Class Ability
**Meteor Swarm:** Make an INT attack roll contested against the DEX rolls of up to four enemies. These meteors can also damage nearby objects.

## Starting Equipment
- Grimoire of Spells
- Staff
- Robes
- Component Pouch`,
    stats: {
      primaryAttribute: "int",
      hitPoints: 7,
      specialAbility: "Meteor Swarm - INT attack vs DEX of up to 4 enemies, can damage objects",
      startingEquipment: ["Grimoire of Spells", "Staff", "Robes", "Component Pouch"],
      description: "A scholar who has mastered devastating arcane attacks",
      startingAttributes: { str: 0, dex: 2, int: 3, cha: 0 }
    },
    tags: ["spellcaster", "ranged", "damage", "area"],
    relatedEntries: ["item-staff", "item-robes"],
    imageUrl: "/images/classes/wizard.png",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-29T00:00:00Z",
    version: 2
  },
  {
    id: "class-cleric",
    slug: "cleric",
    title: "Cleric",
    type: "class",
    category: "Classes",
    subcategory: "Support",
    summary: "A divine healer who channels sacred power.",
    content: `# Cleric

The Cleric is devoted to the divine, channeling sacred power to heal allies and even restore the fallen. They are the ultimate party support, capable of bringing allies back from the brink of death.

## Role in the Party
Clerics are essential healers. They keep the party alive and can even revive allies who fall to 0 HP.

## Playing a Cleric
- **Healing Priority:** Keep allies alive above dealing damage
- **Special Ability:** Save Heal for critical moments - it can revive fallen allies!
- **Attributes:** INT determines your healing power

## Class Ability
**Heal:** Roll a number of dice equal to your INT and restore HP to a friendly creature equal to the amount rolled. If your target is at 0 HP, you restore them to life and they recover the same amount of HP.

## Starting Equipment
- Holy Symbol
- Mace
- Chain Shirt
- Healer's Kit`,
    stats: {
      primaryAttribute: "int",
      hitPoints: 9,
      specialAbility: "Heal - Roll INT dice to restore HP; can revive allies at 0 HP",
      startingEquipment: ["Holy Symbol", "Mace", "Chain Shirt", "Healer's Kit"],
      description: "A divine healer who channels sacred power",
      startingAttributes: { str: 1, dex: 0, int: 3, cha: 1 }
    },
    tags: ["support", "healing", "divine", "revive"],
    relatedEntries: ["item-mace", "item-holy-symbol"],
    imageUrl: "/images/classes/cleric.png",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-29T00:00:00Z",
    version: 2
  },
  {
    id: "class-rogue",
    slug: "rogue",
    title: "Rogue",
    type: "class",
    category: "Classes",
    subcategory: "Martial",
    summary: "A deadly operative who excels at stealth and precision.",
    content: `# Rogue

The Rogue operates from the shadows, striking with lethal precision. Masters of stealth and subterfuge, they deal devastating damage with their signature Backstab ability.

## Role in the Party
Rogues excel at high single-target damage. They're also skilled at disabling traps, picking locks, and scouting ahead.

## Playing a Rogue
- **Positioning:** Look for flanking opportunities and blind spots
- **Special Ability:** Backstab converts your DEX dice into pure damage
- **Attributes:** DEX is your primary stat for both attacks and defense

## Class Ability
**Backstab:** You make a Melee attack using your DEX dice. Your damage is the amount you rolled on dice that successfully hit the target.

## Starting Equipment
- Twin Daggers
- Leather Armor
- Thieves' Tools
- Dark Cloak`,
    stats: {
      primaryAttribute: "dex",
      hitPoints: 9,
      specialAbility: "Backstab - DEX melee attack; damage equals dice that hit",
      startingEquipment: ["Twin Daggers", "Leather Armor", "Thieves' Tools", "Dark Cloak"],
      description: "A deadly operative who excels at stealth and precision",
      startingAttributes: { str: 0, dex: 3, int: 1, cha: 1 }
    },
    tags: ["martial", "melee", "stealth", "damage"],
    relatedEntries: ["item-dagger", "item-leather-armor"],
    imageUrl: "/images/classes/rogue.png",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-29T00:00:00Z",
    version: 2
  },
  {
    id: "class-ranger",
    slug: "ranger",
    title: "Ranger",
    type: "class",
    category: "Classes",
    subcategory: "Martial",
    summary: "A skilled hunter who excels at ranged combat.",
    content: `# Ranger

The Ranger is a master of ranged combat, capable of striking multiple enemies from a distance with deadly accuracy. They combine wilderness survival skills with expert archery.

## Role in the Party
Rangers provide reliable ranged damage and can hit multiple targets at once. They're also valuable for tracking and survival in the wilderness.

## Playing a Ranger
- **Positioning:** Stay at range - your power is in distance
- **Special Ability:** Use Multishot when enemies are grouped
- **Attributes:** DEX is your primary stat for both attack and defense

## Class Ability
**Multishot:** Make a single DEX ranged attack roll against up to four enemies.

## Starting Equipment
- Longbow
- Quiver of Arrows
- Hunting Knife
- Leather Armor
- Survival Kit`,
    stats: {
      primaryAttribute: "dex",
      hitPoints: 11,
      specialAbility: "Multishot - Single DEX ranged attack vs up to 4 enemies",
      startingEquipment: ["Longbow", "Quiver of Arrows", "Hunting Knife", "Leather Armor", "Survival Kit"],
      description: "A skilled hunter who excels at ranged combat",
      startingAttributes: { str: 1, dex: 3, int: 1, cha: 0 }
    },
    tags: ["martial", "ranged", "damage", "area"],
    relatedEntries: ["item-longbow", "item-leather-armor"],
    imageUrl: "/images/classes/ranger.png",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-29T00:00:00Z",
    version: 2
  },
  {
    id: "class-paladin",
    slug: "paladin",
    title: "Paladin",
    type: "class",
    category: "Classes",
    subcategory: "Hybrid",
    summary: "A holy warrior who combines martial prowess with divine protection.",
    content: `# Paladin

The Paladin is a holy warrior blessed with divine power. They combine strong melee combat with the ability to protect allies through their Divine Shield.

## Role in the Party
Paladins serve as frontline defenders who can protect allies from damage. They deal solid damage while keeping their teammates safe.

## Playing a Paladin
- **Positioning:** Stay near allies who need protection
- **Special Ability:** Declare Divine Shield BEFORE damage is resolved
- **Attributes:** STR for offense, use Divine Shield to compensate for low DEX

## Class Ability
**Divine Shield:** You or a friendly target roll 2 additional dice on a defensive roll. You must declare you are using this special ability before any damage is resolved.

## Starting Equipment
- Holy Sword
- Tower Shield
- Plate Armor
- Holy Symbol`,
    stats: {
      primaryAttribute: "str",
      hitPoints: 12,
      specialAbility: "Divine Shield - +2 dice on defensive roll for you or ally (declare before damage)",
      startingEquipment: ["Holy Sword", "Tower Shield", "Plate Armor", "Holy Symbol"],
      description: "A holy warrior who combines martial prowess with divine protection",
      startingAttributes: { str: 3, dex: 0, int: 1, cha: 1 }
    },
    tags: ["hybrid", "melee", "defense", "protection", "divine"],
    relatedEntries: ["item-sword", "item-plate-armor"],
    imageUrl: "/images/classes/paladin.png",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-29T00:00:00Z",
    version: 2
  },
  {
    id: "class-necromancer",
    slug: "necromancer",
    title: "Necromancer",
    type: "class",
    category: "Classes",
    subcategory: "Spellcaster",
    summary: "A dark spellcaster who manipulates life force.",
    content: `# Necromancer

The Necromancer delves into forbidden knowledge, learning to manipulate the boundary between life and death. They drain enemies to sustain themselves and their allies.

## Role in the Party
Necromancers provide sustained damage with built-in healing. They can keep fighting indefinitely by draining life from enemies.

## Playing a Necromancer
- **Combat Loop:** Deal spell damage, then heal from it
- **Special Ability:** Transfer Life turns damage into healing for you or allies
- **Attributes:** INT determines your spell damage (and thus your healing)

## Class Ability
**Transfer Life:** After dealing damage from an INT spell attack, you can restore HP equal to the damage dealt to yourself or an ally.

## Starting Equipment
- Skull Focus
- Ritual Dagger
- Dark Robes
- Book of Shadows`,
    stats: {
      primaryAttribute: "int",
      hitPoints: 7,
      specialAbility: "Transfer Life - After INT spell damage, heal self or ally equal to damage dealt",
      startingEquipment: ["Skull Focus", "Ritual Dagger", "Dark Robes", "Book of Shadows"],
      description: "A dark spellcaster who manipulates life force",
      startingAttributes: { str: 0, dex: 1, int: 3, cha: 1 }
    },
    tags: ["spellcaster", "damage", "healing", "sustain", "dark"],
    relatedEntries: ["item-dagger", "item-robes"],
    imageUrl: "/images/classes/necromancer.png",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-29T00:00:00Z",
    version: 2
  }
];
