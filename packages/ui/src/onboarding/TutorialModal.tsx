"use client";

/**
 * @sparc/ui TutorialModal
 * 
 * Based on PRD 15: Onboarding Tutorial
 * Entry modal for new users with role selection (Player vs Seer).
 */

import * as React from "react";
import { cn } from "../lib/utils";
import type { TutorialModalProps, TutorialPath } from "./types";
import { getPathDuration, formatDuration } from "./tutorial-steps";

// =============================================================================
// Path Card Component
// =============================================================================

interface PathCardProps {
  path: TutorialPath;
  title: string;
  icon: string;
  description: string;
  duration: string;
  features: string[];
  selected: boolean;
  onSelect: () => void;
}

function PathCard({
  path: _path,
  title,
  icon,
  description,
  duration,
  features,
  selected,
  onSelect,
}: PathCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative flex flex-col p-6 rounded-xl border-2 transition-all duration-200",
        "text-left w-full",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base",
        selected
          ? "border-bronze bg-bronze/10 shadow-lg shadow-bronze/20"
          : "border-border-default bg-surface-elevated hover:border-bronze/50 hover:bg-surface-elevated/80"
      )}
    >
      {/* Selection indicator */}
      <div
        className={cn(
          "absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-all",
          selected
            ? "border-bronze bg-bronze"
            : "border-muted-foreground bg-transparent"
        )}
      >
        {selected && (
          <svg
            className="w-full h-full text-white"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      {/* Icon */}
      <div className="text-4xl mb-4">{icon}</div>

      {/* Title */}
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>

      {/* Description */}
      <p className="text-muted-foreground text-sm mb-4">{description}</p>

      {/* Duration badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs px-2 py-1 bg-surface-base rounded-full text-muted-foreground">
          ⏱️ ~{duration}
        </span>
      </div>

      {/* Features */}
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <span className="text-success mt-0.5">✓</span>
            {feature}
          </li>
        ))}
      </ul>
    </button>
  );
}

// =============================================================================
// TutorialModal Component
// =============================================================================

export function TutorialModal({
  open,
  onClose,
  onStartTutorial,
  onSkip,
}: TutorialModalProps) {
  const [selectedPath, setSelectedPath] = React.useState<TutorialPath | null>(null);

  // Calculate durations
  const playerDuration = formatDuration(getPathDuration("player"));
  const seerDuration = formatDuration(getPathDuration("seer"));

  const handleStart = () => {
    if (selectedPath) {
      onStartTutorial(selectedPath);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-modal-title"
        className={cn(
          "relative z-10 w-full max-w-2xl mx-4",
          "bg-surface-base rounded-2xl shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}
      >
        {/* Header */}
        <div className="text-center p-8 pb-6">
          <div className="text-5xl mb-4">🎲</div>
          <h2
            id="tutorial-modal-title"
            className="text-2xl font-bold text-foreground mb-2"
          >
            Welcome to SPARC!
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Let us show you the ropes. Choose your path below — you can always
            come back to learn the other role later.
          </p>
        </div>

        {/* Path Selection */}
        <div className="px-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PathCard
              path="player"
              title="Player"
              icon="👤"
              description="Join adventures and play as a hero"
              duration={playerDuration}
              features={[
                "Learn dice rolling mechanics",
                "Understand your character",
                "Practice combat basics",
              ]}
              selected={selectedPath === "player"}
              onSelect={() => setSelectedPath("player")}
            />
            <PathCard
              path="seer"
              title="Seer (GM)"
              icon="🎭"
              description="Run games and tell epic stories"
              duration={seerDuration}
              features={[
                "Everything in Player path",
                "Master the Seer dashboard",
                "Preview Adventure Forge",
                "Meet your AI assistant",
              ]}
              selected={selectedPath === "seer"}
              onSelect={() => setSelectedPath("seer")}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-6 border-t border-border-default">
          <button
            onClick={onSkip}
            className={cn(
              "text-muted-foreground hover:text-foreground transition-colors",
              "text-sm underline-offset-4 hover:underline"
            )}
          >
            Skip for now
          </button>

          <button
            onClick={handleStart}
            disabled={!selectedPath}
            className={cn(
              "px-6 py-3 rounded-lg font-semibold transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-2",
              selectedPath
                ? "bg-gradient-to-br from-bronze to-bronze-600 text-white hover:brightness-110"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {selectedPath
              ? `Start ${selectedPath === "player" ? "Player" : "Seer"} Tutorial →`
              : "Select a Path"}
          </button>
        </div>

        {/* Help text */}
        <div className="px-8 pb-6 text-center">
          <p className="text-xs text-muted-foreground">
            💡 Not sure? Start with <strong>Player</strong> — it&apos;s shorter and
            you can take the Seer tutorial anytime!
          </p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Exports
// =============================================================================

export type { TutorialModalProps } from "./types";
