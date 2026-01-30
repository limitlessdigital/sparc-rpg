'use client';

/**
 * Volume Slider Component
 * Reusable volume control with mute toggle
 * Based on PRD 24: Audio & Ambiance System
 */

import React from 'react';
import { cn } from '../lib/utils';

interface VolumeSliderProps {
  /** Current volume (0-100) */
  value: number;
  /** Volume change handler */
  onChange: (value: number) => void;
  /** Label text */
  label?: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Whether the channel is muted */
  muted?: boolean;
  /** Mute toggle handler */
  onMuteToggle?: () => void;
  /** Whether to show the mute button */
  showMute?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether control is disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

export function VolumeSlider({
  value,
  onChange,
  label,
  icon,
  muted = false,
  onMuteToggle,
  showMute = true,
  size = 'md',
  disabled = false,
  className,
}: VolumeSliderProps) {
  const sizeClasses = {
    sm: {
      container: 'gap-2',
      icon: 'text-sm w-6',
      slider: 'h-1',
      thumb: 'w-3 h-3',
      label: 'text-xs',
      value: 'text-xs w-8',
    },
    md: {
      container: 'gap-3',
      icon: 'text-base w-8',
      slider: 'h-1.5',
      thumb: 'w-4 h-4',
      label: 'text-sm',
      value: 'text-sm w-10',
    },
    lg: {
      container: 'gap-4',
      icon: 'text-lg w-10',
      slider: 'h-2',
      thumb: 'w-5 h-5',
      label: 'text-base',
      value: 'text-base w-12',
    },
  };
  
  const classes = sizeClasses[size];
  
  // Get volume icon based on level
  const getVolumeIcon = () => {
    if (muted || value === 0) return '🔇';
    if (value < 33) return '🔈';
    if (value < 66) return '🔉';
    return '🔊';
  };
  
  const displayIcon = icon ?? getVolumeIcon();
  
  return (
    <div
      className={cn(
        'flex items-center',
        classes.container,
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      {/* Mute Toggle / Icon */}
      {showMute && onMuteToggle ? (
        <button
          type="button"
          onClick={onMuteToggle}
          className={cn(
            'flex-shrink-0 flex items-center justify-center rounded transition-colors',
            'hover:bg-zinc-700/50 active:bg-zinc-600/50',
            classes.icon
          )}
          title={muted ? 'Unmute' : 'Mute'}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {displayIcon}
        </button>
      ) : (
        <span className={cn('flex-shrink-0 flex items-center justify-center', classes.icon)}>
          {displayIcon}
        </span>
      )}
      
      {/* Label */}
      {label && (
        <span className={cn('flex-shrink-0 text-zinc-300', classes.label)}>
          {label}
        </span>
      )}
      
      {/* Slider Track */}
      <div className="flex-1 relative flex items-center">
        <div className={cn('w-full bg-zinc-700 rounded-full overflow-hidden', classes.slider)}>
          {/* Fill */}
          <div
            className={cn(
              'h-full transition-all',
              muted ? 'bg-zinc-500' : 'bg-amber-500'
            )}
            style={{ width: `${muted ? 0 : value}%` }}
          />
        </div>
        
        {/* Range Input (invisible but interactive) */}
        <input
          type="range"
          min={0}
          max={100}
          value={muted ? 0 : value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className={cn(
            'absolute inset-0 w-full h-full opacity-0 cursor-pointer',
            disabled && 'cursor-not-allowed'
          )}
          aria-label={label || 'Volume'}
        />
        
        {/* Visual Thumb */}
        <div
          className={cn(
            'absolute rounded-full bg-white shadow-md transition-all pointer-events-none',
            'transform -translate-x-1/2 -translate-y-1/2',
            classes.thumb
          )}
          style={{
            left: `${muted ? 0 : value}%`,
            top: '50%',
          }}
        />
      </div>
      
      {/* Value Display */}
      <span className={cn('flex-shrink-0 text-zinc-400 text-right tabular-nums', classes.value)}>
        {muted ? '0' : value}%
      </span>
    </div>
  );
}

// ===============================
// VOLUME CONTROL GROUP
// ===============================

interface VolumeControlGroupProps {
  /** Master volume (0-100) */
  masterVolume: number;
  /** Music volume (0-100) */
  musicVolume: number;
  /** Effects volume (0-100) */
  effectsVolume: number;
  /** Ambience volume (0-100) */
  ambienceVolume: number;
  /** Volume change handler */
  onVolumeChange: (channel: 'master' | 'music' | 'effects' | 'ambience', value: number) => void;
  /** Mute states */
  muted?: {
    master?: boolean;
    music?: boolean;
    effects?: boolean;
    ambience?: boolean;
  };
  /** Mute toggle handler */
  onMuteToggle?: (channel: 'master' | 'music' | 'effects' | 'ambience') => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show labels */
  showLabels?: boolean;
  /** Whether control is disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

export function VolumeControlGroup({
  masterVolume,
  musicVolume,
  effectsVolume,
  ambienceVolume,
  onVolumeChange,
  muted = {},
  onMuteToggle,
  size = 'md',
  showLabels = true,
  disabled = false,
  className,
}: VolumeControlGroupProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <VolumeSlider
        value={masterVolume}
        onChange={(v) => onVolumeChange('master', v)}
        label={showLabels ? 'Master' : undefined}
        icon="🔊"
        muted={muted.master}
        onMuteToggle={onMuteToggle ? () => onMuteToggle('master') : undefined}
        size={size}
        disabled={disabled}
      />
      <VolumeSlider
        value={musicVolume}
        onChange={(v) => onVolumeChange('music', v)}
        label={showLabels ? 'Music' : undefined}
        icon="🎵"
        muted={muted.music}
        onMuteToggle={onMuteToggle ? () => onMuteToggle('music') : undefined}
        size={size}
        disabled={disabled}
      />
      <VolumeSlider
        value={effectsVolume}
        onChange={(v) => onVolumeChange('effects', v)}
        label={showLabels ? 'Effects' : undefined}
        icon="💥"
        muted={muted.effects}
        onMuteToggle={onMuteToggle ? () => onMuteToggle('effects') : undefined}
        size={size}
        disabled={disabled}
      />
      <VolumeSlider
        value={ambienceVolume}
        onChange={(v) => onVolumeChange('ambience', v)}
        label={showLabels ? 'Ambient' : undefined}
        icon="🌲"
        muted={muted.ambience}
        onMuteToggle={onMuteToggle ? () => onMuteToggle('ambience') : undefined}
        size={size}
        disabled={disabled}
      />
    </div>
  );
}
