/**
 * @sparc/ui Map Canvas Component
 * 
 * Main canvas renderer for the VTT system.
 * Handles background image, grid, tokens, fog, and drawings.
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Token } from './Token';
import type {
  VTTState,
  Drawing,
  FogRegion,
  Point,
  Viewport,
} from './types';

// ============================================================================
// Map Canvas Props
// ============================================================================

export interface MapCanvasProps {
  state: VTTState;
  width?: number;
  height?: number;
  onViewportChange: (viewport: Partial<Viewport>) => void;
  onTokenSelect: (tokenId: string | null) => void;
  onTokenMove: (tokenId: string, x: number, y: number) => void;
  onTokenEdit: (tokenId: string) => void;
  onFogDraw: (region: FogRegion) => void;
  onDrawingAdd: (drawing: Omit<Drawing, 'id' | 'createdBy' | 'createdAt'>) => void;
  onPing: (x: number, y: number) => void;
  onMeasure: (start: Point, end: Point) => void;
  canControlToken: (tokenId: string) => boolean;
  className?: string;
}

// ============================================================================
// Map Canvas Component
// ============================================================================

export function MapCanvas({
  state,
  width = 800,
  height = 600,
  onViewportChange,
  onTokenSelect,
  onTokenMove,
  onTokenEdit,
  onFogDraw,
  onDrawingAdd,
  onPing,
  onMeasure,
  canControlToken,
  className,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fogCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isPanning, setIsPanning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingStart, setDrawingStart] = useState<Point | null>(null);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [measureStart, setMeasureStart] = useState<Point | null>(null);
  const [measureEnd, setMeasureEnd] = useState<Point | null>(null);

  const { map, sessionState, viewport, mode, layerVisibility, isSeer } = state;

  // Calculate cell size based on map dimensions
  const cellSize = map
    ? Math.min(width / map.gridColumns, height / map.gridRows)
    : 50;

  const canvasWidth = map ? map.gridColumns * cellSize : width;
  const canvasHeight = map ? map.gridRows * cellSize : height;

  // ============================================================================
  // Fog of War Rendering
  // ============================================================================

  useEffect(() => {
    if (!fogCanvasRef.current || !sessionState || !layerVisibility.fog) return;
    if (isSeer) return; // Seer sees everything

    const ctx = fogCanvasRef.current.getContext('2d');
    if (!ctx) return;

    // Fill with fog
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Cut out revealed areas
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';

    for (const region of sessionState.fogRevealed) {
      switch (region.type) {
        case 'rect':
          ctx.fillRect(
            region.x * cellSize,
            region.y * cellSize,
            region.width * cellSize,
            region.height * cellSize
          );
          break;
        case 'circle':
          ctx.beginPath();
          ctx.arc(
            region.cx * cellSize,
            region.cy * cellSize,
            region.radius * cellSize,
            0,
            Math.PI * 2
          );
          ctx.fill();
          break;
        case 'polygon':
          ctx.beginPath();
          if (region.points.length > 0) {
            ctx.moveTo(
              region.points[0][0] * cellSize,
              region.points[0][1] * cellSize
            );
            for (const [x, y] of region.points.slice(1)) {
              ctx.lineTo(x * cellSize, y * cellSize);
            }
          }
          ctx.closePath();
          ctx.fill();
          break;
      }
    }

    ctx.globalCompositeOperation = 'source-over';
  }, [sessionState, canvasWidth, canvasHeight, cellSize, layerVisibility.fog, isSeer]);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const getCanvasPoint = useCallback(
    (e: React.MouseEvent): Point => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      
      return {
        x: (e.clientX - rect.left - viewport.x) / viewport.scale,
        y: (e.clientY - rect.top - viewport.y) / viewport.scale,
      };
    },
    [viewport]
  );

  const getGridPoint = useCallback(
    (point: Point): Point => ({
      x: Math.floor(point.x / cellSize),
      y: Math.floor(point.y / cellSize),
    }),
    [cellSize]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const point = getCanvasPoint(e);
      const gridPoint = getGridPoint(point);

      switch (mode) {
        case 'pan':
          setIsPanning(true);
          break;

        case 'select':
          // Click on empty space deselects
          onTokenSelect(null);
          break;

        case 'fog':
          if (isSeer) {
            setIsDrawing(true);
            setDrawingStart(gridPoint);
          }
          break;

        case 'draw':
          setIsDrawing(true);
          setDrawingStart(point);
          if (state.drawingTool === 'pen') {
            setCurrentPath(`M ${point.x} ${point.y}`);
          }
          break;

        case 'measure':
          setMeasureStart(gridPoint);
          setMeasureEnd(gridPoint);
          break;

        case 'token':
          // Double-click to place, handled elsewhere
          break;
      }
    },
    [mode, getCanvasPoint, getGridPoint, isSeer, onTokenSelect, state.drawingTool]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const point = getCanvasPoint(e);
      const gridPoint = getGridPoint(point);

      if (isPanning) {
        onViewportChange({
          x: viewport.x + e.movementX,
          y: viewport.y + e.movementY,
        });
        return;
      }

      if (isDrawing && drawingStart) {
        if (mode === 'draw' && state.drawingTool === 'pen') {
          setCurrentPath((prev) => prev + ` L ${point.x} ${point.y}`);
        }
      }

      if (measureStart) {
        setMeasureEnd(gridPoint);
      }
    },
    [
      isPanning,
      isDrawing,
      drawingStart,
      measureStart,
      mode,
      state.drawingTool,
      viewport,
      getCanvasPoint,
      getGridPoint,
      onViewportChange,
    ]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      const point = getCanvasPoint(e);
      const gridPoint = getGridPoint(point);

      if (isPanning) {
        setIsPanning(false);
        return;
      }

      if (isDrawing && drawingStart) {
        if (mode === 'fog' && isSeer) {
          // Create fog region
          const region: FogRegion = {
            type: 'rect',
            x: Math.min(drawingStart.x, gridPoint.x),
            y: Math.min(drawingStart.y, gridPoint.y),
            width: Math.abs(gridPoint.x - drawingStart.x) + 1,
            height: Math.abs(gridPoint.y - drawingStart.y) + 1,
          };
          onFogDraw(region);
        } else if (mode === 'draw') {
          // Create drawing
          const { drawingTool, drawingColor, strokeWidth, drawingLayer } = state;

          switch (drawingTool) {
            case 'pen':
              onDrawingAdd({
                type: 'path',
                layer: drawingLayer,
                strokeColor: drawingColor,
                strokeWidth,
                path: currentPath,
              });
              break;
            case 'line':
              onDrawingAdd({
                type: 'line',
                layer: drawingLayer,
                strokeColor: drawingColor,
                strokeWidth,
                x1: drawingStart.x,
                y1: drawingStart.y,
                x2: point.x,
                y2: point.y,
              });
              break;
            case 'rect':
              onDrawingAdd({
                type: 'rect',
                layer: drawingLayer,
                strokeColor: drawingColor,
                strokeWidth,
                x1: Math.min(drawingStart.x, point.x),
                y1: Math.min(drawingStart.y, point.y),
                width: Math.abs(point.x - drawingStart.x),
                height: Math.abs(point.y - drawingStart.y),
              });
              break;
            case 'circle':
              const radius = Math.sqrt(
                Math.pow(point.x - drawingStart.x, 2) +
                  Math.pow(point.y - drawingStart.y, 2)
              );
              onDrawingAdd({
                type: 'circle',
                layer: drawingLayer,
                strokeColor: drawingColor,
                strokeWidth,
                x1: drawingStart.x,
                y1: drawingStart.y,
                radius,
              });
              break;
          }
        }

        setIsDrawing(false);
        setDrawingStart(null);
        setCurrentPath('');
      }

      if (measureStart && measureEnd) {
        onMeasure(measureStart, measureEnd);
        setMeasureStart(null);
        setMeasureEnd(null);
      }
    },
    [
      isPanning,
      isDrawing,
      drawingStart,
      measureStart,
      measureEnd,
      mode,
      isSeer,
      state,
      currentPath,
      getCanvasPoint,
      getGridPoint,
      onFogDraw,
      onDrawingAdd,
      onMeasure,
    ]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const point = getCanvasPoint(e);
      const gridPoint = getGridPoint(point);

      if (mode === 'select' || mode === 'pan') {
        // Ping the map
        onPing(gridPoint.x, gridPoint.y);
      }
    },
    [mode, getCanvasPoint, getGridPoint, onPing]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(4, Math.max(0.25, viewport.scale * delta));

      // Zoom toward cursor
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;

        onViewportChange({
          scale: newScale,
          x: cursorX - (cursorX - viewport.x) * (newScale / viewport.scale),
          y: cursorY - (cursorY - viewport.y) * (newScale / viewport.scale),
        });
      }
    },
    [viewport, onViewportChange]
  );

  // ============================================================================
  // Render
  // ============================================================================

  if (!map || !sessionState) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-slate-900 rounded-lg border border-slate-700',
          className
        )}
        style={{ width, height }}
      >
        <p className="text-slate-500">No map loaded</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-slate-900 rounded-lg border border-slate-700',
        mode === 'pan' && 'cursor-grab',
        isPanning && 'cursor-grabbing',
        mode === 'draw' && 'cursor-crosshair',
        mode === 'fog' && 'cursor-crosshair',
        mode === 'measure' && 'cursor-crosshair',
        className
      )}
      style={{ width, height }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
    >
      <div
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
          transformOrigin: '0 0',
          width: canvasWidth,
          height: canvasHeight,
          position: 'relative',
        }}
      >
        {/* Background Image */}
        {map.imageUrl && (
          <img
            src={map.imageUrl}
            alt={map.name}
            className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
            style={{ width: canvasWidth, height: canvasHeight }}
            draggable={false}
          />
        )}

        {/* Grid Overlay */}
        {layerVisibility.grid && (
          <svg
            className="absolute top-0 left-0 pointer-events-none"
            width={canvasWidth}
            height={canvasHeight}
          >
            {/* Vertical lines */}
            {Array.from({ length: map.gridColumns + 1 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * cellSize + (map.gridOffsetX || 0)}
                y1={0}
                x2={i * cellSize + (map.gridOffsetX || 0)}
                y2={canvasHeight}
                stroke={map.gridColor || '#ffffff'}
                strokeOpacity={map.gridOpacity || 0.3}
                strokeWidth={1}
              />
            ))}
            {/* Horizontal lines */}
            {Array.from({ length: map.gridRows + 1 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1={0}
                y1={i * cellSize + (map.gridOffsetY || 0)}
                x2={canvasWidth}
                y2={i * cellSize + (map.gridOffsetY || 0)}
                stroke={map.gridColor || '#ffffff'}
                strokeOpacity={map.gridOpacity || 0.3}
                strokeWidth={1}
              />
            ))}
          </svg>
        )}

        {/* Drawings Layer */}
        {layerVisibility.drawings && (
          <svg
            className="absolute top-0 left-0 pointer-events-none"
            width={canvasWidth}
            height={canvasHeight}
          >
            {sessionState.drawings
              .filter((d) => d.layer === 'drawings' || (d.layer === 'gm' && isSeer && layerVisibility.gmNotes))
              .map((drawing) => (
                <DrawingElement key={drawing.id} drawing={drawing} />
              ))}

            {/* Current drawing preview */}
            {isDrawing && drawingStart && mode === 'draw' && (
              <DrawingPreview
                tool={state.drawingTool}
                start={drawingStart}
                path={currentPath}
                color={state.drawingColor}
                strokeWidth={state.strokeWidth}
              />
            )}
          </svg>
        )}

        {/* Tokens Layer */}
        {layerVisibility.tokens &&
          sessionState.tokens.map((token) => (
            <Token
              key={token.id}
              token={token}
              cellSize={cellSize}
              isSelected={state.selectedTokenId === token.id}
              canControl={canControlToken(token.id)}
              isSeer={isSeer}
              onSelect={() => onTokenSelect(token.id)}
              onMove={(x, y) => onTokenMove(token.id, x, y)}
              onEdit={() => onTokenEdit(token.id)}
            />
          ))}

        {/* Fog of War Layer (for players) */}
        {layerVisibility.fog && !isSeer && sessionState.fogEnabled && (
          <canvas
            ref={fogCanvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="absolute top-0 left-0 pointer-events-none"
          />
        )}

        {/* Fog Reveal Preview (for Seer) */}
        {isSeer && mode === 'fog' && isDrawing && drawingStart && (
          <div
            className={cn(
              'absolute border-2 pointer-events-none',
              state.fogMode === 'reveal'
                ? 'border-green-500 bg-green-500/20'
                : 'border-red-500 bg-red-500/20'
            )}
            style={{
              left: Math.min(drawingStart.x, measureEnd?.x ?? drawingStart.x) * cellSize,
              top: Math.min(drawingStart.y, measureEnd?.y ?? drawingStart.y) * cellSize,
              width: Math.abs((measureEnd?.x ?? drawingStart.x) - drawingStart.x + 1) * cellSize,
              height: Math.abs((measureEnd?.y ?? drawingStart.y) - drawingStart.y + 1) * cellSize,
            }}
          />
        )}

        {/* Measurement Line */}
        {mode === 'measure' && measureStart && measureEnd && (
          <MeasurementOverlay
            start={measureStart}
            end={measureEnd}
            cellSize={cellSize}
          />
        )}

        {/* Pings */}
        {state.pings.map((ping) => (
          <div
            key={ping.id}
            className="absolute pointer-events-none animate-ping"
            style={{
              left: ping.x * cellSize + cellSize / 2 - 12,
              top: ping.y * cellSize + cellSize / 2 - 12,
              width: 24,
              height: 24,
              backgroundColor: ping.color,
              borderRadius: '50%',
              opacity: 0.8,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Drawing Element Component
// ============================================================================

interface DrawingElementProps {
  drawing: Drawing;
}

function DrawingElement({ drawing }: DrawingElementProps) {
  switch (drawing.type) {
    case 'path':
      return (
        <path
          d={drawing.path}
          stroke={drawing.strokeColor}
          strokeWidth={drawing.strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case 'line':
      return (
        <line
          x1={drawing.x1}
          y1={drawing.y1}
          x2={drawing.x2}
          y2={drawing.y2}
          stroke={drawing.strokeColor}
          strokeWidth={drawing.strokeWidth}
          strokeLinecap="round"
        />
      );
    case 'rect':
      return (
        <rect
          x={drawing.x1}
          y={drawing.y1}
          width={drawing.width}
          height={drawing.height}
          stroke={drawing.strokeColor}
          strokeWidth={drawing.strokeWidth}
          fill={drawing.fillColor || 'none'}
        />
      );
    case 'circle':
      return (
        <circle
          cx={drawing.x1}
          cy={drawing.y1}
          r={drawing.radius}
          stroke={drawing.strokeColor}
          strokeWidth={drawing.strokeWidth}
          fill={drawing.fillColor || 'none'}
        />
      );
    case 'text':
      return (
        <text
          x={drawing.x1}
          y={drawing.y1}
          fill={drawing.strokeColor}
          fontSize={drawing.fontSize || 14}
        >
          {drawing.text}
        </text>
      );
    default:
      return null;
  }
}

// ============================================================================
// Drawing Preview Component
// ============================================================================

interface DrawingPreviewProps {
  tool: string;
  path: string;
  color: string;
  strokeWidth: number;
}

function DrawingPreview({ tool, path, color, strokeWidth }: DrawingPreviewProps) {
  if (tool === 'pen' && path) {
    return (
      <path
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.5}
      />
    );
  }
  return null;
}

// ============================================================================
// Measurement Overlay Component
// ============================================================================

interface MeasurementOverlayProps {
  start: Point;
  end: Point;
  cellSize: number;
  gridScale?: number; // feet per cell
}

function MeasurementOverlay({
  start,
  end,
  cellSize,
  gridScale = 5,
}: MeasurementOverlayProps) {
  const startX = start.x * cellSize + cellSize / 2;
  const startY = start.y * cellSize + cellSize / 2;
  const endX = end.x * cellSize + cellSize / 2;
  const endY = end.y * cellSize + cellSize / 2;

  // Calculate distance in grid squares (using diagonal movement rules)
  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);
  const diagonal = Math.min(dx, dy);
  const straight = Math.abs(dx - dy);
  // 5-10-5 rule: diagonals alternate between 5 and 10 feet
  const distanceSquares = straight + diagonal * 1.5;
  const distanceFeet = Math.round(distanceSquares * gridScale);

  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      style={{ overflow: 'visible' }}
    >
      {/* Line */}
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke="#f59e0b"
        strokeWidth={2}
        strokeDasharray="4 4"
      />
      {/* Start point */}
      <circle cx={startX} cy={startY} r={4} fill="#f59e0b" />
      {/* End point */}
      <circle cx={endX} cy={endY} r={4} fill="#f59e0b" />
      {/* Distance label */}
      <rect
        x={midX - 30}
        y={midY - 12}
        width={60}
        height={24}
        rx={4}
        fill="rgba(0, 0, 0, 0.8)"
      />
      <text
        x={midX}
        y={midY + 5}
        textAnchor="middle"
        fill="#f59e0b"
        fontSize={12}
        fontWeight="bold"
      >
        {distanceFeet} ft
      </text>
    </svg>
  );
}
