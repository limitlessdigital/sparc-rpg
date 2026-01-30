/**
 * SPARC Monster Data
 * 
 * All monsters and creatures in SPARC RPG.
 */

import type { MonsterEntry } from "../types";

export const MONSTERS: MonsterEntry[] = [
  // MINIONS
  {
    id: "monster-goblin",
    slug: "goblin",
    title: "Goblin",
    type: "monster",
    category: "Monsters",
    subcategory: "Humanoids",
    summary: "Small, cunning creatures that attack in numbers.",
    content: `# Goblin

Goblins are small, green-skinned humanoids known for their cunning and cowardice. They prefer ambush tactics and rarely fight fair.

## Tactics
Goblins attack in groups, trying to overwhelm opponents with numbers. They flee when the tide turns against them.

## Habitat
Found in caves, ruins, and dark forests. Often led by hobgoblins or bugbears.

## Loot
Goblins carry small amounts of stolen goods and crude weapons.`,
    stats: {
      hitPoints: 4,
      might: 1,
      grace: 3,
      wit: 1,
      heart: 1,
      abilities: ["Nimble Escape: Can disengage as a bonus action"],
      challenge: "minion",
      loot: ["1d6 copper pieces", "Rusty Dagger"]
    },
    tags: ["humanoid", "goblinoid", "minion", "common"],
    relatedEntries: ["monster-hobgoblin", "monster-bugbear"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "monster-skeleton",
    slug: "skeleton",
    title: "Skeleton",
    type: "monster",
    category: "Monsters",
    subcategory: "Undead",
    summary: "Animated bones of the dead, driven by dark magic.",
    content: `# Skeleton

Skeletons are the animated remains of humanoid creatures, held together by necromantic magic. They follow simple commands mindlessly.

## Tactics
Skeletons fight without self-preservation, attacking until destroyed. They are immune to fear and other mental effects.

## Vulnerabilities
- Bludgeoning weapons deal +1 damage
- Holy water deals 2d6 damage

## Created By
Necromancers, cursed places, or powerful undead lords.`,
    stats: {
      hitPoints: 6,
      might: 2,
      grace: 2,
      wit: 0,
      heart: 0,
      abilities: ["Undead: Immune to poison and fear", "Vulnerable to Bludgeoning"],
      challenge: "minion",
      loot: ["Ancient Coins (1d10 silver)", "Bone Fragments"]
    },
    tags: ["undead", "minion", "common", "mindless"],
    relatedEntries: ["monster-zombie", "condition-frightened"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "monster-giant-rat",
    slug: "giant-rat",
    title: "Giant Rat",
    type: "monster",
    category: "Monsters",
    subcategory: "Beasts",
    summary: "Oversized rats found in sewers and dungeons.",
    content: `# Giant Rat

Giant rats are dog-sized rodents that infest dark, dirty places. They carry disease and attack when cornered.

## Tactics
Giant rats swarm opponents, trying to overwhelm with numbers. They flee if reduced below half their numbers.

## Disease
Bite attacks may cause Filth Fever (Heart check to resist).`,
    stats: {
      hitPoints: 3,
      might: 1,
      grace: 3,
      wit: 0,
      heart: 1,
      abilities: ["Pack Tactics: +1 to attack when ally is adjacent", "Disease Carrier"],
      challenge: "minion",
      loot: []
    },
    tags: ["beast", "minion", "vermin", "common"],
    relatedEntries: ["condition-diseased"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  // STANDARD
  {
    id: "monster-orc",
    slug: "orc",
    title: "Orc Warrior",
    type: "monster",
    category: "Monsters",
    subcategory: "Humanoids",
    summary: "Brutal warriors that live for combat.",
    content: `# Orc Warrior

Orcs are aggressive humanoids driven by a love of battle. They are stronger than humans but less disciplined.

## Tactics
Orcs charge into battle with little regard for tactics. They target the weakest-looking opponent first.

## Society
Orcs live in tribes led by the strongest warrior. They respect strength above all else.`,
    stats: {
      hitPoints: 12,
      might: 4,
      grace: 2,
      wit: 1,
      heart: 2,
      abilities: ["Aggressive: Can move up to speed toward enemy as bonus action", "Relentless: Once per encounter, survive a killing blow with 1 HP"],
      challenge: "standard",
      loot: ["2d6 silver pieces", "Battleaxe", "Hide Armor"]
    },
    tags: ["humanoid", "orc", "standard", "warrior"],
    relatedEntries: ["monster-orc-shaman", "monster-orc-chief"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "monster-wolf",
    slug: "wolf",
    title: "Wolf",
    type: "monster",
    category: "Monsters",
    subcategory: "Beasts",
    summary: "A cunning pack predator that hunts in groups.",
    content: `# Wolf

Wolves are intelligent pack hunters found in forests and mountains. They coordinate attacks and isolate prey.

## Tactics
Wolves work together, circling opponents and attacking from multiple angles. They attempt to knock prey prone.

## Pack Behavior
Wolves rarely attack unless hungry or defending territory. Dire wolves may lead normal wolf packs.`,
    stats: {
      hitPoints: 8,
      might: 2,
      grace: 3,
      wit: 1,
      heart: 2,
      abilities: ["Pack Tactics: +1 to attack when ally is adjacent", "Knockdown: On hit, target must make Might check or fall prone"],
      challenge: "standard",
      loot: ["Wolf Pelt (10gp)"]
    },
    tags: ["beast", "standard", "pack", "predator"],
    relatedEntries: ["monster-dire-wolf", "condition-prone"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "monster-zombie",
    slug: "zombie",
    title: "Zombie",
    type: "monster",
    category: "Monsters",
    subcategory: "Undead",
    summary: "Shambling corpses animated by dark magic.",
    content: `# Zombie

Zombies are corpses animated by necromantic energy. They are slow but relentless, feeling no pain.

## Tactics
Zombies shamble toward living creatures and attack mindlessly. They cannot be reasoned with or frightened.

## Undead Fortitude
When reduced to 0 HP, a zombie makes a Heart check. On success, it returns with 1 HP.`,
    stats: {
      hitPoints: 10,
      might: 3,
      grace: 1,
      wit: 0,
      heart: 2,
      abilities: ["Undead: Immune to poison and fear", "Undead Fortitude: May survive lethal damage once"],
      challenge: "standard",
      loot: ["Tattered Clothing", "Random Trinket"]
    },
    tags: ["undead", "standard", "mindless"],
    relatedEntries: ["monster-skeleton", "monster-ghoul"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  // ELITE
  {
    id: "monster-ogre",
    slug: "ogre",
    title: "Ogre",
    type: "monster",
    category: "Monsters",
    subcategory: "Giants",
    summary: "A massive brute with more strength than sense.",
    content: `# Ogre

Ogres are giant humanoids standing 9-10 feet tall. They are dim-witted but incredibly strong.

## Tactics
Ogres rely on brute strength, attacking the nearest target with their massive clubs. They don't understand complex tactics.

## Lair
Ogres live in caves or ruined structures. Their lairs are filled with the bones of their victims.`,
    stats: {
      hitPoints: 24,
      might: 5,
      grace: 1,
      wit: 1,
      heart: 2,
      abilities: ["Sweeping Blow: Attack hits all adjacent enemies", "Thick Hide: -1 damage from all non-magical attacks"],
      challenge: "elite",
      loot: ["3d6 gold pieces", "Large Sack", "Greatclub"]
    },
    tags: ["giant", "elite", "brute"],
    relatedEntries: ["monster-troll", "monster-hill-giant"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "monster-hobgoblin-captain",
    slug: "hobgoblin-captain",
    title: "Hobgoblin Captain",
    type: "monster",
    category: "Monsters",
    subcategory: "Humanoids",
    summary: "A disciplined warrior who commands goblinoid troops.",
    content: `# Hobgoblin Captain

Hobgoblin captains are elite warriors who lead goblinoid war bands. They are disciplined, tactical, and ruthless.

## Tactics
Captains coordinate their troops, using formations and combined attacks. They target spellcasters and leaders.

## Leadership
A hobgoblin captain commands respect through strength and cunning. Underlings fight harder in their presence.`,
    stats: {
      hitPoints: 20,
      might: 3,
      grace: 3,
      wit: 2,
      heart: 3,
      abilities: ["Leadership: Allies within 30ft get +1 to attacks", "Martial Advantage: Deal extra 1d6 damage if ally is adjacent to target", "Multiattack: Make two attacks per turn"],
      challenge: "elite",
      loot: ["Longsword", "Chain Mail", "2d10 gold pieces", "Battle Standard"]
    },
    tags: ["humanoid", "goblinoid", "elite", "leader"],
    relatedEntries: ["monster-goblin", "monster-hobgoblin"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  // BOSS
  {
    id: "monster-dragon-young",
    slug: "young-dragon",
    title: "Young Dragon",
    type: "monster",
    category: "Monsters",
    subcategory: "Dragons",
    summary: "A fearsome draconic predator, not yet fully grown.",
    content: `# Young Dragon

Young dragons are terrifying predators that have not yet reached their full size. They are arrogant and territorial.

## Tactics
Young dragons open combat with their breath weapon, then use flight to stay out of melee range. They target the biggest threat first.

## Breath Weapon
The dragon breathes a cone of elemental energy (type varies by dragon color). Targets must make a Grace check or take 4d6 damage.

## Dragon Colors
- **Red:** Fire breath
- **Blue:** Lightning breath
- **Green:** Poison breath
- **White:** Cold breath
- **Black:** Acid breath`,
    stats: {
      hitPoints: 40,
      might: 5,
      grace: 3,
      wit: 3,
      heart: 4,
      abilities: [
        "Flight: Can fly up to 60ft per turn",
        "Breath Weapon (Recharge 5-6): 30ft cone, 4d6 elemental damage",
        "Frightful Presence: Enemies must make Heart check or become Frightened",
        "Multiattack: Bite and two claw attacks"
      ],
      challenge: "boss",
      loot: ["Dragon Scales (valuable)", "Dragon Teeth", "100+ gold pieces", "Magical Item"]
    },
    tags: ["dragon", "boss", "flying", "elemental"],
    relatedEntries: ["condition-frightened", "rule-boss-encounters"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "monster-lich",
    slug: "lich",
    title: "Lich",
    type: "monster",
    category: "Monsters",
    subcategory: "Undead",
    summary: "An undead sorcerer who achieved immortality through dark rituals.",
    content: `# Lich

A lich is a powerful spellcaster who has used forbidden magic to bind their soul to a phylactery, achieving a form of immortality.

## Tactics
Liches fight intelligently, using powerful spells from a distance while minions engage in melee. They retreat if seriously threatened.

## Phylactery
A lich cannot truly be destroyed unless its phylactery is found and destroyed. Otherwise, it reforms in 1d10 days.

## Lair Actions
In its lair, a lich can use legendary actions to animate corpses, create illusions, or dispel magic.`,
    stats: {
      hitPoints: 50,
      might: 2,
      grace: 2,
      wit: 6,
      heart: 4,
      abilities: [
        "Spellcasting: Can cast powerful arcane spells",
        "Paralyzing Touch: Melee attack paralyzes target (Heart check to resist)",
        "Legendary Resistance (3/day): Automatically succeed on a failed save",
        "Undead: Immune to poison, disease, and fear",
        "Phylactery: Returns in 1d10 days unless phylactery destroyed"
      ],
      challenge: "boss",
      loot: ["Spellbook", "Phylactery Clues", "Powerful Magic Items", "200+ gold pieces"]
    },
    tags: ["undead", "boss", "spellcaster", "legendary"],
    relatedEntries: ["monster-skeleton", "class-sage", "rule-boss-encounters"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  }
];
