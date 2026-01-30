# PRD 14: Session Browser

> **Status**: Ready for Implementation  
> **Priority**: P1 - High  
> **Estimated Effort**: 3 days  
> **Dependencies**: 04-session-management, 12-publishing-system, 18-authentication

---

## Overview

The Session Browser allows players to discover and join public game sessions. It provides search, filtering, and preview capabilities to help players find adventures that match their interests and availability.

### Goals
- Enable players to find sessions without invite codes
- Support filtering by adventure type, time, and party needs
- Show enough information to make informed join decisions
- Reduce Seer overhead in player recruitment

### Non-Goals
- Private session discovery (invite-only remains separate)
- Matchmaking/recommendation algorithms
- Session scheduling tools
- Voice/video integration

---

## User Stories

### US-01: Browse Public Sessions
**As a** player  
**I want to** see all available public sessions  
**So that** I can find games to join

**Acceptance Criteria:**
- [ ] List view of all public sessions with open slots
- [ ] Basic info visible: adventure name, Seer name, player count, start time
- [ ] Sessions sorted by start time (soonest first)
- [ ] Empty state when no sessions available
- [ ] Pagination for large result sets (20 per page)

### US-02: Filter Sessions
**As a** player  
**I want to** filter sessions by criteria  
**So that** I can find games that fit my preferences

**Acceptance Criteria:**
- [ ] Filter by adventure difficulty (Easy, Medium, Hard)
- [ ] Filter by estimated duration (30m, 60m, 90m+)
- [ ] Filter by start time (Starting Soon, Later Today, Tomorrow+)
- [ ] Filter by open slots (Any, 1+, 2+, 3+)
- [ ] Multiple filters can combine
- [ ] Filters persist across page loads

### US-03: Search Sessions
**As a** player  
**I want to** search for specific sessions  
**So that** I can find games by name or Seer

**Acceptance Criteria:**
- [ ] Search by adventure name
- [ ] Search by Seer display name
- [ ] Search results update as user types (debounced)
- [ ] Clear search button
- [ ] Search combines with active filters

### US-04: Session Preview
**As a** player  
**I want to** preview session details before joining  
**So that** I know what to expect

**Acceptance Criteria:**
- [ ] Click session card opens preview modal/panel
- [ ] Shows adventure description (first 200 chars)
- [ ] Shows adventure artwork thumbnail
- [ ] Shows Seer profile (name, games run count)
- [ ] Shows current players (names, classes)
- [ ] Shows party composition needs (if set by Seer)

### US-05: Join Session
**As a** player  
**I want to** join a session from the browser  
**So that** I can quickly get into a game

**Acceptance Criteria:**
- [ ] "Join" button visible on session cards
- [ ] Clicking join prompts character selection
- [ ] If no characters, redirects to character creation
- [ ] Joining updates session in real-time for all viewers
- [ ] Success redirects to session lobby

### US-06: Real-time Updates
**As a** browser user  
**I want to** see sessions update in real-time  
**So that** I don't miss opportunities or join full games

