# PRD 06: AI Seer Assistant

> **Status**: Ready for Implementation  
> **Priority**: P1 - High  
> **Estimated Effort**: 4 days  
> **Dependencies**: 05-seer-dashboard

---

## Overview

The AI Seer Assistant provides intelligent, context-aware help to Game Masters during active sessions. It handles unexpected player actions, provides rule clarifications, suggests dice difficulties, and offers narrative hooks—all while maintaining game flow and immersion.

### Goals
- Reduce Seer anxiety about handling unexpected situations
- Provide instant rule clarifications without manual lookup
- Suggest appropriate dice checks and difficulties
- Generate immersive narrative hooks on demand
- Respond in under 3 seconds

### Non-Goals
- Replacing the Seer's creative decisions
- Generating complete adventure content
- Playing as an autonomous GM
- Voice synthesis integration

---

## User Stories

### US-01: Improvisation Help
**As a** Seer  
**I want to** get suggestions for unexpected player actions  
**So that** I can keep the game flowing smoothly

**Acceptance Criteria:**
- [ ] Input player's intended action
- [ ] Receive suggested approach within 3 seconds
- [ ] Get recommended skill check with difficulty
- [ ] Receive narrative hook for success/failure
- [ ] Suggestions respect current scene context

### US-02: Rule Clarification
**As a** Seer  
**I want to** quickly look up game rules  
**So that** I don't slow down gameplay

**Acceptance Criteria:**
- [ ] Ask natural language rule questions
- [ ] Receive accurate, concise answers
- [ ] Get formatted rules with examples
- [ ] Common rules available via shortcodes
- [ ] Answers cite SPARC rulebook sections

### US-03: Difficulty Recommendation
**As a** Seer  
**I want to** get appropriate difficulty numbers  
**So that** challenges are fair and consistent

**Acceptance Criteria:**
- [ ] Describe the action being attempted
- [ ] Receive recommended difficulty (3-18)
- [ ] See reasoning for the difficulty
- [ ] Get both easy/hard alternatives
- [ ] Considers character abilities

### US-04: Narrative Generation
**As a** Seer  
**I want to** get narrative descriptions  
**So that** I can enhance story moments

**Acceptance Criteria:**
- [ ] Request narrative for current scene
- [ ] Receive immersive descriptions
- [ ] Style matches adventure tone
- [ ] Options for success/failure outcomes
- [ ] Quick copy-to-clipboard

### US-05: Shortcode Commands
**As a** Seer  
**I want to** use quick commands for common needs  
**So that** I can get help instantly

**Acceptance Criteria:**
- [ ] Type shortcode (e.g., "combat", "order")
- [ ] Receive formatted, contextual response
- [ ] Shortcodes work without full sentences
- [ ] List of available shortcodes visible
- [ ] Custom shortcodes possible (future)

### US-06: Context Awareness
**As a** Seer  
**I want to** AI to understand current game state  
**So that** suggestions are relevant

**Acceptance Criteria:**
- [ ] AI knows current node/scene
- [ ] AI knows player characters and stats
- [ ] AI knows recent game history
- [ ] AI knows combat state if active
- [ ] Responses adapt to context

---

## Technical Specification

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              SEER DASHBOARD                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  AI Seer Input: [______________________________] [Ask]          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           BACKEND API                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │ Context Builder │  │ Prompt Engine   │  │ Response Cache  │        │
│  │ - Session state │  │ - Templates     │  │ - Common Q&A    │        │
│  │ - Node content  │  │ - Shortcodes    │  │ - TTL: 1 hour   │        │
│  │ - Player chars  │  │ - Formatting    │  │ - Invalidation  │        │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘        │
│           │                    │                    │                  │
│           └────────────────────┼────────────────────┘                  │
│                                │                                        │
│                                ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      OPENAI API                                  │   │
│  │  Model: gpt-4-turbo  │  Max tokens: 500  │  Temp: 0.7           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### API Endpoints

#### POST /api/v1/ai/advice

Get contextual advice for game situations.

**Request:**
```typescript
interface AISeerAdviceRequest {
  sessionId: string;
  sceneContext: string;           // Current scene description
  playerAction: string;           // What player wants to do
  difficultyPreference: 'easy' | 'medium' | 'hard';
  recentHistory?: string[];       // Last 3-5 actions
  characterContext?: {
    name: string;
    class: string;
    relevantStats: Record<string, number>;
  };
}
```

