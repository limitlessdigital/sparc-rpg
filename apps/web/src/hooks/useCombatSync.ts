"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface CombatState {
  id: string;
  sessionId: string;
  round: number;
  currentTurnIndex: number;
  initiativeOrder: Array<{
    id: string;
    name: string;
    initiative: number;
    type: "player" | "enemy";
  }>;
  isActive: boolean;
}

export interface DiceRollEvent {
  playerId: string;
  playerName: string;
  rollType: string;
  dice: number[];
  total: number;
  result: "success" | "partial" | "failure" | "critical";
  timestamp: string;
}

export interface UseCombatSyncReturn {
  combatState: CombatState | null;
  recentRolls: DiceRollEvent[];
  isConnected: boolean;
  broadcastRoll: (roll: Omit<DiceRollEvent, "timestamp">) => void;
  broadcastAction: (action: string, data: Record<string, unknown>) => void;
}

export function useCombatSync(sessionId: string): UseCombatSyncReturn {
  const [combatState, setCombatState] = useState<CombatState | null>(null);
  const [recentRolls, setRecentRolls] = useState<DiceRollEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const supabase = createClient();
    
    const combatChannel = supabase.channel(`combat:${sessionId}`, {
      config: { broadcast: { self: true } },
    });

    combatChannel
      .on("broadcast", { event: "combat_state" }, ({ payload }) => {
        if (payload) setCombatState(payload as CombatState);
      })
      .on("broadcast", { event: "dice_roll" }, ({ payload }) => {
        if (payload) {
          const roll = payload as DiceRollEvent;
          setRecentRolls((prev) => [roll, ...prev].slice(0, 20));
        }
      })
      .on("broadcast", { event: "turn_change" }, ({ payload }) => {
        if (payload) {
          setCombatState((prev) => 
            prev ? { ...prev, currentTurnIndex: payload.turnIndex as number } : null
          );
        }
      })
      .on("broadcast", { event: "combat_end" }, () => {
        setCombatState((prev) => (prev ? { ...prev, isActive: false } : null));
      })
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    setChannel(combatChannel);

    return () => {
      combatChannel.unsubscribe();
    };
  }, [sessionId]);

  const broadcastRoll = useCallback(
    (roll: Omit<DiceRollEvent, "timestamp">) => {
      if (channel) {
        channel.send({
          type: "broadcast",
          event: "dice_roll",
          payload: { ...roll, timestamp: new Date().toISOString() },
        });
      }
    },
    [channel]
  );

  const broadcastAction = useCallback(
    (action: string, data: Record<string, unknown>) => {
      if (channel) {
        channel.send({
          type: "broadcast",
          event: action,
          payload: data,
        });
      }
    },
    [channel]
  );

  return { combatState, recentRolls, isConnected, broadcastRoll, broadcastAction };
}
