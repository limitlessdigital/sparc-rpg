/**
 * Audio Presets and Built-in Library
 * Based on PRD 24: Audio & Ambiance System
 */

import type { AmbientPreset, SoundEffect, AudioCueTrigger } from './types';

// ===============================
// PLACEHOLDER AUDIO URLS
// ===============================
// These are placeholder URLs - replace with actual hosted audio files
// Recommended: Use free-to-use audio from sources like:
// - freesound.org (CC licensed)
// - OpenGameArt.org
// - pixabay.com/music

const AUDIO_BASE_URL = '/audio'; // Local path for bundled audio

// ===============================
// SOUND EFFECTS LIBRARY
// ===============================

export const SOUND_EFFECTS: SoundEffect[] = [
  // Dice
  {
    id: 'sfx_dice_roll',
    name: 'Dice Roll',
    icon: '🎲',
    category: 'dice',
    url: `${AUDIO_BASE_URL}/sfx/dice-roll.mp3`,
    defaultVolume: 80,
  },
  {
    id: 'sfx_dice_success',
    name: 'Success',
    icon: '✅',
    category: 'dice',
    url: `${AUDIO_BASE_URL}/sfx/success.mp3`,
    defaultVolume: 70,
  },
  {
    id: 'sfx_dice_failure',
    name: 'Failure',
    icon: '❌',
    category: 'dice',
    url: `${AUDIO_BASE_URL}/sfx/failure.mp3`,
    defaultVolume: 70,
  },
  {
    id: 'sfx_dice_critical',
    name: 'Critical Hit',
    icon: '💥',
    category: 'dice',
    url: `${AUDIO_BASE_URL}/sfx/critical-hit.mp3`,
    defaultVolume: 85,
  },
  {
    id: 'sfx_dice_fumble',
    name: 'Critical Miss',
    icon: '💀',
    category: 'dice',
    url: `${AUDIO_BASE_URL}/sfx/fumble.mp3`,
    defaultVolume: 75,
  },
  
  // Combat
  {
    id: 'sfx_sword_clash',
    name: 'Sword Clash',
    icon: '⚔️',
    category: 'combat',
    url: `${AUDIO_BASE_URL}/sfx/sword-clash.mp3`,
    defaultVolume: 80,
  },
  {
    id: 'sfx_arrow',
    name: 'Arrow',
    icon: '🏹',
    category: 'combat',
    url: `${AUDIO_BASE_URL}/sfx/arrow.mp3`,
    defaultVolume: 75,
  },
  {
    id: 'sfx_shield_block',
    name: 'Shield Block',
    icon: '🛡️',
    category: 'combat',
    url: `${AUDIO_BASE_URL}/sfx/shield-block.mp3`,
    defaultVolume: 80,
  },
  {
    id: 'sfx_hit',
    name: 'Hit',
    icon: '👊',
    category: 'combat',
    url: `${AUDIO_BASE_URL}/sfx/hit.mp3`,
    defaultVolume: 75,
  },
  {
    id: 'sfx_miss',
    name: 'Miss',
    icon: '💨',
    category: 'combat',
    url: `${AUDIO_BASE_URL}/sfx/miss.mp3`,
    defaultVolume: 60,
  },
  {
    id: 'sfx_death',
    name: 'Death',
    icon: '💀',
    category: 'combat',
    url: `${AUDIO_BASE_URL}/sfx/death.mp3`,
    defaultVolume: 70,
  },
  
  // Magic
  {
    id: 'sfx_spell_cast',
    name: 'Spell Cast',
    icon: '✨',
    category: 'magic',
    url: `${AUDIO_BASE_URL}/sfx/spell-cast.mp3`,
    defaultVolume: 75,
  },
  {
    id: 'sfx_fire_spell',
    name: 'Fire',
    icon: '🔥',
    category: 'magic',
    url: `${AUDIO_BASE_URL}/sfx/fire-spell.mp3`,
    defaultVolume: 80,
  },
  {
    id: 'sfx_ice_spell',
    name: 'Ice',
    icon: '❄️',
    category: 'magic',
    url: `${AUDIO_BASE_URL}/sfx/ice-spell.mp3`,
    defaultVolume: 75,
  },
  {
    id: 'sfx_lightning',
    name: 'Lightning',
    icon: '⚡',
    category: 'magic',
    url: `${AUDIO_BASE_URL}/sfx/lightning.mp3`,
    defaultVolume: 85,
  },
  {
    id: 'sfx_heal',
    name: 'Heal',
    icon: '💚',
    category: 'magic',
    url: `${AUDIO_BASE_URL}/sfx/heal.mp3`,
    defaultVolume: 70,
  },
  {
    id: 'sfx_buff',
    name: 'Buff',
    icon: '⬆️',
    category: 'magic',
    url: `${AUDIO_BASE_URL}/sfx/buff.mp3`,
    defaultVolume: 65,
  },
  {
    id: 'sfx_debuff',
    name: 'Debuff',
    icon: '⬇️',
    category: 'magic',
    url: `${AUDIO_BASE_URL}/sfx/debuff.mp3`,
    defaultVolume: 65,
  },
  
  // Environment
  {
    id: 'sfx_door_open',
    name: 'Door Open',
    icon: '🚪',
    category: 'environment',
    url: `${AUDIO_BASE_URL}/sfx/door-open.mp3`,
    defaultVolume: 70,
  },
  {
    id: 'sfx_door_close',
    name: 'Door Close',
    icon: '🚪',
    category: 'environment',
    url: `${AUDIO_BASE_URL}/sfx/door-close.mp3`,
    defaultVolume: 70,
  },
  {
    id: 'sfx_chest_open',
    name: 'Chest Open',
    icon: '📦',
    category: 'environment',
    url: `${AUDIO_BASE_URL}/sfx/chest-open.mp3`,
    defaultVolume: 75,
  },
  {
    id: 'sfx_trap',
    name: 'Trap',
    icon: '⚠️',
    category: 'environment',
    url: `${AUDIO_BASE_URL}/sfx/trap.mp3`,
    defaultVolume: 80,
  },
  {
    id: 'sfx_lever',
    name: 'Lever',
    icon: '🔧',
    category: 'environment',
    url: `${AUDIO_BASE_URL}/sfx/lever.mp3`,
    defaultVolume: 65,
  },
  {
    id: 'sfx_water_splash',
    name: 'Water Splash',
    icon: '💧',
    category: 'environment',
    url: `${AUDIO_BASE_URL}/sfx/water-splash.mp3`,
    defaultVolume: 70,
  },
  
  // UI
  {
    id: 'sfx_button_click',
    name: 'Click',
    icon: '🔘',
    category: 'ui',
    url: `${AUDIO_BASE_URL}/sfx/button-click.mp3`,
    defaultVolume: 50,
  },
  {
    id: 'sfx_notification',
    name: 'Notification',
    icon: '🔔',
    category: 'ui',
    url: `${AUDIO_BASE_URL}/sfx/notification.mp3`,
    defaultVolume: 60,
  },
  {
    id: 'sfx_turn_start',
    name: 'Turn Start',
    icon: '▶️',
    category: 'ui',
    url: `${AUDIO_BASE_URL}/sfx/turn-start.mp3`,
    defaultVolume: 65,
  },
  {
    id: 'sfx_session_join',
    name: 'Player Join',
    icon: '👋',
    category: 'ui',
    url: `${AUDIO_BASE_URL}/sfx/session-join.mp3`,
    defaultVolume: 55,
  },
  
  // Drama
  {
    id: 'sfx_victory_fanfare',
    name: 'Victory',
    icon: '🏆',
    category: 'drama',
    url: `${AUDIO_BASE_URL}/sfx/victory-fanfare.mp3`,
    defaultVolume: 75,
  },
  {
    id: 'sfx_defeat',
    name: 'Defeat',
    icon: '😔',
    category: 'drama',
    url: `${AUDIO_BASE_URL}/sfx/defeat.mp3`,
    defaultVolume: 70,
  },
  {
    id: 'sfx_suspense',
    name: 'Suspense',
    icon: '😰',
    category: 'drama',
    url: `${AUDIO_BASE_URL}/sfx/suspense.mp3`,
    defaultVolume: 65,
  },
  {
    id: 'sfx_reveal',
    name: 'Reveal',
    icon: '😱',
    category: 'drama',
    url: `${AUDIO_BASE_URL}/sfx/reveal.mp3`,
    defaultVolume: 75,
  },
  {
    id: 'sfx_level_up',
    name: 'Level Up',
    icon: '⭐',
    category: 'drama',
    url: `${AUDIO_BASE_URL}/sfx/level-up.mp3`,
    defaultVolume: 80,
  },
];

