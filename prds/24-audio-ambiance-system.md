# PRD 24: Audio & Ambiance System

> **Status**: Ready for Implementation  
> **Priority**: P2 - Medium  
> **Estimated Effort**: 5 days  
> **Dependencies**: 04-session-management, 09-node-system, 17-database-schema

---

## Overview

The Audio & Ambiance System brings SPARC adventures to life with immersive soundscapes. Seers can assign background music, sound effects, and ambient audio to scenes, creating memorable atmospheric experiences. The system supports both built-in audio libraries and external integrations.

### Goals
- Provide atmospheric audio that enhances storytelling
- Enable Seers to assign audio per-node in Adventure Forge
- Support sound effects for game events (dice rolls, combat, magic)
- Deliver consistent audio experience across devices
- Minimize bandwidth with efficient audio streaming

### Non-Goals
- Voice chat integration
- AI-generated music
- Full DAW/mixing capabilities
- Offline audio for mobile (MVP)

---

## User Stories

### US-01: Background Music Playback
**As a** Seer  
**I want to** play background music during sessions  
**So that** the atmosphere matches the narrative tone

**Acceptance Criteria:**
- [ ] Play/pause/stop controls in Seer Dashboard
- [ ] Volume slider (0-100%)
- [ ] Looping toggle for continuous play
- [ ] Crossfade between tracks (2-5 seconds configurable)
- [ ] Music audible to all session participants
- [ ] Current track visible in player UI

### US-02: Sound Effects Library
**As a** Seer  
**I want to** trigger sound effects during gameplay  
**So that** key moments feel impactful

**Acceptance Criteria:**
- [ ] Categorized sound effects (dice, combat, magic, environment)
- [ ] Quick-trigger soundboard in Seer Dashboard
- [ ] Automatic effects for dice rolls (configurable)
- [ ] Automatic effects for combat events
- [ ] Volume control separate from music
- [ ] Effects played instantly (<100ms latency)

### US-03: Ambient Soundscapes
**As a** Seer  
**I want to** set ambient background sounds  
**So that** players feel immersed in the location

**Acceptance Criteria:**
- [ ] Layer multiple ambient sounds
- [ ] Preset soundscapes (tavern, forest, dungeon, cave, ocean)
- [ ] Individual volume per layer
- [ ] Smooth transitions between soundscapes
- [ ] Mixable with background music

### US-04: Per-Node Audio Assignment
**As a** Seer creating adventures  
**I want to** assign audio to specific nodes  
**So that** audio changes automatically with the story

**Acceptance Criteria:**
- [ ] Music selection in node properties panel
- [ ] Ambient soundscape selection per node
- [ ] Audio preview in Adventure Forge editor
- [ ] Transition settings (fade duration, crossfade)
- [ ] Optional: auto-trigger sound effects for node type

### US-05: Volume Controls & Mixing
**As a** player  
**I want to** control my audio experience  
**So that** I can balance game audio with my environment

**Acceptance Criteria:**
- [ ] Master volume control
- [ ] Separate channels: Music, Effects, Ambient
- [ ] Mute toggles per channel
- [ ] Volume preferences saved per user
- [ ] Mobile-friendly controls

### US-06: Audio Asset Management
**As a** Seer  
**I want to** manage audio assets for my adventures  
**So that** I can use custom audio

**Acceptance Criteria:**
- [ ] Upload custom audio (MP3, OGG, WAV)
- [ ] File size limit: 10MB per file
- [ ] Audio library per adventure
- [ ] Organize with folders/tags
- [ ] Delete unused assets
- [ ] Preview before upload

### US-07: External Audio Integration
**As a** Seer  
**I want to** link Spotify or YouTube playlists  
**So that** I can use familiar music sources

**Acceptance Criteria:**
- [ ] Link Spotify playlist via share URL
- [ ] Link YouTube playlist via share URL
- [ ] Display current track info
- [ ] Players use their own service accounts
- [ ] Graceful fallback when service unavailable
- [ ] Clear licensing/terms notice

### US-08: Mobile Audio
**As a** mobile player  
**I want to** hear game audio on my device  
**So that** I'm part of the immersive experience

**Acceptance Criteria:**
- [ ] Audio plays in mobile browser
- [ ] Works with device locked (iOS/Android)
- [ ] Respects device silent mode
- [ ] Doesn't conflict with other audio apps
- [ ] Bandwidth-conscious streaming

---

