"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { ChoiceButtonGroup, type Choice } from "./ChoiceButton";

export interface NarrativePanelProps {
  /** Scene image URL */
  sceneImageUrl?: string;
  /** Scene image alt text */
  sceneImageAlt?: string;
  /** Narrative text content */
  narrativeText: string;
  /** Available choices */
  choices?: Choice[];
  /** On choice selected */
  onChoiceSelect?: (choice: Choice) => void;
  /** Selected choice ID (for loading state) */
  selectedChoiceId?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Whether narrative is still typing */
  isTyping?: boolean;
  /** Custom class name */
  className?: string;
}

export function NarrativePanel({
  sceneImageUrl,
  sceneImageAlt = "Scene illustration",
  narrativeText,
  choices = [],
  onChoiceSelect,
  selectedChoiceId,
  isLoading = false,
  isTyping = false,
  className,
}: NarrativePanelProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Scene Image */}
      {sceneImageUrl && (
        <div className="relative w-full aspect-[16/9] max-h-[280px] overflow-hidden rounded-t-lg">
          <img
            src={sceneImageUrl}
            alt={sceneImageAlt}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a1628] to-transparent" />
        </div>
      )}

      {/* Narrative Text */}
      <div className={cn(
        "flex-1 overflow-y-auto px-6 py-4",
        "bg-gradient-to-b from-[#0a1628]/95 to-[#0d1f35]"
      )}>
        <div className="prose prose-invert prose-sm max-w-none">
          <p className={cn(
            "text-[#b8d0e8] text-base leading-relaxed font-sans whitespace-pre-wrap",
            isTyping && "after:content-['▋'] after:animate-pulse after:ml-0.5"
          )}>
            {narrativeText}
          </p>
        </div>
      </div>

      {/* Choices */}
      {choices.length > 0 && (
        <div className="px-4 py-4 bg-[#0a1628] border-t border-[#1a3a5c]/30">
          <ChoiceButtonGroup
            choices={choices}
            onSelect={onChoiceSelect}
            selectedId={selectedChoiceId}
            isLoading={isLoading}
            layout="horizontal"
          />
        </div>
      )}
    </div>
  );
}

// Typewriter effect hook for narrative text
export function useTypewriter(text: string, speed: number = 30) {
  const [displayedText, setDisplayedText] = React.useState("");
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);
    
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  const skip = React.useCallback(() => {
    setDisplayedText(text);
    setIsComplete(true);
  }, [text]);

  return { displayedText, isComplete, skip };
}
