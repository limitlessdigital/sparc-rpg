# PRD 01: Dice System

> **Status**: Ready for Implementation  
> **Priority**: P0 - Critical Path  
> **Estimated Effort**: 3 days  
> **Dependencies**: 17-database-schema

---

## Overview

The dice system is the core mechanic of SPARC RPG. All actions in the game—combat, skill checks, and challenges—are resolved using D6 (six-sided dice). This PRD defines the complete dice rolling system including dice pools, difficulty thresholds, modifiers, and the Heroic Save mechanic.

### Goals
- Provide a fast, fair, and transparent dice resolution system
- Support all game mechanics with a unified API
- Enable real-time synchronization across all players
- Deliver satisfying visual and audio feedback

### Non-Goals
- Custom dice types (D4, D8, D10, etc.)
- Complex modifier stacking rules
- Dice rolling outside of sessions

---

## User Stories

### US-01: Basic Dice Roll
**As a** player  
**I want to** roll dice for attribute checks  
**So that** I can attempt actions in the game

**Acceptance Criteria:**
- [ ] Player can initiate a roll via UI or Seer request
- [ ] Correct number of dice rolled based on attribute
- [ ] Results compared against difficulty threshold
- [ ] Success/failure clearly communicated
- [ ] Roll visible to all session participants in <100ms

### US-02: Dice Pool Calculation
**As a** player  
**I want to** roll the correct number of dice for my attributes  
**So that** my character's strengths are reflected in gameplay

**Acceptance Criteria:**
- [ ] Dice count equals attribute value (1-6)
- [ ] Equipment bonuses add to dice count
- [ ] Temporary buffs/debuffs modify dice count
- [ ] Minimum 1 die always rolled
- [ ] Maximum 10 dice (with bonuses)

### US-03: Modifiers
**As a** Seer  
**I want to** apply situational modifiers to rolls  
**So that** I can reflect environmental and story factors

**Acceptance Criteria:**
- [ ] Seer can add/remove dice before roll
- [ ] Seer can add flat bonus/penalty to result
- [ ] Modifier sources tracked and displayed
- [ ] Players see all modifiers affecting their roll

### US-04: Heroic Save
**As a** player  
**I want to** use my Heroic Save ability  
**So that** I can attempt to turn a failure into success

**Acceptance Criteria:**
- [ ] Each character has 1 Heroic Save per encounter
- [ ] Can only be used immediately after a failed roll
- [ ] Rerolls all dice with same parameters
- [ ] New result replaces original (even if worse)
- [ ] Usage tracked per encounter, resets after combat

### US-05: Roll History
**As a** Seer  
**I want to** view the history of all dice rolls  
**So that** I can verify results and track game progress

**Acceptance Criteria:**
- [ ] All rolls recorded with full details
- [ ] History filterable by character, type, time
- [ ] Exportable for session recap
- [ ] Stored for entire session lifetime

### US-06: Critical Results
**As a** player  
**I want to** be rewarded for exceptional rolls  
**So that** dice feel exciting and impactful

**Acceptance Criteria:**
- [ ] Critical Success: All dice show 6 (special narrative effect)
- [ ] Critical Failure: All dice show 1 (narrative complication)
- [ ] Visual/audio feedback distinct for criticals
- [ ] Seer notified of critical results

---

## Technical Specification

### Data Models

```typescript
// See ARCHITECTURE.md for full type definitions
// Key types used:

interface DiceRollRequest {
  sessionId: string;
  characterId: string;
  attribute: Attribute;           // might, grace, wit, heart
  diceCount: number;              // 1-10
  difficulty: number;             // 3-18
  rollType: RollType;
  modifiers?: RollModifier[];
  description?: string;
}

interface DiceRoll {
  id: string;
  sessionId: string;
  characterId: string;
  characterName: string;
  attribute: Attribute;
  diceCount: number;
  difficulty: number;
  rollType: RollType;
  modifiers: RollModifier[];
  results: number[];              // [4, 2, 6, 1]
  total: number;
  modifiedTotal: number;
  success: boolean;
  outcome: RollOutcome;           // critical_success, success, failure, critical_failure
  margin: number;
  description: string;
  timestamp: string;
  animationSeed?: number;
}
```