## Technical Specification

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AUDIO ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Audio Asset  │───>│ CDN / Storage    │<───│ Audio Upload     │
│ Library      │    │ (CloudFlare R2)  │    │ Service          │
└──────────────┘    └────────┬─────────┘    └──────────────────┘
                             │
                             v
┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Seer         │───>│ Audio Control    │───>│ Session Sync     │
│ Dashboard    │    │ Service          │    │ (Real-time)      │
└──────────────┘    └────────┬─────────┘    └──────────────────┘
                             │
                             v
┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Player A     │<───│ Web Audio API    │───>│ Player B         │
│ (Browser)    │    │ Engine           │    │ (Mobile)         │
└──────────────┘    └──────────────────┘    └──────────────────┘
```

### Data Models

```typescript
// Audio Asset
interface AudioAsset {
  id: string;
  adventureId?: string;         // null for system library
  uploaderId: string;
  
  // File info
  filename: string;
  originalName: string;
  mimeType: 'audio/mpeg' | 'audio/ogg' | 'audio/wav';
  sizeBytes: number;
  durationSeconds: number;
  
  // Metadata
  title: string;
  artist?: string;
  category: AudioCategory;
  tags: string[];
  
  // URLs
  url: string;                  // CDN URL
  waveformUrl?: string;         // Pre-generated waveform
  
  // Flags
  isPublic: boolean;            // Available to all adventures
  isLoopable: boolean;
  
  createdAt: string;
  updatedAt: string;
}

type AudioCategory = 
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

// Audio Assignment (per node)
interface NodeAudioConfig {
  nodeId: string;
  
  // Background music
  music?: {
    assetId: string;
    volume: number;             // 0-100
    loop: boolean;
    fadeInMs: number;
    fadeOutMs: number;
  };
  
  // Ambient layers
  ambience?: {
    presetId?: string;          // Use preset soundscape
    layers?: AmbientLayer[];    // Or custom layers
    crossfadeMs: number;
  };
  
  // Triggered effects
  entryEffects?: string[];      // Asset IDs to play on node entry
}

interface AmbientLayer {
  assetId: string;
  volume: number;               // 0-100
  loop: boolean;
}

interface AmbientPreset {
  id: string;
  name: string;                 // "Tavern", "Forest", "Dungeon"
  description: string;
  layers: AmbientLayer[];
  thumbnailUrl: string;
}

// Session Audio State
interface SessionAudioState {
  sessionId: string;
  
  // Current playback
  music: {
    assetId: string | null;
    playing: boolean;
    volume: number;
    position: number;           // Playback position in seconds
    loop: boolean;
  };
  
  ambience: {
    presetId: string | null;
    layers: PlayingLayer[];
    masterVolume: number;
  };
  
  // Channel volumes (set by Seer)
  masterVolume: number;
  musicVolume: number;
  effectsVolume: number;
  ambienceVolume: number;
  
  // Last sync
  syncTimestamp: string;
}

interface PlayingLayer {
  assetId: string;
  volume: number;
  playing: boolean;
}

// User audio preferences
interface UserAudioPreferences {
  userId: string;
  
  // Personal overrides
  masterVolume: number;         // 0-100
  musicEnabled: boolean;
  effectsEnabled: boolean;
  ambienceEnabled: boolean;
  
  // Per-channel multipliers
  musicVolume: number;
  effectsVolume: number;
  ambienceVolume: number;
  
  // Behavior
  autoplayEnabled: boolean;     // Start audio automatically
  respectSilentMode: boolean;   // Mobile silent mode
}

// External playlist link
interface ExternalPlaylist {
  id: string;
  adventureId: string;
  creatorId: string;
  
  provider: 'spotify' | 'youtube';
  externalId: string;           // Playlist ID on external service
  shareUrl: string;
  
  name: string;
  description?: string;
  trackCount?: number;
  
  // Node assignments
  assignedNodes: string[];
  
  createdAt: string;
}
```

### API Endpoints

#### Audio Asset Management

##### POST /api/v1/audio/assets/upload

Upload a new audio asset.

```typescript
// Multipart form data
interface UploadAudioRequest {
  file: File;                   // Audio file (max 10MB)
  title: string;
  category: AudioCategory;
  adventureId?: string;         // Optional: assign to adventure
  tags?: string[];
  isLoopable?: boolean;
}

