"use client";

import * as React from "react";
import { useState } from "react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action?: string;
}

const STEPS: OnboardingStep[] = [
  { id: "welcome", title: "Welcome to SPARC", description: "A tabletop RPG where your story matters. Let's get you set up!" },
  { id: "role", title: "Choose Your Role", description: "Are you a Seer (game master) or a Player?", action: "select_role" },
  { id: "character", title: "Create Your Character", description: "Build your hero with our character creator.", action: "create_character" },
  { id: "session", title: "Join or Create", description: "Find a session to join or create your own adventure.", action: "find_session" },
  { id: "ready", title: "You're Ready!", description: "Your adventure awaits. Good luck, hero!" },
];

export function OnboardingFlow({ onComplete }: { onComplete?: (role: "seer" | "player") => void }) {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<"seer" | "player" | null>(null);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const next = () => {
    if (isLast) {
      onComplete?.(role || "player");
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex gap-1 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded ${i <= step ? "bg-blue-600" : "bg-gray-200"}`} />
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-2">{current.title}</h2>
        <p className="text-gray-600 mb-6">{current.description}</p>

        {current.action === "select_role" && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button onClick={() => setRole("seer")} className={`p-4 rounded-lg border-2 ${role === "seer" ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}>
              <div className="text-3xl mb-2">🔮</div>
              <div className="font-bold">Seer</div>
              <div className="text-sm text-gray-500">Run games</div>
            </button>
            <button onClick={() => setRole("player")} className={`p-4 rounded-lg border-2 ${role === "player" ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}>
              <div className="text-3xl mb-2">⚔️</div>
              <div className="font-bold">Player</div>
              <div className="text-sm text-gray-500">Play games</div>
            </button>
          </div>
        )}

        <button
          onClick={next}
          disabled={current.action === "select_role" && !role}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300"
        >
          {isLast ? "Start Playing" : "Continue"}
        </button>
      </div>
    </div>
  );
}

export default OnboardingFlow;