**Acceptance Criteria:**
- [ ] New sessions appear without refresh
- [ ] Full sessions disappear or show "Full" badge
- [ ] Player count updates live
- [ ] Session starting soon shows countdown
- [ ] Sessions that start are removed from list

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SESSION BROWSER FLOW                           │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────┐
  │ Player visits   │
  │ /sessions       │
  └────────┬────────┘
           │
           ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │ BROWSE SESSIONS                                     [Create +]  │
  │                                                                 │
  │ ┌───────────────────────────────────────────────────────────┐  │
  │ │ 🔍 Search adventures or Seers...                          │  │
  │ └───────────────────────────────────────────────────────────┘  │
  │                                                                 │
  │ Filters: [All Difficulties ▼] [Any Duration ▼] [Any Time ▼]    │
  │                                                                 │
  │ ┌─────────────────────────────────────────────────────────────┐│
  │ │  ┌─────────┐                                                ││
  │ │  │ [Art]   │  THE CRYSTAL CAVERNS                          ││
  │ │  │         │  ⭐ Medium • ⏱️ 60 min • 👥 2/4 players        ││
  │ │  └─────────┘  Seer: @dungeonmaster42                       ││
  │ │               🕐 Starts in 15 minutes               [Join] ││
  │ └─────────────────────────────────────────────────────────────┘│
  │ ┌─────────────────────────────────────────────────────────────┐│
  │ │  ┌─────────┐                                                ││
  │ │  │ [Art]   │  THE DARK FOREST                              ││
  │ │  │         │  ⭐ Easy • ⏱️ 45 min • 👥 1/4 players          ││
  │ │  └─────────┘  Seer: @newbieSeer                            ││
  │ │               🕐 Starts in 2 hours                 [Join] ││
  │ └─────────────────────────────────────────────────────────────┘│
  └─────────────────────────────────────────────────────────────────┘
           │
           │ Click session card
           ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │ SESSION PREVIEW                                          [✕]   │
  │                                                                 │
  │  ┌───────────────────┐                                         │
  │  │                   │  THE CRYSTAL CAVERNS                    │
  │  │  [Adventure Art]  │  by @dungeonmaster42                    │
  │  │                   │                                         │
  │  └───────────────────┘  A group of adventurers must navigate   │
  │                         treacherous crystal caves to find      │
  │                         the legendary Gem of Souls before...   │
  │                                                                 │
  │  ──────────────────────────────────────────────────────────    │
  │                                                                 │
  │  CURRENT PARTY (2/4)                                           │
  │  • Thorn (Warrior) - @player1                                  │
  │  • Lyra (Wizard) - @player2                                    │
  │                                                                 │
  │  LOOKING FOR                                                   │
  │  🩹 Healer recommended • 🗡️ Any class welcome                   │
  │                                                                 │
  │  ──────────────────────────────────────────────────────────    │
  │                                                                 │
  │  ⏱️ Estimated: 60 minutes                                       │
  │  ⭐ Difficulty: Medium                                          │
  │  🕐 Starts: 7:30 PM (in 15 minutes)                            │
  │                                                                 │
  │                                    [Join with Character ▼]     │
  └─────────────────────────────────────────────────────────────────┘
           │
           │ Click "Join with Character"
           ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │ SELECT CHARACTER                                         [✕]   │
  │                                                                 │
  │  Choose a character to join this session:                      │
  │                                                                 │
  │  ┌──────────────────────────────────────────────────────────┐  │
  │  │ ◉ Kael the Ranger      Level 1      Last played: Today   │  │
  │  └──────────────────────────────────────────────────────────┘  │
  │  ┌──────────────────────────────────────────────────────────┐  │
  │  │ ○ Shadow the Rogue     Level 2      Last played: 3d ago  │  │
  │  └──────────────────────────────────────────────────────────┘  │
  │                                                                 │
  │  [+ Create New Character]                                      │
  │                                                                 │
  │                                              [Join Session]    │
  └─────────────────────────────────────────────────────────────────┘
           │
           │ Success
           ▼
  ┌─────────────────┐
  │ Redirect to     │
  │ /session/{id}   │
  │ (lobby)         │
  └─────────────────┘
```

---

## Technical Specification

### Data Models

```typescript
// Session list item (optimized for browser)
interface SessionListItem {
  id: string;
  code: string;
  adventureId: string;
  adventureName: string;
  adventureThumbnail: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration: number;          // minutes
  seerId: string;
  seerDisplayName: string;
  seerAvatarUrl: string | null;
  seerGamesRun: number;
  playerCount: number;
  maxPlayers: number;
  status: 'waiting' | 'starting_soon';
  scheduledStart: string | null;
  createdAt: string;
}

// Session preview (expanded details)
interface SessionPreview extends SessionListItem {
  adventureDescription: string;       // Truncated to 500 chars
  adventureArtwork: string | null;
  players: SessionPlayer[];
  lookingFor: string | null;          // Seer's party composition note
}

interface SessionPlayer {
  userId: string;
  displayName: string;
  characterId: string;
  characterName: string;
  characterClass: CharacterClass;
}

// Filter state
interface SessionFilters {
  search?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  duration?: '30' | '60' | '90+';
  startTime?: 'soon' | 'today' | 'later';
  minOpenSlots?: number;
}
```

### API Endpoints

#### GET /api/v1/sessions/browse

Returns paginated list of public sessions.

**Query Parameters:**
- `page` (optional): Page number (default 1)
- `limit` (optional): Results per page (default 20, max 50)
- `search` (optional): Search term
- `difficulty` (optional): easy, medium, hard
- `duration` (optional): 30, 60, 90
- `startTime` (optional): soon (<30m), today, later
- `minSlots` (optional): Minimum open slots

**Response (200 OK):**
```typescript
interface BrowseSessionsResponse {
  success: true;
  data: SessionListItem[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
    filters: SessionFilters;
  };
}
```

#### GET /api/v1/sessions/{id}/preview

Returns detailed preview for a session.

**Response (200 OK):**
```typescript
interface SessionPreviewResponse {
  success: true;
  data: SessionPreview;
}
```

**Error Responses:**
- `404 Not Found`: Session doesn't exist or not public

#### POST /api/v1/sessions/{id}/join

Joins a public session with selected character.

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
    sessionId: string;
    sessionCode: string;
    redirectUrl: string;
  };
}
```