interface UploadAudioResponse {
  success: true;
  data: {
    asset: AudioAsset;
    uploadUrl: string;          // If using presigned upload
  };
}
```

**Validation:**
- Max file size: 10MB
- Allowed formats: MP3, OGG, WAV
- Max duration: 30 minutes
- Filename sanitized

##### GET /api/v1/audio/assets

List available audio assets.

```typescript
interface ListAudioRequest {
  adventureId?: string;         // Filter by adventure
  category?: AudioCategory;
  search?: string;
  includePublic?: boolean;      // Include system library
  limit?: number;
  offset?: number;
}

interface ListAudioResponse {
  success: true;
  data: {
    assets: AudioAsset[];
    total: number;
  };
}
```

##### DELETE /api/v1/audio/assets/:id

Delete an audio asset.

```typescript
interface DeleteAudioResponse {
  success: true;
  data: {
    deletedId: string;
  };
}
```

#### Audio Playback Control

##### POST /api/v1/sessions/:sessionId/audio/play

Start playing audio in session.

```typescript
interface PlayAudioRequest {
  channel: 'music' | 'effect';
  assetId: string;
  volume?: number;              // 0-100, default 80
  loop?: boolean;               // default true for music
  fadeInMs?: number;            // default 2000 for music
}

interface PlayAudioResponse {
  success: true;
  data: {
    audioState: SessionAudioState;
  };
}
```

##### POST /api/v1/sessions/:sessionId/audio/stop

Stop audio playback.

```typescript
interface StopAudioRequest {
  channel: 'music' | 'effect' | 'all';
  fadeOutMs?: number;           // default 2000 for music
}
```

##### POST /api/v1/sessions/:sessionId/audio/volume

Adjust volume levels.

```typescript
interface VolumeRequest {
  channel: 'master' | 'music' | 'effects' | 'ambience';
  volume: number;               // 0-100
}
```

##### POST /api/v1/sessions/:sessionId/audio/ambience

Set ambient soundscape.

```typescript
interface SetAmbienceRequest {
  presetId?: string;            // Use preset
  layers?: AmbientLayer[];      // Or custom layers
  crossfadeMs?: number;
}
```

##### GET /api/v1/sessions/:sessionId/audio/state

Get current audio state for sync.

```typescript
interface AudioStateResponse {
  success: true;
  data: {
    state: SessionAudioState;
  };
}
```

#### User Preferences

##### GET /api/v1/users/me/audio-preferences

Get user's audio preferences.

##### PUT /api/v1/users/me/audio-preferences

Update user's audio preferences.

```typescript
interface UpdatePreferencesRequest {
  masterVolume?: number;
  musicEnabled?: boolean;
  effectsEnabled?: boolean;
  ambienceEnabled?: boolean;
  musicVolume?: number;
  effectsVolume?: number;
  ambienceVolume?: number;
  autoplayEnabled?: boolean;
}
```

#### External Playlists

##### POST /api/v1/adventures/:adventureId/playlists

Link external playlist.

```typescript
interface LinkPlaylistRequest {
  provider: 'spotify' | 'youtube';
  shareUrl: string;
  name?: string;
}

interface LinkPlaylistResponse {
  success: true;
  data: {
    playlist: ExternalPlaylist;
    validationMessage?: string;   // e.g., "Players need their own Spotify account"
  };
}
```

### Real-time Sync

Audio state syncs via existing session polling or WebSocket upgrade:

```typescript
interface AudioSyncMessage {
  type: 'audio_update';
  sessionId: string;
  timestamp: string;
  changes: {
    music?: Partial<SessionAudioState['music']>;
    ambience?: Partial<SessionAudioState['ambience']>;
    volumes?: {
      master?: number;
      music?: number;
      effects?: number;
      ambience?: number;
    };
    effect?: {
      assetId: string;          // Play this effect now
      volume: number;
    };
  };
}
```

### Web Audio Implementation

```typescript
// Client-side audio engine using Web Audio API
class SparcAudioEngine {
  private audioContext: AudioContext;
  private musicGain: GainNode;
  private effectsGain: GainNode;
  private ambienceGain: GainNode;
  private masterGain: GainNode;
  
  private musicSource: AudioBufferSourceNode | null;
  private ambienceSources: Map<string, AudioBufferSourceNode>;
  
  // Preloaded effects for instant playback
  private effectBuffers: Map<string, AudioBuffer>;
  
  constructor() {
    this.audioContext = new AudioContext();
    this.setupGainNodes();
  }
  
  async playMusic(url: string, options: PlayOptions): Promise<void>;
  async playEffect(assetId: string): Promise<void>;
  async setAmbience(layers: AmbientLayer[]): Promise<void>;
  
