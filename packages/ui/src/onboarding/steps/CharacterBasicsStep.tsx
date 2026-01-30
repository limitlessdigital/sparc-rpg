"use client";

/**
 * @sparc/ui CharacterBasicsStep
 * 
 * Based on PRD 15: Onboarding Tutorial
 * Interactive character card tour with tooltips.
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import type { CharacterBasicsStepProps, TutorialCharacter } from "../types";

// =============================================================================
// Attribute Info
// =============================================================================

const ATTRIBUTE_INFO = {
  might: {
    icon: "💪",
    color: "text-red-400",
    bgColor: "bg-red-400/20",
    description: "Physical strength and toughness. Used for melee attacks, lifting, and enduring damage.",
  },
  grace: {
    icon: "🏃",
    color: "text-green-400",
    bgColor: "bg-green-400/20",
    description: "Agility and reflexes. Used for dodging, ranged attacks, and acrobatics.",
  },
  wit: {
    icon: "🧠",
    color: "text-blue-400",
    bgColor: "bg-blue-400/20",
    description: "Intelligence and perception. Used for knowledge, puzzles, and spotting traps.",
  },
  heart: {
    icon: "❤️",
    color: "text-pink-400",
    bgColor: "bg-pink-400/20",
    description: "Charisma and willpower. Used for persuasion, magic, and resisting fear.",
  },
} as const;

// =============================================================================
// Attribute Bar Component
// =============================================================================

interface AttributeBarProps {
  name: keyof typeof ATTRIBUTE_INFO;
  value: number;
  maxValue?: number;
  active: boolean;
  onClick: () => void;
}

function AttributeBar({ name, value, maxValue = 10, active, onClick }: AttributeBarProps) {
  const info = ATTRIBUTE_INFO[name];
  const percentage = (value / maxValue) * 100;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-3 rounded-lg transition-all",
        "text-left",
        active
          ? "bg-bronze/20 ring-2 ring-bronze"
          : "bg-surface-elevated hover:bg-surface-elevated/80"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{info.icon}</span>
          <span className={cn("font-medium capitalize", info.color)}>{name}</span>
        </div>
        <span className="font-bold text-foreground">{value}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", info.bgColor.replace("/20", ""))}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </button>
  );
}

// =============================================================================
// Character Card Component
// =============================================================================

interface CharacterCardProps {
  character: TutorialCharacter;
  activeAttribute: string | null;
  onAttributeClick: (attr: string) => void;
  showHPTooltip: boolean;
  onHPClick: () => void;
}

function CharacterCard({
  character,
  activeAttribute,
  onAttributeClick,
  showHPTooltip,
  onHPClick,
}: CharacterCardProps) {
  return (
    <div className="bg-surface-base border-2 border-bronze/30 rounded-2xl p-6 w-full max-w-sm">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        {/* Avatar placeholder */}
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-bronze to-bronze-600 flex items-center justify-center text-2xl">
          ⚔️
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">{character.name}</h2>
          <p className="text-muted-foreground">{character.class}</p>
        </div>
        {/* HP */}
        <button
          onClick={onHPClick}
          className={cn(
            "flex items-center gap-1 px-3 py-1 rounded-full transition-all",
            showHPTooltip
              ? "bg-red-500/30 ring-2 ring-red-500"
              : "bg-red-500/20 hover:bg-red-500/30"
          )}
        >
          <span>❤️</span>
          <span className="font-bold text-foreground">{character.hp}</span>
        </button>
      </div>

      {/* Attributes */}
      <div className="space-y-3">
        <AttributeBar
          name="might"
          value={character.might}
          active={activeAttribute === "might"}
          onClick={() => onAttributeClick("might")}
        />
        <AttributeBar
          name="grace"
          value={character.grace}
          active={activeAttribute === "grace"}
          onClick={() => onAttributeClick("grace")}
        />
        <AttributeBar
          name="wit"
          value={character.wit}
          active={activeAttribute === "wit"}
          onClick={() => onAttributeClick("wit")}
        />
        <AttributeBar
          name="heart"
          value={character.heart}
          active={activeAttribute === "heart"}
          onClick={() => onAttributeClick("heart")}
        />
      </div>
    </div>
  );
}

