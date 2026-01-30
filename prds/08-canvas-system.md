# PRD 08: Canvas System

> **Status**: ✅ Implemented  
> **Priority**: P0 - Critical Path  
> **Estimated Effort**: 5 days (completed)  
> **Dependencies**: None

---

## Overview

The Canvas System provides the infinite, zoomable workspace for the Adventure Forge editor. It's the foundation upon which all adventure content is built, supporting node placement, connections, and visual editing. This PRD documents the implemented system for reference and future enhancements.

### Implemented Features
- ✅ Infinite canvas with pan and zoom
- ✅ Touch-optimized for mobile devices
- ✅ Grid snapping for node alignment
- ✅ Smooth 60fps performance
- ✅ Multi-selection support
- ✅ Keyboard shortcuts (basic)
- ⏳ Minimap navigation (planned)
- ⏳ WebGL performance mode (planned for 100+ nodes)

---

## Technical Specification

### Canvas Architecture

```typescript
interface CanvasState {
  // Viewport
  pan: { x: number; y: number };
  zoom: number;
  
  // Selection
  selectedNodeIds: string[];
  selectedConnectionIds: string[];
  
  // Interaction
  mode: CanvasMode;
  dragState: DragState | null;
  
  // Grid
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

type CanvasMode = 
  | 'select'        // Default selection mode
  | 'pan'           // Pan-only mode (space held)
  | 'connect'       // Drawing connection
  | 'multiselect'   // Rectangle selection
  | 'drag';         // Dragging nodes

interface DragState {
  type: 'node' | 'selection' | 'pan' | 'connection';
  startPoint: Point;
  currentPoint: Point;
  nodeOffsets?: Map<string, Point>;  // For multi-node drag
}

interface Point {
  x: number;
  y: number;
}
```

### Canvas Component

```typescript
interface CanvasProps {
  adventure: Adventure;
  onNodeSelect: (nodeIds: string[]) => void;
  onNodeMove: (nodeId: string, position: Point) => void;
  onConnectionCreate: (source: string, target: string) => void;
  onViewportChange?: (viewport: Viewport) => void;
}

interface Viewport {
  pan: Point;
  zoom: number;
  visibleBounds: Rect;
}

function AdventureCanvas({
  adventure,
  onNodeSelect,
  onNodeMove,
  onConnectionCreate,
  onViewportChange,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(canvasReducer, initialCanvasState);
  
  // Gesture handling
  const gesture = useGesture({
    onDrag: handleDrag,
    onPinch: handlePinch,
    onWheel: handleWheel,
  }, {
    target: canvasRef,
    eventOptions: { passive: false },
  });
  
  // Coordinate transforms
  const screenToCanvas = useCallback((screenPoint: Point): Point => {
    return {
      x: (screenPoint.x - state.pan.x) / state.zoom,
      y: (screenPoint.y - state.pan.y) / state.zoom,
    };
  }, [state.pan, state.zoom]);
  
  const canvasToScreen = useCallback((canvasPoint: Point): Point => {
    return {
      x: canvasPoint.x * state.zoom + state.pan.x,
      y: canvasPoint.y * state.zoom + state.pan.y,
    };
  }, [state.pan, state.zoom]);
  
  return (
    <div 
      ref={canvasRef}
      className="adventure-canvas"
      {...gesture()}
    >
      <CanvasBackground 
        pan={state.pan} 
        zoom={state.zoom} 
        showGrid={state.showGrid}
        gridSize={state.gridSize}
      />
      
      <svg className="connections-layer">
        {adventure.connections.map(conn => (
          <Connection
            key={conn.id}
            connection={conn}
            sourceNode={getNode(conn.sourceNodeId)}
            targetNode={getNode(conn.targetNodeId)}
            isSelected={state.selectedConnectionIds.includes(conn.id)}
            zoom={state.zoom}
          />
        ))}
        
        {state.dragState?.type === 'connection' && (
          <ConnectionPreview
            start={state.dragState.startPoint}
            end={state.dragState.currentPoint}
          />
        )}
      </svg>
      
      <div 
        className="nodes-layer"
        style={{
          transform: `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {adventure.nodes.map(node => (
          <CanvasNode
            key={node.id}
            node={node}
            isSelected={state.selectedNodeIds.includes(node.id)}
            onSelect={() => onNodeSelect([node.id])}
            onDragStart={handleNodeDragStart}
            onConnectionStart={handleConnectionStart}
          />
        ))}
      </div>
      
      {state.mode === 'multiselect' && state.dragState && (
        <SelectionRect
          start={state.dragState.startPoint}
          end={state.dragState.currentPoint}
        />
      )}
    </div>
  );
}
```

### Pan and Zoom

```typescript
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;
const ZOOM_SENSITIVITY = 0.001;

