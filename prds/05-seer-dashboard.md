# PRD 05: Seer Dashboard

> **Status**: Ready for Implementation  
> **Priority**: P1 - High  
> **Estimated Effort**: 5 days  
> **Dependencies**: 04-session-management, 03-combat-system

---

## Overview

The Seer Dashboard consists of **two distinct views**:

### 1. Story Module (Front-End Live View)
The real-time "teleprompter" interface used **during active gameplay**. Node-centric design with scene artwork, narrative text, Seer guidance, and decision buttons. This is what the Seer sees while running the game.

### 2. Progress Dashboard (Back-End Analytics View)
The session history and analytics view used **before, after, or between sessions**. Shows adventure completion status, player participation, and event logs. Helps Seers resume incomplete adventures and review past sessions.

---

### Goals
- Enable Seers to run games confidently without memorizing rules
- Provide quick access to all needed controls in one view
- Support smooth narrative flow with minimal UI friction
- Help new Seers learn while experienced Seers move fast
- **Track adventure progress and session history**
- **Enable seamless session resumption**

### Non-Goals
- Adventure editing during sessions
- Player character customization
- Voice/video chat integration (separate PRD)
- Full session video recording

---

## User Stories

### US-01: Dashboard Overview
**As a** Seer  
**I want to** see all game information at a glance  
**So that** I can run the game confidently

**Acceptance Criteria:**
- [ ] Current story node content visible
- [ ] All player characters with HP shown
- [ ] Quick actions accessible
- [ ] Session status and time displayed
- [ ] No need to switch between views for basic tasks

### US-02: Node Navigation
**As a** Seer  
**I want to** advance the story to the next node  
**So that** the adventure progresses

**Acceptance Criteria:**
- [ ] See available paths from current node
- [ ] Preview target node before navigating
- [ ] Confirm navigation to change game state
- [ ] Players automatically see new content
- [ ] Track visited nodes for reference

### US-03: Player Oversight
**As a** Seer  
**I want to** monitor all players' status  
**So that** I can manage the party effectively

**Acceptance Criteria:**
- [ ] See each character's HP/max HP
- [ ] See active conditions/effects
- [ ] See special ability cooldowns
- [ ] Quick heal/damage controls
- [ ] Connection status indicator

### US-04: Dice Control
**As a** Seer  
**I want to** trigger and manage dice rolls  
**So that** I can resolve player actions

**Acceptance Criteria:**
- [ ] Request roll from specific player
- [ ] Set difficulty for rolls
- [ ] Make rolls on behalf of NPCs
- [ ] See roll results in real-time
- [ ] Add modifiers before rolling

### US-05: Combat Management
**As a** Seer  
**I want to** manage combat encounters  
**So that** battles run smoothly

**Acceptance Criteria:**
- [ ] Start combat from combat nodes
- [ ] See initiative order at a glance
- [ ] Control enemy actions
- [ ] Track enemy HP
- [ ] End combat with outcomes

### US-06: AI Assistance
**As a** Seer  
**I want to** get help with rulings and improvisation  
**So that** I can handle unexpected situations

**Acceptance Criteria:**
- [ ] Quick question input always visible
- [ ] Receive suggestions within 3 seconds
- [ ] Context-aware advice
- [ ] Shortcodes for common queries
- [ ] Can dismiss/ignore suggestions

### US-07: Session Controls
**As a** Seer  
**I want to** control session flow  
**So that** I can manage the game's pace

**Acceptance Criteria:**
- [ ] Pause/resume game
- [ ] End session with outcome
- [ ] Kick disconnected players
- [ ] Adjust settings mid-game
- [ ] Send announcements to players

---

## Progress Dashboard User Stories

### US-08: Adventure Progress Tracking
**As a** Seer  
**I want to** see how far through an adventure my party has progressed  
**So that** I know what's been completed and what remains

**Acceptance Criteria:**
- [ ] Visual node map showing visited vs unvisited nodes
- [ ] Percentage completion indicator
- [ ] Current node highlighted
- [ ] Branch paths shown with which was taken
- [ ] Time spent at each node logged

### US-09: Session History
**As a** Seer  
**I want to** see a log of past sessions for an adventure  
**So that** I can review what happened and resume where we left off

**Acceptance Criteria:**
- [ ] List of all sessions with dates and durations
- [ ] Which players participated in each session
- [ ] Starting and ending node for each session
- [ ] Session outcome (completed, paused, abandoned)
- [ ] Click to view detailed event log

### US-10: Player Participation Tracking
**As a** Seer  
**I want to** see which players participated and when they left  
**So that** I can manage party continuity across sessions

**Acceptance Criteria:**
- [ ] Player join/leave timestamps
- [ ] Character state at departure (HP, conditions, items)
- [ ] Attendance across multiple sessions
- [ ] Connection quality/disconnection events
- [ ] Player contribution metrics (rolls, actions, chat)

### US-11: Event Log
**As a** Seer  
**I want to** see a detailed log of events that occurred during gameplay  
**So that** I can review key moments and resolve disputes

**Acceptance Criteria:**
- [ ] Chronological event timeline
- [ ] Filter by event type (rolls, combat, decisions, chat)
- [ ] Dice roll results with context
- [ ] Combat outcomes (damage dealt, enemies defeated)
- [ ] Decision points and choices made
- [ ] Exportable log for notes/records

### US-12: Resume Incomplete Adventure
**As a** Seer  
**I want to** resume an adventure that was paused mid-session  
**So that** we can continue where we left off

**Acceptance Criteria:**
- [ ] Clear "Resume" button on incomplete adventures
- [ ] Restore party to last saved state
- [ ] Show recap of recent events
- [ ] Option to invite same players or new ones
- [ ] Sync player clients to current node

---

## Technical Specification

### Design Reference

The Seer Dashboard follows an established VTT pattern. Reference screenshots saved in:
- `prds/reference-images/seer-dashboard-decision-node.jpg` - Decision node with choices
- `prds/reference-images/seer-dashboard-combat-node.jpg` - Combat node with tracker

Key design principles:

