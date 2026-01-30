/**
 * AI Seer Assistant - Shortcodes
 * Quick reference commands for common Seer needs
 */

import type { AISeerShortcode, GameContext, ShortcodeResponse } from "./types";

// Shortcode definitions
export const SHORTCODES: AISeerShortcode[] = [
  {
    code: "combat",
    description: "Quick combat rules reference",
    example: "/combat",
    requiresContext: false,
    category: "combat",
  },
  {
    code: "order",
    description: "Show current turn order",
    example: "/order",
    requiresContext: true,
    category: "combat",
  },
  {
    code: "abilities",
    description: "List all player abilities",
    example: "/abilities",
    requiresContext: true,
    category: "utility",
  },
  {
    code: "stats",
    description: "Show all player stats",
    example: "/stats",
    requiresContext: true,
    category: "utility",
  },
  {
    code: "difficulty",
    description: "Difficulty reference chart",
    example: "/difficulty",
    requiresContext: false,
    category: "rules",
  },
  {
    code: "classes",
    description: "Class abilities reference",
    example: "/classes",
    requiresContext: false,
    category: "rules",
  },
  {
    code: "roll",
    description: "Suggest a roll for an action",
    example: "/roll pick the lock",
    requiresContext: true,
    category: "utility",
  },
  {
    code: "describe",
    description: "Generate narrative description",
    example: "/describe the ancient tomb",
    requiresContext: true,
    category: "narrative",
  },
  {
    code: "npc",
    description: "Generate a quick NPC",
    example: "/npc tavern keeper",
    requiresContext: false,
    category: "narrative",
  },
  {
    code: "loot",
    description: "Generate random loot",
    example: "/loot treasure chest",
    requiresContext: true,
    category: "utility",
  },
];

// Static templates (no context needed)
const STATIC_TEMPLATES: Record<string, string> = {
  combat: `## ⚔️ Combat Quick Reference

### Turn Order
1. Roll initiative (1D6, highest first)
2. Each combatant acts in order
3. Repeat until combat ends

### Attack
- Roll attack dice (based on primary attribute)
- Defender rolls defense (Grace)
- Attacker total > Defender total = **HIT**
- Damage = Weapon damage + (margin / 5)

### Defense Options
- **Dodge**: Roll Grace vs attack
- **Block**: Roll Might vs attack (with shield)
- **Parry**: Roll matching weapon skill

### Heroic Save
- Once per encounter
- Reroll any failed roll
- Must use immediately

### Conditions in Combat
- **Stunned**: Skip next turn
- **Poisoned**: 1 damage per round
- **Burning**: 2 damage per round
- **Frozen**: -2 to all rolls`,

  difficulty: `## 🎯 Difficulty Guidelines

| Difficulty | Target | Examples |
|------------|--------|----------|
| **Trivial** | 3-5 | Walking, talking, basic tasks |
| **Easy** | 6-8 | Climbing a ladder, picking simple locks |
| **Moderate** | 9-11 | Sneaking past guards, recalling lore |
| **Hard** | 12-14 | Leaping chasms, persuading enemies |
| **Very Hard** | 15-17 | Disarming complex traps, impossible acrobatics |
| **Legendary** | 18 | Feats of legend |

### Quick Reference
- **+3** if character has advantage
- **-3** if character has disadvantage
- Consider character abilities when setting DC`,

  classes: `## 🎭 Class Abilities Reference

| Class | Primary | Ability | Effect |
|-------|---------|---------|--------|
| **Champion** | Might | Battle Cry | Allies get +1 die on next attack |
| **Shadowblade** | Grace | Sneak Attack | Double damage vs unaware enemies |
| **Sage** | Wit | Arcane Bolt | Ignore armor, 3 damage (2/encounter) |
| **Herald** | Heart | Divine Heal | Restore 2 HP (2/encounter) |
| **Warden** | Might | Hunter's Mark | +2 dice vs marked target |
| **Trickster** | Grace | Misdirect | Enemy attacks wrong target |
| **Mystic** | Wit | Mind Reading | Learn surface thoughts |

### Class Role Summary
- **Champion**: Tank, frontline damage
- **Shadowblade**: Burst damage, scouting
- **Sage**: Ranged magic, utility
- **Herald**: Healing, buffs, support
- **Warden**: Tracking, sustained damage
- **Trickster**: Control, misdirection
- **Mystic**: Information, mind effects`,
};

