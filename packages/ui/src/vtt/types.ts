/**
 * @sparc/ui VTT Lite Types
 * 
 * Based on PRD 29: Maps & VTT Lite
 * Type definitions for the virtual tabletop system.
 */

// ============================================================================
// Map Types
// ============================================================================

export interface VttMap {
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
  gridOffsetX: number;
  gridOffsetY: number;
  gridColor: string;
  gridOpacity: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  isTemplate: boolean;
  tags: string[];
}

export interface SessionMapState {
  id: string;
  sessionId: string;
  mapId: string;
  map?: VttMap;
  
  // Fog of war
  fogRevealed: FogRegion[];
  fogEnabled: boolean;
  
  // Tokens
  tokens: MapToken[];
  
  // Drawings
  drawings: Drawing[];
  
  // Active layer
  activeLayer: MapLayer;
}

export type MapLayer = 'background' | 'gm' | 'tokens' | 'drawings';

// ============================================================================
// Token Types
// ============================================================================

export interface MapToken {
  id: string;
  characterId?: string;
  name: string;
  imageUrl?: string;
  
  // Position (grid coordinates)
  x: number;
  y: number;
  
  // Size in grid cells
  width: number;
  height: number;
  
  // Appearance
  color: string;
  borderColor: string;
  showName: boolean;
  showHpBar: boolean;
  hp?: number;
  maxHp?: number;
  
  // Status
  conditions: TokenCondition[];
  
  // Permissions
  controlledBy: string[];
  isHidden: boolean;
}

export type TokenCondition = 
  | 'poisoned'
  | 'stunned'
  | 'prone'
  | 'grappled'
  | 'restrained'
  | 'blinded'
  | 'deafened'
  | 'frightened'
  | 'charmed'
  | 'paralyzed'
  | 'petrified'
  | 'invisible'
  | 'incapacitated'
  | 'exhausted'
  | 'concentrating';

export const TOKEN_CONDITIONS: { value: TokenCondition; label: string; icon: string }[] = [
  { value: 'poisoned', label: 'Poisoned', icon: '🤢' },
  { value: 'stunned', label: 'Stunned', icon: '💫' },
  { value: 'prone', label: 'Prone', icon: '🔃' },
  { value: 'grappled', label: 'Grappled', icon: '🤼' },
  { value: 'restrained', label: 'Restrained', icon: '⛓️' },
  { value: 'blinded', label: 'Blinded', icon: '👁️' },
  { value: 'deafened', label: 'Deafened', icon: '🔇' },
  { value: 'frightened', label: 'Frightened', icon: '😨' },
  { value: 'charmed', label: 'Charmed', icon: '💕' },
  { value: 'paralyzed', label: 'Paralyzed', icon: '🧊' },
  { value: 'petrified', label: 'Petrified', icon: '🗿' },
  { value: 'invisible', label: 'Invisible', icon: '👻' },
  { value: 'incapacitated', label: 'Incapacitated', icon: '💀' },
  { value: 'exhausted', label: 'Exhausted', icon: '😴' },
  { value: 'concentrating', label: 'Concentrating', icon: '🎯' },
];

export type TokenSize = 1 | 2 | 3;

export const TOKEN_SIZES: { value: TokenSize; label: string }[] = [
  { value: 1, label: '1×1 (Small/Medium)' },
  { value: 2, label: '2×2 (Large)' },
  { value: 3, label: '3×3 (Huge)' },
];