**Node-Centric Layout:**
- Large header with current node title + type badge (Decision/Combat/Story)
- Prominent scene artwork below header
- Story content in a modal/card overlay
- Decision buttons as prominent call-to-action buttons at bottom
- Seer-only guidance text in distinct color (orange/coral)

**Quick Dice Panel (Left Side):**
- Always visible, compact grid of player roll buttons
- Each player has a dedicated roll button
- "Group Roll" for full party checks
- One-click access during any scene

**Combat Tracker (Right Side, when in combat):**
- Enemy stat blocks with STR/DEX/INT/CHA
- Player status bars with conditions
- Status effect explanations on hover
- "Next Turn" button for initiative flow

### Dashboard Layout - Decision Node

```
┌────────────────────────────────────────────────────────────────────────────┐
│      Naigonn Chapel - Entrance                                             │
│                        Decision                                             │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────┐    ┌────────────────────────────────────────────────┐        │
│  │ Jack    │    │          ╔══════════════════════════╗          │        │
│  │ 🎲 Roll │    │          ║   [SCENE ARTWORK]        ║          │        │
│  ├─────────┤    │          ║                          ║          │        │
│  │ Jill    │    │          ╚══════════════════════════╝          │        │
│  │ 🎲 Roll │    │                                                │        │
│  ├─────────┤    │         What Lies Beneath                      │        │
│  │ Morbius │    │                                                │        │
│  │ 🎲 Roll │    │  Brief synopsis of this adventure. The party   │        │
│  ├─────────┤    │  enters the ancient chapel, torchlight         │        │
│  │Hercules │    │  flickering across weathered stone...          │        │
│  │ 🎲 STR  │    │                                                │        │
│  ├─────────┤    │  ┌────────────────────────────────────────┐    │        │
│  │ Rick    │    │  │ 🔶 SEER GUIDANCE                       │    │        │
│  │ 🎲 Roll │    │  │ If players want to do something other │    │        │
│  ├─────────┤    │  │ than the choices presented, be         │    │        │
│  │ GROUP   │    │  │ flexible. As long as the party ends    │    │        │
│  │ 🎲 All  │    │  │ up at [Chapel - Beholder Combat] to    │    │        │
│  └─────────┘    │  │ conclude the adventure.                │    │        │
│                 │  └────────────────────────────────────────┘    │        │
│                 │                                                │        │
│                 │  ┌──────────────┬──────────────┬────────────┐  │        │
│                 │  │ GO THROUGH   │ GO THROUGH   │ TAKE THAT  │  │        │
│                 │  │ THE LION     │ THE SNAKE    │ EMERALD!   │  │        │
│                 │  │ DOOR (LEFT)  │ DOOR (RIGHT) │            │  │        │
│                 │  └──────────────┴──────────────┴────────────┘  │        │
│                 └────────────────────────────────────────────────┘        │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🤖 AI Seer] [📜 History] [⚙️ Settings]                     45:32  ⏸ ⏹  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Dashboard Layout - Combat Node

```
┌────────────────────────────────────────────────────────────────────────────┐
│      Naigonn Chapel - Beholder Chamber                                     │
│                        Combat                                               │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────┐  ┌─────────────────────────────┐  │
│  │      ╔════════════════════════╗     │  │    COMBAT TRACKER           │  │
│  │      ║   [BEHOLDER ART]       ║     │  ├─────────────────────────────┤  │
│  │      ║                        ║     │  │  Sethrix (Beholder)         │  │
│  │      ╚════════════════════════╝     │  │  STR 2 | DEX 1 | INT 4 | CHA 3│
│  │                                     │  │  HP: ████████░░ 8/10        │  │
│  │  🔶 SEER NARRATIVE                  │  ├─────────────────────────────┤  │
│  │  If a player interacts with the     │  │  Floating Eye (x3)          │  │
│  │  chest, Sethrix the beholder floats │  │  STR 1 | DEX 1 | INT 2 | CHA 0│
│  │  down from the ceiling. "You may    │  │  HP: ██░░░░░░░░ 2/10        │  │
│  │  trade for my treasure, with your   │  ├─────────────────────────────┤  │
│  │  lives!" Sethrix is accompanied     │  │                             │  │
│  │  by Floating Eyes equal to the      │  │  PARTY STATUS               │  │
│  │  number of players.                 │  │  ┌─────────────────────────┐│  │
│  │                                     │  │  │ Luke     [POISONED] 🟠  ││  │
│  │  ┌─────────────────────────────┐    │  │  │ -1 die to all rolls     ││  │
│  │  │ OPEN THE    │  PARTY DIES   │    │  │  ├─────────────────────────┤│  │
│  │  │ CHEST       │               │    │  │  │ Chewie   [Add Status]   ││  │
│  │  └─────────────────────────────┘    │  │  ├─────────────────────────┤│  │
│  └─────────────────────────────────────┘  │  │ Han      [Add Status]   ││  │
│                                           │  └─────────────────────────┘│  │
│  ┌───────────────────────────────────┐    │                             │  │
│  │ 🎲 Jack │ 🎲 Jill │ 🎲 Group     │    │  [NEXT TURN ➡️]             │  │
│  └───────────────────────────────────┘    └─────────────────────────────┘  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🤖 AI Seer] [📜 History] [⚙️ Settings]                     52:17  ⏸ ⏹  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key UI Patterns

1. **Node Type Badges**: Color-coded badges (Decision=blue, Combat=red, Story=green, Challenge=purple)

2. **Seer Guidance Blocks**: Orange/coral highlighted sections that are NOT read aloud — private GM notes, flexibility tips, destination hints

3. **Decision Buttons**: Large, prominent buttons at bottom of node content. These advance the story when clicked and update both Seer and Player views.

4. **Quick Dice Panel**: Always accessible on left side during non-combat, repositioned to bottom during combat for more screen real estate

5. **Combat Tracker**: Slides in from right during combat encounters, shows:
   - Enemy stat blocks with core attributes
   - HP bars with visual indicators
   - Player status conditions with explanations
   - Turn order controls

6. **Destination Links**: Seer guidance may contain links to destination nodes (like "[Chapel - Beholder Combat]") allowing Seer to preview where paths lead

