/**
 * @sparc/ui Combat System Components
 * 
 * Based on PRD 03: Combat System
 * Provides all UI components needed for tactical combat encounters.
 */

// Types
export * from "./types";

// Components
export { InitiativeTracker } from "./InitiativeTracker";
export type { InitiativeTrackerProps } from "./InitiativeTracker";

export { CombatActionsPanel } from "./CombatActionsPanel";
export type { CombatActionsPanelProps } from "./CombatActionsPanel";

export { TargetSelector, InlineTargetSelector } from "./TargetSelector";
export type { TargetSelectorProps } from "./TargetSelector";

export { CombatLog, FloatingCombatLog } from "./CombatLog";
export type { CombatLogProps } from "./CombatLog";

export { 
  HPChangeDisplay, 
  InlineHPChange, 
  AnimatedHPBar 
} from "./HPChangeDisplay";
export type { HPChangeDisplayProps, HPChange } from "./HPChangeDisplay";

export { 
  ConditionManager, 
  ConditionBadges,
  CONDITIONS 
} from "./ConditionManager";
export type { ConditionManagerProps } from "./ConditionManager";

export { CombatView } from "./CombatView";
export type { CombatViewProps } from "./CombatView";
