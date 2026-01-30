# PRD 30: Voice & Video Chat

> **Status**: Ready for Implementation  
> **Priority**: P2 - Medium  
> **Estimated Effort**: 8 weeks  
> **Dependencies**: 04-session-management, 18-authentication

---

## Overview

Voice & Video Chat provides built-in communication tools for SPARC RPG sessions. Designed as a convenient default with fallback to external tools, it offers voice chat, optional video, push-to-talk, screen sharing for Seers, and recording capabilities—all optimized for RPG gameplay.

### Goals
- Built-in voice chat for seamless sessions
- Optional video chat for face-to-face interaction
- Push-to-talk and voice activation options
- Screen sharing for Seers showing maps/content
- Session recording for recaps and highlights
- Easy fallback to external tools (Discord, Zoom)
- Bandwidth optimization for varied connections

### Non-Goals
- Replacing Discord/Zoom for all use cases
- Video production features (virtual backgrounds, effects)
- Large conference call support (>10 participants)
- Mobile background audio (initial release)
- Transcription/live captions (future enhancement)

### Design Philosophy

SPARC's voice/video is a convenience feature, not a competitive product. Goals:
1. Zero-friction setup (no separate app/login)
2. "Just works" for typical RPG sessions
3. Graceful degradation on poor connections
4. Clear path to external tools when preferred

---

## User Stories

### Voice Chat

### US-01: Join Voice Channel
**As a** player  
**I want to** join voice chat for my session  
**So that** I can talk with my party

**Acceptance Criteria:**
- [ ] Voice join button in session view
- [ ] Microphone permission request with guidance
- [ ] Visual indicator of connected users
- [ ] Audio test before joining
- [ ] Mute/unmute toggle
- [ ] Leave voice option

### US-02: Push-to-Talk
**As a** player  
**I want to** use push-to-talk  
**So that** background noise doesn't disrupt the session

**Acceptance Criteria:**
- [ ] Configurable hotkey (default: Space)
- [ ] Visual indicator when transmitting
- [ ] Option to make PTT default
- [ ] Works even when window not focused
- [ ] Mobile: hold button to talk

### US-03: Voice Activation
**As a** player  
**I want to** use voice activation  
**So that** I can talk hands-free

**Acceptance Criteria:**
- [ ] Adjustable sensitivity threshold
- [ ] Visual feedback of audio level
- [ ] Auto-mute when threshold not met
- [ ] Noise gate to reduce background noise
- [ ] Easy toggle between PTT and voice activation

### US-04: Volume Controls
**As a** player  
**I want to** adjust individual volumes  
**So that** I can balance audio levels

**Acceptance Criteria:**
- [ ] Master volume control
- [ ] Per-user volume sliders
- [ ] Mute individual users
- [ ] Volume settings persist per session
- [ ] Audio ducking when dice roll (optional)

### Video Chat

### US-05: Enable Video
**As a** player  
**I want to** share my video  
**So that** we can see each other

**Acceptance Criteria:**
- [ ] Camera permission request with guidance
- [ ] Camera on/off toggle
- [ ] Camera selection (if multiple)
- [ ] Video quality options (low/medium/high)
- [ ] Bandwidth-adaptive quality

### US-06: Video Layout
**As a** player  
**I want to** see all video participants  
**So that** I can engage with the group

**Acceptance Criteria:**
- [ ] Grid layout for multiple videos
- [ ] Spotlight active speaker option
- [ ] Pin specific video
- [ ] Self-view toggle
- [ ] Full-screen mode

### US-07: Video Fallback
**As a** player on slow connection  
**I want** video to gracefully degrade  
**So that** audio remains stable

**Acceptance Criteria:**
- [ ] Auto-reduce quality on poor connection
- [ ] Option to disable incoming video
- [ ] Audio prioritized over video
- [ ] Clear indicator of degraded mode
- [ ] Manual quality override

### Seer Features

### US-08: Screen Sharing
**As a** Seer  
**I want to** share my screen  
**So that** players can see maps and content