### Component Architecture

```typescript
// Dashboard container
interface SeerDashboardProps {
  sessionId: string;
}

interface DashboardState {
  session: Session;
  currentNode: AdventureNode;
  players: SessionPlayer[];
  combat: CombatState | null;
  aiResponse: AISeerResponse | null;
  isLoading: boolean;
  activePanel: 'node' | 'combat' | 'history' | 'settings';
}

// Component tree (following reference UI)
SeerDashboard
├── NodeHeader
│   ├── NodeTitle
│   └── NodeTypeBadge (Decision/Combat/Story/Challenge)
├── MainLayout (flex row)
│   ├── QuickDicePanel (left, collapsible in combat)
│   │   ├── PlayerRollButton (per player)
│   │   └── GroupRollButton
│   ├── NodeContentCard (center, modal-style)
│   │   ├── SceneArtwork
│   │   ├── AdventureTitle
│   │   ├── NarrativeText (read-aloud)
│   │   ├── SeerGuidanceBlock (orange, GM-only tips)
│   │   │   └── NodeLink (links to destination nodes)
│   │   └── DecisionButtonRow
│   │       └── DecisionButton (for each choice)
│   └── CombatTracker (right, when in combat)
│       ├── EnemyStatBlock (per enemy)
│       │   ├── AttributeRow (STR/DEX/INT/CHA)
│       │   └── HPBar
│       ├── PartyStatusPanel
│       │   └── PlayerStatusRow (name + conditions)
│       │       └── StatusEffect (with tooltip explanation)
│       └── NextTurnButton
├── BottomBar
│   ├── AISeerButton
│   ├── HistoryButton
│   ├── SettingsButton
│   ├── SessionTimer
│   └── SessionControls (pause/stop)
└── Modals
    ├── AISeerModal
    ├── NodePreviewModal (when Seer clicks a node link)
    ├── RollModal (attribute/difficulty/modifiers)
    └── SettingsModal
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SEER DASHBOARD                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  useSession(sessionId)           │  useCombat(combatId)                 │
│  ┌─────────────────────────┐     │  ┌─────────────────────────┐        │
│  │ session                  │     │  │ combat                  │        │
│  │ players                  │     │  │ currentTurn             │        │
│  │ gameState               │     │  │ actions                 │        │
│  │ currentNode             │     │  │ log                     │        │
│  └─────────────────────────┘     │  └─────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 ▼                  ▼                  ▼
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │    Actions      │  │   Real-time     │  │    Queries      │
    ├─────────────────┤  ├─────────────────┤  ├─────────────────┤
    │ navigateToNode  │  │ Supabase        │  │ getAISeerAdvice │
    │ requestRoll     │  │ subscriptions   │  │ getNodePreview  │
    │ startCombat     │  │ for session,    │  │ searchHistory   │
    │ endSession      │  │ players, dice,  │  │                 │
    │ announceMessage │  │ combat events   │  │                 │
    └─────────────────┘  └─────────────────┘  └─────────────────┘
```

### TypeScript Interfaces

```typescript
// Dashboard hooks
interface UseSeerDashboard {
  // State
  session: Session | null;
  currentNode: AdventureNode | null;
  players: SessionPlayer[];
  combat: CombatState | null;
  isLoading: boolean;
  error: Error | null;
  
  // Node actions
  navigateToNode: (nodeId: string) => Promise<void>;
  previewNode: (nodeId: string) => Promise<AdventureNode>;
  
  // Player actions
  requestRoll: (playerId: string, params: RollRequest) => Promise<void>;
  modifyPlayerHP: (characterId: string, delta: number) => Promise<void>;
  kickPlayer: (playerId: string, reason?: string) => Promise<void>;
  
  // Combat actions
  startCombat: () => Promise<CombatState>;
  executeEnemyAction: (action: CombatActionRequest) => Promise<void>;
  endCombat: (outcome: CombatOutcome['type']) => Promise<void>;
  
  // Session actions
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  endSession: (outcome: 'completed' | 'cancelled') => Promise<void>;
  
  // Communication
  sendAnnouncement: (message: string) => Promise<void>;
  getAIAdvice: (question: string) => Promise<AISeerResponse>;
}

// Quick action types
interface RollRequest {
  characterId: string;
  attribute: Attribute;
  difficulty: number;
  rollType: RollType;
  description?: string;
}

// Announcement
interface Announcement {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'story';
  timestamp: string;
}
```

### Node Content Card Component

```typescript
interface NodeContentCardProps {
  node: AdventureNode;
  connections: NodeConnection[];
  onNavigate: (nodeId: string) => void;
  onPreviewNode: (nodeId: string) => void;
}

function NodeContentCard({ 
  node, 
  connections, 
  onNavigate, 
  onPreviewNode 
}: NodeContentCardProps) {
  return (
    <div className="node-content-card">
      {/* Close button (for modal feel) */}
      <button className="card-close" aria-label="Minimize">×</button>
      
      {/* Scene Artwork - prominent at top */}
      {node.imageUrl && (
        <div className="scene-artwork">
          <img src={node.imageUrl} alt={node.title} />
          {!node.imageVisibleToPlayers && (
            <div className="seer-only-badge">👁 Seer Only</div>
          )}
        </div>
      )}
      
      {/* Adventure/Node Title */}
      <h2 className="adventure-title">{node.data.adventureTitle || node.title}</h2>
      
      {/* Narrative Text (what Seer reads aloud) */}
      <div className="narrative-text">
        <MarkdownRenderer content={node.content} />
      </div>
      
      {/* Seer Guidance Block - orange/coral styling */}
      {node.data.seerGuidance && (
        <div className="seer-guidance-block">
          <SeerGuidanceRenderer 
            content={node.data.seerGuidance}
            onNodeLinkClick={onPreviewNode}
          />
        </div>
      )}
      
      {/* Decision Buttons - prominent row at bottom */}
      <div className="decision-button-row">
        {connections.map(conn => (
          <DecisionButton
            key={conn.id}
            label={conn.label}
            targetNodeId={conn.targetNodeId}
            onClick={() => onNavigate(conn.targetNodeId)}
          />
        ))}
      </div>
    </div>
  );
}

// Seer guidance with clickable node links
function SeerGuidanceRenderer({ 
  content, 
  onNodeLinkClick 
}: { 
  content: string; 
  onNodeLinkClick: (nodeId: string) => void;
}) {
  // Parse [Node Name] syntax into clickable links
  const parseNodeLinks = (text: string) => {
    const linkRegex = /\[([^\]]+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before link
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      // Add clickable link
      parts.push(
        <NodeLink 
          key={match.index}
          nodeName={match[1]} 
          onClick={() => onNodeLinkClick(match[1])}
        />
      );
      lastIndex = match.index + match[0].length;
    }
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts;
  };
  
  return <p>{parseNodeLinks(content)}</p>;
}

// Decision button component
function DecisionButton({ 
  label, 
  targetNodeId, 
  onClick 
}: {
  label: string;
  targetNodeId: string;
  onClick: () => void;
}) {
  return (
    <button 
      className="decision-button"
      onClick={onClick}
      data-target={targetNodeId}
    >
      {label.toUpperCase()}
    </button>
  );
}
```

