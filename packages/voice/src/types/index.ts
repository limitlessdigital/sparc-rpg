/**
 * Voice & Video Chat Types for SPARC RPG
 * Based on PRD 30: Voice & Video Chat
 */

// ============================================================================
// Enums
// ============================================================================

export type VoiceProvider = 'livekit' | 'daily' | 'external';

export type VoiceRoomStatus = 'inactive' | 'active' | 'ending';

export type RecordingStatus = 'idle' | 'recording' | 'processing' | 'ready';

export type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'disconnected';

export type VideoQuality = 'low' | 'medium' | 'high' | 'auto';

export type VoiceMode = 'push-to-talk' | 'voice-activated' | 'always-on';

// ============================================================================
// Voice Room
// ============================================================================

export interface VoiceRoom {
  id: string;
  sessionId: string;

  // Provider info
  provider: VoiceProvider;
  roomUrl?: string; // For external providers
  roomToken?: string; // Auth token for media server
  serverUrl?: string; // LiveKit server URL

  // State
  status: VoiceRoomStatus;
  participants: VoiceParticipant[];

  // Recording
  recordingEnabled: boolean;
  recordingStatus: RecordingStatus;
  recordingUrl?: string;

  // Settings
  settings: VoiceRoomSettings;

  // External link fallback
  externalLink?: ExternalVoiceLink;

  createdAt: string;
  updatedAt?: string;
}

export interface ExternalVoiceLink {
  url: string;
  provider: 'discord' | 'zoom' | 'google-meet' | 'other';
  label?: string;
}

// ============================================================================
// Participants
// ============================================================================

export interface VoiceParticipant {
  id: string;
  oderId: string;
  displayName: string;
  avatarUrl?: string;

  // Media state
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenShareEnabled: boolean;
  isSpeaking: boolean;
  audioLevel: number; // 0-100

  // Connection quality
  connectionQuality: ConnectionQuality;

  // Role
  isSeer: boolean;

  // Recording consent
  recordingConsent: boolean;

  joinedAt: string;
}

export interface LocalParticipant extends VoiceParticipant {
  // Local-only state
  isConnecting: boolean;
  isConnected: boolean;
  localAudioEnabled: boolean;
  localVideoEnabled: boolean;
}

// ============================================================================
// Settings
// ============================================================================

export interface VoiceRoomSettings {
  // Audio
  pushToTalk: boolean;
  pushToTalkKey: string; // 'Space', 'KeyT', etc.
  voiceActivation: boolean;
  voiceActivationThreshold: number; // 0-100
  noiseGate: boolean;

  // Video
  defaultVideoEnabled: boolean;
  videoQuality: VideoQuality;

  // Seer features
  seerAudioBoost: number; // 0-50% boost
  seerAudioDucking: boolean; // Reduce others when Seer speaks

  // Recording
  recordAudio: boolean;
  recordVideo: boolean;
  autoRecordSessions: boolean;
}

export interface UserAudioSettings {
  inputDevice: string;
  outputDevice: string;
  inputVolume: number; // 0-100
  outputVolume: number; // 0-100
  voiceMode: VoiceMode;
  pushToTalkKey: string;
  voiceActivationThreshold: number;

  // Per-user volumes
  userVolumes: Record<string, number>; // oderId -> volume
  mutedUsers: string[]; // odeIds
}

export interface UserVideoSettings {
  cameraDevice: string;
  videoEnabled: boolean;
  videoQuality: VideoQuality;
  selfViewEnabled: boolean;
}

// ============================================================================
// Media Devices
// ============================================================================

export interface MediaDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput' | 'videoinput';
  isDefault: boolean;
}

export interface MediaDeviceState {
  audioInputs: MediaDevice[];
  audioOutputs: MediaDevice[];
  videoInputs: MediaDevice[];
  selectedAudioInput?: string;
  selectedAudioOutput?: string;
  selectedVideoInput?: string;
  hasPermission: boolean;
  permissionDenied: boolean;
}

// ============================================================================
// Recording
// ============================================================================

export interface SessionRecording {
  id: string;
  sessionId: string;

  // File info
  format: 'mp4' | 'webm' | 'mp3';
  duration: number; // seconds
  fileSize: number; // bytes

  // Content
  hasAudio: boolean;
  hasVideo: boolean;
  participantCount: number;

  // Storage
  storageUrl: string;
  downloadUrl: string;
  expiresAt: string;