function handleWheel(event: WheelEvent) {
  event.preventDefault();
  
  const delta = -event.deltaY * ZOOM_SENSITIVITY;
  const newZoom = clamp(state.zoom * (1 + delta), MIN_ZOOM, MAX_ZOOM);
  
  // Zoom toward cursor position
  const cursorCanvas = screenToCanvas({ x: event.clientX, y: event.clientY });
  const newPan = {
    x: event.clientX - cursorCanvas.x * newZoom,
    y: event.clientY - cursorCanvas.y * newZoom,
  };
  
  dispatch({ type: 'SET_VIEWPORT', pan: newPan, zoom: newZoom });
}

function handlePinch({ offset: [scale], origin: [ox, oy] }: PinchState) {
  const newZoom = clamp(scale, MIN_ZOOM, MAX_ZOOM);
  const originCanvas = screenToCanvas({ x: ox, y: oy });
  
  const newPan = {
    x: ox - originCanvas.x * newZoom,
    y: oy - originCanvas.y * newZoom,
  };
  
  dispatch({ type: 'SET_VIEWPORT', pan: newPan, zoom: newZoom });
}

function handleDrag({ movement: [mx, my], first, last, event }: DragState) {
  if (event.target.closest('.canvas-node')) return; // Let node handle it
  
  if (first) {
    dispatch({ type: 'START_PAN' });
  }
  
  dispatch({
    type: 'PAN',
    delta: { x: mx, y: my },
  });
  
  if (last) {
    dispatch({ type: 'END_PAN' });
  }
}
```

### Grid System

```typescript
interface GridConfig {
  size: number;           // Grid cell size in canvas units
  snapThreshold: number;  // How close to snap (0-1 of grid size)
  showGrid: boolean;
  gridColor: string;
  majorGridEvery: number; // Draw thicker line every N cells
}

const DEFAULT_GRID: GridConfig = {
  size: 20,
  snapThreshold: 0.5,
  showGrid: true,
  gridColor: 'rgba(0, 0, 0, 0.1)',
  majorGridEvery: 5,
};

function snapToGrid(point: Point, config: GridConfig): Point {
  if (!config.showGrid) return point;
  
  return {
    x: Math.round(point.x / config.size) * config.size,
    y: Math.round(point.y / config.size) * config.size,
  };
}

