# SPARC RPG - System Architecture

> Master architecture document defining shared models, APIs, real-time systems, and common terminology.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Shared TypeScript Data Models](#shared-typescript-data-models)
3. [API Contracts](#api-contracts)
4. [Real-Time Event System](#real-time-event-system)
5. [Authentication & Permissions](#authentication--permissions)
6. [Common Terminology](#common-terminology)

---

## System Overview

### Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript 5.x                                      │
│  TailwindCSS + Headless UI                                      │
│  Zustand (state management)                                     │
│  React Query (server state)                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  FastAPI (Python 3.11+)                                         │
│  Pydantic v2 (validation)                                       │
│  OpenAI API (AI Seer)                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  Supabase (PostgreSQL)                                          │
│  Row Level Security (RLS)                                       │
│  Supabase Realtime (WebSocket)                                  │
│  Supabase Storage (images)                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Architectural Principles

1. **API-First Design**: All features accessible via REST API
2. **Offline-Capable**: Critical game functions work without network
3. **Mobile-First**: Touch-optimized, responsive by default
4. **Real-Time by Default**: Game state syncs automatically
5. **Type-Safe**: Full TypeScript coverage with shared types

---

## Shared TypeScript Data Models

All models are defined in `src/types/sparc.ts` and used by both frontend and backend (via code generation for Python).

### Core Enums

```typescript
// src/types/enums.ts

export enum Attribute {
  MIGHT = 'might',    // Physical power and endurance
  GRACE = 'grace',    // Agility and precision
  WIT = 'wit',        // Knowledge and problem-solving
  HEART = 'heart'     // Charisma and social influence
}

export enum CharacterClass {
  CLERIC = 'cleric',
  NECROMANCER = 'necromancer',
  PALADIN = 'paladin',
  RANGER = 'ranger',
  ROGUE = 'rogue',
  WARRIOR = 'warrior',
  WIZARD = 'wizard'
}

export enum SessionStatus {
  WAITING = 'waiting',       // Lobby, accepting players
  ACTIVE = 'active',         // Game in progress
  PAUSED = 'paused',         // Game paused
  COMPLETED = 'completed',   // Game finished successfully
  CANCELLED = 'cancelled'    // Game ended early
}

export enum NodeType {
  STORY = 'story',           // Narrative content
  DECISION = 'decision',     // Player choices
  CHALLENGE = 'challenge',   // Stat checks
  COMBAT = 'combat',         // Encounters
  CHECK = 'check'            // Pass/fail tests
}

export enum ConnectionType {
  DEFAULT = 'default',       // Standard flow
  SUCCESS = 'success',       // On success outcome
  FAILURE = 'failure',       // On failure outcome
  CHOICE = 'choice'          // Decision branch
}

export enum RollOutcome {
  CRITICAL_SUCCESS = 'critical_success',  // All 6s
  SUCCESS = 'success',
  FAILURE = 'failure',
  CRITICAL_FAILURE = 'critical_failure'   // All 1s
}

export enum UserRole {
  PLAYER = 'player',
  SEER = 'seer',            // GM role
  ADMIN = 'admin'
}

export enum AdventureVisibility {
  PRIVATE = 'private',       // Only creator
  UNLISTED = 'unlisted',     // Anyone with link
  PUBLIC = 'public'          // In community library
}
```

### Character Models

```typescript
// src/types/character.ts

import { Attribute, CharacterClass } from './enums';

export interface AttributeBlock {
  might: number;   // 1-6
  grace: number;   // 1-6
  wit: number;     // 1-6
  heart: number;   // 1-6
}

export interface SpecialAbility {
  id: string;
  name: string;
  description: string;
  usesPerEncounter: number;
  currentUses: number;
  effect: AbilityEffect;
}

export interface AbilityEffect {
  type: 'damage_boost' | 'heal' | 'reroll' | 'buff' | 'debuff' | 'custom';
  value?: number;
  duration?: number;
  targetType: 'self' | 'ally' | 'enemy' | 'all_enemies' | 'all_allies';
  customLogic?: string;  // For complex abilities
}

export interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable';
  description: string;
  bonuses?: Partial<AttributeBlock>;
  damage?: number;
  defense?: number;
  quantity: number;
}

export interface Character {
  id: string;
  userId: string;
  name: string;                    // max 50 chars
  characterClass: CharacterClass;
  attributes: AttributeBlock;
  primaryAttribute: Attribute;
  equipment: Equipment[];
  specialAbilities: SpecialAbility[];
  background: string;              // max 500 chars
  
  // Combat stats
  maxHitPoints: number;            // default 6
  currentHitPoints: number;
  temporaryHitPoints: number;
  
  // Progression
  experiencePoints: number;
  level: number;                   // 1-10
  
  // Meta
  createdAt: string;               // ISO 8601
  updatedAt: string;
  isActive: boolean;
  portraitUrl?: string;
}

export interface CharacterTemplate {
  characterClass: CharacterClass;
  defaultAttributes: AttributeBlock;
  primaryAttribute: Attribute;
  startingEquipment: Omit<Equipment, 'id'>[];
  specialAbility: Omit<SpecialAbility, 'id' | 'currentUses'>;
  suggestedBackgrounds: string[];
  flavorText: string;
  iconUrl: string;
}
```

### Session Models

```typescript
// src/types/session.ts

import { SessionStatus, Attribute } from './enums';
import { Character } from './character';

export interface SessionPlayer {
  id: string;
  sessionId: string;
  userId: string;
  characterId: string;
  character?: Character;          // Hydrated on fetch
  joinedAt: string;
  isConnected: boolean;
  lastActivityAt: string;
}

export interface Session {
  id: string;
  code: string;                   // 6-char join code (e.g., "ABC123")
  seerId: string;                 // GM user ID
  seerName: string;
  adventureId: string;
  adventureName: string;
  
  status: SessionStatus;
  players: SessionPlayer[];
  maxPlayers: number;             // default 6
  minPlayers: number;             // default 1
  
  // Game state
  currentNodeId: string;
  visitedNodeIds: string[];
  gameState: GameState;
  
  // Timing
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  pausedAt?: string;
  estimatedDurationMinutes: number;
  
  // Settings
  settings: SessionSettings;
}

export interface SessionSettings {
  allowLateJoin: boolean;
  showDiceRolls: boolean;         // Show player dice to all
  autoResolveSimpleCombat: boolean;
  enableAISeer: boolean;
  voiceChatEnabled: boolean;
}

export interface GameState {
  inventory: InventoryItem[];
  variables: Record<string, string | number | boolean>;
  combatState?: CombatState;
  turnHistory: TurnHistoryEntry[];
  flags: string[];                // Story flags for conditional logic
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  description?: string;
  addedAtNodeId: string;
}

export interface TurnHistoryEntry {
  id: string;
  timestamp: string;
  type: 'narrative' | 'roll' | 'combat' | 'decision' | 'system';
  actorId?: string;               // Character or 'seer'
  actorName?: string;
  content: string;
  metadata?: Record<string, unknown>;
}
```

### Dice Models

```typescript
// src/types/dice.ts

import { Attribute, RollOutcome } from './enums';

export interface DiceRollRequest {
  sessionId: string;
  characterId: string;
  attribute: Attribute;
  diceCount: number;              // 1-10
  difficulty: number;             // 3-18
  rollType: RollType;
  modifiers?: RollModifier[];
  description?: string;           // "Attempting to climb wall"
}

export type RollType = 
  | 'attribute_check'
  | 'attack'
  | 'defense'
  | 'initiative'
  | 'damage'
  | 'healing'
  | 'ability'
  | 'heroic_save';

export interface RollModifier {
  source: string;                 // "Equipment: Climbing Boots"
  value: number;                  // +1, -2, etc.
  type: 'dice' | 'flat';          // Add dice or flat bonus
}

export interface DiceRoll {
  id: string;
  sessionId: string;
  characterId: string;
  characterName: string;
  
  // Roll parameters
  attribute: Attribute;
  diceCount: number;
  difficulty: number;
  rollType: RollType;
  modifiers: RollModifier[];
  
  // Results
  results: number[];              // Individual die values [4, 2, 6, 1]
  total: number;                  // Sum of all dice
  modifiedTotal: number;          // Total + flat modifiers
  success: boolean;
  outcome: RollOutcome;
  margin: number;                 // How much above/below difficulty
  
  // Display
  description: string;
  timestamp: string;
  animationSeed?: number;         // For deterministic animation replay
}

export interface DiceRollResult {
  roll: DiceRoll;
  narrativeEffect?: string;       // AI-generated flavor text
  triggerEffects?: EffectTrigger[];
}

export interface EffectTrigger {
  type: 'ability_refresh' | 'item_consume' | 'state_change' | 'combat_effect';
  target: string;
  value: unknown;
}
```

### Combat Models

```typescript
// src/types/combat.ts

import { AttributeBlock, Character } from './character';

export interface Creature {
  id: string;
  name: string;
  description: string;
  attributes: AttributeBlock;
  hitPoints: number;
  maxHitPoints: number;
  attackDice: number;
  defenseDice: number;
  damage: number;
  abilities?: CreatureAbility[];
  imageUrl?: string;
  challengeRating: number;        // 1-10
  tags: string[];                 // ['undead', 'beast', 'humanoid']
}

export interface CreatureAbility {
  name: string;
  description: string;
  cooldownRounds: number;
  currentCooldown: number;
  effect: string;                 // Description of effect
}

export interface CombatState {
  id: string;
  sessionId: string;
  nodeId: string;
  
  // Participants
  playerCombatants: PlayerCombatant[];
  enemyCombatants: EnemyCombatant[];
  
  // Turn management
  initiativeOrder: InitiativeEntry[];
  currentTurnIndex: number;
  roundNumber: number;
  
  // State
  isActive: boolean;
  outcome?: CombatOutcome;
  log: CombatLogEntry[];
}

export interface PlayerCombatant {
  id: string;
  characterId: string;
  character: Character;
  initiative: number;
  conditions: Condition[];
  hasActed: boolean;
  heroicSaveUsed: boolean;
}

export interface EnemyCombatant {
  id: string;
  creature: Creature;
  instanceNumber: number;         // "Goblin 1", "Goblin 2"
  currentHitPoints: number;
  initiative: number;
  conditions: Condition[];
  hasActed: boolean;
}

export interface InitiativeEntry {
  id: string;
  type: 'player' | 'enemy';
  combatantId: string;
  initiative: number;
  name: string;
}

export interface Condition {
  id: string;
  name: string;
  description: string;
  remainingRounds: number;
  effect: ConditionEffect;
}

export interface ConditionEffect {
  type: 'attribute_modifier' | 'skip_turn' | 'damage_over_time' | 'heal_over_time';
  attribute?: keyof AttributeBlock;
  value?: number;
}

export interface CombatLogEntry {
  id: string;
  timestamp: string;
  round: number;
  actorName: string;
  action: CombatAction;
  targetName?: string;
  rolls?: DiceRoll[];
  damage?: number;
  healing?: number;
  narrative: string;
}

export type CombatAction = 
  | 'attack'
  | 'defend'
  | 'ability'
  | 'item'
  | 'move'
  | 'heroic_save'
  | 'flee'
  | 'skip';

export interface CombatOutcome {
  type: 'victory' | 'defeat' | 'fled' | 'negotiated';
  survivingPlayers: string[];
  defeatedEnemies: string[];
  experienceAwarded: number;
  lootDropped: InventoryItem[];
}
```

### Adventure & Node Models

```typescript
// src/types/adventure.ts

import { NodeType, ConnectionType, Attribute, AdventureVisibility } from './enums';
import { Creature } from './combat';

export interface Adventure {
  id: string;
  authorId: string;
  authorName: string;
  
  // Metadata
  title: string;                  // max 100 chars
  description: string;            // max 1000 chars
  coverImageUrl?: string;
  tags: string[];
  estimatedDurationMinutes: number;
  recommendedPlayerCount: { min: number; max: number };
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  // Content
  nodes: AdventureNode[];
  connections: NodeConnection[];
  startNodeId: string;
  creatures: Creature[];          // Creature library for this adventure
  
  // State
  visibility: AdventureVisibility;
  version: number;
  publishedAt?: string;
  
  // Analytics
  playCount: number;
  averageRating: number;
  ratingCount: number;
  completionRate: number;
  
  // Meta
  createdAt: string;
  updatedAt: string;
}

export interface AdventureNode {
  id: string;
  adventureId: string;
  type: NodeType;
  
  // Canvas position
  position: { x: number; y: number };
  
  // Common properties
  title: string;
  content: string;                // Rich text/markdown
  imageUrl?: string;
  imageVisibleToPlayers: boolean;
  
  // Type-specific data
  data: NodeData;
  
  // Outcomes
  isVictoryNode: boolean;
  isFailureNode: boolean;
  experienceReward: number;
  itemRewards: { name: string; description?: string }[];
  
  // Conditions
  requiredFlags?: string[];
  requiredItems?: string[];
  setFlags?: string[];
  removeFlags?: string[];
  setVariables?: Record<string, string | number | boolean>;
}

export type NodeData = 
  | StoryNodeData 
  | DecisionNodeData 
  | ChallengeNodeData 
  | CombatNodeData 
  | CheckNodeData;

export interface StoryNodeData {
  type: 'story';
  objectives?: string[];
  readAloudText?: string;         // Text for Seer to read aloud
  seerNotes?: string;             // Private notes for Seer
}

export interface DecisionNodeData {
  type: 'decision';
  choices: DecisionChoice[];
  timeLimit?: number;             // Seconds, optional
}

export interface DecisionChoice {
  id: string;
  text: string;                   // "Enter the cave"
  tooltip?: string;               // Additional context
  requiredFlags?: string[];       // Show only if flags present
  forbiddenFlags?: string[];      // Hide if flags present
}

export interface ChallengeNodeData {
  type: 'challenge';
  attribute: Attribute;
  difficulty: number;             // 3-18
  description: string;            // "Climb the treacherous cliff"
  successText: string;
  failureText: string;
  partialSuccessThreshold?: number;
  partialSuccessText?: string;
}

export interface CombatNodeData {
  type: 'combat';
  enemies: CombatEnemy[];
  terrain?: string;
  ambush: boolean;                // Enemies get surprise round
  canFlee: boolean;
  fleeConditions?: string;        // "After round 3"
  victoryText: string;
  defeatText: string;
}

export interface CombatEnemy {
  creatureId: string;
  count: number | 'per_player';   // Static or scaled
  minCount?: number;              // Floor for per_player
  maxCount?: number;              // Ceiling for per_player
}

export interface CheckNodeData {
  type: 'check';
  checkType: 'flag' | 'item' | 'variable' | 'random';
  flag?: string;
  item?: string;
  variable?: { name: string; operator: '==' | '!=' | '>' | '<' | '>=' | '<='; value: string | number };
  randomChance?: number;          // 0-100
  successText: string;
  failureText: string;
}

export interface NodeConnection {
  id: string;
  adventureId: string;
  sourceNodeId: string;
  targetNodeId: string;
  connectionType: ConnectionType;
  choiceId?: string;              // For decision nodes
  label?: string;                 // Display text on connection
  conditions?: ConnectionCondition[];
}

export interface ConnectionCondition {
  type: 'flag' | 'item' | 'variable';
  name: string;
  operator: '==' | '!=' | 'exists' | 'not_exists';
  value?: string | number | boolean;
}
```

### User Models

```typescript
// src/types/user.ts

import { UserRole } from './enums';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  
  // Preferences
  preferences: UserPreferences;
  
  // Stats
  gamesPlayedAsPlayer: number;
  gamesPlayedAsSeer: number;
  adventuresCreated: number;
  totalPlaytimeMinutes: number;
  
  // Meta
  createdAt: string;
  lastLoginAt: string;
  isOnline: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  diceAnimationSpeed: 'fast' | 'normal' | 'slow';
  showTutorialHints: boolean;
  soundEnabled: boolean;
  musicVolume: number;            // 0-100
  sfxVolume: number;              // 0-100
  notificationsEnabled: boolean;
  language: string;               // ISO 639-1
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;              // ISO 8601
  tokenType: 'Bearer';
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}
```

### AI Seer Models

```typescript
// src/types/ai-seer.ts

export interface AISeerRequest {
  sessionId: string;
  sceneContext: string;           // Current scene description
  playerAction: string;           // What player wants to do
  difficultyPreference: 'easy' | 'medium' | 'hard';
  recentHistory?: string[];       // Last 3-5 actions
  characterContext?: {
    name: string;
    class: string;
    relevantStats: Record<string, number>;
  };
}

export interface AISeerResponse {
  id: string;
  requestId: string;
  
  // Main response
  suggestion: string;             // Suggested action/ruling
  ruleClarification?: string;     // Rule explanation
  narrativeHook?: string;         // Flavor text for immersion
  
  // Structured data
  suggestedRoll?: {
    attribute: Attribute;
    difficulty: number;
    reason: string;
  };
  
  // Meta
  confidence: number;             // 0-1
  responseTimeMs: number;
  cached: boolean;
  modelVersion: string;
}

export interface AISeerShortcode {
  code: string;                   // "combat", "order", "rules"
  description: string;
  template: string;
}
```

---

## API Contracts

### Base Configuration

```typescript
// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = 'v1';

// Standard response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    timestamp: string;
    requestId: string;
    pagination?: PaginationMeta;
  };
}

interface ApiError {
  code: string;                   // 'VALIDATION_ERROR', 'NOT_FOUND', etc.
  message: string;                // Human-readable message
  details?: Record<string, string[]>; // Field-specific errors
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
```

### Authentication Endpoints

```typescript
// POST /api/v1/auth/register
interface RegisterRequest {
  email: string;
  password: string;               // min 8 chars
  displayName: string;            // 2-50 chars
}
type RegisterResponse = ApiResponse<AuthSession>;

// POST /api/v1/auth/login
interface LoginRequest {
  email: string;
  password: string;
}
type LoginResponse = ApiResponse<AuthSession>;

// POST /api/v1/auth/logout
// Headers: Authorization: Bearer <token>
type LogoutResponse = ApiResponse<{ message: string }>;

// POST /api/v1/auth/refresh
interface RefreshRequest {
  refreshToken: string;
}
type RefreshResponse = ApiResponse<AuthTokens>;

// GET /api/v1/auth/me
// Headers: Authorization: Bearer <token>
type GetMeResponse = ApiResponse<User>;
```

### Character Endpoints

```typescript
// POST /api/v1/characters
interface CreateCharacterRequest {
  name: string;
  characterClass: CharacterClass;
  background?: string;
}
type CreateCharacterResponse = ApiResponse<Character>;

// GET /api/v1/characters
interface ListCharactersQuery {
  page?: number;
  pageSize?: number;              // default 20, max 100
  includeInactive?: boolean;
}
type ListCharactersResponse = ApiResponse<Character[]>;

// GET /api/v1/characters/:id
type GetCharacterResponse = ApiResponse<Character>;

// PATCH /api/v1/characters/:id
interface UpdateCharacterRequest {
  name?: string;
  background?: string;
  portraitUrl?: string;
}
type UpdateCharacterResponse = ApiResponse<Character>;

// DELETE /api/v1/characters/:id
type DeleteCharacterResponse = ApiResponse<{ deleted: boolean }>;

// GET /api/v1/characters/templates
type GetTemplatesResponse = ApiResponse<CharacterTemplate[]>;
```

### Session Endpoints

```typescript
// POST /api/v1/sessions
interface CreateSessionRequest {
  adventureId: string;
  settings?: Partial<SessionSettings>;
}
type CreateSessionResponse = ApiResponse<Session>;

// GET /api/v1/sessions/:id
type GetSessionResponse = ApiResponse<Session>;

// GET /api/v1/sessions/code/:code
type GetSessionByCodeResponse = ApiResponse<Session>;

// POST /api/v1/sessions/:id/join
interface JoinSessionRequest {
  characterId: string;
}
type JoinSessionResponse = ApiResponse<SessionPlayer>;

// POST /api/v1/sessions/:id/leave
type LeaveSessionResponse = ApiResponse<{ left: boolean }>;

// POST /api/v1/sessions/:id/start
// Seer only
type StartSessionResponse = ApiResponse<Session>;

// POST /api/v1/sessions/:id/pause
type PauseSessionResponse = ApiResponse<Session>;

// POST /api/v1/sessions/:id/resume
type ResumeSessionResponse = ApiResponse<Session>;

// POST /api/v1/sessions/:id/end
interface EndSessionRequest {
  outcome: 'completed' | 'cancelled';
}
type EndSessionResponse = ApiResponse<Session>;

// GET /api/v1/sessions/:id/state
type GetGameStateResponse = ApiResponse<GameState>;

// PATCH /api/v1/sessions/:id/state
interface UpdateGameStateRequest {
  currentNodeId?: string;
  addInventory?: InventoryItem[];
  removeInventory?: string[];     // Item IDs
  setVariables?: Record<string, unknown>;
  addFlags?: string[];
  removeFlags?: string[];
}
type UpdateGameStateResponse = ApiResponse<GameState>;
```

### Dice Endpoints

```typescript
// POST /api/v1/dice/roll
type DiceRollResponse = ApiResponse<DiceRollResult>;

// GET /api/v1/dice/history/:sessionId
interface DiceHistoryQuery {
  characterId?: string;
  rollType?: RollType;
  limit?: number;                 // default 50
}
type DiceHistoryResponse = ApiResponse<DiceRoll[]>;

// POST /api/v1/dice/heroic-save
interface HeroicSaveRequest {
  sessionId: string;
  characterId: string;
  originalRollId: string;
}
type HeroicSaveResponse = ApiResponse<DiceRollResult>;
```

### Combat Endpoints

```typescript
// POST /api/v1/combat/start
interface StartCombatRequest {
  sessionId: string;
  nodeId: string;
}
type StartCombatResponse = ApiResponse<CombatState>;

// GET /api/v1/combat/:id
type GetCombatResponse = ApiResponse<CombatState>;

// POST /api/v1/combat/:id/action
interface CombatActionRequest {
  combatantId: string;
  action: CombatAction;
  targetId?: string;
  abilityId?: string;
  itemId?: string;
}
type CombatActionResponse = ApiResponse<{
  combatState: CombatState;
  actionResult: CombatLogEntry;
}>;

// POST /api/v1/combat/:id/next-turn
type NextTurnResponse = ApiResponse<CombatState>;

// POST /api/v1/combat/:id/end
interface EndCombatRequest {
  outcome: CombatOutcome['type'];
}
type EndCombatResponse = ApiResponse<CombatOutcome>;
```

### Adventure Endpoints

```typescript
// GET /api/v1/adventures
interface ListAdventuresQuery {
  page?: number;
  pageSize?: number;
  visibility?: AdventureVisibility;
  authorId?: string;
  tags?: string[];
  difficulty?: string;
  search?: string;
  sortBy?: 'newest' | 'popular' | 'rating';
}
type ListAdventuresResponse = ApiResponse<Adventure[]>;

// GET /api/v1/adventures/:id
type GetAdventureResponse = ApiResponse<Adventure>;

// POST /api/v1/adventures
interface CreateAdventureRequest {
  title: string;
  description: string;
}
type CreateAdventureResponse = ApiResponse<Adventure>;

// PUT /api/v1/adventures/:id
type UpdateAdventureRequest = Partial<Omit<Adventure, 'id' | 'authorId' | 'createdAt'>>;
type UpdateAdventureResponse = ApiResponse<Adventure>;

// DELETE /api/v1/adventures/:id
type DeleteAdventureResponse = ApiResponse<{ deleted: boolean }>;

// POST /api/v1/adventures/:id/publish
type PublishAdventureResponse = ApiResponse<Adventure>;

// POST /api/v1/adventures/:id/duplicate
type DuplicateAdventureResponse = ApiResponse<Adventure>;

// POST /api/v1/adventures/:id/validate
type ValidateAdventureResponse = ApiResponse<{
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}>;
```

### AI Seer Endpoints

```typescript
// POST /api/v1/ai/advice
type AISeerAdviceResponse = ApiResponse<AISeerResponse>;

// GET /api/v1/ai/shortcodes
type GetShortcodesResponse = ApiResponse<AISeerShortcode[]>;

// POST /api/v1/ai/shortcode/:code
interface ShortcodeRequest {
  sessionId: string;
  params?: Record<string, string>;
}
type ShortcodeResponse = ApiResponse<string>;  // Formatted response
```

---

## Real-Time Event System

### Overview

SPARC uses a hybrid approach:
1. **Supabase Realtime** for database-triggered events (state sync)
2. **HTTP Polling** as fallback (2-second intervals)
3. **WebSocket upgrade** planned for <100ms dice animations

### Event Types

```typescript
// src/types/events.ts

export type GameEvent = 
  | SessionEvent 
  | DiceEvent 
  | CombatEvent 
  | StateEvent 
  | ChatEvent;

interface BaseEvent {
  id: string;
  sessionId: string;
  timestamp: string;
  actorId?: string;
}

// Session lifecycle events
interface SessionEvent extends BaseEvent {
  type: 'session';
  action: 
    | 'player_joined'
    | 'player_left'
    | 'player_connected'
    | 'player_disconnected'
    | 'session_started'
    | 'session_paused'
    | 'session_resumed'
    | 'session_ended';
  payload: {
    playerId?: string;
    playerName?: string;
    reason?: string;
  };
}

// Dice roll events
interface DiceEvent extends BaseEvent {
  type: 'dice';
  action: 'roll' | 'heroic_save';
  payload: DiceRoll;
}

// Combat events
interface CombatEvent extends BaseEvent {
  type: 'combat';
  action: 
    | 'combat_started'
    | 'turn_started'
    | 'action_performed'
    | 'combatant_damaged'
    | 'combatant_defeated'
    | 'combat_ended';
  payload: {
    combatId: string;
    combatantId?: string;
    action?: CombatAction;
    damage?: number;
    outcome?: CombatOutcome;
  };
}

// Game state events
interface StateEvent extends BaseEvent {
  type: 'state';
  action: 
    | 'node_changed'
    | 'inventory_updated'
    | 'variable_set'
    | 'flag_changed'
    | 'character_updated';
  payload: {
    nodeId?: string;
    inventory?: InventoryItem[];
    variables?: Record<string, unknown>;
    flags?: string[];
    characterId?: string;
  };
}

// In-game chat
interface ChatEvent extends BaseEvent {
  type: 'chat';
  action: 'message';
  payload: {
    senderId: string;
    senderName: string;
    message: string;
    isSystem: boolean;
  };
}
```

### Subscription Patterns

```typescript
// Client-side event subscription

// Using Supabase Realtime
import { createClient, RealtimeChannel } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function subscribeToSession(sessionId: string, handlers: EventHandlers): RealtimeChannel {
  return supabase
    .channel(`session:${sessionId}`)
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'session_events',
        filter: `session_id=eq.${sessionId}`
      },
      (payload) => {
        const event = payload.new as GameEvent;
        dispatchEvent(event, handlers);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${sessionId}`
      },
      (payload) => {
        handlers.onSessionUpdate?.(payload.new as Session);
      }
    )
    .subscribe();
}

interface EventHandlers {
  onSessionUpdate?: (session: Session) => void;
  onPlayerJoined?: (event: SessionEvent) => void;
  onDiceRoll?: (event: DiceEvent) => void;
  onCombatUpdate?: (event: CombatEvent) => void;
  onStateChange?: (event: StateEvent) => void;
  onChatMessage?: (event: ChatEvent) => void;
}
```

### Event Flow Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Player A   │     │    Server    │     │   Player B   │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │  POST /dice/roll   │                    │
       │───────────────────>│                    │
       │                    │                    │
       │                    │ INSERT into        │
       │                    │ dice_rolls &       │
       │                    │ session_events     │
       │                    │                    │
       │                    │<───────────────────│
       │                    │   Supabase         │
       │                    │   Realtime         │
       │                    │   Trigger          │
       │                    │                    │
       │<───────────────────│───────────────────>│
       │   DiceEvent        │   DiceEvent        │
       │   via WebSocket    │   via WebSocket    │
       │                    │                    │
       ▼                    ▼                    ▼
```

---

## Authentication & Permissions

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION FLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. REGISTRATION
   ┌────────┐    POST /auth/register    ┌────────┐    Create User    ┌──────────┐
   │ Client │ ─────────────────────────>│  API   │ ─────────────────>│ Supabase │
   └────────┘                           └────────┘                   └──────────┘
       │                                    │                             │
       │<───────────────────────────────────│<────────────────────────────│
       │        AuthSession (tokens + user) │      User + Session         │

2. LOGIN
   ┌────────┐    POST /auth/login       ┌────────┐    Verify Creds   ┌──────────┐
   │ Client │ ─────────────────────────>│  API   │ ─────────────────>│ Supabase │
   └────────┘                           └────────┘                   └──────────┘
       │                                    │                             │
       │<───────────────────────────────────│<────────────────────────────│
       │        AuthSession (tokens + user) │      JWT Tokens             │

3. API REQUEST
   ┌────────┐    GET /characters        ┌────────┐    Verify JWT     ┌──────────┐
   │ Client │ ─────────────────────────>│  API   │ ─────────────────>│ Supabase │
   │        │  Authorization: Bearer x  │        │                   │   JWT    │
   └────────┘                           └────────┘                   └──────────┘
       │                                    │                             │
       │                                    │     RLS enforces access     │
       │<───────────────────────────────────│<────────────────────────────│
       │        User's characters only      │      Filtered data          │

4. TOKEN REFRESH
   ┌────────┐    POST /auth/refresh     ┌────────┐    Refresh Token  ┌──────────┐
   │ Client │ ─────────────────────────>│  API   │ ─────────────────>│ Supabase │
   │        │  { refreshToken: x }      │        │                   │   Auth   │
   └────────┘                           └────────┘                   └──────────┘
       │                                    │                             │
       │<───────────────────────────────────│<────────────────────────────│
       │        New AuthTokens              │      New JWT pair           │
```

### Permission Model

```typescript
// src/types/permissions.ts

export type Permission = 
  // Character permissions
  | 'character:create'
  | 'character:read'
  | 'character:read:own'
  | 'character:update:own'
  | 'character:delete:own'
  
  // Session permissions
  | 'session:create'
  | 'session:read'
  | 'session:read:own'
  | 'session:join'
  | 'session:leave'
  | 'session:manage'           // Start, pause, end (Seer only)
  | 'session:kick'             // Remove player (Seer only)
  
  // Adventure permissions
  | 'adventure:create'
  | 'adventure:read:public'
  | 'adventure:read:own'
  | 'adventure:update:own'
  | 'adventure:delete:own'
  | 'adventure:publish'
  
  // Combat permissions
  | 'combat:action:own'        // Take action for own character
  | 'combat:manage'            // Control NPCs, override (Seer only)
  
  // Admin permissions
  | 'admin:users'
  | 'admin:content'
  | 'admin:analytics';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.PLAYER]: [
    'character:create',
    'character:read:own',
    'character:update:own',
    'character:delete:own',
    'session:read',
    'session:join',
    'session:leave',
    'adventure:read:public',
    'combat:action:own',
  ],
  [UserRole.SEER]: [
    // All player permissions plus:
    'session:create',
    'session:manage',
    'session:kick',
    'adventure:create',
    'adventure:read:own',
    'adventure:update:own',
    'adventure:delete:own',
    'adventure:publish',
    'combat:manage',
  ],
  [UserRole.ADMIN]: [
    // All permissions
    'admin:users',
    'admin:content',
    'admin:analytics',
  ],
};
```

### Row Level Security (RLS) Policies

```sql
-- Users can only see their own data
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Characters are private to owner
CREATE POLICY "Users can CRUD own characters"
ON characters FOR ALL
USING (auth.uid() = user_id);

