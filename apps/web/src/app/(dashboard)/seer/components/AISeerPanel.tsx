"use client";

/**
 * AI Seer Panel Component
 * 
 * This is a wrapper around the @sparc/ui AISeerPanel component
 * that integrates with the Seer Dashboard context.
 */

import { useCallback } from "react";
import { AISeerPanel as BaseAISeerPanel, useToast } from "@sparc/ui";
import type { AISeerResponse as UIAISeerResponse, Attribute as UIAttribute } from "@sparc/ui";
import type { AISeerResponse, Attribute } from "../types";

interface AISeerPanelWrapperProps {
  onGetAdvice: (question: string) => Promise<AISeerResponse>;
  onUseRoll?: (attribute: Attribute, difficulty: number) => void;
}

export function AISeerPanel({ onGetAdvice, onUseRoll }: AISeerPanelWrapperProps): JSX.Element | null {
  const { addToast } = useToast();

  // Handle copy to clipboard
  const handleCopy = useCallback(
    (_text: string) => {
      addToast({
        variant: "success",
        title: "Copied to clipboard!",
        duration: 2000,
      });
    },
    [addToast]
  );

  // Wrap onGetAdvice to ensure proper types for UI component
  const handleGetAdvice = useCallback(
    async (question: string): Promise<UIAISeerResponse> => {
      const response = await onGetAdvice(question);
      return {
        id: response.id || `resp-${Date.now()}`,
        requestId: response.requestId || `req-${Date.now()}`,
        suggestion: response.suggestion,
        suggestedRoll: response.suggestedRoll,
        narrativeHook: response.narrativeHook,
        ruleClarification: response.ruleClarification,
        confidence: response.confidence || 0.85,
        responseTimeMs: response.responseTimeMs,
        cached: response.cached,
        modelVersion: response.modelVersion || "mock",
      };
    },
    [onGetAdvice]
  );

  // Wrap onUseRoll to handle type compatibility
  const handleUseRoll = useCallback(
    (attribute: UIAttribute, difficulty: number) => {
      onUseRoll?.(attribute as Attribute, difficulty);
    },
    [onUseRoll]
  );

  return (
    <BaseAISeerPanel
      onGetAdvice={handleGetAdvice}
      onUseRoll={handleUseRoll}
      onCopy={handleCopy}
      mode="chat"
      enableVoice={false}
      enableStreaming={false}
    />
  );
}
