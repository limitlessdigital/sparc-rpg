"use client";

/**
 * Adventure Forge Canvas Component
 * Based on PRD 08: Canvas System
 * 
 * Infinite pan/zoom canvas with node rendering, connection drawing,
 * and gesture support (mouse + touch).
 */

import * as React from 'react';
import { cn } from '../lib/utils';
import type {
  Point,
  CanvasState,
  AdventureNode,
  Adventure,
} from './types';
import { NODE_CONFIGS, NODE_WIDTH, NODE_HEIGHT, getOutputPorts } from './node-config';
import { 
  generateBezierPath, 
  getPortPosition, 
  CONNECTION_CONFIGS,
  validateConnection,
} from './connection-utils';

// Canvas constants
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;
const ZOOM_SENSITIVITY = 0.001;
const GRID_SIZE = 20;

// Initial state
const initialCanvasState: CanvasState = {
  pan: { x: 0, y: 0 },
  zoom: 1,
  selectedNodeIds: [],
  selectedConnectionIds: [],
  mode: 'select',
  dragState: null,
  showGrid: true,
  snapToGrid: true,
  gridSize: GRID_SIZE,
};

// Canvas context
interface CanvasContextValue {
  state: CanvasState;
  screenToCanvas: (point: Point) => Point;
  canvasToScreen: (point: Point) => Point;
}

const CanvasContext = React.createContext<CanvasContextValue | null>(null);

export function useCanvasContext() {
  const context = React.useContext(CanvasContext);
  if (!context) throw new Error('useCanvasContext must be used within ForgeCanvas');
  return context;
}

// Props
export interface ForgeCanvasProps {
  adventure: Adventure;
  onNodeSelect: (nodeIds: string[]) => void;
  onNodeMove: (nodeId: string, position: Point) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
  onConnectionCreate: (sourceNodeId: string, sourcePort: string, targetNodeId: string) => void;
  onConnectionDelete?: (connectionId: string) => void;
  onViewportChange?: (pan: Point, zoom: number) => void;
  className?: string;
}