**Response (200 OK):**
```typescript
interface AISeerAdviceResponse {
  success: true;
  data: {
    id: string;
    requestId: string;
    
    // Main response
    suggestion: string;
    ruleClarification?: string;
    narrativeHook?: string;
    
    // Structured data
    suggestedRoll?: {
      attribute: Attribute;
      difficulty: number;
      reason: string;
    };
    
    // Meta
    confidence: number;           // 0-1
    responseTimeMs: number;
    cached: boolean;
    modelVersion: string;
  };
}
```

**Error Responses:**
- `400 Bad Request`: Invalid parameters
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not session Seer
- `429 Too Many Requests`: Rate limit exceeded
- `503 Service Unavailable`: OpenAI API unavailable

#### GET /api/v1/ai/shortcodes

List available shortcodes.

**Response (200 OK):**
```typescript
interface ShortcodesResponse {
  success: true;
  data: AISeerShortcode[];
}

interface AISeerShortcode {
  code: string;
  description: string;
  example: string;
  requiresContext: boolean;
}
```

#### POST /api/v1/ai/shortcode/:code

Execute a shortcode command.

**Request:**
```typescript
interface ShortcodeRequest {
  sessionId: string;
  params?: Record<string, string>;
}
```

**Response (200 OK):**
```typescript
interface ShortcodeResponse {
  success: true;
  data: {
    formatted: string;            // Ready-to-display response
    raw?: Record<string, unknown>; // Structured data if applicable
  };
}
```

### Shortcode Definitions

```typescript
const SHORTCODES: AISeerShortcode[] = [
  {
    code: 'combat',
    description: 'Quick combat rules reference',
    example: 'combat',
    requiresContext: false,
    template: `
## Combat Quick Reference

### Turn Order
1. Roll initiative (1D6, highest first)
2. Each combatant acts in order
3. Repeat until combat ends

### Attack
- Roll attack dice (based on primary attribute)
- Defender rolls defense (Grace)
- Attacker total > Defender total = HIT
- Damage = Weapon damage + (margin / 5)

### Heroic Save
- Once per encounter
- Reroll any failed roll
- Must use immediately
    `,
  },
  
  {
    code: 'order',
    description: 'Show current turn order',
    example: 'order',
    requiresContext: true,
    template: (context) => {
      if (!context.combat) return 'No active combat';
      return context.combat.initiativeOrder
        .map((e, i) => `${i + 1}. ${e.name} (${e.initiative})${i === context.combat.currentTurnIndex ? ' ← Current' : ''}`)
        .join('\n');
    },
  },
  
  {
    code: 'abilities',
    description: 'List all player abilities',
    example: 'abilities',
    requiresContext: true,
    template: (context) => {
      return context.players
        .map(p => `**${p.character.name}** (${p.character.characterClass})\n` +
          p.character.specialAbilities
            .map(a => `- ${a.name}: ${a.description} [${a.currentUses}/${a.usesPerEncounter}]`)
            .join('\n'))
        .join('\n\n');
    },
  },
  
  {
    code: 'stats',
    description: 'Show all player stats',
    example: 'stats',
    requiresContext: true,
    template: (context) => {
      return context.players
        .map(p => {
          const c = p.character;
          return `**${c.name}** | HP: ${c.currentHitPoints}/${c.maxHitPoints} | ` +
            `M:${c.attributes.might} G:${c.attributes.grace} W:${c.attributes.wit} H:${c.attributes.heart}`;
        })
        .join('\n');
    },
  },
  
  {
    code: 'difficulty',
    description: 'Difficulty reference chart',
    example: 'difficulty',
    requiresContext: false,
    template: `
## Difficulty Guidelines

| Difficulty | Description | Examples |
|------------|-------------|----------|
| 3-5 | Trivial | Walking, talking, basic tasks |
| 6-8 | Easy | Climbing a ladder, picking simple locks |
| 9-11 | Moderate | Sneaking past guards, recalling lore |
| 12-14 | Hard | Leaping chasms, persuading enemies |
| 15-17 | Very Hard | Disarming complex traps, impossible acrobatics |
| 18 | Nearly Impossible | Legendary feats |
    `,
  },
  
  {
    code: 'classes',
    description: 'Class abilities reference',
    example: 'classes',
    requiresContext: false,
    template: `
## Class Abilities

