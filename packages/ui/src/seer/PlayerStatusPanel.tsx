"use client";

import * as React from "react";
import { cn } from "../lib/utils";

interface PlayerStatus {
  id: string;
  playerName: string;
  characterName: string;
  className: string;
  hp: { current: number; max: number };
  conditions: string[];
  isOnline: boolean;
  isCurrentTurn?: boolean;
}

interface PlayerStatusPanelProps {
  players: PlayerStatus[];
  className?: string;
}

export function PlayerStatusPanel({ players, className }: PlayerStatusPanelProps) {
  return (
    <div className={cn("bg-surface-card rounded-lg p-4 space-y-3", className)}>
      <h3 className="font-bold text-lg mb-4">Party Status</h3>
      {players.map((player) => {
        const hpPercent = (player.hp.current / player.hp.max) * 100;
        const hpColor = hpPercent > 50 ? "bg-green-500" : hpPercent > 25 ? "bg-yellow-500" : "bg-red-500";
        
        return (
          <div
            key={player.id}
            className={cn(
              "p-3 rounded-lg border transition-all",
              player.isCurrentTurn && "ring-2 ring-blue-500",
              !player.isOnline && "opacity-50"
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", player.isOnline ? "bg-green-500" : "bg-gray-400")} />
                  <span className="font-semibold">{player.characterName}</span>
                  {player.isCurrentTurn && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">TURN</span>}
                </div>
                <div className="text-sm text-gray-500">{player.playerName} • {player.className}</div>
              </div>
              <div className="text-right">
                <span className={cn("font-bold", hpPercent <= 25 && "text-red-500")}>
                  {player.hp.current}/{player.hp.max}
                </span>
                <span className="text-sm text-gray-500 ml-1">HP</span>
              </div>
            </div>
            
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className={cn("h-full transition-all", hpColor)} style={{ width: `${hpPercent}%` }} />
            </div>
            
            {player.conditions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {player.conditions.map((condition, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">{condition}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PlayerStatusPanel;
