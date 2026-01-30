# PRD 03: Combat System

> **Status**: Ready for Implementation  
> **Priority**: P0 - Critical Path  
> **Estimated Effort**: 5 days  
> **Dependencies**: 01-dice-system, 02-character-system

---

## Overview

The combat system handles all tactical encounters in SPARC RPG. It manages initiative order, turn-based actions, damage calculation, and encounter resolution. Combat should be fast (15-20 minutes max), understandable by newcomers, yet tactically engaging.

### Goals
- Resolve combat encounters in 15-20 minutes
- Make combat rules learnable in first encounter
- Support 1-6 players vs multiple enemies
- Provide satisfying tactical choices
- Enable Seer to manage enemies efficiently

### Non-Goals
- Complex positioning/grid-based movement
- Detailed action economy (bonus actions, reactions)
- Equipment switching mid-combat
- Environmental hazards system

---

## User Stories

### US-01: Initiative Roll
**As a** participant in combat  
**I want to** roll for turn order  
**So that** combat proceeds fairly

**Acceptance Criteria:**
- [ ] All combatants roll 1D6 for initiative
- [ ] Order displayed highest to lowest
- [ ] Ties resolved by Grace stat, then random
- [ ] Surprised combatants go last in round 1
- [ ] Initiative visible to all players

### US-02: Attack Action
**As a** player on my turn  
**I want to** attack an enemy  
**So that** I can defeat them

**Acceptance Criteria:**
- [ ] Select target from available enemies
- [ ] Roll attribute-based attack dice
- [ ] Target rolls defense dice
- [ ] Compare results for hit/miss
- [ ] Calculate and apply damage on hit
- [ ] Show clear success/failure feedback

### US-03: Special Ability
**As a** player  
**I want to** use my class ability  
**So that** I can have unique combat impact

**Acceptance Criteria:**
- [ ] Ability available if uses remaining
- [ ] Clear effect description shown
- [ ] Ability resolves per its definition
- [ ] Uses decremented on success
- [ ] Cooldown/refresh rules enforced

### US-04: Heroic Save in Combat
**As a** player who failed an important roll  
**I want to** use Heroic Save  
**So that** I can turn the tide

**Acceptance Criteria:**
- [ ] Available after any failed roll
- [ ] One use per encounter
- [ ] Rerolls entire dice pool
- [ ] Clear visual for save attempt
- [ ] Tracks used status correctly

### US-05: Enemy Turn (Seer)
**As a** Seer  
**I want to** control enemy actions  
**So that** combat progresses

**Acceptance Criteria:**
- [ ] See all enemy HP and status
- [ ] Select action for each enemy
- [ ] Auto-roll enemy attacks
- [ ] Apply damage to players
- [ ] Quick action buttons for common moves

### US-06: Defeat/Victory
**As a** participant  
**I want to** know when combat ends  
**So that** the story continues

**Acceptance Criteria:**
- [ ] Victory: All enemies at 0 HP
- [ ] Defeat: All players at 0 HP
- [ ] Negotiation: Seer can end early
- [ ] Flee: If allowed by node
- [ ] Experience/loot distributed on victory

---

## Technical Specification

### Data Models

```typescript
// Core combat types (see ARCHITECTURE.md for full definitions)

interface CombatState {
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

interface PlayerCombatant {
  id: string;
  characterId: string;
  character: Character;
  initiative: number;
  conditions: Condition[];
  hasActed: boolean;
  heroicSaveUsed: boolean;
}

interface EnemyCombatant {
  id: string;
  creature: Creature;
  instanceNumber: number;        // "Goblin 1", "Goblin 2"
  currentHitPoints: number;
  initiative: number;
  conditions: Condition[];
  hasActed: boolean;
}

interface InitiativeEntry {
  id: string;
  type: 'player' | 'enemy';
  combatantId: string;
  initiative: number;
  name: string;
}

interface CombatLogEntry {
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

interface CombatOutcome {
  type: 'victory' | 'defeat' | 'fled' | 'negotiated';
  survivingPlayers: string[];
  defeatedEnemies: string[];
  experienceAwarded: number;
  lootDropped: InventoryItem[];
}

interface Creature {
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
  challengeRating: number;
  tags: string[];
}
```

### Combat Flow Algorithm

