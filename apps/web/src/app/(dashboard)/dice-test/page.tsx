"use client";

import { DiceRoller3D } from "@sparc/ui";

export default function DiceTestPage() {
  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">3D Dice Roller</h1>
      <DiceRoller3D 
        onRoll={(results) => console.log("Rolled:", results)}
        initialCount={3}
        maxDice={6}
      />
    </div>
  );
}
