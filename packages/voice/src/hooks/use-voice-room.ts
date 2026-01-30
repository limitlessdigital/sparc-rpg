/**
 * Hook for managing LiveKit voice room connections
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  Track,
  ConnectionState,
  ConnectionQuality as LKConnectionQuality,
} from 'livekit-client';
import type {
  LocalParticipant as LKLocalParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Participant,
  TrackPublication,
} from 'livekit-client';
import { useVoiceStore } from '../stores/voice-store';
import type {
  VoiceParticipant,
  LocalParticipant,
  ConnectionQuality,
  JoinVoiceResponse,
} from '../types';

interface UseVoiceRoomOptions {
  onJoinToken?: () => Promise<JoinVoiceResponse>;
  autoConnect?: boolean;
}

interface UseVoiceRoomReturn {
  room: Room | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  localParticipant: LocalParticipant | null;
  participants: VoiceParticipant[];

  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  toggleAudio: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
  setAudioEnabled: (enabled: boolean) => Promise<void>;
  setVideoEnabled: (enabled: boolean) => Promise<void>;
}

// Map LiveKit connection quality to our type
function mapConnectionQuality(quality: LKConnectionQuality): ConnectionQuality {
  switch (quality) {
    case LKConnectionQuality.Excellent:
      return 'excellent';
    case LKConnectionQuality.Good:
      return 'good';
    case LKConnectionQuality.Poor:
      return 'poor';
    default:
      return 'disconnected';
  }
}

// Convert LiveKit participant to our type
function toVoiceParticipant(
  participant: RemoteParticipant | LKLocalParticipant,
  isSeer: boolean = false
): VoiceParticipant {
  const metadata = participant.metadata
    ? JSON.parse(participant.metadata)
    : {};

  return {
    id: participant.sid,
    oderId: participant.identity,
    displayName: participant.name || participant.identity,
    avatarUrl: metadata.avatarUrl,
    audioEnabled: participant.isMicrophoneEnabled,
    videoEnabled: participant.isCameraEnabled,
    screenShareEnabled: participant.isScreenShareEnabled,
    isSpeaking: participant.isSpeaking,
    audioLevel: Math.round((participant.audioLevel || 0) * 100),
    connectionQuality: mapConnectionQuality(participant.connectionQuality),
    isSeer: metadata.isSeer || isSeer,
    recordingConsent: metadata.recordingConsent || false,
    joinedAt: new Date().toISOString(),
  };
}

export function useVoiceRoom(options: UseVoiceRoomOptions = {}): UseVoiceRoomReturn {
  const { onJoinToken, autoConnect = false } = options;

  const roomRef = useRef<Room | null>(null);
  const [room, setRoom] = useState<Room | null>(null);

  const {
    isConnecting,
    isConnected,
    error,
    localParticipant,
    setConnecting,
    setConnected,
    setError,
    setLocalParticipant,
    addParticipant,
    removeParticipant,
    updateParticipant,
    setAudioEnabled: storeSetAudioEnabled,
    setVideoEnabled: storeSetVideoEnabled,
    setScreenSharing,
    setActiveSpeaker,
    reset,
  } = useVoiceStore();

  const participants = useVoiceStore((state) =>
    Array.from(state.participants.values())
  );

  // Initialize room instance
  useEffect(() => {
    const newRoom = new Room({
      adaptiveStream: true,
      dynacast: true,
      videoCaptureDefaults: {
        resolution: { width: 640, height: 480, frameRate: 24 },
      },
      audioCaptureDefaults: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    roomRef.current = newRoom;
    setRoom(newRoom);

    return () => {
      newRoom.disconnect();
    };
  }, []);

  // Set up room event handlers
  useEffect(() => {
    const currentRoom = roomRef.current;
    if (!currentRoom) return;

    const handleParticipantConnected = (participant: RemoteParticipant) => {
      addParticipant(toVoiceParticipant(participant));
    };

    const handleParticipantDisconnected = (participant: RemoteParticipant) => {
      removeParticipant(participant.sid);
    };

    const handleTrackSubscribed = (
      track: RemoteTrack,
      _publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      if (track.kind === Track.Kind.Audio) {
        // Attach audio track
        const audioElement = track.attach();
        document.body.appendChild(audioElement);
      }
      updateParticipant(participant.sid, {
        audioEnabled: participant.isMicrophoneEnabled,
        videoEnabled: participant.isCameraEnabled,
      });
    };

    const handleTrackUnsubscribed = (
      track: RemoteTrack,
      _publication: RemoteTrackPublication,
      _participant: RemoteParticipant
    ) => {
      track.detach().forEach((el) => el.remove());
    };

    const handleTrackMuted = (
      _publication: TrackPublication,
      participant: Participant
    ) => {
      if (participant instanceof RemoteParticipant) {
        updateParticipant(participant.sid, {
          audioEnabled: participant.isMicrophoneEnabled,
          videoEnabled: participant.isCameraEnabled,
        });
      }
    };

    const handleTrackUnmuted = (
      _publication: TrackPublication,
      participant: Participant
    ) => {
      if (participant instanceof RemoteParticipant) {
        updateParticipant(participant.sid, {
          audioEnabled: participant.isMicrophoneEnabled,
          videoEnabled: participant.isCameraEnabled,
        });
      }
    };

    const handleActiveSpeakerChanged = (speakers: Participant[]) => {
      if (speakers.length > 0) {
        setActiveSpeaker(speakers[0].sid);
      } else {
        setActiveSpeaker(null);
      }
    };

    const handleConnectionStateChanged = (state: ConnectionState) => {
      setConnected(state === ConnectionState.Connected);
      setConnecting(state === ConnectionState.Connecting);
    };

    const handleDisconnected = () => {
      setConnected(false);
      reset();
    };

    const handleConnectionQualityChanged = (
      quality: LKConnectionQuality,
      participant: Participant
    ) => {
      if (participant instanceof RemoteParticipant) {
        updateParticipant(participant.sid, {
          connectionQuality: mapConnectionQuality(quality),
        });
      }
    };

    // Register event handlers
    currentRoom.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    currentRoom.on(
      RoomEvent.ParticipantDisconnected,
      handleParticipantDisconnected
    );
    currentRoom.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    currentRoom.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
    currentRoom.on(RoomEvent.TrackMuted, handleTrackMuted);
    currentRoom.on(RoomEvent.TrackUnmuted, handleTrackUnmuted);
    currentRoom.on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakerChanged);
    currentRoom.on(
      RoomEvent.ConnectionStateChanged,
      handleConnectionStateChanged
    );
    currentRoom.on(RoomEvent.Disconnected, handleDisconnected);
    currentRoom.on(
      RoomEvent.ConnectionQualityChanged,
      handleConnectionQualityChanged
    );

    return () => {
      currentRoom.off(
        RoomEvent.ParticipantConnected,
        handleParticipantConnected
      );
      currentRoom.off(
        RoomEvent.ParticipantDisconnected,
        handleParticipantDisconnected
      );
      currentRoom.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      currentRoom.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      currentRoom.off(RoomEvent.TrackMuted, handleTrackMuted);
      currentRoom.off(RoomEvent.TrackUnmuted, handleTrackUnmuted);
      currentRoom.off(
        RoomEvent.ActiveSpeakersChanged,
        handleActiveSpeakerChanged
      );
      currentRoom.off(
        RoomEvent.ConnectionStateChanged,
        handleConnectionStateChanged
      );
      currentRoom.off(RoomEvent.Disconnected, handleDisconnected);
      currentRoom.off(
        RoomEvent.ConnectionQualityChanged,
        handleConnectionQualityChanged
      );
    };
  }, [
    addParticipant,
    removeParticipant,
    updateParticipant,
    setActiveSpeaker,
    setConnected,
    setConnecting,
    reset,
  ]);

  // Connect to room
  const connect = useCallback(async () => {
    if (!roomRef.current || !onJoinToken) return;

    setConnecting(true);
    setError(null);

    try {
      const { token, serverUrl } = await onJoinToken();

      await roomRef.current.connect(serverUrl, token, {
        autoSubscribe: true,
      });

      // Set local participant
      const local = roomRef.current.localParticipant;
      const localPart: LocalParticipant = {
        ...toVoiceParticipant(local),
        isConnecting: false,
        isConnected: true,
        localAudioEnabled: local.isMicrophoneEnabled,
        localVideoEnabled: local.isCameraEnabled,
      };
      setLocalParticipant(localPart);

      // Add existing participants
      roomRef.current.remoteParticipants.forEach((participant) => {
        addParticipant(toVoiceParticipant(participant));
      });

      setConnected(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to connect to voice room';
      setError(message);
      console.error('Voice room connection error:', err);
    } finally {
      setConnecting(false);
    }
  }, [
    onJoinToken,
    setConnecting,
    setConnected,
    setError,
    setLocalParticipant,
    addParticipant,
  ]);

  // Disconnect from room
  const disconnect = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      reset();
    }
  }, [reset]);

  // Toggle audio
  const toggleAudio = useCallback(async () => {
    if (!roomRef.current?.localParticipant) return;

    const local = roomRef.current.localParticipant;
    const enabled = !local.isMicrophoneEnabled;

    await local.setMicrophoneEnabled(enabled);
    storeSetAudioEnabled(enabled);

    if (localParticipant) {
      setLocalParticipant({
        ...localParticipant,
        audioEnabled: enabled,
        localAudioEnabled: enabled,
      });
    }
  }, [localParticipant, setLocalParticipant, storeSetAudioEnabled]);

  // Toggle video
  const toggleVideo = useCallback(async () => {
    if (!roomRef.current?.localParticipant) return;

    const local = roomRef.current.localParticipant;
    const enabled = !local.isCameraEnabled;

    await local.setCameraEnabled(enabled);
    storeSetVideoEnabled(enabled);

    if (localParticipant) {
      setLocalParticipant({
        ...localParticipant,
        videoEnabled: enabled,
        localVideoEnabled: enabled,
      });
    }
  }, [localParticipant, setLocalParticipant, storeSetVideoEnabled]);

  // Set audio enabled
  const setAudioEnabled = useCallback(
    async (enabled: boolean) => {
      if (!roomRef.current?.localParticipant) return;

      await roomRef.current.localParticipant.setMicrophoneEnabled(enabled);
      storeSetAudioEnabled(enabled);

      if (localParticipant) {
        setLocalParticipant({
          ...localParticipant,
          audioEnabled: enabled,
          localAudioEnabled: enabled,
        });
      }
    },
    [localParticipant, setLocalParticipant, storeSetAudioEnabled]
  );

  // Set video enabled
  const setVideoEnabled = useCallback(
    async (enabled: boolean) => {
      if (!roomRef.current?.localParticipant) return;

      await roomRef.current.localParticipant.setCameraEnabled(enabled);
      storeSetVideoEnabled(enabled);

      if (localParticipant) {
        setLocalParticipant({
          ...localParticipant,
          videoEnabled: enabled,
          localVideoEnabled: enabled,
        });
      }
    },
    [localParticipant, setLocalParticipant, storeSetVideoEnabled]
  );

  // Start screen share
  const startScreenShare = useCallback(async () => {
    if (!roomRef.current?.localParticipant) return;

    try {
      await roomRef.current.localParticipant.setScreenShareEnabled(true);
      setScreenSharing(true);

      if (localParticipant) {
        setLocalParticipant({
          ...localParticipant,
          screenShareEnabled: true,
        });
      }
    } catch (err) {
      console.error('Failed to start screen share:', err);
    }
  }, [localParticipant, setLocalParticipant, setScreenSharing]);

  // Stop screen share
  const stopScreenShare = useCallback(async () => {
    if (!roomRef.current?.localParticipant) return;

    await roomRef.current.localParticipant.setScreenShareEnabled(false);
    setScreenSharing(false);

    if (localParticipant) {
      setLocalParticipant({
        ...localParticipant,
        screenShareEnabled: false,
      });
    }
  }, [localParticipant, setLocalParticipant, setScreenSharing]);

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && onJoinToken && !isConnected && !isConnecting) {
      connect();
    }
  }, [autoConnect, onJoinToken, isConnected, isConnecting, connect]);

  return {
    room,
    isConnecting,
    isConnected,
    error,
    localParticipant,
    participants,
    connect,
    disconnect,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    setAudioEnabled,
    setVideoEnabled,
  };
}
