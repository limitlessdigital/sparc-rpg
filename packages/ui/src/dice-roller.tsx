"use client";

import * as React from "react";
import { cn } from "./lib/utils";
import { Button } from "./Button";
import { Badge } from "./Badge";

// SPARC uses d6 dice pools
export interface DicePoolRoll {
  dice: number[];
  total: number;
  successes: number;
  difficulty: number;
  result: "critical-success" | "success" | "partial" | "failure" | "critical-failure";
}

export interface DiceRollerProps {
  /** Number of dice in the pool (default 2) */
  poolSize?: number;
  /** Difficulty threshold for success (default 4) */
  difficulty?: number;
  /** Attribute being rolled (for styling) */
  attribute?: "might" | "grace" | "wit" | "heart";
  /** Callback when roll completes */
  onRoll?: (result: DicePoolRoll) => void;
  /** Compact mode for inline use */
  compact?: boolean;
  /** Custom class name */
  className?: string;
}

// Roll a single d6
function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

// Calculate roll result
function evaluateRoll(dice: number[], difficulty: number): DicePoolRoll {
  const total = dice.reduce((sum, d) => sum + d, 0);
  const successes = dice.filter(d => d >= difficulty).length;
  const sixes = dice.filter(d => d === 6).length;
  const ones = dice.filter(d => d === 1).length;
  
  let result: DicePoolRoll["result"];
  
  // Critical success: multiple 6s
  if (sixes >= 2) {
    result = "critical-success";
  }
  // Critical failure: all 1s
  else if (ones === dice.length && dice.length > 0) {
    result = "critical-failure";
  }
  // Success: majority meet difficulty
  else if (successes >= Math.ceil(dice.length / 2)) {
    result = "success";
  }
  // Partial: at least one success
  else if (successes > 0) {
    result = "partial";
  }
  // Failure: no successes
  else {
    result = "failure";
  }
  
  return { dice, total, successes, difficulty, result };
}

// Individual die face component
function DieFace({ 
  value, 
  isRolling, 
  difficulty,
  delay = 0 
}: { 
  value: number; 
  isRolling: boolean; 
  difficulty: number;
  delay?: number;
}) {
  const isSuccess = value >= difficulty;
  const isSix = value === 6;
  const isOne = value === 1;
  
  // Pip positions for each die face
  const pipPositions: Record<number, [number, number][]> = {
    1: [[1, 1]],
    2: [[0, 0], [2, 2]],
    3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]],
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
  };
  
  return (
    <div
      className={cn(
        "relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 transition-all duration-300",
        "flex items-center justify-center",
        isRolling && "animate-bounce",
        isSix && "border-gold bg-gold/20 shadow-glow-gold",
        isOne && "border-error bg-error/20",
        isSuccess && !isSix && "border-success bg-success/10",
        !isSuccess && !isOne && "border-surface-divider bg-surface-elevated"
      )}
      style={{ 
        animationDelay: `${delay}ms`,
        animationDuration: isRolling ? "500ms" : "0ms"
      }}
    >
      {/* Pip grid */}
      <div className="grid grid-cols-3 grid-rows-3 gap-0.5 w-8 h-8 sm:w-9 sm:h-9 p-1">
        {[0, 1, 2].map(row => (
          [0, 1, 2].map(col => {
            const hasPip = pipPositions[value]?.some(([r, c]) => r === row && c === col);
            return (
              <div
                key={`${row}-${col}`}
                className={cn(
                  "rounded-full transition-all",
                  hasPip && cn(
                    "w-full h-full",
                    isSix && "bg-gold",
                    isOne && "bg-error",
                    isSuccess && !isSix && "bg-success",
                    !isSuccess && !isOne && "bg-muted-foreground"
                  )
                )}
              />
            );
          })
        ))}
      </div>
    </div>
  );
}

