# PRD 29: Maps & VTT Lite

> **Status**: Ready for Implementation  
> **Priority**: P2 - Medium  
> **Estimated Effort**: 6 weeks  
> **Dependencies**: 04-session-management, 08-canvas-system, 17-database-schema

---

## Overview

Maps & VTT Lite provides a lightweight virtual tabletop experience for SPARC RPG. Designed to enhance narrative-focused gameplay rather than replace theater of the mind, it offers simple grid-based maps, token placement, and fog of war without the complexity of full VTT systems.

### Goals
- Simple grid-based map display
- Token placement and movement
- Fog of war (reveal/hide areas)
- Basic drawing tools for Seers
- Map sharing and permissions
- Pre-made template library
- Lightweight and fast (no physics simulation)

### Non-Goals
- Complex lighting and line-of-sight calculations
- Dynamic lighting per token
- 3D maps or isometric views
- Animated terrain or effects
- Full combat automation
- Hex grids (square only for v1)

### Design Philosophy

SPARC is a narrative-focused RPG where story trumps tactical simulation. The VTT Lite exists to:
1. Help players visualize spatial relationships
2. Track token positions during combat
3. Reveal areas dramatically with fog of war
4. Stay out of the way during roleplay

---

## User Stories

### Map Display

### US-01: View Map
**As a** player  
**I want to** see the current map during sessions  
**So that** I understand the environment

**Acceptance Criteria:**
- [ ] Map displays in session view
- [ ] Pan and zoom controls work smoothly
- [ ] Grid overlay visible
- [ ] Works on desktop and mobile
- [ ] Matches design system aesthetics

### US-02: Create Map
**As a** Seer  
**I want to** create maps for my adventures  
**So that** I can visualize scenes

**Acceptance Criteria:**
- [ ] Upload background image
- [ ] Set grid dimensions (columns × rows)
- [ ] Adjust grid alignment to image
- [ ] Set map name and description
- [ ] Save to map library

### US-03: Import Map Image
**As a** Seer  
**I want to** upload an existing map image  
**So that** I can use maps from other sources

**Acceptance Criteria:**
- [ ] Support PNG, JPG, WebP formats
- [ ] Maximum 10MB file size
- [ ] Auto-detect suggested grid size
- [ ] Manual grid adjustment tools
- [ ] Image compression for storage

### Token System

### US-04: Place Tokens
**As a** Seer  
**I want to** place tokens on the map  
**So that** players can see positions

**Acceptance Criteria:**
- [ ] Drag and drop tokens onto grid
- [ ] Tokens snap to grid cells
- [ ] Token size options (1×1, 2×2, 3×3)
- [ ] Custom token images
- [ ] Default token set included

### US-05: Move Tokens
**As a** player  
**I want to** move my character token  
**So that** I can reposition during play

**Acceptance Criteria:**
- [ ] Drag token to new position
- [ ] Movement constrained by Seer permissions
- [ ] Movement shows path briefly
- [ ] Other players see movement in real-time
- [ ] Undo last move option

### US-06: Token Properties
**As a** Seer  
**I want to** set token properties  
**So that** I can distinguish characters and NPCs

**Acceptance Criteria:**
- [ ] Token name (visible or hidden)
- [ ] Token color/border
- [ ] Token size
- [ ] Link to character (for players)
- [ ] Status indicators (conditions)
- [ ] HP bar option

### Fog of War

### US-07: Fog of War Control
**As a** Seer  
**I want to** hide and reveal map areas  
**So that** I can create dramatic reveals

**Acceptance Criteria:**
- [ ] Entire map starts hidden by default (option)
- [ ] Rectangular reveal tool
- [ ] Freeform reveal brush
- [ ] Polygon reveal tool
- [ ] Hide previously revealed areas
- [ ] Players only see revealed areas

### US-08: Progressive Reveal
**As a** Seer  
**I want to** reveal areas as players explore  
**So that** the map unfolds naturally

**Acceptance Criteria:**
- [ ] Click to reveal single cells
- [ ] Shift-click for area reveal
- [ ] Undo/redo reveal actions
- [ ] Save reveal state per session
- [ ] Reset fog option

### Drawing Tools

### US-09: Draw on Map
**As a** Seer  
**I want to** draw on the map  
**So that** I can annotate during play

