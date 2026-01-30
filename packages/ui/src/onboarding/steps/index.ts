/**
 * @sparc/ui Onboarding Tutorial Steps
 * 
 * Based on PRD 15: Onboarding Tutorial
 * Individual step components for the interactive tutorial.
 */

// Player path steps
export { WelcomeStep } from "./WelcomeStep";
export type { WelcomeStepProps } from "./WelcomeStep";

export { CharacterBasicsStep } from "./CharacterBasicsStep";
export type { CharacterBasicsStepProps } from "./CharacterBasicsStep";

export { DiceRollingStep } from "./DiceRollingStep";
export type { DiceRollingStepProps } from "./DiceRollingStep";

export { CombatPracticeStep } from "./CombatPracticeStep";
export type { CombatPracticeStepProps } from "./CombatPracticeStep";

// Seer path steps
export {
  SeerDashboardStep,
  RunningSessionsStep,
  AIAssistantStep,
  AdventureForgePeekStep,
} from "./SeerSteps";
export type { SeerDashboardStepProps } from "./SeerSteps";

// Completion
export { TutorialCompleteStep, PlayerCompleteStep, SeerCompleteStep } from "./TutorialCompleteStep";
export type { TutorialCompleteStepProps } from "./TutorialCompleteStep";
