'use client';

/**
 * Soundboard Component
 * Quick-trigger sound effects grid
 * Based on PRD 24: Audio & Ambiance System
 */

import { useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import type { SoundEffect } from './types';
import { SOUND_EFFECTS, getSoundEffectsByCategory } from './presets';

type EffectCategory = SoundEffect['category'];

interface SoundboardProps {
  /** Play effect callback */
  onPlayEffect: (effectId: string) => void;
  /** Initial category filter */
  initialCategory?: EffectCategory | 'all';
  /** Show category tabs */
  showCategories?: boolean;
  /** Maximum effects to show (for compact mode) */
  maxEffects?: number;
  /** Compact mode (smaller buttons) */
  compact?: boolean;
  /** Whether to show effect names */
  showNames?: boolean;
  /** Custom effects to display (overrides built-in) */
  effects?: SoundEffect[];
  /** Disabled state */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

const CATEGORY_INFO: Record<EffectCategory, { label: string; icon: string }> = {
  dice: { label: 'Dice', icon: '🎲' },
  combat: { label: 'Combat', icon: '⚔️' },
  magic: { label: 'Magic', icon: '✨' },
  environment: { label: 'Environment', icon: '🚪' },
  ui: { label: 'UI', icon: '🔔' },
  drama: { label: 'Drama', icon: '🎭' },
};

export function Soundboard({
  onPlayEffect,
  initialCategory = 'all',
  showCategories = true,
  maxEffects,
  compact = false,
  showNames = true,
  effects: customEffects,
  disabled = false,
  className,
}: SoundboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<EffectCategory | 'all'>(
    initialCategory
  );
  const [playingEffect, setPlayingEffect] = useState<string | null>(null);
  
  // Get effects to display
  const effects = customEffects ?? (
    selectedCategory === 'all'
      ? SOUND_EFFECTS
      : getSoundEffectsByCategory(selectedCategory)
  );
  
  const displayEffects = maxEffects ? effects.slice(0, maxEffects) : effects;
  
  // Handle effect play with visual feedback
  const handlePlay = useCallback((effectId: string) => {
    if (disabled) return;
    
    setPlayingEffect(effectId);
    onPlayEffect(effectId);
    
    // Clear playing state after animation
    setTimeout(() => {
      setPlayingEffect(null);
    }, 200);
  }, [disabled, onPlayEffect]);
  
  const buttonSize = compact
    ? 'w-12 h-12 text-lg'
    : 'w-16 h-16 text-2xl';
  
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Category Tabs */}
      {showCategories && (
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'px-2 py-1 text-xs rounded transition-colors',
              selectedCategory === 'all'
                ? 'bg-amber-600 text-white'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            )}
          >
            All
          </button>
          {(Object.keys(CATEGORY_INFO) as EffectCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-2 py-1 text-xs rounded transition-colors',
                selectedCategory === cat
                  ? 'bg-amber-600 text-white'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              )}
            >
              {CATEGORY_INFO[cat].icon} {CATEGORY_INFO[cat].label}
            </button>
          ))}
        </div>
      )}
      
      {/* Effects Grid */}
      <div className={cn(
        'grid gap-2',
        compact ? 'grid-cols-6' : 'grid-cols-4'
      )}>
        {displayEffects.map((effect) => (
          <button
            key={effect.id}
            type="button"
            onClick={() => handlePlay(effect.id)}
            disabled={disabled}
            className={cn(
              'flex flex-col items-center justify-center rounded-lg',
              'bg-zinc-800 border border-zinc-700',
              'transition-all duration-150',
              'hover:bg-zinc-700 hover:border-zinc-600',
              'active:scale-95',
              playingEffect === effect.id && 'bg-amber-600/30 border-amber-500 scale-95',
              disabled && 'opacity-50 cursor-not-allowed',
              buttonSize
            )}
            title={effect.name}
          >
            <span className={compact ? 'text-lg' : 'text-2xl'}>
              {effect.icon}
            </span>
            {showNames && !compact && (
              <span className="text-[10px] text-zinc-400 mt-1 truncate w-full text-center px-1">
                {effect.name}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ===============================
// QUICK SOUNDBOARD (PRESET SELECTION)
// ===============================

interface QuickSoundboardProps {
  /** Play effect callback */
  onPlayEffect: (effectId: string) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Quick soundboard with the most commonly used effects
 */
export function QuickSoundboard({
  onPlayEffect,
  disabled = false,
  className,
}: QuickSoundboardProps) {
  const quickEffects: SoundEffect[] = [
    { id: 'sfx_dice_roll', name: 'Dice', icon: '🎲', category: 'dice', url: '' },
    { id: 'sfx_sword_clash', name: 'Sword', icon: '⚔️', category: 'combat', url: '' },
    { id: 'sfx_fire_spell', name: 'Fire', icon: '🔥', category: 'magic', url: '' },
    { id: 'sfx_lightning', name: 'Lightning', icon: '⚡', category: 'magic', url: '' },
    { id: 'sfx_death', name: 'Death', icon: '💀', category: 'combat', url: '' },
    { id: 'sfx_victory_fanfare', name: 'Victory', icon: '🏆', category: 'drama', url: '' },
    { id: 'sfx_door_open', name: 'Door', icon: '🚪', category: 'environment', url: '' },
    { id: 'sfx_reveal', name: 'Reveal', icon: '😱', category: 'drama', url: '' },
  ];
  
  return (
    <Soundboard
      onPlayEffect={onPlayEffect}
      effects={quickEffects}
      showCategories={false}
      compact
      showNames={false}
      disabled={disabled}
      className={className}
    />
  );
}