| Class | Ability | Effect |
|-------|---------|--------|
| Warrior | Battle Cry | Allies get +1 die on next attack |
| Rogue | Sneak Attack | Double damage vs unaware enemies |
| Wizard | Arcane Bolt | Ignore armor, 3 damage (2/encounter) |
| Cleric | Divine Heal | Restore 2 HP (2/encounter) |
| Ranger | Hunter's Mark | +2 dice vs marked target |
| Paladin | Smite Evil | +3 damage vs undead/demons |
| Necromancer | Raise Dead | Animate defeated enemy |
    `,
  },
];
```

### Context Building

```typescript
interface GameContext {
  session: Session;
  currentNode: AdventureNode;
  players: Array<{
    character: Character;
    isConnected: boolean;
  }>;
  combat?: CombatState;
  recentHistory: string[];
  inventory: InventoryItem[];
  flags: string[];
}

function buildGameContext(sessionId: string): Promise<GameContext> {
  // Fetch all relevant data for AI context
  const session = await getSession(sessionId);
  const currentNode = await getNode(session.currentNodeId);
  const players = await getSessionPlayers(sessionId);
  const combat = await getActiveCombat(sessionId);
  const history = await getRecentHistory(sessionId, 5);
  
  return {
    session,
    currentNode,
    players: players.map(p => ({
      character: p.character,
      isConnected: p.isConnected,
    })),
    combat: combat ?? undefined,
    recentHistory: history.map(h => h.content),
    inventory: session.gameState.inventory,
    flags: session.gameState.flags,
  };
}

function contextToPrompt(context: GameContext): string {
  return `
## Current Scene
**Location:** ${context.currentNode.title}
${context.currentNode.content}

## Party Members
${context.players.map(p => {
  const c = p.character;
  return `- ${c.name} (${c.characterClass}): HP ${c.currentHitPoints}/${c.maxHitPoints}, ` +
    `Might ${c.attributes.might}, Grace ${c.attributes.grace}, ` +
    `Wit ${c.attributes.wit}, Heart ${c.attributes.heart}`;
}).join('\n')}

## Inventory
${context.inventory.map(i => `- ${i.name} x${i.quantity}`).join('\n') || 'Empty'}

${context.combat ? `
## Active Combat
Round ${context.combat.roundNumber}
Turn: ${context.combat.initiativeOrder[context.combat.currentTurnIndex].name}
Enemies: ${context.combat.enemyCombatants.filter(e => e.currentHitPoints > 0).length} remaining
` : ''}

## Recent Events
${context.recentHistory.map(h => `- ${h}`).join('\n')}
`.trim();
}
```

### Prompt Engineering

```typescript
const SYSTEM_PROMPT = `
You are the AI Seer Assistant for SPARC RPG, a simplified fantasy tabletop game. Your role is to help Game Masters (called "Seers") run smooth, fun sessions.

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
- Dice: D6 only, roll dice equal to attribute value
- Success: Total >= difficulty
- Combat: Attack vs Defense, winner by highest total
- Heroic Save: Reroll once per encounter

## What NOT to do
- Don't make decisions FOR the Seer
- Don't reveal hidden adventure information
- Don't generate long monologues
- Don't contradict established game rules
`;

function buildUserPrompt(request: AISeerAdviceRequest, context: string): string {
  return `
${context}

## Seer's Question
The player wants to: "${request.playerAction}"

Preferred difficulty level: ${request.difficultyPreference}

Please provide:
1. A brief suggestion for how to handle this
2. The recommended attribute check (if any) with specific difficulty
3. A one-sentence narrative hook

Keep your response concise and actionable.
`.trim();
}
```

### Response Parsing

```typescript
interface ParsedAIResponse {
  suggestion: string;
  suggestedRoll?: {
    attribute: Attribute;
    difficulty: number;
    reason: string;
  };
  narrativeHook?: string;
  ruleClarification?: string;
}

function parseAIResponse(raw: string): ParsedAIResponse {
  const lines = raw.split('\n').filter(l => l.trim());
  
  // Extract suggestion (first paragraph or until roll)
  let suggestion = '';
  let idx = 0;
  while (idx < lines.length && !lines[idx].toLowerCase().includes('roll')) {
    suggestion += lines[idx] + ' ';
    idx++;
  }
  
  // Extract roll info if present
  let suggestedRoll: ParsedAIResponse['suggestedRoll'] = undefined;
  const rollMatch = raw.match(/(might|grace|wit|heart)\s+(?:check|roll)?\s*(?:vs|against)?\s*(?:difficulty)?\s*(\d+)/i);
  if (rollMatch) {
    suggestedRoll = {
      attribute: rollMatch[1].toLowerCase() as Attribute,
      difficulty: parseInt(rollMatch[2]),
      reason: extractRollReason(raw, rollMatch.index!),
    };
  }
  
  // Extract narrative hook if present
  const narrativeMatch = raw.match(/narrative:?\s*["']?(.+?)["']?$/im) ||
                         raw.match(/["'](.+?)["']\s*$/);
  const narrativeHook = narrativeMatch?.[1];
  
  return {
    suggestion: suggestion.trim() || raw,
    suggestedRoll,
    narrativeHook,
  };
}
```

