"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface PlayerPresence {
  oderId: string;
  odername: string;
  oderstatus: "online" | "away" | "offline";
  characterId?: string;
  characterName?: string;
  lastSeen: string;
}

export interface UsePlayerPresenceReturn {
  players: PlayerPresence[];
  isConnected: boolean;
  updateMyPresence: (status: PlayerPresence["oderstatus"]) => void;
}

export function usePlayerPresence(
  sessionId: string,
  myUserId: string,
  myUserName: string
): UsePlayerPresenceReturn {
  const [players, setPlayers] = useState<PlayerPresence[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!sessionId || !myUserId) return;

    const supabase = createClient();
    
    const presenceChannel = supabase.channel(`presence:${sessionId}`, {
      config: { presence: { key: myUserId } },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const playerList: PlayerPresence[] = [];
        
        Object.entries(state).forEach(([userId, presences]) => {
          const presence = presences[0] as Record<string, unknown>;
          playerList.push({
            userId,
            userName: presence.userName as string || "Unknown",
            status: presence.status as PlayerPresence["status"] || "online",
            characterId: presence.characterId as string | undefined,
            characterName: presence.characterName as string | undefined,
            lastSeen: new Date().toISOString(),
          });
        });
        
        setPlayers(playerList);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("Player joined:", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("Player left:", key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          // Track my presence
          await presenceChannel.track({
            oderId: myUserId,
            odername: myUserName,
            status: "online",
            lastSeen: new Date().toISOString(),
          });
        } else {
          setIsConnected(false);
        }
      });

    setChannel(presenceChannel);

    // Update presence periodically to show we're still active
    const heartbeat = setInterval(() => {
      if (presenceChannel) {
        presenceChannel.track({
          oderId: myUserId,
          odername: myUserName,
          status: "online",
          lastSeen: new Date().toISOString(),
        });
      }
    }, 30000);

    return () => {
      clearInterval(heartbeat);
      presenceChannel.unsubscribe();
    };
  }, [sessionId, myUserId, myUserName]);

  const updateMyPresence = useCallback(
    (status: PlayerPresence["status"]) => {
      if (channel) {
        channel.track({
          userId: myUserId,
          userName: myUserName,
          status,
          lastSeen: new Date().toISOString(),
        });
      }
    },
    [channel, myUserId, myUserName]
  );

  return { players, isConnected, updateMyPresence };
}