**Acceptance Criteria:**
- [ ] Freehand drawing tool
- [ ] Straight line tool
- [ ] Rectangle and circle shapes
- [ ] Color picker
- [ ] Line thickness options
- [ ] Eraser tool

### US-10: Drawing Layers
**As a** Seer  
**I want to** organize drawings in layers  
**So that** I can manage map elements

**Acceptance Criteria:**
- [ ] Background layer (map image)
- [ ] GM layer (Seer-only annotations)
- [ ] Token layer (characters and NPCs)
- [ ] Drawing layer (visible to all)
- [ ] Toggle layer visibility
- [ ] Lock layers

### Map Management

### US-11: Map Library
**As a** Seer  
**I want to** manage my map collection  
**So that** I can reuse maps across sessions

**Acceptance Criteria:**
- [ ] View all my maps
- [ ] Search and filter maps
- [ ] Organize in folders
- [ ] Duplicate maps
- [ ] Delete maps (with confirmation)
- [ ] Share maps with other Seers

### US-12: Template Maps
**As a** Seer  
**I want to** use pre-made map templates  
**So that** I can quickly set up common scenes

**Acceptance Criteria:**
- [ ] Tavern template
- [ ] Dungeon room template
- [ ] Forest clearing template
- [ ] Town square template
- [ ] Cave template
- [ ] Castle throne room template
- [ ] Templates customizable after selection

---

## Technical Specification

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      VTT Lite Layer                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Canvas Renderer (React)                 │   │
│  │  - Background image                                  │   │
│  │  - Grid overlay (SVG)                               │   │
│  │  - Fog of war (Canvas 2D)                           │   │
│  │  - Tokens (positioned divs)                         │   │
│  │  - Drawings (SVG/Canvas)                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              State Manager (Zustand)                │   │
│  │  - Map state                                        │   │
│  │  - Token positions                                  │   │
│  │  - Fog revealed areas                               │   │
│  │  - Drawing strokes                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Real-time Sync (WebSocket)             │   │
│  │  - Position updates                                 │   │
│  │  - Fog changes                                      │   │
│  │  - Drawing strokes                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Models

```typescript
// Map definition
interface VttMap {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  
  // Image
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  
  // Grid
  gridColumns: number;
  gridRows: number;
  gridOffsetX: number;     // Alignment adjustment
  gridOffsetY: number;
  gridColor: string;
  gridOpacity: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  isTemplate: boolean;
  tags: string[];
}

// Session map state (per-session instance of a map)
interface SessionMapState {
  id: string;
  sessionId: string;
  mapId: string;
  
  // Fog of war (encoded as polygon/rectangle collection)
  fogRevealed: FogRegion[];
  fogEnabled: boolean;
  
  // Tokens on this map
  tokens: MapToken[];
  
  // Drawings
  drawings: Drawing[];
  
  // Active layer for editing
  activeLayer: 'background' | 'gm' | 'tokens' | 'drawings';
}

// Token on map
interface MapToken {
  id: string;
  characterId?: string;    // Linked character (optional)
  name: string;
  imageUrl?: string;
  
  // Position (grid coordinates)
  x: number;
  y: number;
  
  // Size in grid cells
  width: number;           // 1, 2, or 3
  height: number;
  
  // Appearance
  color: string;
  borderColor: string;
  showName: boolean;
  showHpBar: boolean;
  hp?: number;
  maxHp?: number;
  
  // Status
  conditions: string[];    // ['poisoned', 'stunned']
  
  // Permissions
  controlledBy: string[];  // User IDs who can move
  isHidden: boolean;       // Only Seer sees
}

// Fog of war region
type FogRegion = 
  | { type: 'rect'; x: number; y: number; width: number; height: number }
  | { type: 'polygon'; points: [number, number][] }
  | { type: 'circle'; cx: number; cy: number; radius: number };

// Drawing stroke
interface Drawing {
  id: string;
  type: 'path' | 'line' | 'rect' | 'circle' | 'text';
  layer: 'gm' | 'drawings';
  
  // Styling
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string;
  
  // Path data (for freehand)
  path?: string;           // SVG path d attribute
  
  // Shape data
  x1?: number; y1?: number;
  x2?: number; y2?: number;
  width?: number; height?: number;
  radius?: number;
  
  // Text
  text?: string;
  fontSize?: number;
  
  createdBy: string;
  createdAt: string;
}
```

### API Endpoints

