/**
 * SPARC Audio Engine
 * Web Audio API-based audio engine for immersive game audio
 * Based on PRD 24: Audio & Ambiance System
 */

import type {
  AudioChannel,
  AmbientLayer,
  PlayMusicOptions,
  PlayEffectOptions,
  IAudioEngine,
  MusicState,
} from './types';

// Default volumes
const DEFAULT_VOLUMES: Record<AudioChannel, number> = {
  master: 80,
  music: 70,
  effects: 85,
  ambience: 60,
};

// Crossfade duration for music
const DEFAULT_CROSSFADE_MS = 2000;

export class SparcAudioEngine implements IAudioEngine {
  private audioContext: AudioContext | null = null;
  
  // Gain nodes for mixing
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private effectsGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  
  // Volume storage (0-100)
  private volumes: Record<AudioChannel, number> = { ...DEFAULT_VOLUMES };
  private muted: Record<AudioChannel, boolean> = {
    master: false,
    music: false,
    effects: false,
    ambience: false,
  };
  
  // Music state
  private musicSource: AudioBufferSourceNode | null = null;
  private musicBuffer: AudioBuffer | null = null;
  private musicStartTime: number = 0;
  private musicPauseTime: number = 0;
  private musicLoop: boolean = true;
  private currentMusicUrl: string | null = null;
  
  // Ambience sources
  private ambienceSources: Map<string, {
    source: AudioBufferSourceNode;
    gain: GainNode;
    buffer: AudioBuffer;
  }> = new Map();
  
  // Preloaded effect buffers
  private effectBuffers: Map<string, AudioBuffer> = new Map();
  
  // State
  private _isInitialized: boolean = false;
  private _isSuspended: boolean = false;
  
  // Music state for external access
  private _musicState: MusicState = {
    assetId: null,
    title: null,
    url: null,
    playing: false,
    volume: 70,
    position: 0,
    duration: 0,
    loop: true,
  };
  
  // Callbacks
  private onMusicStateChange?: (state: MusicState) => void;
  
  get isInitialized(): boolean {
    return this._isInitialized;
  }
  
  get isSuspended(): boolean {
    return this._isSuspended;
  }
  
  get musicState(): MusicState {
    return { ...this._musicState };
  }
  
  setMusicStateCallback(callback: (state: MusicState) => void): void {
    this.onMusicStateChange = callback;
  }
  
  private updateMusicState(updates: Partial<MusicState>): void {
    this._musicState = { ...this._musicState, ...updates };
    this.onMusicStateChange?.(this._musicState);
  }
  
  /**
   * Initialize the audio engine
   * Must be called after user interaction due to browser autoplay policies
   */
  async initialize(): Promise<void> {
    if (this._isInitialized) return;
    
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // Create gain nodes
      this.masterGain = this.audioContext.createGain();
      this.musicGain = this.audioContext.createGain();
      this.effectsGain = this.audioContext.createGain();
      this.ambienceGain = this.audioContext.createGain();
      
      // Connect gain nodes: channels -> master -> destination
      this.musicGain.connect(this.masterGain);
      this.effectsGain.connect(this.masterGain);
      this.ambienceGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);
      
      // Set initial volumes
      this.applyVolumes();
      
      this._isInitialized = true;
      this._isSuspended = this.audioContext.state === 'suspended';
      