function CanvasBackground({ pan, zoom, showGrid, gridSize }: BackgroundProps) {
  if (!showGrid) return <div className="canvas-bg" />;
  
  // Calculate visible grid bounds
  const canvasRect = useCanvasRect();
  const startX = Math.floor(-pan.x / zoom / gridSize) * gridSize;
  const startY = Math.floor(-pan.y / zoom / gridSize) * gridSize;
  const endX = startX + canvasRect.width / zoom + gridSize * 2;
  const endY = startY + canvasRect.height / zoom + gridSize * 2;
  
  return (
    <svg className="canvas-grid">
      <defs>
        <pattern
          id="grid"
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
        >
          <path
            d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
            fill="none"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={1 / zoom}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}
```

### Selection System

```typescript
function handleNodeSelect(nodeId: string, event: MouseEvent) {
  if (event.shiftKey) {
    // Add to selection
    dispatch({
      type: 'ADD_TO_SELECTION',
      nodeIds: [nodeId],
    });
  } else if (event.metaKey || event.ctrlKey) {
    // Toggle selection
    dispatch({
      type: 'TOGGLE_SELECTION',
      nodeIds: [nodeId],
    });
  } else {
    // Replace selection
    dispatch({
      type: 'SET_SELECTION',
      nodeIds: [nodeId],
    });
  }
}

function handleRectangleSelect(start: Point, end: Point) {
  const rect = {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
  
  const selectedNodes = adventure.nodes.filter(node => 
    rectIntersects(rect, getNodeBounds(node))
  );
  
  dispatch({
    type: 'SET_SELECTION',
    nodeIds: selectedNodes.map(n => n.id),
  });
}
```

### Performance Optimizations

```typescript
// Virtual rendering - only render visible nodes
function useVisibleNodes(nodes: AdventureNode[], viewport: Viewport) {
  return useMemo(() => {
    const bounds = viewport.visibleBounds;
    const padding = 100; // Render slightly outside viewport
    
    return nodes.filter(node => {
      const nodeBounds = getNodeBounds(node);
      return (
        nodeBounds.x + nodeBounds.width >= bounds.x - padding &&
        nodeBounds.x <= bounds.x + bounds.width + padding &&
        nodeBounds.y + nodeBounds.height >= bounds.y - padding &&
        nodeBounds.y <= bounds.y + bounds.height + padding
      );
    });
  }, [nodes, viewport]);
}

// Debounced viewport updates
function useThrottledViewport(viewport: Viewport, delay = 16) {
  const [throttled, setThrottled] = useState(viewport);
  
  useEffect(() => {
    const timer = setTimeout(() => setThrottled(viewport), delay);
    return () => clearTimeout(timer);
  }, [viewport, delay]);
  
  return throttled;
}

// Canvas layer separation for performance
// - Background: Static grid (rarely re-renders)
// - Connections: SVG layer (re-renders on node move)
// - Nodes: Individual transforms (each node manages own re-render)
```

### Touch Support

```typescript
const touchConfig = {
  // Distinguish tap from drag
  tapThreshold: 10,      // pixels
  tapTimeout: 200,       // ms
  
  // Two-finger gestures
  pinchThreshold: 10,    // pixels between fingers
  
  // Long press
  longPressDelay: 500,   // ms
};

function useTouchGestures(canvasRef: RefObject<HTMLElement>) {
  const [touchState, setTouchState] = useState<TouchState>({
    touches: [],
    gesture: null,
  });
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // Single touch - potential tap, drag, or long press
        startLongPressTimer(e.touches[0]);
      } else if (e.touches.length === 2) {
        // Two fingers - pinch/pan
        setTouchState({
          touches: Array.from(e.touches),
          gesture: 'pinch',
        });
      }
    };
    
    // ... touch move and end handlers
    
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    // ... add other listeners
    
    return () => {
      // ... cleanup
    };
  }, [canvasRef]);
}
```

---

## API Reference

### Canvas Actions

```typescript
type CanvasAction =
  | { type: 'SET_VIEWPORT'; pan: Point; zoom: number }
  | { type: 'PAN'; delta: Point }
  | { type: 'ZOOM'; zoom: number; origin: Point }
  | { type: 'SET_SELECTION'; nodeIds: string[] }
  | { type: 'ADD_TO_SELECTION'; nodeIds: string[] }
  | { type: 'TOGGLE_SELECTION'; nodeIds: string[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'START_DRAG'; nodeId: string; point: Point }
  | { type: 'UPDATE_DRAG'; point: Point }
  | { type: 'END_DRAG' }
  | { type: 'START_CONNECTION'; nodeId: string; port: string }
  | { type: 'UPDATE_CONNECTION'; point: Point }
  | { type: 'END_CONNECTION'; targetNodeId?: string }
  | { type: 'SET_MODE'; mode: CanvasMode }
  | { type: 'TOGGLE_GRID' }
  | { type: 'SET_GRID_SIZE'; size: number };
```

### Canvas Context

```typescript
interface CanvasContext {
  // State
  state: CanvasState;
  dispatch: Dispatch<CanvasAction>;
  
  // Transforms
  screenToCanvas: (point: Point) => Point;
  canvasToScreen: (point: Point) => Point;
  
  // Utilities
  getVisibleBounds: () => Rect;
  fitToNodes: (nodeIds?: string[]) => void;
  centerOnNode: (nodeId: string) => void;
  
  // Selection
  selectAll: () => void;
  selectNone: () => void;
  deleteSelected: () => void;
}

const CanvasContext = createContext<CanvasContext | null>(null);

export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) throw new Error('useCanvas must be used within CanvasProvider');
  return context;
}
```

---

## Future Enhancements

### Minimap (Planned)

```typescript
interface MinimapProps {
  adventure: Adventure;
  viewport: Viewport;
  onNavigate: (center: Point) => void;
}