**Acceptance Criteria:**
- [ ] Share entire screen or window
- [ ] Audio included in share (optional)
- [ ] Players see shared screen in session
- [ ] Stop sharing anytime
- [ ] Works alongside video

### US-09: Seer Audio Priority
**As a** Seer  
**I want** my voice prioritized  
**So that** important narration is heard clearly

**Acceptance Criteria:**
- [ ] Seer audio slightly louder by default
- [ ] Optional "Seer mode" that ducks player audio
- [ ] Priority push-to-talk for announcements
- [ ] Players can still speak normally

### Recording

### US-10: Record Session
**As a** Seer  
**I want to** record the session  
**So that** we can review and share highlights

**Acceptance Criteria:**
- [ ] Recording indicator visible to all
- [ ] Consent required from all participants
- [ ] Record audio only or audio+video
- [ ] Recording saved to cloud
- [ ] Download option for recorded files
- [ ] Automatic stop when session ends

### US-11: Recording Privacy
**As a** player  
**I want to** control my recording participation  
**So that** my privacy is respected

**Acceptance Criteria:**
- [ ] Prompt when recording starts
- [ ] Option to decline (hide video, mute audio contribution)
- [ ] Leave session if uncomfortable
- [ ] Clear indication recording is active
- [ ] Recording cannot start without notice

### External Tools Fallback

### US-12: External Link Integration
**As a** Seer  
**I want to** link to Discord/Zoom  
**So that** my group can use preferred tools

**Acceptance Criteria:**
- [ ] Add external voice link to session
- [ ] One-click join from session view
- [ ] Support Discord, Zoom, Google Meet links
- [ ] External link disables built-in voice
- [ ] Link visible to all session participants

---

## Technical Specification

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Voice/Video System                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Media Device Manager                    │   │
│  │  - Enumerate devices                                │   │
│  │  - Request permissions                              │   │
│  │  - Handle device changes                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Local Media Pipeline                    │   │
│  │  - Audio capture + noise gate                       │   │
│  │  - Video capture + compression                      │   │
│  │  - Screen capture                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              WebRTC Connection Layer                │   │
│  │  - Peer connections (SFU model)                     │   │
│  │  - ICE/STUN/TURN                                    │   │
│  │  - Bandwidth estimation                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Media Server (LiveKit/Janus)           │   │
│  │  - SFU routing                                      │   │
│  │  - Recording                                        │   │
│  │  - Simulcast                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Technology Selection

**Recommended: LiveKit**
- Open-source SFU server
- React SDK available
- Built-in recording
- Simulcast support
- Good documentation

**Alternative: Daily.co**
- Managed service
- Simpler integration
- Per-minute pricing
- Less control

### Data Models

```typescript
// Voice/Video room per session
interface VoiceRoom {
  id: string;
  sessionId: string;
  
  // Provider info
  provider: 'livekit' | 'daily' | 'external';
  roomUrl?: string;           // For external providers
  roomToken?: string;         // Auth token for media server
  
  // State
  status: 'inactive' | 'active' | 'ending';
  participants: VoiceParticipant[];
  
  // Recording
  recordingEnabled: boolean;
  recordingStatus: 'idle' | 'recording' | 'processing' | 'ready';
  recordingUrl?: string;
  
  // Settings
  settings: VoiceRoomSettings;
  
  createdAt: string;
}

interface VoiceParticipant {
  id: string;
  oderId: string;
  displayName: string;
  avatarUrl?: string;
  
  // Media state
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenShareEnabled: boolean;
  
  // Connection quality
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  
  // Role
  isSeer: boolean;
  
  // Recording consent
  recordingConsent: boolean;
  
  joinedAt: string;
}

interface VoiceRoomSettings {
  // Audio
  pushToTalk: boolean;
  pushToTalkKey: string;        // 'Space', 'KeyT', etc.
  voiceActivation: boolean;
  voiceActivationThreshold: number;  // 0-100
  noiseGate: boolean;
  
  // Video
  defaultVideoEnabled: boolean;
  videoQuality: 'low' | 'medium' | 'high' | 'auto';
  
  // Seer features
  seerAudioBoost: number;       // 0-50% boost
  seerAudioDucking: boolean;    // Reduce others when Seer speaks
  
  // Recording
  recordAudio: boolean;
  recordVideo: boolean;
  autoRecordSessions: boolean;
}

interface UserAudioSettings {
  inputDevice: string;
  outputDevice: string;
  inputVolume: number;          // 0-100
  outputVolume: number;
  pushToTalk: boolean;
  pushToTalkKey: string;
  voiceActivationThreshold: number;
  
  // Per-user volumes
  userVolumes: Record<string, number>;  // userId -> volume
  mutedUsers: string[];
}
```

