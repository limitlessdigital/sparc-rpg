"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { Badge } from "../Badge";
import type { CombatLogEntry } from "./types";

export interface CombatLogProps {
  /** Log entries */
  entries: CombatLogEntry[];
  /** Max entries to show (default 50) */
  maxEntries?: number;
  /** Auto-scroll to latest */
  autoScroll?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Custom class name */
  className?: string;
}

function getActionIcon(action: CombatLogEntry["action"]): string {
  const icons: Record<string, string> = {
    start: "🎬",
    end: "🏁",
    attack: "⚔️",
    defend: "🛡️",
    ability: "✨",
    item: "🧪",
    flee: "🏃",
    skip: "⏳",
    damage: "💥",
    heal: "💚",
    condition: "⚠️",
  };
  return icons[action] || "•";
}

function getActionColor(entry: CombatLogEntry): string {
  if (entry.isCritical) return "text-gold";
  if (entry.isSuccess === true) return "text-success";
  if (entry.isSuccess === false) return "text-error";
  
  switch (entry.action) {
    case "damage":
      return "text-error";
    case "heal":
      return "text-success";
    case "start":
    case "end":
      return "text-gold";
    default:
      return "text-foreground";
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function LogEntryCompact({ entry }: { entry: CombatLogEntry }) {
  return (
    <div className="flex items-start gap-2 py-1.5 px-2 hover:bg-surface-elevated rounded">
      <span className="text-sm">{getActionIcon(entry.action)}</span>
      <span className={cn("text-sm flex-1", getActionColor(entry))}>
        {entry.narrative}
      </span>
    </div>
  );
}

function LogEntryFull({ entry }: { entry: CombatLogEntry }) {
  return (
    <div className={cn(
      "p-3 rounded-lg border transition-all",
      entry.isCritical && "border-gold bg-gold/5",
      !entry.isCritical && "border-surface-divider bg-surface-card"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getActionIcon(entry.action)}</span>
          <span className="font-semibold">{entry.actorName}</span>
          {entry.targetName && (
            <>
              <span className="text-muted-foreground">→</span>
              <span className="font-medium">{entry.targetName}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" size="sm">
            R{entry.round}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(entry.timestamp)}
          </span>
        </div>
      </div>

      {/* Narrative */}
      <p className={cn("text-sm", getActionColor(entry))}>
        {entry.narrative}
      </p>

      {/* Dice rolls */}
      {entry.rolls && entry.rolls.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {entry.rolls.map((roll, i) => (
            <div
              key={i}
              className="flex items-center gap-1 text-xs bg-surface-elevated px-2 py-1 rounded"
            >
              <span>🎲</span>
              <span className="font-mono">
                [{roll.dice.join(", ")}]
              </span>
              <span className="text-muted-foreground">=</span>
              <span className="font-bold">{roll.total}</span>
              <Badge
                variant={
                  roll.result === "critical-success" ? "success" :
                  roll.result === "critical-failure" ? "error" :
                  roll.result === "success" ? "success" :
                  roll.result === "partial" ? "warning" : "error"
                }
                size="sm"
              >
                {roll.result.replace("-", " ")}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Damage/Healing amounts */}
      {(entry.damage || entry.healing) && (
        <div className="mt-2 flex gap-2">
          {entry.damage && (
            <Badge variant="error" size="sm">
              💥 {entry.damage} damage
            </Badge>
          )}
          {entry.healing && (
            <Badge variant="success" size="sm">
              💚 {entry.healing} healed
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

export function CombatLog({
  entries,
  maxEntries = 50,
  autoScroll = true,
  compact = false,
  className,
}: CombatLogProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const displayEntries = entries.slice(-maxEntries).reverse();

  // Auto-scroll to latest entry
  React.useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [entries.length, autoScroll]);

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-surface-divider">
        <h3 className="font-bold flex items-center gap-2">
          📜 Combat Log
          <Badge variant="outline" size="sm">
            {entries.length} entries
          </Badge>
        </h3>
      </div>

      {/* Log entries */}
      <div
        ref={scrollRef}
        className={cn(
          "flex-1 overflow-y-auto",
          compact ? "space-y-0" : "space-y-2 py-2"
        )}
      >
        {displayEntries.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Combat log is empty
          </p>
        ) : (
          displayEntries.map((entry) => (
            compact ? (
              <LogEntryCompact key={entry.id} entry={entry} />
            ) : (
              <LogEntryFull key={entry.id} entry={entry} />
            )
          ))
        )}
      </div>
    </div>
  );
}

// Floating combat log for overlay display
export function FloatingCombatLog({
  entries,
  maxVisible = 5,
  className,
}: {
  entries: CombatLogEntry[];
  maxVisible?: number;
  className?: string;
}) {
  const recentEntries = entries.slice(-maxVisible).reverse();

  return (
    <div className={cn(
      "space-y-1 pointer-events-none",
      className
    )}>
      {recentEntries.map((entry, index) => (
        <div
          key={entry.id}
          className={cn(
            "px-3 py-2 rounded-lg backdrop-blur-sm transition-all duration-300",
            "bg-surface-card/80 border border-surface-divider",
            index === 0 && "animate-in slide-in-from-bottom-2"
          )}
          style={{
            opacity: 1 - (index * 0.15),
          }}
        >
          <span className="text-sm">
            {getActionIcon(entry.action)}{" "}
            <span className={getActionColor(entry)}>
              {entry.narrative}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
