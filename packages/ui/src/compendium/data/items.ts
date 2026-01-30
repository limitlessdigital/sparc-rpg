/**
 * SPARC Item Data
 * 
 * All items in SPARC RPG including weapons, armor, and consumables.
 */

import type { ItemEntry } from "../types";

export const ITEMS: ItemEntry[] = [
  // WEAPONS - Melee
  {
    id: "item-longsword",
    slug: "longsword",
    title: "Longsword",
    type: "item",
    category: "Items",
    subcategory: "Weapons",
    summary: "A versatile one-handed sword favored by warriors.",
    content: `# Longsword

A standard one-handed sword with a blade about 3 feet long. The longsword is the weapon of choice for many warriors due to its balance of offense and defense.

## Properties
- **Versatile:** Can be wielded with two hands for +1 damage

## Tactical Use
The longsword pairs well with a shield for defense or can be gripped two-handed when maximum damage is needed.`,
    stats: {
      itemType: "weapon",
      damage: "1d6",
      properties: ["Versatile"],
      weight: 3,
      value: 15
    },
    tags: ["weapon", "melee", "martial", "sword", "versatile"],
    relatedEntries: ["class-champion", "rule-combat-melee"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "item-dagger",
    slug: "dagger",
    title: "Dagger",
    type: "item",
    category: "Items",
    subcategory: "Weapons",
    summary: "A small blade useful for both melee and throwing.",
    content: `# Dagger

A small, easily concealed blade. Daggers are favored by rogues for their versatility and ability to be thrown in a pinch.

## Properties
- **Finesse:** Use Grace instead of Might for attack rolls
- **Thrown:** Can be thrown up to 20 feet

## Tactical Use
Daggers are ideal for dual wielding or as a backup weapon when your primary is unavailable.`,
    stats: {
      itemType: "weapon",
      damage: "1d4",
      range: "20ft thrown",
      properties: ["Finesse", "Thrown", "Light"],
      weight: 1,
      value: 2
    },
    tags: ["weapon", "melee", "simple", "finesse", "thrown"],
    relatedEntries: ["class-shadowblade", "rule-combat-melee"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "item-staff",
    slug: "staff",
    title: "Staff",
    type: "item",
    category: "Items",
    subcategory: "Weapons",
    summary: "A wooden staff that can serve as weapon and arcane focus.",
    content: `# Staff

A simple wooden staff, often carved with arcane symbols. Sages use these as both walking aids and magical conduits.

## Properties
- **Two-Handed:** Requires both hands to use effectively
- **Arcane Focus:** Can channel magical energy

## Tactical Use
While weak in combat, the staff allows spellcasters to channel their magic more effectively.`,
    stats: {
      itemType: "weapon",
      damage: "1d4",
      properties: ["Two-Handed", "Arcane Focus"],
      weight: 4,
      value: 5
    },
    tags: ["weapon", "melee", "simple", "arcane", "focus"],
    relatedEntries: ["class-sage", "rule-magic"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "item-mace",
    slug: "mace",
    title: "Mace",
    type: "item",
    category: "Items",
    subcategory: "Weapons",
    summary: "A heavy bludgeoning weapon effective against armored foes.",
    content: `# Mace

A sturdy weapon with a heavy metal head designed to crush armor and bone. Popular among clerics and paladins.

## Properties
- **Bludgeoning:** Effective against skeletons (+1 damage)

## Tactical Use
The mace excels against heavily armored enemies and undead creatures.`,
    stats: {
      itemType: "weapon",
      damage: "1d6",
      properties: ["Bludgeoning"],
      weight: 4,
      value: 10
    },
    tags: ["weapon", "melee", "simple", "bludgeoning"],
    relatedEntries: ["class-herald", "class-mystic"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "item-rapier",
    slug: "rapier",
    title: "Rapier",
    type: "item",
    category: "Items",
    subcategory: "Weapons",
    summary: "An elegant thrusting sword that rewards precision over strength.",
    content: `# Rapier

A slender, sharply pointed sword designed for thrusting attacks. Its elegant design makes it a favorite of duelists.

## Properties
- **Finesse:** Use Grace instead of Might for attack rolls

## Tactical Use
The rapier is perfect for nimble fighters who rely on agility rather than brute strength.`,
    stats: {
      itemType: "weapon",
      damage: "1d6",
      properties: ["Finesse"],
      weight: 2,
      value: 25
    },
    tags: ["weapon", "melee", "martial", "finesse", "sword"],
    relatedEntries: ["class-trickster", "class-shadowblade"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "item-warhammer",
    slug: "warhammer",
    title: "Warhammer",
    type: "item",
    category: "Items",
    subcategory: "Weapons",
    summary: "A heavy hammer that can crush shields and skulls alike.",
    content: `# Warhammer

A heavy hammer with a long handle, designed for use in battle. The weight of the head provides devastating striking power.

## Properties
- **Bludgeoning:** Effective against skeletons (+1 damage)
- **Versatile:** Can be wielded with two hands for +1 damage

## Tactical Use
Excellent for breaking through enemy defenses and dealing with undead.`,
    stats: {
      itemType: "weapon",
      damage: "1d6",
      properties: ["Bludgeoning", "Versatile"],
      weight: 5,
      value: 15
    },
    tags: ["weapon", "melee", "martial", "bludgeoning", "versatile"],
    relatedEntries: ["class-mystic", "class-champion"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  // WEAPONS - Ranged
  {
    id: "item-shortbow",
    slug: "shortbow",
    title: "Shortbow",
    type: "item",
    category: "Items",
    subcategory: "Weapons",
    summary: "A compact bow suitable for mobile ranged combat.",
    content: `# Shortbow

A smaller bow that sacrifices some range for portability. Popular among scouts and mounted archers.

## Properties
- **Two-Handed:** Requires both hands to use
- **Ammunition:** Requires arrows

## Tactical Use
Best for mobile fighters who need to maintain distance while staying nimble.`,
    stats: {
      itemType: "weapon",
      damage: "1d6",
      range: "60ft",
      properties: ["Two-Handed", "Ammunition"],
      weight: 2,
      value: 25
    },
    tags: ["weapon", "ranged", "bow", "martial"],
    relatedEntries: ["item-arrows", "rule-combat-ranged"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "item-longbow",
    slug: "longbow",
    title: "Longbow",
    type: "item",
    category: "Items",
    subcategory: "Weapons",
    summary: "A powerful bow with exceptional range.",
    content: `# Longbow

A tall bow that stands nearly as tall as its wielder. The longbow provides unmatched range and power.

## Properties
- **Two-Handed:** Requires both hands to use
- **Ammunition:** Requires arrows
- **Heavy:** Disadvantage if Might is below 2

## Tactical Use
Ideal for picking off enemies from a safe distance before they can close to melee.`,
    stats: {
      itemType: "weapon",
      damage: "1d8",
      range: "120ft",
      properties: ["Two-Handed", "Ammunition", "Heavy"],
      weight: 3,
      value: 50
    },
    tags: ["weapon", "ranged", "bow", "martial", "heavy"],
    relatedEntries: ["item-arrows", "class-warden", "rule-combat-ranged"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  // ARMOR
  {
    id: "item-leather-armor",
    slug: "leather-armor",
    title: "Leather Armor",
    type: "item",
    category: "Items",
    subcategory: "Armor",
    summary: "Light armor made from cured animal hides.",
    content: `# Leather Armor

Basic protective gear made from treated animal skins. Offers modest protection without restricting movement.

## Properties
- **Light Armor:** No movement penalties

## Tactical Use
Perfect for rogues and rangers who need protection without sacrificing mobility.`,
    stats: {
      itemType: "armor",
      defense: 1,
      properties: ["Light"],
      weight: 10,
      value: 10
    },
    tags: ["armor", "light", "leather"],
    relatedEntries: ["class-shadowblade", "rule-defense"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "item-chainmail",
    slug: "chainmail",
    title: "Chain Mail",
    type: "item",
    category: "Items",
    subcategory: "Armor",
    summary: "Armor made of interlocking metal rings.",
    content: `# Chain Mail

Armor constructed from thousands of interlocking metal rings. Provides excellent protection against slashing attacks.

## Properties
- **Medium Armor:** -5ft movement speed

## Tactical Use
A good balance of protection and mobility for front-line fighters.`,
    stats: {
      itemType: "armor",
      defense: 2,
      properties: ["Medium"],
      weight: 40,
      value: 75
    },
    tags: ["armor", "medium", "metal"],
    relatedEntries: ["class-champion", "rule-defense"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "item-scalemail",
    slug: "scale-mail",
    title: "Scale Mail",
    type: "item",
    category: "Items",
    subcategory: "Armor",
    summary: "Armor made of overlapping metal scales.",
    content: `# Scale Mail

Armor made of small overlapping metal plates resembling fish scales. Offers solid protection with reasonable flexibility.

## Properties
- **Medium Armor:** -5ft movement speed

## Tactical Use
Popular among divine warriors who need protection while casting spells.`,
    stats: {
      itemType: "armor",
      defense: 2,
      properties: ["Medium"],
      weight: 45,
      value: 50
    },
    tags: ["armor", "medium", "metal", "scales"],
    relatedEntries: ["class-mystic", "rule-defense"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "item-shield",
    slug: "shield",
    title: "Shield",
    type: "item",
    category: "Items",
    subcategory: "Armor",
    summary: "A defensive tool that increases your defense.",
    content: `# Shield

A wooden or metal shield carried in one hand. Greatly improves your ability to block incoming attacks.

## Properties
- **Requires one free hand**
- **Can be used to bash (1d4 damage)**

## Tactical Use
Essential for tanks and front-line fighters who want to absorb enemy attacks.`,
    stats: {
      itemType: "armor",
      defense: 1,
      properties: ["One-Handed"],
      weight: 6,
      value: 10
    },
    tags: ["armor", "shield", "defense"],
    relatedEntries: ["class-herald", "rule-defense"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  // CONSUMABLES
  {
    id: "item-healing-potion",
    slug: "healing-potion",
    title: "Healing Potion",
    type: "item",
    category: "Items",
    subcategory: "Consumables",
    summary: "A magical potion that restores health when consumed.",
    content: `# Healing Potion

A small vial containing a red, shimmering liquid. When consumed, it magically heals wounds and restores vitality.

## Effect
Restores 2d6 hit points when consumed.

## Usage
Can be used on yourself as an action, or administered to an unconscious ally.

## Tactical Use
Keep one on hand for emergencies. The difference between life and death in many adventures.`,
    stats: {
      itemType: "consumable",
      properties: ["Single Use", "Heals 2d6 HP"],
      weight: 0.5,
      value: 50
    },
    tags: ["consumable", "healing", "potion", "magic"],
    relatedEntries: ["rule-healing", "rule-dying"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "item-antidote",
    slug: "antidote",
    title: "Antidote",
    type: "item",
    category: "Items",
    subcategory: "Consumables",
    summary: "A bitter concoction that neutralizes poisons.",
    content: `# Antidote

A small vial of bitter green liquid. It neutralizes most common poisons when consumed.

## Effect
Removes the Poisoned condition immediately.

## Usage
Can be consumed as an action, or administered to a poisoned ally.`,
    stats: {
      itemType: "consumable",
      properties: ["Single Use", "Cures Poison"],
      weight: 0.5,
      value: 25
    },
    tags: ["consumable", "cure", "potion"],
    relatedEntries: ["condition-poisoned"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "item-torch",
    slug: "torch",
    title: "Torch",
    type: "item",
    category: "Items",
    subcategory: "Adventuring Gear",
    summary: "A simple light source that burns for about an hour.",
    content: `# Torch

A wooden stick wrapped in oil-soaked cloth. Provides bright light in a 20-foot radius.

## Duration
Burns for approximately 1 hour.

## Secondary Use
Can be used as an improvised weapon (1d4 fire damage) but is destroyed after combat.`,
    stats: {
      itemType: "misc",
      properties: ["Light Source", "20ft radius", "1 hour duration"],
      weight: 1,
      value: 0.1
    },
    tags: ["gear", "light", "exploration"],
    relatedEntries: ["rule-exploration", "rule-darkness"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "item-rope",
    slug: "rope",
    title: "Rope (50 feet)",
    type: "item",
    category: "Items",
    subcategory: "Adventuring Gear",
    summary: "A length of sturdy hemp rope useful for climbing and restraint.",
    content: `# Rope (50 feet)

A coil of sturdy hemp rope, essential for any adventurer.

## Uses
- Climbing assistance (+2 to climbing checks)
- Tying up prisoners
- Creating tripwires
- Building makeshift bridges

## Tactical Use
Creative players find countless uses for a good rope.`,
    stats: {
      itemType: "misc",
      properties: ["50ft length", "+2 climbing"],
      weight: 10,
      value: 1
    },
    tags: ["gear", "utility", "exploration", "climbing"],
    relatedEntries: ["rule-exploration", "rule-skill-checks"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  }
];
