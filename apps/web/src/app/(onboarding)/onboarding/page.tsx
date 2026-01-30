"use client";

/**
 * Onboarding Start Page
 * 
 * Entry point for the onboarding tutorial.
 * Shows role selection (Player vs Seer) and starts the tutorial.
 */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useTutorial,
  TutorialModal,
  type TutorialPath,
} from "@sparc/ui";

export default function OnboardingPage(): JSX.Element | null {
  const router = useRouter();
  const { progress, startTutorial, skipTutorial, isLoading } = useTutorial();
  const [showModal, setShowModal] = useState(false);

  // Check if user already has progress
  useEffect(() => {
    if (!isLoading) {
      if (progress?.completedAt || progress?.skipped) {
        // Already completed or skipped, go to dashboard
        router.push("/");
      } else if (progress?.currentStep) {
        // Resume tutorial
        router.push(`/onboarding/tutorial/${progress.currentStep}`);
      } else {
        // Show role selection
        setShowModal(true);
      }
    }
  }, [isLoading, progress, router]);

  const handleStartTutorial = async (path: TutorialPath) => {
    await startTutorial(path);
    router.push("/onboarding/tutorial/welcome");
  };

  const handleSkip = async () => {
    await skipTutorial();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🎲</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <TutorialModal
        open={showModal}
        onClose={() => {}} // Can't close without action
        onStartTutorial={handleStartTutorial}
        onSkip={handleSkip}
      />
    </div>
  );
}
