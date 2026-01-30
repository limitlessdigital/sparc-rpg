/**
 * AI Seer Assistant Module
 * 
 * Provides intelligent, context-aware help to Game Masters during active sessions.
 * Based on PRD 06: AI Seer Assistant
 */

// Export types
export type {
  Attribute,
  DifficultyPreference,
  AISeerAdviceRequest,
  AISeerAdviceResponse,
  SuggestedRoll,
  AISeerShortcode,
  ShortcodeRequest,
  ShortcodeResponse,
  GameContext,
  ParsedAIResponse,
  OpenAIConfig,
  CacheConfig,
  RateLimitConfig,
  RateLimitResult,
  AIErrorCode,
} from "./types";

// Export service functions
export {
  getAIAdvice,
  handleShortcode,
  listShortcodes,
  streamAIAdvice,
  SHORTCODES,
} from "./service";

// Export prompt utilities
export {
  SYSTEM_PROMPT,
  OPENAI_CONFIG,
  contextToPrompt,
  buildUserPrompt,
  buildQuickPrompt,
  buildNarrativePrompt,
  buildNPCPrompt,
} from "./prompts";

// Export shortcode utilities
export {
  executeShortcode,
  parseShortcode,
  getShortcodes,
} from "./shortcodes";

// Export response parser
export {
  parseAIResponse,
  calculateConfidence,
  cleanSuggestion,
} from "./response-parser";
