/**
 * Seer Dashboard Types
 * Based on PRD 05: Seer Dashboard
 */

// Adventure node types
export type NodeType = "story" | "challenge" | "combat" | "decision" | "outcome";

export interface AdventureNode {
  id: string;
  type: NodeType;
  title: string;
  content: string;
  imageUrl?: string;
  imageVisibleToPlayers?: boolean;
  data: NodeData;
}

export type NodeData = 
  | StoryNodeData 
  | ChallengeNodeData 
  | CombatNodeData 
  | DecisionNodeData
  | OutcomeNodeData;

export interface StoryNodeData {
  type: "story";
  readAloudText?: string;
  seerNotes?: string;
}

export interface ChallengeNodeData {
  type: "challenge";
  attribute: Attribute;
  difficulty: number;
  readAloudText?: string;
  seerNotes?: string;
  successOutcome?: string;
  failureOutcome?: string;
}

export interface CombatNodeData {
  type: "combat";
  enemies: Enemy[];
  readAloudText?: string;
  seerNotes?: string;
  victoryOutcome?: string;
  defeatOutcome?: string;
}

export interface DecisionNodeData {
  type: "decision";
  readAloudText?: string;
  seerNotes?: string;
}

export interface OutcomeNodeData {
  type: "outcome";
  outcomeType: "victory" | "defeat" | "neutral";
  readAloudText?: string;
  seerNotes?: string;
}

// Attribute types for SPARC
export type Attribute = "might" | "grace" | "wit" | "heart";

// Enemy types
export interface Enemy {
  id: string;
  name: string;
  currentHp: number;
  maxHp: number;
  attack: number;
  defense: number;
  damage: string;
}

// Node connections
export interface NodeConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label: string;
  condition?: string;
}

// Session types
export interface Session {
  id: string;
  adventureId: string;
  adventureName: string;
  code: string;
  status: "waiting" | "active" | "paused" | "completed";
  seerId: string;
  currentNodeId: string;
  startedAt?: string;
  createdAt: string;
}

// Player types
export interface SessionPlayer {
  id: string;
  sessionId: string;
  userId: string;
  username: string;
  character: PlayerCharacter;
  isConnected: boolean;
  joinedAt: string;
}

export interface PlayerCharacter {
  id: string;
  name: string;
  characterClass: string;
  portraitUrl?: string;
  currentHitPoints: number;
  maxHitPoints: number;
  attributes: {
    might: number;
    grace: number;
    wit: number;
    heart: number;
  };
  conditions: Condition[];
  specialAbilities: SpecialAbility[];
}

export interface Condition {
  id: string;
  name: string;
  description: string;
  duration?: number; // rounds remaining
}

export interface SpecialAbility {
  id: string;
  name: string;
  description: string;
  usesRemaining?: number;
  maxUses?: number;
  cooldown?: number;
}

// Combat types
export interface CombatState {
  id: string;
  sessionId: string;
  nodeId: string;
  round: number;
  currentTurn: number;
  initiative: InitiativeEntry[];
  combatLog: CombatLogEntry[];
  status: "active" | "completed";
}

export interface InitiativeEntry {
  id: string;
  entityId: string;
  entityType: "player" | "enemy";
  name: string;
  initiative: number;
  isActive: boolean;
}

export interface CombatLogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: "attack" | "damage" | "heal" | "ability" | "system";
}

export type CombatOutcome = {
  type: "victory" | "defeat" | "retreat" | "truce";
};

// Dice roll types
export type RollType = "check" | "attack" | "damage" | "save";

export interface RollRequest {
  characterId: string;
  attribute: Attribute;
  difficulty: number;
  rollType: RollType;
  description?: string;
}

export interface RollResult {
  id: string;
  playerId: string;
  characterName: string;
  attribute: Attribute;
  roll: number;
  modifier: number;
  total: number;
  difficulty: number;
  success: boolean;
  timestamp: string;
}

// AI Seer types
export interface AISeerRequest {
  sessionId: string;
  sceneContext: string;
  playerAction: string;
  difficultyPreference: "easy" | "medium" | "hard";
  recentHistory?: string[];
  characterContext?: {
    name: string;
    class: string;
    relevantStats: Record<string, number>;
  };
}

export interface AISeerResponse {
  id?: string;
  requestId?: string;
  suggestion: string;
  suggestedRoll?: {
    attribute: Attribute;
    difficulty: number;
    reason: string;
  };
  narrativeHook?: string;
  ruleClarification?: string;
  confidence?: number;
  responseTimeMs: number;
  cached: boolean;
  modelVersion?: string;
}

// Announcement types
export interface Announcement {
  id: string;
  message: string;
  type: "info" | "warning" | "story";
  timestamp: string;
}

// Session history
export interface HistoryEntry {
  id: string;
  timestamp: string;
  type: "navigation" | "roll" | "combat" | "announcement";
  description: string;
  details?: Record<string, unknown>;
}

// Dashboard state
export interface DashboardState {
  session: Session | null;
  currentNode: AdventureNode | null;
  players: SessionPlayer[];
  combat: CombatState | null;
  history: HistoryEntry[];
  isLoading: boolean;
  error: Error | null;
}

// Player quick actions
export type PlayerAction = 
  | { type: "heal"; value: number }
  | { type: "damage"; value: number }
  | { type: "roll"; attribute?: Attribute; difficulty?: number }
  | { type: "kick" }
  | { type: "view" }
  | { type: "addCondition"; condition: Condition }
  | { type: "removeCondition"; conditionId: string };

// Quick action bar types
export type QuickAction = "roll" | "combat" | "items" | "announce" | "history";
