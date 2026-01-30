# PRD 04: Session Management

> **Status**: Ready for Implementation  
> **Priority**: P0 - Critical Path  
> **Estimated Effort**: 4 days  
> **Dependencies**: 17-database-schema, 18-authentication

---

## Overview

Session management handles the lifecycle of game sessions—from creation through completion. A session represents a single playthrough of an adventure by a Seer and their players. This system manages joining, game state, player connections, and session persistence.

### Goals
- Enable quick session creation and player joining
- Support pause/resume for sessions interrupted mid-game
- Track game state accurately throughout play
- Handle player disconnections gracefully
- Provide real-time synchronization for all participants

### Non-Goals
- Voice/video chat integration (external tools)
- Scheduled sessions (calendar integration)
- Session recording/replay

---

## User Stories

### US-01: Create Session
**As a** Seer  
**I want to** start a new game session  
**So that** players can join and play

**Acceptance Criteria:**
- [ ] Select adventure from my library or community
- [ ] Configure session settings
- [ ] Receive unique 6-character join code
- [ ] Session appears in "waiting" state
- [ ] Can share join code/link with players

### US-02: Join Session
**As a** player  
**I want to** join a session with a code  
**So that** I can play with my group

**Acceptance Criteria:**
- [ ] Enter 6-character code on join page
- [ ] Select from my available characters
- [ ] Join session lobby
- [ ] See other players who have joined
- [ ] Cannot join if session full or started

### US-03: Session Lobby
**As a** participant  
**I want to** see who's in the lobby  
**So that** I know when we're ready to start

**Acceptance Criteria:**
- [ ] See all joined players with characters
- [ ] See Seer information
- [ ] See adventure title/description
- [ ] Players can leave before start
- [ ] Seer can kick players
- [ ] Real-time updates as players join/leave

### US-04: Start Game
**As a** Seer  
**I want to** start the session  
**So that** gameplay can begin

**Acceptance Criteria:**
- [ ] Can only start with minimum players (1)
- [ ] Warning shown for suboptimal party size
- [ ] All players notified of game start
- [ ] Adventure first node displayed
- [ ] Session status changes to "active"

### US-05: Pause/Resume
**As a** Seer  
**I want to** pause an active session  
**So that** we can take a break and continue later

**Acceptance Criteria:**
- [ ] Pause button available during active session
- [ ] All players notified of pause
- [ ] Game state fully preserved
- [ ] Can resume from exact position
- [ ] Paused sessions don't timeout

### US-06: End Session
**As a** Seer  
**I want to** end a session  
**So that** we can conclude the game

**Acceptance Criteria:**
- [ ] Can end as "completed" or "cancelled"
- [ ] Final stats shown to all players
- [ ] Experience/rewards distributed
- [ ] Session archived for history
- [ ] Players can leave feedback (optional)

### US-07: Handle Disconnection
**As a** participant  
**I want** disconnections handled gracefully  
**So that** the game isn't ruined by technical issues

**Acceptance Criteria:**
- [ ] Brief disconnections auto-reconnect
- [ ] Other players see "reconnecting" status
- [ ] Game continues with Seer control of disconnected character
- [ ] Player can rejoin within timeout (5 min)
- [ ] Extended absence prompts Seer to kick or wait

---

## Technical Specification

### Data Models

```typescript
// Core session types (see ARCHITECTURE.md)

interface Session {
  id: string;
  code: string;                   // 6-char alphanumeric, uppercase
  seerId: string;
  seerName: string;
  adventureId: string;
  adventureName: string;
  
  status: SessionStatus;          // waiting | active | paused | completed | cancelled
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
  
  settings: SessionSettings;
}

interface SessionPlayer {
  id: string;
  sessionId: string;
  userId: string;
  characterId: string;
  character?: Character;          // Hydrated on fetch
  joinedAt: string;
  isConnected: boolean;
  lastActivityAt: string;
}

interface SessionSettings {
  allowLateJoin: boolean;         // Default: false
  showDiceRolls: boolean;         // Default: true
  autoResolveSimpleCombat: boolean; // Default: false
  enableAISeer: boolean;          // Default: true
  voiceChatEnabled: boolean;      // Default: false (external)
}

interface GameState {
  inventory: InventoryItem[];
  variables: Record<string, string | number | boolean>;
  combatState?: CombatState;
  turnHistory: TurnHistoryEntry[];
  flags: string[];
}
```

### Join Code Generation

