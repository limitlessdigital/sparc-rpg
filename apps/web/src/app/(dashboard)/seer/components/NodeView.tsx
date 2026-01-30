"use client";

import { useState } from "react";
import { cn, Card, CardHeader, CardContent, Button, Badge } from "@sparc/ui";
import type { AdventureNode, NodeConnection, Attribute } from "../types";

interface NodeViewProps {
  node: AdventureNode;
  connections: NodeConnection[];
  onNavigate: (nodeId: string) => void;
  onRequestRoll?: (attribute: Attribute, difficulty: number) => void;
  onStartCombat?: () => void;
}

// Node type colors and icons
const nodeTypeConfig: Record<string, { icon: string; color: string; label: string }> = {
  story: { icon: "📖", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", label: "Story" },
  challenge: { icon: "🎯", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", label: "Challenge" },
  combat: { icon: "⚔️", color: "bg-red-500/10 text-red-600 border-red-500/20", label: "Combat" },
  decision: { icon: "🔀", color: "bg-purple-500/10 text-purple-600 border-purple-500/20", label: "Decision" },
  outcome: { icon: "🏁", color: "bg-green-500/10 text-green-600 border-green-500/20", label: "Outcome" },
};

function ReadAloudBox({ text }: { text: string }) {
  const [isHighlighted, setIsHighlighted] = useState(false);

  return (
    <div 
      className={cn(
        "relative p-4 rounded-lg border-2 border-dashed transition-all cursor-pointer",
        isHighlighted 
          ? "bg-amber-500/20 border-amber-500" 
          : "bg-surface-elevated border-amber-500/30 hover:border-amber-500/50"
      )}
      onClick={() => setIsHighlighted(!isHighlighted)}
    >
      <div className="absolute -top-3 left-4 px-2 bg-surface text-xs font-medium text-amber-600">
        📜 READ ALOUD
      </div>
      <p className="text-lg italic leading-relaxed">{text}</p>
      <div className="mt-2 text-xs text-muted-foreground">
        Click to {isHighlighted ? "dim" : "highlight"}
      </div>
    </div>
  );
}

function SeerNotesBox({ notes }: { notes: string }) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="p-4 rounded-lg bg-surface-elevated border border-surface-divider">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span>👁️</span>
          SEER NOTES
          <Badge variant="default" className="text-xs">Hidden from players</Badge>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? "Hide" : "Show"}
        </Button>
      </div>
      {isVisible && (
        <div className="whitespace-pre-wrap text-sm text-muted-foreground">
          {notes}
        </div>
      )}
    </div>
  );
}

function ChallengePanel({ 
  attribute, 
  difficulty, 
  onRoll 
}: { 
  attribute: Attribute; 
  difficulty: number;
  onRoll: () => void;
}) {
  return (
    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-amber-600 uppercase">Challenge</div>
          <div className="text-lg font-bold">
            {attribute.toUpperCase()} Check
          </div>
          <div className="text-sm text-muted-foreground">
            Difficulty: <span className="font-bold">{difficulty}</span>
          </div>
        </div>
        <Button onClick={onRoll} className="gap-2">
          <span>🎲</span>
          Request Roll
        </Button>
      </div>
    </div>
  );
}

function CombatSetupPanel({ 
  enemies, 
  onStart 
}: { 
  enemies: Array<{ name: string; maxHp: number }>;
  onStart: () => void;
}) {
  return (
    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-red-600 uppercase">Combat Encounter</div>
        <Button onClick={onStart} variant="danger" className="gap-2">
          <span>⚔️</span>
          Start Combat
        </Button>
      </div>
      <div className="space-y-2">
        {enemies.map((enemy, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span>{enemy.name}</span>
            <Badge variant="outline">{enemy.maxHp} HP</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NodeView({ 
  node, 
  connections, 
  onNavigate,
  onRequestRoll,
  onStartCombat,
}: NodeViewProps) {
  const config = nodeTypeConfig[node.type];
  const nodeData = node.data;

  return (
    <div className="space-y-4">
      {/* Node Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <Badge className={cn("px-3 py-1", config.color)}>
              <span className="mr-1">{config.icon}</span>
              {config.label}
            </Badge>
            <h2 className="text-xl font-bold">{node.title}</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Content */}
          <div className="prose prose-invert max-w-none">
            <p>{node.content}</p>
          </div>

          {/* Node Image (if present) */}
          {node.imageUrl && (
            <div className="relative rounded-lg overflow-hidden">
              <img 
                src={node.imageUrl} 
                alt={node.title}
                className="w-full h-48 object-cover"
              />
              {!node.imageVisibleToPlayers && (
                <Badge className="absolute top-2 right-2" variant="default">
                  👁️ Seer Only
                </Badge>
              )}
            </div>
          )}

          {/* Read Aloud Box */}
          {"readAloudText" in nodeData && nodeData.readAloudText && (
            <ReadAloudBox text={nodeData.readAloudText} />
          )}

          {/* Seer Notes */}
          {"seerNotes" in nodeData && nodeData.seerNotes && (
            <SeerNotesBox notes={nodeData.seerNotes} />
          )}

          {/* Type-specific content */}
          {node.type === "challenge" && "attribute" in nodeData && onRequestRoll && (
            <ChallengePanel
              attribute={nodeData.attribute}
              difficulty={nodeData.difficulty}
              onRoll={() => onRequestRoll(nodeData.attribute, nodeData.difficulty)}
            />
          )}

          {node.type === "combat" && "enemies" in nodeData && onStartCombat && (
            <CombatSetupPanel
              enemies={nodeData.enemies}
              onStart={onStartCombat}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Options */}
      {connections.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-lg font-semibold">Next Steps</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {connections.map((conn) => (
                <Button
                  key={conn.id}
                  variant="secondary"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => onNavigate(conn.targetNodeId)}
                >
                  <span className="mr-2">→</span>
                  {conn.label}
                  {conn.condition && (
                    <Badge variant="default" className="ml-auto text-xs">
                      {conn.condition}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