### Quick Dice Panel Component

```typescript
interface QuickDicePanelProps {
  players: SessionPlayer[];
  onRollForPlayer: (playerId: string, attribute?: Attribute) => void;
  onGroupRoll: () => void;
  compact?: boolean; // Use compact layout during combat
}

function QuickDicePanel({ 
  players, 
  onRollForPlayer, 
  onGroupRoll,
  compact = false
}: QuickDicePanelProps) {
  return (
    <div className={`quick-dice-panel ${compact ? 'compact' : ''}`}>
      {/* Individual player roll buttons */}
      {players.map(player => (
        <PlayerRollButton
          key={player.id}
          player={player}
          onRoll={(attr) => onRollForPlayer(player.id, attr)}
        />
      ))}
      
      {/* Group roll button */}
      <button 
        className="group-roll-button"
        onClick={onGroupRoll}
      >
        <span className="dice-icon">🎲</span>
        <span className="button-label">Group Roll</span>
      </button>
    </div>
  );
}

function PlayerRollButton({ 
  player, 
  onRoll 
}: { 
  player: SessionPlayer; 
  onRoll: (attr?: Attribute) => void;
}) {
  const [showAttrMenu, setShowAttrMenu] = useState(false);
  const character = player.character!;
  
  // If player has a pending attribute (from challenge node), show it
  const pendingAttr = player.pendingRollAttribute;
  
  return (
    <div className="player-roll-button">
      <button 
        className="roll-trigger"
        onClick={() => pendingAttr ? onRoll(pendingAttr) : setShowAttrMenu(true)}
      >
        <span className="dice-icon">🎲</span>
        {pendingAttr && <span className="attr-badge">{pendingAttr}</span>}
      </button>
      <span className="player-name">{character.name} Roll</span>
      
      {showAttrMenu && (
        <AttributeMenu 
          onSelect={(attr) => { onRoll(attr); setShowAttrMenu(false); }}
          onClose={() => setShowAttrMenu(false)}
        />
      )}
    </div>
  );
}
```

### Combat Tracker Component

```typescript
interface CombatTrackerProps {
  combat: CombatState;
  players: SessionPlayer[];
  onNextTurn: () => void;
  onUpdateEnemyHP: (enemyId: string, delta: number) => void;
  onAddPlayerStatus: (playerId: string, status: StatusEffect) => void;
  onRemovePlayerStatus: (playerId: string, statusId: string) => void;
}

function CombatTracker({
  combat,
  players,
  onNextTurn,
  onUpdateEnemyHP,
  onAddPlayerStatus,
  onRemovePlayerStatus
}: CombatTrackerProps) {
  return (
    <div className="combat-tracker">
      <h3>COMBAT TRACKER</h3>
      
      {/* Enemy Stat Blocks */}
      {combat.enemies.map(enemy => (
        <EnemyStatBlock
          key={enemy.id}
          enemy={enemy}
          onHPChange={(delta) => onUpdateEnemyHP(enemy.id, delta)}
        />
      ))}
      
      {/* Party Status Panel */}
      <div className="party-status-panel">
        <h4>PARTY STATUS</h4>
        {players.map(player => (
          <PlayerStatusRow
            key={player.id}
            player={player}
            onAddStatus={(status) => onAddPlayerStatus(player.id, status)}
            onRemoveStatus={(statusId) => onRemovePlayerStatus(player.id, statusId)}
          />
        ))}
      </div>
      
      {/* Next Turn Button */}
      <button 
        className="next-turn-button"
        onClick={onNextTurn}
      >
        Next Turn ➡️
      </button>
    </div>
  );
}

function EnemyStatBlock({ 
  enemy, 
  onHPChange 
}: { 
  enemy: CombatEnemy; 
  onHPChange: (delta: number) => void;
}) {
  const hpPercent = (enemy.currentHP / enemy.maxHP) * 100;
  
  return (
    <div className="enemy-stat-block">
      <div className="enemy-name">{enemy.name}</div>
      
      {/* Attribute Row */}
      <div className="attribute-row">
        <span>STR {enemy.attributes.might}</span>
        <span>DEX {enemy.attributes.grace}</span>
        <span>INT {enemy.attributes.wit}</span>
        <span>CHA {enemy.attributes.heart}</span>
      </div>
      
      {/* HP Bar */}
      <div className="hp-bar-container">
        <div 
          className="hp-bar-fill"
          style={{ width: `${hpPercent}%` }}
        />
        <span className="hp-text">{enemy.currentHP}/{enemy.maxHP}</span>
        <div className="hp-controls">
          <button onClick={() => onHPChange(-1)}>-</button>
          <button onClick={() => onHPChange(1)}>+</button>
        </div>
      </div>
    </div>
  );
}

function PlayerStatusRow({ 
  player, 
  onAddStatus, 
  onRemoveStatus 
}: {
  player: SessionPlayer;
  onAddStatus: (status: StatusEffect) => void;
  onRemoveStatus: (statusId: string) => void;
}) {
  const character = player.character!;
  const activeStatuses = character.activeStatuses || [];
  
  return (
    <div className="player-status-row">
      <span className="player-name">{character.name}</span>
      
      {activeStatuses.length > 0 ? (
        activeStatuses.map(status => (
          <StatusBadge 
            key={status.id}
            status={status}
            onRemove={() => onRemoveStatus(status.id)}
          />
        ))
      ) : (
        <button 
          className="add-status-button"
          onClick={() => onAddStatus({ type: 'custom' })}
        >
          Add Status
        </button>
      )}
    </div>
  );
}

function StatusBadge({ 
  status, 
  onRemove 
}: { 
  status: StatusEffect; 
  onRemove: () => void;
}) {
  return (
    <div className="status-badge" data-type={status.type}>
      <span className="status-name">{status.name}</span>
      <Tooltip content={status.description}>
        <span className="status-icon">ℹ️</span>
      </Tooltip>
      <button className="remove-status" onClick={onRemove}>×</button>
    </div>
  );
}
```

