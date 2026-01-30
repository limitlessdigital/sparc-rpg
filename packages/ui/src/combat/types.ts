/**
 * Combat System Types for SPARC RPG
 * Based on PRD 03: Combat System
 */

import type { SPARCCharacter, SPARCAttributes } from "../character-sheet";
import type { DicePoolRoll } from "../dice-roller";

// Combat actions
export type CombatAction = "attack" | "defend" | "ability" | "item" | "flee" | "skip";

// Combat outcomes
export type CombatOutcomeType = "victory" | "defeat" | "fled" | "negotiated";

// Condition types
export type ConditionType = 
  | "stunned" 
  | "poisoned" 
  | "blessed" 
  | "shielded" 
  | "burning" 
  | "frozen" 
  | "weakened" 
  | "strengthened";

export interface Condition {
  id: string;
  type: ConditionType;
  duration: number; // Rounds remaining
  source?: string;
}

// Creature (enemy) definition
export interface Creature {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  attributes: SPARCAttributes;
  hitPoints: number;
  maxHitPoints: number;
  attackDice: number;
  defenseDice: number;
  damage: number;
  abilities?: CreatureAbility[];
  challengeRating: number;
  tags: string[];
}

export interface CreatureAbility {
  id: string;
  name: string;
  description: string;
  damage?: number;
  effect?: string;
}

// Player in combat
export interface PlayerCombatant {
  id: string;
  characterId: string;
  character: SPARCCharacter;
  initiative: number;
  conditions: Condition[];
  hasActed: boolean;
  heroicSaveUsed: boolean;
}

// Enemy in combat
export interface EnemyCombatant {
  id: string;
  creature: Creature;
  instanceNumber: number;
  currentHitPoints: number;
  initiative: number;
  conditions: Condition[];
  hasActed: boolean;
}

// Initiative entry (combined for sorting)
export interface InitiativeEntry {
  id: string;
  type: "player" | "enemy";
  combatantId: string;
  initiative: number;
  name: string;
}

// Combat log entry
export interface CombatLogEntry {
  id: string;
  timestamp: string;
  round: number;
  actorName: string;
  action: CombatAction | "start" | "end" | "damage" | "heal" | "condition";
  targetName?: string;
  rolls?: DicePoolRoll[];
  damage?: number;
  healing?: number;
  narrative: string;
  isSuccess?: boolean;
  isCritical?: boolean;
}

// Combat outcome
export interface CombatOutcome {
  type: CombatOutcomeType;
  survivingPlayers: string[];
  defeatedEnemies: string[];
  experienceAwarded: number;
  lootDropped?: LootItem[];
}

export interface LootItem {
  id: string;
  name: string;
  type: string;
  value?: number;
}

// Full combat state
export interface CombatState {
  id: string;
  sessionId: string;
  nodeId: string;
  
  playerCombatants: PlayerCombatant[];
  enemyCombatants: EnemyCombatant[];
  
  initiativeOrder: InitiativeEntry[];
  currentTurnIndex: number;
  roundNumber: number;
  
  isActive: boolean;
  outcome?: CombatOutcome;
  log: CombatLogEntry[];
}

// UI state machine
export type CombatUIState = 
  | "waiting"           // Not your turn
  | "select_action"     // Your turn, choose action
  | "select_target"     // Chose attack/ability, pick target
  | "rolling"           // Dice rolling animation
  | "resolving"         // Processing result
  | "heroic_save"       // Failed, can use save
  | "turn_complete"     // Action resolved
  | "combat_end";       // Combat finished

// Attack result
export interface AttackResult {
  hit: boolean;
  damage: number;
  attackRoll: DicePoolRoll;
  defenseRoll: DicePoolRoll;
  critical: boolean;
  narrative: string;
}

// Combatant union type
export type Combatant = PlayerCombatant | EnemyCombatant;

// Type guards
export function isPlayerCombatant(c: Combatant): c is PlayerCombatant {
  return "character" in c;
}

export function isEnemyCombatant(c: Combatant): c is EnemyCombatant {
  return "creature" in c;
}

// Get combatant name helper
export function getCombatantName(c: Combatant): string {
  if (isPlayerCombatant(c)) {
    return c.character.name;
  }
  return `${c.creature.name}${c.instanceNumber > 1 ? ` ${c.instanceNumber}` : ""}`;
}

// Get current HP helper
export function getCombatantHP(c: Combatant): { current: number; max: number } {
  if (isPlayerCombatant(c)) {
    return c.character.hitPoints;
  }
  return { current: c.currentHitPoints, max: c.creature.maxHitPoints };
}

// Check if combatant is alive
export function isAlive(c: Combatant): boolean {
  const hp = getCombatantHP(c);
  return hp.current > 0;
}
