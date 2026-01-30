'use client';

/**
 * Music Player Component
 * Background music player with playback controls
 * Based on PRD 24: Audio & Ambiance System
 */

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import type { MusicState } from './types';

// ===============================
// PROGRESS BAR
// ===============================

interface ProgressBarProps {
  /** Current position in seconds */
  position: number;
  /** Total duration in seconds */
  duration: number;
  /** Seek handler */
  onSeek?: (position: number) => void;
  /** Whether seeking is enabled */
  seekable?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

function ProgressBar({
  position,
  duration,
  onSeek,
  seekable = true,
  disabled = false,
}: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  
  const progress = duration > 0 ? (position / duration) * 100 : 0;
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleClick = (e: React.MouseEvent) => {
    if (!seekable || !onSeek || disabled || !barRef.current) return;
    
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newPosition = percentage * duration;
    onSeek(Math.max(0, Math.min(duration, newPosition)));
  };
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-500 w-10 text-right tabular-nums">
        {formatTime(position)}
      </span>
      
      <div
        ref={barRef}
        onClick={handleClick}
        className={cn(
          'flex-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden',
          seekable && !disabled && 'cursor-pointer hover:bg-zinc-600',
          disabled && 'opacity-50'
        )}
      >
        <div
          className="h-full bg-amber-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <span className="text-xs text-zinc-500 w-10 tabular-nums">
        {formatTime(duration)}
      </span>
    </div>
  );
}

// ===============================
// PLAYBACK CONTROLS
// ===============================

interface PlaybackControlsProps {
  /** Whether music is playing */
  playing: boolean;
  /** Whether looping is enabled */
  loop: boolean;
  /** Play/pause toggle handler */
  onPlayPause: () => void;
  /** Stop handler */
  onStop: () => void;
  /** Loop toggle handler */
  onLoopToggle?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

function PlaybackControls({
  playing,
  loop,
  onPlayPause,
  onStop,
  onLoopToggle,
  disabled = false,
  size = 'md',
}: PlaybackControlsProps) {
  const buttonSize = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  }[size];
  