```typescript
// Main combat resolution flow

interface CombatEngine {
  // Initialize combat from node
  startCombat(sessionId: string, nodeId: string): Promise<CombatState>;
  
  // Roll initiative for all combatants
  rollInitiative(combatId: string): Promise<InitiativeEntry[]>;
  
  // Get current turn's combatant
  getCurrentTurn(combatId: string): Promise<InitiativeEntry>;
  
  // Execute a combat action
  executeAction(combatId: string, action: CombatActionRequest): Promise<CombatActionResult>;
  
  // Advance to next turn
  nextTurn(combatId: string): Promise<CombatState>;
  
  // Check if combat should end
  checkCombatEnd(combatId: string): Promise<CombatOutcome | null>;
  
  // End combat manually
  endCombat(combatId: string, outcome: CombatOutcome['type']): Promise<CombatOutcome>;
}

// Combat start flow
async function startCombat(sessionId: string, nodeId: string): Promise<CombatState> {
  // 1. Get node combat data
  const node = await getNode(nodeId);
  const combatData = node.data as CombatNodeData;
  
  // 2. Get session players
  const session = await getSession(sessionId);
  const players = session.players;
  
  // 3. Spawn enemies based on node configuration
  const enemies: EnemyCombatant[] = [];
  for (const enemyConfig of combatData.enemies) {
    const creature = await getCreature(enemyConfig.creatureId);
    const count = enemyConfig.count === 'per_player' 
      ? Math.min(Math.max(players.length, enemyConfig.minCount ?? 1), enemyConfig.maxCount ?? 10)
      : enemyConfig.count;
    
    for (let i = 1; i <= count; i++) {
      enemies.push({
        id: generateId(),
        creature,
        instanceNumber: i,
        currentHitPoints: creature.hitPoints,
        initiative: 0,
        conditions: [],
        hasActed: false,
      });
    }
  }
  
  // 4. Create player combatants
  const playerCombatants: PlayerCombatant[] = players.map(p => ({
    id: generateId(),
    characterId: p.characterId,
    character: p.character,
    initiative: 0,
    conditions: [],
    hasActed: false,
    heroicSaveUsed: false,
  }));
  
  // 5. Roll initiative
  const initiativeOrder = await rollInitiativeForAll(playerCombatants, enemies, combatData.ambush);
  
  // 6. Create combat state
  const combatState: CombatState = {
    id: generateId(),
    sessionId,
    nodeId,
    playerCombatants,
    enemyCombatants: enemies,
    initiativeOrder,
    currentTurnIndex: 0,
    roundNumber: 1,
    isActive: true,
    log: [{
      id: generateId(),
      timestamp: new Date().toISOString(),
      round: 1,
      actorName: 'System',
      action: 'start',
      narrative: `Combat begins! ${enemies.length} enemies appear!`,
    }],
  };
  
  // 7. Save and broadcast
  await saveCombatState(combatState);
  await broadcastEvent(sessionId, { type: 'combat', action: 'combat_started', payload: combatState });
  
  return combatState;
}

// Initiative rolling
async function rollInitiativeForAll(
  players: PlayerCombatant[],
  enemies: EnemyCombatant[],
  ambush: boolean
): Promise<InitiativeEntry[]> {
  const entries: InitiativeEntry[] = [];
  
  // Roll for players
  for (const player of players) {
    const roll = rollD6();
    player.initiative = roll;
    entries.push({
      id: player.id,
      type: 'player',
      combatantId: player.id,
      initiative: ambush ? roll - 10 : roll, // Ambush penalty
      name: player.character.name,
    });
  }
  
  // Roll for enemies
  for (const enemy of enemies) {
    const roll = rollD6();
    enemy.initiative = roll;
    entries.push({
      id: enemy.id,
      type: 'enemy',
      combatantId: enemy.id,
      initiative: roll,
      name: `${enemy.creature.name} ${enemy.instanceNumber}`,
    });
  }
  
  // Sort by initiative (high to low), then by Grace, then random
  return entries.sort((a, b) => {
    if (b.initiative !== a.initiative) return b.initiative - a.initiative;
    
    const aGrace = getCombatantGrace(a);
    const bGrace = getCombatantGrace(b);
    if (bGrace !== aGrace) return bGrace - aGrace;
    
    return Math.random() - 0.5;
  });
}
```

### Attack Resolution