```yaml
# Map CRUD
POST   /api/v1/maps                    # Create map
GET    /api/v1/maps                    # List user's maps
GET    /api/v1/maps/{id}               # Get map
PUT    /api/v1/maps/{id}               # Update map
DELETE /api/v1/maps/{id}               # Delete map

# Map image upload
POST   /api/v1/maps/{id}/image         # Upload map image

# Session map state
GET    /api/v1/sessions/{id}/map       # Get current map state
PUT    /api/v1/sessions/{id}/map       # Set session map
PATCH  /api/v1/sessions/{id}/map       # Update map state

# Token operations
POST   /api/v1/sessions/{id}/tokens    # Add token
PUT    /api/v1/sessions/{id}/tokens/{tokenId}  # Update token
DELETE /api/v1/sessions/{id}/tokens/{tokenId}  # Remove token

# Real-time (WebSocket)
WS     /api/v1/sessions/{id}/map/ws    # Map updates stream
```

### WebSocket Events

```typescript
// Client → Server
type ClientMapEvent = 
  | { type: 'token_move'; tokenId: string; x: number; y: number }
  | { type: 'fog_reveal'; region: FogRegion }
  | { type: 'fog_hide'; region: FogRegion }
  | { type: 'drawing_add'; drawing: Drawing }
  | { type: 'drawing_remove'; drawingId: string };

// Server → Client
type ServerMapEvent =
  | { type: 'map_changed'; mapId: string }
  | { type: 'token_moved'; tokenId: string; x: number; y: number; by: string }
  | { type: 'token_added'; token: MapToken }
  | { type: 'token_removed'; tokenId: string }
  | { type: 'fog_updated'; revealed: FogRegion[] }
  | { type: 'drawing_added'; drawing: Drawing }
  | { type: 'drawing_removed'; drawingId: string }
  | { type: 'full_sync'; state: SessionMapState };
```

### Rendering Strategy

```typescript
// Layer rendering order (bottom to top)
const layers = [
  'background',    // Map image
  'grid',          // Grid lines
  'drawings',      // Player-visible drawings
  'tokens',        // Character and NPC tokens
  'fog',           // Fog of war overlay
  'gm-drawings',   // Seer-only annotations (Seer view only)
  'selection',     // Selected token indicator
  'cursor',        // Other users' cursors
];

// Performance optimizations
const renderOptimizations = {
  // Only re-render changed layers
  layerCaching: true,
  
  // Limit fog region complexity
  maxFogPolygonPoints: 1000,
  
  // Debounce WebSocket position updates
  tokenMoveDebounceMs: 50,
  
  // Compress drawing paths
  pathSimplification: true,
  
  // Lazy load off-screen tokens
  viewportCulling: true,
};
```

---

## UI/UX Specifications

### Map View Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Session: Dragon's Lair           [👁️ View] [📍 Map] [💬]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                                                       │ │
│  │                   MAP CANVAS                          │ │
│  │                                                       │ │
│  │    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░             │ │
│  │    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  (fog)      │ │
│  │    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░             │ │
│  │    ░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░             │ │
│  │    ░░░░░░▓ revealed area ▓░░░░░░░░░░░░░             │ │
│  │    ░░░░░░▓   [🧙] [⚔️]   ▓░░░░░░░░░░░░░             │ │
│  │    ░░░░░░▓               ▓░░░░░░░░░░░░░             │ │
│  │    ░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░             │ │
│  │    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░             │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                          │
│  │ 🔍+ │ │ 🔍- │ │ 🎯  │ │ 📐  │   Zoom / Center / Grid   │
│  └─────┘ └─────┘ └─────┘ └─────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Seer Tools Panel