### Player Sidebar

```typescript
interface PlayerSidebarProps {
  players: SessionPlayer[];
  onPlayerAction: (playerId: string, action: PlayerAction) => void;
}

interface PlayerAction {
  type: 'heal' | 'damage' | 'roll' | 'kick' | 'view';
  value?: number;
}

function PlayerSidebar({ players, onPlayerAction }: PlayerSidebarProps) {
  return (
    <div className="player-sidebar">
      <h3>Party ({players.length})</h3>
      
      {players.map(player => (
        <PlayerCard
          key={player.id}
          player={player}
          onAction={(action) => onPlayerAction(player.id, action)}
        />
      ))}
    </div>
  );
}

function PlayerCard({ player, onAction }: PlayerCardProps) {
  const character = player.character!;
  const hpPercent = (character.currentHitPoints / character.maxHitPoints) * 100;
  
  return (
    <div className={`player-card ${!player.isConnected ? 'disconnected' : ''}`}>
      {/* Header */}
      <div className="player-header">
        <Avatar src={character.portraitUrl} name={character.name} />
        <div className="player-info">
          <span className="character-name">{character.name}</span>
          <span className="class-name">{character.characterClass}</span>
        </div>
        <ConnectionIndicator connected={player.isConnected} />
      </div>
      
      {/* HP Bar */}
      <div className="hp-bar">
        <div 
          className="hp-fill" 
          style={{ width: `${hpPercent}%` }}
          data-low={hpPercent < 25}
        />
        <span className="hp-text">
          {character.currentHitPoints} / {character.maxHitPoints}
        </span>
      </div>
      
      {/* Quick Stats */}
      <div className="quick-stats">
        <StatBadge attr="might" value={character.attributes.might} />
        <StatBadge attr="grace" value={character.attributes.grace} />
        <StatBadge attr="wit" value={character.attributes.wit} />
        <StatBadge attr="heart" value={character.attributes.heart} />
      </div>
      
      {/* Abilities */}
      <div className="abilities">
        {character.specialAbilities.map(ability => (
          <AbilityIndicator
            key={ability.id}
            ability={ability}
          />
        ))}
      </div>
      
      {/* Actions */}
      <div className="player-actions">
        <Button size="sm" onClick={() => onAction({ type: 'heal', value: 1 })}>
          +1 HP
        </Button>
        <Button size="sm" onClick={() => onAction({ type: 'damage', value: 1 })}>
          -1 HP
        </Button>
        <Button size="sm" onClick={() => onAction({ type: 'roll' })}>
          🎲 Roll
        </Button>
        <DropdownMenu>
          <DropdownItem onClick={() => onAction({ type: 'view' })}>
            View Sheet
          </DropdownItem>
          <DropdownItem 
            onClick={() => onAction({ type: 'kick' })}
            disabled={player.isConnected}
          >
            Kick Player
          </DropdownItem>
        </DropdownMenu>
      </div>
    </div>
  );
}
```

### AI Seer Panel

```typescript
interface AISeerPanelProps {
  sessionId: string;
  currentNode: AdventureNode;
}

function AISeerPanel({ sessionId, currentNode }: AISeerPanelProps) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<AISeerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const askQuestion = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await AISeerService.getAdvice({
        sessionId,
        sceneContext: currentNode.content,
        playerAction: question,
        difficultyPreference: 'medium',
      });
      setResponse(result);
    } finally {
      setIsLoading(false);
    }
  };
  
  const useShortcode = async (code: string) => {
    const result = await AISeerService.executeShortcode(code, sessionId);
    setResponse({ suggestion: result } as AISeerResponse);
  };
  
  return (
    <div className="ai-seer-panel">
      <div className="ai-input-row">
        <input
          type="text"
          placeholder="Ask the AI Seer anything..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
        />
        <Button onClick={askQuestion} disabled={isLoading}>
          {isLoading ? <Spinner /> : 'Ask'}
        </Button>
      </div>
      
      <div className="shortcodes">
        <Button size="xs" onClick={() => useShortcode('combat')}>
          Combat Rules
        </Button>
        <Button size="xs" onClick={() => useShortcode('order')}>
          Turn Order
        </Button>
        <Button size="xs" onClick={() => useShortcode('abilities')}>
          Abilities
        </Button>
      </div>
      
      {response && (
        <div className="ai-response">
          <div className="suggestion">
            <strong>Suggestion:</strong>
            <p>{response.suggestion}</p>
          </div>
          
          {response.suggestedRoll && (
            <div className="suggested-roll">
              <strong>Suggested Roll:</strong>
              <span>
                {response.suggestedRoll.attribute} vs {response.suggestedRoll.difficulty}
              </span>
              <span className="reason">{response.suggestedRoll.reason}</span>
            </div>
          )}
          
          {response.narrativeHook && (
            <div className="narrative-hook">
              <strong>Narrative:</strong>
              <p className="italic">{response.narrativeHook}</p>
            </div>
          )}
          
          <div className="response-meta">
            <span>{response.responseTimeMs}ms</span>
            {response.cached && <Badge>Cached</Badge>}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Error Handling

```typescript
enum DashboardErrorCode {
  SESSION_LOAD_FAILED = 'DASH_001',
  NODE_LOAD_FAILED = 'DASH_002',
  NAVIGATION_FAILED = 'DASH_003',
  PLAYER_ACTION_FAILED = 'DASH_004',
  COMBAT_ACTION_FAILED = 'DASH_005',
  AI_REQUEST_FAILED = 'DASH_006',
  ANNOUNCEMENT_FAILED = 'DASH_007',
  CONNECTION_LOST = 'DASH_008',
}

