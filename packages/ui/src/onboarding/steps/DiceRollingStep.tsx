"use client";

/**
 * @sparc/ui DiceRollingStep
 * 
 * Based on PRD 15: Onboarding Tutorial
 * Interactive dice rolling practice with explanation.
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import type { DiceRollingStepProps, TutorialDiceRoll } from "../types";
import { DICE_SCENARIO } from "../tutorial-steps";

// =============================================================================
// Dice Component
// =============================================================================

interface DieProps {
  value: number | null;
  rolling: boolean;
  index: number;
}

const DIE_FACES: Record<number, React.ReactNode> = {
  1: (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-2 h-2 rounded-full bg-current" />
    </div>
  ),
  2: (
    <div className="flex items-center justify-between w-full h-full p-1.5">
      <div className="w-2 h-2 rounded-full bg-current self-start" />
      <div className="w-2 h-2 rounded-full bg-current self-end" />
    </div>
  ),
  3: (
    <div className="relative w-full h-full p-1.5">
      <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-current" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-current" />
      <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-current" />
    </div>
  ),
  4: (
    <div className="grid grid-cols-2 gap-1.5 p-1.5 w-full h-full">
      <div className="w-2 h-2 rounded-full bg-current" />
      <div className="w-2 h-2 rounded-full bg-current justify-self-end" />
      <div className="w-2 h-2 rounded-full bg-current self-end" />
      <div className="w-2 h-2 rounded-full bg-current justify-self-end self-end" />
    </div>
  ),
  5: (
    <div className="relative w-full h-full p-1.5">
      <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-current" />
      <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-current" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-current" />
      <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full bg-current" />
      <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-current" />
    </div>
  ),
  6: (
    <div className="grid grid-cols-2 gap-1 p-1.5 w-full h-full">
      <div className="w-2 h-2 rounded-full bg-current" />
      <div className="w-2 h-2 rounded-full bg-current justify-self-end" />
      <div className="w-2 h-2 rounded-full bg-current" />
      <div className="w-2 h-2 rounded-full bg-current justify-self-end" />
      <div className="w-2 h-2 rounded-full bg-current" />
      <div className="w-2 h-2 rounded-full bg-current justify-self-end" />
    </div>
  ),
};

function Die({ value, rolling, index }: DieProps) {
  const [displayValue, setDisplayValue] = React.useState<number>(1);

  React.useEffect(() => {
    if (rolling) {
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 80);
      return () => clearInterval(interval);
    } else if (value !== null) {
      setDisplayValue(value);
    }
  }, [rolling, value]);

  return (
    <div
      className={cn(
        "w-12 h-12 rounded-lg bg-white text-slate-900",
        "shadow-lg",
        "transition-transform duration-200",
        rolling && "animate-bounce",
        value === 6 && "ring-2 ring-gold shadow-gold/50"
      )}
      style={{
        animationDelay: rolling ? `${index * 50}ms` : undefined,
      }}
    >
      {DIE_FACES[displayValue]}
    </div>
  );
}

// =============================================================================
// Roll Result Display
// =============================================================================

interface RollResultProps {
  roll: TutorialDiceRoll;
}

function RollResult({ roll }: RollResultProps) {
  const resultType = roll.criticalSuccess
    ? "critical"
    : roll.criticalFailure
    ? "fumble"
    : roll.success
    ? "success"
    : "failure";

  const resultConfig = {
    critical: {
      icon: "🌟",
      title: "Critical Success!",
      color: "text-gold",
      bgColor: "bg-gold/20",
      message: "Two or more sixes! Something amazing happens!",
    },
    success: {
      icon: "✓",
      title: "Success!",
      color: "text-success",
      bgColor: "bg-success/20",
      message: "You beat the difficulty!",
    },
    failure: {
      icon: "✗",
      title: "Failure",
      color: "text-error",
      bgColor: "bg-error/20",
      message: "You didn't reach the target, but you can try again!",
    },
    fumble: {
      icon: "💀",
      title: "Critical Failure!",
      color: "text-error",
      bgColor: "bg-error/20",
      message: "All ones! Something goes very wrong...",
    },
  };

  const config = resultConfig[resultType];

  return (
    <div
      className={cn(
        "p-4 rounded-xl border-2",
        config.bgColor,
        `border-${config.color.replace("text-", "")}/30`
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{config.icon}</span>
        <h3 className={cn("text-xl font-bold", config.color)}>{config.title}</h3>
      </div>
      <div className="space-y-2 text-muted-foreground">
        <p>
          You rolled: <strong className="text-foreground">{roll.dice.join(" + ")} = {roll.total}</strong>
        </p>
        <p>
          You needed: <strong className="text-foreground">{roll.difficulty}</strong>
        </p>
        <p className="text-sm">{config.message}</p>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function DiceRollingStep({
  step: _step,
  onComplete,
  onBack,
  character,
  scenario = DICE_SCENARIO,
}: DiceRollingStepProps) {
  const [phase, setPhase] = React.useState<"intro" | "rolling" | "result" | "explain-failure">("intro");
  const [rolling, setRolling] = React.useState(false);
  const [roll, setRoll] = React.useState<TutorialDiceRoll | null>(null);
  const [rollCount, setRollCount] = React.useState(0);

  const attributeValue = character[scenario.attribute];
  const diceCount = attributeValue;

  const performRoll = () => {
    setRolling(true);
    setPhase("rolling");

    // Generate dice values after animation
    setTimeout(() => {
      const dice = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
      const total = dice.reduce((a, b) => a + b, 0);
      const sixes = dice.filter((d) => d === 6).length;
      const ones = dice.filter((d) => d === 1).length;

      const newRoll: TutorialDiceRoll = {
        dice,
        total,
        difficulty: scenario.difficulty,
        success: total >= scenario.difficulty,
        criticalSuccess: sixes >= 2,
        criticalFailure: ones === diceCount,
      };

      setRoll(newRoll);
      setRolling(false);
      setRollCount((c) => c + 1);

      // Show result phase
      setTimeout(() => {
        setPhase("result");
        // If first failure, explain what happens
        if (!newRoll.success && rollCount === 0) {
          setTimeout(() => setPhase("explain-failure"), 2000);
        }
      }, 500);
    }, 1200);
  };

  const canContinue = roll !== null && (roll.success || rollCount >= 2);

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Rolling Dice</h1>
        <p className="text-muted-foreground">
          Learn how dice determine success and failure
        </p>
      </div>

      {/* Scenario */}
      <div className="bg-surface-elevated rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-foreground mb-2">📜 Scenario</h2>
        <p className="text-muted-foreground mb-4">{scenario.description}</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-1 bg-surface-base rounded-full">
            <span className="capitalize">{scenario.attribute}:</span>
            <strong className="text-foreground">{attributeValue}</strong>
            <span className="text-muted-foreground">→ Roll {diceCount} dice</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-surface-base rounded-full">
            <span>Difficulty:</span>
            <strong className="text-foreground">{scenario.difficulty}</strong>
            <span className="text-muted-foreground">→ Need {scenario.difficulty}+ to succeed</span>
          </div>
        </div>
      </div>

      {/* Dice Area */}
      <div className="flex flex-col items-center py-8">
        {/* Dice */}
        <div className="flex gap-3 mb-6">
          {Array.from({ length: diceCount }).map((_, i) => (
            <Die
              key={i}
              value={roll?.dice[i] ?? null}
              rolling={rolling}
              index={i}
            />
          ))}
        </div>

        {/* Roll Button */}
        {(phase === "intro" || (phase === "result" && !roll?.success)) && (
          <button
            onClick={performRoll}
            disabled={rolling}
            className={cn(
              "px-8 py-4 rounded-xl font-bold text-lg",
              "bg-gradient-to-br from-bronze to-bronze-600 text-white",
              "hover:brightness-110 transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            🎲 Roll the Dice!
          </button>
        )}

        {/* Result */}
        {phase === "result" && roll && <RollResult roll={roll} />}

        {/* Failure explanation */}
        {phase === "explain-failure" && roll && !roll.success && (
          <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
            <h3 className="font-semibold text-foreground mb-2">💡 What happens on failure?</h3>
            <p className="text-muted-foreground text-sm">
              In SPARC, failure isn&apos;t the end! The Seer might let you try again,
              offer an alternative, or introduce a complication that makes the story
              more interesting. You can roll again now if you want!
            </p>
          </div>
        )}
      </div>

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

export type { DiceRollingStepProps } from "../types";
