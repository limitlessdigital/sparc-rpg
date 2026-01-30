/**
 * AI Seer Assistant - Main Service
 * Core AI functionality with OpenAI integration (mock for now)
 */

import { v4 as uuidv4 } from "uuid";
import type {
  AISeerAdviceRequest,
  AISeerAdviceResponse,
  GameContext,
  CacheConfig,
  RateLimitConfig,
  RateLimitResult,
  ShortcodeResponse,
} from "./types";
import { SYSTEM_PROMPT, contextToPrompt, buildUserPrompt, OPENAI_CONFIG } from "./prompts";
import { parseAIResponse, calculateConfidence, cleanSuggestion } from "./response-parser";
import { executeShortcode, parseShortcode, getShortcodes, SHORTCODES } from "./shortcodes";

// Cache configuration
const CACHE_CONFIG: CacheConfig = {
  shortcodesTTL: 60 * 60 * 1000, // 1 hour
  rulesQueryTTL: 30 * 60 * 1000, // 30 minutes
  contextualTTL: 5 * 60 * 1000, // 5 minutes
};

// Rate limit configuration
const RATE_LIMITS: RateLimitConfig = {
  requestsPerMinute: 10,
  requestsPerHour: 100,
  burstLimit: 5,
};

// In-memory cache (replace with Redis in production)
const responseCache = new Map<string, { response: AISeerAdviceResponse; expiry: number }>();

// In-memory rate limit tracking (replace with Redis in production)
const rateLimitStore = new Map<string, { count: number; expiry: number }>();

/**
 * Fallback responses when AI is unavailable
 */
const FALLBACK_RESPONSES: Record<string, string> = {
  default:
    "I'm having trouble connecting right now. As a general rule: if a player wants to attempt something reasonable, have them roll their most relevant attribute against a difficulty of 10-12.",
  combat:
    "For combat: each combatant rolls their attack dice vs the defender's Grace. Winner is the higher total. Damage equals the attacker's weapon damage.",
  rules:
    "The SPARC rules are: roll D6s equal to your attribute, try to beat the difficulty number. Heroic Save lets you reroll once per encounter.",
  difficulty:
    "Standard difficulties: Easy (6-8), Moderate (9-11), Hard (12-14), Very Hard (15-17). Adjust based on how dramatically you want success to matter.",
};

/**
 * Generate cache key for a request
 */
function getCacheKey(request: AISeerAdviceRequest): string {
  if (isRulesQuery(request.playerAction)) {
    return `rules:${normalizeQuery(request.playerAction)}`;
  }
  return `ctx:${request.sessionId}:${request.playerAction}:${request.sceneContext.substring(0, 50)}`;
}

/**
 * Check if query is a rules question (cacheable longer)
 */
function isRulesQuery(query: string): boolean {
  const rulesKeywords = ["how does", "what is", "explain", "rules for", "how do i", "what are"];
  const lower = query.toLowerCase();
  return rulesKeywords.some((k) => lower.includes(k));
}

/**
 * Normalize query for cache key
 */
function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 100);
}

/**
 * Check rate limit for user
 */
function checkRateLimit(userId: string): RateLimitResult {
  const now = Date.now();
  const key = `rate:${userId}`;

  const current = rateLimitStore.get(key);

  if (!current || now > current.expiry) {
    // Reset counter
    rateLimitStore.set(key, { count: 1, expiry: now + 60000 });
    return { allowed: true };
  }

  if (current.count >= RATE_LIMITS.requestsPerMinute) {
    return { allowed: false, retryAfterMs: current.expiry - now };
  }

  // Increment counter
  rateLimitStore.set(key, { count: current.count + 1, expiry: current.expiry });
  return { allowed: true };
}

/**
 * Get cached response if available
 */
function getCachedResponse(key: string): AISeerAdviceResponse | null {
  const cached = responseCache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiry) {
    responseCache.delete(key);
    return null;
  }
  return { ...cached.response, cached: true };
}

/**
 * Store response in cache
 */
