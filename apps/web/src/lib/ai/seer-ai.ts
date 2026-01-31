import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SeerContext {
  sessionId: string;
  adventureTitle?: string;
  currentScene?: string;
  players: Array<{
    name: string;
    characterName: string;
    className: string;
    hp: { current: number; max: number };
  }>;
  recentEvents: string[];
  combatActive?: boolean;
}

export interface SeerResponse {
  narrative: string;
  suggestions?: string[];
  npcDialogue?: { name: string; text: string };
}

export async function getSeerNarrative(
  context: SeerContext,
  prompt: string
): Promise<SeerResponse> {
  const systemPrompt = `You are the AI Seer for SPARC RPG - a helpful game master assistant.
Your role is to help craft engaging narratives, describe scenes, generate NPC dialogue, and suggest story beats.

Current Session Context:
- Adventure: ${context.adventureTitle || "Custom Adventure"}
- Scene: ${context.currentScene || "Unknown"}
- Players: ${context.players.map(p => `${p.characterName} (${p.className})`).join(", ")}
${context.combatActive ? "- Combat is currently active" : ""}

Recent Events:
${context.recentEvents.slice(-5).join("\n")}

Guidelines:
- Be descriptive but concise
- Match the tone of the adventure
- Keep responses under 200 words
- Suggest 2-3 options when appropriate
- For combat, describe action cinematically`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    max_tokens: 500,
    temperature: 0.8,
  });

  const content = response.choices[0]?.message?.content || "";
  
  return {
    narrative: content,
    suggestions: extractSuggestions(content),
  };
}

export async function generateNPCDialogue(
  npcName: string,
  npcDescription: string,
  context: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are ${npcName}, ${npcDescription}. Respond in character, keeping dialogue brief (1-3 sentences).`,
      },
      { role: "user", content: context },
    ],
    max_tokens: 150,
    temperature: 0.9,
  });

  return response.choices[0]?.message?.content || "";
}

export async function describeCombatAction(
  attacker: string,
  target: string,
  action: string,
  result: { success: boolean; damage?: number; critical?: boolean }
): Promise<string> {
  const prompt = `Describe this combat action cinematically in 1-2 sentences:
${attacker} uses ${action} against ${target}.
Result: ${result.success ? "Hit" : "Miss"}${result.critical ? " (CRITICAL!)" : ""}${result.damage ? `, ${result.damage} damage` : ""}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a combat narrator for a fantasy RPG. Be vivid but brief.",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 100,
    temperature: 0.9,
  });

  return response.choices[0]?.message?.content || "";
}

function extractSuggestions(text: string): string[] {
  const lines = text.split("\n");
  const suggestions: string[] = [];
  
  for (const line of lines) {
    if (line.match(/^[\d\-\*\•]\s*/) || line.match(/^Option/i)) {
      suggestions.push(line.replace(/^[\d\-\*\•\.]+\s*/, "").trim());
    }
  }
  
  return suggestions.slice(0, 3);
}