```typescript
// Generate unique 6-character join code
function generateJoinCode(): string {
  // Characters that are easy to read and type (no 0/O, 1/I/L confusion)
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = crypto.getRandomValues(new Uint8Array(1))[0] % chars.length;
    code += chars[randomIndex];
  }
  
  return code;
}

// Validate code format
function isValidJoinCode(code: string): boolean {
  return /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/.test(code.toUpperCase());
}
```

### Session State Machine

```
                    ┌─────────────────────────────────────────────────┐
                    │                                                 │
                    ▼                                                 │
    ┌─────────┐   Start   ┌─────────┐   Complete   ┌───────────┐    │
    │ WAITING │ ─────────>│ ACTIVE  │ ────────────>│ COMPLETED │    │
    └─────────┘           └─────────┘              └───────────┘    │
         │                     │                                     │
         │ Cancel              │ Pause                               │
         │                     ▼                                     │
         │                ┌─────────┐   Resume                       │
         │                │ PAUSED  │ ───────────────────────────────┘
         │                └─────────┘
         │                     │
         │ Cancel              │ Cancel
         │                     │
         ▼                     ▼
    ┌───────────┐        ┌───────────┐
    │ CANCELLED │        │ CANCELLED │
    └───────────┘        └───────────┘

Valid Transitions:
  WAITING -> ACTIVE (start)
  WAITING -> CANCELLED (cancel)
  ACTIVE -> PAUSED (pause)
  ACTIVE -> COMPLETED (complete)
  ACTIVE -> CANCELLED (cancel)
  PAUSED -> ACTIVE (resume)
  PAUSED -> CANCELLED (cancel)
```

### API Endpoints

#### POST /api/v1/sessions

Create a new session.

**Request:**
```typescript
interface CreateSessionRequest {
  adventureId: string;
  settings?: Partial<SessionSettings>;
  maxPlayers?: number;            // 1-6, default 6
}
```

**Response (201 Created):**
```typescript
interface CreateSessionResponse {
  success: true;
  data: {
    session: Session;
    joinUrl: string;              // Full URL with code
  };
}
```

**Validation:**
- Adventure must exist and be accessible
- User becomes Seer for this session

#### GET /api/v1/sessions/:id

Get session details.

**Response (200 OK):**
```typescript
interface GetSessionResponse {
  success: true;
  data: Session;
}
```

**Access Control:**
- Seer can view any state
- Players can view if they're in session
- Public can view waiting sessions (for join flow)

#### GET /api/v1/sessions/code/:code

Lookup session by join code.

**Response (200 OK):**
```typescript
interface GetSessionByCodeResponse {
  success: true;
  data: {
    session: Session;
    canJoin: boolean;
    reason?: string;              // Why can't join
  };
}
```

#### POST /api/v1/sessions/:id/join

Join a session as a player.

**Request:**
```typescript
interface JoinSessionRequest {
  characterId: string;
}
```

**Response (200 OK):**
```typescript
interface JoinSessionResponse {
  success: true;
  data: {
    player: SessionPlayer;
    session: Session;
  };
}
```

**Validation:**
- Session must be in WAITING status (or ACTIVE if allowLateJoin)
- Session not at maxPlayers
- Character belongs to user
- Character not already in another active session
- User not already in this session

#### POST /api/v1/sessions/:id/leave

Leave a session.

**Response (200 OK):**
```typescript
interface LeaveSessionResponse {
  success: true;
  data: { left: true };
}
```

**Behavior:**
- WAITING: Player removed immediately
- ACTIVE: Player marked disconnected, character controllable by Seer
- Seer cannot leave (must end session)

#### POST /api/v1/sessions/:id/kick

Kick a player (Seer only).

**Request:**
```typescript
interface KickPlayerRequest {
  playerId: string;
  reason?: string;
}
```

**Response (200 OK):**
```typescript
interface KickPlayerResponse {
  success: true;
  data: { kicked: true };
}
```

#### POST /api/v1/sessions/:id/start

Start the session (Seer only).

**Response (200 OK):**
```typescript
interface StartSessionResponse {
  success: true;
  data: Session;
}
```

**Validation:**
- Session in WAITING status
- At least minPlayers joined

#### POST /api/v1/sessions/:id/pause

Pause the session (Seer only).

**Response (200 OK):**
```typescript
interface PauseSessionResponse {
  success: true;
  data: Session;
}
```

#### POST /api/v1/sessions/:id/resume

Resume a paused session (Seer only).