```typescript
interface AttackResult {
  hit: boolean;
  damage: number;
  attackRoll: DiceRoll;
  defenseRoll: DiceRoll;
  critical: boolean;
  narrative: string;
}

async function resolveAttack(
  attacker: PlayerCombatant | EnemyCombatant,
  defender: PlayerCombatant | EnemyCombatant,
  combatId: string
): Promise<AttackResult> {
  // 1. Determine attack dice
  const attackDice = isPlayer(attacker)
    ? getAttributeValue(attacker.character, attacker.character.primaryAttribute)
    : attacker.creature.attackDice;
  
  // 2. Determine defense dice
  const defenseDice = isPlayer(defender)
    ? getAttributeValue(defender.character, Attribute.GRACE) // Players defend with Grace
    : defender.creature.defenseDice;
  
  // 3. Roll attack
  const attackRoll = await rollDice({
    sessionId: combatId,
    diceCount: attackDice,
    difficulty: 0, // Opposed roll, no fixed difficulty
    rollType: 'attack',
  });
  
  // 4. Roll defense
  const defenseRoll = await rollDice({
    sessionId: combatId,
    diceCount: defenseDice,
    difficulty: 0,
    rollType: 'defense',
  });
  
  // 5. Compare totals
  const hit = attackRoll.total > defenseRoll.total;
  
  // 6. Calculate damage if hit
  let damage = 0;
  if (hit) {
    const baseDamage = isPlayer(attacker)
      ? getWeaponDamage(attacker.character)
      : attacker.creature.damage;
    
    // Bonus damage for high margin
    const margin = attackRoll.total - defenseRoll.total;
    const bonusDamage = Math.floor(margin / 5);
    
    damage = baseDamage + bonusDamage;
    
    // Critical hit: double damage
    if (attackRoll.outcome === RollOutcome.CRITICAL_SUCCESS) {
      damage *= 2;
    }
  }
  
  // 7. Generate narrative
  const narrative = generateCombatNarrative(attacker, defender, hit, damage, attackRoll.outcome);
  
  return {
    hit,
    damage,
    attackRoll,
    defenseRoll,
    critical: attackRoll.outcome === RollOutcome.CRITICAL_SUCCESS,
    narrative,
  };
}

function generateCombatNarrative(
  attacker: Combatant,
  defender: Combatant,
  hit: boolean,
  damage: number,
  outcome: RollOutcome
): string {
  const attackerName = getCombatantName(attacker);
  const defenderName = getCombatantName(defender);
  
  if (outcome === RollOutcome.CRITICAL_SUCCESS) {
    return `${attackerName} lands a devastating critical hit on ${defenderName} for ${damage} damage!`;
  }
  if (outcome === RollOutcome.CRITICAL_FAILURE) {
    return `${attackerName} stumbles badly, completely missing ${defenderName}!`;
  }
  if (hit) {
    return `${attackerName} strikes ${defenderName} for ${damage} damage!`;
  }
  return `${attackerName}'s attack misses ${defenderName}!`;
}
```

### API Endpoints

#### POST /api/v1/combat/start

Start combat for a session at a combat node.

**Request:**
```typescript
interface StartCombatRequest {
  sessionId: string;
  nodeId: string;
}
```

**Response (200 OK):**
```typescript
interface StartCombatResponse {
  success: true;
  data: CombatState;
}
```

**Error Responses:**
- `400 Bad Request`: Invalid parameters
- `403 Forbidden`: Not session Seer
- `404 Not Found`: Session or node not found
- `409 Conflict`: Combat already active
- `422 Unprocessable Entity`: Node is not combat type

#### GET /api/v1/combat/:id

Get current combat state.

**Response (200 OK):**
```typescript
interface GetCombatResponse {
  success: true;
  data: CombatState;
}
```

#### POST /api/v1/combat/:id/action

Execute a combat action.

**Request:**
```typescript
interface CombatActionRequest {
  combatantId: string;
  action: CombatAction;          // 'attack' | 'defend' | 'ability' | 'item' | 'flee' | 'skip'
  targetId?: string;             // Required for attack/ability
  abilityId?: string;            // Required for ability action
  itemId?: string;               // Required for item action
}
```

**Response (200 OK):**
```typescript
interface CombatActionResponse {
  success: true;
  data: {
    combatState: CombatState;
    actionResult: CombatLogEntry;
    combatEnded: boolean;
    outcome?: CombatOutcome;
  };
}
```

**Validation:**
- Must be combatant's turn
- Combatant must be alive
- Target must be valid (alive, correct side)
- Ability must be available

#### POST /api/v1/combat/:id/heroic-save

Use Heroic Save on a combat roll.

**Request:**
```typescript
interface CombatHeroicSaveRequest {
  combatantId: string;
  rollId: string;
}
```

**Response:** Same as `/api/v1/dice/heroic-save`

**Additional Validation:**
- Heroic Save not yet used this combat
- Roll is from current turn

#### POST /api/v1/combat/:id/next-turn

Advance to the next turn.

**Response (200 OK):**
```typescript
interface NextTurnResponse {
  success: true;
  data: {
    combatState: CombatState;
    currentTurn: InitiativeEntry;
    newRound: boolean;
  };
}
```

#### POST /api/v1/combat/:id/end

End combat manually (Seer only).

**Request:**
```typescript
interface EndCombatRequest {
  outcome: 'victory' | 'defeat' | 'fled' | 'negotiated';
  experienceOverride?: number;
  lootOverride?: InventoryItem[];
}
```

**Response (200 OK):**
```typescript
interface EndCombatResponse {
  success: true;
  data: CombatOutcome;
}
```

### Database Schema

```sql
CREATE TABLE combat_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  node_id UUID NOT NULL,
  
  -- Combatants (JSONB for flexibility)
  player_combatants JSONB NOT NULL DEFAULT '[]',
  enemy_combatants JSONB NOT NULL DEFAULT '[]',
  
  -- Turn tracking
  initiative_order JSONB NOT NULL DEFAULT '[]',
  current_turn_index INTEGER NOT NULL DEFAULT 0,
  round_number INTEGER NOT NULL DEFAULT 1,
  
  -- State
  is_active BOOLEAN NOT NULL DEFAULT true,
  outcome JSONB,  -- CombatOutcome when finished
  
  -- Log
  log JSONB NOT NULL DEFAULT '[]',
  
  -- Meta
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  
  -- Only one active combat per session
  CONSTRAINT one_active_combat_per_session UNIQUE (session_id) WHERE is_active = true
);