### API Endpoints

#### POST /api/v1/dice/roll

**Request:**
```typescript
interface RollDiceRequest {
  sessionId: string;              // Required
  characterId: string;            // Required
  attribute: Attribute;           // Required
  difficulty: number;             // Required, 3-18
  rollType: RollType;             // Required
  modifiers?: RollModifier[];     // Optional
  description?: string;           // Optional, max 200 chars
}
```

**Response (200 OK):**
```typescript
interface RollDiceResponse {
  success: true;
  data: {
    roll: DiceRoll;
    narrativeEffect?: string;     // AI-generated flavor (if enabled)
    triggerEffects?: EffectTrigger[];
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}
```

**Error Responses:**
- `400 Bad Request`: Invalid parameters
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not in session or not character owner
- `404 Not Found`: Session or character not found
- `422 Unprocessable Entity`: Character not in active session

#### POST /api/v1/dice/heroic-save

**Request:**
```typescript
interface HeroicSaveRequest {
  sessionId: string;
  characterId: string;
  originalRollId: string;
}
```

**Response (200 OK):**
```typescript
interface HeroicSaveResponse {
  success: true;
  data: {
    originalRoll: DiceRoll;
    newRoll: DiceRoll;
    heroicSavesRemaining: number;
  };
}
```

**Error Responses:**
- `400 Bad Request`: Invalid parameters
- `403 Forbidden`: Not character owner
- `409 Conflict`: Heroic Save already used this encounter
- `410 Gone`: Original roll too old (>30 seconds)

#### GET /api/v1/dice/history/{sessionId}

**Query Parameters:**
- `characterId` (optional): Filter by character
- `rollType` (optional): Filter by type
- `limit` (optional): Number of results (default 50, max 200)
- `offset` (optional): Pagination offset

**Response (200 OK):**
```typescript
interface DiceHistoryResponse {
  success: true;
  data: DiceRoll[];
  meta: {
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}
```

### Dice Rolling Algorithm

```typescript
// Core dice rolling logic

function rollDice(request: DiceRollRequest): DiceRoll {
  // 1. Calculate effective dice count
  const baseDice = request.diceCount;
  const bonusDice = request.modifiers
    ?.filter(m => m.type === 'dice')
    .reduce((sum, m) => sum + m.value, 0) ?? 0;
  
  const effectiveDice = Math.max(1, Math.min(10, baseDice + bonusDice));
  
  // 2. Generate random results
  const results: number[] = [];
  for (let i = 0; i < effectiveDice; i++) {
    results.push(cryptoRandomInt(1, 6));  // Cryptographically secure
  }
  
  // 3. Calculate totals
  const total = results.reduce((sum, r) => sum + r, 0);
  const flatBonus = request.modifiers
    ?.filter(m => m.type === 'flat')
    .reduce((sum, m) => sum + m.value, 0) ?? 0;
  const modifiedTotal = total + flatBonus;
  
  // 4. Determine outcome
  const success = modifiedTotal >= request.difficulty;
  const outcome = determineOutcome(results, success);
  const margin = modifiedTotal - request.difficulty;
  
  // 5. Generate animation seed for deterministic replay
  const animationSeed = Date.now();
  
  return {
    id: generateId(),
    sessionId: request.sessionId,
    characterId: request.characterId,
    characterName: '', // Hydrated from DB
    attribute: request.attribute,
    diceCount: effectiveDice,
    difficulty: request.difficulty,
    rollType: request.rollType,
    modifiers: request.modifiers ?? [],
    results,
    total,
    modifiedTotal,
    success,
    outcome,
    margin,
    description: request.description ?? '',
    timestamp: new Date().toISOString(),
    animationSeed,
  };
}

function determineOutcome(results: number[], success: boolean): RollOutcome {
  const allSame = results.every(r => r === results[0]);
  
  if (allSame && results[0] === 6) {
    return RollOutcome.CRITICAL_SUCCESS;
  }
  if (allSame && results[0] === 1) {
    return RollOutcome.CRITICAL_FAILURE;
  }
  return success ? RollOutcome.SUCCESS : RollOutcome.FAILURE;
}

function cryptoRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const randomBytes = crypto.getRandomValues(new Uint8Array(bytesNeeded));
  const randomValue = randomBytes.reduce((acc, byte) => (acc << 8) + byte, 0);
  return min + (randomValue % range);
}
```