// Error boundary for dashboard
function DashboardErrorBoundary({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <div className="dashboard-error">
          <h2>Something went wrong</h2>
          <p>{error.message}</p>
          <Button onClick={reset}>Try Again</Button>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
```

---

## Progress Dashboard Technical Specification

The Progress Dashboard is a separate view from the Story Module, accessed from the Seer's adventure management screen.

### Progress Dashboard Layout

```
┌────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Adventures    │  The Dark Forest  │  Progress Dashboard        │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────┐  ┌─────────────────────────┐  │
│  │           ADVENTURE MAP                  │  │    SESSION HISTORY     │  │
│  │                                          │  ├─────────────────────────┤  │
│  │     [Start] ──> [Tavern] ──> [Fork]     │  │ Jan 28 • 2h 15m        │  │
│  │                    │          /    \     │  │ Players: Jack, Jill    │  │
│  │                    │      [Cave] [Road]  │  │ Ended at: The Fork     │  │
│  │                    ▼         ✓      │    │  │ Status: Paused ⏸       │  │
│  │              [Merchant]            │     │  │ [View Log] [Resume]    │  │
│  │                    │               │     │  ├─────────────────────────┤  │
│  │                    ▼               ▼     │  │ Jan 21 • 1h 30m        │  │
│  │              [Ambush!] ◀──── [Bridge]   │  │ Players: Max, Thora    │  │
│  │                    │                     │  │ Ended at: Start        │  │
│  │                    ▼                     │  │ Status: Abandoned ✗    │  │
│  │               [Boss] ──> [End]          │  │ [View Log]             │  │
│  │                                          │  └─────────────────────────┘  │
│  │  ✓ Visited (3)   ○ Unvisited (5)        │                               │
│  │  ━ Path taken    ┄ Available path        │                               │
│  │                                          │                               │
│  │  Progress: ████████░░░░░░ 37%           │                               │
│  └─────────────────────────────────────────┘                               │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  PLAYER PARTICIPATION                                                │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  Jack (Warrior)   │ 2 sessions │ 3h 45m │ Last: Jan 28 │ ████████  │   │
│  │  Jill (Mage)      │ 2 sessions │ 3h 45m │ Last: Jan 28 │ ████████  │   │
│  │  Max (Rogue)      │ 1 session  │ 1h 30m │ Last: Jan 21 │ ███░░░░░  │   │
│  │  Thora (Cleric)   │ 1 session  │ 1h 30m │ Last: Jan 21 │ ███░░░░░  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

### Event Log View

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Session: Jan 28, 2026 • 2h 15m                    [Export] [Close]        │
├────────────────────────────────────────────────────────────────────────────┤
│  Filter: [All ▼] [Rolls] [Combat] [Decisions] [Chat]                       │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  19:00  SESSION STARTED                                                    │
│         Players: Jack (Warrior), Jill (Mage)                               │
│                                                                             │
│  19:02  NODE: The Dusty Tavern                                             │
│         🎲 Jack rolled WIT (12) → 14 ✓ Success                             │
│         "Noticed the suspicious figure in the corner"                      │
│                                                                             │
│  19:15  DECISION: "Follow the stranger"                                    │
│         → Advanced to: The Dark Alley                                      │
│                                                                             │
│  19:18  COMBAT STARTED: 2x Thugs                                           │
│         ⚔️ Round 1: Jack attacked Thug #1 → 3 damage                       │
│         ⚔️ Round 1: Jill cast Fireball → 5 damage (AoE)                    │
│         ⚔️ Round 2: Jack finished Thug #1                                  │
│         ⚔️ Round 2: Thug #2 fled                                           │
│         COMBAT ENDED: Victory (2 min)                                      │
│                                                                             │
│  19:25  NODE: The Fork in the Road                                         │
│         💬 Seer: "The path splits here..."                                 │
│                                                                             │
│  21:15  SESSION PAUSED                                                     │
│         Reason: "Continuing next week"                                     │
│         Party state saved at: The Fork                                     │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

### Progress Dashboard Component Architecture

```typescript
// Component tree
ProgressDashboard
├── DashboardHeader
│   ├── BackButton
│   ├── AdventureTitle
│   └── DashboardLabel
├── MainContent (flex row)
│   ├── AdventureMapPanel
│   │   ├── NodeGraph (visual node map)
│   │   │   ├── NodeMarker (visited/unvisited/current)
│   │   │   └── PathLine (taken/available)
│   │   ├── ProgressBar
│   │   └── MapLegend
│   └── SessionHistoryPanel
│       └── SessionCard (for each session)
│           ├── SessionMeta (date, duration)
│           ├── PlayerList
│           ├── SessionStatus
│           └── ActionButtons (View Log, Resume)
├── PlayerParticipationPanel
│   └── PlayerRow (for each player)
│       ├── CharacterInfo
│       ├── SessionCount
│       ├── TotalPlaytime
│       └── ParticipationBar
└── EventLogModal (when viewing session log)
    ├── LogHeader
    ├── FilterBar
    └── EventTimeline
        └── EventEntry (per event)
```

### TypeScript Interfaces

```typescript
// Progress Dashboard types
interface AdventureProgress {
  adventureId: string;
  totalNodes: number;
  visitedNodes: string[];
  currentNodeId: string | null;
  completionPercent: number;
  pathsTaken: PathRecord[];
  estimatedTimeRemaining: number; // minutes
}

interface PathRecord {
  fromNodeId: string;
  toNodeId: string;
  timestamp: string;
  sessionId: string;
}

interface SessionSummary {
  id: string;
  adventureId: string;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  startNodeId: string;
  endNodeId: string | null;
  players: SessionPlayerSummary[];
  pauseReason?: string;
}

interface SessionPlayerSummary {
  oderId: string;
  odername: string;
  characterId: string;
  characterName: string;
  characterClass: string;
  joinedAt: string;
  leftAt: string | null;
  disconnectEvents: number;
  finalState: {
    hp: number;
    maxHp: number;
    conditions: string[];
  };
}

interface PlayerParticipation {
  oderId: string;
  characterId: string;
  characterName: string;
  characterClass: string;
  sessionCount: number;
  totalPlaytimeMinutes: number;
  lastSessionDate: string;
  rollCount: number;
  combatActions: number;
}

interface SessionEvent {
  id: string;
  sessionId: string;
  timestamp: string;
  type: EventType;
  data: EventData;
}

type EventType = 
  | 'session_start'
  | 'session_end'
  | 'player_join'
  | 'player_leave'
  | 'node_enter'
  | 'decision_made'
  | 'roll_made'
  | 'combat_start'
  | 'combat_action'
  | 'combat_end'
  | 'announcement'
  | 'chat_message';

// Event data varies by type
interface RollEventData {
  playerId: string;
  characterName: string;
  attribute: Attribute;
  difficulty: number;
  roll: number;
  modifiers: number;
  total: number;
  success: boolean;
  context: string;
}

interface CombatEventData {
  combatId: string;
  round?: number;
  actorName: string;
  actorType: 'player' | 'enemy';
  action: string;
  targetName?: string;
  damage?: number;
  outcome: string;
}

interface DecisionEventData {
  nodeId: string;
  nodeName: string;
  choiceLabel: string;
  targetNodeId: string;
  targetNodeName: string;
}
```

### Progress Dashboard Hooks

```typescript
interface UseProgressDashboard {
  // Data
  adventure: Adventure;
  progress: AdventureProgress;
  sessions: SessionSummary[];
  playerParticipation: PlayerParticipation[];
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  resumeSession: (sessionId: string) => Promise<void>;
  viewSessionLog: (sessionId: string) => void;
  exportSessionLog: (sessionId: string, format: 'json' | 'csv' | 'pdf') => Promise<void>;
}

interface UseSessionLog {
  events: SessionEvent[];
  isLoading: boolean;
  filters: EventFilter;
  setFilters: (filters: EventFilter) => void;
  exportLog: (format: 'json' | 'csv' | 'pdf') => Promise<void>;
}

interface EventFilter {
  types: EventType[];
  playerIds: string[];
  startTime?: string;
  endTime?: string;
  searchQuery?: string;
}
```

### Database Tables for Progress Tracking

```sql
-- Session events table (append-only log)
CREATE TABLE session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Index for efficient querying
  INDEX idx_session_events_session (session_id, created_at),
  INDEX idx_session_events_type (event_type)
);

-- Node visits table (for progress tracking)
CREATE TABLE node_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  adventure_id UUID REFERENCES adventures(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  exited_at TIMESTAMPTZ,
  time_spent_seconds INTEGER,
  
  UNIQUE(session_id, node_id, entered_at)
);

-- Player session participation
CREATE TABLE session_participation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  disconnect_count INTEGER DEFAULT 0,
  final_state JSONB, -- HP, conditions, etc. at departure
  
  UNIQUE(session_id, user_id)
);

-- RLS policies
ALTER TABLE session_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participation ENABLE ROW LEVEL SECURITY;

-- Seer can view all events for their sessions
CREATE POLICY "Seer can view session events"
  ON session_events FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM game_sessions WHERE seer_id = auth.uid()
    )
  );

-- Players can view events for sessions they participated in
CREATE POLICY "Players can view their session events"
  ON session_events FOR SELECT
  USING (
    session_id IN (
      SELECT session_id FROM session_participation WHERE user_id = auth.uid()
    )
  );
```

---

## Testing Requirements

### Unit Tests

```typescript
describe('SeerDashboard', () => {
  describe('NodeView', () => {
    it('should render story node content', () => {
      const node = createStoryNode();
      render(<NodeView node={node} onNavigate={jest.fn()} onAction={jest.fn()} />);
      
      expect(screen.getByText(node.title)).toBeInTheDocument();
      expect(screen.getByText(node.content)).toBeInTheDocument();
    });

    it('should show read aloud text when present', () => {
      const node = createStoryNode({ readAloudText: 'Read this aloud!' });
      render(<NodeView node={node} onNavigate={jest.fn()} onAction={jest.fn()} />);
      
      expect(screen.getByTestId('read-aloud-box')).toBeInTheDocument();
      expect(screen.getByText('Read this aloud!')).toBeInTheDocument();
    });

    it('should show challenge panel for challenge nodes', () => {
      const node = createChallengeNode({ attribute: 'wit', difficulty: 12 });
      render(<NodeView node={node} onNavigate={jest.fn()} onAction={jest.fn()} />);
      
      expect(screen.getByText('WIT Check')).toBeInTheDocument();
      expect(screen.getByText('Difficulty: 12')).toBeInTheDocument();
    });

    it('should render navigation options', () => {
      const node = createDecisionNode();
      const connections = [
        { id: '1', targetNodeId: 'a', label: 'Go left' },
        { id: '2', targetNodeId: 'b', label: 'Go right' },
      ];
      
      render(
        <NodeView 
          node={node} 
          connections={connections}
          onNavigate={jest.fn()} 
          onAction={jest.fn()} 
        />
      );
      
      expect(screen.getByText('Go left')).toBeInTheDocument();
      expect(screen.getByText('Go right')).toBeInTheDocument();
    });
  });

  describe('PlayerSidebar', () => {
    it('should render all players', () => {
      const players = [
        createPlayer({ name: 'Thorin' }),
        createPlayer({ name: 'Legolas' }),
      ];
      
      render(<PlayerSidebar players={players} onPlayerAction={jest.fn()} />);
      
      expect(screen.getByText('Thorin')).toBeInTheDocument();
      expect(screen.getByText('Legolas')).toBeInTheDocument();
    });

    it('should show HP bar with correct percentage', () => {
      const player = createPlayer({ currentHitPoints: 3, maxHitPoints: 6 });
      render(<PlayerSidebar players={[player]} onPlayerAction={jest.fn()} />);
      
      const hpFill = screen.getByTestId('hp-fill');
      expect(hpFill).toHaveStyle({ width: '50%' });
    });

    it('should show disconnected indicator', () => {
      const player = createPlayer({ isConnected: false });
      render(<PlayerSidebar players={[player]} onPlayerAction={jest.fn()} />);
      
      expect(screen.getByTestId('disconnected-indicator')).toBeInTheDocument();
    });
  });

  describe('AISeerPanel', () => {
    it('should submit question and show response', async () => {
      mockAISeerResponse({ suggestion: 'Try a WIT check!' });
      
      render(<AISeerPanel sessionId="123" currentNode={createNode()} />);
      
      await userEvent.type(screen.getByPlaceholderText(/ask/i), 'Can they read the runes?');
      await userEvent.click(screen.getByRole('button', { name: /ask/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Try a WIT check!')).toBeInTheDocument();
      });
    });

    it('should show loading state', async () => {
      mockAISeerResponse({ suggestion: 'Response' }, { delay: 1000 });
      
      render(<AISeerPanel sessionId="123" currentNode={createNode()} />);
      
      await userEvent.type(screen.getByPlaceholderText(/ask/i), 'Question');
      await userEvent.click(screen.getByRole('button', { name: /ask/i }));
      
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });
  });
});
```

### Integration Tests

```typescript
describe('Dashboard Integration', () => {
  it('should navigate to new node and update state', async () => {
    const { session, seerToken } = await setupActiveSession();
    
    render(<SeerDashboard sessionId={session.id} />, { authToken: seerToken });
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('current-node')).toBeInTheDocument();
    });
    
    // Click navigation option
    await userEvent.click(screen.getByText('Enter the cave'));
    
    // Confirm navigation
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));
    
    // Should show new node
    await waitFor(() => {
      expect(screen.getByText('Inside the Cave')).toBeInTheDocument();
    });
  });

  it('should heal player and update HP', async () => {
    const { session, seerToken, player } = await setupActiveSession();
    player.character.currentHitPoints = 3;
    
    render(<SeerDashboard sessionId={session.id} />, { authToken: seerToken });
    
    await waitFor(() => {
      expect(screen.getByText('3 / 6')).toBeInTheDocument();
    });
    
    await userEvent.click(screen.getByRole('button', { name: '+1 HP' }));
    
    await waitFor(() => {
      expect(screen.getByText('4 / 6')).toBeInTheDocument();
    });
  });
});
```

### E2E Tests

```typescript
describe('Seer Dashboard E2E', () => {
  it('should run through complete node navigation', async () => {
    await loginAsSeer(page);
    await navigateToActiveSession(page);
    
    // Verify dashboard loaded
    await page.waitForSelector('[data-testid="seer-dashboard"]');
    
    // Read current node
    const nodeTitle = await page.textContent('[data-testid="node-title"]');
    expect(nodeTitle).toBeTruthy();
    
    // Click on navigation option
    await page.click('[data-testid="nav-option-0"]');
    
    // Preview modal should appear
    await page.waitForSelector('[data-testid="node-preview-modal"]');
    
    // Confirm navigation
    await page.click('[data-testid="confirm-navigate"]');
    
    // New node should load
    await page.waitForFunction(
      (oldTitle) => document.querySelector('[data-testid="node-title"]')?.textContent !== oldTitle,
      nodeTitle
    );
  });

  it('should handle combat flow from dashboard', async () => {
    await loginAsSeer(page);
    await navigateToCombatNode(page);
    
    // Start combat
    await page.click('[data-testid="start-combat-button"]');
    
    // Combat view should appear
    await page.waitForSelector('[data-testid="combat-view"]');
    
    // Enemy turn - select action
    await page.click('[data-testid="enemy-action-attack"]');
    await page.click('[data-testid="target-player-0"]');
    await page.click('[data-testid="confirm-action"]');
    
    // Combat log should update
    await page.waitForSelector('[data-testid="combat-log-entry"]');
  });
});
```

---

## Implementation Checklist

### Frontend Components
- [ ] Create `SeerDashboard` container
- [ ] Create `DashboardHeader` component
- [ ] Create `NodeView` component
- [ ] Create `ReadAloudBox` component
- [ ] Create `SeerNotesBox` component
- [ ] Create `NodeNavigation` component
- [ ] Create `PlayerSidebar` component
- [ ] Create `PlayerCard` component
- [ ] Create `AISeerPanel` component
- [ ] Create `QuickActionBar` component
- [ ] Create `CombatView` integration
- [ ] Create `HistoryPanel` component
- [ ] Create `SettingsModal` component
- [ ] Create `AnnouncementModal` component

### Hooks & State
- [ ] Create `useSeerDashboard` hook
- [ ] Create `useNodeNavigation` hook
- [ ] Create `usePlayerActions` hook
- [ ] Create `useAISeer` hook
- [ ] Add real-time subscriptions

### API Integration
- [ ] Connect navigation to session state API
- [ ] Connect player actions to character API
- [ ] Connect combat to combat API
- [ ] Connect AI questions to AI API

### Polish
- [ ] Add keyboard shortcuts
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add responsive design
- [ ] Add accessibility (a11y)
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Write E2E tests

---

## Appendix

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Toggle read aloud highlight |
| `N` | Focus navigation options |
| `R` | Open roll dialog |
| `C` | Toggle combat panel |
| `A` | Focus AI input |
| `P` | Pause/resume session |
| `Esc` | Close modal/cancel action |
| `1-6` | Select player by number |

### Performance Requirements

| Metric | Target |
|--------|--------|
| Initial load | <2 seconds |
| Node navigation | <500ms |
| Player action | <200ms |
| AI response | <3 seconds |
| Real-time update | <100ms |