**Response (200 OK):**
```typescript
interface ResumeSessionResponse {
  success: true;
  data: Session;
}
```

#### POST /api/v1/sessions/:id/end

End the session (Seer only).

**Request:**
```typescript
interface EndSessionRequest {
  outcome: 'completed' | 'cancelled';
  notes?: string;
}
```

**Response (200 OK):**
```typescript
interface EndSessionResponse {
  success: true;
  data: {
    session: Session;
    stats: SessionStats;
  };
}

interface SessionStats {
  durationMinutes: number;
  nodesVisited: number;
  diceRolled: number;
  combatsCompleted: number;
  experienceEarned: number;
}
```

#### GET /api/v1/sessions/:id/state

Get current game state.

**Response (200 OK):**
```typescript
interface GetGameStateResponse {
  success: true;
  data: GameState;
}
```

#### PATCH /api/v1/sessions/:id/state

Update game state (Seer only).

**Request:**
```typescript
interface UpdateGameStateRequest {
  currentNodeId?: string;
  addInventory?: InventoryItem[];
  removeInventory?: string[];
  setVariables?: Record<string, unknown>;
  addFlags?: string[];
  removeFlags?: string[];
}
```

**Response (200 OK):**
```typescript
interface UpdateGameStateResponse {
  success: true;
  data: GameState;
}
```

### Database Schema

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  seer_id UUID NOT NULL REFERENCES auth.users(id),
  seer_name TEXT NOT NULL,
  adventure_id UUID NOT NULL REFERENCES adventures(id),
  adventure_name TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'paused', 'completed', 'cancelled')),
  
  -- Limits
  max_players INTEGER NOT NULL DEFAULT 6 CHECK (max_players BETWEEN 1 AND 6),
  min_players INTEGER NOT NULL DEFAULT 1 CHECK (min_players >= 1),
  
  -- Game state
  current_node_id UUID,
  visited_node_ids UUID[] NOT NULL DEFAULT '{}',
  game_state JSONB NOT NULL DEFAULT '{"inventory": [], "variables": {}, "turnHistory": [], "flags": []}',
  
  -- Timing
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_duration_minutes INTEGER NOT NULL DEFAULT 60,
  
  -- Settings
  settings JSONB NOT NULL DEFAULT '{"allowLateJoin": false, "showDiceRolls": true, "autoResolveSimpleCombat": false, "enableAISeer": true}'
);

CREATE TABLE session_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  character_id UUID NOT NULL REFERENCES characters(id),
  
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  is_connected BOOLEAN NOT NULL DEFAULT true,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  kick_reason TEXT,
  
  -- One character per session per user
  CONSTRAINT unique_user_per_session UNIQUE (session_id, user_id),
  -- One character can only be in one active session
  CONSTRAINT unique_character_active UNIQUE (character_id) WHERE left_at IS NULL
);