### Data Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Player    │     │   Frontend  │     │   Backend   │     │  Database   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │  Click "Roll"     │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │                   │  POST /dice/roll  │                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │                   │  Validate request │
       │                   │                   │  - Session active?│
       │                   │                   │  - User in session?
       │                   │                   │  - Character valid?
       │                   │                   │                   │
       │                   │                   │  Generate roll    │
       │                   │                   │  - Random dice    │
       │                   │                   │  - Apply modifiers│
       │                   │                   │  - Calculate result
       │                   │                   │                   │
       │                   │                   │  INSERT dice_roll │
       │                   │                   │──────────────────>│
       │                   │                   │                   │
       │                   │                   │<──────────────────│
       │                   │                   │  Stored           │
       │                   │                   │                   │
       │                   │                   │  INSERT session_event
       │                   │                   │──────────────────>│
       │                   │                   │                   │
       │                   │                   │      Supabase Realtime
       │                   │                   │<══════════════════╪════╗
       │                   │<──────────────────│                   │    ║
       │                   │  DiceRoll response│                   │    ║
       │                   │                   │                   │    ║
       │<──────────────────│                   │                   │    ║
       │  Show result      │                   │                   │    ║
       │  + animation      │                   │                   │    ║
       │                   │                   │                   │    ║
       │                   │                   │                   │    ║
┌──────┴──────┐     ┌──────┴──────┐     ┌──────┴──────┐     ┌──────┴────╨─┐
│  Other      │<════│  Subscribe  │<════│             │<════│  Broadcast  │
│  Players    │     │  to events  │     │             │     │  to channel │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### Database Schema

```sql
CREATE TABLE dice_rolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES characters(id),
  character_name TEXT NOT NULL,
  
  -- Roll parameters
  attribute TEXT NOT NULL CHECK (attribute IN ('might', 'grace', 'wit', 'heart')),
  dice_count INTEGER NOT NULL CHECK (dice_count BETWEEN 1 AND 10),
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 3 AND 18),
  roll_type TEXT NOT NULL,
  modifiers JSONB NOT NULL DEFAULT '[]',
  
  -- Results
  results INTEGER[] NOT NULL,
  total INTEGER NOT NULL,
  modified_total INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('critical_success', 'success', 'failure', 'critical_failure')),
  margin INTEGER NOT NULL,
  
  -- Display
  description TEXT,
  animation_seed BIGINT,
  
  -- Meta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT valid_results CHECK (array_length(results, 1) = dice_count)
);

CREATE INDEX idx_dice_rolls_session ON dice_rolls(session_id);
CREATE INDEX idx_dice_rolls_character ON dice_rolls(character_id);
CREATE INDEX idx_dice_rolls_created ON dice_rolls(created_at DESC);

-- RLS Policy
ALTER TABLE dice_rolls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dice rolls visible to session participants"
ON dice_rolls FOR SELECT
USING (
  session_id IN (
    SELECT id FROM sessions WHERE seer_id = auth.uid()
    UNION
    SELECT session_id FROM session_players WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Players can create rolls for own characters"
ON dice_rolls FOR INSERT
WITH CHECK (
  character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  OR
  session_id IN (SELECT id FROM sessions WHERE seer_id = auth.uid())  -- Seer can roll for NPCs
);
```

