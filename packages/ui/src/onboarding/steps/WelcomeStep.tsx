"use client";

/**
 * @sparc/ui WelcomeStep
 * 
 * Based on PRD 15: Onboarding Tutorial
 * First tutorial step - introduces SPARC basics.
 */

import { cn } from "../../lib/utils";
import type { WelcomeStepProps } from "../types";

// =============================================================================
// Welcome Step Component
// =============================================================================

export function WelcomeStep({ step: _step, onComplete, userName }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center text-center max-w-lg mx-auto px-4">
      {/* Animated dice icon */}
      <div className="text-6xl mb-6 animate-bounce">🎲</div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-foreground mb-4">
        Welcome to SPARC{userName ? `, ${userName}` : ""}!
      </h1>

      {/* Description */}
      <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
        SPARC is a tabletop roleplaying game where you and your friends tell
        stories together.
      </p>

      {/* Key concepts */}
      <div className="w-full bg-surface-elevated rounded-xl p-6 mb-8">
        <div className="space-y-4">
          <ConceptRow
            icon="👤"
            title="YOU control a hero"
            description="Create a character and guide them through adventures"
          />
          <ConceptRow
            icon="🎭"
            title="The SEER tells the story"
            description="One player runs the game and creates the world"
          />
          <ConceptRow
            icon="🎲"
            title="DICE determine what happens"
            description="Roll to see if your actions succeed or fail"
          />
        </div>
      </div>

      {/* Encouragement */}
      <p className="text-muted-foreground mb-8">
        No experience needed. We&apos;ll teach you everything!
      </p>

      {/* Continue button */}
      <button
        onClick={onComplete}
        className={cn(
          "px-8 py-4 rounded-xl font-semibold text-lg",
          "bg-gradient-to-br from-bronze to-bronze-600 text-white",
          "hover:brightness-110 transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-2",
          "flex items-center gap-2"
        )}
      >
        Let&apos;s Go!
        <span className="text-xl">→</span>
      </button>
    </div>
  );
}

// =============================================================================
// Concept Row Component
// =============================================================================

interface ConceptRowProps {
  icon: string;
  title: string;
  description: string;
}

function ConceptRow({ icon, title, description }: ConceptRowProps) {
  return (
    <div className="flex items-start gap-4 text-left">
      <div className="text-2xl flex-shrink-0">{icon}</div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// =============================================================================
// Exports
// =============================================================================

export type { WelcomeStepProps } from "../types";
