// Adventure Forge Type Definitions
export interface Point {
  x: number;
  y: number;
}

export interface CanvasViewport {
  x: number;
  y: number;
  scale: number;
}

export type NodeType = 'story' | 'decision' | 'challenge' | 'combat' | 'check';

export interface AdventureNode {
  id: string;
  type: NodeType;
  position: Point;
  properties: NodeProperties;
  validationState: 'valid' | 'warning' | 'error';
  connections: {
    inputs: ConnectionPoint[];
    outputs: ConnectionPoint[];
  };
}

export interface ConnectionPoint {
  id: string;
  label: string;
  position: Point; // Relative to node
}

export interface NodeConnection {
  id: string;
  sourceNodeId: string;
  sourcePort: string;
  targetNodeId: string;
  targetPort: string;
  path: BezierPath;
  validation: ConnectionValidation;
}

export interface BezierPath {
  start: Point;
  control1: Point;
  control2: Point;
  end: Point;
}

export interface ConnectionValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Node Properties (polymorphic based on type)
export type NodeProperties = 
  | StoryProperties 
  | DecisionProperties 
  | ChallengeProperties 
  | CombatProperties 
  | CheckProperties;

export interface StoryProperties {
  title: string;
  content: {
    text: string;
    formatting?: RichTextFormat[];
  };
  image?: {
    url: string;
    hideFromPlayers: boolean;
  };
  objectives?: string[];
  items?: ItemReference[];
  experiencePoints: number;
  endConditions: {
    victory: boolean;
    failure: boolean;
  };
}

export interface DecisionProperties {
  title: string;
  objective: string;
  content: RichTextContent;
  decisions: DecisionOption[];
  items?: ItemReference[];
}

export interface DecisionOption {
  id: string;
  description: string;
  targetConnection: {
    type: 'new' | 'existing';
    targetNodeId?: string;
  };
}

export interface ChallengeProperties {
  title: string;
  objective: string;
  stat: 'STR' | 'DEX' | 'INT' | 'CHA';
  outcomes: ChallengeOutcome[];
  content: RichTextContent;
}

export interface ChallengeOutcome {
  type: 'simple' | 'complex';
  rollRange: {
    min: number;
    max: number;
  };
  description: string;
  targetConnection: ConnectionTarget;
}

export interface CombatProperties {
  title: string;
  objective: string;
  creatures: CreatureEncounter[];
  outcomes: CombatOutcome[];
  content: RichTextContent;
}

export interface CreatureEncounter {
  creatureId: string;
  quantity: {
    type: 'static' | 'dynamic';
    value: number;
    perPlayerModifier?: number;
  };
}

export interface CombatOutcome {
  condition: 'victory' | 'defeat' | 'flee';
  description: string;
  targetConnection: ConnectionTarget;
}

export interface CheckProperties {
  title: string;
  objective: string;
  checkType: 'simple' | 'complex';
  outcomes: {
    success: CheckOutcome;
    failure: CheckOutcome;
  };
  content: RichTextContent;
}

export interface CheckOutcome {
  description: string;
  targetConnection: ConnectionTarget;
}

// Supporting Types
export interface RichTextContent {
  text: string;
  formatting?: RichTextFormat[];
}

export interface RichTextFormat {
  start: number;
  end: number;
  type: 'bold' | 'italic' | 'underline' | 'color';
  value?: string; // For color formatting
}

export interface ItemReference {
  itemId: string;
  quantity: number;
  required: boolean;
}

export interface ConnectionTarget {
  type: 'new' | 'existing';
  targetNodeId?: string;
}

// Canvas State Management
export interface CanvasState {
  viewport: CanvasViewport;
  nodes: AdventureNode[];
  connections: NodeConnection[];
  selectedNodes: string[];
  dragState: DragState | null;
  mode: CanvasMode;
}

export interface DragState {
  type: 'node' | 'connection' | 'viewport';
  startPosition: Point;
  currentPosition: Point;
  targetId?: string;
  offset?: Point;
}

export type CanvasMode = 'select' | 'connect' | 'create';

// Touch and Gesture Types
export interface TouchGesture {
  type: GestureType;
  startPoint: Point;
  currentPoint: Point;
  scale?: number;
  rotation?: number;
}

export type GestureType = 'tap' | 'longPress' | 'pan' | 'pinch' | 'twoFingerPan';

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  id: string;
  nodeId?: string;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

export interface ValidationWarning extends ValidationError {
  severity: 'warning';
}

// Adventure Export Types
export interface AdventureExport {
  meta: {
    title: string;
    authorId: string;
    version: number;
    estimatedPlaytime: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
  nodes: AdventureNode[];
  connections: NodeConnection[];
  startNodeId: string;
  validationState: ValidationResult;
}

// Adventure Logic Engine Types
export interface AdventureState {
  variables: Record<string, any>;
  inventory: InventoryItem[];
  party: PartyMember[];
  flags: Record<string, boolean>;
  currentNodeId: string;
  visitedNodes: string[];
  actionHistory: ActionRecord[];
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  category: string;
  properties: Record<string, any>;
}

export interface PartyMember {
  id: string;
  name: string;
  stats: {
    strength: number;
    dexterity: number;
    intelligence: number;
    charisma: number;
  };
  currentHP: number;
  maxHP: number;
  experience: number;
  level: number;
  conditions: StatusCondition[];
}

export interface StatusCondition {
  id: string;
  name: string;
  description: string;
  duration: number;
  effects: Record<string, number>;
}

export interface ActionRecord {
  id: string;
  timestamp: number;
  nodeId: string;
  actionType: 'navigate' | 'choice' | 'challenge' | 'combat' | 'check';
  details: Record<string, any>;
  result?: ActionResult;
}

export interface ActionResult {
  success: boolean;
  consequences: Consequence[];
  stateChanges: StateChange[];
  rewards?: Reward[];
}

export interface Consequence {
  id: string;
  type: 'narrative' | 'mechanical' | 'state';
  description: string;
  permanent: boolean;
}

export interface StateChange {
  type: 'variable' | 'inventory' | 'party' | 'flag';
  target: string;
  operation: 'set' | 'add' | 'remove' | 'modify';
  value: any;
  condition?: ConditionalExpression;
}

export interface Reward {
  id: string;
  type: 'experience' | 'item' | 'stat' | 'ability';
  target?: string; // For party member or specific target
  value: any;
  description: string;
}

export interface ConditionalExpression {
  type: 'simple' | 'compound';
  operator?: 'and' | 'or' | 'not';
  conditions?: ConditionalExpression[];
  variable?: string;
  comparison?: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'exists';
  value?: any;
}

export interface GameplayEngine {
  evaluateCondition(condition: ConditionalExpression, state: AdventureState): boolean;
  executeAction(action: ActionRecord, state: AdventureState): AdventureState;
  validateTransition(fromNode: string, toNode: string, state: AdventureState): boolean;
  calculateOutcome(nodeId: string, choice: any, state: AdventureState): ActionResult;
  applyStateChanges(changes: StateChange[], state: AdventureState): AdventureState;
  getAvailableActions(nodeId: string, state: AdventureState): string[];
}