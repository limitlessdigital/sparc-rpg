/**
 * Adventure Forge - Type Definitions
 * Based on PRDs 08-11
 */

// === Canvas Types (PRD 08) ===

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Viewport {
  pan: Point;
  zoom: number;
  visibleBounds: Rect;
}

export type CanvasMode = 
  | 'select'        // Default selection mode
  | 'pan'           // Pan-only mode (space held)
  | 'connect'       // Drawing connection
  | 'multiselect'   // Rectangle selection
  | 'drag';         // Dragging nodes

export interface DragState {
  type: 'node' | 'selection' | 'pan' | 'connection';
  startPoint: Point;
  currentPoint: Point;
  nodeOffsets?: Map<string, Point>;
}

export interface CanvasState {
  pan: Point;
  zoom: number;
  selectedNodeIds: string[];
  selectedConnectionIds: string[];
  mode: CanvasMode;
  dragState: DragState | null;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

// === Node Types (PRD 09) ===

export type NodeType = 'story' | 'decision' | 'challenge' | 'combat' | 'check';

export type Attribute = 'might' | 'grace' | 'wit' | 'heart';

export interface ItemReward {
  itemId: string;
  name: string;
  quantity: number;
}

export interface BaseNode {
  id: string;
  adventureId: string;
  type: NodeType;
  position: Point;
  title: string;
  content: string;
  imageUrl?: string;
  imageVisibleToPlayers: boolean;
  isVictoryNode: boolean;
  isFailureNode: boolean;
  experienceReward: number;
  itemRewards: ItemReward[];
  requiredFlags?: string[];
  requiredItems?: string[];
  setFlags?: string[];
  removeFlags?: string[];
  setVariables?: Record<string, unknown>;
}

// Story Node
export interface StoryNodeData {
  objectives?: string[];
  readAloudText?: string;
  seerNotes?: string;
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
}

export interface StoryNode extends BaseNode {
  type: 'story';
  data: StoryNodeData;
}

// Decision Node
export interface DecisionChoice {
  id: string;
  text: string;
  tooltip?: string;
  requiredFlags?: string[];
  forbiddenFlags?: string[];
}

export interface DecisionNodeData {
  choices: DecisionChoice[];
  timeLimit?: number;
  defaultChoiceId?: string;
}

export interface DecisionNode extends BaseNode {
  type: 'decision';
  data: DecisionNodeData;
}

// Challenge Node
export interface ChallengeNodeData {
  attribute: Attribute;
  difficulty: number;
  description: string;
  successText: string;
  failureText: string;
  partialSuccessThreshold?: number;
  partialSuccessText?: string;
  allowRetry: boolean;
  retryPenalty?: number;
}

export interface ChallengeNode extends BaseNode {
  type: 'challenge';
  data: ChallengeNodeData;
}

// Combat Node
export interface CombatEnemy {
  creatureId: string;
  count: number | 'per_player';
  minCount?: number;
  maxCount?: number;
  customName?: string;
}

export interface CombatNodeData {
  enemies: CombatEnemy[];
  terrain?: string;
  ambush: boolean;
  canFlee: boolean;
  fleeConditions?: string;
  fleeDifficulty?: number;
  victoryText: string;
  defeatText: string;
  fleeText?: string;
}

export interface CombatNode extends BaseNode {
  type: 'combat';
  data: CombatNodeData;
}

// Check Node
export interface CheckVariable {
  name: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
  value: string | number;
}

export interface CheckNodeData {
  checkType: 'flag' | 'item' | 'variable' | 'random';
  flag?: string;
  item?: string;
  variable?: CheckVariable;
  randomChance?: number;
  successText: string;
  failureText: string;
}

export interface CheckNode extends BaseNode {
  type: 'check';
  data: CheckNodeData;
}

export type AdventureNode = StoryNode | DecisionNode | ChallengeNode | CombatNode | CheckNode;

// === Connection Types (PRD 10) ===

export type ConnectionType = 'default' | 'success' | 'failure' | 'choice';

export interface ConnectionCondition {
  type: 'flag' | 'item' | 'variable';
  name: string;
  operator: '==' | '!=' | 'exists' | 'not_exists';
  value?: string | number | boolean;
}

export interface NodeConnection {
  id: string;
  adventureId: string;
  sourceNodeId: string;
  sourcePort: string;
  targetNodeId: string;
  connectionType: ConnectionType;
  label?: string;
  conditions?: ConnectionCondition[];
}

// Port configuration
export interface PortConfig {
  id: string;
  type: ConnectionType;
  label: string;
  position?: number;
}

export interface NodeConfig {
  type: NodeType;
  color: string;
  icon: string;
  label: string;
  outputPorts: PortConfig[] | 'dynamic';
}

// === Adventure Type ===

export interface Adventure {
  id: string;
  title: string;
  description: string;
  startNodeId: string | null;
  nodes: AdventureNode[];
  connections: NodeConnection[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// === Validation Types (PRD 11) ===

export enum ValidationErrorCode {
  NO_START_NODE = 'E001',
  NO_VICTORY_PATH = 'E002',
  NO_FAILURE_PATH = 'E003',
  ORPHAN_NODE = 'E004',
  UNREACHABLE_VICTORY = 'E005',
  EMPTY_TITLE = 'E101',
  EMPTY_CONTENT = 'E102',
  NO_CHOICES = 'E103',
  NO_ENEMIES = 'E104',
  INVALID_DIFFICULTY = 'E105',
  MISSING_CHECK_VALUE = 'E106',
  UNCONNECTED_PORT = 'E201',
  DEAD_END_NODE = 'E202',
  CIRCULAR_ONLY_PATH = 'E203',
}

export enum ValidationWarningCode {
  SINGLE_PATH_ONLY = 'W001',
  SHORT_ADVENTURE = 'W002',
  VERY_LONG_PATH = 'W003',
  NO_IMAGE = 'W101',
  SHORT_CONTENT = 'W102',
  NO_READ_ALOUD = 'W103',
  HIGH_DIFFICULTY = 'W201',
  LOW_DIFFICULTY = 'W202',
  UNBALANCED_COMBAT = 'W203',
}

export interface ValidationError {
  code: ValidationErrorCode;
  message: string;
  nodeId?: string;
  field?: string;
  severity: 'error';
}

export interface ValidationWarning {
  code: ValidationWarningCode;
  message: string;
  nodeId?: string;
  suggestion?: string;
  severity: 'warning';
}

export interface AdventureStats {
  nodeCount: number;
  connectionCount: number;
  averagePathLength: number;
  shortestPath: number;
  longestPath: number;
  combatEncounters: number;
  challengeCount: number;
  decisionPoints: number;
  estimatedDurationMinutes: number;
}

export interface ValidationResult {
  isValid: boolean;
  canPublish: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: AdventureStats;
}
