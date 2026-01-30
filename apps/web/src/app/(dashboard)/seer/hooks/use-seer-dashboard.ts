/**
 * Seer Dashboard Hook
 * Manages all state and actions for the Seer Dashboard
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Session,
  AdventureNode,
  SessionPlayer,
  CombatState,
  HistoryEntry,
  RollRequest,
  RollResult,
  AISeerResponse,
  PlayerAction,
  CombatOutcome,
  Announcement,
  NodeConnection,
} from "../types";

interface UseSeerDashboardReturn {
  // State
  session: Session | null;
  currentNode: AdventureNode | null;
  nodeConnections: NodeConnection[];
  players: SessionPlayer[];
  combat: CombatState | null;
  history: HistoryEntry[];
  rollResults: RollResult[];
  isLoading: boolean;
  error: Error | null;
  elapsedTime: number;

  // Node actions
  navigateToNode: (nodeId: string) => Promise<void>;
  previewNode: (nodeId: string) => Promise<AdventureNode | null>;

  // Player actions
  requestRoll: (params: RollRequest) => Promise<void>;
  handlePlayerAction: (playerId: string, action: PlayerAction) => Promise<void>;

  // Combat actions
  startCombat: () => Promise<void>;
  endCombat: (outcome: CombatOutcome["type"]) => Promise<void>;
  nextTurn: () => Promise<void>;

  // Session actions
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  endSession: (outcome: "completed" | "cancelled") => Promise<void>;

  // Communication
  sendAnnouncement: (message: string, type: Announcement["type"]) => Promise<void>;
  getAIAdvice: (question: string) => Promise<AISeerResponse>;
}

// Mock data for demonstration
const mockNode: AdventureNode = {
  id: "node-1",
  type: "story",
  title: "The Forest Clearing",
  content: "The party emerges into a moonlit clearing. Ancient stones stand in a circle, covered in moss and strange runes. The air feels thick with ancient magic.",
  data: {
    type: "story",
    readAloudText: "The trees part to reveal a sacred place. Moonlight bathes the standing stones in silver light, and you can feel the weight of centuries pressing down upon this forgotten shrine.",
    seerNotes: "- If players investigate stones, Challenge (WIT, 12)\n- Hidden cache beneath the center stone\n- Enemies may be watching from the treeline",
  },
};

const mockConnections: NodeConnection[] = [
  { id: "conn-1", sourceNodeId: "node-1", targetNodeId: "node-2", label: "Investigate the stones" },
  { id: "conn-2", sourceNodeId: "node-1", targetNodeId: "node-3", label: "Search for danger" },
  { id: "conn-3", sourceNodeId: "node-1", targetNodeId: "node-4", label: "Rest here" },
];

const mockPlayers: SessionPlayer[] = [
  {
    id: "player-1",
    sessionId: "session-1",
    userId: "user-1",
    username: "Thorin_Player",
    isConnected: true,
    joinedAt: new Date().toISOString(),
    character: {
      id: "char-1",
      name: "Thorin Ironfist",
      characterClass: "Warrior",
      currentHitPoints: 8,
      maxHitPoints: 12,
      portraitUrl: undefined,
      attributes: { might: 16, grace: 10, wit: 8, heart: 12 },
      conditions: [],
      specialAbilities: [
        { id: "ability-1", name: "Shield Wall", description: "+2 AC when adjacent to ally", usesRemaining: 2, maxUses: 2 },
      ],
    },
  },
  {
    id: "player-2",
    sessionId: "session-1",
    userId: "user-2",
    username: "Lira_Player",
    isConnected: true,
    joinedAt: new Date().toISOString(),
    character: {
      id: "char-2",
      name: "Lira Shadowstep",
      characterClass: "Rogue",
      currentHitPoints: 5,
      maxHitPoints: 8,
      portraitUrl: undefined,
      attributes: { might: 8, grace: 18, wit: 14, heart: 10 },
      conditions: [{ id: "cond-1", name: "Hidden", description: "Advantage on next attack" }],
      specialAbilities: [
        { id: "ability-2", name: "Sneak Attack", description: "Extra d6 damage when hidden", usesRemaining: 1, maxUses: 1 },
      ],
    },
  },
  {
    id: "player-3",
    sessionId: "session-1",
    userId: "user-3",
    username: "Max_Player",
    isConnected: false,
    joinedAt: new Date().toISOString(),
    character: {
      id: "char-3",
      name: "Maximus the Bold",
      characterClass: "Cleric",
      currentHitPoints: 6,
      maxHitPoints: 10,
      portraitUrl: undefined,
      attributes: { might: 12, grace: 8, wit: 12, heart: 18 },
      conditions: [],
      specialAbilities: [
        { id: "ability-3", name: "Healing Touch", description: "Heal 1d6+HEART HP", usesRemaining: 2, maxUses: 3 },
      ],
    },
  },
];

const mockSession: Session = {
  id: "session-1",
  adventureId: "adventure-1",
  adventureName: "The Dark Forest",
  code: "H7NK4B",
  status: "active",
  seerId: "seer-1",
  currentNodeId: "node-1",
  startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
  createdAt: new Date().toISOString(),
};

export function useSeerDashboard(_sessionId: string): UseSeerDashboardReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [currentNode, setCurrentNode] = useState<AdventureNode | null>(null);
  const [nodeConnections, setNodeConnections] = useState<NodeConnection[]>([]);
  const [players, setPlayers] = useState<SessionPlayer[]>([]);
  const [combat, setCombat] = useState<CombatState | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [rollResults, setRollResults] = useState<RollResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Initialize mock data
  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        setSession(mockSession);
        setCurrentNode(mockNode);
        setNodeConnections(mockConnections);
        setPlayers(mockPlayers);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load session"));
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  // Timer
  useEffect(() => {
    if (!session?.startedAt || session.status !== "active") return;

    const startTime = new Date(session.startedAt).getTime();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.startedAt, session?.status]);

  // Helper to add history entries
  const addHistoryEntry = useCallback((type: HistoryEntry["type"], description: string) => {
    setHistory((prev) => [
      {
        id: `history-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type,
        description,
      },
      ...prev,
    ]);
  }, []);

  // Node actions
  const navigateToNode = useCallback(async (nodeId: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      // In real implementation, fetch node from API
      addHistoryEntry("navigation", `Navigated to new node: ${nodeId}`);
    } finally {
      setIsLoading(false);
    }
  }, [addHistoryEntry]);

  const previewNode = useCallback(async (nodeId: string): Promise<AdventureNode | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    // Return mock preview
    return {
      id: nodeId,
      type: "challenge",
      title: "The Runic Stones",
      content: "Ancient runes glow with faint power...",
      data: {
        type: "challenge",
        attribute: "wit",
        difficulty: 12,
        seerNotes: "This reveals the hidden cache location",
      },
    };
  }, []);

  // Player actions
  const requestRoll = useCallback(async (params: RollRequest) => {
    addHistoryEntry("roll", `Requested ${params.attribute} check (DC ${params.difficulty}) from ${params.characterId}`);
    // In real implementation, send to player's device
    // For demo, add a mock roll result
    const mockResult: RollResult = {
      id: `roll-${Date.now()}`,
      playerId: params.characterId,
      characterName: players.find(p => p.character.id === params.characterId)?.character.name || "Unknown",
      attribute: params.attribute,
      roll: Math.floor(Math.random() * 20) + 1,
      modifier: 2,
      total: 0,
      difficulty: params.difficulty,
      success: false,
      timestamp: new Date().toISOString(),
    };
    mockResult.total = mockResult.roll + mockResult.modifier;
    mockResult.success = mockResult.total >= params.difficulty;
    setRollResults(prev => [mockResult, ...prev]);
  }, [addHistoryEntry, players]);

  const handlePlayerAction = useCallback(async (playerId: string, action: PlayerAction) => {
    setPlayers((prev) =>
      prev.map((player) => {
        if (player.id !== playerId) return player;

        switch (action.type) {
          case "heal":
            return {
              ...player,
              character: {
                ...player.character,
                currentHitPoints: Math.min(
                  player.character.maxHitPoints,
                  player.character.currentHitPoints + action.value
                ),
              },
            };
          case "damage":
            return {
              ...player,
              character: {
                ...player.character,
                currentHitPoints: Math.max(
                  0,
                  player.character.currentHitPoints - action.value
                ),
              },
            };
          case "addCondition":
            return {
              ...player,
              character: {
                ...player.character,
                conditions: [...player.character.conditions, action.condition],
              },
            };
          case "removeCondition":
            return {
              ...player,
              character: {
                ...player.character,
                conditions: player.character.conditions.filter(
                  (c) => c.id !== action.conditionId
                ),
              },
            };
          default:
            return player;
        }
      })
    );
  }, []);

  // Combat actions
  const startCombat = useCallback(async () => {
    // Initialize combat state
    addHistoryEntry("combat", "Combat started!");
  }, [addHistoryEntry]);

  const endCombat = useCallback(async (outcome: CombatOutcome["type"]) => {
    setCombat(null);
    addHistoryEntry("combat", `Combat ended: ${outcome}`);
  }, [addHistoryEntry]);

  const nextTurn = useCallback(async () => {
    setCombat((prev) => {
      if (!prev) return null;
      const nextTurnIndex = (prev.currentTurn + 1) % prev.initiative.length;
      const isNewRound = nextTurnIndex === 0;
      return {
        ...prev,
        currentTurn: nextTurnIndex,
        round: isNewRound ? prev.round + 1 : prev.round,
      };
    });
  }, []);

  // Session actions
  const pauseSession = useCallback(async () => {
    setSession((prev) => (prev ? { ...prev, status: "paused" } : null));
    addHistoryEntry("announcement", "Session paused");
  }, [addHistoryEntry]);

  const resumeSession = useCallback(async () => {
    setSession((prev) => (prev ? { ...prev, status: "active" } : null));
    addHistoryEntry("announcement", "Session resumed");
  }, [addHistoryEntry]);

  const endSession = useCallback(async (outcome: "completed" | "cancelled") => {
    setSession((prev) => (prev ? { ...prev, status: "completed" } : null));
    addHistoryEntry("announcement", `Session ended: ${outcome}`);
  }, [addHistoryEntry]);

  // Communication
  const sendAnnouncement = useCallback(async (message: string, _type: Announcement["type"]) => {
    addHistoryEntry("announcement", message);
    // In real implementation, broadcast to all players
  }, [addHistoryEntry]);

  const getAIAdvice = useCallback(async (question: string): Promise<AISeerResponse> => {
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));
    
    const questionLower = question.toLowerCase();
    
    // Handle shortcodes
    if (questionLower.startsWith("/combat")) {
      return {
        id: `resp-${Date.now()}`,
        requestId: `req-${Date.now()}`,
        suggestion: `## ⚔️ Combat Quick Reference\n\n### Turn Order\n1. Roll initiative (1D6, highest first)\n2. Each combatant acts in order\n3. Repeat until combat ends\n\n### Attack\n- Roll attack dice vs defender's Grace\n- Higher total wins\n- Damage = Weapon damage + margin/5\n\n### Heroic Save\n- Once per encounter, reroll any failed roll`,
        responseTimeMs: Date.now() - startTime,
        cached: false,
        modelVersion: "shortcode",
      };
    }
    
    if (questionLower.startsWith("/difficulty")) {
      return {
        id: `resp-${Date.now()}`,
        requestId: `req-${Date.now()}`,
        suggestion: `## 🎯 Difficulty Guidelines\n\n| DC | Level | Examples |\n|---|---|---|\n| 3-5 | Trivial | Basic tasks |\n| 6-8 | Easy | Simple challenges |\n| 9-11 | Moderate | Standard challenges |\n| 12-14 | Hard | Significant challenges |\n| 15-17 | Very Hard | Extreme challenges |\n| 18 | Legendary | Nearly impossible |`,
        responseTimeMs: Date.now() - startTime,
        cached: false,
        modelVersion: "shortcode",
      };
    }
    
    if (questionLower.startsWith("/stats")) {
      const playerStats = players.map(p => {
        const c = p.character;
        const hp = c.currentHitPoints <= c.maxHitPoints * 0.25 ? "🔴" : c.currentHitPoints <= c.maxHitPoints * 0.5 ? "🟡" : "🟢";
        return `**${c.name}** | ${hp} HP: ${c.currentHitPoints}/${c.maxHitPoints} | M:${c.attributes.might} G:${c.attributes.grace} W:${c.attributes.wit} H:${c.attributes.heart}`;
      }).join("\n");
      
      return {
        id: `resp-${Date.now()}`,
        requestId: `req-${Date.now()}`,
        suggestion: `## 📊 Party Stats\n\n${playerStats}`,
        responseTimeMs: Date.now() - startTime,
        cached: false,
        modelVersion: "shortcode",
      };
    }
    
    // Context-aware responses
    let suggestion = "That's an interesting approach! Consider the context and what attribute best fits.";
    let suggestedRoll: AISeerResponse["suggestedRoll"] = undefined;
    let narrativeHook: string | undefined = undefined;

    if (questionLower.includes("climb") || questionLower.includes("scale")) {
      suggestion = "Have them attempt the climb carefully, looking for handholds.";
      suggestedRoll = { attribute: "grace", difficulty: 11, reason: "Requires agility and balance" };
      narrativeHook = "The surface looms above, every handhold a test of skill...";
    } else if (questionLower.includes("persuade") || questionLower.includes("convince") || questionLower.includes("talk")) {
      suggestion = "This calls for a social approach. Consider the NPC's motivations.";
      suggestedRoll = { attribute: "heart", difficulty: 12, reason: "Force of personality needed" };
      narrativeHook = "Their eyes meet, a moment of connection hanging in the balance...";
    } else if (questionLower.includes("sneak") || questionLower.includes("hide") || questionLower.includes("stealth")) {
      suggestion = "Stealth requires patience and awareness of surroundings.";
      suggestedRoll = { attribute: "grace", difficulty: 12, reason: "Silent movement required" };
      narrativeHook = "Every shadow becomes an ally as they slip through the darkness...";
    } else if (questionLower.includes("search") || questionLower.includes("investigate") || questionLower.includes("look")) {
      suggestion = "A careful search might reveal hidden details.";
      suggestedRoll = { attribute: "wit", difficulty: 10, reason: "Keen observation needed" };
      narrativeHook = "Their trained eyes scan every corner, missing nothing...";
    } else if (questionLower.includes("rune") || questionLower.includes("ancient") || questionLower.includes("magic")) {
      suggestion = "Based on the scene, a WIT check seems appropriate. Consider difficulty 12 for standard investigation.";
      suggestedRoll = { attribute: "wit", difficulty: 12, reason: "Investigating ancient runes requires careful study" };
      narrativeHook = "The runes seem to respond to touch, glowing brighter as fingers trace their patterns...";
    } else if (questionLower.includes("fight") || questionLower.includes("attack")) {
      suggestion = "This will initiate combat! Make sure to roll initiative first.";
      narrativeHook = "The air crackles with tension as weapons are drawn...";
    }
    
    return {
      id: `resp-${Date.now()}`,
      requestId: `req-${Date.now()}`,
      suggestion,
      suggestedRoll,
      narrativeHook,
      confidence: 0.85,
      responseTimeMs: Date.now() - startTime,
      cached: false,
      modelVersion: "mock-1.0",
    };
  }, [players]);

  return {
    session,
    currentNode,
    nodeConnections,
    players,
    combat,
    history,
    rollResults,
    isLoading,
    error,
    elapsedTime,
    navigateToNode,
    previewNode,
    requestRoll,
    handlePlayerAction,
    startCombat,
    endCombat,
    nextTurn,
    pauseSession,
    resumeSession,
    endSession,
    sendAnnouncement,
    getAIAdvice,
  };
}