CREATE INDEX idx_combat_session ON combat_states(session_id);
CREATE INDEX idx_combat_active ON combat_states(session_id) WHERE is_active = true;

-- Creatures table (bestiary)
CREATE TABLE creatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  
  -- Stats
  attributes JSONB NOT NULL DEFAULT '{"might": 2, "grace": 2, "wit": 2, "heart": 2}',
  hit_points INTEGER NOT NULL DEFAULT 4,
  attack_dice INTEGER NOT NULL DEFAULT 2,
  defense_dice INTEGER NOT NULL DEFAULT 2,
  damage INTEGER NOT NULL DEFAULT 1,
  
  -- Special
  abilities JSONB NOT NULL DEFAULT '[]',
  
  -- Metadata
  challenge_rating INTEGER NOT NULL DEFAULT 1 CHECK (challenge_rating BETWEEN 1 AND 10),
  tags TEXT[] NOT NULL DEFAULT '{}',
  
  -- Ownership (null = system creature, user_id = custom)
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_creatures_public ON creatures(is_public) WHERE is_public = true;
CREATE INDEX idx_creatures_creator ON creatures(created_by);
CREATE INDEX idx_creatures_tags ON creatures USING GIN(tags);
```

### Data Flow: Combat Turn

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Player    │     │   Frontend  │     │   Backend   │     │  Database   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │  It's my turn!    │                   │                   │
       │  Click Attack     │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │                   │  Select Target    │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
       │  Click "Goblin 1" │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │                   │  POST /combat/:id/action              │
       │                   │  { action: 'attack',                  │
       │                   │    targetId: 'goblin-1' }             │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │                   │  Validate turn    │
       │                   │                   │  Roll attack dice │
       │                   │                   │  Roll defense dice│
       │                   │                   │  Calculate damage │
       │                   │                   │  Apply damage     │
       │                   │                   │  Check death      │
       │                   │                   │  Generate log     │
       │                   │                   │                   │
       │                   │                   │  UPDATE combat    │
       │                   │                   │──────────────────>│
       │                   │                   │                   │
       │                   │                   │  INSERT event     │
       │                   │                   │──────────────────>│
       │                   │                   │                   │
       │                   │                   │<──────────────────│
       │                   │<──────────────────│                   │
       │                   │  ActionResult +   │                   │
       │                   │  Updated Combat   │                   │
       │                   │                   │                   │
       │<──────────────────│                   │                   │
       │  Show attack anim │                   │                   │
       │  Show damage      │                   │                   │
       │  Update UI        │                   │                   │
       │                   │                   │                   │
       │                   │      Supabase Realtime                │
       │              ┌────│<═══════════════════════════════════╗  │
       │              │    │                   │                ║  │
       │              ▼    │                   │                ║  │
       │   ┌─────────────┐ │                   │                ║  │
       │   │ Other       │<╝                   │                ║  │
       │   │ Players     │  Event broadcast   │                ║  │
       │   └─────────────┘                     │                ║  │
       │                                       │<═══════════════╝  │
       │                                       │  Broadcast        │
       ▼                                       ▼                   ▼
```

