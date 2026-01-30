"use client";

import { useState } from "react";
import { cn, Button, Badge, Avatar, Card, CardContent, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@sparc/ui";
import type { SessionPlayer, PlayerAction, Attribute } from "../types";

interface PlayerSidebarProps {
  players: SessionPlayer[];
  onPlayerAction: (playerId: string, action: PlayerAction) => void;
}

interface PlayerCardProps {
  player: SessionPlayer;
  onAction: (action: PlayerAction) => void;
}

// Attribute icons
const attributeIcons: Record<Attribute, string> = {
  might: "💪",
  grace: "🎯",
  wit: "🧠",
  heart: "❤️",
};

function StatBadge({ attr, value }: { attr: Attribute; value: number }) {
  const modifier = Math.floor((value - 10) / 2);
  const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
  
  return (
    <div className="flex items-center gap-1 text-xs">
      <span>{attributeIcons[attr]}</span>
      <span className="font-mono">{modifierStr}</span>
    </div>
  );
}

function HPBar({ current, max }: { current: number; max: number }) {
  const percent = (current / max) * 100;
  const isLow = percent < 25;
  const isMedium = percent < 50 && !isLow;

  return (
    <div className="relative h-4 bg-surface-base rounded-full overflow-hidden">
      <div
        className={cn(
          "absolute inset-y-0 left-0 transition-all duration-300",
          isLow && "bg-red-500",
          isMedium && "bg-amber-500",
          !isLow && !isMedium && "bg-green-500"
        )}
        style={{ width: `${percent}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
        {current} / {max}
      </div>
    </div>
  );
}

function ConnectionIndicator({ connected }: { connected: boolean }) {
  return (
    <div
      className={cn(
        "w-2 h-2 rounded-full",
        connected ? "bg-green-500" : "bg-red-500 animate-pulse"
      )}
      title={connected ? "Connected" : "Disconnected"}
    />
  );
}

function PlayerCard({ player, onAction }: PlayerCardProps) {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showRollModal, setShowRollModal] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute>("might");
  const [difficulty, setDifficulty] = useState(12);

  const { character } = player;

  const handleRoll = () => {
    onAction({ type: "roll", attribute: selectedAttribute, difficulty });
    setShowRollModal(false);
  };

  return (
    <>
      <Card className={cn(
        "transition-all",
        !player.isConnected && "opacity-60"
      )}>
        <CardContent className="p-3 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Avatar
              src={character.portraitUrl}
              alt={character.name}
              fallback={character.name.charAt(0)}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{character.name}</span>
                <ConnectionIndicator connected={player.isConnected} />
              </div>
              <div className="text-xs text-muted-foreground">
                {character.characterClass}
              </div>
            </div>
          </div>

          {/* HP Bar */}
          <HPBar current={character.currentHitPoints} max={character.maxHitPoints} />

          {/* Quick Stats */}
          <div className="flex justify-between">
            <StatBadge attr="might" value={character.attributes.might} />
            <StatBadge attr="grace" value={character.attributes.grace} />
            <StatBadge attr="wit" value={character.attributes.wit} />
            <StatBadge attr="heart" value={character.attributes.heart} />
          </div>

          {/* Conditions */}
          {character.conditions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {character.conditions.map((condition) => (
                <Badge
                  key={condition.id}
                  variant="default"
                  className="text-xs cursor-pointer hover:bg-red-500/20"
                  onClick={() => onAction({ type: "removeCondition", conditionId: condition.id })}
                  title={`${condition.description} (click to remove)`}
                >
                  {condition.name}
                  {condition.duration && <span className="ml-1">({condition.duration})</span>}
                </Badge>
              ))}
            </div>
          )}

          {/* Abilities */}
          {character.specialAbilities.length > 0 && (
            <div className="space-y-1">
              {character.specialAbilities.map((ability) => (
                <div
                  key={ability.id}
                  className="flex items-center justify-between text-xs"
                  title={ability.description}
                >
                  <span className="text-muted-foreground">{ability.name}</span>
                  {ability.usesRemaining !== undefined && ability.maxUses !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      {ability.usesRemaining}/{ability.maxUses}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-1 pt-2 border-t border-surface-divider">
            <Button
              size="sm"
              variant="secondary"
              className="flex-1 text-xs"
              onClick={() => onAction({ type: "heal", value: 1 })}
            >
              +1 HP
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="flex-1 text-xs"
              onClick={() => onAction({ type: "damage", value: 1 })}
            >
              -1 HP
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="text-xs"
              onClick={() => setShowRollModal(true)}
            >
              🎲
            </Button>
          </div>

          {/* More Actions Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => setShowQuickActions(!showQuickActions)}
          >
            {showQuickActions ? "Less ▲" : "More ▼"}
          </Button>

          {showQuickActions && (
            <div className="space-y-2 pt-2 border-t border-surface-divider">
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1 text-xs"
                  onClick={() => onAction({ type: "heal", value: 5 })}
                >
                  +5 HP
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1 text-xs"
                  onClick={() => onAction({ type: "damage", value: 5 })}
                >
                  -5 HP
                </Button>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="w-full text-xs"
                onClick={() => onAction({ type: "view" })}
              >
                View Full Sheet
              </Button>
              {!player.isConnected && (
                <Button
                  size="sm"
                  variant="danger"
                  className="w-full text-xs"
                  onClick={() => onAction({ type: "kick" })}
                >
                  Remove Player
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roll Request Modal */}
      <Modal open={showRollModal} onClose={() => setShowRollModal(false)}>
        <ModalHeader>
          <ModalTitle>Request Roll from {character.name}</ModalTitle>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div>
            <label className="text-sm font-medium">Attribute</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(["might", "grace", "wit", "heart"] as Attribute[]).map((attr) => (
                <Button
                  key={attr}
                  variant={selectedAttribute === attr ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setSelectedAttribute(attr)}
                  className="capitalize"
                >
                  {attributeIcons[attr]} {attr}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Difficulty (DC)</label>
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDifficulty(Math.max(1, difficulty - 1))}
              >
                -
              </Button>
              <span className="w-12 text-center font-bold text-xl">{difficulty}</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDifficulty(Math.min(30, difficulty + 1))}
              >
                +
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {difficulty <= 10 ? "Easy" : difficulty <= 15 ? "Medium" : difficulty <= 20 ? "Hard" : "Very Hard"}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowRollModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleRoll}>
            Request Roll
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export function PlayerSidebar({ players, onPlayerAction }: PlayerSidebarProps) {
  return (
    <div className="w-72 bg-surface border-l border-surface-divider p-4 space-y-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Party ({players.length})</h3>
        <Badge variant="outline">
          {players.filter(p => p.isConnected).length} online
        </Badge>
      </div>
      
      <div className="space-y-3">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            onAction={(action) => onPlayerAction(player.id, action)}
          />
        ))}
      </div>
    </div>
  );
}
