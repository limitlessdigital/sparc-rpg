/**
 * Audio & Ambiance System Types
 * Based on PRD 24: Audio & Ambiance System
 */

// Audio categories for organizing assets
export type AudioCategory =
  | 'music_ambient'
  | 'music_combat'
  | 'music_exploration'
  | 'music_dramatic'
  | 'music_victory'
  | 'sfx_dice'
  | 'sfx_combat'
  | 'sfx_magic'
  | 'sfx_ui'
  | 'sfx_environment'
  | 'ambient_nature'
  | 'ambient_urban'
  | 'ambient_dungeon'
  | 'ambient_weather';

// Audio asset metadata
export interface AudioAsset {
  id: string;
  adventureId?: string;
  uploaderId?: string;
  filename: string;
  originalName: string;
  mimeType: 'audio/mpeg' | 'audio/ogg' | 'audio/wav';
  sizeBytes: number;
  durationSeconds: number;
  title: string;
  artist?: string;
  category: AudioCategory;
  tags: string[];
  url: string;
  waveformUrl?: string;
  isPublic: boolean;
  isLoopable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Audio channels
export type AudioChannel = 'master' | 'music' | 'effects' | 'ambience';

// Ambient layer configuration
export interface AmbientLayer {
  id: string;
  assetId: string;
  name: string;
  url: string;
  volume: number; // 0-100
  loop: boolean;
  playing?: boolean;
}

// Ambient preset (built-in soundscapes)
export interface AmbientPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  layers: Omit<AmbientLayer, 'id' | 'playing'>[];
  thumbnailUrl?: string;
}

// Music playback state
export interface MusicState {
  assetId: string | null;
  title: string | null;
  url: string | null;
  playing: boolean;
  volume: number;
  position: number;
  duration: number;
  loop: boolean;
}

// Session audio state (for sync)
export interface SessionAudioState {
  sessionId: string;
  music: MusicState;
  ambience: {
    presetId: string | null;
    layers: AmbientLayer[];
    masterVolume: number;
  };
  masterVolume: number;
  musicVolume: number;
  effectsVolume: number;
  ambienceVolume: number;
  syncTimestamp: string;
}

// User audio preferences
export interface UserAudioPreferences {
  userId: string;
  masterVolume: number;
  musicEnabled: boolean;
  effectsEnabled: boolean;
  ambienceEnabled: boolean;
  musicVolume: number;
  effectsVolume: number;
  ambienceVolume: number;
  autoplayEnabled: boolean;
  respectSilentMode: boolean;
}

// Play options
export interface PlayMusicOptions {
  volume?: number;
  loop?: boolean;
  fadeInMs?: number;
  fadeOutMs?: number;
}

export interface PlayEffectOptions {
  volume?: number;
}

// Sound effect definition for soundboard
export interface SoundEffect {
  id: string;
  name: string;
  icon: string;
  category: 'dice' | 'combat' | 'magic' | 'environment' | 'ui' | 'drama';
  url: string;
  defaultVolume?: number;
}

// Audio cue trigger (auto-play based on events)
export interface AudioCueTrigger {
  event: 'dice_roll' | 'damage' | 'healing' | 'level_up' | 'combat_start' | 'victory' | 'defeat' | 'node_enter';
  effectId: string;
  enabled: boolean;
}

// Node audio configuration
export interface NodeAudioConfig {
  nodeId: string;
  music?: {
    assetId: string;
    volume: number;
    loop: boolean;
    fadeInMs: number;
    fadeOutMs: number;
  };
  ambience?: {
    presetId?: string;
    layers?: AmbientLayer[];
    crossfadeMs: number;
  };
  entryEffects?: string[];
}

// Audio sync message (for real-time sync)
export interface AudioSyncMessage {
  type: 'audio_update';
  sessionId: string;
  timestamp: string;
  changes: {
    music?: Partial<MusicState>;
    ambience?: {
      presetId?: string;
      layers?: AmbientLayer[];
      masterVolume?: number;
    };
    volumes?: {
      master?: number;
      music?: number;
      effects?: number;
      ambience?: number;
    };
    effect?: {
      assetId: string;
      volume: number;
    };
  };
}

// Audio engine interface
export interface IAudioEngine {
  // State
  isInitialized: boolean;
  isSuspended: boolean;
  
  // Music
  playMusic(url: string, options?: PlayMusicOptions): Promise<void>;
  stopMusic(fadeOutMs?: number): Promise<void>;
  pauseMusic(): void;
  resumeMusic(): void;
  seekMusic(position: number): void;
  
  // Effects
  playEffect(id: string, options?: PlayEffectOptions): Promise<void>;
  preloadEffect(id: string, url: string): Promise<void>;
  
  // Ambience
  setAmbience(layers: AmbientLayer[]): Promise<void>;
  addAmbienceLayer(layer: AmbientLayer): Promise<void>;
  removeAmbienceLayer(layerId: string): void;
  setAmbienceLayerVolume(layerId: string, volume: number): void;
  
  // Volume
  setVolume(channel: AudioChannel, volume: number): void;
  getVolume(channel: AudioChannel): number;
  mute(channel: AudioChannel): void;
  unmute(channel: AudioChannel): void;
  
  // Lifecycle
  initialize(): Promise<void>;
  suspend(): void;
  resume(): Promise<void>;
  dispose(): void;
}