function setCachedResponse(key: string, response: AISeerAdviceResponse, isRules: boolean): void {
  const ttl = isRules ? CACHE_CONFIG.rulesQueryTTL : CACHE_CONFIG.contextualTTL;
  responseCache.set(key, {
    response: { ...response, cached: true },
    expiry: Date.now() + ttl,
  });
}

/**
 * Get fallback response when AI is unavailable
 */
function getFallbackResponse(request: AISeerAdviceRequest): AISeerAdviceResponse {
  const query = request.playerAction.toLowerCase();

  let fallback = FALLBACK_RESPONSES.default;
  if (query.includes("combat") || query.includes("attack") || query.includes("fight")) {
    fallback = FALLBACK_RESPONSES.combat;
  } else if (query.includes("rule") || query.includes("how")) {
    fallback = FALLBACK_RESPONSES.rules;
  } else if (query.includes("difficulty") || query.includes("dc")) {
    fallback = FALLBACK_RESPONSES.difficulty;
  }

  return {
    id: uuidv4(),
    requestId: uuidv4(),
    suggestion: fallback,
    confidence: 0.5,
    responseTimeMs: 0,
    cached: false,
    modelVersion: "fallback",
  };
}

/**
 * Mock OpenAI API call - returns simulated responses
 * Replace with actual OpenAI SDK call in production
 */
async function callOpenAI(
  _systemPrompt: string,
  userPrompt: string,
  _config: typeof OPENAI_CONFIG
): Promise<string> {
  // Mock implementation - in production, this would use OpenAI SDK
  // systemPrompt and config would be passed to the API
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

  // Parse the user question from the prompt
  const actionMatch = userPrompt.match(/The player wants to: "([^"]+)"/);
  const action = actionMatch?.[1]?.toLowerCase() || "";

  // Generate contextual mock responses based on the action
  if (action.includes("climb") || action.includes("scale")) {
    return `Have them attempt the climb carefully, looking for handholds.

GRACE roll vs DC 11

As they begin their ascent, loose stones crumble beneath their fingers...`;
  }

  if (action.includes("persuade") || action.includes("convince") || action.includes("talk")) {
    return `Approach this as a social challenge. Consider the NPC's motivations.

HEART roll vs DC 12

The NPC's eyes narrow, weighing the sincerity of the words...`;
  }

  if (action.includes("sneak") || action.includes("hide") || action.includes("stealth")) {
    return `Moving quietly requires patience and awareness of surroundings.

GRACE roll vs DC 12

Every shadow becomes an ally as they slip through the darkness...`;
  }

  if (action.includes("fight") || action.includes("attack") || action.includes("hit")) {
    return `This will initiate combat. Have them roll initiative!

The air crackles with tension as weapons are drawn...`;
  }

  if (action.includes("search") || action.includes("investigate") || action.includes("look")) {
    return `A careful search might reveal hidden details.

WIT roll vs DC 10

Their trained eyes scan every corner, missing nothing...`;
  }

  if (action.includes("know") || action.includes("remember") || action.includes("lore")) {
    return `Drawing on their knowledge and training...

WIT roll vs DC 11

Fragments of ancient texts and legends surface in their mind...`;
  }

  if (action.includes("heal") || action.includes("medicine") || action.includes("treat")) {
    return `Treating wounds requires steady hands and knowledge.

WIT roll vs DC 10

With careful attention, the bleeding slows...`;
  }

  // Default response for other actions
  return `That's an interesting approach! Consider what attribute best fits the action.

Based on the situation, I'd suggest a WIT or GRACE roll vs DC 11, depending on whether this is more about thinking or doing.

The moment hangs in the balance as they make their attempt...`;
}

/**
 * Main function to get AI advice
 */