### Combat UI States

```typescript
enum CombatUIState {
  WAITING_FOR_TURN = 'waiting',      // Not your turn
  SELECT_ACTION = 'select_action',   // Your turn, choose action
  SELECT_TARGET = 'select_target',   // Chose attack/ability, pick target
  ROLLING = 'rolling',               // Dice rolling animation
  RESOLVING = 'resolving',           // Processing result
  HEROIC_SAVE_PROMPT = 'heroic_save', // Failed, can use save
  TURN_COMPLETE = 'turn_complete',   // Action resolved
  COMBAT_END = 'combat_end',         // Combat finished
}

interface CombatUIContext {
  state: CombatUIState;
  combat: CombatState;
  currentAction?: CombatAction;
  selectedTarget?: string;
  lastRoll?: DiceRoll;
  canUseHeroicSave: boolean;
}
```

### Error Handling

```typescript
enum CombatErrorCode {
  COMBAT_NOT_FOUND = 'COMBAT_001',
  NOT_YOUR_TURN = 'COMBAT_002',
  INVALID_TARGET = 'COMBAT_003',
  COMBATANT_DEAD = 'COMBAT_004',
  ABILITY_NOT_AVAILABLE = 'COMBAT_005',
  ITEM_NOT_AVAILABLE = 'COMBAT_006',
  COMBAT_NOT_ACTIVE = 'COMBAT_007',
  COMBAT_ALREADY_ACTIVE = 'COMBAT_008',
  CANNOT_FLEE = 'COMBAT_009',
  NOT_SEER = 'COMBAT_010',
  INVALID_ACTION = 'COMBAT_011',
}

const combatErrors: Record<CombatErrorCode, { status: number; message: string }> = {
  [CombatErrorCode.COMBAT_NOT_FOUND]: {
    status: 404,
    message: 'Combat encounter not found',
  },
  [CombatErrorCode.NOT_YOUR_TURN]: {
    status: 403,
    message: 'It is not your turn',
  },
  [CombatErrorCode.INVALID_TARGET]: {
    status: 400,
    message: 'Invalid target for this action',
  },
  [CombatErrorCode.COMBATANT_DEAD]: {
    status: 422,
    message: 'This combatant has been defeated',
  },
  [CombatErrorCode.ABILITY_NOT_AVAILABLE]: {
    status: 422,
    message: 'This ability is not available',
  },
  [CombatErrorCode.ITEM_NOT_AVAILABLE]: {
    status: 422,
    message: 'This item is not available',
  },
  [CombatErrorCode.COMBAT_NOT_ACTIVE]: {
    status: 422,
    message: 'Combat has already ended',
  },
  [CombatErrorCode.COMBAT_ALREADY_ACTIVE]: {
    status: 409,
    message: 'Combat is already active for this session',
  },
  [CombatErrorCode.CANNOT_FLEE]: {
    status: 422,
    message: 'Cannot flee from this encounter',
  },
  [CombatErrorCode.NOT_SEER]: {
    status: 403,
    message: 'Only the Seer can perform this action',
  },
  [CombatErrorCode.INVALID_ACTION]: {
    status: 400,
    message: 'Invalid combat action',
  },
};
```

---

## Testing Requirements

### Unit Tests