-- Indexes
CREATE INDEX idx_sessions_code ON sessions(code);
CREATE INDEX idx_sessions_seer ON sessions(seer_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_active ON sessions(status) WHERE status IN ('waiting', 'active', 'paused');

CREATE INDEX idx_session_players_session ON session_players(session_id);
CREATE INDEX idx_session_players_user ON session_players(user_id);
CREATE INDEX idx_session_players_active ON session_players(session_id) WHERE left_at IS NULL;

-- RLS Policies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_players ENABLE ROW LEVEL SECURITY;

-- Anyone can view waiting sessions (for join)
CREATE POLICY "Public can view waiting sessions"
ON sessions FOR SELECT
USING (status = 'waiting');

-- Participants can view their sessions
CREATE POLICY "Participants can view sessions"
ON sessions FOR SELECT
USING (
  seer_id = auth.uid() OR
  id IN (SELECT session_id FROM session_players WHERE user_id = auth.uid() AND left_at IS NULL)
);

-- Only Seer can modify session
CREATE POLICY "Seer can modify session"
ON sessions FOR UPDATE
USING (seer_id = auth.uid());

-- Players can join sessions
CREATE POLICY "Players can join sessions"
ON session_players FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Players can update their own status
CREATE POLICY "Players can update own status"
ON session_players FOR UPDATE
USING (user_id = auth.uid());
```

### Real-Time Events

```typescript
// Session events broadcast to all participants

interface SessionEventPayload {
  sessionId: string;
  timestamp: string;
}

// Player joined
interface PlayerJoinedEvent extends SessionEventPayload {
  type: 'player_joined';
  player: SessionPlayer;
}

// Player left
interface PlayerLeftEvent extends SessionEventPayload {
  type: 'player_left';
  playerId: string;
  reason: 'left' | 'kicked' | 'disconnected';
}

// Player connection status
interface PlayerConnectionEvent extends SessionEventPayload {
  type: 'player_connection';
  playerId: string;
  isConnected: boolean;
}

// Session status change
interface SessionStatusEvent extends SessionEventPayload {
  type: 'session_status';
  oldStatus: SessionStatus;
  newStatus: SessionStatus;
}

// Game state update
interface GameStateEvent extends SessionEventPayload {
  type: 'game_state';
  changes: Partial<GameState>;
}

// Node navigation
interface NodeChangeEvent extends SessionEventPayload {
  type: 'node_change';
  nodeId: string;
  nodeType: NodeType;
  nodeTitle: string;
}
```

### Connection Handling

```typescript
// Client-side connection management

class SessionConnection {
  private supabase: SupabaseClient;
  private channel: RealtimeChannel | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: NodeJS.Timer | null = null;
  
  constructor(private sessionId: string, private userId: string) {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  
  async connect(): Promise<void> {
    this.channel = this.supabase
      .channel(`session:${this.sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${this.sessionId}`,
      }, this.handleSessionChange.bind(this))
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'session_players',
        filter: `session_id=eq.${this.sessionId}`,
      }, this.handlePlayerChange.bind(this))
      .on('presence', { event: 'sync' }, this.handlePresenceSync.bind(this))
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await this.channel?.track({ 
            user_id: this.userId,
            online_at: new Date().toISOString(),
          });
          this.startHeartbeat();
          this.reconnectAttempts = 0;
        }
      });
  }
  
  private startHeartbeat(): void {
    // Send heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(async () => {
      await this.updateActivity();
    }, 30000);
  }
  
  private async updateActivity(): Promise<void> {
    await this.supabase
      .from('session_players')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('session_id', this.sessionId)
      .eq('user_id', this.userId);
  }
  
  async disconnect(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    await this.channel?.unsubscribe();
    this.channel = null;
  }
  
  private async handleDisconnect(): Promise<void> {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      await new Promise(resolve => setTimeout(resolve, delay));
      await this.connect();
    } else {
      // Max attempts reached, notify user
      this.onMaxReconnectFailed?.();
    }
  }
  
  // Event handlers
  onPlayerJoined?: (player: SessionPlayer) => void;
  onPlayerLeft?: (playerId: string, reason: string) => void;
  onSessionStatusChange?: (status: SessionStatus) => void;
  onGameStateChange?: (state: GameState) => void;
  onMaxReconnectFailed?: () => void;
}
```

### Error Handling

```typescript
enum SessionErrorCode {
  SESSION_NOT_FOUND = 'SESSION_001',
  INVALID_JOIN_CODE = 'SESSION_002',
  SESSION_FULL = 'SESSION_003',
  SESSION_STARTED = 'SESSION_004',
  SESSION_NOT_WAITING = 'SESSION_005',
  NOT_IN_SESSION = 'SESSION_006',
  NOT_SEER = 'SESSION_007',
  ALREADY_IN_SESSION = 'SESSION_008',
  CHARACTER_IN_SESSION = 'SESSION_009',
  INVALID_STATUS_TRANSITION = 'SESSION_010',
  MIN_PLAYERS_NOT_MET = 'SESSION_011',
  SEER_CANNOT_LEAVE = 'SESSION_012',
  ADVENTURE_NOT_FOUND = 'SESSION_013',
}

