'use client';

/**
 * Audio Control Panel Component
 * Full audio control interface for Seer Dashboard
 * Based on PRD 24: Audio & Ambiance System
 */

import { useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import { MusicPlayer } from './MusicPlayer';
import { Soundboard, QuickSoundboard } from './Soundboard';
import { AmbientMixer } from './AmbientMixer';
import { VolumeControlGroup } from './VolumeSlider';
import type { MusicState, AmbientLayer, AmbientPreset, AudioChannel } from './types';

// ===============================
// TABS
// ===============================

type TabId = 'music' | 'effects' | 'ambience' | 'volume';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'effects', label: 'Effects', icon: '💥' },
  { id: 'ambience', label: 'Ambience', icon: '🌲' },
  { id: 'volume', label: 'Volume', icon: '🔊' },
];

// ===============================
// AUDIO CONTROL PANEL
// ===============================

interface AudioControlPanelProps {
  // State
  isInitialized: boolean;
  musicState: MusicState;
  currentPreset: AmbientPreset | null;
  activeLayers: AmbientLayer[];
  volumes: Record<AudioChannel, number>;
  muted: Record<AudioChannel, boolean>;
  
  // Music controls
  onPlayMusic?: (url: string, title?: string) => void;
  onStopMusic: () => void;
  onPauseMusic?: () => void;
  onResumeMusic?: () => void;
  onToggleMusic: () => void;
  onSeekMusic?: (position: number) => void;
  onToggleMusicLoop?: () => void;
  
  // Effect controls
  onPlayEffect: (effectId: string) => void;
  
  // Ambience controls
  onPresetSelect: (presetId: string) => void;
  onPresetClear: () => void;
  onLayerVolumeChange: (layerId: string, volume: number) => void;
  onLayerRemove: (layerId: string) => void;
  onLayerAdd?: (layer: AmbientLayer) => void;
  
  // Volume controls
  onVolumeChange: (channel: AudioChannel, volume: number) => void;
  onMuteToggle: (channel: AudioChannel) => void;
  
  // Lifecycle
  onInitialize?: () => void;
  
  // Customization
  initialTab?: TabId;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  compact?: boolean;
  className?: string;
}

export function AudioControlPanel({
  isInitialized,
  musicState,
  currentPreset,
  activeLayers,
  volumes,
  muted,
  onPlayMusic: _onPlayMusic,
  onStopMusic,
  onPauseMusic: _onPauseMusic,
  onResumeMusic: _onResumeMusic,
  onToggleMusic,
  onSeekMusic,
  onToggleMusicLoop,
  onPlayEffect,
  onPresetSelect,
  onPresetClear,
  onLayerVolumeChange,
  onLayerRemove,
  onLayerAdd,
  onVolumeChange,
  onMuteToggle,
  onInitialize,
  initialTab = 'music',
  collapsible = false,
  defaultCollapsed = false,
  compact = false,
  className,
}: AudioControlPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  
  // Initialize audio on first interaction
  const handleInteraction = useCallback(() => {
    if (!isInitialized && onInitialize) {
      onInitialize();
    }
  }, [isInitialized, onInitialize]);
  
  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'music':
        return (
          <div className="space-y-4">
            <MusicPlayer
              musicState={musicState}
              onPlayPause={onToggleMusic}
              onStop={onStopMusic}
              onSeek={onSeekMusic}
              onLoopToggle={onToggleMusicLoop}
              compact={compact}
            />
            
            {/* Quick Music Selection (placeholder) */}
            <div className="text-xs text-zinc-500 text-center">
              Use Adventure Forge to assign music to nodes
            </div>
          </div>
        );
      
      case 'effects':
        return (
          <div className="space-y-4">
            <div className="text-sm text-zinc-400 mb-2">Quick Soundboard</div>
            <QuickSoundboard onPlayEffect={onPlayEffect} />
            
            <div className="border-t border-zinc-700 pt-4">
              <div className="text-sm text-zinc-400 mb-2">All Effects</div>
              <Soundboard
                onPlayEffect={onPlayEffect}
                compact={compact}
              />
            </div>
          </div>
        );
      
      case 'ambience':
        return (
          <AmbientMixer
            currentPreset={currentPreset}
            layers={activeLayers}
            masterVolume={volumes.ambience}
            onPresetSelect={onPresetSelect}
            onPresetClear={onPresetClear}
            onLayerVolumeChange={onLayerVolumeChange}
            onLayerRemove={onLayerRemove}
            onMasterVolumeChange={(vol) => onVolumeChange('ambience', vol)}
            onAddLayer={onLayerAdd}
            compact={compact}
          />
        );
      
      case 'volume':
        return (
          <div className="space-y-4">
            <VolumeControlGroup
              masterVolume={volumes.master}
              musicVolume={volumes.music}
              effectsVolume={volumes.effects}
              ambienceVolume={volumes.ambience}
              onVolumeChange={onVolumeChange}
              muted={muted}
              onMuteToggle={onMuteToggle}
              size={compact ? 'sm' : 'md'}
            />
            
            {/* Mute All Button */}
            <button
              type="button"
              onClick={() => onMuteToggle('master')}
              className={cn(
                'w-full py-2 rounded text-sm transition-colors',
                muted.master
                  ? 'bg-red-600 text-white hover:bg-red-500'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              )}
            >
              {muted.master ? '🔇 Unmute All' : '🔊 Mute All'}
            </button>
          </div>
        );
    }
  };
  
  return (
    <div
      className={cn(
        'bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden',
        className
      )}
      onClick={handleInteraction}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎵</span>
          <span className="text-sm font-medium text-zinc-200">Audio Controls</span>
        </div>
        
        {collapsible && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {collapsed ? '▼' : '▲'}
          </button>
        )}
        
        {/* Initialization indicator */}
        {!isInitialized && (
          <span className="text-xs text-amber-400">Click to enable audio</span>
        )}
      </div>
      
      {/* Content */}
      {!collapsed && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-zinc-700">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 text-sm transition-colors',
                  activeTab === tab.id
                    ? 'bg-zinc-800 text-amber-400 border-b-2 border-amber-400'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                )}
              >
                <span>{tab.icon}</span>
                {!compact && <span>{tab.label}</span>}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className={cn('p-4', compact && 'p-3')}>
            {renderTabContent()}
          </div>
        </>
      )}
    </div>
  );
}

