'use client';

/**
 * Ambient Mixer Component
 * Control ambient soundscape layers and presets
 * Based on PRD 24: Audio & Ambiance System
 */

import { useState } from 'react';
import { cn } from '../lib/utils';
import type { AmbientLayer, AmbientPreset } from './types';
import { AMBIENT_PRESETS } from './presets';
import { VolumeSlider } from './VolumeSlider';

// ===============================
// PRESET SELECTOR
// ===============================

interface PresetSelectorProps {
  /** Currently selected preset ID */
  selectedId: string | null;
  /** Preset selection handler */
  onSelect: (presetId: string) => void;
  /** Clear preset handler */
  onClear?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Additional class names */
  className?: string;
}

export function PresetSelector({
  selectedId,
  onSelect,
  onClear,
  disabled = false,
  compact = false,
  className,
}: PresetSelectorProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {AMBIENT_PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onSelect(preset.id)}
          disabled={disabled}
          className={cn(
            'flex items-center gap-1 rounded transition-all',
            compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
            'border',
            selectedId === preset.id
              ? 'bg-amber-600 border-amber-500 text-white'
              : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:border-zinc-600',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          title={preset.description}
        >
          <span>{preset.icon}</span>
          <span>{preset.name}</span>
        </button>
      ))}
      {onClear && selectedId && (
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          className={cn(
            'flex items-center gap-1 rounded transition-all',
            compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
            'bg-zinc-700 border border-zinc-600 text-zinc-400',
            'hover:bg-red-900/50 hover:border-red-700 hover:text-red-300',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span>✕</span>
          <span>Clear</span>
        </button>
      )}
    </div>
  );
}

// ===============================
// LAYER ITEM
// ===============================

interface LayerItemProps {
  /** Layer data */
  layer: AmbientLayer;
  /** Volume change handler */
  onVolumeChange: (volume: number) => void;
  /** Remove layer handler */
  onRemove?: () => void;
  /** Whether removal is allowed */
  allowRemove?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

function LayerItem({
  layer,
  onVolumeChange,
  onRemove,
  allowRemove = true,
  disabled = false,
}: LayerItemProps) {
  return (
    <div className="flex items-center gap-2 py-2">
      <VolumeSlider
        value={layer.volume}
        onChange={onVolumeChange}
        label={layer.name}
        showMute={false}
        size="sm"
        disabled={disabled}
        className="flex-1"
      />
      {allowRemove && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className={cn(
            'w-6 h-6 flex items-center justify-center rounded',
            'text-zinc-500 hover:text-red-400 hover:bg-red-900/20',
            'transition-colors',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          title="Remove layer"
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ===============================
// AMBIENT MIXER
// ===============================

interface AmbientMixerProps {
  /** Current preset */
  currentPreset: AmbientPreset | null;
  /** Active layers */
  layers: AmbientLayer[];
  /** Master ambience volume (0-100) */
  masterVolume: number;
  /** Preset selection handler */
  onPresetSelect: (presetId: string) => void;
  /** Clear preset handler */
  onPresetClear: () => void;
  /** Layer volume change handler */
  onLayerVolumeChange: (layerId: string, volume: number) => void;
  /** Remove layer handler */
  onLayerRemove: (layerId: string) => void;
  /** Master volume change handler */
  onMasterVolumeChange: (volume: number) => void;
  /** Add custom layer handler */
  onAddLayer?: (layer: AmbientLayer) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Additional class names */
  className?: string;
}

export function AmbientMixer({
  currentPreset,
  layers,
  masterVolume,
  onPresetSelect,
  onPresetClear,
  onLayerVolumeChange,
  onLayerRemove,
  onMasterVolumeChange,
  onAddLayer,
  disabled = false,
  compact = false,
  className,
}: AmbientMixerProps) {
  const [showAddLayer, setShowAddLayer] = useState(false);
  
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Presets */}
      <div>
        <div className="text-sm text-zinc-400 mb-2">Presets</div>
        <PresetSelector
          selectedId={currentPreset?.id ?? null}
          onSelect={onPresetSelect}
          onClear={onPresetClear}
          disabled={disabled}
          compact={compact}
        />
      </div>
      
      {/* Active Layers */}
      {layers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-zinc-400">Active Layers</div>
            <div className="text-xs text-zinc-500">
              Master: {masterVolume}%
            </div>
          </div>
          
          {/* Master Volume */}
          <div className="mb-3 pb-3 border-b border-zinc-700">
            <VolumeSlider
              value={masterVolume}
              onChange={onMasterVolumeChange}
              label="Master"
              icon="🎚️"
              size="sm"
              disabled={disabled}
            />
          </div>
          
          {/* Individual Layers */}
          <div className="flex flex-col divide-y divide-zinc-800">
            {layers.map((layer) => (
              <LayerItem
                key={layer.id}
                layer={layer}
                onVolumeChange={(vol) => onLayerVolumeChange(layer.id, vol)}
                onRemove={() => onLayerRemove(layer.id)}
                allowRemove={!currentPreset} // Only allow remove for custom layers
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Add Custom Layer Button */}
      {onAddLayer && !currentPreset && (
        <button
          type="button"
          onClick={() => setShowAddLayer(true)}
          disabled={disabled}
          className={cn(
            'flex items-center justify-center gap-2 py-2 rounded',
            'border border-dashed border-zinc-600',
            'text-zinc-400 text-sm',
            'hover:bg-zinc-800 hover:border-zinc-500 hover:text-zinc-300',
            'transition-colors',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span>+</span>
          <span>Add Layer</span>
        </button>
      )}
      
      {/* Empty State */}
      {layers.length === 0 && !currentPreset && (
        <div className="text-center py-8 text-zinc-500">
          <div className="text-3xl mb-2">🔇</div>
          <div className="text-sm">No ambient sounds active</div>
          <div className="text-xs text-zinc-600 mt-1">
            Select a preset above to get started
          </div>
        </div>
      )}
      
      {/* Add Layer Modal (simplified inline version) */}
      {showAddLayer && onAddLayer && (
        <AddLayerPanel
          onAdd={(layer) => {
            onAddLayer(layer);
            setShowAddLayer(false);
          }}
          onCancel={() => setShowAddLayer(false)}
        />
      )}
    </div>
  );
}

// ===============================
// ADD LAYER PANEL
// ===============================

interface AddLayerPanelProps {
  onAdd: (layer: AmbientLayer) => void;
  onCancel: () => void;
}

function AddLayerPanel({ onAdd, onCancel }: AddLayerPanelProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [volume, setVolume] = useState(50);
  
  const handleAdd = () => {
    if (!name || !url) return;
    
    onAdd({
      id: `custom_${Date.now()}`,
      assetId: `custom_${Date.now()}`,
      name,
      url,
      volume,
      loop: true,
    });
  };
  
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
      <div className="text-sm font-medium text-zinc-200 mb-3">Add Custom Layer</div>
      
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Layer name"
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded text-sm text-zinc-200 placeholder-zinc-500"
        />
        
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Audio URL (MP3, OGG, WAV)"
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded text-sm text-zinc-200 placeholder-zinc-500"
        />
        
        <VolumeSlider
          value={volume}
          onChange={setVolume}
          label="Volume"
          size="sm"
        />
        
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!name || !url}
            className={cn(
              'px-3 py-1.5 text-sm rounded',
              'bg-amber-600 text-white',
              'hover:bg-amber-500',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            Add Layer
          </button>
        </div>
      </div>
    </div>
  );
}
