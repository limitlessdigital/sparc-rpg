"use client";

import { useState, useCallback } from "react";
import { cn } from "../lib/utils";
import { Button } from "../Button";
import type { VoiceState } from "./types";

export interface VoiceButtonProps {
  /** Text to speak */
  text: string;
  /** Voice state */
  voiceState?: VoiceState;
  /** Callback when voice is toggled */
  onToggle?: (enabled: boolean) => void;
  /** Callback when text is spoken */
  onSpeak?: (text: string) => void;
  /** Custom class name */
  className?: string;
  /** Compact mode */
  compact?: boolean;
}

/**
 * Voice Button Component (Placeholder for future TTS integration)
 * 
 * This component provides a UI for text-to-speech functionality.
 * Currently shows the interface but actual TTS requires integration
 * with a service like ElevenLabs, OpenAI TTS, or browser Speech API.
 */
export function VoiceButton({
  text,
  voiceState = { enabled: false, speaking: false, voice: "default" },
  onToggle: _onToggle,
  onSpeak,
  // onToggle reserved for future voice toggle functionality
  className,
  compact = false,
}: VoiceButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [localSpeaking, setLocalSpeaking] = useState(false);

  const handleClick = useCallback(() => {
    if (voiceState.speaking || localSpeaking) {
      // Stop speaking
      setLocalSpeaking(false);
      // In real implementation: speechSynthesis.cancel()
    } else {
      // Start speaking
      setLocalSpeaking(true);
      onSpeak?.(text);
      
      // Simulate speaking duration based on text length
      const duration = Math.min(text.length * 50, 10000); // ~50ms per char, max 10s
      setTimeout(() => {
        setLocalSpeaking(false);
      }, duration);
    }
  }, [voiceState.speaking, localSpeaking, text, onSpeak]);

  const isSpeaking = voiceState.speaking || localSpeaking;

  if (compact) {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "p-1 rounded transition-colors",
          isSpeaking && "text-bronze animate-pulse",
          !isSpeaking && "text-muted-foreground hover:text-foreground",
          className
        )}
        title={isSpeaking ? "Stop reading" : "Read aloud"}
      >
        {isSpeaking ? "🔊" : "🔈"}
      </button>
    );
  }

  return (
    <Button
      variant={isSpeaking ? "secondary" : "ghost"}
      size="sm"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "gap-1",
        isSpeaking && "animate-pulse",
        className
      )}
      title={isSpeaking ? "Stop reading" : "Read aloud"}
    >
      {isSpeaking ? "🔊" : "🔈"}
      {!compact && (isHovered ? (isSpeaking ? "Stop" : "Read") : "")}
    </Button>
  );
}

/**
 * Hook for browser Speech Synthesis (basic TTS)
 * This is a placeholder that can be enhanced with better TTS services
 */
export function useBrowserTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState(() => 
    typeof window !== "undefined" && "speechSynthesis" in window
  );

  const speak = useCallback((text: string, voice?: string) => {
    if (!isSupported) return;

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    if (voice) {
      const found = voices.find(v => v.name.toLowerCase().includes(voice.toLowerCase()));
      if (found) utterance.voice = found;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
  };
}

/**
 * Voice Settings Panel (placeholder for future configuration)
 */
export interface VoiceSettingsProps {
  voiceState: VoiceState;
  onUpdate: (state: VoiceState) => void;
  className?: string;
}

export function VoiceSettings({ voiceState, onUpdate, className }: VoiceSettingsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-sm font-medium">🔊 Voice Settings</div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm">Enable Voice</span>
        <button
          onClick={() => onUpdate({ ...voiceState, enabled: !voiceState.enabled })}
          className={cn(
            "w-10 h-5 rounded-full transition-colors",
            voiceState.enabled ? "bg-bronze" : "bg-surface-elevated"
          )}
        >
          <div
            className={cn(
              "w-4 h-4 rounded-full bg-white transition-transform mx-0.5",
              voiceState.enabled && "translate-x-5"
            )}
          />
        </button>
      </div>

      <div className="text-xs text-muted-foreground">
        Voice output requires TTS service integration.
        Coming soon!
      </div>
    </div>
  );
}