```typescript
describe('CombatEngine', () => {
  describe('startCombat', () => {
    it('should spawn correct number of enemies', async () => {
      const node = createCombatNode([
        { creatureId: 'goblin', count: 3 },
      ]);
      
      const combat = await CombatEngine.start(session.id, node.id);
      
      expect(combat.enemyCombatants).toHaveLength(3);
      expect(combat.enemyCombatants[0].instanceNumber).toBe(1);
      expect(combat.enemyCombatants[1].instanceNumber).toBe(2);
      expect(combat.enemyCombatants[2].instanceNumber).toBe(3);
    });

    it('should scale enemies per player', async () => {
      const session = createSessionWithPlayers(4);
      const node = createCombatNode([
        { creatureId: 'goblin', count: 'per_player', minCount: 2, maxCount: 5 },
      ]);
      
      const combat = await CombatEngine.start(session.id, node.id);
      
      expect(combat.enemyCombatants).toHaveLength(4);
    });

    it('should apply ambush penalty to player initiative', async () => {
      const node = createCombatNode([{ creatureId: 'goblin', count: 1 }], { ambush: true });
      
      const combat = await CombatEngine.start(session.id, node.id);
      
      // Player initiative should be -10 from roll (effectively going last)
      const playerEntry = combat.initiativeOrder.find(e => e.type === 'player');
      expect(playerEntry.initiative).toBeLessThan(0);
    });
  });

  describe('rollInitiative', () => {
    it('should sort by initiative descending', () => {
      const entries = [
        { id: '1', type: 'player', combatantId: '1', initiative: 3, name: 'Low' },
        { id: '2', type: 'enemy', combatantId: '2', initiative: 6, name: 'High' },
        { id: '3', type: 'player', combatantId: '3', initiative: 5, name: 'Mid' },
      ];
      
      const sorted = sortInitiative(entries);
      
      expect(sorted[0].name).toBe('High');
      expect(sorted[1].name).toBe('Mid');
      expect(sorted[2].name).toBe('Low');
    });

    it('should break ties with Grace stat', () => {
      const player1 = createPlayer({ attributes: { grace: 5 } });
      const player2 = createPlayer({ attributes: { grace: 3 } });
      
      const entries = [
        { id: '1', type: 'player', combatantId: player1.id, initiative: 4, name: 'High Grace' },
        { id: '2', type: 'player', combatantId: player2.id, initiative: 4, name: 'Low Grace' },
      ];
      
      const sorted = sortInitiative(entries, [player1, player2]);
      
      expect(sorted[0].name).toBe('High Grace');
    });
  });

  describe('resolveAttack', () => {
    it('should hit when attack > defense', async () => {
      mockDice([5, 4], [2, 1]); // Attack 9, Defense 3
      
      const result = await resolveAttack(attacker, defender, combat.id);
      
      expect(result.hit).toBe(true);
    });

    it('should miss when attack <= defense', async () => {
      mockDice([2, 1], [5, 4]); // Attack 3, Defense 9
      
      const result = await resolveAttack(attacker, defender, combat.id);
      
      expect(result.hit).toBe(false);
      expect(result.damage).toBe(0);
    });

    it('should calculate damage with weapon', async () => {
      mockDice([5, 4], [2, 1]); // Hit
      attacker.character.equipment = [{ type: 'weapon', damage: 2 }];
      
      const result = await resolveAttack(attacker, defender, combat.id);
      
      expect(result.damage).toBe(2);
    });

    it('should double damage on critical hit', async () => {
      mockDice([6, 6, 6], [2, 1]); // Critical hit
      attacker.character.equipment = [{ type: 'weapon', damage: 2 }];
      
      const result = await resolveAttack(attacker, defender, combat.id);
      
      expect(result.critical).toBe(true);
      expect(result.damage).toBe(4);
    });
  });

  describe('nextTurn', () => {
    it('should advance to next combatant', async () => {
      const combat = await createCombatWithOrder(['player1', 'enemy1', 'player2']);
      expect(combat.currentTurnIndex).toBe(0);
      
      await CombatEngine.nextTurn(combat.id);
      const updated = await getCombat(combat.id);
      
      expect(updated.currentTurnIndex).toBe(1);
    });

    it('should wrap around and increment round', async () => {
      const combat = await createCombatWithOrder(['player1', 'enemy1']);
      combat.currentTurnIndex = 1; // Last turn
      
      await CombatEngine.nextTurn(combat.id);
      const updated = await getCombat(combat.id);
      
      expect(updated.currentTurnIndex).toBe(0);
      expect(updated.roundNumber).toBe(2);
    });

    it('should skip dead combatants', async () => {
      const combat = await createCombatWithOrder(['player1', 'enemy1', 'player2']);
      combat.enemyCombatants[0].currentHitPoints = 0; // Enemy dead
      
      await CombatEngine.nextTurn(combat.id);
      const updated = await getCombat(combat.id);
      
      expect(updated.currentTurnIndex).toBe(2); // Skipped enemy
    });

    it('should reset hasActed on new round', async () => {
      const combat = await createCombatWithOrder(['player1', 'enemy1']);
      combat.playerCombatants[0].hasActed = true;
      combat.enemyCombatants[0].hasActed = true;
      combat.currentTurnIndex = 1;
      
      await CombatEngine.nextTurn(combat.id);
      const updated = await getCombat(combat.id);
      
      expect(updated.playerCombatants[0].hasActed).toBe(false);
      expect(updated.enemyCombatants[0].hasActed).toBe(false);
    });
  });

  describe('checkCombatEnd', () => {
    it('should return victory when all enemies dead', async () => {
      const combat = await createCombat();
      combat.enemyCombatants.forEach(e => e.currentHitPoints = 0);
      
      const outcome = await CombatEngine.checkEnd(combat);
      
      expect(outcome.type).toBe('victory');
    });

    it('should return defeat when all players dead', async () => {
      const combat = await createCombat();
      combat.playerCombatants.forEach(p => p.character.currentHitPoints = 0);
      
      const outcome = await CombatEngine.checkEnd(combat);
      
      expect(outcome.type).toBe('defeat');
    });

    it('should return null when combat continues', async () => {
      const combat = await createCombat();
      
      const outcome = await CombatEngine.checkEnd(combat);
      
      expect(outcome).toBeNull();
    });
  });
});
```