  setVolume(channel: AudioChannel, volume: number): void;
  crossfade(newUrl: string, durationMs: number): Promise<void>;
  
  // Mobile-specific
  async ensureAudioContext(): Promise<void>;  // Handle autoplay restrictions
  suspend(): void;                             // Background/lock screen
  resume(): void;
}
```

---

## UI/UX Specifications

### Seer Dashboard - Audio Panel

```
┌─────────────────────────────────────────────────────────────────┐
│ 🎵 Audio Controls                                         [≡]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Now Playing                                                     │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ 🎵 Tavern Ambience - Medieval Jig    ▶️ ⏸️ ⏹️  🔁         ││
│ │ ━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━   2:34 / 4:12              ││
│ │                                                             ││
│ │ Volume: ━━━━━━━━━━━━━━●━━━━━━━━  75%                        ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ Quick Soundboard                                                │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│ │ 🎲 Dice │ │ ⚔️ Sword│ │ 🔥 Fire │ │ ⚡ Magic│               │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│ │ 💀 Death│ │ 🏆 Win  │ │ 🚪 Door │ │ 😱 Scare│               │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
│                                                                 │
│ Ambient Layers                                   Master: 80%    │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ 🏠 Tavern Chatter  ━━━━━━●━━━━ 60%    [×]                   ││
│ │ 🔥 Fireplace       ━━━━━━━━●━━ 70%    [×]                   ││
│ │ 🍺 Clinking Mugs   ━━●━━━━━━━━ 30%    [×]                   ││
│ │                                          [+ Add Layer]       ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Presets: [Tavern] [Forest] [Dungeon] [Cave] [Ocean] [+]    ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Adventure Forge - Node Audio Properties

