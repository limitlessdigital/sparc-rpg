"use client";

import { cn } from "../lib/utils";
import { Badge } from "../Badge";
import { Avatar } from "../Avatar";
import type { InitiativeEntry, Combatant, CombatState } from "./types";
import { isAlive, getCombatantHP, isPlayerCombatant } from "./types";

// Get initials from name (e.g., "Goblin 1" -> "G1")
function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length === 1) return name.charAt(0).toUpperCase();
  return parts.map(p => p.charAt(0).toUpperCase()).slice(0, 2).join("");
}

export interface InitiativeTrackerProps {
  /** Current combat state */
  combat: CombatState;
  /** Current player's character ID (to highlight their turn) */
  currentPlayerId?: string;
  /** Compact horizontal mode */
  compact?: boolean;
  /** Custom class name */
  className?: string;
}

function getCombatantFromEntry(
  entry: InitiativeEntry, 
  combat: CombatState
): Combatant | undefined {
  if (entry.type === "player") {
    return combat.playerCombatants.find(p => p.id === entry.combatantId);
  }
  return combat.enemyCombatants.find(e => e.id === entry.combatantId);
}

function InitiativeEntryItem({
  entry,
  combatant,
  isCurrentTurn,
  isCurrentPlayer,
  compact,
}: {
  entry: InitiativeEntry;
  combatant?: Combatant;
  isCurrentTurn: boolean;
  isCurrentPlayer: boolean;
  compact: boolean;
}) {
  const alive = combatant ? isAlive(combatant) : true;
  const hp = combatant ? getCombatantHP(combatant) : null;
  const hpPercent = hp ? Math.max(0, (hp.current / hp.max) * 100) : 100;
  
  const isPlayer = entry.type === "player";
  
  if (compact) {
    return (
      <div
        className={cn(
          "relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
          isCurrentTurn && "ring-2 ring-gold bg-gold/10",
          !alive && "opacity-40",
          !isCurrentTurn && alive && "bg-surface-elevated"
        )}
      >
        <Avatar
          fallback={getInitials(entry.name)}
          size="sm"
          className={cn(!alive && "grayscale")}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className={cn(
              "font-medium text-sm truncate",
              isCurrentPlayer && "text-gold"
            )}>
              {entry.name}
            </span>
            {isCurrentTurn && (
              <span className="animate-pulse">⚔️</span>
            )}
          </div>
          {hp && (
            <div className="h-1 mt-1 bg-surface-divider rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500",
                  hpPercent > 50 ? "bg-success" : hpPercent > 25 ? "bg-warning" : "bg-error"
                )}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          )}
        </div>
        <Badge
          variant={isPlayer ? "success" : "error"}
          size="sm"
        >
          {entry.initiative}
        </Badge>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 p-3 rounded-lg border transition-all",
        isCurrentTurn && "ring-2 ring-gold bg-gold/5 border-gold",
        !isCurrentTurn && alive && "border-surface-divider bg-surface-card hover:bg-surface-elevated",
        !alive && "opacity-40 border-surface-divider bg-surface-card"
      )}
    >
      {/* Turn indicator */}
      {isCurrentTurn && (
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-8 bg-gold rounded-r animate-pulse" />
      )}
      
      {/* Avatar/Icon */}
      <div className="relative">
        <Avatar
          fallback={getInitials(entry.name)}
          size="md"
          className={cn(!alive && "grayscale")}
        />
        {!alive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <span>💀</span>
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-semibold truncate",
            isCurrentPlayer && "text-gold",
            !alive && "line-through"
          )}>
            {entry.name}
          </span>
          <Badge
            variant={isPlayer ? "attribute" : "error"}
            attribute={isPlayer ? "heart" : undefined}
            size="sm"
          >
            {isPlayer ? "Player" : "Enemy"}
          </Badge>
        </div>
        
        {/* HP Bar */}
        {hp && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">HP</span>
              <span className={cn(
                "font-medium tabular-nums",
                hpPercent > 50 ? "text-success" : hpPercent > 25 ? "text-warning" : "text-error"
              )}>
                {hp.current}/{hp.max}
              </span>
            </div>
            <div className="h-2 bg-surface-divider rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500 rounded-full",
                  hpPercent > 50 ? "bg-success" : hpPercent > 25 ? "bg-warning" : "bg-error"
                )}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Conditions */}
        {combatant && combatant.conditions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {combatant.conditions.map((condition) => (
              <Badge key={condition.id} variant="outline" size="sm">
                {getConditionIcon(condition.type)} {condition.duration}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {/* Initiative score */}
      <div className="text-right">
        <div className="text-2xl font-bold text-muted-foreground">
          {entry.initiative}
        </div>
        <div className="text-xs text-muted-foreground">Init</div>
      </div>
    </div>
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

export function InitiativeTracker({
  combat,
  currentPlayerId,
  compact = false,
  className,
}: InitiativeTrackerProps) {
  const currentEntry = combat.initiativeOrder[combat.currentTurnIndex];
  
  // Sort entries, keeping dead ones at the end
  const sortedEntries = [...combat.initiativeOrder].sort((a, b) => {
    const combatantA = getCombatantFromEntry(a, combat);
    const combatantB = getCombatantFromEntry(b, combat);
    const aliveA = combatantA ? isAlive(combatantA) : true;
    const aliveB = combatantB ? isAlive(combatantB) : true;
    
    // Living combatants first
    if (aliveA !== aliveB) return aliveA ? -1 : 1;
    
    // Then by initiative order (higher first)
    return b.initiative - a.initiative;
  });

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold flex items-center gap-2">
          ⚔️ Initiative
          <Badge variant="outline">Round {combat.roundNumber}</Badge>
        </h3>
      </div>
      
      {/* Entry list */}
      <div className={cn(
        "space-y-2",
        compact && "flex flex-row gap-2 space-y-0 overflow-x-auto pb-2"
      )}>
        {sortedEntries.map((entry) => {
          const combatant = getCombatantFromEntry(entry, combat);
          const isCurrentTurn = currentEntry?.id === entry.id;
          const isCurrentPlayer = currentPlayerId && 
            entry.type === "player" && 
            combatant && 
            isPlayerCombatant(combatant) && 
            combatant.characterId === currentPlayerId;
          
          return (
            <InitiativeEntryItem
              key={entry.id}
              entry={entry}
              combatant={combatant}
              isCurrentTurn={isCurrentTurn}
              isCurrentPlayer={!!isCurrentPlayer}
              compact={compact}
            />
          );
        })}
      </div>
    </div>
  );
}