### Integration Tests

```typescript
describe('Combat API', () => {
  describe('POST /api/v1/combat/start', () => {
    it('should start combat as Seer', async () => {
      const response = await request(app)
        .post('/api/v1/combat/start')
        .set('Authorization', `Bearer ${seerToken}`)
        .send({
          sessionId: session.id,
          nodeId: combatNode.id,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.isActive).toBe(true);
      expect(response.body.data.playerCombatants).toHaveLength(session.players.length);
    });

    it('should reject non-Seer start', async () => {
      const response = await request(app)
        .post('/api/v1/combat/start')
        .set('Authorization', `Bearer ${playerToken}`)
        .send({
          sessionId: session.id,
          nodeId: combatNode.id,
        });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/v1/combat/:id/action', () => {
    it('should execute attack action', async () => {
      const combat = await startCombat();
      const player = combat.playerCombatants[0];
      const enemy = combat.enemyCombatants[0];

      const response = await request(app)
        .post(`/api/v1/combat/${combat.id}/action`)
        .set('Authorization', `Bearer ${playerToken}`)
        .send({
          combatantId: player.id,
          action: 'attack',
          targetId: enemy.id,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.actionResult.action).toBe('attack');
    });

    it('should reject action on wrong turn', async () => {
      const combat = await startCombat();
      // Assume first turn is not this player
      const wrongPlayer = combat.playerCombatants[1];

      const response = await request(app)
        .post(`/api/v1/combat/${combat.id}/action`)
        .set('Authorization', `Bearer ${wrongPlayerToken}`)
        .send({
          combatantId: wrongPlayer.id,
          action: 'attack',
          targetId: combat.enemyCombatants[0].id,
        });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('COMBAT_002');
    });

    it('should broadcast action to all players', async () => {
      const otherSocket = await connectPlayer(otherPlayer);
      const eventPromise = waitForEvent(otherSocket, 'combat_action');

      await request(app)
        .post(`/api/v1/combat/${combat.id}/action`)
        .set('Authorization', `Bearer ${playerToken}`)
        .send(validAction);

      const event = await eventPromise;
      expect(event.action).toBe('action_performed');
    });
  });
});
```

### E2E Tests