### Performance Requirements

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Roll generation | <10ms | Server processing time |
| API response | <50ms | End-to-end latency |
| Real-time broadcast | <100ms | Time to all clients |
| Animation start | <150ms | From click to animation |
| Roll history query | <100ms | 50 results |

### Error Handling

```typescript
enum DiceErrorCode {
  INVALID_SESSION = 'DICE_001',
  INVALID_CHARACTER = 'DICE_002',
  NOT_IN_SESSION = 'DICE_003',
  SESSION_NOT_ACTIVE = 'DICE_004',
  INVALID_DICE_COUNT = 'DICE_005',
  INVALID_DIFFICULTY = 'DICE_006',
  HEROIC_SAVE_USED = 'DICE_007',
  HEROIC_SAVE_EXPIRED = 'DICE_008',
  ROLL_NOT_FOUND = 'DICE_009',
}

const diceErrors: Record<DiceErrorCode, { status: number; message: string }> = {
  [DiceErrorCode.INVALID_SESSION]: { 
    status: 404, 
    message: 'Session not found' 
  },
  [DiceErrorCode.INVALID_CHARACTER]: { 
    status: 404, 
    message: 'Character not found' 
  },
  [DiceErrorCode.NOT_IN_SESSION]: { 
    status: 403, 
    message: 'Character is not in this session' 
  },
  [DiceErrorCode.SESSION_NOT_ACTIVE]: { 
    status: 422, 
    message: 'Session is not active' 
  },
  [DiceErrorCode.INVALID_DICE_COUNT]: { 
    status: 400, 
    message: 'Dice count must be between 1 and 10' 
  },
  [DiceErrorCode.INVALID_DIFFICULTY]: { 
    status: 400, 
    message: 'Difficulty must be between 3 and 18' 
  },
  [DiceErrorCode.HEROIC_SAVE_USED]: { 
    status: 409, 
    message: 'Heroic Save already used this encounter' 
  },
  [DiceErrorCode.HEROIC_SAVE_EXPIRED]: { 
    status: 410, 
    message: 'Can only use Heroic Save within 30 seconds of original roll' 
  },
  [DiceErrorCode.ROLL_NOT_FOUND]: { 
    status: 404, 
    message: 'Original roll not found' 
  },
};
```

---

## Testing Requirements

### Unit Tests

