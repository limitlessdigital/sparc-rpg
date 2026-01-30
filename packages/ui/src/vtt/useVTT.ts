/**
 * @sparc/ui VTT State Management Hook
 * 
 * Zustand-like state management for the VTT system.
 * Handles local state and coordinates with real-time sync.
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import type {
  VTTState,
  VttMap,
  SessionMapState,
  MapToken,
  Drawing,
  FogRegion,
  Viewport,
  CanvasMode,
  FogTool,
  FogMode,
  DrawingTool,
  MapPing,
} from './types';

// Simple UUID generator (crypto-based when available, fallback otherwise)
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// ============================================================================
// Default State
// ============================================================================

const createDefaultState = (userId: string, isSeer: boolean): VTTState => ({
  map: null,
  sessionState: null,
  mode: 'select',
  selectedTokenId: null,
  fogTool: 'rect',
  fogMode: 'reveal',
  drawingTool: 'pen',
  drawingColor: '#ef4444',
  strokeWidth: 2,
  drawingLayer: 'drawings',
  viewport: { x: 0, y: 0, scale: 1 },
  layerVisibility: {
    grid: true,
    tokens: true,
    drawings: true,
    gmNotes: isSeer,
    fog: true,
  },
  measurement: null,
  pings: [],
  isSeer,
  userId,
});

// ============================================================================
// Hook Options
// ============================================================================

export interface UseVTTOptions {
  userId: string;
  isSeer: boolean;
  sessionId: string;
  onTokenMove?: (tokenId: string, x: number, y: number) => void;
  onTokenAdd?: (token: MapToken) => void;
  onTokenRemove?: (tokenId: string) => void;
  onTokenUpdate?: (tokenId: string, updates: Partial<MapToken>) => void;
  onFogReveal?: (region: FogRegion) => void;
  onFogHide?: (region: FogRegion) => void;
  onFogReset?: () => void;
  onDrawingAdd?: (drawing: Drawing) => void;
  onDrawingRemove?: (drawingId: string) => void;
  onDrawingsClear?: (layer?: 'gm' | 'drawings') => void;
  onPing?: (x: number, y: number, color: string) => void;
  onMapChange?: (mapId: string) => void;
}

// ============================================================================
// Hook Return Type
// ============================================================================

export interface UseVTTReturn {
  state: VTTState;
  
  // Map operations
  loadMap: (map: VttMap) => void;
  loadSessionState: (state: SessionMapState) => void;
  clearMap: () => void;
  
  // Mode operations
  setMode: (mode: CanvasMode) => void;
  
  // Viewport operations
  setViewport: (viewport: Partial<Viewport>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  centerOnToken: (tokenId: string) => void;
  
  // Token operations
  selectToken: (tokenId: string | null) => void;
  moveToken: (tokenId: string, x: number, y: number) => void;
  addToken: (token: Omit<MapToken, 'id'>) => void;
  removeToken: (tokenId: string) => void;
  updateToken: (tokenId: string, updates: Partial<MapToken>) => void;
  canControlToken: (tokenId: string) => boolean;
  
  // Fog operations
  setFogTool: (tool: FogTool) => void;
  setFogMode: (mode: FogMode) => void;
  revealFog: (region: FogRegion) => void;
  hideFog: (region: FogRegion) => void;
  resetFog: () => void;
  
  // Drawing operations
  setDrawingTool: (tool: DrawingTool) => void;
  setDrawingColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setDrawingLayer: (layer: 'gm' | 'drawings') => void;
  addDrawing: (drawing: Omit<Drawing, 'id' | 'createdBy' | 'createdAt'>) => void;
  removeDrawing: (drawingId: string) => void;
  clearDrawings: (layer?: 'gm' | 'drawings') => void;
  undoDrawing: () => void;
  
  // Layer operations
  setLayerVisibility: (layer: keyof VTTState['layerVisibility'], visible: boolean) => void;
  
  // Measurement operations
  startMeasurement: (x: number, y: number) => void;
  updateMeasurement: (x: number, y: number) => void;
  clearMeasurement: () => void;
  
  // Ping operations
  sendPing: (x: number, y: number, color?: string) => void;
  addPing: (ping: MapPing) => void;
  removePing: (pingId: string) => void;
  
  // Utility
  gridToPixel: (gridX: number, gridY: number) => { x: number; y: number };
  pixelToGrid: (pixelX: number, pixelY: number) => { x: number; y: number };
  getCellSize: () => number;
}

// ============================================================================
// Main Hook
// ============================================================================

export function useVTT(options: UseVTTOptions): UseVTTReturn {
  const {
    userId,
    isSeer,
    onTokenMove,
    onTokenAdd,
    onTokenRemove,
    onTokenUpdate,
    onFogReveal,
    onFogHide,
    onFogReset,
    onDrawingAdd,
    onDrawingRemove,
    onDrawingsClear,
    onPing,
  } = options;

  const [state, setState] = useState<VTTState>(() => createDefaultState(userId, isSeer));
  const drawingHistoryRef = useRef<string[]>([]);
  const pingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // ============================================================================
  // Map Operations
  // ============================================================================

  const loadMap = useCallback((map: VttMap) => {
    setState((prev) => ({ ...prev, map }));
  }, []);

  const loadSessionState = useCallback((sessionState: SessionMapState) => {
    setState((prev) => ({
      ...prev,
      sessionState,
      map: sessionState.map || prev.map,
    }));
  }, []);

  const clearMap = useCallback(() => {
    setState((prev) => ({
      ...prev,
      map: null,
      sessionState: null,
      selectedTokenId: null,
      measurement: null,
    }));
  }, []);

  // ============================================================================
  // Mode Operations
  // ============================================================================

  const setMode = useCallback((mode: CanvasMode) => {
    setState((prev) => ({
      ...prev,
      mode,
      selectedTokenId: mode !== 'select' ? null : prev.selectedTokenId,
    }));
  }, []);

  // ============================================================================
  // Viewport Operations
  // ============================================================================

  const setViewport = useCallback((viewport: Partial<Viewport>) => {
    setState((prev) => ({
      ...prev,
      viewport: { ...prev.viewport, ...viewport },
    }));
  }, []);

  const zoomIn = useCallback(() => {
    setState((prev) => ({
      ...prev,
      viewport: {
        ...prev.viewport,
        scale: Math.min(prev.viewport.scale * 1.2, 4),
      },
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setState((prev) => ({
      ...prev,
      viewport: {
        ...prev.viewport,
        scale: Math.max(prev.viewport.scale / 1.2, 0.25),
      },
    }));
  }, []);

  const resetView = useCallback(() => {
    setState((prev) => ({
      ...prev,
      viewport: { x: 0, y: 0, scale: 1 },
    }));
  }, []);

  const centerOnToken = useCallback((tokenId: string) => {
    setState((prev) => {
      const token = prev.sessionState?.tokens.find((t) => t.id === tokenId);
      if (!token || !prev.map) return prev;

      const cellSize = Math.min(800 / prev.map.gridColumns, 600 / prev.map.gridRows);
      const tokenCenterX = (token.x + token.width / 2) * cellSize;
      const tokenCenterY = (token.y + token.height / 2) * cellSize;

      return {
        ...prev,
        viewport: {
          ...prev.viewport,
          x: -tokenCenterX + 400,
          y: -tokenCenterY + 300,
        },
      };
    });
  }, []);

  // ============================================================================
  // Token Operations
  // ============================================================================

  const selectToken = useCallback((tokenId: string | null) => {
    setState((prev) => ({ ...prev, selectedTokenId: tokenId }));
  }, []);

  const canControlToken = useCallback(
    (tokenId: string) => {
      const token = state.sessionState?.tokens.find((t) => t.id === tokenId);
      if (!token) return false;
      if (isSeer) return true;
      return token.controlledBy.includes(userId);
    },
    [state.sessionState, isSeer, userId]
  );

  const moveToken = useCallback(
    (tokenId: string, x: number, y: number) => {
      if (!canControlToken(tokenId)) return;

      setState((prev) => {
        if (!prev.sessionState) return prev;
        return {
          ...prev,
          sessionState: {
            ...prev.sessionState,
            tokens: prev.sessionState.tokens.map((t) =>
              t.id === tokenId ? { ...t, x, y } : t
            ),
          },
        };
      });

      onTokenMove?.(tokenId, x, y);
    },
    [canControlToken, onTokenMove]
  );

  const addToken = useCallback(
    (tokenData: Omit<MapToken, 'id'>) => {
      if (!isSeer) return;

      const token: MapToken = {
        ...tokenData,
        id: generateId(),
      };

      setState((prev) => {
        if (!prev.sessionState) return prev;
        return {
          ...prev,
          sessionState: {
            ...prev.sessionState,
            tokens: [...prev.sessionState.tokens, token],
          },
        };
      });

      onTokenAdd?.(token);
    },
    [isSeer, onTokenAdd]
  );

  const removeToken = useCallback(
    (tokenId: string) => {
      if (!isSeer) return;

      setState((prev) => {
        if (!prev.sessionState) return prev;
        return {
          ...prev,
          sessionState: {
            ...prev.sessionState,
            tokens: prev.sessionState.tokens.filter((t) => t.id !== tokenId),
          },
          selectedTokenId:
            prev.selectedTokenId === tokenId ? null : prev.selectedTokenId,
        };
      });

      onTokenRemove?.(tokenId);
    },
    [isSeer, onTokenRemove]
  );

  const updateToken = useCallback(
    (tokenId: string, updates: Partial<MapToken>) => {
      if (!isSeer && !canControlToken(tokenId)) return;

      setState((prev) => {
        if (!prev.sessionState) return prev;
        return {
          ...prev,
          sessionState: {
            ...prev.sessionState,
            tokens: prev.sessionState.tokens.map((t) =>
              t.id === tokenId ? { ...t, ...updates } : t
            ),
          },
        };
      });

      onTokenUpdate?.(tokenId, updates);
    },
    [isSeer, canControlToken, onTokenUpdate]
  );

  // ============================================================================
  // Fog Operations
  // ============================================================================

  const setFogTool = useCallback((tool: FogTool) => {
    setState((prev) => ({ ...prev, fogTool: tool }));
  }, []);

  const setFogMode = useCallback((mode: FogMode) => {
    setState((prev) => ({ ...prev, fogMode: mode }));
  }, []);

  const revealFog = useCallback(
    (region: FogRegion) => {
      if (!isSeer) return;

      setState((prev) => {
        if (!prev.sessionState) return prev;
        return {
          ...prev,
          sessionState: {
            ...prev.sessionState,
            fogRevealed: [...prev.sessionState.fogRevealed, region],
          },
        };
      });

      onFogReveal?.(region);
    },
    [isSeer, onFogReveal]
  );

  const hideFog = useCallback(
    (region: FogRegion) => {
      if (!isSeer) return;
      // In a full implementation, this would modify/remove overlapping regions
      onFogHide?.(region);
    },
    [isSeer, onFogHide]
  );

  const resetFog = useCallback(() => {
    if (!isSeer) return;

    setState((prev) => {
      if (!prev.sessionState) return prev;
      return {
        ...prev,
        sessionState: {
          ...prev.sessionState,
          fogRevealed: [],
        },
      };
    });

    onFogReset?.();
  }, [isSeer, onFogReset]);

  // ============================================================================
  // Drawing Operations
  // ============================================================================

  const setDrawingTool = useCallback((tool: DrawingTool) => {
    setState((prev) => ({ ...prev, drawingTool: tool }));
  }, []);

  const setDrawingColor = useCallback((color: string) => {
    setState((prev) => ({ ...prev, drawingColor: color }));
  }, []);

  const setStrokeWidth = useCallback((width: number) => {
    setState((prev) => ({ ...prev, strokeWidth: width }));
  }, []);

  const setDrawingLayer = useCallback((layer: 'gm' | 'drawings') => {
    setState((prev) => ({ ...prev, drawingLayer: layer }));
  }, []);

  const addDrawing = useCallback(
    (drawingData: Omit<Drawing, 'id' | 'createdBy' | 'createdAt'>) => {
      const drawing: Drawing = {
        ...drawingData,
        id: generateId(),
        createdBy: userId,
        createdAt: new Date().toISOString(),
      };

      // Only Seer can draw on GM layer
      if (drawing.layer === 'gm' && !isSeer) return;

      setState((prev) => {
        if (!prev.sessionState) return prev;
        return {
          ...prev,
          sessionState: {
            ...prev.sessionState,
            drawings: [...prev.sessionState.drawings, drawing],
          },
        };
      });

      drawingHistoryRef.current.push(drawing.id);
      onDrawingAdd?.(drawing);
    },
    [userId, isSeer, onDrawingAdd]
  );

  const removeDrawing = useCallback(
    (drawingId: string) => {
      setState((prev) => {
        if (!prev.sessionState) return prev;
        const drawing = prev.sessionState.drawings.find((d) => d.id === drawingId);
        if (!drawing) return prev;
        // Only creator or Seer can remove
        if (drawing.createdBy !== userId && !isSeer) return prev;

        return {
          ...prev,
          sessionState: {
            ...prev.sessionState,
            drawings: prev.sessionState.drawings.filter((d) => d.id !== drawingId),
          },
        };
      });

      onDrawingRemove?.(drawingId);
    },
    [userId, isSeer, onDrawingRemove]
  );

  const clearDrawings = useCallback(
    (layer?: 'gm' | 'drawings') => {
      if (!isSeer) return;

      setState((prev) => {
        if (!prev.sessionState) return prev;
        return {
          ...prev,
          sessionState: {
            ...prev.sessionState,
            drawings: layer
              ? prev.sessionState.drawings.filter((d) => d.layer !== layer)
              : [],
          },
        };
      });

      drawingHistoryRef.current = [];
      onDrawingsClear?.(layer);
    },
    [isSeer, onDrawingsClear]
  );

  const undoDrawing = useCallback(() => {
    const lastDrawingId = drawingHistoryRef.current.pop();
    if (lastDrawingId) {
      removeDrawing(lastDrawingId);
    }
  }, [removeDrawing]);

  // ============================================================================
  // Layer Operations
  // ============================================================================

  const setLayerVisibility = useCallback(
    (layer: keyof VTTState['layerVisibility'], visible: boolean) => {
      setState((prev) => ({
        ...prev,
        layerVisibility: { ...prev.layerVisibility, [layer]: visible },
      }));
    },
    []
  );

  // ============================================================================
  // Measurement Operations
  // ============================================================================

  const startMeasurement = useCallback((x: number, y: number) => {
    setState((prev) => ({
      ...prev,
      measurement: { startX: x, startY: y, endX: x, endY: y, distance: 0 },
    }));
  }, []);

  const updateMeasurement = useCallback((x: number, y: number) => {
    setState((prev) => {
      if (!prev.measurement) return prev;
      const dx = x - prev.measurement.startX;
      const dy = y - prev.measurement.startY;
      // Diagonal distance in grid squares (using 5-10-5 rule approximation)
      const distance = Math.sqrt(dx * dx + dy * dy);
      return {
        ...prev,
        measurement: {
          ...prev.measurement,
          endX: x,
          endY: y,
          distance,
        },
      };
    });
  }, []);

  const clearMeasurement = useCallback(() => {
    setState((prev) => ({ ...prev, measurement: null }));
  }, []);

  // ============================================================================
  // Ping Operations
  // ============================================================================

  const sendPing = useCallback(
    (x: number, y: number, color = '#ef4444') => {
      const ping: MapPing = {
        id: generateId(),
        x,
        y,
        color,
        createdBy: userId,
        createdAt: Date.now(),
        expiresAt: Date.now() + 3000, // 3 second ping
      };

      setState((prev) => ({
        ...prev,
        pings: [...prev.pings, ping],
      }));

      // Auto-remove after expiry
      const timeout = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          pings: prev.pings.filter((p) => p.id !== ping.id),
        }));
        pingTimeoutsRef.current.delete(ping.id);
      }, 3000);

      pingTimeoutsRef.current.set(ping.id, timeout);
      onPing?.(x, y, color);
    },
    [userId, onPing]
  );

  const addPing = useCallback((ping: MapPing) => {
    setState((prev) => ({
      ...prev,
      pings: [...prev.pings, ping],
    }));

    const timeout = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        pings: prev.pings.filter((p) => p.id !== ping.id),
      }));
      pingTimeoutsRef.current.delete(ping.id);
    }, ping.expiresAt - Date.now());

    pingTimeoutsRef.current.set(ping.id, timeout);
  }, []);

  const removePing = useCallback((pingId: string) => {
    setState((prev) => ({
      ...prev,
      pings: prev.pings.filter((p) => p.id !== pingId),
    }));

    const timeout = pingTimeoutsRef.current.get(pingId);
    if (timeout) {
      clearTimeout(timeout);
      pingTimeoutsRef.current.delete(pingId);
    }
  }, []);

  // ============================================================================
  // Utility Functions
  // ============================================================================

  const getCellSize = useCallback(() => {
    if (!state.map) return 50;
    // Default canvas size of 800x600, calculate cell size
    const maxWidth = 800;
    const maxHeight = 600;
    const cellWidth = maxWidth / state.map.gridColumns;
    const cellHeight = maxHeight / state.map.gridRows;
    return Math.min(cellWidth, cellHeight);
  }, [state.map]);

  const gridToPixel = useCallback(
    (gridX: number, gridY: number) => {
      const cellSize = getCellSize();
      const offsetX = state.map?.gridOffsetX || 0;
      const offsetY = state.map?.gridOffsetY || 0;
      return {
        x: gridX * cellSize + offsetX,
        y: gridY * cellSize + offsetY,
      };
    },
    [getCellSize, state.map]
  );

  const pixelToGrid = useCallback(
    (pixelX: number, pixelY: number) => {
      const cellSize = getCellSize();
      const offsetX = state.map?.gridOffsetX || 0;
      const offsetY = state.map?.gridOffsetY || 0;
      return {
        x: Math.floor((pixelX - offsetX) / cellSize),
        y: Math.floor((pixelY - offsetY) / cellSize),
      };
    },
    [getCellSize, state.map]
  );

  // ============================================================================
  // Return
  // ============================================================================

  return useMemo(
    () => ({
      state,
      loadMap,
      loadSessionState,
      clearMap,
      setMode,
      setViewport,
      zoomIn,
      zoomOut,
      resetView,
      centerOnToken,
      selectToken,
      moveToken,
      addToken,
      removeToken,
      updateToken,
      canControlToken,
      setFogTool,
      setFogMode,
      revealFog,
      hideFog,
      resetFog,
      setDrawingTool,
      setDrawingColor,
      setStrokeWidth,
      setDrawingLayer,
      addDrawing,
      removeDrawing,
      clearDrawings,
      undoDrawing,
      setLayerVisibility,
      startMeasurement,
      updateMeasurement,
      clearMeasurement,
      sendPing,
      addPing,
      removePing,
      gridToPixel,
      pixelToGrid,
      getCellSize,
    }),
    [
      state,
      loadMap,
      loadSessionState,
      clearMap,
      setMode,
      setViewport,
      zoomIn,
      zoomOut,
      resetView,
      centerOnToken,
      selectToken,
      moveToken,
      addToken,
      removeToken,
      updateToken,
      canControlToken,
      setFogTool,
      setFogMode,
      revealFog,
      hideFog,
      resetFog,
      setDrawingTool,
      setDrawingColor,
      setStrokeWidth,
      setDrawingLayer,
      addDrawing,
      removeDrawing,
      clearDrawings,
      undoDrawing,
      setLayerVisibility,
      startMeasurement,
      updateMeasurement,
      clearMeasurement,
      sendPing,
      addPing,
      removePing,
      gridToPixel,
      pixelToGrid,
      getCellSize,
    ]
  );
}
