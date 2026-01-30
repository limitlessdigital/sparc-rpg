/**
 * @sparc/ui Tutorial Step Registry
 * 
 * Based on PRD 15: Onboarding Tutorial
 * Defines all tutorial steps with metadata and navigation.
 */

import type { TutorialStep, TutorialPath } from "./types";

// =============================================================================
// Step Definitions
// =============================================================================

export const TUTORIAL_STEPS: TutorialStep[] = [
  // -------------------------------------------------------------------------
  // Shared Steps (Both Player and Seer)
  // -------------------------------------------------------------------------
  {
    id: 'welcome',
    path: 'both',
    order: 1,
    title: 'Welcome to SPARC',
    type: 'info',
    duration: 30,
    nextStep: 'character-basics',
    previousStep: null,
  },
  {
    id: 'character-basics',
    path: 'both',
    order: 2,
    title: 'Meet Your Character',
    type: 'interactive',
    duration: 60,
    nextStep: 'dice-rolling',
    previousStep: 'welcome',
  },
  {
    id: 'dice-rolling',
    path: 'both',
    order: 3,
    title: 'Rolling Dice',
    type: 'practice',
    duration: 120,
    nextStep: 'combat-practice',
    previousStep: 'character-basics',
  },
  {
    id: 'combat-practice',
    path: 'both',
    order: 4,
    title: 'Combat Tutorial',
    type: 'practice',
    duration: 180,
    nextStep: 'player-complete',
    previousStep: 'dice-rolling',
  },
  
  // -------------------------------------------------------------------------
  // Player Path Completion
  // -------------------------------------------------------------------------
  {
    id: 'player-complete',
    path: 'player',
    order: 5,
    title: 'Ready to Play!',
    type: 'info',
    duration: 30,
    nextStep: null,
    previousStep: 'combat-practice',
  },
  
  // -------------------------------------------------------------------------
  // Seer Path (continues after combat-practice)
  // -------------------------------------------------------------------------
  {
    id: 'seer-dashboard',
    path: 'seer',
    order: 6,
    title: 'Your Seer Dashboard',
    type: 'interactive',
    duration: 90,
    nextStep: 'running-sessions',
    previousStep: 'combat-practice',
  },
  {
    id: 'running-sessions',
    path: 'seer',
    order: 7,
    title: 'Running Sessions',
    type: 'interactive',
    duration: 90,
    nextStep: 'ai-assistant',
    previousStep: 'seer-dashboard',
  },
  {
    id: 'ai-assistant',
    path: 'seer',
    order: 8,
    title: 'AI Seer Assistant',
    type: 'interactive',
    duration: 60,
    nextStep: 'adventure-forge-peek',
    previousStep: 'running-sessions',
  },
  {
    id: 'adventure-forge-peek',
    path: 'seer',
    order: 9,
    title: 'Adventure Forge Preview',
    type: 'info',
    duration: 60,
    nextStep: 'seer-complete',
    previousStep: 'ai-assistant',
  },
  {
    id: 'seer-complete',
    path: 'seer',
    order: 10,
    title: 'Ready to Lead!',
    type: 'info',
    duration: 30,
    nextStep: null,
    previousStep: 'adventure-forge-peek',
  },
];

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get steps for a specific path
 */
export function getStepsForPath(path: TutorialPath): TutorialStep[] {
  return TUTORIAL_STEPS.filter(step => 
    step.path === 'both' || step.path === path
  ).sort((a, b) => a.order - b.order);
}

/**
 * Get a step by ID
 */
export function getStepById(stepId: string): TutorialStep | undefined {
  return TUTORIAL_STEPS.find(step => step.id === stepId);
}

/**
 * Get the next step for a given path and current step
 */
export function getNextStep(currentStepId: string, path: TutorialPath): TutorialStep | null {
  const currentStep = getStepById(currentStepId);
  if (!currentStep) return null;
  
  // Get path-specific next step override
  if (currentStep.id === 'combat-practice') {
    // Fork point: Player goes to completion, Seer continues
    return path === 'player' 
      ? getStepById('player-complete') ?? null
      : getStepById('seer-dashboard') ?? null;
  }
  
  if (currentStep.nextStep) {
    const nextStep = getStepById(currentStep.nextStep);
    if (nextStep && (nextStep.path === 'both' || nextStep.path === path)) {
      return nextStep;
    }
  }
  
  return null;
}

/**
 * Get the previous step for a given path and current step
 */
export function getPreviousStep(currentStepId: string, path: TutorialPath): TutorialStep | null {
  const currentStep = getStepById(currentStepId);
  if (!currentStep || !currentStep.previousStep) return null;
  
  const prevStep = getStepById(currentStep.previousStep);
  if (prevStep && (prevStep.path === 'both' || prevStep.path === path)) {
    return prevStep;
  }
  
  return null;
}

/**
 * Calculate total estimated duration for a path
 */
export function getPathDuration(path: TutorialPath): number {
  return getStepsForPath(path).reduce((total, step) => total + step.duration, 0);
}

/**
 * Get step index within a path (1-indexed for UI)
 */
export function getStepIndex(stepId: string, path: TutorialPath): number {
  const steps = getStepsForPath(path);
  const index = steps.findIndex(s => s.id === stepId);
  return index + 1;
}

/**
 * Get total steps count for a path
 */
export function getTotalSteps(path: TutorialPath): number {
  return getStepsForPath(path).length;
}

/**
 * Check if a step is the final step for a path
 */
export function isFinalStep(stepId: string, _path: TutorialPath): boolean {
  const step = getStepById(stepId);
  if (!step) return false;
  return step.id === 'player-complete' || step.id === 'seer-complete';
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} sec`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return remaining > 0 ? `${minutes}m ${remaining}s` : `${minutes} min`;
}

// =============================================================================
// Tutorial Character & Enemy Defaults
// =============================================================================

export const TUTORIAL_CHARACTER = {
  name: 'Thorn',
  class: 'Champion',
  hp: 6,
  maxHp: 6,
  might: 6,
  grace: 3,
  wit: 2,
  heart: 3,
};

export const TUTORIAL_ENEMY = {
  name: 'Goblin',
  hp: 3,
  maxHp: 3,
  defense: 6,
  damage: 1,
  icon: '👹',
};

export const DICE_SCENARIO = {
  description: 'A locked door blocks your path. You try to BASH it down using your strength.',
  attribute: 'might' as const,
  difficulty: 10,
};
