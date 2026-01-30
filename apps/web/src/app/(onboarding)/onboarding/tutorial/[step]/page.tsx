"use client";

/**
 * Tutorial Step Page
 * 
 * Dynamic page that renders the appropriate tutorial step component
 * based on the URL parameter.
 */

import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import {
  useTutorial,
  getStepById,
  getStepIndex,
  getTotalSteps,
  CompactProgress,
  // Step components
  WelcomeStep,
  CharacterBasicsStep,
  DiceRollingStep,
  CombatPracticeStep,
  SeerDashboardStep,
  RunningSessionsStep,
  AIAssistantStep,
  AdventureForgePeekStep,
  TutorialCompleteStep,
  TUTORIAL_CHARACTER,
  TUTORIAL_ENEMY,
} from "@sparc/ui";

// Map step IDs to components
const STEP_COMPONENTS: Record<string, React.ComponentType<any>> = {
  "welcome": WelcomeStep,
  "character-basics": CharacterBasicsStep,
  "dice-rolling": DiceRollingStep,
  "combat-practice": CombatPracticeStep,
  "player-complete": TutorialCompleteStep,
  "seer-dashboard": SeerDashboardStep,
  "running-sessions": RunningSessionsStep,
  "ai-assistant": AIAssistantStep,
  "adventure-forge-peek": AdventureForgePeekStep,
  "seer-complete": TutorialCompleteStep,
};

export default function TutorialStepPage(): JSX.Element | null {
  const router = useRouter();
  const params = useParams();
  const stepId = params.step as string;
  
  const {
    progress,
    completeStep,
    goToStep,
    isLoading,
  } = useTutorial();

  // Get step info
  const step = useMemo(() => getStepById(stepId), [stepId]);
  const StepComponent = step ? STEP_COMPONENTS[step.id] : null;

  // Navigation info
  const stepIndex = progress?.path ? getStepIndex(stepId, progress.path) : 0;
  const totalSteps = progress?.path ? getTotalSteps(progress.path) : 5;

  // Redirect if no progress or invalid step
  useEffect(() => {
    if (!isLoading) {
      if (!progress?.path) {
        // No tutorial started, go to onboarding start
        router.push("/onboarding");
      } else if (progress.completedAt || progress.skipped) {
        // Already done
        router.push("/");
      } else if (!step) {
        // Invalid step, go to current step
        router.push(`/onboarding/tutorial/${progress.currentStep}`);
      }
    }
  }, [isLoading, progress, step, router]);

  // Update current step if URL doesn't match
  useEffect(() => {
    if (!isLoading && progress?.currentStep && progress.currentStep !== stepId && step) {
      goToStep(stepId);
    }
  }, [isLoading, progress?.currentStep, stepId, step, goToStep]);

  const handleComplete = async () => {
    if (!step || !progress?.path) return;
    
    await completeStep(step.id);
    
    // Navigate to next step or completion
    if (step.id === "player-complete" || step.id === "seer-complete") {
      router.push("/");
    } else if (step.nextStep) {
      // Handle fork for seer path
      let nextStepId = step.nextStep;
      if (step.id === "combat-practice" && progress.path === "seer") {
        nextStepId = "seer-dashboard";
      }
      router.push(`/onboarding/tutorial/${nextStepId}`);
    }
  };

  const handleBack = () => {
    if (step?.previousStep) {
      router.push(`/onboarding/tutorial/${step.previousStep}`);
    }
  };

  // Action handlers for completion step
  const handleCreateCharacter = () => router.push("/characters/new");
  const handleBrowseSessions = () => router.push("/sessions");
  const handleTakeSeerTutorial = async () => {
    // Reset and start seer path
    // For now, just redirect to seer dashboard step
    router.push("/onboarding/tutorial/seer-dashboard");
  };
  const handleGoToDashboard = () => router.push("/");

  if (isLoading || !step || !StepComponent || !progress?.path) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">🎲</div>
          <p className="text-muted-foreground">Loading step...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header with progress */}
      <header className="sticky top-0 z-20 bg-surface-base/80 backdrop-blur-sm border-b border-border-default">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎲</span>
            <span className="font-bold text-foreground">SPARC Tutorial</span>
          </div>
          
          {/* Progress */}
          <div className="flex-1 max-w-xs mx-4">
            <CompactProgress
              current={stepIndex}
              total={totalSteps}
              label={`Step ${stepIndex} of ${totalSteps}`}
            />
          </div>
          
          {/* Skip */}
          <button
            onClick={() => router.push("/")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Skip Tutorial
          </button>
        </div>
      </header>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center py-8">
        <StepComponent
          step={step}
          onComplete={handleComplete}
          onBack={step.previousStep ? handleBack : undefined}
          character={TUTORIAL_CHARACTER}
          enemy={TUTORIAL_ENEMY}
          path={progress.path}
          // Completion step handlers
          onCreateCharacter={handleCreateCharacter}
          onBrowseSessions={handleBrowseSessions}
          onTakeSeerTutorial={handleTakeSeerTutorial}
          onGoToDashboard={handleGoToDashboard}
        />
      </div>
    </div>
  );
}
