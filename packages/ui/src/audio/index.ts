/**
 * Audio & Ambiance System
 * Based on PRD 24: Audio & Ambiance System
 * 
 * Provides immersive audio for SPARC RPG sessions including:
 * - Background music playback with crossfade
 * - Sound effects library and soundboard
 * - Ambient soundscape layers and presets
 * - Volume controls with per-channel mixing
 * - Audio cue triggers for game events
 */

// Types
export type {
  AudioCategory,
  AudioAsset,
  AudioChannel,
  AmbientLayer,
  AmbientPreset,
  MusicState,
  SessionAudioState,
  UserAudioPreferences,
  PlayMusicOptions,
  PlayEffectOptions,
  SoundEffect,
  AudioCueTrigger,
  NodeAudioConfig,
  AudioSyncMessage,
  IAudioEngine,
} from './types';

// Audio Engine
export {
  SparcAudioEngine,
  getAudioEngine,
  disposeAudioEngine,
} from './audio-engine';

// Provider & Context
export {
  AudioProvider,
  useAudio,
  AMBIENT_PRESETS,
  SOUND_EFFECTS,
} from './AudioProvider';

// Presets & Built-in Library
export {
  SOUND_EFFECTS as ALL_SOUND_EFFECTS,
  AMBIENT_PRESETS as ALL_AMBIENT_PRESETS,
  DEFAULT_AUDIO_TRIGGERS,
  getSoundEffectsByCategory,
  getSoundEffectById,
  getPresetById,
} from './presets';

// Components
export {
  VolumeSlider,
  VolumeControlGroup,
} from './VolumeSlider';
export type {
  // VolumeSlider props can be inferred from component
} from './VolumeSlider';

export {
  Soundboard,
  QuickSoundboard,
} from './Soundboard';

export {
  AmbientMixer,
  PresetSelector,
} from './AmbientMixer';

export {
  MusicPlayer,
  MiniMusicPlayer,
} from './MusicPlayer';

export {
  AudioControlPanel,
  createConnectedAudioControlPanel,
  PlayerAudioSettings,
} from './AudioControlPanel';
