/**
 * @sparc/ui Map Tools Components
 * 
 * Seer control panels for fog of war, drawing, and layers.
 */

import React from 'react';
import { cn } from '../lib/utils';
import type {
  FogTool,
  FogMode,
  DrawingTool,
  VTTState,
  CanvasMode,
} from './types';
import { DRAWING_COLORS, STROKE_WIDTHS } from './types';

// ============================================================================
// Mode Selector
// ============================================================================

export interface ModeSelectorProps {
  mode: CanvasMode;
  isSeer: boolean;
  onModeChange: (mode: CanvasMode) => void;
}

export function ModeSelector({ mode, isSeer, onModeChange }: ModeSelectorProps) {
  const modes: Array<{ value: CanvasMode; label: string; icon: string; seerOnly?: boolean }> = [
    { value: 'select', label: 'Select', icon: '👆' },
    { value: 'pan', label: 'Pan', icon: '✋' },
    { value: 'measure', label: 'Measure', icon: '📏' },
    { value: 'token', label: 'Tokens', icon: '📍', seerOnly: true },
    { value: 'fog', label: 'Fog', icon: '🌫️', seerOnly: true },
    { value: 'draw', label: 'Draw', icon: '✏️' },
  ];

  const availableModes = modes.filter((m) => !m.seerOnly || isSeer);

  return (
    <div className="flex gap-1 p-1 bg-slate-800 rounded-lg">
      {availableModes.map((m) => (
        <button
          key={m.value}
          onClick={() => onModeChange(m.value)}
          className={cn(
            'px-3 py-2 rounded-md text-sm font-medium transition-colors',
            mode === m.value
              ? 'bg-amber-600 text-white'
              : 'text-slate-300 hover:bg-slate-700'
          )}
          title={m.label}
        >
          <span className="mr-1">{m.icon}</span>
          <span className="hidden sm:inline">{m.label}</span>
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// Fog Controls
// ============================================================================

export interface FogControlsProps {
  tool: FogTool;
  mode: FogMode;
  onToolChange: (tool: FogTool) => void;
  onModeChange: (mode: FogMode) => void;
  onReset: () => void;
}

export function FogControls({
  tool,
  mode,
  onToolChange,
  onModeChange,
  onReset,
}: FogControlsProps) {
  const fogTools: Array<{ value: FogTool; label: string; icon: string }> = [
    { value: 'rect', label: 'Rectangle', icon: '▭' },
    { value: 'brush', label: 'Brush', icon: '🖌️' },
    { value: 'circle', label: 'Circle', icon: '⭕' },
    { value: 'polygon', label: 'Polygon', icon: '⬡' },
  ];

  return (
    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <span>🌫️</span> Fog of War
      </h3>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => onModeChange('reveal')}
          className={cn(
            'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            mode === 'reveal'
              ? 'bg-green-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          )}
        >
          👁️ Reveal
        </button>
        <button
          onClick={() => onModeChange('hide')}
          className={cn(
            'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            mode === 'hide'
              ? 'bg-red-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          )}
        >
          🙈 Hide
        </button>
      </div>

      {/* Tool Selection */}
      <div className="flex gap-1 mb-3">
        {fogTools.map((t) => (
          <button
            key={t.value}
            onClick={() => onToolChange(t.value)}
            className={cn(
              'flex-1 px-2 py-1.5 rounded text-xs transition-colors',
              tool === t.value
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            )}
            title={t.label}
          >
            {t.icon}
          </button>
        ))}
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="w-full px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm"
      >
        Reset Fog
      </button>
    </div>
  );
}

// ============================================================================
// Drawing Tools
// ============================================================================

export interface DrawingToolsProps {
  tool: DrawingTool;
  color: string;
  strokeWidth: number;
  layer: 'gm' | 'drawings';
  isSeer: boolean;
  onToolChange: (tool: DrawingTool) => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onLayerChange: (layer: 'gm' | 'drawings') => void;
  onClear: (layer?: 'gm' | 'drawings') => void;
  onUndo: () => void;
}

export function DrawingTools({
  tool,
  color,
  strokeWidth,
  layer,
  isSeer,
  onToolChange,
  onColorChange,
  onStrokeWidthChange,
  onLayerChange,
  onClear,
  onUndo,
}: DrawingToolsProps) {
  const drawingTools: Array<{ value: DrawingTool; label: string; icon: string }> = [
    { value: 'pen', label: 'Pen', icon: '✏️' },
    { value: 'line', label: 'Line', icon: '📏' },
    { value: 'rect', label: 'Rectangle', icon: '▭' },
    { value: 'circle', label: 'Circle', icon: '⭕' },
    { value: 'eraser', label: 'Eraser', icon: '🧹' },
  ];

  return (
    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <span>✏️</span> Drawing
      </h3>

      {/* Tool Selection */}
      <div className="flex gap-1 mb-3">
        {drawingTools.map((t) => (
          <button
            key={t.value}
            onClick={() => onToolChange(t.value)}
            className={cn(
              'flex-1 px-2 py-1.5 rounded text-xs transition-colors',
              tool === t.value
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            )}
            title={t.label}
          >
            {t.icon}
          </button>
        ))}
      </div>

      {/* Color Selection */}
      <div className="mb-3">
        <label className="text-xs text-slate-400 mb-1 block">Color</label>
        <div className="flex gap-1 flex-wrap">
          {DRAWING_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onColorChange(c)}
              className={cn(
                'w-6 h-6 rounded border-2 transition-all',
                color === c
                  ? 'border-white scale-110'
                  : 'border-transparent hover:border-slate-500'
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Stroke Width */}
      <div className="mb-3">
        <label className="text-xs text-slate-400 mb-1 block">Size</label>
        <div className="flex gap-1">
          {STROKE_WIDTHS.map((w) => (
            <button
              key={w}
              onClick={() => onStrokeWidthChange(w)}
              className={cn(
                'flex-1 py-1 rounded transition-colors',
                strokeWidth === w
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              )}
            >
              <div
                className="mx-auto bg-current rounded-full"
                style={{ width: w * 2, height: w * 2 }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Layer Selection (Seer only) */}
      {isSeer && (
        <div className="mb-3">
          <label className="text-xs text-slate-400 mb-1 block">Layer</label>
          <div className="flex gap-2">
            <button
              onClick={() => onLayerChange('drawings')}
              className={cn(
                'flex-1 px-2 py-1.5 rounded text-xs transition-colors',
                layer === 'drawings'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              )}
            >
              Players
            </button>
            <button
              onClick={() => onLayerChange('gm')}
              className={cn(
                'flex-1 px-2 py-1.5 rounded text-xs transition-colors',
                layer === 'gm'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              )}
            >
              GM Only
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onUndo}
          className="flex-1 px-2 py-1.5 bg-slate-700 text-slate-300 rounded text-xs hover:bg-slate-600 transition-colors"
        >
          ↩️ Undo
        </button>
        <button
          onClick={() => onClear(layer)}
          className="flex-1 px-2 py-1.5 bg-slate-700 text-slate-300 rounded text-xs hover:bg-slate-600 transition-colors"
        >
          🗑️ Clear
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Layer Panel
// ============================================================================

export interface LayerPanelProps {
  visibility: VTTState['layerVisibility'];
  isSeer: boolean;
  onVisibilityChange: (layer: keyof VTTState['layerVisibility'], visible: boolean) => void;
}

export function LayerPanel({
  visibility,
  isSeer,
  onVisibilityChange,
}: LayerPanelProps) {
  const layers: Array<{
    key: keyof VTTState['layerVisibility'];
    label: string;
    icon: string;
    seerOnly?: boolean;
  }> = [
    { key: 'grid', label: 'Grid', icon: '📐' },
    { key: 'tokens', label: 'Tokens', icon: '📍' },
    { key: 'drawings', label: 'Drawings', icon: '✏️' },
    { key: 'gmNotes', label: 'GM Notes', icon: '🔒', seerOnly: true },
    { key: 'fog', label: 'Fog of War', icon: '🌫️' },
  ];

  const availableLayers = layers.filter((l) => !l.seerOnly || isSeer);

  return (
    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <span>📚</span> Layers
      </h3>

      <div className="space-y-2">
        {availableLayers.map((layer) => (
          <label
            key={layer.key}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={visibility[layer.key]}
              onChange={(e) => onVisibilityChange(layer.key, e.target.checked)}
              className="rounded border-slate-500 bg-slate-700 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-sm text-slate-300">
              {layer.icon} {layer.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Zoom Controls
// ============================================================================

export interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ZoomControls({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
}: ZoomControlsProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg">
      <button
        onClick={onZoomOut}
        className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
        title="Zoom Out"
      >
        🔍−
      </button>
      <span className="text-sm text-slate-300 min-w-[60px] text-center">
        {Math.round(scale * 100)}%
      </span>
      <button
        onClick={onZoomIn}
        className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
        title="Zoom In"
      >
        🔍+
      </button>
      <button
        onClick={onReset}
        className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
        title="Reset View"
      >
        🎯
      </button>
    </div>
  );
}

// ============================================================================
// Seer Tools Panel (Combined)
// ============================================================================

export interface SeerToolsPanelProps {
  state: VTTState;
  onModeChange: (mode: CanvasMode) => void;
  onFogToolChange: (tool: FogTool) => void;
  onFogModeChange: (mode: FogMode) => void;
  onFogReset: () => void;
  onDrawingToolChange: (tool: DrawingTool) => void;
  onDrawingColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onDrawingLayerChange: (layer: 'gm' | 'drawings') => void;
  onDrawingsClear: (layer?: 'gm' | 'drawings') => void;
  onDrawingUndo: () => void;
  onLayerVisibilityChange: (
    layer: keyof VTTState['layerVisibility'],
    visible: boolean
  ) => void;
  onTokenPaletteSelect: (token: { name: string; color: string }) => void;
}

export function SeerToolsPanel({
  state,
  onModeChange,
  onFogToolChange,
  onFogModeChange,
  onFogReset,
  onDrawingToolChange,
  onDrawingColorChange,
  onStrokeWidthChange,
  onDrawingLayerChange,
  onDrawingsClear,
  onDrawingUndo,
  onLayerVisibilityChange,
  onTokenPaletteSelect,
}: SeerToolsPanelProps) {
  return (
    <div className="w-64 space-y-4 overflow-y-auto">
      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <span>📍</span> Tokens
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'Player', color: '#22c55e', icon: '👤' },
            { name: 'NPC', color: '#3b82f6', icon: '👥' },
            { name: 'Enemy', color: '#ef4444', icon: '👹' },
            { name: 'Monster', color: '#8b5cf6', icon: '🐉' },
            { name: 'Object', color: '#ca8a04', icon: '📦' },
          ].map((token) => (
            <button
              key={token.name}
              onClick={() => {
                onModeChange('token');
                onTokenPaletteSelect(token);
              }}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                'border-2 border-slate-600 hover:border-amber-500',
                'bg-slate-700 hover:bg-slate-600 transition-colors'
              )}
              title={token.name}
            >
              <span className="text-lg">{token.icon}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">Click to select, then click map to place</p>
      </div>

      {state.mode === 'fog' && (
        <FogControls
          tool={state.fogTool}
          mode={state.fogMode}
          onToolChange={onFogToolChange}
          onModeChange={onFogModeChange}
          onReset={onFogReset}
        />
      )}

      {state.mode === 'draw' && (
        <DrawingTools
          tool={state.drawingTool}
          color={state.drawingColor}
          strokeWidth={state.strokeWidth}
          layer={state.drawingLayer}
          isSeer={state.isSeer}
          onToolChange={onDrawingToolChange}
          onColorChange={onDrawingColorChange}
          onStrokeWidthChange={onStrokeWidthChange}
          onLayerChange={onDrawingLayerChange}
          onClear={onDrawingsClear}
          onUndo={onDrawingUndo}
        />
      )}

      <LayerPanel
        visibility={state.layerVisibility}
        isSeer={state.isSeer}
        onVisibilityChange={onLayerVisibilityChange}
      />
    </div>
  );
}