export function ForgeCanvas({
  adventure,
  onNodeSelect,
  onNodeMove,
  onNodeDoubleClick,
  onConnectionCreate,
  onConnectionDelete,
  onViewportChange,
  className,
}: ForgeCanvasProps) {
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const [state, setState] = React.useState<CanvasState>(initialCanvasState);
  const [connectionStart, setConnectionStart] = React.useState<{
    nodeId: string;
    port: string;
    position: Point;
  } | null>(null);
  const [connectionEnd, setConnectionEnd] = React.useState<Point | null>(null);
  
  // Coordinate transforms
  const screenToCanvas = React.useCallback((screenPoint: Point): Point => {
    return {
      x: (screenPoint.x - state.pan.x) / state.zoom,
      y: (screenPoint.y - state.pan.y) / state.zoom,
    };
  }, [state.pan, state.zoom]);
  
  const canvasToScreen = React.useCallback((canvasPoint: Point): Point => {
    return {
      x: canvasPoint.x * state.zoom + state.pan.x,
      y: canvasPoint.y * state.zoom + state.pan.y,
    };
  }, [state.pan, state.zoom]);
  
  // Snap to grid
  const snapToGrid = React.useCallback((point: Point): Point => {
    if (!state.snapToGrid) return point;
    return {
      x: Math.round(point.x / state.gridSize) * state.gridSize,
      y: Math.round(point.y / state.gridSize) * state.gridSize,
    };
  }, [state.snapToGrid, state.gridSize]);
  
  // Handle wheel zoom
  const handleWheel = React.useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = -e.deltaY * ZOOM_SENSITIVITY;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, state.zoom * (1 + delta)));
    
    // Zoom toward cursor position
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;
    const cursorCanvas = screenToCanvas({ x: cursorX, y: cursorY });
    
    const newPan = {
      x: cursorX - cursorCanvas.x * newZoom,
      y: cursorY - cursorCanvas.y * newZoom,
    };
    
    setState(prev => ({ ...prev, pan: newPan, zoom: newZoom }));
    onViewportChange?.(newPan, newZoom);
  }, [state.zoom, screenToCanvas, onViewportChange]);
  
  // Handle mouse down (start pan or select)
  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    // Ignore node clicks (handled by node)
    if ((e.target as HTMLElement).closest('.forge-node')) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Middle mouse button = pan
    if (e.button === 1) {
      e.preventDefault();
      setState(prev => ({
        ...prev,
        mode: 'pan',
        dragState: {
          type: 'pan',
          startPoint: { x: e.clientX, y: e.clientY },
          currentPoint: { x: e.clientX, y: e.clientY },
        },
      }));
      return;
    }
    
    // Left click
    if (e.button === 0) {
      // Space held = pan mode
      if (state.mode === 'pan') {
        setState(prev => ({
          ...prev,
          dragState: {
            type: 'pan',
            startPoint: { x: e.clientX, y: e.clientY },
            currentPoint: { x: e.clientX, y: e.clientY },
          },
        }));
      } else {
        // Clear selection on background click
        onNodeSelect([]);
        setState(prev => ({ ...prev, selectedNodeIds: [], selectedConnectionIds: [] }));
      }
    }
  }, [state.mode, onNodeSelect]);
  
  // Handle mouse move
  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Update connection preview
    if (connectionStart) {
      setConnectionEnd({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    
    // Handle pan drag
    if (state.dragState?.type === 'pan') {
      const dx = e.clientX - state.dragState.currentPoint.x;
      const dy = e.clientY - state.dragState.currentPoint.y;
      
      setState(prev => ({
        ...prev,
        pan: {
          x: prev.pan.x + dx,
          y: prev.pan.y + dy,
        },
        dragState: prev.dragState ? {
          ...prev.dragState,
          currentPoint: { x: e.clientX, y: e.clientY },
        } : null,
      }));
    }
    
    // Handle node drag
    if (state.dragState?.type === 'node') {
      const dx = (e.clientX - state.dragState.currentPoint.x) / state.zoom;
      const dy = (e.clientY - state.dragState.currentPoint.y) / state.zoom;
      
      state.selectedNodeIds.forEach(nodeId => {
        const node = adventure.nodes.find(n => n.id === nodeId);
        if (node) {
          const newPos = snapToGrid({
            x: node.position.x + dx,
            y: node.position.y + dy,
          });
          onNodeMove(nodeId, newPos);
        }
      });
      
      setState(prev => ({
        ...prev,
        dragState: prev.dragState ? {
          ...prev.dragState,
          currentPoint: { x: e.clientX, y: e.clientY },
        } : null,
      }));
    }
  }, [connectionStart, state.dragState, state.selectedNodeIds, state.zoom, adventure.nodes, snapToGrid, onNodeMove]);
  
  // Handle mouse up
  const handleMouseUp = React.useCallback((e: React.MouseEvent) => {
    // Complete connection if creating one
    if (connectionStart && connectionEnd) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const canvasPoint = screenToCanvas({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
        
        // Find target node
        const targetNode = adventure.nodes.find(node => {
          const nodeRect = {
            x: node.position.x,
            y: node.position.y,
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
          };
          return (
            canvasPoint.x >= nodeRect.x &&
            canvasPoint.x <= nodeRect.x + nodeRect.width &&
            canvasPoint.y >= nodeRect.y &&
            canvasPoint.y <= nodeRect.y + nodeRect.height
          );
        });
        
        if (targetNode) {
          const validation = validateConnection(
            connectionStart.nodeId,
            connectionStart.port,
            targetNode.id,
            adventure
          );
          
          if (validation.isValid) {
            onConnectionCreate(connectionStart.nodeId, connectionStart.port, targetNode.id);
          }
        }
      }
    }
    
    setConnectionStart(null);
    setConnectionEnd(null);
    
    setState(prev => ({
      ...prev,
      mode: 'select',
      dragState: null,
    }));
  }, [connectionStart, connectionEnd, screenToCanvas, adventure, onConnectionCreate]);
  
  // Handle node selection
  const handleNodeClick = React.useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (e.shiftKey) {
      // Add to selection
      const newSelection = state.selectedNodeIds.includes(nodeId)
        ? state.selectedNodeIds.filter(id => id !== nodeId)
        : [...state.selectedNodeIds, nodeId];
      setState(prev => ({ ...prev, selectedNodeIds: newSelection }));
      onNodeSelect(newSelection);
    } else {
      setState(prev => ({ ...prev, selectedNodeIds: [nodeId] }));
      onNodeSelect([nodeId]);
    }
  }, [state.selectedNodeIds, onNodeSelect]);
  
  // Handle node drag start
  const handleNodeDragStart = React.useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Ensure node is selected
    if (!state.selectedNodeIds.includes(nodeId)) {
      setState(prev => ({ ...prev, selectedNodeIds: [nodeId] }));
      onNodeSelect([nodeId]);
    }
    
    setState(prev => ({
      ...prev,
      mode: 'drag',
      dragState: {
        type: 'node',
        startPoint: { x: e.clientX, y: e.clientY },
        currentPoint: { x: e.clientX, y: e.clientY },
      },
    }));
  }, [state.selectedNodeIds, onNodeSelect]);
  
  // Handle connection start from port
  const handleConnectionStart = React.useCallback((nodeId: string, port: string, position: Point) => {
    setConnectionStart({ nodeId, port, position });
  }, []);
  
  // Handle connection click
  const handleConnectionClick = React.useCallback((connectionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setState(prev => ({
      ...prev,
      selectedConnectionIds: [connectionId],
      selectedNodeIds: [],
    }));
  }, []);
  
  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && !e.target || !(e.target as HTMLElement).matches('input, textarea')) {
        if (state.selectedConnectionIds.length > 0) {
          state.selectedConnectionIds.forEach(id => onConnectionDelete?.(id));
          setState(prev => ({ ...prev, selectedConnectionIds: [] }));
        }
      }
      
      // Toggle grid with G
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey) {
        setState(prev => ({ ...prev, showGrid: !prev.showGrid }));
      }
      
      // Escape to deselect
      if (e.key === 'Escape') {
        setConnectionStart(null);
        setConnectionEnd(null);
        setState(prev => ({
          ...prev,
          selectedNodeIds: [],
          selectedConnectionIds: [],
          mode: 'select',
          dragState: null,
        }));
        onNodeSelect([]);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.selectedConnectionIds, onConnectionDelete, onNodeSelect]);
  
  // Context value
  const contextValue = React.useMemo(() => ({
    state,
    screenToCanvas,
    canvasToScreen,
  }), [state, screenToCanvas, canvasToScreen]);
  
  return (
    <CanvasContext.Provider value={contextValue}>
      <div
        ref={canvasRef}
        className={cn(
          "forge-canvas relative overflow-hidden bg-surface-base cursor-grab",
          state.mode === 'pan' && "cursor-grabbing",
          className
        )}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid Background */}
        {state.showGrid && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, #3A3A3A 1px, transparent 1px),
                linear-gradient(to bottom, #3A3A3A 1px, transparent 1px)
              `,
              backgroundSize: `${GRID_SIZE * state.zoom}px ${GRID_SIZE * state.zoom}px`,
              backgroundPosition: `${state.pan.x}px ${state.pan.y}px`,
            }}
          />
        )}
        
        {/* Connections Layer (SVG) */}
        <svg className="absolute inset-0 pointer-events-none overflow-visible">
          <defs>
            {/* Arrow markers */}
            {Object.entries(CONNECTION_CONFIGS).map(([type, config]) => (
              <marker
                key={type}
                id={`arrow-${type}`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={config.color} />
              </marker>
            ))}
          </defs>
          
          {/* Existing connections */}
          {adventure.connections.map(connection => {
            const sourceNode = adventure.nodes.find(n => n.id === connection.sourceNodeId);
            const targetNode = adventure.nodes.find(n => n.id === connection.targetNodeId);
            if (!sourceNode || !targetNode) return null;
            
            const startPos = canvasToScreen(getPortPosition(sourceNode, connection.sourcePort));
            const endPos = canvasToScreen(getPortPosition(targetNode, 'in'));
            const config = CONNECTION_CONFIGS[connection.connectionType];
            const isSelected = state.selectedConnectionIds.includes(connection.id);
            
            return (
              <g key={connection.id}>
                {/* Hit area */}
                <path
                  d={generateBezierPath(startPos, endPos)}
                  stroke="transparent"
                  strokeWidth={20}
                  fill="none"
                  className="cursor-pointer pointer-events-auto"
                  onClick={(e) => handleConnectionClick(connection.id, e)}
                />
                {/* Visible line */}
                <path
                  d={generateBezierPath(startPos, endPos)}
                  stroke={isSelected ? '#CC7A00' : config.color}
                  strokeWidth={isSelected ? 3 : 2}
                  strokeDasharray={config.dashArray}
                  fill="none"
                  markerEnd={`url(#arrow-${connection.connectionType})`}
                />
              </g>
            );
          })}
          
          {/* Connection preview */}
          {connectionStart && connectionEnd && (
            <path
              d={generateBezierPath(connectionStart.position, connectionEnd)}
              stroke="#CC7A00"
              strokeWidth={2}
              strokeDasharray="5,5"
              fill="none"
              opacity={0.5}
            />
          )}
        </svg>
        
        {/* Nodes Layer */}
        <div
          className="absolute"
          style={{
            transform: `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {adventure.nodes.map(node => (
            <ForgeNode
              key={node.id}
              node={node}
              isSelected={state.selectedNodeIds.includes(node.id)}
              isStartNode={adventure.startNodeId === node.id}
              onClick={(e) => handleNodeClick(node.id, e)}
              onDoubleClick={() => onNodeDoubleClick?.(node.id)}
              onDragStart={(e) => handleNodeDragStart(node.id, e)}
              onConnectionStart={(port, pos) => handleConnectionStart(node.id, port, canvasToScreen(pos))}
            />
          ))}
        </div>
        
        {/* Zoom indicator */}
        <div className="absolute bottom-4 right-4 px-3 py-1 bg-surface-card rounded text-sm text-muted-foreground">
          {Math.round(state.zoom * 100)}%
        </div>
      </div>
    </CanvasContext.Provider>
  );
}

// Node component
interface ForgeNodeProps {
  node: AdventureNode;
  isSelected: boolean;
  isStartNode: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onConnectionStart: (port: string, position: Point) => void;
}

function ForgeNode({
  node,
  isSelected,
  isStartNode,
  onClick,
  onDoubleClick,
  onDragStart,
  onConnectionStart,
}: ForgeNodeProps) {
  const config = NODE_CONFIGS[node.type];
  const ports = getOutputPorts(node);
  
  return (
    <div
      className={cn(
        "forge-node absolute cursor-pointer transition-shadow",
        "rounded-lg border-2 bg-surface-card",
        isSelected ? "border-bronze shadow-glow" : "border-surface-divider hover:border-bronze/50",
        node.isVictoryNode && "ring-2 ring-success ring-offset-2 ring-offset-surface-base",
        node.isFailureNode && "ring-2 ring-error ring-offset-2 ring-offset-surface-base"
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: NODE_WIDTH,
        minHeight: NODE_HEIGHT,
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseDown={onDragStart}
    >
      {/* Start node indicator */}
      {isStartNode && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-bronze text-xs font-bold text-black rounded">
          START
        </div>
      )}
      
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-t-md"
        style={{ backgroundColor: config.color + '20' }}
      >
        <span className="text-lg">{config.icon}</span>
        <span
          className="text-xs font-semibold px-1.5 py-0.5 rounded"
          style={{ backgroundColor: config.color, color: 'white' }}
        >
          {config.label}
        </span>
        {node.isVictoryNode && <span className="text-xs">🏆</span>}
        {node.isFailureNode && <span className="text-xs">💀</span>}
      </div>
      
      {/* Content */}
      <div className="px-3 py-2">
        <p className="font-medium text-sm truncate">
          {node.title || 'Untitled'}
        </p>
        {node.content && (
          <p className="text-xs text-muted-foreground truncate mt-1">
            {node.content.slice(0, 50)}...
          </p>
        )}
      </div>
      
      {/* Input port */}
      <div
        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-surface-divider border-2 border-surface-card hover:bg-bronze cursor-crosshair"
        title="Input"
      />
      
      {/* Output ports */}
      {ports.map((port, index) => {
        const portY = (NODE_HEIGHT / (ports.length + 1)) * (index + 1);
        const portColor = CONNECTION_CONFIGS[port.type]?.color || '#6B7280';
        
        return (
          <div
            key={port.id}
            className="absolute right-0 translate-x-1/2 w-3 h-3 rounded-full border-2 border-surface-card cursor-crosshair hover:scale-125 transition-transform"
            style={{
              top: portY,
              backgroundColor: portColor,
            }}
            title={port.label}
            onMouseDown={(e) => {
              e.stopPropagation();
              onConnectionStart(port.id, {
                x: node.position.x + NODE_WIDTH,
                y: node.position.y + portY,
              });
            }}
          />
        );
      })}
    </div>
  );
}

export default ForgeCanvas;
