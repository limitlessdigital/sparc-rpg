/**
 * AI Seer Assistant Types
 * Based on PRD 06: AI Seer Assistant
 */

// SPARC Attributes
export type Attribute = "might" | "grace" | "wit" | "heart";

// Difficulty preferences
export type DifficultyPreference = "easy" | "medium" | "hard";

// AI Advice Request
export interface AISeerAdviceRequest {
  sessionId: string;
  sceneContext: string;
  playerAction: string;
  difficultyPreference: DifficultyPreference;
  recentHistory?: string[];
  characterContext?: {
    name: string;
    class: string;
    relevantStats: Record<string, number>;
  };
}

// Suggested Roll
export interface SuggestedRoll {
  attribute: Attribute;
  difficulty: number;
  reason: string;
}

// AI Advice Response
export interface AISeerAdviceResponse {
  id: string;
  requestId: string;
  suggestion: string;
  ruleClarification?: string;
  narrativeHook?: string;
  suggestedRoll?: SuggestedRoll;
  confidence: number;
  responseTimeMs: number;
  cached: boolean;
  modelVersion: string;
}

// Shortcode Definition
export interface AISeerShortcode {
  code: string;
  description: string;
  example: string;
  requiresContext: boolean;
  category: "combat" | "rules" | "narrative" | "utility";
}

// Shortcode Request
export interface ShortcodeRequest {
  sessionId: string;
  params?: Record<string, string>;
}

// Shortcode Response
export interface ShortcodeResponse {
  formatted: string;
  raw?: Record<string, unknown>;
}

// Game Context for AI
export interface GameContext {
  session: {
    id: string;
    adventureName: string;
    status: string;
  };
  currentNode: {
    id: string;
    title: string;
    type: string;
    content: string;
  };
  players: Array<{
    id: string;
    name: string;
    characterClass: string;
    currentHP: number;
    maxHP: number;
    attributes: {
      might: number;
      grace: number;
      wit: number;
      heart: number;
    };
    isConnected: boolean;
  }>;
  combat?: {
    roundNumber: number;
    currentTurnIndex: number;
    initiativeOrder: Array<{
      name: string;
      initiative: number;
    }>;
    enemyCombatants: Array<{
      name: string;
      currentHitPoints: number;
      maxHitPoints: number;
    }>;
  };
  recentHistory: string[];
  inventory: Array<{
    name: string;
    quantity: number;
  }>;
  flags: string[];
}

// Cache Config
export interface CacheConfig {
  shortcodesTTL: number;
  rulesQueryTTL: number;
  contextualTTL: number;
}

// Rate Limit Config
export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  burstLimit: number;
}

// Rate Limit Result
export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs?: number;
}

// AI Error Codes
export enum AIErrorCode {
  OPENAI_UNAVAILABLE = "AI_001",
  RATE_LIMITED = "AI_002",
  CONTEXT_TOO_LARGE = "AI_003",
  INVALID_REQUEST = "AI_004",
  TIMEOUT = "AI_005",
  NOT_SEER = "AI_006",
}

// Parsed AI Response
export interface ParsedAIResponse {
  suggestion: string;
  suggestedRoll?: SuggestedRoll;
  narrativeHook?: string;
  ruleClarification?: string;
}

// OpenAI Config
export interface OpenAIConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  timeout: number;
}