### Caching Strategy

```typescript
interface CacheConfig {
  shortcodesTTL: number;      // 1 hour - static content
  rulesQueryTTL: number;      // 30 minutes - rule lookups
  contextualTTL: number;      // 5 minutes - context-aware responses
}

const CACHE_CONFIG: CacheConfig = {
  shortcodesTTL: 60 * 60 * 1000,
  rulesQueryTTL: 30 * 60 * 1000,
  contextualTTL: 5 * 60 * 1000,
};

class AIResponseCache {
  private cache: Map<string, { response: AISeerResponse; expiry: number }> = new Map();
  
  getCacheKey(request: AISeerAdviceRequest): string {
    // Static queries (rules) use simpler key
    if (this.isRulesQuery(request.playerAction)) {
      return `rules:${normalizeQuery(request.playerAction)}`;
    }
    
    // Contextual queries include session state
    return `ctx:${request.sessionId}:${request.playerAction}:${request.sceneContext.substring(0, 50)}`;
  }
  
  isRulesQuery(query: string): boolean {
    const rulesKeywords = ['how does', 'what is', 'explain', 'rules for', 'how do i'];
    return rulesKeywords.some(k => query.toLowerCase().includes(k));
  }
  
  get(key: string): AISeerResponse | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    return cached.response;
  }
  
  set(key: string, response: AISeerResponse, isRulesQuery: boolean): void {
    const ttl = isRulesQuery ? CACHE_CONFIG.rulesQueryTTL : CACHE_CONFIG.contextualTTL;
    this.cache.set(key, {
      response: { ...response, cached: true },
      expiry: Date.now() + ttl,
    });
  }
}
```

### Rate Limiting

```typescript
interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  burstLimit: number;
}

const RATE_LIMITS: RateLimitConfig = {
  requestsPerMinute: 10,
  requestsPerHour: 100,
  burstLimit: 5,  // Max requests in 10 seconds
};

// Redis-backed rate limiter
async function checkRateLimit(userId: string): Promise<{ allowed: boolean; retryAfterMs?: number }> {
  const now = Date.now();
  const minuteKey = `ratelimit:${userId}:minute:${Math.floor(now / 60000)}`;
  const hourKey = `ratelimit:${userId}:hour:${Math.floor(now / 3600000)}`;
  const burstKey = `ratelimit:${userId}:burst`;
  
  const [minuteCount, hourCount, burstCount] = await Promise.all([
    redis.incr(minuteKey),
    redis.incr(hourKey),
    redis.incr(burstKey),
  ]);
  
  // Set expiries on first increment
  if (minuteCount === 1) await redis.expire(minuteKey, 60);
  if (hourCount === 1) await redis.expire(hourKey, 3600);
  if (burstCount === 1) await redis.expire(burstKey, 10);
  
  if (burstCount > RATE_LIMITS.burstLimit) {
    return { allowed: false, retryAfterMs: 10000 };
  }
  if (minuteCount > RATE_LIMITS.requestsPerMinute) {
    return { allowed: false, retryAfterMs: 60000 };
  }
  if (hourCount > RATE_LIMITS.requestsPerHour) {
    return { allowed: false, retryAfterMs: 3600000 };
  }
  
  return { allowed: true };
}
```

### Fallback Responses

