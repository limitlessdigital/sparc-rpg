"use client";

import { useState, useCallback, useRef } from "react";
import type { AISeerResponse, Attribute, Shortcode } from "./types";

// Default shortcodes
const DEFAULT_SHORTCODES: Shortcode[] = [
  { code: "combat", description: "Combat rules", example: "/combat", requiresContext: false, category: "rules", icon: "⚔️" },
  { code: "order", description: "Turn order", example: "/order", requiresContext: true, category: "combat", icon: "📋" },
  { code: "abilities", description: "Player abilities", example: "/abilities", requiresContext: true, category: "utility", icon: "✨" },
  { code: "stats", description: "Party stats", example: "/stats", requiresContext: true, category: "utility", icon: "📊" },
  { code: "difficulty", description: "DC reference", example: "/difficulty", requiresContext: false, category: "rules", icon: "🎯" },
  { code: "classes", description: "Class reference", example: "/classes", requiresContext: false, category: "rules", icon: "🎭" },
  { code: "roll", description: "Roll suggestion", example: "/roll action", requiresContext: true, category: "utility", icon: "🎲" },
  { code: "describe", description: "Describe scene", example: "/describe", requiresContext: true, category: "narrative", icon: "📖" },
  { code: "npc", description: "Quick NPC", example: "/npc role", requiresContext: false, category: "narrative", icon: "🎭" },
  { code: "loot", description: "Random loot", example: "/loot", requiresContext: true, category: "utility", icon: "💎" },
];

export interface UseAISeerOptions {
  /** API endpoint or function to call */
  apiEndpoint?: string;
  /** Session ID for context */
  sessionId?: string;
  /** Scene context */
  sceneContext?: string;
  /** Custom fetch function */
  fetcher?: (question: string) => Promise<AISeerResponse>;
  /** Enable caching */
  enableCache?: boolean;
  /** Cache TTL in ms */
  cacheTTL?: number;
}

export interface UseAISeerReturn {
  /** Ask a question */
  ask: (question: string) => Promise<AISeerResponse>;
  /** Execute a shortcode */
  executeShortcode: (code: string, params?: Record<string, string>) => Promise<AISeerResponse>;
  /** Get quick advice (no context) */
  quickAdvice: (question: string) => Promise<AISeerResponse>;
  /** Current response */
  response: AISeerResponse | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Clear state */
  clear: () => void;
  /** Available shortcodes */
  shortcodes: Shortcode[];
  /** Recent responses (history) */
  history: AISeerResponse[];
  /** Use a suggested roll */
  useRoll: (attribute: Attribute, difficulty: number) => void;
  /** Last used roll */
  lastRoll: { attribute: Attribute; difficulty: number } | null;
}

/**
 * React hook for AI Seer functionality
 */
