/**
 * AI Seer Assistant UI Types
 */

// SPARC Attributes
export type Attribute = "might" | "grace" | "wit" | "heart";

// Suggested Roll
export interface SuggestedRoll {
  attribute: Attribute;
  difficulty: number;
  reason: string;
}

// AI Response (matching API response structure)
export interface AISeerResponse {
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
export interface Shortcode {
  code: string;
  description: string;
  example: string;
  requiresContext: boolean;
  category: "combat" | "rules" | "narrative" | "utility";
  icon: string;
}

// Suggestion Chip
export interface SuggestionChip {
  id: string;
  label: string;
  action: string;
  category: "quick" | "roll" | "narrative" | "info";
}

// Message types for chat-like interface
export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  response?: AISeerResponse;
  isStreaming?: boolean;
}

// Panel modes
export type AIPanelMode = "chat" | "compact" | "floating";

// Voice state (placeholder for future)
export interface VoiceState {
  enabled: boolean;
  speaking: boolean;
  voice: string;
}
