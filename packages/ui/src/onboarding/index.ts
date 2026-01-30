/**
 * @sparc/ui Onboarding System
 * 
 * Based on PRD 15: Onboarding Tutorial
 * Complete onboarding tutorial system for teaching new users SPARC RPG.
 * 
 * @example
 * ```tsx
 * // Wrap your app with the provider
 * <TutorialProvider showPromptForNewUsers>
 *   <App />
 * </TutorialProvider>
 * 
 * // Show the modal on first visit
 * const { showPrompt, setShowPrompt, startTutorial, skipTutorial } = useTutorial();
 * <TutorialModal
 *   open={showPrompt}
 *   onClose={() => setShowPrompt(false)}
 *   onStartTutorial={startTutorial}
 *   onSkip={skipTutorial}
 * />
 * ```
 */

// Types
export * from "./types";

// Tutorial step registry and utilities
export {
  TUTORIAL_STEPS,
  getStepsForPath,
  getStepById,
  getNextStep,
  getPreviousStep,
  getPathDuration,
  getStepIndex,
  getTotalSteps,
  isFinalStep,
  formatDuration,
  TUTORIAL_CHARACTER,
  TUTORIAL_ENEMY,
  DICE_SCENARIO,
} from "./tutorial-steps";

// Provider and hooks
export { TutorialProvider, useTutorial, useHasCompletedTutorial, useTutorialAccessibility } from "./TutorialProvider";

// UI Components
export { TutorialModal } from "./TutorialModal";
export type { TutorialModalProps } from "./TutorialModal";

export { TutorialOverlay } from "./TutorialOverlay";
export type { TutorialOverlayProps } from "./TutorialOverlay";

export { ProgressIndicator, CompactProgress } from "./ProgressIndicator";
export type { ProgressIndicatorProps, CompactProgressProps } from "./ProgressIndicator";

export { 
  Tooltip, 
  TutorialTooltip, 
  ContextualHelp, 
  HelpIcon 
} from "./Tooltip";
export type { 
  TooltipProps, 
  TutorialTooltipProps, 
  ContextualHelpProps, 
  HelpIconProps 
} from "./Tooltip";

// Tutorial Step Components
export {
  WelcomeStep,
  CharacterBasicsStep,
  DiceRollingStep,
  CombatPracticeStep,
  SeerDashboardStep,
  RunningSessionsStep,
  AIAssistantStep,
  AdventureForgePeekStep,
  TutorialCompleteStep,
  PlayerCompleteStep,
  SeerCompleteStep,
} from "./steps";
export type {
  WelcomeStepProps,
  CharacterBasicsStepProps,
  DiceRollingStepProps,
  CombatPracticeStepProps,
  SeerDashboardStepProps,
  TutorialCompleteStepProps,
} from "./steps";