function Minimap({ adventure, viewport, onNavigate }: MinimapProps) {
  const bounds = useMemo(() => calculateBounds(adventure.nodes), [adventure.nodes]);
  const scale = Math.min(
    MINIMAP_WIDTH / bounds.width,
    MINIMAP_HEIGHT / bounds.height
  );
  
  return (
    <div className="minimap">
      <svg width={MINIMAP_WIDTH} height={MINIMAP_HEIGHT}>
        {/* All nodes as tiny rectangles */}
        {adventure.nodes.map(node => (
          <rect
            key={node.id}
            x={(node.position.x - bounds.x) * scale}
            y={(node.position.y - bounds.y) * scale}
            width={NODE_WIDTH * scale}
            height={NODE_HEIGHT * scale}
            fill={getNodeColor(node.type)}
          />
        ))}
        
        {/* Viewport indicator */}
        <rect
          className="viewport-indicator"
          x={(viewport.visibleBounds.x - bounds.x) * scale}
          y={(viewport.visibleBounds.y - bounds.y) * scale}
          width={viewport.visibleBounds.width * scale}
          height={viewport.visibleBounds.height * scale}
          fill="rgba(0,0,255,0.2)"
          stroke="blue"
        />
      </svg>
    </div>
  );
}
```

### WebGL Mode (Planned for 100+ nodes)

```typescript
// When node count exceeds threshold, switch to WebGL rendering
const WEBGL_THRESHOLD = 100;

function useRenderMode(nodeCount: number): 'dom' | 'webgl' {
  return nodeCount > WEBGL_THRESHOLD ? 'webgl' : 'dom';
}

// WebGL canvas would use PixiJS or Three.js for rendering
// with batched draw calls for performance
```

---

## Testing

### Unit Tests

```typescript
describe('Canvas', () => {
  describe('coordinate transforms', () => {
    it('should convert screen to canvas coordinates', () => {
      const state = { pan: { x: 100, y: 50 }, zoom: 2 };
      const screenPoint = { x: 200, y: 150 };
      
      const canvasPoint = screenToCanvas(screenPoint, state);
      
      expect(canvasPoint).toEqual({ x: 50, y: 50 });
    });
    
    it('should round-trip coordinates correctly', () => {
      const state = { pan: { x: 100, y: 50 }, zoom: 1.5 };
      const original = { x: 123, y: 456 };
      
      const screen = canvasToScreen(original, state);
      const back = screenToCanvas(screen, state);
      
      expect(back.x).toBeCloseTo(original.x);
      expect(back.y).toBeCloseTo(original.y);
    });
  });
  
  describe('grid snapping', () => {
    it('should snap to nearest grid point', () => {
      const point = { x: 27, y: 43 };
      const config = { size: 20, snapThreshold: 0.5 };
      
      const snapped = snapToGrid(point, config);
      
      expect(snapped).toEqual({ x: 20, y: 40 });
    });
  });
});
```

---

## Appendix

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space + Drag` | Pan canvas |
| `Scroll` | Zoom in/out |
| `Cmd/Ctrl + A` | Select all |
| `Escape` | Clear selection |
| `Delete/Backspace` | Delete selected |
| `Cmd/Ctrl + D` | Duplicate selected |
| `G` | Toggle grid |
| `F` | Fit to selection |

### Performance Targets

| Metric | Target |
|--------|--------|
| Frame rate | 60fps |
| Pan latency | <16ms |
| Zoom latency | <16ms |
| Node render | <1ms each |
| Max nodes (DOM) | 100 |
| Max nodes (WebGL) | 1000+ |