// ===============================
// CONNECTED AUDIO CONTROL PANEL
// ===============================

// This is a convenience wrapper that uses the useAudio hook
// Import and use AudioProvider at the app level

interface ConnectedAudioControlPanelProps {
  initialTab?: TabId;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  compact?: boolean;
  className?: string;
}

export function createConnectedAudioControlPanel(useAudioHook: () => {
  isInitialized: boolean;
  musicState: MusicState;
  currentPreset: AmbientPreset | null;
  activeLayers: AmbientLayer[];
  volumes: Record<AudioChannel, number>;
  muted: Record<AudioChannel, boolean>;
  playMusic: (url: string, options?: unknown) => Promise<void>;
  stopMusic: () => Promise<void>;
  pauseMusic: () => void;
  resumeMusic: () => void;
  toggleMusic: () => void;
  seekMusic: (position: number) => void;
  playEffect: (effectId: string) => Promise<void>;
  setPreset: (presetId: string) => Promise<void>;
  clearPreset: () => void;
  setLayerVolume: (layerId: string, volume: number) => void;
  removeLayer: (layerId: string) => void;
  addLayer: (layer: AmbientLayer) => Promise<void>;
  setVolume: (channel: AudioChannel, volume: number) => void;
  toggleMute: (channel: AudioChannel) => void;
  initialize: () => Promise<void>;
}) {
  return function ConnectedAudioControlPanel(props: ConnectedAudioControlPanelProps) {
    const audio = useAudioHook();
    
    return (
      <AudioControlPanel
        isInitialized={audio.isInitialized}
        musicState={audio.musicState}
        currentPreset={audio.currentPreset}
        activeLayers={audio.activeLayers}
        volumes={audio.volumes}
        muted={audio.muted}
        onPlayMusic={(url, title) => audio.playMusic(url, { title })}
        onStopMusic={() => audio.stopMusic()}
        onPauseMusic={audio.pauseMusic}
        onResumeMusic={audio.resumeMusic}
        onToggleMusic={audio.toggleMusic}
        onSeekMusic={audio.seekMusic}
        onPlayEffect={(id) => audio.playEffect(id)}
        onPresetSelect={(id) => audio.setPreset(id)}
        onPresetClear={audio.clearPreset}
        onLayerVolumeChange={audio.setLayerVolume}
        onLayerRemove={audio.removeLayer}
        onLayerAdd={(layer) => audio.addLayer(layer)}
        onVolumeChange={audio.setVolume}
        onMuteToggle={audio.toggleMute}
        onInitialize={() => audio.initialize()}
        {...props}
      />
    );
  };
}

// ===============================
// PLAYER AUDIO SETTINGS (MINIMAL)
// ===============================

interface PlayerAudioSettingsProps {
  volumes: Record<AudioChannel, number>;
  muted: Record<AudioChannel, boolean>;
  onVolumeChange: (channel: AudioChannel, volume: number) => void;
  onMuteToggle: (channel: AudioChannel) => void;
  className?: string;
}

export function PlayerAudioSettings({
  volumes,
  muted,
  onVolumeChange,
  onMuteToggle,
  className,
}: PlayerAudioSettingsProps) {
  return (
    <div className={cn(
      'bg-zinc-900 border border-zinc-700 rounded-lg p-4',
      className
    )}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🔊</span>
        <span className="text-sm font-medium text-zinc-200">Audio Settings</span>
      </div>
      
      <VolumeControlGroup
        masterVolume={volumes.master}
        musicVolume={volumes.music}
        effectsVolume={volumes.effects}
        ambienceVolume={volumes.ambience}
        onVolumeChange={onVolumeChange}
        muted={muted}
        onMuteToggle={onMuteToggle}
        size="sm"
      />
      
      <button
        type="button"
        onClick={() => onMuteToggle('master')}
        className={cn(
          'w-full mt-4 py-2 rounded text-sm transition-colors',
          muted.master
            ? 'bg-red-600 text-white hover:bg-red-500'
            : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
        )}
      >
        {muted.master ? '🔇 Unmute All' : '🔊 Mute All'}
      </button>
    </div>
  );
}