// Dynamic template generators
function generateOrderTemplate(context: GameContext): string {
  if (!context.combat) {
    return "⚠️ No active combat. Start combat first to see turn order.";
  }

  const { initiativeOrder, currentTurnIndex, roundNumber } = context.combat;
  const lines = initiativeOrder.map((entry, i) => {
    const marker = i === currentTurnIndex ? " ← **CURRENT**" : "";
    return `${i + 1}. **${entry.name}** (Initiative: ${entry.initiative})${marker}`;
  });

  return `## 📋 Turn Order (Round ${roundNumber})

${lines.join("\n")}

**Enemies Remaining:** ${context.combat.enemyCombatants.filter((e) => e.currentHitPoints > 0).length}`;
}

function generateAbilitiesTemplate(context: GameContext): string {
  if (context.players.length === 0) {
    return "⚠️ No players in session.";
  }

  // Mock abilities for now - in real impl, this would come from character data
  const playerAbilities = context.players.map((p) => {
    return `### ${p.name} (${p.characterClass})
- **Primary Ability**: Class-specific power (2/encounter)
- **Secondary**: Utility skill`;
  });

  return `## ✨ Player Abilities

${playerAbilities.join("\n\n")}

_Use abilities wisely - most reset after each encounter._`;
}

function generateStatsTemplate(context: GameContext): string {
  if (context.players.length === 0) {
    return "⚠️ No players in session.";
  }

  const playerStats = context.players.map((p) => {
    const hpStatus = p.currentHP <= p.maxHP * 0.25 ? "🔴" : p.currentHP <= p.maxHP * 0.5 ? "🟡" : "🟢";
    return `**${p.name}** | ${hpStatus} HP: ${p.currentHP}/${p.maxHP} | M:${p.attributes.might} G:${p.attributes.grace} W:${p.attributes.wit} H:${p.attributes.heart}`;
  });

  return `## 📊 Party Stats

${playerStats.join("\n")}

### Status Summary
- **Total Party HP**: ${context.players.reduce((sum, p) => sum + p.currentHP, 0)} / ${context.players.reduce((sum, p) => sum + p.maxHP, 0)}
- **Connected**: ${context.players.filter((p) => p.isConnected).length} / ${context.players.length}`;
}

function generateRollSuggestion(_context: GameContext, action?: string): string {
  // context reserved for future character-aware roll suggestions
  if (!action) {
    return `## 🎲 Roll Suggestion

Tell me what the player wants to do!

Example: \`/roll pick the lock\``;
  }

  // Simple keyword matching for suggestions
  const actionLower = action.toLowerCase();
  let attribute = "wit";
  let difficulty = 10;
  let reason = "General task";

  if (actionLower.includes("lift") || actionLower.includes("break") || actionLower.includes("push") || actionLower.includes("climb")) {
    attribute = "might";
    difficulty = 11;
    reason = "Physical strength required";
  } else if (actionLower.includes("sneak") || actionLower.includes("dodge") || actionLower.includes("pick") || actionLower.includes("steal")) {
    attribute = "grace";
    difficulty = 12;
    reason = "Requires agility and finesse";
  } else if (actionLower.includes("persuade") || actionLower.includes("lie") || actionLower.includes("charm") || actionLower.includes("intimidate")) {
    attribute = "heart";
    difficulty = 11;
    reason = "Social interaction";
  } else if (actionLower.includes("know") || actionLower.includes("remember") || actionLower.includes("decipher") || actionLower.includes("solve")) {
    attribute = "wit";
    difficulty = 10;
    reason = "Mental challenge";
  }

  return `## 🎲 Suggested Roll

**Action**: "${action}"

**Recommended**: **${attribute.toUpperCase()}** check vs DC **${difficulty}**

**Reason**: ${reason}

### Alternatives
- **Easier** (DC ${difficulty - 2}): For favorable circumstances
- **Harder** (DC ${difficulty + 3}): For challenging conditions`;
}

function generateNarrativeDescription(context: GameContext, subject?: string): string {
  const location = context.currentNode?.title || "the scene";
  const descriptions = [
    "The air grows thick with anticipation...",
    "Shadows dance along the walls as if alive...",
    "A sense of ancient power fills the space...",
    "The silence here speaks louder than words...",
  ];
  const randomDesc = descriptions[Math.floor(Math.random() * descriptions.length)];

  return `## ✨ Narrative Description

**Scene**: ${location}
${subject ? `**Focus**: ${subject}` : ""}

---

${randomDesc}

*The party finds themselves at a crossroads. What they do next could change everything.*

---

### Read-Aloud Suggestion
> "${randomDesc} You sense that important choices lie ahead."`;
}

