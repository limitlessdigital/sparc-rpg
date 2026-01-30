/**
 * AI Seer Assistant UI Components
 * 
 * Provides intelligent, context-aware help to Game Masters during active sessions.
 * Based on PRD 06: AI Seer Assistant
 */

// Types
export type {
  Attribute,
  SuggestedRoll,
  AISeerResponse,
  Shortcode,
  SuggestionChip,
  AIMessage,
  AIPanelMode,
  VoiceState,
} from "./types";

// Main Panel Component
export { AISeerPanel } from "./AISeerPanel";
export type { AISeerPanelProps } from "./AISeerPanel";

// React Hook
export { useAISeer } from "./useAISeer";
export type { UseAISeerOptions, UseAISeerReturn } from "./useAISeer";

// Voice Components (placeholder)
export { VoiceButton, VoiceSettings, useBrowserTTS } from "./VoiceButton";
export type { VoiceButtonProps, VoiceSettingsProps } from "./VoiceButton";
