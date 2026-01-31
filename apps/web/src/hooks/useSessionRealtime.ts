"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export interface SessionState {
  id: string;
  status: "waiting" | "active" | "paused" | "ended";
  currentNodeId?: string;
  playerIds: string[];
  seerId: string;
  updatedAt: string;
}

export interface UseSessionRealtimeReturn {
  sessionState: SessionState | null;
  isConnected: boolean;
  error: Error | null;
  broadcast: (event: string, payload: Record<string, unknown>) => void;
}

export function useSessionRealtime(sessionId: string): UseSessionRealtimeReturn {
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const supabase = createClient();
    
    // Create channel for this session
    const sessionChannel = supabase.channel(`session:${sessionId}`, {
      config: { broadcast: { self: true } },
    });

    // Listen for session state changes from database
    sessionChannel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload: RealtimePostgresChangesPayload<SessionState>) => {
          if (payload.new) {
            setSessionState(payload.new as SessionState);
          }
        }
      )
      // Listen for broadcast events (player actions, dice rolls, etc.)
      .on("broadcast", { event: "state_update" }, ({ payload }) => {
        if (payload) {
          setSessionState((prev) => (prev ? { ...prev, ...payload } : null));
        }
      })
      .on("broadcast", { event: "player_joined" }, ({ payload }) => {
        console.log("Player joined:", payload);
      })
      .on("broadcast", { event: "player_left" }, ({ payload }) => {
        console.log("Player left:", payload);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          setError(null);
        } else if (status === "CHANNEL_ERROR") {
          setIsConnected(false);
          setError(new Error("Failed to connect to session channel"));
        } else if (status === "CLOSED") {
          setIsConnected(false);
        }
      });

    setChannel(sessionChannel);

    // Cleanup on unmount
    return () => {
      sessionChannel.unsubscribe();
    };
  }, [sessionId]);

  // Broadcast function for sending events to other players
  const broadcast = useCallback(
    (event: string, payload: Record<string, unknown>) => {
      if (channel) {
        channel.send({
          type: "broadcast",
          event,
          payload,
        });
      }
    },
    [channel]
  );

  return { sessionState, isConnected, error, broadcast };
}
