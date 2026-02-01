"use client";

import { DiceRoller3D } from "@sparc/ui";

export default function DiceTestPage() {
  return (
    <div className="min-h-screen bg-[#0a1628] p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">3D Dice Roller</h1>
        <DiceRoller3D 
          onRoll={(results) => console.log("Rolled:", results)}
          initialCount={3}
          maxDice={6}
        />
      </div>
    </div>
  );
}