      // Auto-resume if suspended
      if (this._isSuspended) {
        await this.resume();
      }
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
      throw error;
    }
  }
  
  /**
   * Apply volume levels to gain nodes
   */
  private applyVolumes(): void {
    if (!this.masterGain || !this.musicGain || !this.effectsGain || !this.ambienceGain) return;
    
    const masterMultiplier = this.muted.master ? 0 : this.volumes.master / 100;
    const musicMultiplier = this.muted.music ? 0 : this.volumes.music / 100;
    const effectsMultiplier = this.muted.effects ? 0 : this.volumes.effects / 100;
    const ambienceMultiplier = this.muted.ambience ? 0 : this.volumes.ambience / 100;
    
    this.masterGain.gain.value = masterMultiplier;
    this.musicGain.gain.value = musicMultiplier;
    this.effectsGain.gain.value = effectsMultiplier;
    this.ambienceGain.gain.value = ambienceMultiplier;
  }
  
  /**
   * Fetch and decode an audio file
   */
  private async loadAudio(url: string): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio engine not initialized');
    
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return this.audioContext.decodeAudioData(arrayBuffer);
  }
  
  /**
   * Create a fade gain ramp
   */
  private fadeGain(gainNode: GainNode, targetValue: number, durationMs: number): void {
    if (!this.audioContext) return;
    
    const currentTime = this.audioContext.currentTime;
    const duration = durationMs / 1000;
    
    gainNode.gain.cancelScheduledValues(currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
    gainNode.gain.linearRampToValueAtTime(targetValue, currentTime + duration);
  }
  
  // ===============================
  // MUSIC CONTROLS
  // ===============================
  
  /**
   * Play background music
   */
  async playMusic(url: string, options: PlayMusicOptions = {}): Promise<void> {
    if (!this.audioContext || !this.musicGain) {
      await this.initialize();
    }
    if (!this.audioContext || !this.musicGain) return;
    
    const {
      volume = 70,
      loop = true,
      fadeInMs = DEFAULT_CROSSFADE_MS,
    } = options;
    
    // If same URL is already playing, just resume
    if (this.currentMusicUrl === url && this.musicSource) {
      this.resumeMusic();
      return;
    }
    
    // Stop current music with crossfade if playing
    if (this.musicSource) {
      await this.stopMusic(fadeInMs);
    }
    
    try {
      // Load the audio
      const buffer = await this.loadAudio(url);
      this.musicBuffer = buffer;
      this.currentMusicUrl = url;
      this.musicLoop = loop;
      
      // Create source
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.loop = loop;
      source.connect(this.musicGain);
      
      // Fade in
      const fadeGain = this.audioContext.createGain();
      fadeGain.gain.value = 0;
      source.disconnect();
      source.connect(fadeGain);
      fadeGain.connect(this.musicGain);
      this.fadeGain(fadeGain, 1, fadeInMs);
      
      // Start playback
      source.start(0);
      this.musicSource = source;
      this.musicStartTime = this.audioContext.currentTime;
      this.musicPauseTime = 0;
      
      // Update volume
      this.volumes.music = volume;
      this.applyVolumes();
      
      // Update state
      this.updateMusicState({
        url,
        playing: true,
        volume,
        position: 0,
        duration: buffer.duration,
        loop,
      });
      
      // Handle end event
      source.onended = () => {
        if (!loop) {
          this.updateMusicState({ playing: false, position: buffer.duration });
        }
      };
    } catch (error) {
      console.error('Failed to play music:', error);
      throw error;
    }
  }
  
  /**
   * Stop music playback
   */
  async stopMusic(fadeOutMs: number = DEFAULT_CROSSFADE_MS): Promise<void> {
    if (!this.musicSource || !this.audioContext) return;
    
    return new Promise((resolve) => {
      if (!this.musicGain || !this.audioContext) {
        resolve();
        return;
      }
      
      // Create fade out
      this.fadeGain(this.musicGain, 0, fadeOutMs);
      
      // Stop after fade
      setTimeout(() => {
        if (this.musicSource) {
          try {
            this.musicSource.stop();
          } catch {
            // Already stopped
          }
          this.musicSource = null;
        }
        this.musicBuffer = null;
        this.currentMusicUrl = null;
        
        // Reset gain
        if (this.musicGain) {
          this.musicGain.gain.value = this.volumes.music / 100;
        }
        
        this.updateMusicState({
          assetId: null,
          title: null,
          url: null,
          playing: false,
          position: 0,
          duration: 0,
        });
        
        resolve();
      }, fadeOutMs);
    });
  }
  
  /**
   * Pause music
   */
  pauseMusic(): void {
    if (!this.audioContext || !this.musicSource) return;
    
    this.musicPauseTime = this.audioContext.currentTime - this.musicStartTime;
    try {
      this.musicSource.stop();
    } catch {
      // Already stopped
    }
    this.musicSource = null;
    
    this.updateMusicState({ playing: false, position: this.musicPauseTime });
  }
  
  /**
   * Resume paused music
   */
  resumeMusic(): void {
    if (!this.audioContext || !this.musicGain || !this.musicBuffer || !this.currentMusicUrl) return;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = this.musicBuffer;
    source.loop = this.musicLoop;
    source.connect(this.musicGain);
    
    // Resume from paused position
    source.start(0, this.musicPauseTime);
    this.musicSource = source;
    this.musicStartTime = this.audioContext.currentTime - this.musicPauseTime;
    
    this.updateMusicState({ playing: true });
  }
  
  /**
   * Seek to position in music
   */
  seekMusic(position: number): void {
    if (!this.audioContext || !this.musicBuffer || !this.musicGain) return;
    
    const wasPlaying = this.musicSource !== null;
    
    // Stop current
    if (this.musicSource) {
      try {
        this.musicSource.stop();
      } catch {
        // Already stopped
      }
    }
    
    // Create new source at position
    const source = this.audioContext.createBufferSource();
    source.buffer = this.musicBuffer;
    source.loop = this.musicLoop;
    source.connect(this.musicGain);
    
    if (wasPlaying) {
      source.start(0, position);
      this.musicSource = source;
      this.musicStartTime = this.audioContext.currentTime - position;
    } else {
      this.musicPauseTime = position;
    }
    
    this.updateMusicState({ position });
  }
  
  // ===============================
  // SOUND EFFECTS
  // ===============================
  
  /**
   * Preload a sound effect for instant playback
   */
  async preloadEffect(id: string, url: string): Promise<void> {
    if (!this.audioContext) {
      await this.initialize();
    }
    if (!this.audioContext) return;
    
    if (this.effectBuffers.has(id)) return;
    
    try {
      const buffer = await this.loadAudio(url);
      this.effectBuffers.set(id, buffer);
    } catch (error) {
      console.error(`Failed to preload effect ${id}:`, error);
    }
  }
  
  /**
   * Play a sound effect
   */
  async playEffect(id: string, options: PlayEffectOptions = {}): Promise<void> {
    if (!this.audioContext || !this.effectsGain) {
      await this.initialize();
    }
    if (!this.audioContext || !this.effectsGain) return;
    
    const { volume = 100 } = options;
    
    let buffer = this.effectBuffers.get(id);
    
    // If not preloaded, try to load by ID as URL
    if (!buffer) {
      try {
        buffer = await this.loadAudio(id);
      } catch (error) {
        console.error(`Failed to load effect ${id}:`, error);
        return;
      }
    }
    
    // Create source
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    
    // Create gain for individual volume
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume / 100;
    
    source.connect(gainNode);
    gainNode.connect(this.effectsGain);
    
    // Play immediately
    source.start(0);
  }
  
  // ===============================
  // AMBIENT SOUNDSCAPES
  // ===============================
  
  /**
   * Set ambient soundscape layers
   */
  async setAmbience(layers: AmbientLayer[]): Promise<void> {
    if (!this.audioContext || !this.ambienceGain) {
      await this.initialize();
    }
    if (!this.audioContext || !this.ambienceGain) return;
    
    // Stop all current layers
    this.ambienceSources.forEach((source) => {
      try {
        source.source.stop();
      } catch {
        // Already stopped
      }
    });
    this.ambienceSources.clear();
    
    // Add new layers
    for (const layer of layers) {
      await this.addAmbienceLayer(layer);
    }
  }
  
  /**
   * Add an ambient layer
   */
  async addAmbienceLayer(layer: AmbientLayer): Promise<void> {
    if (!this.audioContext || !this.ambienceGain) return;
    
    try {
      const buffer = await this.loadAudio(layer.url);
      
      // Create source
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.loop = layer.loop;
      
      // Create gain for individual volume
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = layer.volume / 100;
      
      source.connect(gainNode);
      gainNode.connect(this.ambienceGain);
      
      // Start playback
      source.start(0);
      
      // Store reference
      this.ambienceSources.set(layer.id, { source, gain: gainNode, buffer });
    } catch (error) {
      console.error(`Failed to add ambience layer ${layer.id}:`, error);
    }
  }
  
  /**
   * Remove an ambient layer
   */
  removeAmbienceLayer(layerId: string): void {
    const layer = this.ambienceSources.get(layerId);
    if (!layer) return;
    
    try {
      layer.source.stop();
    } catch {
      // Already stopped
    }
    this.ambienceSources.delete(layerId);
  }
  
  /**
   * Set volume for a specific ambient layer
   */
  setAmbienceLayerVolume(layerId: string, volume: number): void {
    const layer = this.ambienceSources.get(layerId);
    if (!layer) return;
    
    layer.gain.gain.value = volume / 100;
  }
  
  // ===============================
  // VOLUME CONTROLS
  // ===============================
  
  /**
   * Set volume for a channel
   */
  setVolume(channel: AudioChannel, volume: number): void {
    this.volumes[channel] = Math.max(0, Math.min(100, volume));
    this.applyVolumes();
    
    if (channel === 'music') {
      this.updateMusicState({ volume });
    }
  }
  
  /**
   * Get volume for a channel
   */
  getVolume(channel: AudioChannel): number {
    return this.volumes[channel];
  }
  
  /**
   * Mute a channel
   */
  mute(channel: AudioChannel): void {
    this.muted[channel] = true;
    this.applyVolumes();
  }
  
  /**
   * Unmute a channel
   */
  unmute(channel: AudioChannel): void {
    this.muted[channel] = false;
    this.applyVolumes();
  }
  
  /**
   * Check if a channel is muted
   */
  isMuted(channel: AudioChannel): boolean {
    return this.muted[channel];
  }
  
  // ===============================
  // LIFECYCLE
  // ===============================
  
  /**
   * Suspend the audio context (for background/lock screen)
   */
  suspend(): void {
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
      this._isSuspended = true;
    }
  }
  
  /**
   * Resume the audio context
   */
  async resume(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      this._isSuspended = false;
    }
  }
  
  /**
   * Dispose of all resources
   */
  dispose(): void {
    // Stop music
    if (this.musicSource) {
      try {
        this.musicSource.stop();
      } catch {
        // Already stopped
      }
    }
    
    // Stop all ambience
    this.ambienceSources.forEach((source) => {
      try {
        source.source.stop();
      } catch {
        // Already stopped
      }
    });
    
    // Close context
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    // Clear state
    this.musicSource = null;
    this.musicBuffer = null;
    this.ambienceSources.clear();
    this.effectBuffers.clear();
    this._isInitialized = false;
  }
}

// Singleton instance
let audioEngineInstance: SparcAudioEngine | null = null;

export function getAudioEngine(): SparcAudioEngine {
  if (!audioEngineInstance) {
    audioEngineInstance = new SparcAudioEngine();
  }
  return audioEngineInstance;
}

export function disposeAudioEngine(): void {
  if (audioEngineInstance) {
    audioEngineInstance.dispose();
    audioEngineInstance = null;
  }
}