```
┌─────────────────────────────────────────────────────────────┐
│  SEER MAP TOOLS                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📍 Tokens                                                  │
│  ┌────────────────────────────┐                            │
│  │ [👤] [🐉] [👹] [💀] [➕]  │  Drag to place              │
│  └────────────────────────────┘                            │
│                                                             │
│  🌫️ Fog of War                                             │
│  ┌────────────────────────────┐                            │
│  │ [🔲 Rect] [✏️ Free] [⭕]  │                            │
│  │ [👁️ Reveal] [🙈 Hide]     │                            │
│  │ [Reset Fog]               │                             │
│  └────────────────────────────┘                            │
│                                                             │
│  ✏️ Drawing                                                 │
│  ┌────────────────────────────┐                            │
│  │ [✏️] [📏] [▭] [⭕] [T]    │                            │
│  │ Color: [🔴] Size: [──●──] │                            │
│  │ [🗑️ Eraser] [↩️ Undo]     │                            │
│  └────────────────────────────┘                            │
│                                                             │
│  📚 Layers                                                  │
│  ┌────────────────────────────┐                            │
│  │ [👁️] Drawings             │                            │
│  │ [👁️] Tokens               │                            │
│  │ [👁️] GM Notes             │                            │
│  │ [👁️] Grid                 │                            │
│  └────────────────────────────┘                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Token Properties Modal

```
┌─────────────────────────────────────────────────────────────┐
│  Token Properties                                      [✕]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐   Name: [Goblin Scout_________]              │
│  │          │                                               │
│  │  Token   │   Size: (●) 1×1  ( ) 2×2  ( ) 3×3            │
│  │  Image   │                                               │
│  │          │   Color: [🟢 Green________▼]                 │
│  └──────────┘                                               │
│                                                             │
│  ☐ Link to Character: [Select character...▼]               │
│                                                             │
│  ☑ Show Name          HP: [6] / [6]                        │
│  ☑ Show HP Bar                                             │
│  ☐ Hidden (Seer only)                                      │
│                                                             │
│  Controlled by:                                             │
│  [☑ Seer only] [☐ Linked player] [☐ All players]          │
│                                                             │
│  Conditions:                                                │
│  [☐ Poisoned] [☐ Stunned] [☐ Prone] [☐ Custom...]        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                [Save]      [Delete Token]            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Map Creation Wizard

```
Step 1: Upload Image
┌─────────────────────────────────────────────────────────────┐
│  Create New Map                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │              📁 Drop image here                     │   │
│  │                  or click to browse                 │   │
│  │                                                     │   │
│  │              PNG, JPG, WebP (max 10MB)             │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Or use a template:                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Tavern  │ │  Dungeon │ │  Forest  │ │  Castle  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Step 2: Configure Grid
┌─────────────────────────────────────────────────────────────┐
│  Create New Map                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Map Name: [The Ancient Crypt______________]                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │   ┼─┼─┼─┼─┼─┼─┼─┼─┼─┼                             │   │
│  │   │ │ │ │ │ │ │ │ │ │   (preview with grid)       │   │
│  │   ┼─┼─┼─┼─┼─┼─┼─┼─┼─┼                             │   │
│  │   │ │ │ │ │ │ │ │ │ │                             │   │
│  │   ┼─┼─┼─┼─┼─┼─┼─┼─┼─┼                             │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Grid Size:  Columns: [10]  Rows: [10]                     │
│  Alignment:  X Offset: [0]  Y Offset: [0]                  │
│                                                             │
│  [Auto-detect grid from image]                              │
│                                                             │
│                        [Cancel]  [Create Map]               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Template Maps

### Included Templates

| Template | Grid Size | Description |
|----------|-----------|-------------|
| Tavern | 15×12 | Classic inn with bar, tables, fireplace |
| Dungeon Room | 10×10 | Stone room with doors on each wall |
| Forest Clearing | 12×12 | Open area surrounded by trees |
| Town Square | 16×16 | Central plaza with fountain |
| Cave | 10×8 | Natural cavern with rock formations |
| Throne Room | 14×20 | Castle great hall with throne |
| Ship Deck | 8×20 | Wooden ship top-down view |
| Arena | 12×12 | Circular fighting pit |

### Template Structure

```typescript
interface MapTemplate {
  id: string;
  name: string;
  description: string;
  category: 'interior' | 'exterior' | 'dungeon' | 'special';
  
  // Base map
  imageUrl: string;
  gridColumns: number;
  gridRows: number;
  
  // Pre-placed elements
  suggestedTokens: Array<{
    name: string;
    x: number;
    y: number;
    type: 'npc' | 'object' | 'marker';
  }>;
  
