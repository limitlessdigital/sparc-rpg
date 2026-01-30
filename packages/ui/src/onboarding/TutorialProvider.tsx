"use client";

/**
 * @sparc/ui TutorialProvider
 * 
 * Based on PRD 15: Onboarding Tutorial
 * Context provider for managing tutorial state across the application.
 */

import * as React from "react";
import type {
  TutorialContextValue,
  TutorialProviderProps,
  TutorialProgress,
  TutorialPath,
  TutorialStep,
  HighlightZone,
} from "./types";
import {
  getStepById,
  getNextStep,
  getPreviousStep,
  getStepsForPath,
} from "./tutorial-steps";

// =============================================================================
// Context
// =============================================================================

const TutorialContext = React.createContext<TutorialContextValue | null>(null);

// =============================================================================
// Hook
// =============================================================================

export function useTutorial(): TutorialContextValue {
  const context = React.useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
}

// =============================================================================
// Provider Component
// =============================================================================

const STORAGE_KEY = "sparc-tutorial-progress";

function loadProgressFromStorage(): TutorialProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

function saveProgressToStorage(progress: TutorialProgress | null): void {
  if (typeof window === "undefined") return;
  try {
    if (progress) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function TutorialProvider({
  children,
  initialProgress,
  showPromptForNewUsers = true,
  onComplete,
  onSkip,
}: TutorialProviderProps) {
  // State
  const [progress, setProgress] = React.useState<TutorialProgress | null>(
    initialProgress ?? null
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [activeHighlights, setActiveHighlights] = React.useState<HighlightZone[]>([]);

  // Load from storage on mount
  React.useEffect(() => {
    const stored = loadProgressFromStorage();
    if (stored) {
      setProgress(stored);
    } else if (showPromptForNewUsers) {
      // Show prompt for new users after a brief delay
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 500);
      return () => clearTimeout(timer);
    }
    setIsLoading(false);
  }, [showPromptForNewUsers]);

  // Persist progress changes
  React.useEffect(() => {
    if (!isLoading) {
      saveProgressToStorage(progress);
    }
  }, [progress, isLoading]);

  // Computed values
  const currentStep = React.useMemo<TutorialStep | null>(() => {
    if (!progress?.currentStep) return null;
    return getStepById(progress.currentStep) ?? null;
  }, [progress?.currentStep]);

  const isComplete = React.useMemo(() => {
    return progress?.completedAt !== null && progress?.completedAt !== undefined;
  }, [progress?.completedAt]);

  // Actions
  const startTutorial = React.useCallback(async (path: TutorialPath) => {
    const firstStep = getStepsForPath(path)[0];
    const newProgress: TutorialProgress = {
      userId: "local-user", // TODO: Get from auth
      path,
      currentStep: firstStep?.id ?? "welcome",
      completedSteps: [],
      startedAt: new Date().toISOString(),
      completedAt: null,
      skipped: false,
    };
    setProgress(newProgress);
    setShowPrompt(false);
  }, []);

  const skipTutorial = React.useCallback(async () => {
    const skippedProgress: TutorialProgress = {
      userId: "local-user",
      path: null,
      currentStep: "",
      completedSteps: [],
      startedAt: new Date().toISOString(),
      completedAt: null,
      skipped: true,
    };
    setProgress(skippedProgress);
    setShowPrompt(false);
    onSkip?.();
  }, [onSkip]);

  const completeStep = React.useCallback(async (stepId: string) => {
    setProgress(prev => {
      if (!prev) return prev;
      
      const completed = [...prev.completedSteps];
      if (!completed.includes(stepId)) {
        completed.push(stepId);
      }
      
      // Get next step
      const next = getNextStep(stepId, prev.path!);
      const isNowComplete = !next;
      
      const updated: TutorialProgress = {
        ...prev,
        completedSteps: completed,
        currentStep: next?.id ?? prev.currentStep,
        completedAt: isNowComplete ? new Date().toISOString() : null,
      };
      
      if (isNowComplete && prev.path) {
        onComplete?.(prev.path);
      }
      
      return updated;
    });
  }, [onComplete]);

  const goToStep = React.useCallback((stepId: string) => {
    const step = getStepById(stepId);
    if (step) {
      setProgress(prev => prev ? { ...prev, currentStep: stepId } : prev);
    }
  }, []);

  const nextStep = React.useCallback(() => {
    setProgress(prev => {
      if (!prev?.currentStep || !prev?.path) return prev;
      const next = getNextStep(prev.currentStep, prev.path);
      if (next) {
        return { ...prev, currentStep: next.id };
      }
      return prev;
    });
  }, []);

  const previousStep = React.useCallback(() => {
    setProgress(prev => {
      if (!prev?.currentStep || !prev?.path) return prev;
      const prevStep = getPreviousStep(prev.currentStep, prev.path);
      if (prevStep) {
        return { ...prev, currentStep: prevStep.id };
      }
      return prev;
    });
  }, []);

  const resetTutorial = React.useCallback(async () => {
    setProgress(null);
    setShowPrompt(true);
    setActiveHighlights([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const clearHighlights = React.useCallback(() => {
    setActiveHighlights([]);
  }, []);

  // Context value
  const value: TutorialContextValue = {
    progress,
    currentStep,
    isLoading,
    isComplete,
    startTutorial,
    skipTutorial,
    completeStep,
    goToStep,
    nextStep,
    previousStep,
    resetTutorial,
    showPrompt,
    setShowPrompt,
    activeHighlights,
    setActiveHighlights,
    clearHighlights,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}

// =============================================================================
// Utility Hook: Check if user has completed tutorial
// =============================================================================

export function useHasCompletedTutorial(): boolean {
  const context = React.useContext(TutorialContext);
  if (!context) {
    // If not in provider, check storage directly
    const stored = loadProgressFromStorage();
    return stored?.completedAt !== null || stored?.skipped === true;
  }
  return context.isComplete || (context.progress?.skipped ?? false);
}

// =============================================================================
// Utility Hook: Tutorial accessibility state
// =============================================================================

export function useTutorialAccessibility() {
  const [reducedMotion, setReducedMotion] = React.useState(false);
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);
  
  return { reducedMotion };
}