```typescript
const FALLBACK_RESPONSES: Record<string, string> = {
  default: "I'm having trouble connecting right now. As a general rule: if a player wants to attempt something reasonable, have them roll their most relevant attribute against a difficulty of 10-12.",
  
  combat: "For combat: each combatant rolls their attack dice vs the defender's Grace. Winner is the higher total. Damage equals the attacker's weapon damage.",
  
  rules: "The SPARC rules are: roll D6s equal to your attribute, try to beat the difficulty number. Heroic Save lets you reroll once per encounter.",
  
  difficulty: "Standard difficulties: Easy (6-8), Moderate (9-11), Hard (12-14), Very Hard (15-17). Adjust based on how dramatically you want success to matter.",
};

function getFallbackResponse(request: AISeerAdviceRequest): AISeerResponse {
  const query = request.playerAction.toLowerCase();
  
  let fallback = FALLBACK_RESPONSES.default;
  if (query.includes('combat') || query.includes('attack') || query.includes('fight')) {
    fallback = FALLBACK_RESPONSES.combat;
  } else if (query.includes('rule') || query.includes('how')) {
    fallback = FALLBACK_RESPONSES.rules;
  } else if (query.includes('difficulty') || query.includes('dc')) {
    fallback = FALLBACK_RESPONSES.difficulty;
  }
  
  return {
    id: generateId(),
    requestId: generateId(),
    suggestion: fallback,
    confidence: 0.5,
    responseTimeMs: 0,
    cached: false,
    modelVersion: 'fallback',
  };
}
```

### Error Handling

```typescript
enum AIErrorCode {
  OPENAI_UNAVAILABLE = 'AI_001',
  RATE_LIMITED = 'AI_002',
  CONTEXT_TOO_LARGE = 'AI_003',
  INVALID_REQUEST = 'AI_004',
  TIMEOUT = 'AI_005',
  NOT_SEER = 'AI_006',
}

const aiErrors: Record<AIErrorCode, { status: number; message: string }> = {
  [AIErrorCode.OPENAI_UNAVAILABLE]: {
    status: 503,
    message: 'AI service temporarily unavailable',
  },
  [AIErrorCode.RATE_LIMITED]: {
    status: 429,
    message: 'Too many requests. Please wait before asking again.',
  },
  [AIErrorCode.CONTEXT_TOO_LARGE]: {
    status: 400,
    message: 'Game context too large for processing',
  },
  [AIErrorCode.INVALID_REQUEST]: {
    status: 400,
    message: 'Invalid AI request',
  },
  [AIErrorCode.TIMEOUT]: {
    status: 504,
    message: 'AI response took too long',
  },
  [AIErrorCode.NOT_SEER]: {
    status: 403,
    message: 'Only the Seer can use AI assistance',
  },
};
```

---

## Testing Requirements

### Unit Tests

```typescript
describe('AISeerService', () => {
  describe('buildGameContext', () => {
    it('should include all player characters', async () => {
      const context = await buildGameContext(session.id);
      
      expect(context.players).toHaveLength(3);
      expect(context.players[0].character.name).toBeDefined();
    });

    it('should include combat state when active', async () => {
      await startCombat(session.id, combatNode.id);
      const context = await buildGameContext(session.id);
      
      expect(context.combat).toBeDefined();
      expect(context.combat?.initiativeOrder).toBeDefined();
    });
  });

  describe('parseAIResponse', () => {
    it('should extract suggested roll', () => {
      const raw = 'Have them make a Wit roll against difficulty 12 to decipher the runes.';
      const parsed = parseAIResponse(raw);
      
      expect(parsed.suggestedRoll).toEqual({
        attribute: 'wit',
        difficulty: 12,
        reason: expect.any(String),
      });
    });

    it('should extract narrative hook', () => {
      const raw = 'Suggestion here. Narrative: "The ancient symbols begin to glow..."';
      const parsed = parseAIResponse(raw);
      
      expect(parsed.narrativeHook).toBe('The ancient symbols begin to glow...');
    });
  });

  describe('cache', () => {
    it('should cache rules queries with longer TTL', async () => {
      const request = { playerAction: 'How does combat work?', ...baseRequest };
      
      await getAIAdvice(request);
      const cached = await getAIAdvice(request);
      
      expect(cached.cached).toBe(true);
    });

    it('should not cache contextual queries across sessions', async () => {
      const request1 = { sessionId: 'a', playerAction: 'What should happen?', ...baseRequest };
      const request2 = { sessionId: 'b', playerAction: 'What should happen?', ...baseRequest };
      
      await getAIAdvice(request1);
      const result2 = await getAIAdvice(request2);
      
      expect(result2.cached).toBe(false);
    });
  });

  describe('shortcodes', () => {
    it('should return formatted combat rules', async () => {
      const result = await executeShortcode('combat', session.id);
      
      expect(result.formatted).toContain('Turn Order');
      expect(result.formatted).toContain('Heroic Save');
    });

    it('should include contextual turn order', async () => {
      await startCombat(session.id, combatNode.id);
      const result = await executeShortcode('order', session.id);
      
      expect(result.formatted).toContain('← Current');
    });
  });

  describe('rate limiting', () => {
    it('should block after burst limit', async () => {
      for (let i = 0; i < RATE_LIMITS.burstLimit; i++) {
        const result = await checkRateLimit(user.id);
        expect(result.allowed).toBe(true);
      }
      
      const blocked = await checkRateLimit(user.id);
      expect(blocked.allowed).toBe(false);
      expect(blocked.retryAfterMs).toBeGreaterThan(0);
    });
  });
});
```

