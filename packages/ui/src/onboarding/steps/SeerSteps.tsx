"use client";

/**
 * @sparc/ui Seer Tutorial Steps
 * 
 * Based on PRD 15: Onboarding Tutorial
 * Seer-specific tutorial steps for learning to run games.
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import type { SeerDashboardStepProps, TutorialStepProps } from "../types";

// =============================================================================
// Feature Card Component
// =============================================================================

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  active?: boolean;
  onClick?: () => void;
}

function FeatureCard({ icon, title, description, active, onClick }: FeatureCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze",
        active
          ? "bg-bronze/20 ring-2 ring-bronze"
          : "bg-surface-elevated hover:bg-surface-elevated/80"
      )}
    >
      <span className="text-2xl mb-2 block">{icon}</span>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  );
}

// =============================================================================
// Seer Dashboard Step
// =============================================================================

const DASHBOARD_FEATURES = [
  {
    id: "session",
    icon: "🎮",
    title: "Session Control",
    description: "Start, pause, and manage your game sessions",
    detail: "From here you can see all connected players, their characters, and control the flow of your adventure. Start sessions with a single click!",
  },
  {
    id: "players",
    icon: "👥",
    title: "Player Management",
    description: "Track HP, conditions, and player actions",
    detail: "See all your players at a glance. Track their HP, apply conditions like 'Stunned' or 'Poisoned', and quickly reference their stats during play.",
  },
  {
    id: "dice",
    icon: "🎲",
    title: "Dice Controls",
    description: "Request rolls and see results in real-time",
    detail: "Ask specific players to roll, set the difficulty, and see their results instantly. You can also make secret Seer rolls that players don't see!",
  },
  {
    id: "story",
    icon: "📖",
    title: "Story Navigator",
    description: "Move through your adventure nodes",
    detail: "If you're running a pre-made or custom adventure, navigate between story nodes easily. See what's coming next and choose where to take the story.",
  },
];

export function SeerDashboardStep({ step: _step, onComplete, onBack }: SeerDashboardStepProps) {
  const [activeFeature, setActiveFeature] = React.useState<string | null>(null);
  const [explored, setExplored] = React.useState<Set<string>>(new Set());

  const handleFeatureClick = (id: string) => {
    setActiveFeature(id);
    setExplored((prev) => new Set(prev).add(id));
  };

  const activeDetail = DASHBOARD_FEATURES.find((f) => f.id === activeFeature);
  const canContinue = explored.size >= 2;

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          🎭 Your Seer Dashboard
        </h1>
        <p className="text-muted-foreground">
          This is your command center for running games. Explore the features below.
        </p>
      </div>

      {/* Mock Dashboard Preview */}
      <div className="bg-surface-base rounded-2xl border-2 border-bronze/30 p-6 mb-6">
        <div className="text-xs text-muted-foreground mb-4 text-center">
          Dashboard Preview (tap features to learn more)
        </div>
        <div className="grid grid-cols-2 gap-4">
          {DASHBOARD_FEATURES.map((feature) => (
            <FeatureCard
              key={feature.id}
              {...feature}
              active={activeFeature === feature.id}
              onClick={() => handleFeatureClick(feature.id)}
            />
          ))}
        </div>
      </div>

      {/* Feature Detail */}
      {activeDetail ? (
        <div className="bg-surface-elevated rounded-xl p-6 mb-6 animate-in fade-in-0 slide-in-from-bottom-2">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{activeDetail.icon}</span>
            <h3 className="text-lg font-bold text-foreground">{activeDetail.title}</h3>
          </div>
          <p className="text-muted-foreground">{activeDetail.detail}</p>
        </div>
      ) : (
        <div className="bg-surface-elevated/50 rounded-xl p-6 mb-6 border-2 border-dashed border-border-default">
          <p className="text-muted-foreground text-center">
            👆 Tap a feature to learn more about it
          </p>
        </div>
      )}

      {/* Progress */}
      {!canContinue && (
        <p className="text-center text-sm text-muted-foreground mb-6">
          Explore {2 - explored.size} more feature{2 - explored.size !== 1 ? "s" : ""} to continue
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
        )}
        <button
          onClick={onComplete}
          disabled={!canContinue}
          className={cn(
            "ml-auto px-6 py-3 rounded-lg font-semibold transition-all",
            canContinue
              ? "bg-bronze text-white hover:brightness-110"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Running Sessions Step
// =============================================================================

export function RunningSessionsStep({ step: _step, onComplete, onBack }: TutorialStepProps) {
  const [currentTip, setCurrentTip] = React.useState(0);

  const tips = [
    {
      icon: "🎬",
      title: "Starting a Session",
      content: "Share your session code with players. When everyone joins and marks themselves ready, hit Start!",
    },
    {
      icon: "📖",
      title: "Reading Aloud",
      content: "Story text marked 'Read Aloud' is meant to be shared with players. Click it to highlight and read dramatically!",
    },
    {
      icon: "🎭",
      title: "Seer Notes",
      content: "Some text is for your eyes only. Use these hidden notes to remember plot twists and secrets.",
    },
    {
      icon: "⏸️",
      title: "Taking Breaks",
      content: "Hit Pause anytime to freeze the session. Players will see a break screen. Perfect for bathroom breaks!",
    },
  ];

  const handleNext = () => {
    if (currentTip < tips.length - 1) {
      setCurrentTip((c) => c + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          🎮 Running Sessions
        </h1>
        <p className="text-muted-foreground">
          Key tips for managing your game sessions
        </p>
      </div>

      {/* Tip Card */}
      <div className="bg-surface-elevated rounded-2xl p-8 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl">{tips[currentTip].icon}</span>
          <h2 className="text-xl font-bold text-foreground">{tips[currentTip].title}</h2>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {tips[currentTip].content}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {tips.map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              i === currentTip ? "bg-bronze" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {onBack && currentTip === 0 && (
          <button
            onClick={onBack}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
        )}
        {currentTip > 0 && (
          <button
            onClick={() => setCurrentTip((c) => c - 1)}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Previous
          </button>
        )}
        <button
          onClick={handleNext}
          className="ml-auto px-6 py-3 rounded-lg font-semibold bg-bronze text-white hover:brightness-110 transition-all"
        >
          {currentTip < tips.length - 1 ? "Next Tip →" : "Continue →"}
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// AI Assistant Step
// =============================================================================

export function AIAssistantStep({ step: _step, onComplete, onBack }: TutorialStepProps) {
  const [showExample, setShowExample] = React.useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          🤖 AI Seer Assistant
        </h1>
        <p className="text-muted-foreground">
          Your co-pilot for running smoother games
        </p>
      </div>

      {/* Main content */}
      <div className="bg-surface-elevated rounded-2xl p-6 mb-6">
        <p className="text-muted-foreground mb-6">
          The AI Seer Assistant helps you with rules questions, generates NPCs on the fly,
          suggests dramatic moments, and keeps the story flowing.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-xl">📚</span>
            <div>
              <h3 className="font-semibold text-foreground">Rules Help</h3>
              <p className="text-sm text-muted-foreground">Quick answers to game rules</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">🎭</span>
            <div>
              <h3 className="font-semibold text-foreground">NPC Generator</h3>
              <p className="text-sm text-muted-foreground">Instant character names & traits</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <h3 className="font-semibold text-foreground">Story Suggestions</h3>
              <p className="text-sm text-muted-foreground">Ideas when you're stuck</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">🎯</span>
            <div>
              <h3 className="font-semibold text-foreground">Roll Suggestions</h3>
              <p className="text-sm text-muted-foreground">What dice to ask for</p>
            </div>
          </div>
        </div>

        {/* Example toggle */}
        <button
          onClick={() => setShowExample(!showExample)}
          className="w-full px-4 py-2 bg-surface-base rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {showExample ? "Hide Example ▲" : "See Example ▼"}
        </button>

        {/* Example */}
        {showExample && (
          <div className="mt-4 p-4 bg-surface-base rounded-lg animate-in fade-in-0 slide-in-from-top-2">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-lg">🎭</span>
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">You ask:</p>
                <p className="text-muted-foreground italic">&ldquo;I need a quick tavern keeper NPC&rdquo;</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">🤖</span>
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">AI suggests:</p>
                <p className="text-muted-foreground">
                  <strong>Marta Ironbrew</strong> - A retired adventurer with a prosthetic arm 
                  made of polished bronze. She speaks in riddles and charges double for 
                  anyone who orders &ldquo;just water.&rdquo;
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
        )}
        <button
          onClick={onComplete}
          className="ml-auto px-6 py-3 rounded-lg font-semibold bg-bronze text-white hover:brightness-110 transition-all"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Adventure Forge Preview Step
// =============================================================================

export function AdventureForgePeekStep({ step: _step, onComplete, onBack }: TutorialStepProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          🔨 Adventure Forge Preview
        </h1>
        <p className="text-muted-foreground">
          Create your own adventures with our visual editor
        </p>
      </div>

      {/* Mock node editor preview */}
      <div className="bg-surface-base rounded-2xl border-2 border-bronze/30 p-6 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-bronze/5 to-transparent" />
        
        {/* Mock nodes */}
        <div className="relative space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-32 h-20 rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-sm">
              📖 Story Node
            </div>
            <div className="flex-1 h-0.5 bg-border-default" />
            <div className="w-32 h-20 rounded-lg bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-sm">
              🔀 Decision
            </div>
          </div>
          <div className="flex items-center gap-4 pl-36">
            <div className="w-0.5 h-8 bg-border-default" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 h-20 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center justify-center text-sm">
              ⚔️ Combat
            </div>
            <div className="flex-1 h-0.5 bg-border-default" />
            <div className="w-32 h-20 rounded-lg bg-green-500/20 border border-green-500/50 flex items-center justify-center text-sm">
              🎲 Challenge
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Drag and drop nodes to build branching stories
        </p>
      </div>

      {/* Features list */}
      <div className="bg-surface-elevated rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-foreground mb-4">Adventure Forge lets you:</h3>
        <ul className="space-y-3">
          <li className="flex items-center gap-3">
            <span className="text-success">✓</span>
            <span className="text-muted-foreground">Create branching storylines visually</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-success">✓</span>
            <span className="text-muted-foreground">Add combat encounters and challenges</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-success">✓</span>
            <span className="text-muted-foreground">Set up NPCs and dialogue trees</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-success">✓</span>
            <span className="text-muted-foreground">Publish and share with the community</span>
          </li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
        )}
        <button
          onClick={onComplete}
          className="ml-auto px-6 py-3 rounded-lg font-semibold bg-bronze text-white hover:brightness-110 transition-all"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Exports
// =============================================================================

export type { SeerDashboardStepProps } from "../types";