  // Metadata
  createdAt: string;
  processedAt?: string;

  // Retention
  retentionDays: number;
  deletesAt: string;
}

// ============================================================================
// Events
// ============================================================================

export interface VoiceRoomEvent {
  type: VoiceRoomEventType;
  timestamp: string;
  payload: Record<string, unknown>;
}

export type VoiceRoomEventType =
  | 'participant-joined'
  | 'participant-left'
  | 'participant-muted'
  | 'participant-unmuted'
  | 'participant-video-on'
  | 'participant-video-off'
  | 'participant-speaking'
  | 'screen-share-started'
  | 'screen-share-stopped'
  | 'recording-started'
  | 'recording-stopped'
  | 'connection-quality-changed'
  | 'room-closed';

// ============================================================================
// API Types
// ============================================================================

export interface JoinVoiceRequest {
  sessionId: string;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
}

export interface JoinVoiceResponse {
  token: string;
  serverUrl: string;
  roomName: string;
}

export interface CreateVoiceRoomRequest {
  sessionId: string;
  settings?: Partial<VoiceRoomSettings>;
}

export interface CreateVoiceRoomResponse {
  room: VoiceRoom;
}

export interface StartRecordingRequest {
  sessionId: string;
  recordAudio: boolean;
  recordVideo: boolean;
}

export interface RecordingConsentRequest {
  sessionId: string;
  consent: boolean;
}

// ============================================================================
// Component Props
// ============================================================================

export interface VoiceControlsProps {
  sessionId: string;
  className?: string;
  compact?: boolean;
  onLeave?: () => void;
}

export interface VideoGridProps {
  participants: VoiceParticipant[];
  localParticipant?: LocalParticipant;
  layout?: 'grid' | 'spotlight' | 'sidebar';
  screenShareTrack?: MediaStreamTrack;
  className?: string;
  onPinParticipant?: (participantId: string) => void;
}

export interface ParticipantTileProps {
  participant: VoiceParticipant;
  isLocal?: boolean;
  isPinned?: boolean;
  isSpeaking?: boolean;
  showVideo?: boolean;
  videoTrack?: MediaStreamTrack;
  audioTrack?: MediaStreamTrack;
  className?: string;
  onClick?: () => void;
}

export interface VoiceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  audioSettings: UserAudioSettings;
  videoSettings: UserVideoSettings;
  onAudioSettingsChange: (settings: UserAudioSettings) => void;
  onVideoSettingsChange: (settings: UserVideoSettings) => void;
}

export interface RecordingConsentDialogProps {
  isOpen: boolean;
  seerName: string;
  onConsent: () => void;
  onDecline: () => void;
  onLeave: () => void;
}

// ============================================================================
// Constants
// ============================================================================

export const DEFAULT_VOICE_ROOM_SETTINGS: VoiceRoomSettings = {
  pushToTalk: false,
  pushToTalkKey: 'Space',
  voiceActivation: true,
  voiceActivationThreshold: 40,
  noiseGate: true,
  defaultVideoEnabled: false,
  videoQuality: 'auto',
  seerAudioBoost: 10,
  seerAudioDucking: false,
  recordAudio: true,
  recordVideo: false,
  autoRecordSessions: false,
};

export const DEFAULT_USER_AUDIO_SETTINGS: UserAudioSettings = {
  inputDevice: 'default',
  outputDevice: 'default',
  inputVolume: 100,
  outputVolume: 80,
  voiceMode: 'voice-activated',
  pushToTalkKey: 'Space',
  voiceActivationThreshold: 40,
  userVolumes: {},
  mutedUsers: [],
};

export const DEFAULT_USER_VIDEO_SETTINGS: UserVideoSettings = {
  cameraDevice: 'default',
  videoEnabled: false,
  videoQuality: 'auto',
  selfViewEnabled: true,
};

// Bandwidth targets (kbps)
export const BANDWIDTH_TARGETS = {
  audioKbps: 64,
  videoLow: 150,
  videoMedium: 500,
  videoHigh: 1500,
  screenShare: 2000,
} as const;

// Quality thresholds for connection assessment
export const QUALITY_THRESHOLDS = {
  excellent: { minBitrate: 1500, maxJitter: 20, maxPacketLoss: 0.01 },
  good: { minBitrate: 500, maxJitter: 50, maxPacketLoss: 0.03 },
  poor: { minBitrate: 150, maxJitter: 100, maxPacketLoss: 0.1 },
} as const;