### API Endpoints

```yaml
# Voice room management
POST   /api/v1/sessions/{id}/voice            # Create/start voice room
GET    /api/v1/sessions/{id}/voice            # Get voice room state
DELETE /api/v1/sessions/{id}/voice            # End voice room

# Participant management
POST   /api/v1/sessions/{id}/voice/join       # Get join token
POST   /api/v1/sessions/{id}/voice/leave      # Leave voice
PATCH  /api/v1/sessions/{id}/voice/settings   # Update room settings

# Recording
POST   /api/v1/sessions/{id}/voice/recording/start    # Start recording
POST   /api/v1/sessions/{id}/voice/recording/stop     # Stop recording
GET    /api/v1/sessions/{id}/voice/recordings         # List recordings
GET    /api/v1/sessions/{id}/voice/recordings/{id}    # Get recording URL

# External fallback
PUT    /api/v1/sessions/{id}/voice/external   # Set external link
DELETE /api/v1/sessions/{id}/voice/external   # Remove external link
```

### WebRTC Configuration

```typescript
// ICE server configuration
const iceServers = [
  // STUN (free, for NAT traversal)
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun.sparc-rpg.com:3478' },
  
  // TURN (paid, for restrictive networks)
  {
    urls: 'turn:turn.sparc-rpg.com:443?transport=tcp',
    username: 'dynamic',
    credential: 'dynamic',
  },
];

// Media constraints
const audioConstraints: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  sampleRate: 48000,
};

const videoConstraints: MediaTrackConstraints = {
  width: { ideal: 640, max: 1280 },
  height: { ideal: 480, max: 720 },
  frameRate: { ideal: 24, max: 30 },
};

// Bandwidth targets
const bandwidthTargets = {
  audioKbps: 64,
  videoLow: 150,
  videoMedium: 500,
  videoHigh: 1500,
  screenShare: 2000,
};
```

### Audio Processing

```typescript
// Noise gate implementation
class NoiseGate {
  private threshold: number;
  private attackTime: number = 0.01;
  private releaseTime: number = 0.1;
  
  constructor(threshold: number) {
    this.threshold = threshold;
  }
  
  process(audioContext: AudioContext): AudioNode {
    const analyser = audioContext.createAnalyser();
    const gain = audioContext.createGain();
    
    // Monitor audio level and adjust gain
    const checkLevel = () => {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      
      const average = data.reduce((a, b) => a + b) / data.length;
      const targetGain = average > this.threshold ? 1 : 0;
      
      gain.gain.setTargetAtTime(
        targetGain,
        audioContext.currentTime,
        targetGain === 1 ? this.attackTime : this.releaseTime
      );
      
      requestAnimationFrame(checkLevel);
    };
    
    checkLevel();
    return gain;
  }
}

// Voice activation detection
class VoiceActivationDetector {
  private threshold: number;
  private isSpeaking: boolean = false;
  private silenceTimeout: number | null = null;
  
  constructor(threshold: number, onStateChange: (speaking: boolean) => void) {
    this.threshold = threshold;
    // Implementation...
  }
}
```

---

## UI/UX Specifications

### Voice Controls Bar

