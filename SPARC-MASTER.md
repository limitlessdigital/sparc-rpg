# SPARC RPG - Master Specification

> **SPARC** = Simplified Playable Adventure Role-playing Core  
> A gateway fantasy RPG designed for newcomers with 1-hour adventures and D6-only mechanics.

---

## Table of Contents
1. [Vision & Philosophy](#vision--philosophy)
2. [Game Design](#game-design)
3. [Technical Architecture](#technical-architecture)
4. [Adventure Forge](#adventure-forge)
5. [AI Seer Assistant](#ai-seer-assistant)
6. [Implementation Status](#implementation-status)

---

## Vision & Philosophy

### Core Goals
- **Gateway RPG**: First tabletop experience for newcomers
- **1-Hour Adventures**: Complete stories with satisfying endings
- **Zero-Prep GMing**: Digital tools handle the complexity
- **Cognitive Offloading**: System manages rules so players focus on story

### Design Principles
- First 5 minutes determine if players return
- Seer (GM) confidence matters more than rule mastery
- Story depth compensates for mechanical simplicity
- "What do I actually DO?" must be immediately clear

### Success Metrics
- 85%+ first-session completion rate
- Character creation in under 5 minutes
- New Seers report confidence running games
- Sessions complete within 75 minutes

---

## Game Design

### Character System

**Attributes** (4 total, D6-based)
| Attribute | Description |
|-----------|-------------|
| Might (STR) | Physical power and endurance |
| Grace (DEX) | Agility and precision |
| Wit (INT) | Knowledge and problem-solving |
| Heart (CHA) | Charisma and social influence |

**Classes** (7 available)
- Cleric, Necromancer, Paladin, Ranger, Rogue, Warrior, Wizard
- Each has unique stat distribution and one special ability
- Multiple players can choose the same class

**Character Creation Flow**
1. Pick fantasy archetype (shows stats/abilities clearly)
2. Name your character
3. Equipment auto-assigned based on class
→ Complete in under 5 minutes

### Dice Mechanics

**D6-Only System**
- All rolls use standard 6-sided dice
- Attribute determines dice pool size (1-6 dice)
- Roll vs. difficulty threshold

**Combat**
- Initiative: Single D6 determines turn order
- Attack: Stat-based dice pools vs. defending pools
- Damage: Automatic calculation with transparent display
- Special Abilities: Class-specific, replenish on double-roll

**Heroic Saves**
- Reroll mechanism available to all classes
- One use per encounter

### Party & Sessions

- **Optimal Party Size**: 4 players (system warns outside range)
- **Scaling**: Characters can scale down to party level
- **Play Style**: In-person with Seer-operated digital interface
- **Session Length**: ~60 minutes with episode breaks

---

## Technical Architecture

### Platform Overview
- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: FastAPI (Python) with Pydantic validation
- **Database**: Supabase (PostgreSQL + Row Level Security)
- **Real-time**: HTTP polling (WebSocket upgrade for <100ms dice)
- **AI**: OpenAI API for Seer Assistant

### Core Data Models

```python
# Character
class SparcCharacter:
    id: str
    user_id: str
    name: str  # max 50 chars
    primary_attribute: Attribute  # Might/Grace/Wit/Heart, value 1-6
    equipment: List[str]
    background: str
    hit_points: int  # default 6, max 6
    
# Session
class SparcSession:
    id: str
    seer_id: str  # GM user ID
    adventure_id: str
    status: Enum  # waiting/active/completed/cancelled
    players: List[str]  # max 6
    current_scene: int
    
# Dice Roll
class DiceRoll:
    id: str
    session_id: str
    character_id: str
    dice_count: int  # 1-10
    results: List[int]  # each 1-6
    difficulty: int  # 3-18
    success: bool
```

### Performance Requirements
| Operation | Target |
|-----------|--------|
| Dice rolls | <100ms P95 |
| AI Seer response | <3 seconds |
| Adventure loading | <2 seconds |
| Real-time sync | <2 seconds |

### API Endpoints

```
POST /api/sparc/characters          # Create character
GET  /api/sparc/characters/{id}     # Get character

POST /api/sparc/sessions            # Create session
GET  /api/sparc/sessions/{id}       # Get session state
POST /api/sparc/sessions/{id}/join  # Join session

POST /api/sparc/dice/roll           # Roll dice
POST /api/sparc/ai/advice           # Get Seer advice

GET  /api/sparc/adventures          # List adventures
GET  /api/sparc/adventures/{id}     # Get adventure content
```

---

## Adventure Forge

### Overview
Visual node-based editor for creating branching adventures. Seers can build, test, and share adventures with the community.

### Node Types

| Type | Color | Purpose |
|------|-------|---------|
| Story | Blue | Narrative content, objectives, images |
| Decision | Purple | Player choices with multiple branches |
| Challenge | Yellow | Stat checks (STR/DEX/INT/CHA) |
| Combat | Red | Encounter management |
| Check | Green | Simple pass/fail tests |

### Node Properties

**Story Nodes**
- Title, rich text content
- Optional image (can hide from players)
- Objectives and items
- Experience points
- End conditions (victory/failure)

**Decision Nodes**
- Description and objective
- Multiple choice options
- Each choice connects to different path

**Challenge Nodes**
- Stat selection (STR/DEX/INT/CHA)
- Difficulty threshold
- Success/failure outcomes with different paths

**Combat Nodes**
- Creature selection from library
- Quantity (static or per-player scaling)
- Multiple outcome paths

### Canvas Features
- Infinite canvas with pan/zoom
- Touch-optimized (mobile-first)
- Grid snap and alignment
- Undo/redo
- Real-time collaboration (multiple editors)

### Validation System
- Victory path required
- Failure path required
- No orphaned nodes
- All required fields filled
- Valid connection types

### Publishing Flow
1. Build adventure in canvas
2. Validation checks pass
3. Test with built-in player
4. Publish to community library

---

## AI Seer Assistant

### Purpose
Contextual AI assistance for GMs to handle unexpected player actions and provide rule clarifications without breaking immersion.

### Features
- **Improvisation Support**: Suggests rolls and outcomes for unexpected actions
- **Rule Lookups**: Quick reference via shortcodes
- **Creative Confidence**: Encourages GM creativity with structured guidance
- **Non-Derailing**: Keeps actions within adventure bounds

### Shortcode Examples
- "How does combat work?" → Step-by-step checklist
- "What is the player order?" → Auto-generated turn display
- "Can player do X?" → Suggested stat check and difficulty

### Technical Implementation
- Context-aware prompting based on game state
- Response caching for common scenarios
- Fallback responses for API timeout/failure
- <3 second response requirement

### Example Request/Response

```json
// Request
{
  "session_id": "abc123",
  "scene_context": "Players in dark forest",
  "player_action": "I want to befriend the wolf",
  "difficulty_level": "medium"
}

// Response
{
  "suggestion": "Have them roll Heart (CHA) against difficulty 12. On success, the wolf becomes a temporary ally.",
  "rule_clarification": "Animal handling uses Heart stat",
  "narrative_hook": "The wolf's eyes soften as it senses no threat...",
  "response_time_ms": 1200
}
```

---

## Implementation Status

### Completed (per Adventure Forge tracking)
- [x] Canvas with pan/zoom and touch support
- [x] All 5 node types with property panels
- [x] Connection system with bezier curves
- [x] Real-time validation engine
- [x] Adventure save/load/export
- [x] Adventure sharing system
- [x] State tracking (inventory, variables)
- [x] Conditional branching logic

### Remaining Work
- [ ] WebGL performance optimization for 100+ nodes
- [ ] Minimap navigation
- [ ] Keyboard shortcuts
- [ ] Rich text editor integration
- [ ] Combat encounter builder
- [ ] Adventure analytics
- [ ] Full backend API implementation
- [ ] Mobile app optimization
- [ ] AI Seer production deployment

### File Structure
```
sparc-rpg/
├── SPARC-MASTER.md          # This file
├── python/                   # Backend (FastAPI)
│   └── src/
│       └── server/
│           ├── api_routes/   # REST endpoints
│           └── services/     # Business logic
└── src/                      # Frontend (React)
    └── components/
        └── AdventureForge/   # Editor components
```

---

## Design Assets
- `Sparc UI comps.pdf` - UI mockups and designs
- `Sparc-StyleGuide 2.pdf` - Brand guidelines

## Archived Documents
The following documents were consolidated into this master spec:
- `SPARC.md` - Original technical overview
- `brainstorming-session-results.md` - User research
- `adventure-forge-prototype.md` - Prototype specs
- `adventure-forge-core-implementation.md` - Implementation tracking
- `collaboration-api-spec.md` - Real-time API details
- `component-specifications.md` - React component specs
- `sparc-rpg-game-engine.md` - Full PRD-style spec

---

*Last updated: January 28, 2026*
