"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";

interface DiceAnimationProps {
  diceCount: number;
  results?: number[];
  rolling?: boolean;
  onComplete?: () => void;
  size?: "sm" | "md" | "lg";
}

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function DiceAnimation({ diceCount, results, rolling = false, onComplete, size = "md" }: DiceAnimationProps) {
  const [displayValues, setDisplayValues] = useState<number[]>(Array(diceCount).fill(1));
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (rolling) {
      setIsAnimating(true);
      let frame = 0;
      const maxFrames = 20;
      
      const animate = () => {
        if (frame < maxFrames) {
          setDisplayValues(Array(diceCount).fill(0).map(() => Math.floor(Math.random() * 6) + 1));
          frame++;
          setTimeout(animate, 50 + frame * 10);
        } else {
          setDisplayValues(results || Array(diceCount).fill(0).map(() => Math.floor(Math.random() * 6) + 1));
          setIsAnimating(false);
          onComplete?.();
        }
      };
      animate();
    } else if (results) {
      setDisplayValues(results);
    }
  }, [rolling, results, diceCount, onComplete]);

  const sizeClasses = { sm: "text-2xl w-8 h-8", md: "text-4xl w-12 h-12", lg: "text-6xl w-16 h-16" };

  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {displayValues.map((value, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center justify-center bg-white rounded-lg shadow-lg border-2 border-gray-300",
            sizeClasses[size],
            isAnimating && "animate-bounce"
          )}
        >
          {DICE_FACES[value - 1]}
        </div>
      ))}
    </div>
  );
}

export function DiceRoller({ onRoll }: { onRoll?: (results: number[]) => void }) {
  const [diceCount, setDiceCount] = useState(2);
  const [rolling, setRolling] = useState(false);
  const [results, setResults] = useState<number[]>([]);

  const roll = () => {
    setRolling(true);
    const newResults = Array(diceCount).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
    setTimeout(() => {
      setResults(newResults);
      setRolling(false);
      onRoll?.(newResults);
    }, 1000);
  };

  const successes = results.filter(r => r >= 5).length;

  return (
    <div className="p-4 bg-gray-100 rounded-xl space-y-4">
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => setDiceCount(Math.max(1, diceCount - 1))} className="w-8 h-8 rounded-full bg-gray-300 font-bold">-</button>
        <span className="text-xl font-bold">{diceCount}d6</span>
        <button onClick={() => setDiceCount(Math.min(10, diceCount + 1))} className="w-8 h-8 rounded-full bg-gray-300 font-bold">+</button>
      </div>
      
      <DiceAnimation diceCount={diceCount} results={results} rolling={rolling} />
      
      <button onClick={roll} disabled={rolling} className={cn("w-full py-3 rounded-lg font-bold text-white", rolling ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700")}>
        {rolling ? "Rolling..." : "Roll Dice"}
      </button>
      
      {results.length > 0 && !rolling && (
        <div className="text-center">
          <div className="text-2xl font-bold">{successes} {successes === 1 ? "Success" : "Successes"}</div>
          <div className="text-gray-500">Total: {results.reduce((a, b) => a + b, 0)}</div>
        </div>
      )}
    </div>
  );
}

export default DiceAnimation;