```
┌─────────────────────────────────────────────────────────────┐
│  SESSION: Dragon's Lair                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                     [MAIN CONTENT AREA]                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🎤 Connected to Voice                              │   │
│  │                                                     │   │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐              │   │
│  │  │🧙‍♂️ │ │⚔️ │ │🏹 │ │📿 │ │🎭 │  (participants) │   │
│  │  │ GM │ │Kira│ │Elm │ │Bal │ │You │              │   │
│  │  │ 🔊 │ │ 🔊 │ │ 🔇 │ │ 🔊 │ │ 🔊 │              │   │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘              │   │
│  │                                                     │   │
│  │  [🎤 Mute] [📷 Video] [🖥️ Share] [⚙️] [📞 Leave]  │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Participant Speaking Indicator

```typescript
// Visual feedback for speaking
interface SpeakingIndicator {
  userId: string;
  audioLevel: number;        // 0-100, animated
  isSpeaking: boolean;
  
  // Visual
  borderGlow: boolean;       // Ring around avatar
  audioWaves: boolean;       // Animated sound waves
  nameHighlight: boolean;    // Name color change
}

// Implemented as CSS animation
const speakingStyles = css`
  .participant.speaking {
    animation: speaking-glow 0.5s ease-in-out infinite alternate;
  }
  
  @keyframes speaking-glow {
    from { box-shadow: 0 0 5px var(--accent); }
    to { box-shadow: 0 0 15px var(--accent); }
  }
`;
```

### Video Grid Layout

```
No Video (audio only):
┌─────────────────────────────────────────────────────────────┐
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐              │
│  │ 🧙 │ │ ⚔️ │ │ 🏹 │ │ 📿 │ │ 🎭 │ │ 🗡️ │              │
│  │ GM │ │Kira│ │ Elm│ │ Bal│ │Rune│ │ Zed│              │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘              │
└─────────────────────────────────────────────────────────────┘

With Video (grid):
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │  📹 GM   │ │  📹 Kira │ │  📹 Elm  │                    │
│  │          │ │          │ │          │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │  📹 Bal  │ │  📹 Rune │ │  📹 You  │                    │
│  │          │ │          │ │          │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
└─────────────────────────────────────────────────────────────┘

With Screen Share (spotlight):
┌─────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────┐ │
│  │                                                       │ │
│  │              🖥️ GM's Screen Share                    │ │
│  │                 (Map displayed)                       │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐              │
│  │ 🧙 │ │ ⚔️ │ │ 🏹 │ │ 📿 │ │ 🎭 │ │ 🗡️ │              │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘              │
└─────────────────────────────────────────────────────────────┘
```

### Settings Modal

```
┌─────────────────────────────────────────────────────────────┐
│  Voice & Video Settings                                [✕]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🎤 AUDIO                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Microphone: [Built-in Microphone____________▼]     │   │
│  │  Speaker:    [MacBook Pro Speakers___________▼]     │   │
│  │                                                     │   │
│  │  Input Volume:  ├───────●───────────┤ 65%          │   │
│  │  Output Volume: ├─────────────●─────┤ 80%          │   │
│  │                                                     │   │
│  │  [🔊 Test Audio]                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🎙️ VOICE MODE                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ( ) Push to Talk                                   │   │
│  │      Key: [Space____________]                       │   │
│  │                                                     │   │
│  │  (●) Voice Activated                                │   │
│  │      Sensitivity: ├─────●───────────┤ 40%          │   │
│  │      [▓▓▓▓▓▓▓▓░░░░░░░░░░░░] (live audio level)     │   │
│  │                                                     │   │
│  │  [☑] Enable noise gate                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📷 VIDEO                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Camera: [FaceTime HD Camera_____________▼]         │   │
│  │                                                     │   │
│  │  ┌─────────────────┐  Quality: ( ) Low              │   │
│  │  │                 │           (●) Medium           │   │
│  │  │   [Preview]     │           ( ) High             │   │
│  │  │                 │           ( ) Auto             │   │
│  │  └─────────────────┘                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                              [Cancel]  [Save Settings]      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Recording Consent Dialog