const sessionErrors: Record<SessionErrorCode, { status: number; message: string }> = {
  [SessionErrorCode.SESSION_NOT_FOUND]: {
    status: 404,
    message: 'Session not found',
  },
  [SessionErrorCode.INVALID_JOIN_CODE]: {
    status: 400,
    message: 'Invalid session code format',
  },
  [SessionErrorCode.SESSION_FULL]: {
    status: 422,
    message: 'Session is full',
  },
  [SessionErrorCode.SESSION_STARTED]: {
    status: 422,
    message: 'Session has already started',
  },
  [SessionErrorCode.SESSION_NOT_WAITING]: {
    status: 422,
    message: 'Session is not in waiting state',
  },
  [SessionErrorCode.NOT_IN_SESSION]: {
    status: 403,
    message: 'You are not in this session',
  },
  [SessionErrorCode.NOT_SEER]: {
    status: 403,
    message: 'Only the Seer can perform this action',
  },
  [SessionErrorCode.ALREADY_IN_SESSION]: {
    status: 409,
    message: 'You are already in this session',
  },
  [SessionErrorCode.CHARACTER_IN_SESSION]: {
    status: 409,
    message: 'This character is already in another session',
  },
  [SessionErrorCode.INVALID_STATUS_TRANSITION]: {
    status: 422,
    message: 'Invalid session status transition',
  },
  [SessionErrorCode.MIN_PLAYERS_NOT_MET]: {
    status: 422,
    message: 'Minimum player count not met',
  },
  [SessionErrorCode.SEER_CANNOT_LEAVE]: {
    status: 422,
    message: 'Seer cannot leave session. End it instead.',
  },
  [SessionErrorCode.ADVENTURE_NOT_FOUND]: {
    status: 404,
    message: 'Adventure not found',
  },
};
```

---

## Testing Requirements

### Unit Tests

```typescript
describe('SessionService', () => {
  describe('createSession', () => {
    it('should create session with unique code', async () => {
      const session = await SessionService.create({
        seerId: user.id,
        adventureId: adventure.id,
      });

      expect(session.code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/);
      expect(session.status).toBe('waiting');
      expect(session.seerId).toBe(user.id);
    });

    it('should generate non-colliding codes', async () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const session = await SessionService.create({
          seerId: user.id,
          adventureId: adventure.id,
        });
        expect(codes.has(session.code)).toBe(false);
        codes.add(session.code);
      }
    });
  });

  describe('joinSession', () => {
    it('should add player to waiting session', async () => {
      const session = await createWaitingSession();
      const player = await SessionService.join(session.id, user.id, character.id);

      expect(player.sessionId).toBe(session.id);
      expect(player.characterId).toBe(character.id);
    });

    it('should reject join when session full', async () => {
      const session = await createFullSession();

      await expect(
        SessionService.join(session.id, newUser.id, newCharacter.id)
      ).rejects.toThrow(SessionErrorCode.SESSION_FULL);
    });

    it('should reject character already in session', async () => {
      const session1 = await createSessionWithPlayer(character);
      const session2 = await createWaitingSession();

      await expect(
        SessionService.join(session2.id, user.id, character.id)
      ).rejects.toThrow(SessionErrorCode.CHARACTER_IN_SESSION);
    });
  });

  describe('status transitions', () => {
    it('should allow waiting -> active', async () => {
      const session = await createSessionWithPlayers(2);
      
      const started = await SessionService.start(session.id, seer.id);
      
      expect(started.status).toBe('active');
      expect(started.startedAt).toBeDefined();
    });

    it('should allow active -> paused -> active', async () => {
      const session = await createActiveSession();
      
      const paused = await SessionService.pause(session.id, seer.id);
      expect(paused.status).toBe('paused');
      
      const resumed = await SessionService.resume(session.id, seer.id);
      expect(resumed.status).toBe('active');
    });

    it('should reject invalid transitions', async () => {
      const session = await createCompletedSession();

      await expect(
        SessionService.start(session.id, seer.id)
      ).rejects.toThrow(SessionErrorCode.INVALID_STATUS_TRANSITION);
    });
  });
});
```

### Integration Tests

```typescript
describe('Session API', () => {
  describe('POST /api/v1/sessions', () => {
    it('should create session for authenticated user', async () => {
      const response = await request(app)
        .post('/api/v1/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ adventureId: adventure.id });

      expect(response.status).toBe(201);
      expect(response.body.data.session.seerName).toBeDefined();
      expect(response.body.data.joinUrl).toContain(response.body.data.session.code);
    });
  });

  describe('POST /api/v1/sessions/:id/join', () => {
    it('should join session and broadcast event', async () => {
      const seerSocket = await connectToSession(seer, session.id);
      const joinPromise = waitForEvent(seerSocket, 'player_joined');

      const response = await request(app)
        .post(`/api/v1/sessions/${session.id}/join`)
        .set('Authorization', `Bearer ${playerToken}`)
        .send({ characterId: character.id });

      expect(response.status).toBe(200);

      const event = await joinPromise;
      expect(event.player.characterId).toBe(character.id);
    });
  });

  describe('POST /api/v1/sessions/:id/start', () => {
    it('should start and notify all players', async () => {
      const playerSocket = await connectToSession(player, session.id);
      const startPromise = waitForEvent(playerSocket, 'session_status');

      const response = await request(app)
        .post(`/api/v1/sessions/${session.id}/start`)
        .set('Authorization', `Bearer ${seerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('active');

      const event = await startPromise;
      expect(event.newStatus).toBe('active');
    });

    it('should reject start by non-Seer', async () => {
      const response = await request(app)
        .post(`/api/v1/sessions/${session.id}/start`)
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(403);
    });
  });
});
```

### E2E Tests

```typescript
describe('Session Flow E2E', () => {
  it('should complete full session creation and join flow', async () => {
    // Seer creates session
    await loginAs(seerPage, seer);
    await seerPage.goto('/sessions/new');
    await seerPage.click(`[data-testid="adventure-${adventure.id}"]`);
    await seerPage.click('[data-testid="create-session"]');
    
    await seerPage.waitForURL(/\/sessions\/[a-z0-9-]+\/lobby/);
    const code = await seerPage.textContent('[data-testid="join-code"]');

    // Player joins
    await loginAs(playerPage, player);
    await playerPage.goto('/join');
    await playerPage.fill('[data-testid="join-code-input"]', code);
    await playerPage.click('[data-testid="find-session"]');
    
    await playerPage.waitForSelector('[data-testid="session-preview"]');
    await playerPage.click(`[data-testid="character-${character.id}"]`);
    await playerPage.click('[data-testid="join-session"]');

    // Both should see each other in lobby
    await seerPage.waitForSelector(`[data-testid="player-${player.id}"]`);
    await playerPage.waitForSelector('[data-testid="session-lobby"]');

    // Seer starts game
    await seerPage.click('[data-testid="start-game"]');

    // Both should see game view
    await seerPage.waitForSelector('[data-testid="seer-dashboard"]');
    await playerPage.waitForSelector('[data-testid="player-game-view"]');
  });

  it('should handle player disconnection gracefully', async () => {
    // Setup: Active session with player
    await setupActiveSession();

    // Simulate disconnect by closing player page
    await playerPage.close();

    // Seer should see disconnection status
    await seerPage.waitForSelector('[data-testid="player-disconnected"]');

    // Player reconnects
    playerPage = await browser.newPage();
    await loginAs(playerPage, player);
    await playerPage.goto(`/sessions/${session.id}`);

    // Should automatically rejoin
    await playerPage.waitForSelector('[data-testid="player-game-view"]');
    await seerPage.waitForSelector('[data-testid="player-connected"]');
  });
});
```

---

## Implementation Checklist

### Backend
- [ ] Create `sessions` table
- [ ] Create `session_players` table
- [ ] Implement `POST /api/v1/sessions`
- [ ] Implement `GET /api/v1/sessions/:id`
- [ ] Implement `GET /api/v1/sessions/code/:code`
- [ ] Implement `POST /api/v1/sessions/:id/join`
- [ ] Implement `POST /api/v1/sessions/:id/leave`
- [ ] Implement `POST /api/v1/sessions/:id/kick`
- [ ] Implement `POST /api/v1/sessions/:id/start`
- [ ] Implement `POST /api/v1/sessions/:id/pause`
- [ ] Implement `POST /api/v1/sessions/:id/resume`
- [ ] Implement `POST /api/v1/sessions/:id/end`
- [ ] Implement `GET /api/v1/sessions/:id/state`
- [ ] Implement `PATCH /api/v1/sessions/:id/state`
- [ ] Add join code generation
- [ ] Add state machine validation
- [ ] Add real-time event broadcasting
- [ ] Add connection tracking
- [ ] Write unit tests
- [ ] Write integration tests

### Frontend
- [ ] Create `SessionService` API client
- [ ] Create `useSession` hook
- [ ] Create `SessionConnection` class
- [ ] Build session creation flow
- [ ] Build join code entry
- [ ] Build session lobby
- [ ] Build player list component
- [ ] Build session status indicator
- [ ] Add connection status handling
- [ ] Add reconnection logic
- [ ] Write E2E tests

---

## Appendix

### Session Timeout Policy

| Status | Timeout | Action |
|--------|---------|--------|
| Waiting | 24 hours | Auto-cancel |
| Active | None | N/A |
| Paused | 7 days | Auto-cancel |
| Player disconnected | 5 minutes | Mark inactive |

### Join Code Format

- **Length**: 6 characters
- **Characters**: ABCDEFGHJKMNPQRSTUVWXYZ23456789 (no 0/O/1/I/L)
- **Format**: Uppercase only
- **Example**: `H7NK4B`
- **Collision chance**: 1 in 887 million
