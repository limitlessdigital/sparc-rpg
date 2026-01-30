"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  CombatView,
  Spinner,
  type CombatState,
  type CombatAction,
  type AttackResult,
  type CombatOutcome,
  type CombatLogEntry,
  type PlayerCombatant,
  type EnemyCombatant,
} from "@sparc/ui";

// Mock data for development - would come from API/realtime in production
function generateMockCombat(sessionId: string): CombatState {
  const mockPlayers: PlayerCombatant[] = [
    {
      id: "player-1",
      characterId: "char-1",
      character: {
        id: "char-1",
        name: "Theron Brightblade",
        class: "warrior",
        level: 3,
        experience: 150,
        attributes: { str: 3, dex: 2, int: 0, cha: 0 },
        hitPoints: { current: 12, max: 12 },
        equipment: [
          { id: "sword-1", name: "Longsword", type: "weapon", equipped: true },
          { id: "armor-1", name: "Chain Mail", type: "armor", equipped: true },
        ],
        abilities: [
          {
            id: "ability-1",
            name: "Flurry",
            type: "active",
            description: "Make one additional attack roll this turn",
            usesPerSession: 1,
            usesRemaining: 1,
          },
        ],
      },
      initiative: 5,
      conditions: [],
      hasActed: false,
      heroicSaveUsed: false,
    },
    {
      id: "player-2",
      characterId: "char-2",
      character: {
        id: "char-2",
        name: "Lyra Shadowmend",
        class: "wizard",
        level: 3,
        experience: 145,
        attributes: { str: 0, dex: 2, int: 3, cha: 0 },
        hitPoints: { current: 7, max: 7 },
        equipment: [
          { id: "staff-1", name: "Arcane Staff", type: "weapon", equipped: true },
        ],
        abilities: [
          {
            id: "ability-2",
            name: "Meteor Swarm",
            type: "active",
            description: "INT attack vs DEX of up to 4 enemies",
            usesPerSession: 1,
            usesRemaining: 1,
          },
        ],
      },
      initiative: 4,
      conditions: [],
      hasActed: false,
      heroicSaveUsed: false,
    },
  ];

  const mockEnemies: EnemyCombatant[] = [
    {
      id: "enemy-1",
      creature: {
        id: "goblin",
        name: "Goblin",
        description: "A small, vicious creature",
        attributes: { str: 2, dex: 3, int: 1, cha: 1 },
        hitPoints: 3,
        maxHitPoints: 3,
        attackDice: 2,
        defenseDice: 2,
        damage: 1,
        challengeRating: 1,
        tags: ["humanoid", "goblinoid"],
      },
      instanceNumber: 1,
      currentHitPoints: 3,
      initiative: 6,
      conditions: [],
      hasActed: false,
    },
    {
      id: "enemy-2",
      creature: {
        id: "goblin",
        name: "Goblin",
        description: "A small, vicious creature",
        attributes: { str: 2, dex: 3, int: 1, cha: 1 },
        hitPoints: 3,
        maxHitPoints: 3,
        attackDice: 2,
        defenseDice: 2,
        damage: 1,
        challengeRating: 1,
        tags: ["humanoid", "goblinoid"],
      },
      instanceNumber: 2,
      currentHitPoints: 2,
      initiative: 3,
      conditions: [],
      hasActed: false,
    },
    {
      id: "enemy-3",
      creature: {
        id: "orc",
        name: "Orc Warrior",
        description: "A fierce orc fighter",
        attributes: { str: 4, dex: 2, int: 1, cha: 2 },
        hitPoints: 6,
        maxHitPoints: 6,
        attackDice: 3,
        defenseDice: 2,
        damage: 2,
        challengeRating: 2,
        tags: ["humanoid", "orc"],
      },
      instanceNumber: 1,
      currentHitPoints: 6,
      initiative: 2,
      conditions: [],
      hasActed: false,
    },
  ];

  // Build initiative order
  const allCombatants = [
    ...mockPlayers.map(p => ({
      id: p.id,
      type: "player" as const,
      combatantId: p.id,
      initiative: p.initiative,
      name: p.character.name,
    })),
    ...mockEnemies.map(e => ({
      id: e.id,
      type: "enemy" as const,
      combatantId: e.id,
      initiative: e.initiative,
      name: `${e.creature.name}${e.instanceNumber > 1 ? ` ${e.instanceNumber}` : ""}`,
    })),
  ].sort((a, b) => b.initiative - a.initiative);

  const mockLog: CombatLogEntry[] = [
    {
      id: "log-1",
      timestamp: new Date().toISOString(),
      round: 1,
      actorName: "System",
      action: "start",
      narrative: "Combat begins! 3 enemies appear from the shadows!",
    },
  ];

  return {
    id: `combat-${sessionId}`,
    sessionId,
    nodeId: "node-combat-1",
    playerCombatants: mockPlayers,
    enemyCombatants: mockEnemies,
    initiativeOrder: allCombatants,
    currentTurnIndex: 0, // Goblin 1 goes first (initiative 6)
    roundNumber: 1,
    isActive: true,
    log: mockLog,
  };
}