function generateNPC(role?: string): string {
  const names = ["Aldric", "Thessa", "Grimjaw", "Melody", "Bartholomew", "Raven"];
  const traits = ["gruff but kind", "mysterious and aloof", "cheerful and talkative", "nervous and secretive"];
  const wants = ["information about the heroes", "to sell rare goods", "help with a problem", "to warn about danger"];

  const name = names[Math.floor(Math.random() * names.length)];
  const trait = traits[Math.floor(Math.random() * traits.length)];
  const want = wants[Math.floor(Math.random() * wants.length)];

  return `## 🎭 Quick NPC

**Name**: ${name}
**Role**: ${role || "Local resident"}
**Personality**: ${trait}
**Motivation**: ${want}

### Quick Lines
- *"Ah, travelers! Just what I was hoping for..."*
- *"Times are strange here. You'd do well to be careful."*
- *"Perhaps we can help each other..."*

### Secrets (Seer Only)
- Knows more than they let on
- Has connections to local power structure`;
}

function generateLoot(_context: GameContext, container?: string): string {
  // context reserved for future party-level-aware loot generation
  const commonItems = ["10 gold coins", "healing potion", "torch", "rope (50ft)", "rations (3 days)"];
  const uncommonItems = ["silver dagger", "potion of strength", "enchanted lantern", "map fragment"];
  const rareItems = ["magical amulet", "ancient tome", "blessed sword", "bag of holding"];

  // Generate 2-4 items
  const numItems = 2 + Math.floor(Math.random() * 3);
  const items: string[] = [];

  for (let i = 0; i < numItems; i++) {
    const roll = Math.random();
    if (roll < 0.6) {
      items.push(commonItems[Math.floor(Math.random() * commonItems.length)]);
    } else if (roll < 0.9) {
      items.push(uncommonItems[Math.floor(Math.random() * uncommonItems.length)]);
    } else {
      items.push(rareItems[Math.floor(Math.random() * rareItems.length)]);
    }
  }

  return `## 💎 Loot Generated

**Source**: ${container || "Unknown container"}

### Contents
${items.map((item) => `- ${item}`).join("\n")}

### Distribution
Award to party or let players decide allocation.

*Tip: Consider the scene context when describing how items are found.*`;
}

/**
 * Execute a shortcode and return formatted response
 */
export function executeShortcode(
  code: string,
  context: GameContext | null,
  params?: Record<string, string>
): ShortcodeResponse {
  const shortcode = SHORTCODES.find((s) => s.code === code);

  if (!shortcode) {
    return {
      formatted: `⚠️ Unknown shortcode: /${code}\n\nAvailable: ${SHORTCODES.map((s) => `/${s.code}`).join(", ")}`,
    };
  }

  // Check if context is required
  if (shortcode.requiresContext && !context) {
    return {
      formatted: `⚠️ The /${code} command requires an active session context.`,
    };
  }

  // Handle static templates
  if (STATIC_TEMPLATES[code]) {
    return {
      formatted: STATIC_TEMPLATES[code],
      raw: { type: "static", code },
    };
  }

  // Handle dynamic templates
  switch (code) {
    case "order":
      return { formatted: generateOrderTemplate(context!) };
    case "abilities":
      return { formatted: generateAbilitiesTemplate(context!) };
    case "stats":
      return { formatted: generateStatsTemplate(context!) };
    case "roll":
      return {
        formatted: generateRollSuggestion(context!, params?.action),
        raw: { type: "roll_suggestion", action: params?.action },
      };
    case "describe":
      return { formatted: generateNarrativeDescription(context!, params?.subject) };
    case "npc":
      return { formatted: generateNPC(params?.role) };
    case "loot":
      return {
        formatted: generateLoot(context!, params?.container),
        raw: { type: "loot" },
      };
    default:
      return { formatted: `⚠️ Shortcode /${code} is defined but not implemented.` };
  }
}

/**
 * Get all available shortcodes
 */
export function getShortcodes(): AISeerShortcode[] {
  return SHORTCODES;
}

/**
 * Check if input is a shortcode command
 */
export function parseShortcode(input: string): { code: string; params: Record<string, string> } | null {
  const trimmed = input.trim();

  // Must start with /
  if (!trimmed.startsWith("/")) {
    return null;
  }

  // Parse code and rest
  const match = trimmed.match(/^\/(\w+)\s*(.*)?$/);
  if (!match) {
    return null;
  }

  const [, code, rest] = match;

  // Basic param extraction
  const params: Record<string, string> = {};
  if (rest) {
    // For commands like /roll pick the lock, the rest is the action
    if (code === "roll") {
      params.action = rest;
    } else if (code === "describe") {
      params.subject = rest;
    } else if (code === "npc") {
      params.role = rest;
    } else if (code === "loot") {
      params.container = rest;
    }
  }

  return { code, params };
}
