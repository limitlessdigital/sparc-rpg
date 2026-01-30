"use client";

/**
 * @sparc/ui CombatPracticeStep
 * 
 * Based on PRD 15: Onboarding Tutorial
 * Interactive mini-combat encounter to teach combat basics.
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import type { CombatPracticeStepProps, TutorialCombatState } from "../types";
import { TUTORIAL_CHARACTER, TUTORIAL_ENEMY } from "../tutorial-steps";

// =============================================================================
// Combat Phase Display
// =============================================================================

const PHASE_INFO = {
  initiative: {
    title: "Roll Initiative",
    description: "Who goes first? Roll to determine turn order!",
    action: "Roll Initiative",
    icon: "⚡",
  },
  "player-turn": {
    title: "Your Turn",
    description: "Choose your action: Attack the goblin!",
    action: "Attack!",
    icon: "⚔️",
  },
  "enemy-turn": {
    title: "Enemy Turn",
    description: "The goblin strikes back...",
    action: null,
    icon: "👹",
  },
  victory: {
    title: "Victory!",
    description: "You defeated the goblin!",
    action: null,
    icon: "🎉",
  },
  defeat: {
    title: "Knocked Out",
    description: "Don't worry, this is just practice!",
    action: "Try Again",
    icon: "💫",
  },
} as const;

// =============================================================================
// HP Bar Component
// =============================================================================

interface HPBarProps {
  current: number;
  max: number;
  label: string;
  showChange?: number;
}

function HPBar({ current, max, label, showChange }: HPBarProps) {
  const percentage = Math.max(0, (current / max) * 100);
  const isLow = percentage <= 30;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className={cn("text-sm font-bold", isLow ? "text-error" : "text-foreground")}>
          {current}/{max}
          {showChange && showChange !== 0 && (
            <span
              className={cn(
                "ml-2 text-sm animate-in fade-in-0 slide-in-from-top-2",
                showChange > 0 ? "text-success" : "text-error"
              )}
            >
              {showChange > 0 ? "+" : ""}{showChange}
            </span>
          )}
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isLow ? "bg-error" : "bg-success"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// =============================================================================
// Combatant Card Component
// =============================================================================

interface CombatantCardProps {
  icon: string;
  name: string;
  hp: number;
  maxHp: number;
  isActive: boolean;
  initiative?: number;
  hpChange?: number;
}

function CombatantCard({
  icon,
  name,
  hp,
  maxHp,
  isActive,
  initiative,
  hpChange,
}: CombatantCardProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-xl transition-all",
        isActive
          ? "bg-bronze/20 ring-2 ring-bronze"
          : "bg-surface-elevated"
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="font-bold text-foreground">{name}</h3>
          {initiative !== undefined && (
            <span className="text-xs text-muted-foreground">
              Initiative: {initiative}
            </span>
          )}
        </div>
      </div>
      <HPBar current={hp} max={maxHp} label="HP" showChange={hpChange} />
    </div>
  );
}

// =============================================================================
// Combat Log Component
// =============================================================================

interface CombatLogProps {
  entries: string[];
}

function CombatLog({ entries }: CombatLogProps) {
  const logRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <div
      ref={logRef}
      className="h-32 overflow-y-auto bg-surface-base rounded-lg p-3 text-sm"
    >
      {entries.map((entry, i) => (
        <p
          key={i}
          className={cn(
            "py-1 border-b border-border-default last:border-0",
            "animate-in fade-in-0 slide-in-from-bottom-2"
          )}
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {entry}
        </p>
      ))}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function CombatPracticeStep({
  step: _step,
  onComplete,
  onBack,
  character = TUTORIAL_CHARACTER,
  enemy = TUTORIAL_ENEMY,
}: CombatPracticeStepProps) {
  const [combat, setCombat] = React.useState<TutorialCombatState>({
    phase: "initiative",
    playerInitiative: 0,
    enemyInitiative: 0,
    playerHP: character.hp,
    enemyHP: enemy.hp,
    round: 1,
    log: [],
  });
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [hpChanges, setHpChanges] = React.useState<{ player?: number; enemy?: number }>({});

  const phaseInfo = PHASE_INFO[combat.phase];

  // Roll a d6
  const rollD6 = () => Math.floor(Math.random() * 6) + 1;

  // Add to combat log
  const addLog = (message: string) => {
    setCombat((prev) => ({
      ...prev,
      log: [...prev.log, message],
    }));
  };

  // Handle initiative roll
  const rollInitiative = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const playerInit = rollD6() + rollD6();
      const enemyInit = rollD6() + rollD6();

      setCombat((prev) => ({
        ...prev,
        playerInitiative: playerInit,
        enemyInitiative: enemyInit,
        log: [
          ...prev.log,
          `⚡ Initiative: ${character.name} rolled ${playerInit}`,
          `⚡ Initiative: ${enemy.name} rolled ${enemyInit}`,
          playerInit >= enemyInit
            ? `${character.name} goes first!`
            : `${enemy.name} goes first!`,
        ],
        phase: playerInit >= enemyInit ? "player-turn" : "enemy-turn",
      }));
      setIsAnimating(false);

      // If enemy goes first, auto-run their turn
      if (enemyInit > playerInit) {
        setTimeout(() => runEnemyTurn(), 1500);
      }
    }, 800);
  };

  // Handle player attack
  const playerAttack = () => {
    setIsAnimating(true);
    setTimeout(() => {
      // Roll attack (using Might dice vs defense)
      const attackDice = Array.from({ length: character.might }, () => rollD6());
      const attackTotal = attackDice.reduce((a, b) => a + b, 0);
      const hit = attackTotal >= enemy.defense;
      const damage = hit ? 2 : 0; // Fixed damage for tutorial

      const newEnemyHP = Math.max(0, combat.enemyHP - damage);

      addLog(`⚔️ ${character.name} attacks! Rolled ${attackDice.join("+")}=${attackTotal} vs ${enemy.defense}`);
      addLog(hit ? `💥 Hit! Dealt ${damage} damage.` : `❌ Miss!`);

      setHpChanges({ enemy: hit ? -damage : undefined });
      setTimeout(() => setHpChanges({}), 1000);

      setCombat((prev) => ({
        ...prev,
        enemyHP: newEnemyHP,
        phase: newEnemyHP <= 0 ? "victory" : "enemy-turn",
      }));

      setIsAnimating(false);

      // If enemy still alive, run their turn
      if (newEnemyHP > 0) {
        setTimeout(() => runEnemyTurn(), 1500);
      }
    }, 800);
  };

  // Handle enemy turn
  const runEnemyTurn = () => {
    setIsAnimating(true);
    setTimeout(() => {
      // Enemy always hits for tutorial simplicity
      const damage = enemy.damage;
      const newPlayerHP = Math.max(0, combat.playerHP - damage);

      addLog(`👹 ${enemy.name} attacks!`);
      addLog(`💥 ${character.name} takes ${damage} damage.`);

      setHpChanges({ player: -damage });
      setTimeout(() => setHpChanges({}), 1000);

      setCombat((prev) => ({
        ...prev,
        playerHP: newPlayerHP,
        round: prev.round + 1,
        phase: newPlayerHP <= 0 ? "defeat" : "player-turn",
      }));

      setIsAnimating(false);
    }, 800);
  };

  // Reset combat
  const resetCombat = () => {
    setCombat({
      phase: "initiative",
      playerInitiative: 0,
      enemyInitiative: 0,
      playerHP: character.hp,
      enemyHP: enemy.hp,
      round: 1,
      log: [],
    });
    setHpChanges({});
  };

  // Handle action button click
  const handleAction = () => {
    switch (combat.phase) {
      case "initiative":
        rollInitiative();
        break;
      case "player-turn":
        playerAttack();
        break;
      case "defeat":
        resetCombat();
        break;
    }
  };

  const isVictory = combat.phase === "victory";

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">⚔️ Combat Tutorial</h1>
        <p className="text-muted-foreground">
          Practice a simple combat encounter
        </p>
      </div>

      {/* Phase indicator */}
      <div className="bg-surface-elevated rounded-xl p-4 mb-6 text-center">
        <span className="text-2xl mr-2">{phaseInfo.icon}</span>
        <h2 className="inline text-lg font-bold text-foreground">{phaseInfo.title}</h2>
        <p className="text-muted-foreground text-sm mt-1">{phaseInfo.description}</p>
      </div>

      {/* Combat arena */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <CombatantCard
          icon="⚔️"
          name={character.name}
          hp={combat.playerHP}
          maxHp={character.maxHp}
          isActive={combat.phase === "player-turn"}
          initiative={combat.playerInitiative || undefined}
          hpChange={hpChanges.player}
        />
        <CombatantCard
          icon={enemy.icon}
          name={enemy.name}
          hp={combat.enemyHP}
          maxHp={enemy.maxHp}
          isActive={combat.phase === "enemy-turn"}
          initiative={combat.enemyInitiative || undefined}
          hpChange={hpChanges.enemy}
        />
      </div>

      {/* Combat log */}
      <CombatLog entries={combat.log} />

      {/* Action button */}
      {phaseInfo.action && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleAction}
            disabled={isAnimating}
            className={cn(
              "px-8 py-4 rounded-xl font-bold text-lg",
              "bg-gradient-to-br from-bronze to-bronze-600 text-white",
              "hover:brightness-110 transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isAnimating ? "..." : phaseInfo.action}
          </button>
        </div>
      )}

      {/* Victory message */}
      {isVictory && (
        <div className="mt-6 p-6 bg-gold/20 rounded-xl border-2 border-gold/50 text-center">
          <h2 className="text-2xl font-bold text-gold mb-2">🎉 Victory!</h2>
          <p className="text-muted-foreground mb-4">
            You defeated the goblin! You now know the basics of combat in SPARC.
          </p>
          <div className="bg-surface-elevated rounded-lg p-4 text-left">
            <h3 className="font-semibold text-foreground mb-2">What you learned:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✓ Initiative determines turn order</li>
              <li>✓ Roll your attribute dice vs enemy defense</li>
              <li>✓ Hit = deal damage, Miss = try again next turn</li>
              <li>✓ Reduce enemy HP to 0 to win!</li>
            </ul>
          </div>
        </div>
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
          disabled={!isVictory}
          className={cn(
            "ml-auto px-6 py-3 rounded-lg font-semibold transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-2",
            isVictory
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

export type { CombatPracticeStepProps } from "../types";
