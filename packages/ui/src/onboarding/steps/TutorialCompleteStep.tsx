"use client";

/**
 * @sparc/ui TutorialCompleteStep
 * 
 * Based on PRD 15: Onboarding Tutorial
 * Celebration and next steps after completing the tutorial.
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import type { TutorialCompleteStepProps } from "../types";

// =============================================================================
// Confetti Animation (simple CSS-based)
// =============================================================================

function Confetti() {
  const colors = ["#CD7F32", "#FFD700", "#C0C0C0", "#B87333", "#E6BE8A"];
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-3 h-3"
          style={{
            left: `${piece.left}%`,
            top: "-20px",
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            animation: `confetti-fall ${piece.duration}s linear ${piece.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// =============================================================================
// Action Button Component
// =============================================================================

interface ActionButtonProps {
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
  primary?: boolean;
}

function ActionButton({ icon, title, description, onClick, primary }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl text-left transition-all w-full",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze",
        primary
          ? "bg-gradient-to-br from-bronze to-bronze-600 text-white hover:brightness-110"
          : "bg-surface-elevated hover:bg-surface-elevated/80"
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className={cn("font-semibold", primary ? "text-white" : "text-foreground")}>
            {title}
          </h3>
          <p className={cn("text-sm", primary ? "text-white/80" : "text-muted-foreground")}>
            {description}
          </p>
        </div>
        <span className="ml-auto text-xl">→</span>
      </div>
    </button>
  );
}

// =============================================================================
// Player Complete Step
// =============================================================================

export function PlayerCompleteStep({
  step: _step,
  onComplete,
  path: _path,
  onCreateCharacter,
  onBrowseSessions,
  onTakeSeerTutorial,
  onGoToDashboard,
}: TutorialCompleteStepProps) {
  const [showConfetti, setShowConfetti] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      {showConfetti && <Confetti />}

      {/* Celebration */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Tutorial Complete!
        </h1>
        <p className="text-lg text-muted-foreground">
          You&apos;ve learned the basics of playing SPARC!
        </p>
      </div>

      {/* Badge */}
      <div className="bg-gradient-to-br from-bronze/20 to-gold/20 rounded-2xl p-6 mb-8 text-center border-2 border-gold/30">
        <div className="text-4xl mb-2">🏆</div>
        <h2 className="text-xl font-bold text-gold">ADVENTURER</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Achievement Unlocked!
        </p>
      </div>

      {/* What you learned */}
      <div className="bg-surface-elevated rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-foreground mb-4">You now know:</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-muted-foreground">
            <span className="text-success">✓</span>
            How your character works
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <span className="text-success">✓</span>
            How to roll dice for actions
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <span className="text-success">✓</span>
            How combat flows
          </li>
        </ul>
      </div>

      {/* Next steps */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">What&apos;s next?</h3>
        
        <ActionButton
          icon="⚔️"
          title="Create Your Character"
          description="Build your own hero"
          onClick={onCreateCharacter}
          primary
        />
        
        <ActionButton
          icon="🎮"
          title="Browse Sessions"
          description="Join an existing game"
          onClick={onBrowseSessions}
        />
        
        <ActionButton
          icon="🎭"
          title="Take Seer Tutorial"
          description="Learn to run games"
          onClick={onTakeSeerTutorial}
        />
        
        <ActionButton
          icon="🏠"
          title="Go to Dashboard"
          description="Explore on your own"
          onClick={onGoToDashboard || onComplete}
        />
      </div>
    </div>
  );
}

// =============================================================================
// Seer Complete Step
// =============================================================================

export function SeerCompleteStep({
  step: _step,
  onComplete,
  path: _path,
  onCreateCharacter,
  onBrowseSessions,
  onGoToDashboard,
}: TutorialCompleteStepProps) {
  const [showConfetti, setShowConfetti] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      {showConfetti && <Confetti />}

      {/* Celebration */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4 animate-bounce">🎭</div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Ready to Lead!
        </h1>
        <p className="text-lg text-muted-foreground">
          You&apos;re now equipped to run SPARC adventures!
        </p>
      </div>

      {/* Badge */}
      <div className="bg-gradient-to-br from-bronze/20 to-gold/20 rounded-2xl p-6 mb-8 text-center border-2 border-gold/30">
        <div className="text-4xl mb-2">👑</div>
        <h2 className="text-xl font-bold text-gold">SEER INITIATE</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Achievement Unlocked!
        </p>
      </div>

      {/* What you learned */}
      <div className="bg-surface-elevated rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-foreground mb-4">You now know:</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-muted-foreground">
            <span className="text-success">✓</span>
            All player mechanics
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <span className="text-success">✓</span>
            How to use the Seer Dashboard
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <span className="text-success">✓</span>
            Tips for running sessions
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <span className="text-success">✓</span>
            How to use the AI Assistant
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <span className="text-success">✓</span>
            Adventure Forge basics
          </li>
        </ul>
      </div>

      {/* Next steps */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Ready to run?</h3>
        
        <ActionButton
          icon="🔨"
          title="Open Adventure Forge"
          description="Create your first adventure"
          onClick={() => {
            // Navigate to adventure forge
            onGoToDashboard?.();
          }}
          primary
        />
        
        <ActionButton
          icon="📚"
          title="Browse Adventures"
          description="Run a pre-made adventure"
          onClick={onBrowseSessions}
        />
        
        <ActionButton
          icon="⚔️"
          title="Create a Character"
          description="Play in someone else's game first"
          onClick={onCreateCharacter}
        />
        
        <ActionButton
          icon="🏠"
          title="Go to Dashboard"
          description="Explore on your own"
          onClick={onGoToDashboard || onComplete}
        />
      </div>
    </div>
  );
}

// =============================================================================
// Main Export (chooses based on path)
// =============================================================================

export function TutorialCompleteStep(props: TutorialCompleteStepProps) {
  if (props.path === "seer") {
    return <SeerCompleteStep {...props} />;
  }
  return <PlayerCompleteStep {...props} />;
}

// =============================================================================
// Exports
// =============================================================================

export type { TutorialCompleteStepProps } from "../types";
