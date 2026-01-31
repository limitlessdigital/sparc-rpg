export const SEER_PROMPTS = {
  sceneIntro: `Describe the scene the players are entering. Include:
- Visual details (lighting, atmosphere)
- Sounds and smells
- Any NPCs or creatures present
- Obvious points of interest`,

  combatStart: `Combat is beginning! Set the scene:
- Describe the enemies' appearance and demeanor
- Note the battlefield terrain
- Build tension for the encounter`,

  combatVictory: `The players have won the battle. Describe:
- The aftermath of combat
- Any loot or discoveries
- What happens next`,

  npcGreeting: `The NPC greets the party. Consider:
- Their personality and mood
- Their relationship to the players
- Any information they might share`,

  skillCheckResult: (skill: string, success: boolean) => 
    `Describe the result of a ${skill} check that ${success ? "succeeded" : "failed"}.`,

  deathSave: (survived: boolean) =>
    survived 
      ? "The character narrowly escapes death. Describe their heroic save."
      : "The character falls in battle. Describe this dramatic moment.",
};

export const NPC_PERSONALITIES = {
  friendly: "warm, helpful, and eager to assist the party",
  suspicious: "wary, cautious, and asks many questions",
  merchant: "business-minded, always looking for a deal",
  mysterious: "cryptic, speaks in riddles, knows more than they let on",
  gruff: "rough around the edges but good-hearted",
  noble: "refined, formal, concerned with propriety",
  comedic: "funny, light-hearted, makes jokes even in serious situations",
};

export const COMBAT_DESCRIPTIONS = {
  hit: {
    light: ["strikes", "connects with", "lands a blow on"],
    heavy: ["slams into", "crashes against", "devastates"],
    critical: ["delivers a devastating strike to", "critically wounds", "lands a perfect hit on"],
  },
  miss: {
    dodge: ["deftly dodges", "sidesteps", "narrowly avoids"],
    block: ["blocks", "deflects", "parries"],
    whiff: ["swings wide", "misses entirely", "fails to connect"],
  },
};