  // Usage tips
  tips: string[];
}
```

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Map load time | <1 second |
| Token move latency | <50ms |
| Fog reveal latency | <100ms |
| Pan/zoom | 60 FPS |
| Max tokens per map | 100 |
| Max map image size | 4096×4096 px |
| Max fog regions | 500 |

### Optimization Strategies

```typescript
// Viewport-based rendering
const ViewportRenderer = {
  // Only render tokens in visible area + buffer
  tokenBuffer: 2,  // cells beyond viewport
  
  // Throttle fog re-renders
  fogRenderDebounce: 100,  // ms
  
  // Simplify distant grid lines when zoomed out
  gridLodThreshold: 0.5,  // zoom level
  
  // Compress drawing paths on save
  pathSimplifyTolerance: 1.5,
};
```

---

## Testing Requirements

### Unit Tests
- [ ] Grid coordinate calculations
- [ ] Fog region merging/splitting
- [ ] Token collision detection
- [ ] Drawing path serialization

### Integration Tests
- [ ] Map CRUD operations
- [ ] Real-time sync between clients
- [ ] Fog reveal visibility per role
- [ ] Token permission enforcement

### E2E Tests
- [ ] Complete map creation flow
- [ ] Session with map and tokens
- [ ] Fog reveal as Seer
- [ ] Player token movement
- [ ] Drawing and erasing

### Performance Tests
- [ ] 100 tokens rendering at 60 FPS
- [ ] Large map (4096×4096) load time
- [ ] 10 concurrent users syncing
- [ ] Rapid fog changes

---

## Implementation Phases

### Phase 1: Core Display (Weeks 1-2)
- [ ] Map canvas component
- [ ] Grid overlay
- [ ] Pan and zoom controls
- [ ] Map image upload
- [ ] Basic CRUD API

### Phase 2: Tokens (Weeks 2-3)
- [ ] Token placement and movement
- [ ] Token properties modal
- [ ] Real-time position sync
- [ ] Token linking to characters
- [ ] Default token set

### Phase 3: Fog of War (Weeks 3-4)
- [ ] Fog overlay rendering
- [ ] Reveal/hide tools
- [ ] Fog state persistence
- [ ] Role-based visibility

### Phase 4: Drawing & Polish (Weeks 5-6)
- [ ] Drawing tools
- [ ] Layer management
- [ ] Template library
- [ ] Mobile optimization
- [ ] Performance tuning

---

## Dependencies

- **PRD 04** (Session Management): Session context
- **PRD 08** (Canvas System): Canvas rendering patterns
- **PRD 17** (Database Schema): Storage models

---

## Open Questions

1. Should players be able to draw (with Seer approval)?
2. Import from other VTT formats (Foundry, Roll20)?
3. Distance measuring tool?
4. Sound triggers on map locations?

---

## Appendix

### A. Fog of War Algorithm

```typescript
// Fog is rendered as a full-screen overlay with "holes" cut out
const renderFog = (
  ctx: CanvasRenderingContext2D,
  revealedRegions: FogRegion[],
  canvasSize: { width: number; height: number }
) => {
  // Fill entire canvas with fog
  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
  
  // Cut out revealed areas using composite operation
  ctx.globalCompositeOperation = 'destination-out';
  
  for (const region of revealedRegions) {
    switch (region.type) {
      case 'rect':
        ctx.fillRect(region.x, region.y, region.width, region.height);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(region.cx, region.cy, region.radius, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'polygon':
        ctx.beginPath();
        ctx.moveTo(region.points[0][0], region.points[0][1]);
        for (const [x, y] of region.points.slice(1)) {
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        break;
    }
  }
  
  ctx.globalCompositeOperation = 'source-over';
};
```

### B. Grid Coordinate System

```typescript
// Grid uses 0-indexed coordinates
// (0,0) is top-left cell
// Positions are stored as grid coordinates, not pixels

const gridToPixel = (
  gridX: number,
  gridY: number,
  cellSize: number,
  offset: { x: number; y: number }
): { x: number; y: number } => ({
  x: gridX * cellSize + offset.x,
  y: gridY * cellSize + offset.y,
});

const pixelToGrid = (
  pixelX: number,
  pixelY: number,
  cellSize: number,
  offset: { x: number; y: number }
): { x: number; y: number } => ({
  x: Math.floor((pixelX - offset.x) / cellSize),
  y: Math.floor((pixelY - offset.y) / cellSize),
});
```

### C. Mobile Touch Gestures

| Gesture | Action |
|---------|--------|
| Single tap | Select token |
| Double tap | Open token properties |
| Drag | Move token / Pan map |
| Pinch | Zoom in/out |
| Two-finger drag | Pan map (always) |
| Long press | Context menu |
