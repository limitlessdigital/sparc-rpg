/**
 * @sparc/ui Onboarding System Types
 * 
 * Based on PRD 15: Onboarding Tutorial
 * Types for the interactive tutorial system that teaches new users SPARC RPG.
 */

// =============================================================================
// Tutorial Progress
// =============================================================================

/** User's role path choice */
export type TutorialPath = 'player' | 'seer';

/** Tutorial progress tracking */
export interface TutorialProgress {
  userId: string;
  path: TutorialPath | null;
  currentStep: string;
  completedSteps: string[];
  startedAt: string;
  completedAt: string | null;
  skipped: boolean;
}

/** Tutorial step type */
export type TutorialStepType = 'info' | 'interactive' | 'practice';

/** Tutorial step definition */
export interface TutorialStep {
  id: string;
  path: TutorialPath | 'both';
  order: number;
  title: string;
  type: TutorialStepType;
  duration: number; // estimated seconds
  nextStep: string | null;
  previousStep: string | null;
}

// =============================================================================
// Highlight & Tooltip System
// =============================================================================

/** Position for highlight tooltips */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/** Highlight zone configuration */
export interface HighlightZone {
  id: string;
  selector: string;
  message: string;
  position: TooltipPosition;
  ariaLabel?: string;
}

/** Tooltip configuration */
export interface TooltipConfig {
  id: string;
  content: string;
  position: TooltipPosition;
  triggerSelector?: string;
  showArrow?: boolean;
  dismissible?: boolean;
}

// =============================================================================
// Interactive Elements
// =============================================================================

/** Tutorial content configuration */
export interface TutorialContent {
  component: string;
  props: Record<string, unknown>;
  highlights?: HighlightZone[];
  tooltips?: TooltipConfig[];
}

/** Dice roll result for tutorial */
export interface TutorialDiceRoll {
  dice: number[];
  total: number;
  difficulty: number;
  success: boolean;
  criticalSuccess: boolean;
  criticalFailure: boolean;
}

/** Tutorial character for practice */
export interface TutorialCharacter {
  name: string;
  class: string;
  hp: number;
  maxHp: number;
  might: number;
  grace: number;
  wit: number;
  heart: number;
}

/** Tutorial enemy for combat practice */
export interface TutorialEnemy {
  name: string;
  hp: number;
  maxHp: number;
  defense: number;
  damage: number;
  icon: string;
}

/** Combat state for tutorial */
export interface TutorialCombatState {
  phase: 'initiative' | 'player-turn' | 'enemy-turn' | 'victory' | 'defeat';
  playerInitiative: number;
  enemyInitiative: number;
  playerHP: number;
  enemyHP: number;
  round: number;
  log: string[];
}

// =============================================================================
// Context Types
// =============================================================================

/** Tutorial context value */
export interface TutorialContextValue {
  // Progress state
  progress: TutorialProgress | null;
  currentStep: TutorialStep | null;
  isLoading: boolean;
  isComplete: boolean;
  
  // Navigation
  startTutorial: (path: TutorialPath) => Promise<void>;
  skipTutorial: () => Promise<void>;
  completeStep: (stepId: string) => Promise<void>;
  goToStep: (stepId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetTutorial: () => Promise<void>;
  
  // UI state
  showPrompt: boolean;
  setShowPrompt: (show: boolean) => void;
  
  // Highlight system
  activeHighlights: HighlightZone[];
  setActiveHighlights: (highlights: HighlightZone[]) => void;
  clearHighlights: () => void;
}

/** Tutorial provider props */
export interface TutorialProviderProps {
  children: React.ReactNode;
  /** Initial progress (from API) */
  initialProgress?: TutorialProgress | null;
  /** Whether to show prompt for new users */
  showPromptForNewUsers?: boolean;
  /** Callback when tutorial completes */
  onComplete?: (path: TutorialPath) => void;
  /** Callback when tutorial is skipped */
  onSkip?: () => void;
}

// =============================================================================
// Component Props
// =============================================================================

/** Tutorial modal props */
export interface TutorialModalProps {
  open: boolean;
  onClose: () => void;
  onStartTutorial: (path: TutorialPath) => void;
  onSkip: () => void;
}

/** Tutorial overlay props */
export interface TutorialOverlayProps {
  highlights: HighlightZone[];
  onHighlightClick?: (id: string) => void;
  showBackdrop?: boolean;
}

/** Progress indicator props */
export interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  stepLabels?: string[];
  variant?: 'bar' | 'dots' | 'steps';
  showStepNumber?: boolean;
}

/** Tutorial step component props */
export interface TutorialStepProps {
  step: TutorialStep;
  onComplete: () => void;
  onBack?: () => void;
  character?: TutorialCharacter;
}

/** Tooltip component props */
export interface TooltipProps {
  content: React.ReactNode;
  position?: TooltipPosition;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
  showArrow?: boolean;
  dismissible?: boolean;
  className?: string;
}

/** Contextual help tooltip props */
export interface ContextualHelpProps {
  id: string;
  content: string;
  position?: TooltipPosition;
  children: React.ReactNode;
  /** Whether this is a first-time hint that auto-shows */
  autoShow?: boolean;
  /** Dismissal storage key */
  dismissKey?: string;
}

// =============================================================================
// Step-specific Props
// =============================================================================

/** Welcome step props */
export interface WelcomeStepProps extends TutorialStepProps {
  userName?: string;
}

/** Character basics step props */
export interface CharacterBasicsStepProps extends TutorialStepProps {
  character: TutorialCharacter;
  onAttributeHover?: (attribute: string) => void;
}

/** Dice rolling step props */
export interface DiceRollingStepProps extends TutorialStepProps {
  character: TutorialCharacter;
  scenario?: {
    description: string;
    attribute: 'might' | 'grace' | 'wit' | 'heart';
    difficulty: number;
  };
}

/** Combat practice step props */
export interface CombatPracticeStepProps extends TutorialStepProps {
  character: TutorialCharacter;
  enemy: TutorialEnemy;
}

/** Seer dashboard step props */
export interface SeerDashboardStepProps extends TutorialStepProps {
  features?: string[];
}

/** Tutorial complete step props */
export interface TutorialCompleteStepProps extends TutorialStepProps {
  path: TutorialPath;
  onCreateCharacter?: () => void;
  onBrowseSessions?: () => void;
  onTakeSeerTutorial?: () => void;
  onGoToDashboard?: () => void;
}