  const playButtonSize = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-12 h-12 text-xl',
    lg: 'w-14 h-14 text-2xl',
  }[size];
  
  return (
    <div className="flex items-center justify-center gap-2">
      {/* Loop Toggle */}
      {onLoopToggle && (
        <button
          type="button"
          onClick={onLoopToggle}
          disabled={disabled}
          className={cn(
            'flex items-center justify-center rounded-full transition-colors',
            buttonSize,
            loop
              ? 'text-amber-400 hover:text-amber-300'
              : 'text-zinc-500 hover:text-zinc-300',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          title={loop ? 'Loop: On' : 'Loop: Off'}
        >
          🔁
        </button>
      )}
      
      {/* Stop */}
      <button
        type="button"
        onClick={onStop}
        disabled={disabled}
        className={cn(
          'flex items-center justify-center rounded-full transition-colors',
          'bg-zinc-700 text-zinc-300 hover:bg-zinc-600',
          buttonSize,
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        title="Stop"
      >
        ⏹️
      </button>
      
      {/* Play/Pause */}
      <button
        type="button"
        onClick={onPlayPause}
        disabled={disabled}
        className={cn(
          'flex items-center justify-center rounded-full transition-colors',
          'bg-amber-600 text-white hover:bg-amber-500',
          playButtonSize,
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        title={playing ? 'Pause' : 'Play'}
      >
        {playing ? '⏸️' : '▶️'}
      </button>
    </div>
  );
}

// ===============================
// MUSIC PLAYER
// ===============================

interface MusicPlayerProps {
  /** Current music state */
  musicState: MusicState;
  /** Play/pause toggle handler */
  onPlayPause: () => void;
  /** Stop handler */
  onStop: () => void;
  /** Seek handler */
  onSeek?: (position: number) => void;
  /** Loop toggle handler */
  onLoopToggle?: () => void;
  /** Volume change handler */
  onVolumeChange?: (volume: number) => void;
  /** Show volume control */
  showVolume?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

export function MusicPlayer({
  musicState,
  onPlayPause,
  onStop,
  onSeek,
  onLoopToggle,
  onVolumeChange,
  showVolume = false,
  compact = false,
  disabled = false,
  className,
}: MusicPlayerProps) {
  const { title, url, playing, volume, position, duration, loop } = musicState;
  
  // Update position periodically while playing
  const [displayPosition, setDisplayPosition] = useState(position);
  
  useEffect(() => {
    setDisplayPosition(position);
  }, [position]);
  
  useEffect(() => {
    if (!playing) return;
    
    const interval = setInterval(() => {
      setDisplayPosition((prev) => Math.min(prev + 1, duration));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [playing, duration]);
  
  if (!url) {
    return (
      <div className={cn(
        'flex items-center justify-center p-4 rounded-lg',
        'bg-zinc-800/50 border border-zinc-700',
        'text-zinc-500',
        compact ? 'py-2' : 'py-4',
        className
      )}>
        <span className="text-xl mr-2">🎵</span>
        <span className="text-sm">No music selected</span>
      </div>
    );
  }
  
  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-3 p-2 rounded-lg',
        'bg-zinc-800 border border-zinc-700',
        className
      )}>
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={onPlayPause}
          disabled={disabled}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-full',
            'bg-amber-600 text-white hover:bg-amber-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {playing ? '⏸' : '▶'}
        </button>
        
        {/* Track Info & Progress */}
        <div className="flex-1 min-w-0">
          <div className="text-sm text-zinc-200 truncate">
            {title || 'Unknown Track'}
          </div>
          <ProgressBar
            position={displayPosition}
            duration={duration}
            onSeek={onSeek}
            seekable={!!onSeek}
            disabled={disabled}
          />
        </div>
        
        {/* Loop Toggle */}
        {onLoopToggle && (
          <button
            type="button"
            onClick={onLoopToggle}
            disabled={disabled}
            className={cn(
              'w-6 h-6 flex items-center justify-center text-xs',
              loop ? 'text-amber-400' : 'text-zinc-500'
            )}
          >
            🔁
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className={cn(
      'p-4 rounded-lg',
      'bg-zinc-800 border border-zinc-700',
      className
    )}>
      {/* Track Info */}
      <div className="text-center mb-4">
        <div className="text-3xl mb-2">🎵</div>
        <div className="text-lg font-medium text-zinc-200 truncate">
          {title || 'Unknown Track'}
        </div>
        {playing && (
          <div className="text-xs text-amber-400 mt-1">Now Playing</div>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <ProgressBar
          position={displayPosition}
          duration={duration}
          onSeek={onSeek}
          seekable={!!onSeek}
          disabled={disabled}
        />
      </div>
      
      {/* Controls */}
      <PlaybackControls
        playing={playing}
        loop={loop}
        onPlayPause={onPlayPause}
        onStop={onStop}
        onLoopToggle={onLoopToggle}
        disabled={disabled}
        size="md"
      />
      
      {/* Volume (optional) */}
      {showVolume && onVolumeChange && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-zinc-400">🔊</span>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            disabled={disabled}
            className="flex-1"
          />
          <span className="text-xs text-zinc-500 w-8">{volume}%</span>
        </div>
      )}
    </div>
  );
}

// ===============================
// MINI MUSIC PLAYER (FOR HEADER/TOOLBAR)
// ===============================

interface MiniMusicPlayerProps {
  /** Current music state */
  musicState: MusicState;
  /** Play/pause toggle handler */
  onPlayPause: () => void;
  /** Open full player handler */
  onExpand?: () => void;
  /** Additional class names */
  className?: string;
}

export function MiniMusicPlayer({
  musicState,
  onPlayPause,
  onExpand,
  className,
}: MiniMusicPlayerProps) {
  const { title, playing, url } = musicState;
  
  if (!url) return null;
  
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-1 rounded-full',
        'bg-zinc-800 border border-zinc-700',
        className
      )}
    >
      <button
        type="button"
        onClick={onPlayPause}
        className={cn(
          'w-6 h-6 flex items-center justify-center rounded-full text-sm',
          'bg-amber-600 text-white hover:bg-amber-500'
        )}
      >
        {playing ? '⏸' : '▶'}
      </button>
      
      <span className="text-xs text-zinc-300 max-w-[120px] truncate">
        {title || 'Music'}
      </span>
      
      {playing && (
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1 bg-amber-400 rounded-full animate-pulse"
              style={{
                height: `${8 + Math.random() * 8}px`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </span>
      )}
      
      {onExpand && (
        <button
          type="button"
          onClick={onExpand}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          ⋯
        </button>
      )}
    </div>
  );
}