### Integration Tests

```typescript
describe('AI API', () => {
  describe('POST /api/v1/ai/advice', () => {
    it('should return advice for valid request', async () => {
      const response = await request(app)
        .post('/api/v1/ai/advice')
        .set('Authorization', `Bearer ${seerToken}`)
        .send({
          sessionId: session.id,
          sceneContext: 'In a dark forest clearing',
          playerAction: 'I want to befriend the wolf',
          difficultyPreference: 'medium',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.suggestion).toBeDefined();
      expect(response.body.data.responseTimeMs).toBeLessThan(3000);
    });

    it('should reject non-Seer requests', async () => {
      const response = await request(app)
        .post('/api/v1/ai/advice')
        .set('Authorization', `Bearer ${playerToken}`)
        .send({
          sessionId: session.id,
          sceneContext: 'Test',
          playerAction: 'Test',
          difficultyPreference: 'medium',
        });

      expect(response.status).toBe(403);
    });

    it('should return cached response when available', async () => {
      // First request
      await request(app)
        .post('/api/v1/ai/advice')
        .set('Authorization', `Bearer ${seerToken}`)
        .send(rulesRequest);

      // Second identical request
      const response = await request(app)
        .post('/api/v1/ai/advice')
        .set('Authorization', `Bearer ${seerToken}`)
        .send(rulesRequest);

      expect(response.body.data.cached).toBe(true);
    });

    it('should fallback when OpenAI unavailable', async () => {
      mockOpenAIFailure();

      const response = await request(app)
        .post('/api/v1/ai/advice')
        .set('Authorization', `Bearer ${seerToken}`)
        .send(validRequest);

      expect(response.status).toBe(200);
      expect(response.body.data.modelVersion).toBe('fallback');
    });
  });

  describe('POST /api/v1/ai/shortcode/:code', () => {
    it('should execute static shortcode', async () => {
      const response = await request(app)
        .post('/api/v1/ai/shortcode/combat')
        .set('Authorization', `Bearer ${seerToken}`)
        .send({ sessionId: session.id });

      expect(response.status).toBe(200);
      expect(response.body.data.formatted).toContain('Turn Order');
    });

    it('should execute contextual shortcode', async () => {
      await startCombat();

      const response = await request(app)
        .post('/api/v1/ai/shortcode/order')
        .set('Authorization', `Bearer ${seerToken}`)
        .send({ sessionId: session.id });

      expect(response.status).toBe(200);
      expect(response.body.data.formatted).toContain('Current');
    });
  });
});
```

---

## Implementation Checklist

### Backend
- [ ] Create AI advice endpoint
- [ ] Create shortcode endpoints
- [ ] Implement context builder
- [ ] Implement prompt templates
- [ ] Implement response parser
- [ ] Implement response cache
- [ ] Implement rate limiter
- [ ] Implement fallback responses
- [ ] Add OpenAI integration
- [ ] Add error handling
- [ ] Write unit tests
- [ ] Write integration tests

### Frontend
- [ ] Create `AISeerService` client
- [ ] Create `useAISeer` hook
- [ ] Build AI input panel
- [ ] Build response display
- [ ] Build shortcode buttons
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add copy-to-clipboard

---

## Appendix

### Performance Targets

| Metric | Target |
|--------|--------|
| P50 response time | <1.5 seconds |
| P95 response time | <3 seconds |
| P99 response time | <5 seconds |
| Cache hit rate | >30% |
| Fallback rate | <5% |

### OpenAI Configuration

```typescript
const OPENAI_CONFIG = {
  model: 'gpt-4-turbo',
  maxTokens: 500,
  temperature: 0.7,
  topP: 1,
  frequencyPenalty: 0.3,
  presencePenalty: 0.3,
  timeout: 10000,  // 10 seconds
};
```
