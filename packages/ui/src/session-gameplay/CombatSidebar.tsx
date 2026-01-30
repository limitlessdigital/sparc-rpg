"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export interface CombatParticipant {
  id: string;
  name: string;
  initiative: number;
  currentHP: number;
  maxHP: number;
  type: "player" | "enemy";
  isCurrentTurn: boolean;
  avatarUrl?: string;
  conditions?: string[];
}

export interface CombatSidebarProps {
  /** Title for the sidebar */
  title?: string;
  /** Array of combat participants in initiative order */
  participants: CombatParticipant[];
  /** Current round number */
  roundNumber: number;
  /** On participant click */
  onParticipantClick?: (participant: CombatParticipant) => void;
  /** Compact mode */
  compact?: boolean;
  /** Custom class name */
  className?: string;
}

function HPBar({
  current,
  max,
  showNumbers = true,
  size = "md",
}: {
  current: number;
  max: number;
  showNumbers?: boolean;
  size?: "sm" | "md";
}) {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));
  const colorClass = percent > 50 
    ? "bg-bronze-400" 
    : percent > 25 
      ? "bg-warning" 
      : "bg-error";

  return (
    <div className="space-y-0.5">
      <div className={cn(
        "w-full bg-[#1a2a3c] rounded-sm overflow-hidden",
        size === "sm" ? "h-1.5" : "h-2"
      )}>
        <div
          className={cn("h-full transition-all duration-500", colorClass)}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showNumbers && (
        <div className={cn(
          "text-right font-mono tabular-nums",
          size === "sm" ? "text-[10px]" : "text-xs",
          percent > 50 ? "text-bronze-300" : percent > 25 ? "text-warning" : "text-error"
        )}>
          {current}/{max}
        </div>
      )}
    </div>
  );
}

function ParticipantRow({
  participant,
  onClick,
  compact,
}: {
  participant: CombatParticipant;
  onClick?: () => void;
  compact: boolean;
}) {
  const isPlayer = participant.type === "player";
  const isDead = participant.currentHP <= 0;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left",
        participant.isCurrentTurn 
          ? "bg-gold/10 border border-gold/50" 
          : "bg-[#0d1f35]/50 border border-transparent hover:border-[#2a4a6c]/50",
        isDead && "opacity-50",
        onClick && "cursor-pointer"
      )}
    >
      {/* Turn indicator */}
      {participant.isCurrentTurn && (
        <div className="w-1 h-8 bg-gold rounded-full animate-pulse" />
      )}

      {/* Avatar/Icon */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-sm font-bold",
        isPlayer ? "bg-[#2a4a6c] text-[#8ab4dc]" : "bg-[#4a2a2a] text-[#dc8a8a]",
        isDead && "grayscale"
      )}>
        {participant.avatarUrl ? (
          <img
            src={participant.avatarUrl}
            alt={participant.name}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          participant.name.charAt(0).toUpperCase()
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className={cn(
            "font-medium text-sm truncate",
            isPlayer ? "text-[#b8d0e8]" : "text-[#dcb8b8]",
            isDead && "line-through"
          )}>
            {participant.name}
          </span>
          {isDead && <span className="text-xs">💀</span>}
        </div>
        {!compact && (
          <HPBar
            current={participant.currentHP}
            max={participant.maxHP}
            showNumbers={!compact}
            size={compact ? "sm" : "md"}
          />
        )}
      </div>

      {/* Initiative badge */}
      <div className={cn(
        "flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
        "bg-[#1a3a5c] text-[#6a9acc]"
      )}>
        {participant.initiative}
      </div>
    </button>
  );
}

export function CombatSidebar({
  title = "Next Turn",
  participants,
  roundNumber,
  onParticipantClick,
  compact = false,
  className,
}: CombatSidebarProps) {
  // Sort by initiative (highest first), dead at the end
  const sortedParticipants = [...participants].sort((a, b) => {
    // Dead participants at the end
    if (a.currentHP <= 0 && b.currentHP > 0) return 1;
    if (a.currentHP > 0 && b.currentHP <= 0) return -1;
    // Otherwise by initiative
    return b.initiative - a.initiative;
  });

  // Find current turn index
  const currentIndex = sortedParticipants.findIndex(p => p.isCurrentTurn);

  return (
    <div className={cn(
      "flex flex-col bg-[#0a1628]/90 rounded-lg border border-[#1a3a5c]/50",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a3a5c]/50">
        <h3 className="font-bold text-sm text-[#8ab4dc]">{title}</h3>
        <span className="text-xs text-[#5a7a9c] font-mono">
          Round {roundNumber}
        </span>
      </div>

      {/* Participants list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {sortedParticipants.map((participant, index) => (
          <React.Fragment key={participant.id}>
            {/* Divider before enemies section */}
            {index > 0 && 
             participants[index - 1]?.type === "player" && 
             participant.type === "enemy" && (
              <div className="flex items-center gap-2 py-1">
                <div className="flex-1 h-px bg-[#2a3a4c]" />
                <span className="text-[10px] text-[#5a6a7c] uppercase tracking-wider">Enemies</span>
                <div className="flex-1 h-px bg-[#2a3a4c]" />
              </div>
            )}
            <ParticipantRow
              participant={participant}
              onClick={onParticipantClick ? () => onParticipantClick(participant) : undefined}
              compact={compact}
            />
          </React.Fragment>
        ))}
      </div>

      {/* Turn progress indicator */}
      <div className="px-3 py-2 border-t border-[#1a3a5c]/50">
        <div className="flex gap-1">
          {sortedParticipants.filter(p => p.currentHP > 0).map((p, i) => (
            <div
              key={p.id}
              className={cn(
                "flex-1 h-1 rounded-full transition-all",
                p.isCurrentTurn
                  ? "bg-gold"
                  : i < currentIndex
                    ? "bg-[#3a5a7c]"
                    : "bg-[#1a2a3c]"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