// ===============================
// AMBIENT PRESETS
// ===============================

export const AMBIENT_PRESETS: AmbientPreset[] = [
  {
    id: 'tavern',
    name: 'Tavern',
    description: 'A cozy tavern with chattering patrons',
    icon: '🏠',
    layers: [
      {
        assetId: 'amb_tavern_chatter',
        name: 'Crowd Chatter',
        url: `${AUDIO_BASE_URL}/ambience/tavern-chatter.mp3`,
        volume: 60,
        loop: true,
      },
      {
        assetId: 'amb_fireplace',
        name: 'Fireplace',
        url: `${AUDIO_BASE_URL}/ambience/fireplace.mp3`,
        volume: 70,
        loop: true,
      },
      {
        assetId: 'amb_tavern_music',
        name: 'Lute Music',
        url: `${AUDIO_BASE_URL}/ambience/tavern-music.mp3`,
        volume: 40,
        loop: true,
      },
      {
        assetId: 'amb_clinking_glasses',
        name: 'Clinking Glasses',
        url: `${AUDIO_BASE_URL}/ambience/clinking-glasses.mp3`,
        volume: 30,
        loop: true,
      },
    ],
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'A peaceful forest with wildlife',
    icon: '🌲',
    layers: [
      {
        assetId: 'amb_birds',
        name: 'Birds',
        url: `${AUDIO_BASE_URL}/ambience/birds.mp3`,
        volume: 60,
        loop: true,
      },
      {
        assetId: 'amb_wind_leaves',
        name: 'Wind & Leaves',
        url: `${AUDIO_BASE_URL}/ambience/wind-leaves.mp3`,
        volume: 50,
        loop: true,
      },
      {
        assetId: 'amb_forest_animals',
        name: 'Distant Animals',
        url: `${AUDIO_BASE_URL}/ambience/forest-animals.mp3`,
        volume: 30,
        loop: true,
      },
    ],
  },
  {
    id: 'dungeon',
    name: 'Dungeon',
    description: 'A dark and ominous dungeon',
    icon: '🏰',
    layers: [
      {
        assetId: 'amb_dripping_water',
        name: 'Dripping Water',
        url: `${AUDIO_BASE_URL}/ambience/dripping-water.mp3`,
        volume: 50,
        loop: true,
      },
      {
        assetId: 'amb_chains',
        name: 'Chains',
        url: `${AUDIO_BASE_URL}/ambience/chains.mp3`,
        volume: 25,
        loop: true,
      },
      {
        assetId: 'amb_dungeon_moans',
        name: 'Distant Moans',
        url: `${AUDIO_BASE_URL}/ambience/dungeon-moans.mp3`,
        volume: 20,
        loop: true,
      },
      {
        assetId: 'amb_echoes',
        name: 'Echoes',
        url: `${AUDIO_BASE_URL}/ambience/echoes.mp3`,
        volume: 40,
        loop: true,
      },
    ],
  },
  {
    id: 'cave',
    name: 'Cave',
    description: 'An echoing cave with bats',
    icon: '🦇',
    layers: [
      {
        assetId: 'amb_cave_water',
        name: 'Water Drops',
        url: `${AUDIO_BASE_URL}/ambience/cave-water.mp3`,
        volume: 60,
        loop: true,
      },
      {
        assetId: 'amb_cave_wind',
        name: 'Wind Howl',
        url: `${AUDIO_BASE_URL}/ambience/cave-wind.mp3`,
        volume: 40,
        loop: true,
      },
      {
        assetId: 'amb_bats',
        name: 'Bats',
        url: `${AUDIO_BASE_URL}/ambience/bats.mp3`,
        volume: 35,
        loop: true,
      },
    ],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'On a ship at sea',
    icon: '🌊',
    layers: [
      {
        assetId: 'amb_waves',
        name: 'Waves',
        url: `${AUDIO_BASE_URL}/ambience/waves.mp3`,
        volume: 70,
        loop: true,
      },
      {
        assetId: 'amb_seagulls',
        name: 'Seagulls',
        url: `${AUDIO_BASE_URL}/ambience/seagulls.mp3`,
        volume: 40,
        loop: true,
      },
      {
        assetId: 'amb_ship_creaking',
        name: 'Ship Creaking',
        url: `${AUDIO_BASE_URL}/ambience/ship-creaking.mp3`,
        volume: 30,
        loop: true,
      },
      {
        assetId: 'amb_ocean_wind',
        name: 'Ocean Wind',
        url: `${AUDIO_BASE_URL}/ambience/ocean-wind.mp3`,
        volume: 50,
        loop: true,
      },
    ],
  },
  {
    id: 'battle',
    name: 'Battle',
    description: 'The sounds of war',
    icon: '⚔️',
    layers: [
      {
        assetId: 'amb_war_drums',
        name: 'War Drums',
        url: `${AUDIO_BASE_URL}/ambience/war-drums.mp3`,
        volume: 60,
        loop: true,
      },
      {
        assetId: 'amb_distant_clash',
        name: 'Distant Clash',
        url: `${AUDIO_BASE_URL}/ambience/distant-clash.mp3`,
        volume: 50,
        loop: true,
      },
      {
        assetId: 'amb_battle_horns',
        name: 'Horns',
        url: `${AUDIO_BASE_URL}/ambience/battle-horns.mp3`,
        volume: 35,
        loop: true,
      },
    ],
  },
  {
    id: 'town',
    name: 'Town',
    description: 'A bustling medieval town',
    icon: '🏘️',
    layers: [
      {
        assetId: 'amb_town_crowd',
        name: 'Crowd',
        url: `${AUDIO_BASE_URL}/ambience/town-crowd.mp3`,
        volume: 55,
        loop: true,
      },
      {
        assetId: 'amb_merchants',
        name: 'Merchants',
        url: `${AUDIO_BASE_URL}/ambience/merchants.mp3`,
        volume: 40,
        loop: true,
      },
      {
        assetId: 'amb_carts',
        name: 'Carts',
        url: `${AUDIO_BASE_URL}/ambience/carts.mp3`,
        volume: 35,
        loop: true,
      },
      {
        assetId: 'amb_church_bells',
        name: 'Church Bells',
        url: `${AUDIO_BASE_URL}/ambience/church-bells.mp3`,
        volume: 25,
        loop: true,
      },
    ],
  },
  {
    id: 'night',
    name: 'Night',
    description: 'A quiet night in the wilderness',
    icon: '🌙',
    layers: [
      {
        assetId: 'amb_crickets',
        name: 'Crickets',
        url: `${AUDIO_BASE_URL}/ambience/crickets.mp3`,
        volume: 60,
        loop: true,
      },
      {
        assetId: 'amb_owl',
        name: 'Owl',
        url: `${AUDIO_BASE_URL}/ambience/owl.mp3`,
        volume: 35,
        loop: true,
      },
      {
        assetId: 'amb_night_wind',
        name: 'Wind',
        url: `${AUDIO_BASE_URL}/ambience/night-wind.mp3`,
        volume: 40,
        loop: true,
      },
      {
        assetId: 'amb_wolves',
        name: 'Distant Wolves',
        url: `${AUDIO_BASE_URL}/ambience/wolves.mp3`,
        volume: 20,
        loop: true,
      },
    ],
  },
];

// ===============================
// DEFAULT AUDIO CUE TRIGGERS
// ===============================

export const DEFAULT_AUDIO_TRIGGERS: AudioCueTrigger[] = [
  { event: 'dice_roll', effectId: 'sfx_dice_roll', enabled: true },
  { event: 'damage', effectId: 'sfx_hit', enabled: true },
  { event: 'healing', effectId: 'sfx_heal', enabled: true },
  { event: 'level_up', effectId: 'sfx_level_up', enabled: true },
  { event: 'combat_start', effectId: 'sfx_sword_clash', enabled: true },
  { event: 'victory', effectId: 'sfx_victory_fanfare', enabled: true },
  { event: 'defeat', effectId: 'sfx_defeat', enabled: true },
];

// ===============================
// UTILITY FUNCTIONS
// ===============================

export function getSoundEffectsByCategory(category: SoundEffect['category']): SoundEffect[] {
  return SOUND_EFFECTS.filter((effect) => effect.category === category);
}

export function getSoundEffectById(id: string): SoundEffect | undefined {
  return SOUND_EFFECTS.find((effect) => effect.id === id);
}

export function getPresetById(id: string): AmbientPreset | undefined {
  return AMBIENT_PRESETS.find((preset) => preset.id === id);
}