**Error Responses:**
- `400 Bad Request`: Invalid character
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Character doesn't belong to user
- `404 Not Found`: Session not found
- `409 Conflict`: Session full or already joined
- `422 Unprocessable Entity`: Session not accepting players

### Real-time Subscription

```typescript
// Supabase Realtime channel for session updates
const channel = supabase
  .channel('public-sessions')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'sessions',
      filter: 'is_public=eq.true',
    },
    (payload) => {
      switch (payload.eventType) {
        case 'INSERT':
          addSessionToList(payload.new);
          break;
        case 'UPDATE':
          updateSessionInList(payload.new);
          break;
        case 'DELETE':
          removeSessionFromList(payload.old.id);
          break;
      }
    }
  )
  .subscribe();
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SessionBrowserPage                         │
│  - Route: /sessions                                             │
│  - Manages filter state                                         │
│  - Handles real-time subscriptions                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┬─────────────────┐
         │                 │                 │                 │
         ▼                 ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ SearchBar       │ │ FilterBar       │ │ SessionList     │ │ SessionPreview  │
│                 │ │                 │ │                 │ │ Modal           │
│ - Debounced     │ │ - Dropdowns     │ │ - SessionCard   │ │                 │
│ - Clear button  │ │ - Reset all     │ │ - Pagination    │ │ - Preview data  │
└─────────────────┘ └─────────────────┘ │ - Empty state   │ │ - Join flow     │
                                        └─────────────────┘ └─────────────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                                        │ SessionCard     │
                                        │                 │
                                        │ - Thumbnail     │
                                        │ - Info          │
                                        │ - Join button   │
                                        └─────────────────┘
```

---

## UI Specifications

### Session Card

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌──────────┐                                                    │
│ │          │  THE CRYSTAL CAVERNS                              │
│ │  [Art]   │  ⭐ Medium  •  ⏱️ 60 min                           │
│ │          │                                                    │
│ └──────────┘  👤 @dungeonmaster42  (12 games)                  │
│               👥 2/4 players                                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🕐 Starts in 15 minutes                         [Join]  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

States:
- Default: Blue "Join" button
- Hover: Card elevates, button brightens  
- Full: Grayed out, "Full" badge, no join button
- Starting Soon (<5m): Pulsing border, "Starting Soon" badge
```

### Filter Bar

```
Desktop:
┌─────────────────────────────────────────────────────────────────┐
│ [All Difficulties ▼]  [Any Duration ▼]  [Any Time ▼]  [Reset]  │
└─────────────────────────────────────────────────────────────────┘

Mobile:
┌─────────────────────────────────────────────────────────────────┐
│ [Filters (3) ▼]                                                 │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼ (expands)
┌─────────────────────────────────────────────────────────────────┐
│ Difficulty     [All ▼]                                          │
│ Duration       [Any ▼]                                          │
│ Start Time     [Any ▼]                                          │
│ Open Slots     [Any ▼]                                          │
│                                           [Reset]  [Apply]      │
└─────────────────────────────────────────────────────────────────┘
```

### Empty States

```
No Sessions Available:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                          🎲                                     │
│                                                                 │
│              No public sessions right now                       │
│                                                                 │
│     Check back later or create your own adventure!              │
│                                                                 │
│                    [Create Session]                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

No Search Results:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                          🔍                                     │
│                                                                 │
│           No sessions match your search                         │
│                                                                 │
│              Try different keywords or                          │
│                  [Clear Filters]                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Queries

### Browse Sessions Query

```sql
-- Optimized query for session browsing
SELECT 
  s.id,
  s.code,
  s.adventure_id,
  a.name AS adventure_name,
  a.thumbnail_url AS adventure_thumbnail,
  a.difficulty,
  a.estimated_duration,
  s.seer_id,
  u.display_name AS seer_display_name,
  u.avatar_url AS seer_avatar_url,
  (SELECT COUNT(*) FROM sessions WHERE seer_id = s.seer_id AND status = 'completed') AS seer_games_run,
  (SELECT COUNT(*) FROM session_players WHERE session_id = s.id) AS player_count,
  s.max_players,
  s.status,
  s.scheduled_start,
  s.created_at
FROM sessions s
JOIN adventures a ON s.adventure_id = a.id
JOIN users u ON s.seer_id = u.id
WHERE 
  s.is_public = true
  AND s.status IN ('waiting', 'starting_soon')
  AND (SELECT COUNT(*) FROM session_players WHERE session_id = s.id) < s.max_players
  -- Dynamic filters added here
ORDER BY 
  CASE WHEN s.scheduled_start IS NOT NULL THEN s.scheduled_start ELSE s.created_at END ASC
LIMIT $limit OFFSET $offset;
```