```
┌─────────────────────────────────────────────────────────────┐
│  🔴 Recording Starting                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  The Seer (DarkLord99) has started recording this session. │
│                                                             │
│  Recording will include:                                    │
│    • All audio from participants                           │
│    • Video feeds (if enabled)                              │
│    • Screen shares                                         │
│                                                             │
│  The recording will be available to the Seer after the     │
│  session for recap and highlight creation.                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │   [✅ I Consent]        [🚫 Decline & Mute]        │   │
│  │                                                     │   │
│  │            [Leave Session]                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Note: Declining will mute your audio and hide your video  │
│  from the recording. You can still participate in the      │
│  session normally.                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### External Voice Link

```
┌─────────────────────────────────────────────────────────────┐
│  Voice Chat: External Link                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  This session uses an external voice service.               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │   🔗 Join Voice on Discord                          │   │
│  │                                                     │   │
│  │   https://discord.gg/sparc-session-xyz              │   │
│  │                                                     │   │
│  │              [Open Discord]                         │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Built-in voice is disabled when using external links.     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Bandwidth Optimization

### Adaptive Bitrate Strategy

```typescript
// Connection quality thresholds
const qualityThresholds = {
  excellent: { minBitrate: 1500, jitter: 20, packetLoss: 0.01 },
  good: { minBitrate: 500, jitter: 50, packetLoss: 0.03 },
  poor: { minBitrate: 150, jitter: 100, packetLoss: 0.10 },
};

// Adaptive quality manager
class AdaptiveQualityManager {
  private currentQuality: 'high' | 'medium' | 'low';
  
  assessConnection(stats: RTCStatsReport): ConnectionQuality {
    // Analyze RTCStats for bitrate, jitter, packet loss
    // Return quality assessment
  }
  
  adjustQuality(quality: ConnectionQuality): void {
    if (quality === 'poor') {
      // Reduce video resolution/framerate
      // Prioritize audio stability
      this.setVideoQuality('low');
    } else if (quality === 'excellent') {
      // Allow higher quality if user preference
      this.setVideoQuality(this.userPreference);
    }
  }
}

// Simulcast layers for video
const simulcastLayers = [
  { rid: 'q', maxBitrate: 150000, scaleResolutionDownBy: 4 },  // Low
  { rid: 'h', maxBitrate: 500000, scaleResolutionDownBy: 2 },  // Medium
  { rid: 'f', maxBitrate: 1500000 },                           // High (full)
];
```

### Bandwidth Presets

| Quality | Audio | Video | Screen Share | Total (approx) |
|---------|-------|-------|--------------|----------------|
| Low | 32 kbps | 150 kbps | 500 kbps | ~700 kbps |
| Medium | 64 kbps | 500 kbps | 1000 kbps | ~1.5 Mbps |
| High | 96 kbps | 1500 kbps | 2000 kbps | ~3.5 Mbps |

### Audio Priority

```typescript
// Ensure audio always has bandwidth
const bandwidthAllocation = {
  // Reserve minimum for audio
  audioReserved: 96,  // kbps
  
  // Video uses remaining bandwidth
  videoDynamic: true,
  
  // When bandwidth constrained, degrade video first
  degradationPreference: 'maintain-framerate',
  
  // For Seer, prioritize their audio
  seerAudioPriority: true,
};
```

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Audio latency | <150ms |
| Video latency | <300ms |
| Join time | <3 seconds |
| Reconnect time | <5 seconds |
| Audio jitter buffer | 50-200ms |
| CPU usage (audio only) | <5% |
| CPU usage (with video) | <15% |

### Supported Configurations

| Participants | Audio | Video | Screen Share |
|--------------|-------|-------|--------------|
| 2-6 | ✅ | ✅ | ✅ |
| 7-10 | ✅ | ⚠️ (reduced quality) | ✅ |
| 10+ | ⚠️ | ❌ (audio only recommended) | ⚠️ |

---

## Testing Requirements

### Unit Tests
- [ ] Audio level detection
- [ ] Voice activation threshold
- [ ] Noise gate processing
- [ ] Bandwidth estimation

### Integration Tests
- [ ] Media device enumeration
- [ ] Permission requests
- [ ] WebRTC connection establishment
- [ ] Room join/leave flow
- [ ] Recording start/stop