// =============================================================================
// Info Panel Component
// =============================================================================

interface InfoPanelProps {
  activeAttribute: string | null;
  showHPInfo: boolean;
}

function InfoPanel({ activeAttribute, showHPInfo }: InfoPanelProps) {
  if (showHPInfo) {
    return (
      <div className="bg-surface-elevated rounded-xl p-6 animate-in fade-in-0 slide-in-from-right-4 duration-200">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">❤️</span>
          <h3 className="text-lg font-bold text-foreground">Hit Points (HP)</h3>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Your hit points represent how much damage you can take before being knocked out.
          When you take damage, your HP goes down. When it reaches 0, you&apos;re in trouble!
        </p>
        <p className="text-muted-foreground mt-3 text-sm">
          💡 Tip: Keep track of your HP during combat and use healing when needed.
        </p>
      </div>
    );
  }

  if (activeAttribute && activeAttribute in ATTRIBUTE_INFO) {
    const info = ATTRIBUTE_INFO[activeAttribute as keyof typeof ATTRIBUTE_INFO];
    return (
      <div className="bg-surface-elevated rounded-xl p-6 animate-in fade-in-0 slide-in-from-right-4 duration-200">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{info.icon}</span>
          <h3 className={cn("text-lg font-bold capitalize", info.color)}>
            {activeAttribute}
          </h3>
        </div>
        <p className="text-muted-foreground leading-relaxed">{info.description}</p>
        <p className="text-muted-foreground mt-3 text-sm">
          💡 Higher attributes = more dice when you roll!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-elevated/50 rounded-xl p-6 border-2 border-dashed border-border-default">
      <p className="text-muted-foreground text-center">
        👆 Tap any attribute or HP to learn more
      </p>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function CharacterBasicsStep({
  step: _step,
  onComplete,
  onBack,
  character,
  onAttributeHover,
}: CharacterBasicsStepProps) {
  const [activeAttribute, setActiveAttribute] = React.useState<string | null>(null);
  const [showHPInfo, setShowHPInfo] = React.useState(false);
  const [exploredItems, setExploredItems] = React.useState<Set<string>>(new Set());

  const handleAttributeClick = (attr: string) => {
    setActiveAttribute(attr);
    setShowHPInfo(false);
    setExploredItems((prev) => new Set(prev).add(attr));
    onAttributeHover?.(attr);
  };

  const handleHPClick = () => {
    setShowHPInfo(true);
    setActiveAttribute(null);
    setExploredItems((prev) => new Set(prev).add("hp"));
  };

  // Require exploring at least 2 items to continue
  const canContinue = exploredItems.size >= 2;

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Meet Your Character
        </h1>
        <p className="text-muted-foreground">
          Explore the character card to learn about attributes and stats
        </p>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Character Card */}
        <CharacterCard
          character={character}
          activeAttribute={activeAttribute}
          onAttributeClick={handleAttributeClick}
          showHPTooltip={showHPInfo}
          onHPClick={handleHPClick}
        />

        {/* Info Panel */}
        <InfoPanel activeAttribute={activeAttribute} showHPInfo={showHPInfo} />
      </div>

      {/* Progress hint */}
      {!canContinue && (
        <p className="text-center text-sm text-muted-foreground mt-6">
          Explore {2 - exploredItems.size} more item{2 - exploredItems.size !== 1 ? "s" : ""} to continue
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
        )}
        <button
          onClick={onComplete}
          disabled={!canContinue}
          className={cn(
            "ml-auto px-6 py-3 rounded-lg font-semibold transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-2",
            canContinue
              ? "bg-bronze text-white hover:brightness-110"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Exports
// =============================================================================

export type { CharacterBasicsStepProps } from "../types";
