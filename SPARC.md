# SPARC Game Engine Technical Specification

## Project Overview

SPARC is a simplified fantasy role-playing game designed as a gateway RPG for newcomers. The game features:
- Entry-level mechanics for RPG newcomers
- Adventures completed in 1 hour or less
- Episode-based storytelling with logical conclusions
- In-person play with digital Seer tools

## Game Philosophy
- Collaborative storytelling focused on player choice and exploration
- No win/lose objectives - goal is to tell stories and have adventures
- Accessible to new players while being engaging for experienced ones
- Gateway game for first-time Seers and players

## System Architecture

### Core Platform: Web Application
- **Target Platform:** Web-based application
- **Play Style:** In-person with Seer-operated interface
- **Session Management:** Episode-based with save/checkpoint system
- **Character Persistence:** Cross-adventure character usage with level scaling

### Main Components

#### 1. User Management System
- User accounts supporting multiple characters
- Seer permissions and capabilities
- Character creation and management
- Cross-adventure character compatibility

#### 2. Game Engine Core
- **Dice System:** D6-based mechanics with digital rolling option
- **Combat System:** Turn-based combat with automatic turn order management
- **State Management:** Real-time session state tracking
- **Scaling System:** Characters can scale down but not beyond achieved level

#### 3. Seer Interface (Primary Interface)
- **Single Monitor Design:** Optimized for one-screen operation
- **Optional Screen Sharing:** For artwork display and dice rolling
- **Turn Order Tracking:** Private Seer reference for managing player turns
- **Digital Dice Integration:** 
  - Spinning d6 animations
  - Seer-announced results
  - Optional player rolling capability
- **AI Seer Assistant:** Context-aware suggestions for improvisation

#### 4. Adventure System
- **Runtime Engine:** Executes pre-built adventures
- **Episode Management:** Logical save points and progression tracking
- **Node-Based Structure:** Story, encounter, decision, and logic nodes
- **AI Integration:** Responds to unexpected player actions without derailing adventure

#### 5. Forge (Adventure Builder)
- **Visual Editor:** Drag-and-drop node-based interface
- **Node Types:**
  - Story nodes (with artwork integration)
  - Encounter nodes
  - Decision nodes
  - Puzzle/skill check nodes
  - Branching logic nodes (if/then conditions)
- **Monster Library Integration:** Pre-made monsters available for encounters
- **Adventure Testing:** Tools for solo Seer playtesting
- **Publishing System:** Share adventures with community

## Technical Specifications

### Gameplay Mechanics

#### Combat System
- **Initiative:** Single d6 roll determines turn order
- **Attack Resolution:** Stat-based dice pools vs. defending dice pools
- **Damage Calculation:** Automatic calculation with transparent die roll display
- **Melee Engagement:** Penalty system for ranged attacks while engaged
- **Special Abilities:** Class-specific abilities with double-roll replenishment

#### Character System
- **Classes:** 7 available classes (Cleric, Necromancer, Paladin, Ranger, Rogue, Warrior, Wizard)
- **Stats:** STR, DEX, INT, CHA with class-specific distributions
- **Special Abilities:** One per class with replenishment mechanics
- **Heroic Saves:** Reroll mechanism available to all classes
- **HP System:** Class-based hit points with healing mechanics

#### Adventure Structure
- **Node-Based Flow:** Adventures built from connected nodes
- **Branching Support:** Multiple paths from single nodes
- **Convergence Support:** Multiple paths leading to single nodes
- **Episode Breaks:** Natural stopping points with sense of achievement
- **Save System:** Checkpoint system for session continuity

### Interface Design

#### Main Seer Interface Elements
- **Primary Story Panel:** Main adventure display with artwork integration
- **Collapsible Side Panels:**
  - Turn order tracker (Seer reference)
  - Active monster/NPC health tracking
  - AI Seer assistant panel
  - Digital dice roller with animations
- **Episode Progress Indicator:** Shows advancement through adventure
- **Quick Save/Checkpoint Buttons:** Manual save functionality
- **Screen Share Mode:** Clean display for showing players

#### Player Interaction Model
- **Physical Character Sheets:** Players track own stats and HP
- **Physical or Digital Dice:** Player choice with Seer digital backup
- **In-Person Communication:** All interaction through Seer facilitation

### Party Management
- **Optimal Size:** 4 players (system warns when outside recommended range)
- **Flexible Composition:** Multiple players can choose same class
- **Dynamic Scaling:** Characters adjust down to party level automatically

### AI Seer Integration
- **Pre-built Adventure Adherence:** Follows scripted adventure structure
- **Improvisation Capability:** Responds to unexpected player actions
- **Context Awareness:** Understands current adventure state and player history
- **Non-Derailing:** Keeps unexpected actions within adventure bounds

## Data Models

### User Account Structure
- User ID and authentication
- Character roster (multiple characters per user)
- Seer permissions and experience
- Adventure creation history (for Forge users)

### Character Data Model
- Character ID and name
- Class selection and associated stats
- Current HP and maximum HP
- Special ability and Heroic Save availability status
- Experience points and level
- Adventure participation history

### Adventure Data Structure
- Adventure metadata (title, description, estimated duration)
- Node network (story, encounter, decision, logic nodes)
- Monster/NPC references
- Episode break points
- Artwork and media assets

### Session State Management
- Active party composition
- Current adventure node
- Turn order and initiative
- Monster/NPC health tracking
- Episode progress and save data

## Monster System
*[Space reserved for monster stat blocks, special abilities, and library structure]*

## Character Classes & Stats
*[Space reserved for detailed character class statistics, abilities, and progression rules]*

## Adventure Examples
*[Space reserved for sample adventures demonstrating node connections and flow]*

## Technical Stack Recommendations

### Frontend
- **Framework:** React.js or Vue.js
- **UI Components:** Modern component library for drag-and-drop functionality
- **Real-time Updates:** WebSocket integration for dice animations
- **Responsive Design:** Single-screen optimization with optional full-screen modes

### Backend
- **API Framework:** Node.js or Python-based RESTful API
- **Database:** PostgreSQL for complex adventure structures and relationships
- **Real-time Communication:** WebSocket server for live updates
- **File Storage:** Cloud storage for adventure artwork and assets

### Development Priorities

#### Phase 1: Core Engine
1. Basic Seer interface with adventure navigation
2. Character creation and management
3. Turn-based combat system
4. Digital dice rolling with animations

#### Phase 2: Adventure System
1. Node-based adventure runtime
2. Episode save/load functionality
3. Monster integration
4. AI Seer basic responses

#### Phase 3: Forge Builder
1. Visual node editor
2. Monster library integration
3. Adventure testing tools
4. Publishing system

#### Phase 4: Advanced Features
1. Enhanced AI Seer capabilities
2. Community features
3. Advanced artwork integration
4. Performance optimization

## Success Metrics
- Adventure completion rate in under 1 hour
- New player onboarding success
- Seer engagement with Forge tools
- Community adventure sharing and rating