/**
 * @sparc/ui VTT View Component
 * 
 * Main combined view for the VTT Lite system.
 * Integrates map canvas, tools, and library.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '../lib/utils';
import { MapCanvas } from './MapCanvas';
import { Token, TokenPalette, TokenPropertiesModal } from './Token';
import {
  ModeSelector,
  FogControls,
  DrawingTools,
  LayerPanel,
  ZoomControls,
  SeerToolsPanel,
} from './MapTools';
import { MapLibrary, MapCreator } from './MapLibrary';
import { useVTT } from './useVTT';
import type {
  VttMap,
  MapToken,
  SessionMapState,
  FogRegion,
  Drawing,
  Point,
} from './types';

// ============================================================================
// VTT View Props
// ============================================================================

export interface VTTViewProps {
  sessionId: string;
  userId: string;
  isSeer: boolean;
  
  // Initial data
  initialMap?: VttMap;
  initialState?: SessionMapState;
  maps?: VttMap[];
  
  // Callbacks for real-time sync
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
  onMapCreate?: (map: Omit<VttMap, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => void;
  onMapDelete?: (mapId: string) => void;
  
  className?: string;
}

// ============================================================================
// VTT View Component
// ============================================================================

export function VTTView({
  sessionId,
  userId,
  isSeer,
  initialMap,
  initialState,
  maps = [],
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
  onMapChange,
  onMapCreate,
  onMapDelete,
  className,
}: VTTViewProps) {
  const [showLibrary, setShowLibrary] = useState(false);
  const [showMapCreator, setShowMapCreator] = useState(false);
  const [editingTokenId, setEditingTokenId] = useState<string | null>(null);
  const [pendingToken, setPendingToken] = useState<{ name: string; color: string } | null>(null);

  // VTT state hook
  const vtt = useVTT({
    userId,
    isSeer,
    sessionId,
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
    onMapChange,
  });

  // Load initial data
  React.useEffect(() => {
    if (initialMap) {
      vtt.loadMap(initialMap);
    }
    if (initialState) {
      vtt.loadSessionState(initialState);
    }
  }, [initialMap, initialState, vtt.loadMap, vtt.loadSessionState]);

  // Get editing token
  const editingToken = useMemo(() => {
    if (!editingTokenId || !vtt.state.sessionState) return null;
    return vtt.state.sessionState.tokens.find((t) => t.id === editingTokenId) || null;
  }, [editingTokenId, vtt.state.sessionState]);

  // Handle map canvas click for token placement
  const handleCanvasClick = useCallback(
    (gridX: number, gridY: number) => {
      if (vtt.state.mode === 'token' && pendingToken && isSeer) {
        vtt.addToken({
          name: pendingToken.name,
          color: pendingToken.color,
          borderColor: '#ffffff',
          x: gridX,
          y: gridY,
          width: 1,
          height: 1,
          showName: true,
          showHpBar: false,
          conditions: [],
          controlledBy: [],
          isHidden: false,
        });
        // Don't clear pending token to allow placing multiple
      }
    },
    [vtt.state.mode, pendingToken, isSeer, vtt.addToken]
  );

  // Handle measurement
  const handleMeasure = useCallback((start: Point, end: Point) => {
    // Measurement is shown on canvas already
    // Could emit event for logging/tracking
  }, []);

  return (
    <div className={cn('flex h-full bg-slate-900', className)}>
      {/* Left Panel - Map Library (Seer only, when open) */}
      {isSeer && showLibrary && (
        <div className="w-72 border-r border-slate-700 flex-shrink-0">
          <MapLibrary
            maps={maps}
            selectedMapId={vtt.state.map?.id}
            onMapSelect={(mapId) => {
              const selectedMap = maps.find((m) => m.id === mapId);
              if (selectedMap) {
                vtt.loadMap(selectedMap);
                onMapChange?.(mapId);
              }
              setShowLibrary(false);
            }}
            onMapCreate={() => setShowMapCreator(true)}
            onMapEdit={(mapId) => {
              // TODO: Edit existing map
              setShowMapCreator(true);
            }}
            onMapDelete={(mapId) => {
              if (confirm('Delete this map?')) {
                onMapDelete?.(mapId);
              }
            }}
            onMapDuplicate={(mapId) => {
              // TODO: Duplicate map
            }}
            className="h-full"
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-3">
            {isSeer && (
              <button
                onClick={() => setShowLibrary(!showLibrary)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm transition-colors',
                  showLibrary
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                )}
              >
                🗺️ Maps
              </button>
            )}

            <ModeSelector
              mode={vtt.state.mode}
              isSeer={isSeer}
              onModeChange={vtt.setMode}
            />

            {/* Current map name */}
            {vtt.state.map && (
              <span className="text-sm text-slate-400">
                {vtt.state.map.name}
              </span>
            )}
          </div>

          <ZoomControls
            scale={vtt.state.viewport.scale}
            onZoomIn={vtt.zoomIn}
            onZoomOut={vtt.zoomOut}
            onReset={vtt.resetView}
          />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Map Canvas */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            {vtt.state.map && vtt.state.sessionState ? (
              <MapCanvas
                state={vtt.state}
                width={Math.min(800, window.innerWidth - (isSeer ? 336 : 32))}
                height={Math.min(600, window.innerHeight - 200)}
                onViewportChange={vtt.setViewport}
                onTokenSelect={vtt.selectToken}
                onTokenMove={vtt.moveToken}
                onTokenEdit={(tokenId) => setEditingTokenId(tokenId)}
                onFogDraw={(region) => {
                  if (vtt.state.fogMode === 'reveal') {
                    vtt.revealFog(region);
                  } else {
                    vtt.hideFog(region);
                  }
                }}
                onDrawingAdd={vtt.addDrawing}
                onPing={(x, y) => vtt.sendPing(x, y)}
                onMeasure={handleMeasure}
                canControlToken={vtt.canControlToken}
                className="shadow-xl"
              />
            ) : (
              <div className="text-center">
                <span className="text-6xl block mb-4">🗺️</span>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Map Loaded
                </h3>
                <p className="text-slate-400 mb-4">
                  {isSeer
                    ? 'Select a map from the library or create a new one.'
                    : 'Waiting for the Seer to load a map.'}
                </p>
                {isSeer && (
                  <button
                    onClick={() => setShowLibrary(true)}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors"
                  >
                    Open Map Library
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Tools (Seer only) */}
          {isSeer && vtt.state.map && (
            <SeerToolsPanel
              state={vtt.state}
              onModeChange={vtt.setMode}
              onFogToolChange={vtt.setFogTool}
              onFogModeChange={vtt.setFogMode}
              onFogReset={vtt.resetFog}
              onDrawingToolChange={vtt.setDrawingTool}
              onDrawingColorChange={vtt.setDrawingColor}
              onStrokeWidthChange={vtt.setStrokeWidth}
              onDrawingLayerChange={vtt.setDrawingLayer}
              onDrawingsClear={vtt.clearDrawings}
              onDrawingUndo={vtt.undoDrawing}
              onLayerVisibilityChange={vtt.setLayerVisibility}
              onTokenPaletteSelect={(token) => {
                setPendingToken(token);
                vtt.setMode('token');
              }}
            />
          )}
        </div>

        {/* Token Placement Hint */}
        {vtt.state.mode === 'token' && pendingToken && (
          <div className="px-4 py-2 bg-amber-600/20 border-t border-amber-600/30 text-center">
            <span className="text-sm text-amber-300">
              Click on the map to place a {pendingToken.name} token.
              Press Escape or change mode to cancel.
            </span>
          </div>
        )}

        {/* Selected Token Info */}
        {vtt.state.selectedTokenId && vtt.state.sessionState && (
          <div className="px-4 py-2 bg-slate-800 border-t border-slate-700 flex items-center gap-4">
            {(() => {
              const token = vtt.state.sessionState.tokens.find(
                (t) => t.id === vtt.state.selectedTokenId
              );
              if (!token) return null;

              return (
                <>
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: token.color }}
                  >
                    {token.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{token.name}</p>
                    <p className="text-xs text-slate-400">
                      Position: ({token.x}, {token.y})
                      {token.hp !== undefined && ` • HP: ${token.hp}/${token.maxHp}`}
                    </p>
                  </div>
                  {(isSeer || vtt.canControlToken(token.id)) && (
                    <button
                      onClick={() => setEditingTokenId(token.id)}
                      className="px-3 py-1 bg-slate-700 text-slate-300 rounded text-sm hover:bg-slate-600"
                    >
                      Edit
                    </button>
                  )}
                  {isSeer && (
                    <button
                      onClick={() => vtt.removeToken(token.id)}
                      className="px-3 py-1 bg-red-600/20 text-red-400 rounded text-sm hover:bg-red-600/30"
                    >
                      Remove
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Token Properties Modal */}
      <TokenPropertiesModal
        token={editingToken}
        isOpen={!!editingTokenId}
        onClose={() => setEditingTokenId(null)}
        onSave={(token) => vtt.updateToken(token.id, token)}
        onDelete={(tokenId) => {
          vtt.removeToken(tokenId);
          setEditingTokenId(null);
        }}
      />

      {/* Map Creator Modal */}
      {isSeer && (
        <MapCreator
          isOpen={showMapCreator}
          onClose={() => setShowMapCreator(false)}
          onSave={(mapData) => {
            onMapCreate?.(mapData);
            setShowMapCreator(false);
            setShowLibrary(false);
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// Compact VTT Widget
// ============================================================================

export interface VTTWidgetProps {
  sessionId: string;
  userId: string;
  isSeer: boolean;
  map?: VttMap;
  state?: SessionMapState;
  onExpand?: () => void;
  className?: string;
}

export function VTTWidget({
  sessionId,
  userId,
  isSeer,
  map,
  state,
  onExpand,
  className,
}: VTTWidgetProps) {
  if (!map || !state) {
    return (
      <div
        className={cn(
          'bg-slate-800 rounded-lg border border-slate-700 p-4 text-center',
          className
        )}
      >
        <span className="text-2xl block mb-2">🗺️</span>
        <p className="text-sm text-slate-400">No map</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-slate-800 rounded-lg border border-slate-700 overflow-hidden',
        className
      )}
    >
      {/* Mini Preview */}
      <div className="relative aspect-video bg-slate-900">
        {map.imageUrl && (
          <img
            src={map.imageUrl}
            alt={map.name}
            className="w-full h-full object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-white bg-black/60 px-2 py-1 rounded">
            {state.tokens.length} tokens
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-white">{map.name}</h4>
          <p className="text-xs text-slate-400">
            {map.gridColumns}×{map.gridRows}
          </p>
        </div>
        {onExpand && (
          <button
            onClick={onExpand}
            className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs hover:bg-slate-600"
          >
            Open
          </button>
        )}
      </div>
    </div>
  );
}