export function DiceRoller({
  poolSize = 2,
  difficulty = 4,
  attribute,
  onRoll,
  compact = false,
  className,
}: DiceRollerProps) {
  const [diceCount, setDiceCount] = React.useState(poolSize);
  const [currentDifficulty, setCurrentDifficulty] = React.useState(difficulty);
  const [isRolling, setIsRolling] = React.useState(false);
  const [result, setResult] = React.useState<DicePoolRoll | null>(null);
  const [displayDice, setDisplayDice] = React.useState<number[]>([]);

  // Attribute colors
  const attributeColors = {
    might: "text-might",
    grace: "text-grace",
    wit: "text-wit",
    heart: "text-heart",
  };

  const handleRoll = () => {
    setIsRolling(true);
    setResult(null);
    
    // Animate random dice values
    let animationCount = 0;
    const animationInterval = setInterval(() => {
      setDisplayDice(Array.from({ length: diceCount }, () => rollD6()));
      animationCount++;
      if (animationCount >= 8) {
        clearInterval(animationInterval);
        
        // Final roll
        const finalDice = Array.from({ length: diceCount }, () => rollD6());
        const rollResult = evaluateRoll(finalDice, currentDifficulty);
        setDisplayDice(finalDice);
        setResult(rollResult);
        setIsRolling(false);
        onRoll?.(rollResult);
      }
    }, 80);
  };

  const resultLabels: Record<DicePoolRoll["result"], { text: string; variant: "success" | "warning" | "error" | "default" }> = {
    "critical-success": { text: "🎯 Critical Success!", variant: "success" },
    "success": { text: "✓ Success", variant: "success" },
    "partial": { text: "◐ Partial Success", variant: "warning" },
    "failure": { text: "✗ Failure", variant: "error" },
    "critical-failure": { text: "💀 Critical Failure!", variant: "error" },
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRoll}
          loading={isRolling}
        >
          🎲 Roll {diceCount}d6
        </Button>
        {result && (
          <Badge variant={resultLabels[result.result].variant}>
            {result.total} ({result.successes} hits)
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Dice count */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Dice:</span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDiceCount(Math.max(1, diceCount - 1))}
                disabled={diceCount <= 1 || isRolling}
              >
                −
              </Button>
              <span className={cn(
                "w-8 text-center font-bold text-lg",
                attribute && attributeColors[attribute]
              )}>
                {diceCount}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDiceCount(Math.min(10, diceCount + 1))}
                disabled={diceCount >= 10 || isRolling}
              >
                +
              </Button>
            </div>
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Difficulty:</span>
            <select
              value={currentDifficulty}
              onChange={(e) => setCurrentDifficulty(Number(e.target.value))}
              disabled={isRolling}
              className="bg-surface-elevated border border-surface-divider rounded px-2 py-1 text-sm"
            >
              <option value={3}>Easy (3+)</option>
              <option value={4}>Normal (4+)</option>
              <option value={5}>Hard (5+)</option>
              <option value={6}>Extreme (6)</option>
            </select>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={handleRoll}
          loading={isRolling}
          className="min-w-[100px]"
        >
          🎲 Roll
        </Button>
      </div>

      {/* Dice display */}
      <div className="flex flex-wrap justify-center gap-3 p-4 bg-surface-card border border-surface-divider rounded-lg min-h-[80px]">
        {(displayDice.length > 0 ? displayDice : Array(diceCount).fill(0)).map((value, i) => (
          <DieFace
            key={i}
            value={value || 1}
            isRolling={isRolling}
            difficulty={currentDifficulty}
            delay={i * 50}
          />
        ))}
      </div>

      {/* Results */}
      {result && !isRolling && (
        <div className="flex items-center justify-between p-4 bg-surface-elevated border border-surface-divider rounded-lg">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              Total: <span className="font-bold text-foreground">{result.total}</span>
              {" · "}
              Successes: <span className="font-bold text-foreground">{result.successes}/{result.dice.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              [{result.dice.join(", ")}] vs difficulty {result.difficulty}+
            </div>
          </div>
          <Badge 
            variant={resultLabels[result.result].variant}
            size="md"
            className="text-sm"
          >
            {resultLabels[result.result].text}
          </Badge>
        </div>
      )}
    </div>
  );
}

// Quick roll utility function
export function quickRoll(poolSize: number, difficulty: number = 4): DicePoolRoll {
  const dice = Array.from({ length: poolSize }, () => rollD6());
  return evaluateRoll(dice, difficulty);
}