export async function getAIAdvice(
  request: AISeerAdviceRequest,
  context: GameContext | null,
  userId: string
): Promise<AISeerAdviceResponse> {
  const startTime = Date.now();
  const requestId = uuidv4();

  // Check for shortcode
  const shortcode = parseShortcode(request.playerAction);
  if (shortcode) {
    const result = executeShortcode(shortcode.code, context, shortcode.params);
    return {
      id: uuidv4(),
      requestId,
      suggestion: result.formatted,
      confidence: 1.0,
      responseTimeMs: Date.now() - startTime,
      cached: false,
      modelVersion: "shortcode",
    };
  }

  // Check rate limit
  const rateLimit = checkRateLimit(userId);
  if (!rateLimit.allowed) {
    return {
      id: uuidv4(),
      requestId,
      suggestion: `Rate limit exceeded. Please wait ${Math.ceil((rateLimit.retryAfterMs || 60000) / 1000)} seconds.`,
      confidence: 0,
      responseTimeMs: Date.now() - startTime,
      cached: false,
      modelVersion: "error",
    };
  }

  // Check cache
  const cacheKey = getCacheKey(request);
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return {
      ...cached,
      responseTimeMs: Date.now() - startTime,
    };
  }

  try {
    // Build prompts
    const contextPrompt = context ? contextToPrompt(context) : "";
    const userPrompt = buildUserPrompt(request, contextPrompt);

    // Call AI (mock for now)
    const rawResponse = await callOpenAI(SYSTEM_PROMPT, userPrompt, OPENAI_CONFIG);

    // Parse response
    const parsed = parseAIResponse(rawResponse);
    const confidence = calculateConfidence(parsed);

    const response: AISeerAdviceResponse = {
      id: uuidv4(),
      requestId,
      suggestion: cleanSuggestion(parsed.suggestion),
      suggestedRoll: parsed.suggestedRoll,
      narrativeHook: parsed.narrativeHook,
      ruleClarification: parsed.ruleClarification,
      confidence,
      responseTimeMs: Date.now() - startTime,
      cached: false,
      modelVersion: OPENAI_CONFIG.model,
    };

    // Cache the response
    setCachedResponse(cacheKey, response, isRulesQuery(request.playerAction));

    return response;
  } catch (error) {
    console.error("AI service error:", error);
    return {
      ...getFallbackResponse(request),
      responseTimeMs: Date.now() - startTime,
    };
  }
}

/**
 * Execute a shortcode directly
 */
export function handleShortcode(
  code: string,
  _sessionId: string,
  context: GameContext | null,
  params?: Record<string, string>
): ShortcodeResponse {
  // sessionId reserved for future context fetching
  return executeShortcode(code, context, params);
}

/**
 * Get available shortcodes
 */
export function listShortcodes() {
  return getShortcodes();
}

/**
 * Stream AI response (for progressive UI updates)
 * Returns an async generator that yields response chunks
 */
export async function* streamAIAdvice(
  request: AISeerAdviceRequest,
  context: GameContext | null,
  _userId: string
): AsyncGenerator<{ type: "chunk" | "done"; content: string; parsed?: AISeerAdviceResponse }> {
  // For mock implementation, simulate streaming by yielding word by word
  const contextPrompt = context ? contextToPrompt(context) : "";
  const userPrompt = buildUserPrompt(request, contextPrompt);

  // Get full response first (in real impl, this would stream from OpenAI)
  const fullResponse = await callOpenAI(SYSTEM_PROMPT, userPrompt, OPENAI_CONFIG);

  // Simulate streaming by yielding words
  const words = fullResponse.split(/(\s+)/);
  let accumulated = "";

  for (const word of words) {
    accumulated += word;
    yield { type: "chunk", content: word };
    // Small delay to simulate streaming
    await new Promise((resolve) => setTimeout(resolve, 30));
  }

  // Parse final response
  const parsed = parseAIResponse(fullResponse);
  const confidence = calculateConfidence(parsed);

  yield {
    type: "done",
    content: accumulated,
    parsed: {
      id: uuidv4(),
      requestId: uuidv4(),
      suggestion: cleanSuggestion(parsed.suggestion),
      suggestedRoll: parsed.suggestedRoll,
      narrativeHook: parsed.narrativeHook,
      ruleClarification: parsed.ruleClarification,
      confidence,
      responseTimeMs: 0,
      cached: false,
      modelVersion: OPENAI_CONFIG.model,
    },
  };
}

// Export for use in router
export { SHORTCODES };