### E2E Tests
- [ ] Two-party call
- [ ] Multi-party call (6 users)
- [ ] Screen share session
- [ ] Recording and playback
- [ ] External link fallback

### Performance Tests
- [ ] CPU usage monitoring
- [ ] Bandwidth consumption
- [ ] Latency measurements
- [ ] Quality degradation under load

### Compatibility Tests

| Browser | Audio | Video | Screen Share |
|---------|-------|-------|--------------|
| Chrome 100+ | ✅ | ✅ | ✅ |
| Firefox 100+ | ✅ | ✅ | ✅ |
| Safari 15+ | ✅ | ✅ | ⚠️ (limited) |
| Edge 100+ | ✅ | ✅ | ✅ |

---

## Implementation Phases

### Phase 1: Audio Foundation (Weeks 1-3)
- [ ] LiveKit/media server setup
- [ ] Audio connection flow
- [ ] Push-to-talk implementation
- [ ] Voice activation
- [ ] Basic UI

### Phase 2: Video & Screen Share (Weeks 3-5)
- [ ] Video streaming
- [ ] Screen sharing
- [ ] Adaptive quality
- [ ] Layout modes

### Phase 3: Recording (Weeks 5-6)
- [ ] Server-side recording
- [ ] Consent flow
- [ ] Recording storage
- [ ] Playback/download

### Phase 4: Polish & Fallback (Weeks 7-8)
- [ ] External link integration
- [ ] Settings persistence
- [ ] Connection quality indicators
- [ ] Mobile optimization
- [ ] Documentation

---

## Dependencies

- **PRD 04** (Session Management): Session context
- **PRD 18** (Authentication): User identity

---

## Open Questions

1. Self-hosted LiveKit vs. LiveKit Cloud?
2. Recording storage limits (per session, per Seer)?
3. Should recordings be shareable/public?
4. Mobile background audio (requires native app work)?

---

## Appendix

### A. LiveKit Integration Example

```typescript
import { Room, RoomEvent, Track } from 'livekit-client';

const connectToVoice = async (sessionId: string) => {
  // Get token from backend
  const { token, serverUrl } = await api.getVoiceToken(sessionId);
  
  // Create room
  const room = new Room({
    adaptiveStream: true,
    dynacast: true,
    videoCaptureDefaults: {
      resolution: { width: 640, height: 480, frameRate: 24 },
    },
  });
  
  // Event handlers
  room.on(RoomEvent.ParticipantConnected, (participant) => {
    console.log(`${participant.identity} joined`);
  });
  
  room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
    if (track.kind === Track.Kind.Audio) {
      const audio = track.attach();
      document.body.appendChild(audio);
    }
  });
  
  // Connect
  await room.connect(serverUrl, token);
  
  // Publish local tracks
  await room.localParticipant.enableCameraAndMicrophone();
};
```

### B. Recording File Format

```typescript
interface SessionRecording {
  id: string;
  sessionId: string;
  
  // File info
  format: 'mp4' | 'webm' | 'mp3';
  duration: number;           // seconds
  fileSize: number;           // bytes
  
  // Content
  hasAudio: boolean;
  hasVideo: boolean;
  participantCount: number;
  
  // Storage
  storageUrl: string;         // S3/GCS URL
  downloadUrl: string;        // Signed URL for download
  expiresAt: string;          // When download link expires
  
  // Metadata
  createdAt: string;
  processedAt: string;
  
  // Retention
  retentionDays: 30;
  deletesAt: string;
}
```

### C. Troubleshooting Flowchart

```
User can't hear others?
├── Check speaker selection
│   └── Test with system sounds
├── Check browser permissions
│   └── Site settings → Allow audio
├── Check volume levels
│   └── Per-user and master
└── Connection issue
    └── Try refreshing / reconnecting

Others can't hear user?
├── Check microphone selection
│   └── Test in settings
├── Check browser permissions
│   └── Site settings → Allow microphone
├── Check mute status
│   └── Local mute, PTT key
├── Check voice activation
│   └── Threshold too high?
└── Try different browser
```
