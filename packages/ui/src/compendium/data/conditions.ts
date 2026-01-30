/**
 * SPARC Condition Data
 * 
 * All conditions and status effects in SPARC RPG.
 */

import type { ConditionEntry } from "../types";

export const CONDITIONS: ConditionEntry[] = [
  {
    id: "condition-blinded",
    slug: "blinded",
    title: "Blinded",
    type: "condition",
    category: "Conditions",
    subcategory: "Sensory",
    summary: "Cannot see. Attacks have disadvantage.",
    content: `# Blinded

The creature cannot see and fails any ability check that requires sight.

## Effects
- Attack rolls have disadvantage
- Attacks against the creature have advantage
- Cannot use abilities that require sight

## Common Causes
- Darkness spell
- Flash bombs
- Eye injuries
- Some monster abilities

## Removal
- Restore vision (light, healing eye damage)
- End of spell/effect duration
- Greater healing magic`,
    stats: {
      duration: "Varies",
      effects: [
        "Disadvantage on attack rolls",
        "Attacks against you have advantage",
        "Auto-fail sight-based checks"
      ],
      removedBy: ["Restore vision", "End of effect", "Healing magic"]
    },
    tags: ["condition", "debuff", "sensory", "combat"],
    relatedEntries: ["condition-deafened", "rule-advantage"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "condition-charmed",
    slug: "charmed",
    title: "Charmed",
    type: "condition",
    category: "Conditions",
    subcategory: "Mental",
    summary: "Magically compelled to view someone favorably.",
    content: `# Charmed

The creature is magically compelled to view the charmer as a friendly acquaintance.

## Effects
- Cannot attack or target the charmer with harmful effects
- The charmer has advantage on social checks against the creature

## Important Notes
- The creature knows it was charmed once the effect ends
- Does NOT control the creature's actions
- Creature can still attack the charmer's allies

## Common Causes
- Charm Person spell
- Certain fey creatures
- Some magical items`,
    stats: {
      duration: "Varies (usually 1 hour or until damaged)",
      effects: [
        "Cannot harm the charmer",
        "Charmer has social advantage"
      ],
      removedBy: ["Taking damage from charmer", "End of duration", "Dispel magic"]
    },
    tags: ["condition", "debuff", "mental", "social"],
    relatedEntries: ["condition-frightened", "rule-social-encounters"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "condition-deafened",
    slug: "deafened",
    title: "Deafened",
    type: "condition",
    category: "Conditions",
    subcategory: "Sensory",
    summary: "Cannot hear. Fails hearing-based checks.",
    content: `# Deafened

The creature cannot hear and automatically fails any ability check that requires hearing.

## Effects
- Cannot hear sounds or verbal components
- Auto-fail hearing-based checks
- May not hear allies' warnings

## Common Causes
- Thunderwave spell
- Loud explosions
- Certain monster abilities

## Removal
- Restore hearing
- End of spell/effect duration
- Lesser restoration or similar magic`,
    stats: {
      duration: "Varies",
      effects: [
        "Cannot hear",
        "Auto-fail hearing-based checks"
      ],
      removedBy: ["Restore hearing", "End of effect", "Lesser restoration"]
    },
    tags: ["condition", "debuff", "sensory"],
    relatedEntries: ["condition-blinded"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "condition-frightened",
    slug: "frightened",
    title: "Frightened",
    type: "condition",
    category: "Conditions",
    subcategory: "Mental",
    summary: "Overwhelmed by fear. Disadvantage on attacks.",
    content: `# Frightened

The creature is paralyzed by fear of a specific source.

## Effects
- Disadvantage on ability checks and attacks while the source is visible
- Cannot willingly move closer to the source of fear
- May freeze in place (Seer discretion)

## Common Causes
- Dragon's Frightful Presence
- Fear spells
- Terrifying monster appearances
- Intimidation (extreme success)

## Removal
- Source no longer visible
- End of effect duration
- Heroic Save (in some cases)
- Calming magic`,
    stats: {
      duration: "Varies (while source visible or effect duration)",
      effects: [
        "Disadvantage on checks and attacks",
        "Cannot approach the source"
      ],
      removedBy: ["Source not visible", "End of duration", "Calm Emotions spell"]
    },
    tags: ["condition", "debuff", "mental", "combat"],
    relatedEntries: ["monster-dragon-young", "ability-heroic-save"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "condition-grappled",
    slug: "grappled",
    title: "Grappled",
    type: "condition",
    category: "Conditions",
    subcategory: "Physical",
    summary: "Held by another creature. Speed is 0.",
    content: `# Grappled

The creature is being physically restrained by another creature.

## Effects
- Speed becomes 0
- Cannot benefit from bonuses to speed
- Can still attack and use abilities

## Escaping
On your turn, you can attempt to escape:
- Make a Might or Grace check vs the grappler's Might
- Success ends the condition

## Common Causes
- Creature grapple attacks
- Nets and restraints
- Certain monster abilities (tentacles, constrict)`,
    stats: {
      duration: "Until escaped or grappler lets go",
      effects: [
        "Speed becomes 0",
        "Can still attack and act"
      ],
      removedBy: ["Escape check (Might or Grace)", "Grappler releases", "Grappler incapacitated"]
    },
    tags: ["condition", "debuff", "physical", "combat"],
    relatedEntries: ["condition-restrained", "rule-combat-grappling"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "condition-incapacitated",
    slug: "incapacitated",
    title: "Incapacitated",
    type: "condition",
    category: "Conditions",
    subcategory: "Physical",
    summary: "Cannot take actions or reactions.",
    content: `# Incapacitated

The creature cannot take any actions or reactions.

## Effects
- Cannot take actions
- Cannot take reactions
- Cannot take bonus actions
- Can still move (unless also paralyzed, stunned, etc.)

## Common Causes
- Reduced to 0 HP (before death saves)
- Certain spells (Hypnotic Pattern)
- Extreme exhaustion
- Some poisons

## Notes
This is often combined with other conditions that further restrict movement.`,
    stats: {
      duration: "Varies",
      effects: [
        "Cannot take actions",
        "Cannot take reactions",
        "Cannot take bonus actions"
      ],
      removedBy: ["End of effect", "Healing (if from 0 HP)", "Dispel"]
    },
    tags: ["condition", "debuff", "physical", "severe"],
    relatedEntries: ["condition-stunned", "condition-paralyzed", "rule-dying"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "condition-paralyzed",
    slug: "paralyzed",
    title: "Paralyzed",
    type: "condition",
    category: "Conditions",
    subcategory: "Physical",
    summary: "Completely unable to move or act. Attacks auto-crit.",
    content: `# Paralyzed

The creature is completely frozen, unable to move or act.

## Effects
- Incapacitated (see condition)
- Cannot move or speak
- Automatically fails Might and Grace saves
- Attacks against the creature have advantage
- Hits from adjacent attackers are automatic critical hits

## Common Causes
- Hold Person/Monster spells
- Lich's Paralyzing Touch
- Certain poisons (ghoul toxin)
- Some monster gaze attacks

## Severe Condition
This is one of the most dangerous conditions. Prioritize removing it.`,
    stats: {
      duration: "Varies (often save ends)",
      effects: [
        "Cannot move or speak",
        "Auto-fail Might/Grace saves",
        "Attacks have advantage",
        "Adjacent hits are critical"
      ],
      removedBy: ["Successful save at end of turn", "Greater Restoration", "Dispel magic"]
    },
    tags: ["condition", "debuff", "physical", "severe", "combat"],
    relatedEntries: ["condition-incapacitated", "monster-lich"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "condition-poisoned",
    slug: "poisoned",
    title: "Poisoned",
    type: "condition",
    category: "Conditions",
    subcategory: "Physical",
    summary: "Suffering from poison. Disadvantage on attacks and checks.",
    content: `# Poisoned

The creature is suffering from the effects of poison.

## Effects
- Disadvantage on attack rolls
- Disadvantage on ability checks
- May take ongoing damage (varies by poison)

## Common Causes
- Poison weapons
- Venomous creatures (spiders, snakes)
- Poisoned food or drink
- Certain traps

## Removal
- Antidote potion
- Lesser Restoration spell
- Natural recovery (long rest, often)`,
    stats: {
      duration: "Varies by poison type",
      effects: [
        "Disadvantage on attacks",
        "Disadvantage on ability checks",
        "Possible ongoing damage"
      ],
      removedBy: ["Antidote", "Lesser Restoration", "Long rest (some poisons)"]
    },
    tags: ["condition", "debuff", "physical"],
    relatedEntries: ["item-antidote", "monster-giant-rat"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "condition-prone",
    slug: "prone",
    title: "Prone",
    type: "condition",
    category: "Conditions",
    subcategory: "Physical",
    summary: "Lying on the ground. Crawling only.",
    content: `# Prone

The creature is lying on the ground.

## Effects
- Only movement option is crawling (half speed)
- Disadvantage on attack rolls
- Melee attacks against the creature have advantage
- Ranged attacks against the creature have disadvantage

## Standing Up
Standing up costs half your movement speed. If you have 0 movement left, you cannot stand.

## Common Causes
- Being knocked down
- Tripping
- Choosing to drop prone (for cover)
- Some monster abilities`,
    stats: {
      duration: "Until you stand up",
      effects: [
        "Movement = crawl (half speed)",
        "Disadvantage on attacks",
        "Melee attacks against have advantage",
        "Ranged attacks against have disadvantage"
      ],
      removedBy: ["Stand up (costs half movement)"]
    },
    tags: ["condition", "physical", "combat", "positional"],
    relatedEntries: ["monster-wolf", "rule-movement"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "condition-restrained",
    slug: "restrained",
    title: "Restrained",
    type: "condition",
    category: "Conditions",
    subcategory: "Physical",
    summary: "Held in place. Cannot move, attacks have disadvantage.",
    content: `# Restrained

The creature is bound by magical or physical restraints.

## Effects
- Speed becomes 0
- Cannot benefit from bonuses to speed
- Attack rolls have disadvantage
- Attacks against the creature have advantage
- Disadvantage on Grace saves

## Common Causes
- Entangle spell
- Web spell
- Nets
- Chains and manacles
- Nature's Wrath ability

## Escaping
Usually requires a Might or Grace check against the effect's DC.`,
    stats: {
      duration: "Until freed",
      effects: [
        "Speed is 0",
        "Disadvantage on attacks",
        "Attacks against have advantage",
        "Disadvantage on Grace saves"
      ],
      removedBy: ["Escape check", "Destroy restraints", "Dispel (if magical)"]
    },
    tags: ["condition", "debuff", "physical", "combat"],
    relatedEntries: ["condition-grappled", "ability-natures-wrath"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "condition-stunned",
    slug: "stunned",
    title: "Stunned",
    type: "condition",
    category: "Conditions",
    subcategory: "Physical",
    summary: "Dazed and unable to act properly.",
    content: `# Stunned

The creature is dazed and reeling, unable to act coherently.

## Effects
- Incapacitated (see condition)
- Cannot move
- Can speak only falteringly
- Automatically fails Might and Grace saves
- Attacks against the creature have advantage

## Common Causes
- Massive damage
- Stunning Strike ability
- Some spells
- Creature special attacks

## Recovery
Usually ends at the end of your next turn or after a save.`,
    stats: {
      duration: "Usually until end of next turn",
      effects: [
        "Incapacitated",
        "Cannot move",
        "Auto-fail Might/Grace saves",
        "Attacks against have advantage"
      ],
      removedBy: ["End of effect duration", "Usually saves at end of turn"]
    },
    tags: ["condition", "debuff", "physical", "severe", "combat"],
    relatedEntries: ["condition-incapacitated", "condition-paralyzed"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  },
  {
    id: "condition-unconscious",
    slug: "unconscious",
    title: "Unconscious",
    type: "condition",
    category: "Conditions",
    subcategory: "Physical",
    summary: "Knocked out. Completely unaware and vulnerable.",
    content: `# Unconscious

The creature is completely knocked out and unaware of surroundings.

## Effects
- Incapacitated (see condition)
- Cannot move or speak
- Unaware of surroundings
- Drops whatever it's holding
- Falls prone
- Automatically fails Might and Grace saves
- Attacks against have advantage
- Hits from adjacent attackers are automatic critical hits

## Common Causes
- Reduced to 0 HP
- Sleep spells
- Some poisons
- Massive head trauma

## Critical Condition
An unconscious creature at 0 HP is dying and must make death saves.`,
    stats: {
      duration: "Until awakened or healed",
      effects: [
        "Incapacitated",
        "Cannot move or speak",
        "Unaware of surroundings",
        "Falls prone",
        "Auto-fail Might/Grace saves",
        "Attacks have advantage",
        "Adjacent hits are critical"
      ],
      removedBy: ["Healing (if at 0 HP)", "Taking damage (if from sleep)", "After 8 hours (natural)"]
    },
    tags: ["condition", "debuff", "physical", "severe"],
    relatedEntries: ["rule-dying", "rule-healing", "condition-paralyzed"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    version: 1
  }
];