### Required Indexes

```sql
-- Indexes for session browsing performance
CREATE INDEX idx_sessions_public_status ON sessions(is_public, status) 
  WHERE is_public = true;

CREATE INDEX idx_sessions_scheduled_start ON sessions(scheduled_start) 
  WHERE is_public = true AND status IN ('waiting', 'starting_soon');

CREATE INDEX idx_session_players_count ON session_players(session_id);

CREATE INDEX idx_adventures_search ON adventures 
  USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
```

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Initial load | <1.5s |
| Filter update | <300ms |
| Search results | <500ms |
| Real-time update | <2s propagation |
| Preview load | <500ms |
| Join action | <1s total |

---

## Error Handling

```typescript
enum SessionBrowserErrorCode {
  SESSION_NOT_FOUND = 'BROWSE_001',
  SESSION_FULL = 'BROWSE_002',
  SESSION_NOT_PUBLIC = 'BROWSE_003',
  ALREADY_IN_SESSION = 'BROWSE_004',
  NO_CHARACTER = 'BROWSE_005',
  SESSION_STARTED = 'BROWSE_006',
}
```

---

## Testing Requirements

### Unit Tests

```typescript
describe('SessionBrowser', () => {
  describe('Filtering', () => {
    it('should filter by difficulty', async () => {
      render(<SessionBrowserPage />);
      
      await selectFilter('difficulty', 'medium');
      
      const sessions = screen.getAllByTestId('session-card');
      sessions.forEach(session => {
        expect(session).toHaveTextContent('Medium');
      });
    });

    it('should combine multiple filters', async () => {
      render(<SessionBrowserPage />);
      
      await selectFilter('difficulty', 'easy');
      await selectFilter('duration', '60');
      
      // Verify API called with both filters
      expect(mockApi).toHaveBeenCalledWith(
        expect.objectContaining({
          difficulty: 'easy',
          duration: '60',
        })
      );
    });
  });

  describe('Search', () => {
    it('should debounce search input', async () => {
      jest.useFakeTimers();
      render(<SessionBrowserPage />);
      
      const searchInput = screen.getByRole('searchbox');
      await userEvent.type(searchInput, 'crystal');
      
      expect(mockApi).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(300);
      
      expect(mockApi).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'crystal' })
      );
    });
  });

  describe('Real-time Updates', () => {
    it('should add new sessions to list', async () => {
      render(<SessionBrowserPage />);
      
      // Simulate real-time event
      await simulateRealtimeEvent('INSERT', newSession);
      
      expect(screen.getByText(newSession.adventureName)).toBeInTheDocument();
    });

    it('should remove full sessions', async () => {
      render(<SessionBrowserPage />);
      
      const sessionCard = screen.getByText('Test Adventure');
      
      // Simulate session becoming full
      await simulateRealtimeEvent('UPDATE', { ...existingSession, playerCount: 4 });
      
      expect(sessionCard).not.toBeInTheDocument();
    });
  });
});
```

### E2E Tests

```typescript
describe('Session Browser E2E', () => {
  it('should complete join flow', async () => {
    // Create a public session via API
    const session = await createPublicSession();
    
    await page.goto('/sessions');
    
    // Find and click session
    await page.click(`[data-testid="session-${session.id}"]`);
    
    // Preview modal opens
    await expect(page.locator('[data-testid="session-preview"]')).toBeVisible();
    
    // Click join
    await page.click('[data-testid="join-button"]');
    
    // Select character
    await page.click('[data-testid="character-option-0"]');
    await page.click('[data-testid="confirm-join"]');
    
    // Redirected to session
    await expect(page).toHaveURL(`/session/${session.code}`);
  });
});
```

---

## Implementation Checklist

### Backend
- [ ] Create `/api/v1/sessions/browse` endpoint
- [ ] Create `/api/v1/sessions/{id}/preview` endpoint
- [ ] Update `/api/v1/sessions/{id}/join` for browser flow
- [ ] Add database indexes
- [ ] Configure Supabase Realtime for public sessions
- [ ] Write unit tests

### Frontend
- [ ] Create `SessionBrowserPage` component
- [ ] Create `SearchBar` component
- [ ] Create `FilterBar` component
- [ ] Create `SessionList` component
- [ ] Create `SessionCard` component
- [ ] Create `SessionPreviewModal` component
- [ ] Create `CharacterSelectModal` component
- [ ] Implement real-time subscription
- [ ] Add responsive layouts
- [ ] Add loading states
- [ ] Add empty states
- [ ] Write component tests
- [ ] Write E2E tests
