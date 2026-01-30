"use client";

import { useState } from "react";
import { Button, Badge, Card, CardContent, CardHeader, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@sparc/ui";
import type { SessionPlayer, RollResult, Attribute } from "../types";

interface DicePanelProps {
  players: SessionPlayer[];
  recentRolls: RollResult[];
  onRequestRoll: (characterId: string, attribute: Attribute, difficulty: number, description?: string) => void;
}

// Attribute icons
const attributeIcons: Record<Attribute, string> = {
  might: "💪",
  grace: "🎯",
  wit: "🧠",
  heart: "❤️",
};

export function DicePanel({ players, recentRolls, onRequestRoll }: DicePanelProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute>("might");
  const [difficulty, setDifficulty] = useState(12);
  const [description, setDescription] = useState("");

  const handleRequestRoll = () => {
    if (selectedPlayer) {
      onRequestRoll(selectedPlayer, selectedAttribute, difficulty, description || undefined);
      setShowModal(false);
      setDescription("");
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">🎲 Dice Rolls</h3>
            <Button size="sm" onClick={() => setShowModal(true)}>
              Request Roll
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentRolls.length === 0 ? (
            <div className="text-center text-muted-foreground py-4 text-sm">
              No rolls yet this session
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recentRolls.map((roll) => (
                <div
                  key={roll.id}
                  className="flex items-center justify-between p-2 rounded bg-surface-elevated text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span>{attributeIcons[roll.attribute]}</span>
                    <div>
                      <div className="font-medium">{roll.characterName}</div>
                      <div className="text-xs text-muted-foreground">
                        {roll.attribute.toUpperCase()} vs DC {roll.difficulty}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-mono font-bold text-lg">
                        {roll.total}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {roll.roll} + {roll.modifier}
                      </div>
                    </div>
                    <Badge variant={roll.success ? "success" : "error"}>
                      {roll.success ? "✓" : "✗"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Roll Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <ModalHeader>
          <ModalTitle>🎲 Request Roll</ModalTitle>
        </ModalHeader>
        <ModalBody className="space-y-4">
          {/* Player Selection */}
          <div>
            <label className="text-sm font-medium">Player</label>
            <div className="mt-2 space-y-2">
              {players.map((player) => (
                <Button
                  key={player.id}
                  variant={selectedPlayer === player.character.id ? "primary" : "secondary"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSelectedPlayer(player.character.id)}
                  disabled={!player.isConnected}
                >
                  <span className="mr-2">{player.character.name}</span>
                  {!player.isConnected && (
                    <Badge variant="default" className="ml-auto text-xs">
                      Offline
                    </Badge>
                  )}
                </Button>
              ))}
              <Button
                variant={selectedPlayer === "all" ? "primary" : "secondary"}
                size="sm"
                className="w-full justify-start"
                onClick={() => setSelectedPlayer("all")}
              >
                📢 All Players
              </Button>
            </div>
          </div>

          {/* Attribute Selection */}
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

          {/* Difficulty */}
          <div>
            <label className="text-sm font-medium">Difficulty (DC)</label>
            <div className="flex items-center gap-4 mt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDifficulty(Math.max(1, difficulty - 1))}
              >
                -
              </Button>
              <div className="flex-1 text-center">
                <span className="font-bold text-2xl font-mono">{difficulty}</span>
                <div className="text-xs text-muted-foreground">
                  {difficulty <= 8 ? "Very Easy" : 
                   difficulty <= 10 ? "Easy" : 
                   difficulty <= 12 ? "Medium" : 
                   difficulty <= 15 ? "Hard" : 
                   difficulty <= 18 ? "Very Hard" : "Nearly Impossible"}
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDifficulty(Math.min(25, difficulty + 1))}
              >
                +
              </Button>
            </div>
            {/* Quick DC buttons */}
            <div className="flex gap-1 mt-2">
              {[8, 10, 12, 15, 18].map((dc) => (
                <Button
                  key={dc}
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setDifficulty(dc)}
                >
                  {dc}
                </Button>
              ))}
            </div>
          </div>

          {/* Description (optional) */}
          <div>
            <label className="text-sm font-medium">Description (optional)</label>
            <input
              type="text"
              placeholder="e.g., 'Try to pick the lock'"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-2 px-3 py-2 rounded border border-surface-divider bg-surface-base text-sm"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleRequestRoll} disabled={!selectedPlayer}>
            Request Roll
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
