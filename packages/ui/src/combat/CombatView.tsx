"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../Card";
import { Button } from "../Button";
import { Badge } from "../Badge";
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "../Modal";
import { InitiativeTracker } from "./InitiativeTracker";
import { CombatActionsPanel } from "./CombatActionsPanel";
import { TargetSelector } from "./TargetSelector";
import { CombatLog, FloatingCombatLog } from "./CombatLog";
import { HPChangeDisplay, type HPChange } from "./HPChangeDisplay";
import type { 
  CombatState, 
  CombatUIState, 
  CombatAction, 
  EnemyCombatant,
  CombatOutcome,
  AttackResult,
} from "./types";
import { getCombatantName, isAlive } from "./types";

export interface CombatViewProps {
  /** Current combat state */
  combat: CombatState;
  /** Current player's character ID */
  currentPlayerId: string;
  /** Whether current player is Seer (GM) */
  isSeer?: boolean;
  /** Callback when action is performed */
  onAction?: (action: CombatAction, targetId?: string, abilityId?: string) => Promise<AttackResult | void>;
  /** Callback when Heroic Save is used */
  onHeroicSave?: () => Promise<AttackResult | void>;
  /** Callback when turn ends */
  onEndTurn?: () => void;
  /** Callback when combat ends (Seer only) */
  onEndCombat?: (outcome: CombatOutcome["type"]) => void;
  /** Custom class name */
  className?: string;
}

