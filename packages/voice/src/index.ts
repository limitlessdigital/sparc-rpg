/**
 * @sparc/voice - Voice & Video Chat for SPARC RPG
 *
 * LiveKit-based real-time voice and video communication system
 * for RPG sessions.
 */

// Types - explicit exports to avoid conflicts
export type {
  VoiceProvider,
  VoiceRoomStatus,
  RecordingStatus,
  ConnectionQuality,
  VideoQuality,
  VoiceMode,
  VoiceRoom,
  ExternalVoiceLink,
  VoiceParticipant,
  LocalParticipant,
  VoiceRoomSettings,
  UserAudioSettings,
  UserVideoSettings,
  MediaDevice,
  MediaDeviceState,
  SessionRecording,
  VoiceRoomEvent,
  VoiceRoomEventType,
  JoinVoiceRequest,
  JoinVoiceResponse,
  CreateVoiceRoomRequest,
  CreateVoiceRoomResponse,
  StartRecordingRequest,
  RecordingConsentRequest,
  VoiceControlsProps,
  VideoGridProps,
  ParticipantTileProps,
  VoiceSettingsProps,
  RecordingConsentDialogProps,
} from './types';

export {
  DEFAULT_VOICE_ROOM_SETTINGS,
  DEFAULT_USER_AUDIO_SETTINGS,
  DEFAULT_USER_VIDEO_SETTINGS,
  BANDWIDTH_TARGETS,
  QUALITY_THRESHOLDS,
} from './types';

// Stores
export {
  useVoiceStore,
  selectParticipants,
  selectParticipantById,
  selectRemoteParticipants,
  selectSpeakingParticipants,
  selectSeer,
  selectIsUserMuted,
  selectUserVolume,
} from './stores';

// Hooks
export {
  useMediaDevices,
  useVoiceRoom,
  usePushToTalk,
  useMobilePushToTalk,
  useAudioLevel,
  useVoiceActivation,
} from './hooks';

// Components
export {
  VoiceControls,
  ParticipantTile,
  VideoGrid,
  AudioOnlyStrip,
  VoiceSettings,
  RecordingConsentDialog,
  JoinVoiceButton,
  ExternalVoiceLinkCard,
  PushToTalkButton,
  PushToTalkHint,
} from './components';
