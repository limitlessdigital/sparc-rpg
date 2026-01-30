'use client';

/**
 * Audio Context Provider
 * Provides audio engine access throughout the app
 * Based on PRD 24: Audio & Ambiance System
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { SparcAudioEngine, getAudioEngine } from './audio-engine';
import type {
  AudioChannel,
  AmbientLayer,
  AmbientPreset,
  MusicState,
  PlayMusicOptions,
  PlayEffectOptions,
  UserAudioPreferences,
} from './types';
import { AMBIENT_PRESETS, SOUND_EFFECTS, getSoundEffectById, getPresetById } from './presets';

// ===============================
// CONTEXT TYPE
// ===============================

interface AudioContextType {
  // State
  isInitialized: boolean;
  isSuspended: boolean;
  musicState: MusicState;
  currentPreset: AmbientPreset | null;
  activeLayers: AmbientLayer[];
  
  // Volumes
  volumes: Record<AudioChannel, number>;
  muted: Record<AudioChannel, boolean>;
  
  // Preferences
  preferences: UserAudioPreferences;
  updatePreferences: (updates: Partial<UserAudioPreferences>) => void;
  
  // Music controls
  playMusic: (url: string, options?: PlayMusicOptions) => Promise<void>;
  stopMusic: (fadeOutMs?: number) => Promise<void>;
  pauseMusic: () => void;
  resumeMusic: () => void;
  toggleMusic: () => void;
  seekMusic: (position: number) => void;
  
  // Effect controls
  playEffect: (effectId: string, options?: PlayEffectOptions) => Promise<void>;
  preloadEffects: () => Promise<void>;
  
  // Ambience controls
  setPreset: (presetId: string) => Promise<void>;
  clearPreset: () => void;
  addLayer: (layer: AmbientLayer) => Promise<void>;
  removeLayer: (layerId: string) => void;
  setLayerVolume: (layerId: string, volume: number) => void;
  
  // Volume controls
  setVolume: (channel: AudioChannel, volume: number) => void;
  toggleMute: (channel: AudioChannel) => void;
  
  // Lifecycle
  initialize: () => Promise<void>;
  suspend: () => void;
  resume: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | null>(null);

// ===============================
// DEFAULT PREFERENCES
// ===============================

const DEFAULT_PREFERENCES: UserAudioPreferences = {
  userId: '',
  masterVolume: 80,
  musicEnabled: true,
  effectsEnabled: true,
  ambienceEnabled: true,
  musicVolume: 70,
  effectsVolume: 85,
  ambienceVolume: 60,
  autoplayEnabled: true,
  respectSilentMode: true,
};

// ===============================
// PROVIDER COMPONENT
// ===============================

interface AudioProviderProps {
  children: ReactNode;
  userId?: string;
  initialPreferences?: Partial<UserAudioPreferences>;
}

export function AudioProvider({
  children,
  userId,
  initialPreferences,
}: AudioProviderProps) {
  // Engine reference
  const engineRef = useRef<SparcAudioEngine | null>(null);
  
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [musicState, setMusicState] = useState<MusicState>({
    assetId: null,
    title: null,
    url: null,
    playing: false,
    volume: 70,
    position: 0,
    duration: 0,
    loop: true,
  });
  const [currentPreset, setCurrentPreset] = useState<AmbientPreset | null>(null);
  const [activeLayers, setActiveLayers] = useState<AmbientLayer[]>([]);
  const [volumes, setVolumes] = useState<Record<AudioChannel, number>>({
    master: 80,
    music: 70,
    effects: 85,
    ambience: 60,
  });
  const [muted, setMuted] = useState<Record<AudioChannel, boolean>>({
    master: false,
    music: false,
    effects: false,
    ambience: false,
  });
  const [preferences, setPreferences] = useState<UserAudioPreferences>({
    ...DEFAULT_PREFERENCES,
    userId: userId || '',
    ...initialPreferences,
  });
  
  // Initialize engine
  useEffect(() => {
    engineRef.current = getAudioEngine();
    
    // Set up music state callback
    engineRef.current.setMusicStateCallback((state) => {
      setMusicState(state);
    });
    
    // Sync volumes from preferences
    if (engineRef.current.isInitialized) {
      setIsInitialized(true);
      setIsSuspended(engineRef.current.isSuspended);
    }
    
    return () => {
      // Don't dispose on unmount - singleton pattern
      // disposeAudioEngine();
    };
  }, []);
  
  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const stored = localStorage.getItem(`sparc_audio_prefs_${userId || 'guest'}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<UserAudioPreferences>;
        setPreferences((prev) => ({ ...prev, ...parsed }));
        setVolumes({
          master: parsed.masterVolume ?? 80,
          music: parsed.musicVolume ?? 70,
          effects: parsed.effectsVolume ?? 85,
          ambience: parsed.ambienceVolume ?? 60,
        });
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, [userId]);
  
  // Save preferences to localStorage
  const savePreferences = useCallback((prefs: UserAudioPreferences) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`sparc_audio_prefs_${userId || 'guest'}`, JSON.stringify(prefs));
  }, [userId]);
  
  // ===============================
  // INITIALIZATION
  // ===============================
  
  const initialize = useCallback(async () => {
    if (!engineRef.current || isInitialized) return;
    
    try {
      await engineRef.current.initialize();
      setIsInitialized(true);
      setIsSuspended(engineRef.current.isSuspended);
      
      // Apply preferences
      engineRef.current.setVolume('master', preferences.masterVolume);
      engineRef.current.setVolume('music', preferences.musicVolume);
      engineRef.current.setVolume('effects', preferences.effectsVolume);
      engineRef.current.setVolume('ambience', preferences.ambienceVolume);
      
      // Apply mute states
      if (!preferences.musicEnabled) engineRef.current.mute('music');
      if (!preferences.effectsEnabled) engineRef.current.mute('effects');
      if (!preferences.ambienceEnabled) engineRef.current.mute('ambience');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }, [isInitialized, preferences]);
  
  // ===============================
  // MUSIC CONTROLS
  // ===============================
  
  const playMusic = useCallback(async (url: string, options?: PlayMusicOptions) => {
    if (!engineRef.current) return;
    if (!isInitialized) await initialize();
    await engineRef.current.playMusic(url, options);
  }, [initialize, isInitialized]);
  
  const stopMusic = useCallback(async (fadeOutMs?: number) => {
    if (!engineRef.current) return;
    await engineRef.current.stopMusic(fadeOutMs);
  }, []);
  
  const pauseMusic = useCallback(() => {
    engineRef.current?.pauseMusic();
  }, []);
  
  const resumeMusic = useCallback(() => {
    engineRef.current?.resumeMusic();
  }, []);
  
  const toggleMusic = useCallback(() => {
    if (musicState.playing) {
      pauseMusic();
    } else if (musicState.url) {
      resumeMusic();
    }
  }, [musicState, pauseMusic, resumeMusic]);
  
  const seekMusic = useCallback((position: number) => {
    engineRef.current?.seekMusic(position);
  }, []);
  
  // ===============================
  // EFFECT CONTROLS
  // ===============================
  
  const playEffect = useCallback(async (effectId: string, options?: PlayEffectOptions) => {
    if (!engineRef.current) return;
    if (!isInitialized) await initialize();
    if (!preferences.effectsEnabled) return;
    
    // Look up effect URL
    const effect = getSoundEffectById(effectId);
    const url = effect?.url ?? effectId;
    const volume = options?.volume ?? effect?.defaultVolume ?? 80;
    
    await engineRef.current.playEffect(url, { volume });
  }, [initialize, isInitialized, preferences.effectsEnabled]);
  
  const preloadEffects = useCallback(async () => {
    if (!engineRef.current) return;
    if (!isInitialized) await initialize();
    
    // Preload common effects
    for (const effect of SOUND_EFFECTS.slice(0, 10)) {
      await engineRef.current.preloadEffect(effect.id, effect.url);
    }
  }, [initialize, isInitialized]);
  
  // ===============================
  // AMBIENCE CONTROLS
  // ===============================
  
  const setPreset = useCallback(async (presetId: string) => {
    if (!engineRef.current) return;
    if (!isInitialized) await initialize();
    
    const preset = getPresetById(presetId);
    if (!preset) return;
    
    // Create layers with IDs
    const layers: AmbientLayer[] = preset.layers.map((layer, index) => ({
      ...layer,
      id: `${presetId}_${index}`,
    }));
    
    await engineRef.current.setAmbience(layers);
    setCurrentPreset(preset);
    setActiveLayers(layers);
  }, [initialize, isInitialized]);
  
  const clearPreset = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.setAmbience([]);
    setCurrentPreset(null);
    setActiveLayers([]);
  }, []);
  
  const addLayer = useCallback(async (layer: AmbientLayer) => {
    if (!engineRef.current) return;
    if (!isInitialized) await initialize();
    
    await engineRef.current.addAmbienceLayer(layer);
    setActiveLayers((prev) => [...prev, layer]);
    setCurrentPreset(null); // Custom layers, no preset
  }, [initialize, isInitialized]);
  
  const removeLayer = useCallback((layerId: string) => {
    if (!engineRef.current) return;
    engineRef.current.removeAmbienceLayer(layerId);
    setActiveLayers((prev) => prev.filter((l) => l.id !== layerId));
  }, []);
  
  const setLayerVolume = useCallback((layerId: string, volume: number) => {
    if (!engineRef.current) return;
    engineRef.current.setAmbienceLayerVolume(layerId, volume);
    setActiveLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, volume } : l))
    );
  }, []);
  
  // ===============================
  // VOLUME CONTROLS
  // ===============================
  
  const setVolume = useCallback((channel: AudioChannel, volume: number) => {
    if (!engineRef.current) return;
    
    const clampedVolume = Math.max(0, Math.min(100, volume));
    engineRef.current.setVolume(channel, clampedVolume);
    
    setVolumes((prev) => ({ ...prev, [channel]: clampedVolume }));
    
    // Update preferences
    const prefKey = channel === 'master' ? 'masterVolume' :
                    channel === 'music' ? 'musicVolume' :
                    channel === 'effects' ? 'effectsVolume' : 'ambienceVolume';
    
    setPreferences((prev) => {
      const updated = { ...prev, [prefKey]: clampedVolume };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);
  
  const toggleMute = useCallback((channel: AudioChannel) => {
    if (!engineRef.current) return;
    
    const newMuted = !muted[channel];
    
    if (newMuted) {
      engineRef.current.mute(channel);
    } else {
      engineRef.current.unmute(channel);
    }
    
    setMuted((prev) => ({ ...prev, [channel]: newMuted }));
    
    // Update preferences for enabled states
    if (channel !== 'master') {
      const prefKey = channel === 'music' ? 'musicEnabled' :
                      channel === 'effects' ? 'effectsEnabled' : 'ambienceEnabled';
      
      setPreferences((prev) => {
        const updated = { ...prev, [prefKey]: !newMuted };
        savePreferences(updated);
        return updated;
      });
    }
  }, [muted, savePreferences]);
  
  // ===============================
  // PREFERENCES
  // ===============================
  
  const updatePreferences = useCallback((updates: Partial<UserAudioPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...updates };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);
  
  // ===============================
  // LIFECYCLE
  // ===============================
  
  const suspend = useCallback(() => {
    engineRef.current?.suspend();
    setIsSuspended(true);
  }, []);
  
  const resume = useCallback(async () => {
    if (!engineRef.current) return;
    await engineRef.current.resume();
    setIsSuspended(false);
  }, []);
  
  // ===============================
  // CONTEXT VALUE
  // ===============================
  
  const value: AudioContextType = {
    // State
    isInitialized,
    isSuspended,
    musicState,
    currentPreset,
    activeLayers,
    
    // Volumes
    volumes,
    muted,
    
    // Preferences
    preferences,
    updatePreferences,
    
    // Music controls
    playMusic,
    stopMusic,
    pauseMusic,
    resumeMusic,
    toggleMusic,
    seekMusic,
    
    // Effect controls
    playEffect,
    preloadEffects,
    
    // Ambience controls
    setPreset,
    clearPreset,
    addLayer,
    removeLayer,
    setLayerVolume,
    
    // Volume controls
    setVolume,
    toggleMute,
    
    // Lifecycle
    initialize,
    suspend,
    resume,
  };
  
  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

// ===============================
// HOOK
// ===============================

export function useAudio(): AudioContextType {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}

// Export presets and effects for direct access
export { AMBIENT_PRESETS, SOUND_EFFECTS };