```typescript
describe('DiceRoller', () => {
  describe('rollDice', () => {
    it('should generate correct number of dice', () => {
      const result = rollDice({ diceCount: 4, difficulty: 12, ...baseRequest });
      expect(result.results).toHaveLength(4);
    });

    it('should respect minimum dice count of 1', () => {
      const result = rollDice({ 
        diceCount: 2, 
        modifiers: [{ type: 'dice', value: -5, source: 'test' }],
        ...baseRequest 
      });
      expect(result.diceCount).toBe(1);
    });

    it('should respect maximum dice count of 10', () => {
      const result = rollDice({ 
        diceCount: 6, 
        modifiers: [{ type: 'dice', value: 10, source: 'test' }],
        ...baseRequest 
      });
      expect(result.diceCount).toBe(10);
    });

    it('should calculate total correctly', () => {
      // Mock random to return [3, 4, 5]
      jest.spyOn(global, 'crypto', 'get').mockReturnValue(mockCrypto([3, 4, 5]));
      const result = rollDice({ diceCount: 3, difficulty: 10, ...baseRequest });
      expect(result.total).toBe(12);
    });

    it('should apply flat modifiers to total', () => {
      jest.spyOn(global, 'crypto', 'get').mockReturnValue(mockCrypto([2, 2]));
      const result = rollDice({ 
        diceCount: 2, 
        difficulty: 10,
        modifiers: [{ type: 'flat', value: 3, source: 'test' }],
        ...baseRequest 
      });
      expect(result.total).toBe(4);
      expect(result.modifiedTotal).toBe(7);
    });

    it('should detect critical success (all 6s)', () => {
      jest.spyOn(global, 'crypto', 'get').mockReturnValue(mockCrypto([6, 6, 6]));
      const result = rollDice({ diceCount: 3, difficulty: 15, ...baseRequest });
      expect(result.outcome).toBe(RollOutcome.CRITICAL_SUCCESS);
    });

    it('should detect critical failure (all 1s)', () => {
      jest.spyOn(global, 'crypto', 'get').mockReturnValue(mockCrypto([1, 1]));
      const result = rollDice({ diceCount: 2, difficulty: 8, ...baseRequest });
      expect(result.outcome).toBe(RollOutcome.CRITICAL_FAILURE);
    });

    it('should determine success based on difficulty', () => {
      jest.spyOn(global, 'crypto', 'get').mockReturnValue(mockCrypto([3, 4, 5]));
      const result = rollDice({ diceCount: 3, difficulty: 12, ...baseRequest });
      expect(result.success).toBe(true);
      expect(result.margin).toBe(0);
    });

    it('should calculate margin correctly', () => {
      jest.spyOn(global, 'crypto', 'get').mockReturnValue(mockCrypto([6, 5, 4]));
      const result = rollDice({ diceCount: 3, difficulty: 10, ...baseRequest });
      expect(result.margin).toBe(5); // 15 - 10
    });
  });

  describe('heroicSave', () => {
    it('should reroll same parameters as original', async () => {
      const original = await rollDice(request);
      const save = await heroicSave(original.id, character.id);
      expect(save.newRoll.diceCount).toBe(original.diceCount);
      expect(save.newRoll.difficulty).toBe(original.difficulty);
    });

    it('should reject if save already used this encounter', async () => {
      await heroicSave(roll1.id, character.id);
      await expect(heroicSave(roll2.id, character.id))
        .rejects.toThrow(DiceErrorCode.HEROIC_SAVE_USED);
    });

    it('should reject if original roll is too old', async () => {
      // Roll from 60 seconds ago
      await expect(heroicSave(oldRoll.id, character.id))
        .rejects.toThrow(DiceErrorCode.HEROIC_SAVE_EXPIRED);
    });
  });
});
```

### Integration Tests

```typescript
describe('Dice API', () => {
  describe('POST /api/v1/dice/roll', () => {
    it('should create a dice roll for valid request', async () => {
      const response = await request(app)
        .post('/api/v1/dice/roll')
        .set('Authorization', `Bearer ${playerToken}`)
        .send({
          sessionId: activeSession.id,
          characterId: playerCharacter.id,
          attribute: 'might',
          difficulty: 12,
          rollType: 'attribute_check',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.roll.results).toHaveLength(playerCharacter.attributes.might);
    });

    it('should reject roll for inactive session', async () => {
      const response = await request(app)
        .post('/api/v1/dice/roll')
        .set('Authorization', `Bearer ${playerToken}`)
        .send({
          sessionId: completedSession.id,
          characterId: playerCharacter.id,
          attribute: 'might',
          difficulty: 12,
          rollType: 'attribute_check',
        });

      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe('DICE_004');
    });

    it('should broadcast roll to all session participants', async () => {
      const otherPlayerSocket = await connectToSession(otherPlayer, session.id);
      const rollPromise = waitForEvent(otherPlayerSocket, 'dice_roll');

      await request(app)
        .post('/api/v1/dice/roll')
        .set('Authorization', `Bearer ${playerToken}`)
        .send(validRollRequest);

      const event = await rollPromise;
      expect(event.characterName).toBe(playerCharacter.name);
    });
  });

  describe('GET /api/v1/dice/history/:sessionId', () => {
    it('should return rolls for session participant', async () => {
      const response = await request(app)
        .get(`/api/v1/dice/history/${session.id}`)
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should reject for non-participant', async () => {
      const response = await request(app)
        .get(`/api/v1/dice/history/${session.id}`)
        .set('Authorization', `Bearer ${outsiderToken}`);

      expect(response.status).toBe(403);
    });
  });
});
```

