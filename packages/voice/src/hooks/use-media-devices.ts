/**
 * Hook for managing media devices (microphones, speakers, cameras)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { MediaDevice, MediaDeviceState } from '../types';

interface UseMediaDevicesOptions {
  autoEnumerate?: boolean;
}

interface UseMediaDevicesReturn extends MediaDeviceState {
  enumerateDevices: () => Promise<void>;
  requestPermissions: (
    audio?: boolean,
    video?: boolean
  ) => Promise<{ audio: boolean; video: boolean }>;
  selectAudioInput: (deviceId: string) => void;
  selectAudioOutput: (deviceId: string) => void;
  selectVideoInput: (deviceId: string) => void;
  testAudioInput: (deviceId: string) => Promise<MediaStream | null>;
  testAudioOutput: (deviceId: string) => Promise<void>;
}

export function useMediaDevices(
  options: UseMediaDevicesOptions = {}
): UseMediaDevicesReturn {
  const { autoEnumerate = true } = options;

  const [state, setState] = useState<MediaDeviceState>({
    audioInputs: [],
    audioOutputs: [],
    videoInputs: [],
    selectedAudioInput: undefined,
    selectedAudioOutput: undefined,
    selectedVideoInput: undefined,
    hasPermission: false,
    permissionDenied: false,
  });

  const testStreamRef = useRef<MediaStream | null>(null);

  // Clean up test streams
  useEffect(() => {
    return () => {
      if (testStreamRef.current) {
        testStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Enumerate available devices
  const enumerateDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const audioInputs: MediaDevice[] = [];
      const audioOutputs: MediaDevice[] = [];
      const videoInputs: MediaDevice[] = [];

      devices.forEach((device) => {
        const mediaDevice: MediaDevice = {
          deviceId: device.deviceId,
          label:
            device.label || `${device.kind} (${device.deviceId.slice(0, 8)})`,
          kind: device.kind as MediaDevice['kind'],
          isDefault: device.deviceId === 'default',
        };

        switch (device.kind) {
          case 'audioinput':
            audioInputs.push(mediaDevice);
            break;
          case 'audiooutput':
            audioOutputs.push(mediaDevice);
            break;
          case 'videoinput':
            videoInputs.push(mediaDevice);
            break;
        }
      });

      // Check if we have permission (labels are available)
      const hasPermission = devices.some((d) => d.label !== '');

      setState((prev) => ({
        ...prev,
        audioInputs,
        audioOutputs,
        videoInputs,
        hasPermission,
        // Set defaults if not already selected
        selectedAudioInput:
          prev.selectedAudioInput ||
          audioInputs.find((d) => d.isDefault)?.deviceId ||
          audioInputs[0]?.deviceId,
        selectedAudioOutput:
          prev.selectedAudioOutput ||
          audioOutputs.find((d) => d.isDefault)?.deviceId ||
          audioOutputs[0]?.deviceId,
        selectedVideoInput:
          prev.selectedVideoInput ||
          videoInputs.find((d) => d.isDefault)?.deviceId ||
          videoInputs[0]?.deviceId,
      }));
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
    }
  }, []);

  // Request permissions
  const requestPermissions = useCallback(
    async (audio = true, video = false) => {
      const result = { audio: false, video: false };

      try {
        const constraints: MediaStreamConstraints = {};
        if (audio) constraints.audio = true;
        if (video) constraints.video = true;

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        // Stop all tracks immediately - we just needed permission
        stream.getTracks().forEach((track) => track.stop());

        result.audio = audio;
        result.video = video;

        setState((prev) => ({
          ...prev,
          hasPermission: true,
          permissionDenied: false,
        }));

        // Re-enumerate to get proper labels
        await enumerateDevices();
      } catch (error) {
        console.error('Permission denied:', error);
        setState((prev) => ({
          ...prev,
          permissionDenied: true,
        }));
      }

      return result;
    },
    [enumerateDevices]
  );

  // Select devices
  const selectAudioInput = useCallback((deviceId: string) => {
    setState((prev) => ({ ...prev, selectedAudioInput: deviceId }));
  }, []);

  const selectAudioOutput = useCallback((deviceId: string) => {
    setState((prev) => ({ ...prev, selectedAudioOutput: deviceId }));
  }, []);

  const selectVideoInput = useCallback((deviceId: string) => {
    setState((prev) => ({ ...prev, selectedVideoInput: deviceId }));
  }, []);

  // Test audio input (returns a MediaStream for visualization)
  const testAudioInput = useCallback(
    async (deviceId: string): Promise<MediaStream | null> => {
      // Clean up previous test stream
      if (testStreamRef.current) {
        testStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } },
        });
        testStreamRef.current = stream;
        return stream;
      } catch (error) {
        console.error('Failed to test audio input:', error);
        return null;
      }
    },
    []
  );

  // Test audio output
  const testAudioOutput = useCallback(async (_deviceId: string) => {
    try {
      // Create an audio context and play a test tone
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 440; // A4 note
      gainNode.gain.value = 0.1; // Low volume

      oscillator.start();

      // Stop after 500ms
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 500);
    } catch (error) {
      console.error('Failed to test audio output:', error);
    }
  }, []);

  // Auto-enumerate on mount
  useEffect(() => {
    if (autoEnumerate) {
      enumerateDevices();
    }
  }, [autoEnumerate, enumerateDevices]);

  // Listen for device changes
  useEffect(() => {
    const handleDeviceChange = () => {
      enumerateDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener(
        'devicechange',
        handleDeviceChange
      );
    };
  }, [enumerateDevices]);

  return {
    ...state,
    enumerateDevices,
    requestPermissions,
    selectAudioInput,
    selectAudioOutput,
    selectVideoInput,
    testAudioInput,
    testAudioOutput,
  };
}