```typescript
describe('Combat E2E', () => {
  it('should complete full combat encounter', async () => {
    // Setup: Player in session at combat node
    await loginAsPlayer(page);
    await joinSession(page, sessionCode);
    await waitForCombatStart(page);

    // Verify combat UI appears
    await page.waitForSelector('[data-testid="combat-view"]');
    
    // Verify initiative order shown
    const turnOrder = await page.$$('[data-testid="initiative-entry"]');
    expect(turnOrder.length).toBeGreaterThan(0);

    // Wait for our turn
    await page.waitForSelector('[data-testid="your-turn-indicator"]');

    // Select attack
    await page.click('[data-testid="action-attack"]');
    
    // Select target
    await page.click('[data-testid="enemy-goblin-1"]');
    
    // Confirm attack
    await page.click('[data-testid="confirm-action"]');

    // Wait for dice animation
    await page.waitForSelector('[data-testid="dice-rolling"]');
    await page.waitForSelector('[data-testid="dice-result"]');

    // Verify combat log updated
    const logEntry = await page.waitForSelector('[data-testid="combat-log-entry"]');
    expect(logEntry).toBeTruthy();

    // Continue combat until victory/defeat
    // (Simplified - in real test would loop through turns)
  });

  it('should use heroic save on failed attack', async () => {
    await loginAsPlayer(page);
    await joinSession(page, sessionCode);
    await waitForCombatStart(page);
    await waitForOurTurn(page);

    // Mock a failing attack roll
    await mockFailingRoll();

    // Attack
    await page.click('[data-testid="action-attack"]');
    await page.click('[data-testid="enemy-goblin-1"]');
    await page.click('[data-testid="confirm-action"]');

    // Wait for failure result
    await page.waitForSelector('[data-testid="attack-missed"]');

    // Heroic save should be available
    const saveButton = await page.waitForSelector('[data-testid="heroic-save-button"]:not([disabled])');
    await saveButton.click();

    // Verify reroll animation
    await page.waitForSelector('[data-testid="heroic-save-animation"]');
    await page.waitForSelector('[data-testid="dice-result"]');

    // Verify save is now unavailable
    await page.waitForSelector('[data-testid="heroic-save-button"][disabled]');
  });
});
```

---

## Implementation Checklist

### Backend
- [ ] Create `combat_states` table
- [ ] Create `creatures` table with sample creatures
- [ ] Implement `POST /api/v1/combat/start`
- [ ] Implement `GET /api/v1/combat/:id`
- [ ] Implement `POST /api/v1/combat/:id/action`
- [ ] Implement `POST /api/v1/combat/:id/heroic-save`
- [ ] Implement `POST /api/v1/combat/:id/next-turn`
- [ ] Implement `POST /api/v1/combat/:id/end`
- [ ] Add initiative calculation
- [ ] Add attack resolution logic
- [ ] Add damage calculation
- [ ] Add death/defeat checking
- [ ] Add real-time event broadcasting
- [ ] Write unit tests
- [ ] Write integration tests

### Frontend
- [ ] Create `CombatService` API client
- [ ] Create `useCombat` hook
- [ ] Build combat view container
- [ ] Build initiative tracker component
- [ ] Build combatant card component
- [ ] Build action selection UI
- [ ] Build target selection UI
- [ ] Build combat log component
- [ ] Build Heroic Save prompt
- [ ] Add combat animations
- [ ] Subscribe to combat events
- [ ] Write E2E tests

---

## Appendix

### Sample Creatures

| Creature | HP | Attack | Defense | Damage | CR |
|----------|---:|-------:|--------:|-------:|---:|
| Goblin | 3 | 2 | 2 | 1 | 1 |
| Orc | 6 | 3 | 2 | 2 | 2 |
| Skeleton | 4 | 2 | 1 | 1 | 1 |
| Zombie | 8 | 2 | 1 | 2 | 2 |
| Wolf | 4 | 3 | 3 | 1 | 1 |
| Ogre | 12 | 4 | 2 | 3 | 4 |
| Troll | 15 | 4 | 3 | 4 | 5 |
| Dragon | 20 | 5 | 4 | 5 | 8 |

### Combat Duration Estimates

| Enemies | Players | Est. Rounds | Est. Time |
|--------:|--------:|------------:|----------:|
| 2 | 2 | 3-4 | 5-8 min |
| 3 | 3 | 4-5 | 8-12 min |
| 4 | 4 | 5-6 | 12-18 min |
| 5+ | 4+ | 6-8 | 15-25 min |
