"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "../lib/utils";

// =============================================================================
// Types
// =============================================================================

interface Dice3DProps {
  value?: number;
  rolling?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "white" | "red" | "blue" | "gold";
  onRollComplete?: (value: number) => void;
  className?: string;
}

interface DicePoolProps {
  count: number;
  results?: number[];
  rolling?: boolean;
  size?: "sm" | "md" | "lg";
  onComplete?: (results: number[]) => void;
  className?: string;
}

// =============================================================================
// Dice Face Dots
// =============================================================================

const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

function DiceFace({ value, className }: { value: number; className?: string }) {
  const dots = DOT_POSITIONS[value] || [];
  
  return (
    <div className={cn("absolute w-full h-full bg-white rounded-lg flex items-center justify-center", className)}>
      <div className="relative w-[80%] h-[80%]">
        {dots.map(([x, y], i) => (
          <div
            key={i}
            className="absolute w-[18%] h-[18%] bg-gray-800 rounded-full"
            style={{ left: `${x - 9}%`, top: `${y - 9}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Single 3D Die
// =============================================================================

const SIZE_MAP = {
  sm: { size: "w-10 h-10", perspective: 100 },
  md: { size: "w-14 h-14", perspective: 150 },
  lg: { size: "w-20 h-20", perspective: 200 },
};

const COLOR_MAP = {
  white: "bg-white border-gray-300",
  red: "bg-red-100 border-red-400",
  blue: "bg-blue-100 border-blue-400",
  gold: "bg-amber-100 border-amber-400",
};

// Rotation for each face to be front-facing
const FACE_ROTATIONS: Record<number, string> = {
  1: "rotateX(0deg) rotateY(0deg)",
  2: "rotateX(0deg) rotateY(90deg)",
  3: "rotateX(-90deg) rotateY(0deg)",
  4: "rotateX(90deg) rotateY(0deg)",
  5: "rotateX(0deg) rotateY(-90deg)",
  6: "rotateX(180deg) rotateY(0deg)",
};

export function Dice3D({
  value = 1,
  rolling = false,
  size = "md",
  color = "white",
  onRollComplete,
  className,
}: Dice3DProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  // Roll animation
  useEffect(() => {
    if (rolling) {
      setIsAnimating(true);
      
      // Animate random rotations
      let frame = 0;
      const totalFrames = 15;
      
      const animate = () => {
        if (frame < totalFrames) {
          setRotation({
            x: Math.random() * 720 - 360,
            y: Math.random() * 720 - 360,
            z: Math.random() * 360 - 180,
          });
          setDisplayValue(Math.floor(Math.random() * 6) + 1);
          frame++;
          setTimeout(animate, 50 + frame * 15);
        } else {
          // Final position based on value
          const finalValue = value;
          setDisplayValue(finalValue);
          
          // Set rotation to show correct face
          const baseRotation = FACE_ROTATIONS[finalValue];
          setRotation({ x: 0, y: 0, z: 0 }); // Reset for CSS transition
          setIsAnimating(false);
          onRollComplete?.(finalValue);
        }
      };
      
      animate();
    }
  }, [rolling, value, onRollComplete]);

  const { size: sizeClass, perspective } = SIZE_MAP[size];

  return (
    <div 
      className={cn("relative", sizeClass, className)}
      style={{ perspective: `${perspective}px` }}
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-300",
          isAnimating && "animate-spin"
        )}
        style={{
          transformStyle: "preserve-3d",
          transform: isAnimating 
            ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`
            : FACE_ROTATIONS[displayValue],
        }}
      >
        {/* All 6 faces */}
        {[1, 2, 3, 4, 5, 6].map((face) => (
          <DiceFace
            key={face}
            value={face}
            className={cn(
              "border-2 shadow-md",
              COLOR_MAP[color],
              face === 1 && "translate-z-[50%]",
              face === 6 && "-translate-z-[50%] rotate-180",
              face === 2 && "translate-x-[50%] rotate-y-90",
              face === 5 && "-translate-x-[50%] -rotate-y-90",
              face === 3 && "-translate-y-[50%] rotate-x-90",
              face === 4 && "translate-y-[50%] -rotate-x-90",
            )}
            style={{
              transform: 
                face === 1 ? "translateZ(50%)" :
                face === 6 ? "translateZ(-50%) rotateX(180deg)" :
                face === 2 ? "translateX(50%) rotateY(90deg)" :
                face === 5 ? "translateX(-50%) rotateY(-90deg)" :
                face === 3 ? "translateY(-50%) rotateX(90deg)" :
                "translateY(50%) rotateX(-90deg)"
            }}
          />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Dice Pool (Multiple Dice)
// =============================================================================

export function DicePool3D({
  count,
  results,
  rolling = false,
  size = "md",
  onComplete,
  className,
}: DicePoolProps) {
  const [diceResults, setDiceResults] = useState<number[]>(
    results || Array(count).fill(1)
  );
  const [completedCount, setCompletedCount] = useState(0);

  // Reset when count changes
  useEffect(() => {
    if (!rolling) {
      setDiceResults(results || Array(count).fill(1));
    }
  }, [count, results, rolling]);

  // Track completed rolls
  const handleDieComplete = useCallback((index: number, value: number) => {
    setDiceResults(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setCompletedCount(prev => prev + 1);
  }, []);

  // Fire onComplete when all dice done
  useEffect(() => {
    if (rolling && completedCount === count) {
      onComplete?.(diceResults);
      setCompletedCount(0);
    }
  }, [completedCount, count, diceResults, onComplete, rolling]);

  // Generate roll results
  const rollValues = results || (rolling 
    ? Array(count).fill(0).map(() => Math.floor(Math.random() * 6) + 1)
    : diceResults
  );

  return (
    <div className={cn("flex flex-wrap gap-3 justify-center", className)}>
      {Array(count).fill(0).map((_, i) => (
        <Dice3D
          key={i}
          value={rollValues[i] || 1}
          rolling={rolling}
          size={size}
          onRollComplete={(v) => handleDieComplete(i, v)}
        />
      ))}
    </div>
  );
}

// =============================================================================
// Interactive Dice Roller
// =============================================================================

export function DiceRoller3D({ 
  onRoll,
  initialCount = 2,
  maxDice = 10,
}: { 
  onRoll?: (results: number[]) => void;
  initialCount?: number;
  maxDice?: number;
}) {
  const [diceCount, setDiceCount] = useState(initialCount);
  const [rolling, setRolling] = useState(false);
  const [results, setResults] = useState<number[]>([]);

  const roll = () => {
    const newResults = Array(diceCount).fill(0).map(() => 
      Math.floor(Math.random() * 6) + 1
    );
    setResults(newResults);
    setRolling(true);
  };

  const handleComplete = (finalResults: number[]) => {
    setRolling(false);
    onRoll?.(finalResults);
  };

  const successes = results.filter(r => r >= 5).length;

  return (
    <div className="p-6 bg-surface-elevated rounded-xl space-y-6">
      {/* Dice count selector */}
      <div className="flex items-center justify-center gap-4">
        <button 
          onClick={() => setDiceCount(Math.max(1, diceCount - 1))} 
          disabled={rolling}
          className="w-10 h-10 rounded-full bg-surface-base border border-surface-divider font-bold text-lg hover:bg-surface-hover disabled:opacity-50"
        >
          −
        </button>
        <span className="text-2xl font-bold min-w-[80px] text-center">
          {diceCount}d6
        </span>
        <button 
          onClick={() => setDiceCount(Math.min(maxDice, diceCount + 1))} 
          disabled={rolling}
          className="w-10 h-10 rounded-full bg-surface-base border border-surface-divider font-bold text-lg hover:bg-surface-hover disabled:opacity-50"
        >
          +
        </button>
      </div>
      
      {/* Dice display */}
      <div className="min-h-[100px] flex items-center justify-center">
        <DicePool3D 
          count={diceCount} 
          results={results}
          rolling={rolling} 
          size="lg"
          onComplete={handleComplete}
        />
      </div>
      
      {/* Roll button */}
      <button 
        onClick={roll} 
        disabled={rolling} 
        className={cn(
          "w-full py-4 rounded-lg font-bold text-lg text-white transition-colors",
          rolling 
            ? "bg-muted-foreground cursor-not-allowed" 
            : "bg-bronze hover:bg-bronze/90 active:scale-[0.98]"
        )}
      >
        {rolling ? "Rolling..." : "🎲 Roll Dice"}
      </button>
      
      {/* Results */}
      {results.length > 0 && !rolling && (
        <div className="text-center space-y-1">
          <div className="text-3xl font-bold text-gold">
            {successes} {successes === 1 ? "Success" : "Successes"}
          </div>
          <div className="text-muted-foreground">
            Results: [{results.join(", ")}] • Total: {results.reduce((a, b) => a + b, 0)}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dice3D;