### E2E Tests

```typescript
describe('Dice Rolling E2E', () => {
  it('complete dice roll flow with animation', async () => {
    // Setup: Player in active session
    await page.goto(`/session/${session.code}`);
    await page.waitForSelector('[data-testid="game-board"]');

    // Trigger roll
    await page.click('[data-testid="roll-might-button"]');

    // Verify animation plays
    await page.waitForSelector('[data-testid="dice-animation"]');
    const diceElements = await page.$$('[data-testid="die"]');
    expect(diceElements.length).toBeGreaterThan(0);

    // Wait for result
    await page.waitForSelector('[data-testid="roll-result"]');
    const result = await page.textContent('[data-testid="roll-result"]');
    expect(result).toMatch(/Success|Failure/);

    // Verify appears in history
    await page.click('[data-testid="roll-history-toggle"]');
    const historyEntry = await page.waitForSelector('[data-testid="roll-history-entry"]');
    expect(historyEntry).toBeTruthy();
  });

  it('heroic save reroll flow', async () => {
    // Make a failing roll (mocked)
    await mockFailingRoll();
    await page.click('[data-testid="roll-might-button"]');
    await page.waitForSelector('[data-testid="roll-result-failure"]');

    // Use heroic save
    const saveButton = await page.waitForSelector('[data-testid="heroic-save-button"]');
    expect(saveButton).not.toBeDisabled();
    await saveButton.click();

    // Verify reroll animation
    await page.waitForSelector('[data-testid="heroic-save-animation"]');
    await page.waitForSelector('[data-testid="roll-result"]');

    // Verify heroic save now unavailable
    const disabledSaveButton = await page.$('[data-testid="heroic-save-button"][disabled]');
    expect(disabledSaveButton).toBeTruthy();
  });
});
```

---

## Implementation Checklist

### Backend
- [ ] Create `dice_rolls` table with schema
- [ ] Implement `POST /api/v1/dice/roll` endpoint
- [ ] Implement `POST /api/v1/dice/heroic-save` endpoint
- [ ] Implement `GET /api/v1/dice/history/:sessionId` endpoint
- [ ] Add real-time event publishing on roll
- [ ] Add Heroic Save tracking per encounter
- [ ] Add comprehensive input validation
- [ ] Add error handling with codes
- [ ] Write unit tests (>90% coverage)
- [ ] Write integration tests

### Frontend
- [ ] Create `DiceRoller` service class
- [ ] Create `useDice` hook for components
- [ ] Create dice roll UI component (see PRD-07)
- [ ] Subscribe to dice events via Supabase Realtime
- [ ] Add roll history panel
- [ ] Add Heroic Save button with state
- [ ] Handle error states gracefully

---

## Appendix

### Difficulty Guidelines

| Difficulty | Description | Example |
|------------|-------------|---------|
| 3-5 | Trivial | Walking across a room |
| 6-8 | Easy | Climbing a ladder |
| 9-11 | Moderate | Picking a simple lock |
| 12-14 | Hard | Leaping across a chasm |
| 15-17 | Very Hard | Persuading a hostile guard |
| 18 | Nearly Impossible | Catching an arrow mid-flight |

### Roll Type Reference

| Type | Description | Used In |
|------|-------------|---------|
| `attribute_check` | General ability test | Challenges, exploration |
| `attack` | Offensive combat roll | Combat |
| `defense` | Defensive combat roll | Combat |
| `initiative` | Turn order determination | Combat start |
| `damage` | Damage calculation | Combat |
| `healing` | HP restoration | Abilities, items |
| `ability` | Special ability use | Various |
| `heroic_save` | Reroll attempt | After failure |
