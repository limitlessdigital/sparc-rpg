/**
 * Voice Room Store - Zustand state management for voice/video chat
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  VoiceRoom,
  VoiceParticipant,
  LocalParticipant,
  UserAudioSettings,
  UserVideoSettings,
} from '../types';

// ============================================================================
// Store State Types
// ============================================================================

interface VoiceState {
  // Room state
  room: VoiceRoom | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;

  // Participants
  participants: Map<string, VoiceParticipant>;
  localParticipant: LocalParticipant | null;
  pinnedParticipantId: string | null;
  activeSpeakerId: string | null;

  // Media state
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  audioLevel: number;

  // Settings (persisted)
  audioSettings: UserAudioSettings;
  videoSettings: UserVideoSettings;

  // Recording
  isRecording: boolean;
  recordingConsentPending: boolean;
  hasGivenRecordingConsent: boolean;

  // UI state
  settingsOpen: boolean;
  recordingConsentDialogOpen: boolean;

  // Actions
  setRoom: (room: VoiceRoom | null) => void;
  setConnecting: (isConnecting: boolean) => void;
  setConnected: (isConnected: boolean) => void;
  setError: (error: string | null) => void;

  // Participant actions
  addParticipant: (participant: VoiceParticipant) => void;
  removeParticipant: (participantId: string) => void;
  updateParticipant: (
    participantId: string,
    updates: Partial<VoiceParticipant>
  ) => void;
  setLocalParticipant: (participant: LocalParticipant | null) => void;
  setPinnedParticipant: (participantId: string | null) => void;
  setActiveSpeaker: (participantId: string | null) => void;

  // Media actions
  setAudioEnabled: (enabled: boolean) => void;
  setVideoEnabled: (enabled: boolean) => void;
  setScreenSharing: (sharing: boolean) => void;
  setAudioLevel: (level: number) => void;

  // Settings actions
  setAudioSettings: (settings: Partial<UserAudioSettings>) => void;
  setVideoSettings: (settings: Partial<UserVideoSettings>) => void;
  setUserVolume: (oderId: string, volume: number) => void;
  muteUser: (oderId: string) => void;
  unmuteUser: (oderId: string) => void;

  // Recording actions
  setRecording: (isRecording: boolean) => void;
  setRecordingConsentPending: (pending: boolean) => void;
  giveRecordingConsent: (consent: boolean) => void;

  // UI actions
  openSettings: () => void;
  closeSettings: () => void;
  openRecordingConsentDialog: () => void;
  closeRecordingConsentDialog: () => void;

  // Reset
  reset: () => void;
}

// ============================================================================
// Default State
// ============================================================================

const defaultAudioSettings: UserAudioSettings = {
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

const defaultVideoSettings: UserVideoSettings = {
  cameraDevice: 'default',
  videoEnabled: false,
  videoQuality: 'auto',
  selfViewEnabled: true,
};

const initialState = {
  room: null,
  isConnecting: false,
  isConnected: false,
  error: null,
  participants: new Map<string, VoiceParticipant>(),
  localParticipant: null,
  pinnedParticipantId: null,
  activeSpeakerId: null,
  isAudioEnabled: false,
  isVideoEnabled: false,
  isScreenSharing: false,
  audioLevel: 0,
  audioSettings: defaultAudioSettings,
  videoSettings: defaultVideoSettings,
  isRecording: false,
  recordingConsentPending: false,
  hasGivenRecordingConsent: false,
  settingsOpen: false,
  recordingConsentDialogOpen: false,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useVoiceStore = create<VoiceState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Room actions
      setRoom: (room) => set({ room }),
      setConnecting: (isConnecting) => set({ isConnecting }),
      setConnected: (isConnected) => set({ isConnected }),
      setError: (error) => set({ error }),

      // Participant actions
      addParticipant: (participant) =>
        set((state) => {
          const participants = new Map(state.participants);
          participants.set(participant.id, participant);
          return { participants };
        }),

      removeParticipant: (participantId) =>
        set((state) => {
          const participants = new Map(state.participants);
          participants.delete(participantId);
          return { participants };
        }),

      updateParticipant: (participantId, updates) =>
        set((state) => {
          const participants = new Map(state.participants);
          const existing = participants.get(participantId);
          if (existing) {
            participants.set(participantId, { ...existing, ...updates });
          }
          return { participants };
        }),

      setLocalParticipant: (participant) =>
        set({ localParticipant: participant }),
      setPinnedParticipant: (participantId) =>
        set({ pinnedParticipantId: participantId }),
      setActiveSpeaker: (participantId) =>
        set({ activeSpeakerId: participantId }),

      // Media actions
      setAudioEnabled: (enabled) => set({ isAudioEnabled: enabled }),
      setVideoEnabled: (enabled) => set({ isVideoEnabled: enabled }),
      setScreenSharing: (sharing) => set({ isScreenSharing: sharing }),
      setAudioLevel: (level) => set({ audioLevel: level }),

      // Settings actions
      setAudioSettings: (settings) =>
        set((state) => ({
          audioSettings: { ...state.audioSettings, ...settings },
        })),

      setVideoSettings: (settings) =>
        set((state) => ({
          videoSettings: { ...state.videoSettings, ...settings },
        })),

      setUserVolume: (oderId, volume) =>
        set((state) => ({
          audioSettings: {
            ...state.audioSettings,
            userVolumes: {
              ...state.audioSettings.userVolumes,
              [oderId]: volume,
            },
          },
        })),

      muteUser: (oderId) =>
        set((state) => ({
          audioSettings: {
            ...state.audioSettings,
            mutedUsers: [...state.audioSettings.mutedUsers, oderId],
          },
        })),

      unmuteUser: (oderId) =>
        set((state) => ({
          audioSettings: {
            ...state.audioSettings,
            mutedUsers: state.audioSettings.mutedUsers.filter(
              (id) => id !== oderId
            ),
          },
        })),

      // Recording actions
      setRecording: (isRecording) => set({ isRecording }),
      setRecordingConsentPending: (pending) =>
        set({ recordingConsentPending: pending }),
      giveRecordingConsent: (consent) =>
        set({
          hasGivenRecordingConsent: consent,
          recordingConsentPending: false,
          recordingConsentDialogOpen: false,
        }),

      // UI actions
      openSettings: () => set({ settingsOpen: true }),
      closeSettings: () => set({ settingsOpen: false }),
      openRecordingConsentDialog: () =>
        set({ recordingConsentDialogOpen: true }),
      closeRecordingConsentDialog: () =>
        set({ recordingConsentDialogOpen: false }),

      // Reset
      reset: () =>
        set({
          ...initialState,
          // Preserve user settings on reset
          audioSettings: get().audioSettings,
          videoSettings: get().videoSettings,
        }),
    }),
    {
      name: 'sparc-voice-settings',
      partialize: (state) => ({
        audioSettings: state.audioSettings,
        videoSettings: state.videoSettings,
      }),
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

export const selectParticipants = (state: VoiceState) =>
  Array.from(state.participants.values());

export const selectParticipantById = (state: VoiceState, id: string) =>
  state.participants.get(id);

export const selectRemoteParticipants = (state: VoiceState) =>
  Array.from(state.participants.values()).filter(
    (p) => p.id !== state.localParticipant?.id
  );

export const selectSpeakingParticipants = (state: VoiceState) =>
  Array.from(state.participants.values()).filter((p) => p.isSpeaking);

export const selectSeer = (state: VoiceState) =>
  Array.from(state.participants.values()).find((p) => p.isSeer);

export const selectIsUserMuted = (state: VoiceState, oderId: string) =>
  state.audioSettings.mutedUsers.includes(oderId);

export const selectUserVolume = (state: VoiceState, oderId: string) =>
  state.audioSettings.userVolumes[oderId] ?? 100;
