"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "../Button";
import { Card, CardContent, CardHeader, CardTitle } from "../Card";
import { Badge } from "../Badge";
import type { CombatAction, PlayerCombatant, CombatUIState } from "./types";
import type { Ability } from "../character-sheet";

export interface CombatActionsPanelProps {
  /** Current player combatant */
  combatant: PlayerCombatant;
  /** UI state */
  uiState: CombatUIState;
  /** Whether it's this player's turn */
  isMyTurn: boolean;
  /** Whether flee is allowed */
  canFlee?: boolean;
  /** Selected action callback */
  onSelectAction: (action: CombatAction, abilityId?: string) => void;
  /** Cancel action callback */
  onCancel?: () => void;
  /** Custom class name */
  className?: string;
}

interface ActionButtonConfig {
  action: CombatAction;
  label: string;
  icon: string;
  description: string;
  variant: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
}

export function CombatActionsPanel({
  combatant,
  uiState,
  isMyTurn,
  canFlee = true,
  onSelectAction,
  onCancel,
  className,
}: CombatActionsPanelProps) {
  const [showAbilities, setShowAbilities] = React.useState(false);

  const character = combatant.character;
  const activeAbilities = character.abilities.filter(
    (a) => a.type === "active" && (a.usesRemaining === undefined || a.usesRemaining > 0)
  );

  const baseActions: ActionButtonConfig[] = [
    {
      action: "attack",
      label: "Attack",
      icon: "⚔️",
      description: "Make a basic attack against an enemy",
      variant: "primary",
    },
    {
      action: "defend",
      label: "Defend",
      icon: "🛡️",
      description: "Take a defensive stance (+2 defense until next turn)",
      variant: "secondary",
    },
    {
      action: "flee",
      label: "Flee",
      icon: "🏃",
      description: "Attempt to escape combat",
      variant: "ghost",
      disabled: !canFlee,
    },
    {
      action: "skip",
      label: "Wait",
      icon: "⏳",
      description: "Skip your turn",
      variant: "ghost",
    },
  ];

  const isDisabled = !isMyTurn || uiState !== "select_action";

  // Show waiting state
  if (!isMyTurn) {
    return (
      <Card className={cn("bg-surface-card", className)}>
        <CardContent className="py-8 text-center">
          <div className="text-4xl mb-3 animate-pulse">⏳</div>
          <p className="text-muted-foreground">Waiting for your turn...</p>
          <p className="text-sm text-muted-foreground mt-1">
            Watch the initiative tracker to see when you're up
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show selecting target state
  if (uiState === "select_target") {
    return (
      <Card className={cn("bg-surface-card border-gold", className)}>
        <CardContent className="py-6 text-center">
          <div className="text-4xl mb-3">🎯</div>
          <p className="font-semibold text-gold">Select a target</p>
          <p className="text-sm text-muted-foreground mt-1">
            Click on an enemy to target them
          </p>
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="mt-4"
            >
              ← Back to actions
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show rolling state
  if (uiState === "rolling" || uiState === "resolving") {
    return (
      <Card className={cn("bg-surface-card", className)}>
        <CardContent className="py-8 text-center">
          <div className="text-4xl mb-3 animate-bounce">🎲</div>
          <p className="font-semibold">
            {uiState === "rolling" ? "Rolling dice..." : "Resolving action..."}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show heroic save prompt
  if (uiState === "heroic_save") {
    return (
      <Card className={cn("bg-surface-card border-warning", className)}>
        <CardContent className="py-6 text-center space-y-4">
          <div className="text-4xl">💫</div>
          <div>
            <p className="font-semibold text-warning">Your attack missed!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Would you like to use your Heroic Save to reroll?
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              variant="primary"
              onClick={() => onSelectAction("ability", "heroic-save")}
              disabled={combatant.heroicSaveUsed}
            >
              ✨ Use Heroic Save
            </Button>
            <Button
              variant="ghost"
              onClick={onCancel}
            >
              Accept Miss
            </Button>
          </div>
          {combatant.heroicSaveUsed && (
            <p className="text-xs text-error">
              Heroic Save already used this encounter
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-surface-card", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            ⚡ Your Turn
            <Badge variant="success" size="sm">
              {character.name}
            </Badge>
          </span>
          {combatant.heroicSaveUsed && (
            <Badge variant="outline" size="sm" className="text-muted-foreground">
              Heroic Save Used
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main actions */}
        <div className="grid grid-cols-2 gap-3">
          {baseActions.map((config) => (
            <Button
              key={config.action}
              variant={config.variant}
              onClick={() => onSelectAction(config.action)}
              disabled={isDisabled || config.disabled}
              className={cn(
                "h-auto py-3 flex-col gap-1",
                config.action === "attack" && "col-span-2"
              )}
            >
              <span className="text-xl">{config.icon}</span>
              <span className="font-semibold">{config.label}</span>
              <span className="text-xs opacity-70 font-normal">
                {config.description}
              </span>
            </Button>
          ))}
        </div>

        {/* Abilities section */}
        {activeAbilities.length > 0 && (
          <div className="space-y-2">
            <Button
              variant="secondary"
              onClick={() => setShowAbilities(!showAbilities)}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                ✨ Special Abilities
                <Badge variant="outline" size="sm">
                  {activeAbilities.length}
                </Badge>
              </span>
              <span>{showAbilities ? "▲" : "▼"}</span>
            </Button>
            
            {showAbilities && (
              <div className="space-y-2 pl-2 border-l-2 border-gold/30">
                {activeAbilities.map((ability) => (
                  <AbilityButton
                    key={ability.id}
                    ability={ability}
                    onClick={() => onSelectAction("ability", ability.id)}
                    disabled={isDisabled}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Conditions display */}
        {combatant.conditions.length > 0 && (
          <div className="pt-2 border-t border-surface-divider">
            <p className="text-xs text-muted-foreground mb-2">Active Conditions</p>
            <div className="flex flex-wrap gap-1">
              {combatant.conditions.map((condition) => (
                <Badge key={condition.id} variant="warning" size="sm">
                  {getConditionIcon(condition.type)} {condition.type} ({condition.duration})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AbilityButton({
  ability,
  onClick,
  disabled,
}: {
  ability: Ability;
  onClick: () => void;
  disabled: boolean;
}) {
  const usesText = ability.usesPerSession !== undefined
    ? `${ability.usesRemaining ?? ability.usesPerSession}/${ability.usesPerSession} uses`
    : null;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-all",
        "bg-surface-elevated border-surface-divider",
        "hover:border-gold hover:bg-gold/5",
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{ability.name}</span>
        {usesText && (
          <Badge variant="outline" size="sm">
            {usesText}
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        {ability.description}
      </p>
    </button>
  );
}

function getConditionIcon(type: string): string {
  const icons: Record<string, string> = {
    stunned: "😵",
    poisoned: "🤢",
    blessed: "✨",
    shielded: "🛡️",
    burning: "🔥",
    frozen: "❄️",
    weakened: "📉",
    strengthened: "📈",
  };
  return icons[type] || "⚠️";
}