export function useAISeer(options: UseAISeerOptions = {}): UseAISeerReturn {
  const {
    sessionId = "",
    sceneContext: _sceneContext = "",
    fetcher,
    enableCache = true,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
  } = options;
  // sceneContext reserved for future context-aware caching

  const [response, setResponse] = useState<AISeerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [history, setHistory] = useState<AISeerResponse[]>([]);
  const [lastRoll, setLastRoll] = useState<{ attribute: Attribute; difficulty: number } | null>(null);

  const cacheRef = useRef<Map<string, { response: AISeerResponse; expiry: number }>>(new Map());

  // Default fetcher (mock implementation)
  const defaultFetcher = useCallback(
    async (question: string): Promise<AISeerResponse> => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

      const startTime = Date.now();
      const questionLower = question.toLowerCase();

      // Mock response based on question content
      let suggestion = "That's an interesting approach! Consider the context and what attribute best fits.";
      let suggestedRoll: AISeerResponse["suggestedRoll"] = undefined;
      let narrativeHook: string | undefined = undefined;

      if (questionLower.includes("climb") || questionLower.includes("jump")) {
        suggestion = "Have them attempt the physical challenge carefully.";
        suggestedRoll = { attribute: "grace", difficulty: 11, reason: "Requires agility and balance" };
        narrativeHook = "The surface looms above, every handhold a test of skill...";
      } else if (questionLower.includes("persuade") || questionLower.includes("convince")) {
        suggestion = "This calls for a social approach. Consider the NPC's motivations.";
        suggestedRoll = { attribute: "heart", difficulty: 12, reason: "Force of personality needed" };
        narrativeHook = "Their eyes meet, a moment of connection hanging in the balance...";
      } else if (questionLower.includes("sneak") || questionLower.includes("hide")) {
        suggestion = "Stealth requires patience and awareness of surroundings.";
        suggestedRoll = { attribute: "grace", difficulty: 12, reason: "Silent movement required" };
        narrativeHook = "Every shadow becomes an ally as they slip through the darkness...";
      } else if (questionLower.includes("search") || questionLower.includes("investigate")) {
        suggestion = "A careful search might reveal hidden details.";
        suggestedRoll = { attribute: "wit", difficulty: 10, reason: "Keen observation needed" };
        narrativeHook = "Their trained eyes scan every corner, missing nothing...";
      } else if (questionLower.includes("/combat")) {
        suggestion = `## ⚔️ Combat Quick Reference

### Turn Order
1. Roll initiative (1D6, highest first)
2. Each combatant acts in order
3. Repeat until combat ends

### Attack
- Roll attack dice (based on primary attribute)
- Defender rolls defense (Grace)
- Attacker total > Defender total = **HIT**

### Heroic Save
- Once per encounter
- Reroll any failed roll`;
      } else if (questionLower.includes("/difficulty")) {
        suggestion = `## 🎯 Difficulty Guidelines

| DC | Level | Examples |
|---|---|---|
| 3-5 | Trivial | Basic tasks |
| 6-8 | Easy | Simple challenges |
| 9-11 | Moderate | Standard challenges |
| 12-14 | Hard | Significant challenges |
| 15-17 | Very Hard | Extreme challenges |
| 18 | Legendary | Nearly impossible |`;
      }

      return {
        id: `resp-${Date.now()}`,
        requestId: `req-${Date.now()}`,
        suggestion,
        suggestedRoll,
        narrativeHook,
        confidence: 0.85,
        responseTimeMs: Date.now() - startTime,
        cached: false,
        modelVersion: "mock-1.0",
      };
    },
    []
  );

  // Get from cache
  const getFromCache = useCallback(
    (key: string): AISeerResponse | null => {
      if (!enableCache) return null;
      const cached = cacheRef.current.get(key);
      if (!cached) return null;
      if (Date.now() > cached.expiry) {
        cacheRef.current.delete(key);
        return null;
      }
      return { ...cached.response, cached: true };
    },
    [enableCache]
  );

  // Set to cache
  const setToCache = useCallback(
    (key: string, response: AISeerResponse) => {
      if (!enableCache) return;
      cacheRef.current.set(key, {
        response: { ...response, cached: true },
        expiry: Date.now() + cacheTTL,
      });
    },
    [enableCache, cacheTTL]
  );

  // Ask a question
  const ask = useCallback(
    async (question: string): Promise<AISeerResponse> => {
      const cacheKey = `${sessionId}:${question}`;

      // Check cache
      const cached = getFromCache(cacheKey);
      if (cached) {
        setResponse(cached);
        return cached;
      }

      setIsLoading(true);
      setError(null);

      try {
        const fetch = fetcher || defaultFetcher;
        const result = await fetch(question);

        setResponse(result);
        setHistory((prev) => [result, ...prev].slice(0, 20)); // Keep last 20
        setToCache(cacheKey, result);

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to get advice");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, fetcher, defaultFetcher, getFromCache, setToCache]
  );

  // Execute shortcode
  const executeShortcode = useCallback(
    async (code: string, params?: Record<string, string>): Promise<AISeerResponse> => {
      let question = `/${code}`;
      if (params) {
        const paramStr = Object.entries(params)
          .map(([k, v]) => `${k}:${v}`)
          .join(" ");
        question += ` ${paramStr}`;
      }
      return ask(question);
    },
    [ask]
  );

  // Quick advice (no context)
  const quickAdvice = useCallback(
    async (question: string): Promise<AISeerResponse> => {
      return ask(question);
    },
    [ask]
  );

  // Use a roll
  const useRoll = useCallback((attribute: Attribute, difficulty: number) => {
    setLastRoll({ attribute, difficulty });
  }, []);

  // Clear state
  const clear = useCallback(() => {
    setResponse(null);
    setError(null);
    setLastRoll(null);
  }, []);

  return {
    ask,
    executeShortcode,
    quickAdvice,
    response,
    isLoading,
    error,
    clear,
    shortcodes: DEFAULT_SHORTCODES,
    history,
    useRoll,
    lastRoll,
  };
}