export const TOKEN_COLORS = [
  { value: '#22c55e', label: 'Green' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#ef4444', label: 'Red' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#6b7280', label: 'Gray' },
  { value: '#ffffff', label: 'White' },
] as const;

// ============================================================================
// Fog of War Types
// ============================================================================

export type FogRegion = FogRect | FogPolygon | FogCircle;

export interface FogRect {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FogPolygon {
  type: 'polygon';
  points: [number, number][];
}

export interface FogCircle {
  type: 'circle';
  cx: number;
  cy: number;
  radius: number;
}

export type FogTool = 'rect' | 'brush' | 'polygon' | 'circle';
export type FogMode = 'reveal' | 'hide';

// ============================================================================
// Drawing Types
// ============================================================================

export interface Drawing {
  id: string;
  type: DrawingType;
  layer: 'gm' | 'drawings';
  
  // Styling
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string;
  
  // Path data (for freehand)
  path?: string;
  
  // Shape data
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  width?: number;
  height?: number;
  radius?: number;
  
  // Text
  text?: string;
  fontSize?: number;
  
  createdBy: string;
  createdAt: string;
}

export type DrawingType = 'path' | 'line' | 'rect' | 'circle' | 'text';
export type DrawingTool = 'pen' | 'line' | 'rect' | 'circle' | 'text' | 'eraser';

export const DRAWING_COLORS = [
  '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', 
  '#8b5cf6', '#ec4899', '#ffffff', '#000000'
] as const;

export const STROKE_WIDTHS = [1, 2, 4, 8, 12] as const;

// ============================================================================
// Viewport & Canvas Types
// ============================================================================

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type CanvasMode = 
  | 'select'
  | 'pan'
  | 'token'
  | 'fog'
  | 'draw'
  | 'measure';

// ============================================================================
// Measurement Types
// ============================================================================

export interface Measurement {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  distance: number;
}

// ============================================================================
// Ping/Marker Types
// ============================================================================

export interface MapPing {
  id: string;
  x: number;
  y: number;
  color: string;
  createdBy: string;
  createdAt: number;
  expiresAt: number;
}

// ============================================================================
// Template Types
// ============================================================================

export interface MapTemplate {
  id: string;
  name: string;
  description: string;
  category: 'interior' | 'exterior' | 'dungeon' | 'special';
  
  imageUrl: string;
  gridColumns: number;
  gridRows: number;
  
  suggestedTokens: Array<{
    name: string;
    x: number;
    y: number;
    type: 'npc' | 'object' | 'marker';
  }>;
  
  tips: string[];
}

export const MAP_TEMPLATES: MapTemplate[] = [
  {
    id: 'tavern',
    name: 'Tavern',
    description: 'Classic inn with bar, tables, and fireplace',
    category: 'interior',
    imageUrl: '/templates/tavern.png',
    gridColumns: 15,
    gridRows: 12,
    suggestedTokens: [
      { name: 'Bartender', x: 2, y: 3, type: 'npc' },
      { name: 'Table', x: 8, y: 6, type: 'object' },
    ],
    tips: ['Great for social encounters', 'Add patrons as needed'],
  },
  {
    id: 'dungeon-room',
    name: 'Dungeon Room',
    description: 'Stone room with doors on each wall',
    category: 'dungeon',
    imageUrl: '/templates/dungeon-room.png',
    gridColumns: 10,
    gridRows: 10,
    suggestedTokens: [],
    tips: ['Place doors in the center of each wall', 'Add traps as needed'],
  },
  {
    id: 'forest-clearing',
    name: 'Forest Clearing',
    description: 'Open area surrounded by trees',
    category: 'exterior',
    imageUrl: '/templates/forest.png',
    gridColumns: 12,
    gridRows: 12,
    suggestedTokens: [],
    tips: ['Trees provide cover', 'Consider adding difficult terrain'],
  },
  {
    id: 'town-square',
    name: 'Town Square',
    description: 'Central plaza with fountain',
    category: 'exterior',
    imageUrl: '/templates/town-square.png',
    gridColumns: 16,
    gridRows: 16,
    suggestedTokens: [
      { name: 'Fountain', x: 8, y: 8, type: 'object' },
    ],
    tips: ['Add market stalls and NPCs', 'Great for chase scenes'],
  },
  {
    id: 'cave',
    name: 'Cave',
    description: 'Natural cavern with rock formations',
    category: 'dungeon',
    imageUrl: '/templates/cave.png',
    gridColumns: 10,
    gridRows: 8,
    suggestedTokens: [],
    tips: ['Stalagmites provide partial cover', 'Consider low light conditions'],
  },
  {
    id: 'throne-room',
    name: 'Throne Room',
    description: 'Castle great hall with throne',
    category: 'interior',
    imageUrl: '/templates/throne-room.png',
    gridColumns: 14,
    gridRows: 20,
    suggestedTokens: [
      { name: 'Throne', x: 7, y: 17, type: 'object' },
    ],
    tips: ['Add guards along the sides', 'Pillars can provide cover'],
  },
  {
    id: 'ship-deck',
    name: 'Ship Deck',
    description: 'Wooden ship top-down view',
    category: 'special',
    imageUrl: '/templates/ship.png',
    gridColumns: 8,
    gridRows: 20,
    suggestedTokens: [],
    tips: ['Rigging can be climbed', 'Consider wind direction for ranged attacks'],
  },
  {
    id: 'arena',
    name: 'Arena',
    description: 'Circular fighting pit',
    category: 'special',
    imageUrl: '/templates/arena.png',
    gridColumns: 12,
    gridRows: 12,
    suggestedTokens: [],
    tips: ['Spectators can throw items', 'Sand provides no cover'],
  },
];

// ============================================================================
// Default Token Set
// ============================================================================

export const DEFAULT_TOKENS = [
  { name: 'Player', imageUrl: '/tokens/player.png', color: '#22c55e' },
  { name: 'NPC', imageUrl: '/tokens/npc.png', color: '#3b82f6' },
  { name: 'Enemy', imageUrl: '/tokens/enemy.png', color: '#ef4444' },
  { name: 'Monster', imageUrl: '/tokens/monster.png', color: '#8b5cf6' },
  { name: 'Beast', imageUrl: '/tokens/beast.png', color: '#f59e0b' },
  { name: 'Undead', imageUrl: '/tokens/undead.png', color: '#6b7280' },
  { name: 'Dragon', imageUrl: '/tokens/dragon.png', color: '#dc2626' },
  { name: 'Chest', imageUrl: '/tokens/chest.png', color: '#ca8a04' },
  { name: 'Marker', imageUrl: '/tokens/marker.png', color: '#ffffff' },
] as const;

// ============================================================================
// WebSocket Event Types
// ============================================================================

export type ClientMapEvent =
  | { type: 'token_move'; tokenId: string; x: number; y: number }
  | { type: 'token_add'; token: MapToken }
  | { type: 'token_remove'; tokenId: string }
  | { type: 'token_update'; tokenId: string; updates: Partial<MapToken> }
  | { type: 'fog_reveal'; region: FogRegion }
  | { type: 'fog_hide'; region: FogRegion }
  | { type: 'fog_reset' }
  | { type: 'drawing_add'; drawing: Drawing }
  | { type: 'drawing_remove'; drawingId: string }
  | { type: 'drawing_clear'; layer?: 'gm' | 'drawings' }
  | { type: 'ping'; x: number; y: number; color: string }
  | { type: 'map_change'; mapId: string };

export type ServerMapEvent =
  | { type: 'map_changed'; mapId: string; state: SessionMapState }
  | { type: 'token_moved'; tokenId: string; x: number; y: number; by: string }
  | { type: 'token_added'; token: MapToken }
  | { type: 'token_removed'; tokenId: string }
  | { type: 'token_updated'; tokenId: string; updates: Partial<MapToken> }
  | { type: 'fog_updated'; revealed: FogRegion[] }
  | { type: 'drawing_added'; drawing: Drawing }
  | { type: 'drawing_removed'; drawingId: string }
  | { type: 'drawings_cleared'; layer?: 'gm' | 'drawings' }
  | { type: 'ping_received'; ping: MapPing }
  | { type: 'full_sync'; state: SessionMapState };

// ============================================================================
// State Types
// ============================================================================

export interface VTTState {
  // Map
  map: VttMap | null;
  sessionState: SessionMapState | null;
  
  // Mode
  mode: CanvasMode;
  selectedTokenId: string | null;
  
  // Fog tools
  fogTool: FogTool;
  fogMode: FogMode;
  
  // Drawing tools
  drawingTool: DrawingTool;
  drawingColor: string;
  strokeWidth: number;
  drawingLayer: 'gm' | 'drawings';
  
  // Viewport
  viewport: Viewport;
  
  // Layers visibility
  layerVisibility: {
    grid: boolean;
    tokens: boolean;
    drawings: boolean;
    gmNotes: boolean;
    fog: boolean;
  };
  
  // Measurement
  measurement: Measurement | null;
  
  // Pings
  pings: MapPing[];
  
  // User role
  isSeer: boolean;
  userId: string;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface MapCanvasProps {
  state: VTTState;
  onStateChange: (updates: Partial<VTTState>) => void;
  onTokenMove: (tokenId: string, x: number, y: number) => void;
  onTokenSelect: (tokenId: string | null) => void;
  onFogReveal: (region: FogRegion) => void;
  onFogHide: (region: FogRegion) => void;
  onDrawingAdd: (drawing: Omit<Drawing, 'id' | 'createdBy' | 'createdAt'>) => void;
  onPing: (x: number, y: number) => void;
  className?: string;
}

export interface TokenProps {
  token: MapToken;
  cellSize: number;
  isSelected: boolean;
  canControl: boolean;
  isSeer: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onEdit: () => void;
}

export interface TokenPaletteProps {
  onTokenSelect: (token: { name: string; color: string; imageUrl?: string }) => void;
}

export interface FogControlsProps {
  tool: FogTool;
  mode: FogMode;
  onToolChange: (tool: FogTool) => void;
  onModeChange: (mode: FogMode) => void;
  onReset: () => void;
}

export interface DrawingToolsProps {
  tool: DrawingTool;
  color: string;
  strokeWidth: number;
  layer: 'gm' | 'drawings';
  onToolChange: (tool: DrawingTool) => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onLayerChange: (layer: 'gm' | 'drawings') => void;
  onClear: (layer?: 'gm' | 'drawings') => void;
  onUndo: () => void;
}

export interface LayerPanelProps {
  visibility: VTTState['layerVisibility'];
  isSeer: boolean;
  onVisibilityChange: (layer: keyof VTTState['layerVisibility'], visible: boolean) => void;
}

export interface TokenPropertiesModalProps {
  token: MapToken | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (token: MapToken) => void;
  onDelete: (tokenId: string) => void;
  linkedCharacters?: Array<{ id: string; name: string }>;
}

export interface MapLibraryProps {
  maps: VttMap[];
  selectedMapId?: string;
  onMapSelect: (mapId: string) => void;
  onMapCreate: () => void;
  onMapEdit: (mapId: string) => void;
  onMapDelete: (mapId: string) => void;
}

export interface MapCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (map: Omit<VttMap, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => void;
  existingMap?: VttMap;
}

export interface MeasurementToolProps {
  measurement: Measurement | null;
  cellSize: number;
  gridScale: number; // e.g., 5 feet per cell
}

export interface VTTViewProps {
  sessionId: string;
  userId: string;
  isSeer: boolean;
  initialMapId?: string;
  onMapChange?: (mapId: string) => void;
}