// Simulated dice roll
function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function rollDice(count: number): number[] {
  return Array.from({ length: count }, () => rollD6());
}

export default function CombatPage(): JSX.Element | null {
  const params = useParams();
  const sessionId = params.id as string;

  const [combat, setCombat] = React.useState<CombatState | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Mock: current player is always player-1 (Theron)
  const currentPlayerId = "char-1";
  const isSeer = false; // Would come from session context

  // Load combat state
  React.useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setCombat(generateMockCombat(sessionId));
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [sessionId]);

  // Handle combat action
  const handleAction = React.useCallback(async (
    action: CombatAction,
    targetId?: string,
    _abilityId?: string
  ): Promise<AttackResult | void> => {
    if (!combat || !targetId) return;

    // Simulate attack resolution
    if (action === "attack") {
      const attacker = combat.playerCombatants.find(
        p => p.characterId === currentPlayerId
      );
      if (!attacker) return;

      // Roll attack
      const attackDice = attacker.character.attributes.str;
      const attackRolls = rollDice(attackDice);
      const attackTotal = attackRolls.reduce((a, b) => a + b, 0);

      // Roll defense
      const target = combat.enemyCombatants.find(e => e.id === targetId);
      if (!target) return;
      
      const defenseRolls = rollDice(target.creature.defenseDice);
      const defenseTotal = defenseRolls.reduce((a, b) => a + b, 0);

      const hit = attackTotal > defenseTotal;
      const critical = attackRolls.filter(r => r === 6).length >= 2;
      const damage = hit ? (critical ? 4 : 2) : 0;

      // Update combat state
      setCombat(prev => {
        if (!prev) return prev;

        const updatedEnemies = prev.enemyCombatants.map(e => {
          if (e.id === targetId) {
            return {
              ...e,
              currentHitPoints: Math.max(0, e.currentHitPoints - damage),
            };
          }
          return e;
        });

        const newLog: CombatLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          round: prev.roundNumber,
          actorName: attacker.character.name,
          action: "attack",
          targetName: target.creature.name + (target.instanceNumber > 1 ? ` ${target.instanceNumber}` : ""),
          rolls: [{
            dice: attackRolls,
            total: attackTotal,
            successes: attackRolls.filter(r => r >= 4).length,
            difficulty: 4,
            result: critical ? "critical-success" : hit ? "success" : "failure",
          }],
          damage: hit ? damage : undefined,
          narrative: critical
            ? `${attacker.character.name} lands a devastating critical hit for ${damage} damage!`
            : hit
            ? `${attacker.character.name} strikes for ${damage} damage!`
            : `${attacker.character.name}'s attack misses!`,
          isSuccess: hit,
          isCritical: critical,
        };

        return {
          ...prev,
          enemyCombatants: updatedEnemies,
          log: [...prev.log, newLog],
        };
      });

      return {
        hit,
        damage,
        attackRoll: {
          dice: attackRolls,
          total: attackTotal,
          successes: attackRolls.filter(r => r >= 4).length,
          difficulty: 4,
          result: critical ? "critical-success" : hit ? "success" : "failure",
        },
        defenseRoll: {
          dice: defenseRolls,
          total: defenseTotal,
          successes: defenseRolls.filter(r => r >= 4).length,
          difficulty: 4,
          result: "success",
        },
        critical,
        narrative: hit ? `Hit for ${damage} damage!` : "Miss!",
      };
    }

    // Handle other actions (defend, flee, skip)
    if (action === "defend") {
      setCombat(prev => {
        if (!prev) return prev;
        const attacker = prev.playerCombatants.find(
          p => p.characterId === currentPlayerId
        );
        if (!attacker) return prev;

        const newLog: CombatLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          round: prev.roundNumber,
          actorName: attacker.character.name,
          action: "defend",
          narrative: `${attacker.character.name} takes a defensive stance!`,
          isSuccess: true,
        };

        return {
          ...prev,
          log: [...prev.log, newLog],
        };
      });
    }

    if (action === "skip") {
      setCombat(prev => {
        if (!prev) return prev;
        const attacker = prev.playerCombatants.find(
          p => p.characterId === currentPlayerId
        );
        if (!attacker) return prev;

        const newLog: CombatLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          round: prev.roundNumber,
          actorName: attacker.character.name,
          action: "skip",
          narrative: `${attacker.character.name} waits and observes.`,
        };

        return {
          ...prev,
          log: [...prev.log, newLog],
        };
      });
    }
  }, [combat, currentPlayerId]);

  // Handle heroic save
  const handleHeroicSave = React.useCallback(async (): Promise<AttackResult | void> => {
    // Mark heroic save as used and reroll
    setCombat(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        playerCombatants: prev.playerCombatants.map(p => {
          if (p.characterId === currentPlayerId) {
            return { ...p, heroicSaveUsed: true };
          }
          return p;
        }),
      };
    });

    // Simulate reroll with better odds
    const rerollDice = rollDice(4);
    const rerollTotal = rerollDice.reduce((a, b) => a + b, 0);
    const hit = rerollTotal >= 12;
    const damage = hit ? 3 : 0;

    return {
      hit,
      damage,
      attackRoll: {
        dice: rerollDice,
        total: rerollTotal,
        successes: rerollDice.filter(r => r >= 4).length,
        difficulty: 4,
        result: hit ? "success" : "failure",
      },
      defenseRoll: {
        dice: [2, 1],
        total: 3,
        successes: 0,
        difficulty: 4,
        result: "failure",
      },
      critical: false,
      narrative: hit ? "Heroic Save succeeds!" : "Even the save fails...",
    };
  }, [currentPlayerId]);

  // Handle end turn
  const handleEndTurn = React.useCallback(() => {
    setCombat(prev => {
      if (!prev) return prev;

      let nextIndex = prev.currentTurnIndex + 1;
      let newRound = prev.roundNumber;

      // Wrap around to next round
      if (nextIndex >= prev.initiativeOrder.length) {
        nextIndex = 0;
        newRound = prev.roundNumber + 1;
      }

      // Skip dead combatants
      while (true) {
        const entry = prev.initiativeOrder[nextIndex];
        const combatant = entry.type === "player"
          ? prev.playerCombatants.find(p => p.id === entry.combatantId)
          : prev.enemyCombatants.find(e => e.id === entry.combatantId);

        if (!combatant) break;

        const hp = entry.type === "player"
          ? (combatant as PlayerCombatant).character.hitPoints.current
          : (combatant as EnemyCombatant).currentHitPoints;

        if (hp > 0) break;

        nextIndex = (nextIndex + 1) % prev.initiativeOrder.length;
        if (nextIndex === 0) newRound++;
      }

      return {
        ...prev,
        currentTurnIndex: nextIndex,
        roundNumber: newRound,
      };
    });
  }, []);

  // Handle end combat
  const handleEndCombat = React.useCallback((outcome: CombatOutcome["type"]) => {
    setCombat(prev => {
      if (!prev) return prev;

      const combatOutcome: CombatOutcome = {
        type: outcome,
        survivingPlayers: prev.playerCombatants
          .filter(p => p.character.hitPoints.current > 0)
          .map(p => p.character.name),
        defeatedEnemies: prev.enemyCombatants
          .filter(e => e.currentHitPoints <= 0)
          .map(e => e.creature.name),
        experienceAwarded: outcome === "victory" ? 50 : 0,
        lootDropped: outcome === "victory" ? [
          { id: "loot-1", name: "Gold Coins (15)", type: "currency" },
          { id: "loot-2", name: "Rusty Dagger", type: "weapon" },
        ] : [],
      };

      return {
        ...prev,
        isActive: false,
        outcome: combatOutcome,
      };
    });
  }, []);

  if (loading || !combat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-muted-foreground">Loading combat...</p>
        </div>
      </div>
    );
  }

  return (
    <CombatView
      combat={combat}
      currentPlayerId={currentPlayerId}
      isSeer={isSeer}
      onAction={handleAction}
      onHeroicSave={handleHeroicSave}
      onEndTurn={handleEndTurn}
      onEndCombat={handleEndCombat}
    />
  );
}