```
┌─────────────────────────────────────────────────────────────────┐
│ Node Properties: "The Dark Forest"                              │
├─────────────────────────────────────────────────────────────────┤
│ Story | Connections | [Audio] | Variables                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Background Music                                                │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Selected: Mysterious Forest Theme    [🔊 Preview] [Change]  ││
│ │                                                             ││
│ │ Volume:    ━━━━━━━━━━●━━━━━━━ 70%                          ││
│ │ Loop:      [✓]                                             ││
│ │ Fade In:   2000 ms                                         ││
│ │ Fade Out:  2000 ms                                         ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ Ambient Soundscape                                              │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Preset: [Forest at Night    ▼]        [🔊 Preview]          ││
│ │                                                             ││
│ │ Crossfade from previous: 3000 ms                            ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ Entry Sound Effects                                             │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ • Owl Hoot             [×]                                  ││
│ │ • Wind Gust            [×]                                  ││
│ │                          [+ Add Effect]                     ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ External Playlist (Optional)                                    │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ 🟢 Spotify: "D&D Forest Ambience"    [Unlink]               ││
│ │ ⚠️ Players need their own Spotify account                   ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Player Audio Controls (Minimal)

```
┌───────────────────────────────────────┐
│ 🔊 Audio Settings                     │
├───────────────────────────────────────┤
│                                       │
│ Master     ━━━━━━━━━━●━━━━━  80%     │
│                                       │
│ 🎵 Music   ━━━━━━━━●━━━━━━━  70%  [✓]│
│ 💥 Effects ━━━━━━━━━━━●━━━  85%  [✓]│
│ 🌲 Ambient ━━━━━●━━━━━━━━━  50%  [✓]│
│                                       │
│ [Mute All]                            │
│                                       │
└───────────────────────────────────────┘
```

---

## Built-in Audio Library

### System Sound Effects (Included)

| Category | Sounds |
|----------|--------|
| Dice | Roll, Success, Failure, Critical Hit, Critical Miss |
| Combat | Sword clash, Arrow, Shield block, Hit, Miss, Death |
| Magic | Cast, Fire, Ice, Lightning, Heal, Buff, Debuff |
| Environment | Door open/close, Chest, Trap, Lever, Water |
| UI | Button click, Notification, Turn start, Session join |
| Drama | Victory fanfare, Defeat, Suspense, Reveal |

### Ambient Presets (Included)

| Preset | Layers |
|--------|--------|
| Tavern | Crowd chatter, Fireplace, Clinking glasses, Lute music |
| Forest | Birds, Wind, Leaves, Distant animals |
| Dungeon | Dripping water, Chains, Distant moans, Echoes |
| Cave | Water drops, Wind howl, Bats, Echoes |
| Ocean | Waves, Seagulls, Ship creaking, Wind |
| Battle | War drums, Distant clash, Horns |
| Town | Crowd, Merchants, Carts, Church bells |
| Night | Crickets, Owl, Wind, Distant wolves |

---

## Mobile Considerations

### Autoplay Restrictions

Browsers require user interaction before playing audio:

```typescript
// Handle autoplay restrictions
async function initializeAudio(): Promise<void> {
  const audioContext = new AudioContext();
  
  if (audioContext.state === 'suspended') {
    // Show "Enable Audio" button
    showAudioPrompt();
    
    // Resume on user interaction
    document.addEventListener('click', async () => {
      await audioContext.resume();
      hideAudioPrompt();
    }, { once: true });
  }
}
```

### Background Audio (iOS/Android)

```typescript
// Use Media Session API for lock screen controls
if ('mediaSession' in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: 'SPARC RPG Session',
    artist: currentAdventureName,
    album: 'Now Playing',
  });
  
  navigator.mediaSession.setActionHandler('play', () => audioEngine.resume());
  navigator.mediaSession.setActionHandler('pause', () => audioEngine.suspend());
}
```

### Bandwidth Optimization

- Compress audio to 128kbps MP3 for streaming
- Preload only first 5 seconds, stream remainder
- Cache recently played tracks locally
- Offer "Low Bandwidth Mode" setting

---

## Testing Requirements

### Unit Tests

```typescript
describe('AudioEngine', () => {
  it('should play music with correct volume', async () => {
    const engine = new SparcAudioEngine();
    await engine.playMusic('/test.mp3', { volume: 75 });
    expect(engine.getMusicVolume()).toBe(75);
  });
  
  it('should crossfade between tracks', async () => {
    const engine = new SparcAudioEngine();
    await engine.playMusic('/track1.mp3');
    await engine.crossfade('/track2.mp3', 2000);
    // Verify crossfade completion
  });
  
  it('should layer multiple ambient sounds', async () => {
    const engine = new SparcAudioEngine();
    await engine.setAmbience([
      { assetId: 'fire', volume: 50 },
      { assetId: 'rain', volume: 70 }
    ]);
    expect(engine.getAmbienceLayers()).toHaveLength(2);
  });
});
```

### Integration Tests

- Audio sync across multiple clients
- Volume controls persist across sessions
- Node audio triggers on scene transitions
- External playlist linking validation

### E2E Tests

- Seer plays music, all players hear it
- Sound effects trigger on dice rolls
- Audio continues during scene transitions
- Mobile audio works in background

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Effect trigger latency | <100ms |
| Music start latency | <500ms |
| Crossfade smoothness | 60fps |
| Audio sync drift | <100ms |
| Memory per session | <50MB |

---

## Security & Legal

### Audio Upload Validation

- Scan for malicious content
- Verify audio format headers
- Enforce size limits server-side
- Rate limit uploads (10/hour per user)

### Copyright Notice

```
⚠️ Audio Licensing

When uploading audio, you confirm:
- You own the rights to this content, OR
- The content is licensed for use in gaming contexts, OR
- The content is public domain

SPARC is not responsible for copyright claims from uploaded content.
```

### External Services Disclaimer

```
External playlists (Spotify, YouTube) require players to have their own
accounts. Audio from these services is not hosted by SPARC and may be
subject to their terms of service and regional restrictions.
```

---

## Implementation Phases

### Phase 1: Core Audio (Days 1-2)
- Web Audio engine implementation
- Basic play/pause/volume controls
- Sound effects library and triggers

### Phase 2: Session Sync (Day 3)
- Real-time audio state synchronization
- Multi-client playback coordination
- Seer dashboard audio panel

### Phase 3: Adventure Forge Integration (Day 4)
- Node audio properties panel
- Audio asset management
- Ambient presets system

### Phase 4: Polish & Mobile (Day 5)
- External playlist integration
- Mobile audio handling
- Performance optimization
- Testing and bug fixes

---

## Future Enhancements

- **Voice Effects**: Apply effects to voice chat (echo in caves)
- **Procedural Audio**: AI-generated ambient soundscapes
- **Spatial Audio**: 3D positioning for immersive scenes
- **Audio Recording**: Record and share session audio highlights
- **Custom Soundboards**: User-created effect collections

---

*PRD 24 - Audio & Ambiance System*  
*Version 1.0 | January 2025*
