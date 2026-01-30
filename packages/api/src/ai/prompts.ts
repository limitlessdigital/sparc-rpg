/**
 * AI Seer Assistant - Prompt Engineering
 * System prompts and context building for OpenAI
 */

import type { AISeerAdviceRequest, GameContext, OpenAIConfig } from "./types";

// OpenAI Configuration
export const OPENAI_CONFIG: OpenAIConfig = {
  model: "gpt-4-turbo",
  maxTokens: 500,
  temperature: 0.7,
  topP: 1,
  frequencyPenalty: 0.3,
  presencePenalty: 0.3,
  timeout: 10000, // 10 seconds
};

// System Prompt for AI Seer
export const SYSTEM_PROMPT = `You are the AI Seer Assistant for SPARC RPG, a simplified fantasy tabletop game. Your role is to help Game Masters (called "Seers") run smooth, fun sessions.

## Your Personality
- Helpful and encouraging
- Quick and concise
- Game-focused (stay in the fantasy context)
- Never condescending

## Response Guidelines
1. Keep responses SHORT (2-3 sentences for suggestions)
2. Always suggest a specific attribute and difficulty when a roll is needed
3. Use SPARC terminology (Seer, attributes: Might/Grace/Wit/Heart)
4. Difficulty range: 3 (trivial) to 18 (nearly impossible), usually 9-14
5. Include a brief narrative hook when appropriate

## SPARC Rules Summary
- 4 Attributes: Might (STR), Grace (DEX), Wit (INT), Heart (CHA)
- Dice: D6 only, roll dice equal to attribute value (typically 2-5 dice)
- Success: Total of all dice >= difficulty
- Combat: Attack vs Defense, winner by highest total
- Heroic Save: Reroll once per encounter (any failed roll)

## Difficulty Guidelines
| DC | Level | Examples |
|---|---|---|
| 3-5 | Trivial | Basic tasks |
| 6-8 | Easy | Simple challenges |
| 9-11 | Moderate | Standard challenges |
| 12-14 | Hard | Significant challenges |
| 15-17 | Very Hard | Extreme challenges |
| 18 | Legendary | Nearly impossible |

## What NOT to do
- Don't make decisions FOR the Seer
- Don't reveal hidden adventure information
- Don't generate long monologues
- Don't contradict established game rules
- Don't give multiple options when one clear suggestion works

## Response Format
For player actions, respond with:
1. A brief suggestion (1-2 sentences)
2. ATTRIBUTE roll vs DC X (if applicable)
3. A one-sentence narrative hook (optional)

Example:
"Have them attempt to climb the slippery wall.
GRACE roll vs DC 12
As their fingers find purchase on the ancient stones, loose pebbles tumble into the darkness below..."`;

/**
 * Convert game context to a prompt-friendly format
 */
export function contextToPrompt(context: GameContext): string {
  const parts: string[] = [];

  // Current Scene
  parts.push(`## Current Scene
**Location:** ${context.currentNode.title}
**Type:** ${context.currentNode.type}
${context.currentNode.content}`);

  // Party Members
  if (context.players.length > 0) {
    const playerLines = context.players.map((p) => {
      const status = p.isConnected ? "🟢" : "🔴";
      return `- ${status} ${p.name} (${p.characterClass}): HP ${p.currentHP}/${p.maxHP}, Might ${p.attributes.might}, Grace ${p.attributes.grace}, Wit ${p.attributes.wit}, Heart ${p.attributes.heart}`;
    });
    parts.push(`## Party Members
${playerLines.join("\n")}`);
  }

  // Inventory
  if (context.inventory.length > 0) {
    const inventoryLines = context.inventory.map((i) => `- ${i.name} x${i.quantity}`);
    parts.push(`## Inventory
${inventoryLines.join("\n")}`);
  }

  // Active Combat
  if (context.combat) {
    const currentTurn = context.combat.initiativeOrder[context.combat.currentTurnIndex];
    const aliveEnemies = context.combat.enemyCombatants.filter((e) => e.currentHitPoints > 0);
    parts.push(`## Active Combat
**Round:** ${context.combat.roundNumber}
**Current Turn:** ${currentTurn?.name || "Unknown"}
**Enemies Alive:** ${aliveEnemies.length}
${aliveEnemies.map((e) => `- ${e.name}: ${e.currentHitPoints}/${e.maxHitPoints} HP`).join("\n")}`);
  }

  // Recent Events
  if (context.recentHistory.length > 0) {
    parts.push(`## Recent Events
${context.recentHistory.map((h) => `- ${h}`).slice(0, 5).join("\n")}`);
  }

  // Active Flags
  if (context.flags.length > 0) {
    parts.push(`## Active Flags
${context.flags.map((f) => `- ${f}`).join("\n")}`);
  }

  return parts.join("\n\n");
}

/**
 * Build the user prompt from the request and context
 */
export function buildUserPrompt(request: AISeerAdviceRequest, context: string): string {
  const parts: string[] = [];

  // Include context
  parts.push(context);

  // Character context if provided
  if (request.characterContext) {
    const { name, class: charClass, relevantStats } = request.characterContext;
    const statsStr = Object.entries(relevantStats)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    parts.push(`## Acting Character
**${name}** (${charClass})
Stats: ${statsStr}`);
  }

  // The actual question
  parts.push(`## Seer's Question
The player wants to: "${request.playerAction}"

Difficulty preference: ${request.difficultyPreference}`);

  // Recent history context
  if (request.recentHistory && request.recentHistory.length > 0) {
    parts.push(`## Recent Actions
${request.recentHistory.map((h) => `- ${h}`).join("\n")}`);
  }

  // Instructions
  parts.push(`Please provide:
1. A brief suggestion for how to handle this (1-2 sentences)
2. The recommended attribute check (if any) with specific difficulty
3. A one-sentence narrative hook

Keep your response concise and actionable.`);

  return parts.join("\n\n").trim();
}

/**
 * Create a simplified prompt for quick questions (no full context)
 */
export function buildQuickPrompt(question: string): string {
  return `Quick question from a SPARC RPG Seer:

"${question}"

Provide a concise, helpful answer using SPARC terminology.`;
}

/**
 * Build prompt for narrative generation
 */
export function buildNarrativePrompt(
  scene: string,
  style: "dramatic" | "mysterious" | "action" | "peaceful"
): string {
  const styleGuides = {
    dramatic: "Use vivid, emotional language. Build tension. Make moments feel significant.",
    mysterious: "Use atmospheric descriptions. Hint at secrets. Create a sense of wonder and unease.",
    action: "Use dynamic, punchy sentences. Focus on movement and energy. Keep the pace fast.",
    peaceful: "Use calm, flowing descriptions. Focus on sensory details. Create a sense of tranquility.",
  };

  return `Generate a short narrative description (2-3 sentences) for this scene in SPARC RPG:

Scene: ${scene}

Style: ${styleGuides[style]}

Write in second person ("You see...", "You feel..."). Keep it immersive and suitable for reading aloud.`;
}

/**
 * Build prompt for NPC dialogue generation
 */
export function buildNPCPrompt(
  npcDescription: string,
  situation: string,
  mood: "friendly" | "hostile" | "neutral" | "scared"
): string {
  return `Generate 2-3 short dialogue lines for this NPC in SPARC RPG:

NPC: ${npcDescription}
Situation: ${situation}
Mood: ${mood}

Keep lines brief (under 20 words each). Make them characterful and useful for roleplay.`;
}