export function CombatView({
  combat,
  currentPlayerId,
  isSeer = false,
  onAction,
  onHeroicSave,
  onEndTurn,
  onEndCombat,
  className,
}: CombatViewProps) {
  // UI State
  const [uiState, setUIState] = React.useState<CombatUIState>("waiting");
  const [selectedAction, setSelectedAction] = React.useState<CombatAction | null>(null);
  const [selectedAbilityId, setSelectedAbilityId] = React.useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = React.useState<string | null>(null);
  const [hpChanges, setHPChanges] = React.useState<HPChange[]>([]);
  const [showEndCombatModal, setShowEndCombatModal] = React.useState(false);

  // Find current player's combatant
  const myPlayerCombatant = combat.playerCombatants.find(
    (p) => p.characterId === currentPlayerId
  );

  // Check if it's my turn
  const currentTurnEntry = combat.initiativeOrder[combat.currentTurnIndex];
  const isMyTurn = currentTurnEntry?.type === "player" && 
    myPlayerCombatant && 
    currentTurnEntry.combatantId === myPlayerCombatant.id;

  // Update UI state based on turn
  React.useEffect(() => {
    if (!combat.isActive) {
      setUIState("combat_end");
    } else if (isMyTurn && uiState === "waiting") {
      setUIState("select_action");
    } else if (!isMyTurn && uiState !== "combat_end") {
      setUIState("waiting");
      setSelectedAction(null);
      setSelectedTargetId(null);
    }
  }, [isMyTurn, combat.isActive, uiState]);

  // Handle action selection
  const handleSelectAction = (action: CombatAction, abilityId?: string) => {
    setSelectedAction(action);
    setSelectedAbilityId(abilityId || null);

    // Some actions need a target
    if (action === "attack" || (action === "ability" && abilityId !== "heroic-save")) {
      setUIState("select_target");
    } else if (action === "ability" && abilityId === "heroic-save") {
      handleHeroicSave();
    } else {
      // Defend, flee, skip - execute immediately
      handleExecuteAction(action);
    }
  };

  // Handle target selection
  const handleSelectTarget = async (targetId: string) => {
    setSelectedTargetId(targetId);
    
    if (selectedAction) {
      await handleExecuteAction(selectedAction, targetId);
    }
  };

  // Execute the action
  const handleExecuteAction = async (action: CombatAction, targetId?: string) => {
    setUIState("rolling");

    try {
      const result = await onAction?.(action, targetId, selectedAbilityId || undefined);
      
      if (result) {
        
        // Add HP change for display
        if (result.damage && result.damage > 0 && targetId) {
          const target = combat.enemyCombatants.find(e => e.id === targetId) ||
                         combat.playerCombatants.find(p => p.id === targetId);
          if (target) {
            setHPChanges(prev => [...prev, {
              id: crypto.randomUUID(),
              amount: result.damage!,
              type: "damage",
              targetId,
              targetName: getCombatantName(target),
              critical: result.critical,
            }]);
          }
        }

        // Check if heroic save is available
        if (!result.hit && myPlayerCombatant && !myPlayerCombatant.heroicSaveUsed) {
          setUIState("heroic_save");
          return;
        }
      }

      setUIState("turn_complete");
    } catch (error) {
      console.error("Action failed:", error);
      setUIState("select_action");
    }
  };

  // Handle heroic save
  const handleHeroicSave = async () => {
    setUIState("rolling");

    try {
      const result = await onHeroicSave?.();
      
      if (result && result.damage && result.damage > 0 && selectedTargetId) {
        const target = combat.enemyCombatants.find(e => e.id === selectedTargetId);
        if (target) {
          setHPChanges(prev => [...prev, {
            id: crypto.randomUUID(),
            amount: result.damage!,
            type: "damage",
            targetId: selectedTargetId,
            targetName: getCombatantName(target),
            critical: result.critical,
          }]);
        }
      }

      setUIState("turn_complete");
    } catch (error) {
      console.error("Heroic save failed:", error);
      setUIState("turn_complete");
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    if (uiState === "heroic_save") {
      setUIState("turn_complete");
    } else {
      setUIState("select_action");
      setSelectedAction(null);
      setSelectedTargetId(null);
    }
  };

  // Handle end turn
  const handleEndTurn = () => {
    onEndTurn?.();
    setUIState("waiting");
    setSelectedAction(null);
    setSelectedTargetId(null);
  };

  // Combat ended
  if (!combat.isActive && combat.outcome) {
    return (
      <CombatOutcomeView
        outcome={combat.outcome}
        onContinue={() => {/* Navigate away */}}
      />
    );
  }

  return (
    <div className={cn("relative min-h-screen bg-surface-bg", className)}>
      {/* HP Change overlay */}
      <HPChangeDisplay changes={hpChanges} />

      {/* Floating combat log (mobile) */}
      <div className="fixed bottom-20 left-4 right-4 md:hidden z-40">
        <FloatingCombatLog entries={combat.log} maxVisible={3} />
      </div>

      {/* Main layout */}
      <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left sidebar - Initiative tracker */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardContent className="p-4">
              <InitiativeTracker
                combat={combat}
                currentPlayerId={currentPlayerId}
              />
            </CardContent>
          </Card>

          {/* Seer controls */}
          {isSeer && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">🎭 Seer Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowEndCombatModal(true)}
                >
                  End Combat
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Center - Combat area */}
        <div className="lg:col-span-6 space-y-4">
          {/* Round banner */}
          <div className="text-center py-4">
            <Badge variant="outline" size="md" className="text-lg">
              ⚔️ Round {combat.roundNumber}
            </Badge>
            {currentTurnEntry && (
              <p className="text-muted-foreground mt-2">
                {isMyTurn ? (
                  <span className="text-gold font-semibold">Your turn!</span>
                ) : (
                  <span>{currentTurnEntry.name}'s turn</span>
                )}
              </p>
            )}
          </div>

          {/* Target selection area */}
          {uiState === "select_target" && (
            <Card className="border-gold">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎯 Select Target
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TargetSelector
                  enemies={combat.enemyCombatants}
                  allies={combat.playerCombatants.filter(
                    p => p.id !== myPlayerCombatant?.id
                  )}
                  selectedTargetId={selectedTargetId || undefined}
                  allowAllyTarget={selectedAction === "ability"} // Allow for healing abilities
                  onSelectTarget={handleSelectTarget}
                />
              </CardContent>
            </Card>
          )}

          {/* Enemy display when not selecting */}
          {uiState !== "select_target" && (
            <Card>
              <CardHeader>
                <CardTitle>👹 Enemies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {combat.enemyCombatants.map((enemy) => (
                    <EnemyCard key={enemy.id} enemy={enemy} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions panel */}
          {myPlayerCombatant && (
            <CombatActionsPanel
              combatant={myPlayerCombatant}
              uiState={uiState}
              isMyTurn={isMyTurn ?? false}
              canFlee={true} // Would come from node config
              onSelectAction={handleSelectAction}
              onCancel={handleCancel}
            />
          )}

          {/* Turn complete - end turn button */}
          {uiState === "turn_complete" && isMyTurn && (
            <Card className="border-success">
              <CardContent className="py-6 text-center">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-semibold mb-4">Action complete!</p>
                <Button variant="primary" onClick={handleEndTurn}>
                  End Turn →
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right sidebar - Combat log */}
        <div className="hidden lg:block lg:col-span-3">
          <Card className="h-[600px]">
            <CardContent className="p-4 h-full">
              <CombatLog
                entries={combat.log}
                autoScroll={true}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* End combat modal */}
      <Modal open={showEndCombatModal} onClose={() => setShowEndCombatModal(false)}>
        <ModalHeader>
          <ModalTitle>End Combat</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p className="text-muted-foreground mb-4">
            How does this combat end?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { type: "victory" as const, label: "Victory", icon: "🏆", desc: "Players won!" },
              { type: "defeat" as const, label: "Defeat", icon: "💀", desc: "Players lost" },
              { type: "fled" as const, label: "Fled", icon: "🏃", desc: "Players escaped" },
              { type: "negotiated" as const, label: "Negotiated", icon: "🤝", desc: "Peaceful resolution" },
            ].map(({ type, label, icon, desc }) => (
              <Button
                key={type}
                variant="secondary"
                className="h-auto py-4 flex-col"
                onClick={() => {
                  onEndCombat?.(type);
                  setShowEndCombatModal(false);
                }}
              >
                <span className="text-2xl mb-1">{icon}</span>
                <span className="font-semibold">{label}</span>
                <span className="text-xs text-muted-foreground">{desc}</span>
              </Button>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowEndCombatModal(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

// Enemy card component
function EnemyCard({ enemy }: { enemy: EnemyCombatant }) {
  const alive = isAlive(enemy);
  const hpPercent = Math.max(0, (enemy.currentHitPoints / enemy.creature.maxHitPoints) * 100);
  const name = getCombatantName(enemy);

  return (
    <div className={cn(
      "p-3 rounded-lg border transition-all",
      alive ? "border-error/50 bg-error/5" : "border-surface-divider opacity-50"
    )}>
      <div className="flex items-center gap-2 mb-2">
        {enemy.creature.imageUrl ? (
          <img
            src={enemy.creature.imageUrl}
            alt={name}
            className={cn(
              "w-10 h-10 rounded object-cover",
              !alive && "grayscale"
            )}
          />
        ) : (
          <div className="w-10 h-10 rounded bg-error/20 flex items-center justify-center">
            👹
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-semibold text-sm truncate",
            !alive && "line-through"
          )}>
            {name}
          </p>
          {!alive && <p className="text-xs text-error">Defeated</p>}
        </div>
      </div>
      {alive && (
        <>
          <div className="h-1.5 bg-surface-divider rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all",
                hpPercent > 50 ? "bg-success" : hpPercent > 25 ? "bg-warning" : "bg-error"
              )}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {enemy.currentHitPoints}/{enemy.creature.maxHitPoints}
          </p>
        </>
      )}
    </div>
  );
}

// Combat outcome view
function CombatOutcomeView({
  outcome,
  onContinue,
}: {
  outcome: CombatOutcome;
  onContinue: () => void;
}) {
  const isVictory = outcome.type === "victory";
  const isFled = outcome.type === "fled";

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-bg p-4">
      <Card className={cn(
        "max-w-md w-full",
        isVictory && "border-gold",
        !isVictory && !isFled && "border-error"
      )}>
        <CardContent className="py-8 text-center space-y-4">
          <div className="text-6xl">
            {isVictory ? "🏆" : isFled ? "🏃" : outcome.type === "negotiated" ? "🤝" : "💀"}
          </div>
          <h2 className={cn(
            "text-2xl font-bold",
            isVictory && "text-gold",
            !isVictory && !isFled && outcome.type !== "negotiated" && "text-error"
          )}>
            {isVictory ? "Victory!" : 
             isFled ? "Escaped!" : 
             outcome.type === "negotiated" ? "Negotiated" : "Defeat"}
          </h2>
          
          {outcome.experienceAwarded > 0 && (
            <div className="bg-gold/10 text-gold rounded-lg p-3">
              <p className="text-sm">Experience Gained</p>
              <p className="text-2xl font-bold">+{outcome.experienceAwarded} XP</p>
            </div>
          )}

          {outcome.lootDropped && outcome.lootDropped.length > 0 && (
            <div className="bg-surface-elevated rounded-lg p-3">
              <p className="text-sm text-muted-foreground mb-2">Loot Found</p>
              <ul className="space-y-1">
                {outcome.lootDropped.map((item) => (
                  <li key={item.id} className="flex items-center gap-2">
                    <span>📦</span>
                    <span>{item.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button variant="primary" onClick={onContinue} className="w-full">
            Continue Adventure →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