-- Sessions visible to participants
CREATE POLICY "Session visibility"
ON sessions FOR SELECT
USING (
  seer_id = auth.uid() OR
  id IN (SELECT session_id FROM session_players WHERE user_id = auth.uid())
);

-- Adventures: public are visible to all, private only to author
CREATE POLICY "Adventure visibility"
ON adventures FOR SELECT
USING (
  visibility = 'public' OR
  author_id = auth.uid()
);

-- Only author can modify adventure
CREATE POLICY "Adventure modification"
ON adventures FOR UPDATE
USING (author_id = auth.uid());
```

---

## Common Terminology

### Game Terms

| Term | Definition |
|------|------------|
| **SPARC** | Simplified Playable Adventure Role-playing Core |
| **Seer** | Game Master (GM) - the player running the adventure |
| **Player** | A participant controlling a character |
| **Character** | A player's in-game avatar with stats and abilities |
| **Adventure** | A complete story with nodes and connections |
| **Session** | A single playthrough of an adventure |
| **Node** | A single scene or decision point in an adventure |
| **Attribute** | Character stats: Might, Grace, Wit, Heart |
| **Heroic Save** | One-per-encounter reroll ability |

### Technical Terms

| Term | Definition |
|------|------------|
| **Canvas** | The visual editor workspace for adventures |
| **Node Graph** | The connected network of story nodes |
| **Connection** | A link between two nodes |
| **Game State** | Current session progress (inventory, flags, position) |
| **Turn History** | Log of all actions in a session |
| **Dice Pool** | Number of dice rolled, based on attribute |
| **Difficulty** | Target number to beat with dice roll |
| **Initiative** | Turn order in combat |
| **Combatant** | Any participant in combat (player or enemy) |

### UI Terms

| Term | Definition |
|------|------------|
| **Dashboard** | Seer's control panel during gameplay |
| **Character Sheet** | Display of character stats and abilities |
| **Session Lobby** | Waiting room before game starts |
| **Session Browser** | List of joinable public sessions |
| **Adventure Forge** | The visual adventure editor |
| **Property Panel** | Side panel for editing node properties |
| **Minimap** | Overview navigation for large adventures |

### Status Terms

| Term | Definition |
|------|------------|
| **Waiting** | Session created, accepting players |
| **Active** | Game in progress |
| **Paused** | Game temporarily stopped |
| **Completed** | Game finished successfully |
| **Cancelled** | Game ended without completion |
| **Draft** | Adventure not yet published |
| **Published** | Adventure available in community |
| **Validated** | Adventure passes all checks |

---

*This architecture document is the source of truth for SPARC RPG technical design. All PRDs reference types and APIs defined here.*
