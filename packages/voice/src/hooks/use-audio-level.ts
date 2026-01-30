/**
 * Hook for monitoring audio levels from a media stream
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseAudioLevelOptions {
  stream?: MediaStream | null;
  fftSize?: number;
  smoothingTimeConstant?: number;
  updateInterval?: number; // ms between updates
}

interface UseAudioLevelReturn {
  level: number; // 0-100
  isSpeaking: boolean;
  peakLevel: number;
  startMonitoring: (stream: MediaStream) => void;
  stopMonitoring: () => void;
}

const DEFAULT_FFT_SIZE = 256;
const DEFAULT_SMOOTHING = 0.8;
const DEFAULT_UPDATE_INTERVAL = 50;
const SPEAKING_THRESHOLD = 10; // Minimum level to consider as speaking

export function useAudioLevel(
  options: UseAudioLevelOptions = {}
): UseAudioLevelReturn {
  const {
    stream: initialStream,
    fftSize = DEFAULT_FFT_SIZE,
    smoothingTimeConstant = DEFAULT_SMOOTHING,
    updateInterval = DEFAULT_UPDATE_INTERVAL,
  } = options;

  const [level, setLevel] = useState(0);
  const [peakLevel, setPeakLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const startMonitoring = useCallback(
    (stream: MediaStream) => {
      // Clean up existing context
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      try {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        analyser.fftSize = fftSize;
        analyser.smoothingTimeConstant = smoothingTimeConstant;

        source.connect(analyser);
        // Don't connect to destination to avoid feedback

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        sourceRef.current = source;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateLevel = (timestamp: number) => {
          if (timestamp - lastUpdateRef.current >= updateInterval) {
            analyser.getByteFrequencyData(dataArray);

            // Calculate RMS (root mean square) for more accurate level
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i] * dataArray[i];
            }
            const rms = Math.sqrt(sum / dataArray.length);

            // Normalize to 0-100
            const normalizedLevel = Math.min(100, Math.round((rms / 128) * 100));

            setLevel(normalizedLevel);
            setIsSpeaking(normalizedLevel > SPEAKING_THRESHOLD);

            if (normalizedLevel > peakLevel) {
              setPeakLevel(normalizedLevel);
            }

            lastUpdateRef.current = timestamp;
          }

          rafIdRef.current = requestAnimationFrame(updateLevel);
        };

        rafIdRef.current = requestAnimationFrame(updateLevel);
      } catch (error) {
        console.error('Failed to start audio level monitoring:', error);
      }
    },
    [fftSize, smoothingTimeConstant, updateInterval, peakLevel]
  );

  const stopMonitoring = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setLevel(0);
    setIsSpeaking(false);
  }, []);

  // Start monitoring if initial stream is provided
  useEffect(() => {
    if (initialStream) {
      startMonitoring(initialStream);
    }

    return () => {
      stopMonitoring();
    };
  }, [initialStream, startMonitoring, stopMonitoring]);

  return {
    level,
    isSpeaking,
    peakLevel,
    startMonitoring,
    stopMonitoring,
  };
}

/**
 * Hook for voice activation detection
 */
interface UseVoiceActivationOptions {
  stream?: MediaStream | null;
  threshold?: number; // 0-100
  holdTime?: number; // ms to hold speaking state after level drops
  onSpeakingStart?: () => void;
  onSpeakingEnd?: () => void;
}

interface UseVoiceActivationReturn {
  isSpeaking: boolean;
  audioLevel: number;
  setThreshold: (threshold: number) => void;
}

export function useVoiceActivation(
  options: UseVoiceActivationOptions = {}
): UseVoiceActivationReturn {
  const {
    stream,
    threshold: initialThreshold = 40,
    holdTime = 200,
    onSpeakingStart,
    onSpeakingEnd,
  } = options;

  const [threshold, setThreshold] = useState(initialThreshold);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasSpeakingRef = useRef(false);

  const { level } = useAudioLevel({ stream });

  useEffect(() => {
    const isAboveThreshold = level > threshold;

    if (isAboveThreshold) {
      // Clear any pending timeout
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
        holdTimeoutRef.current = null;
      }

      if (!wasSpeakingRef.current) {
        wasSpeakingRef.current = true;
        setIsSpeaking(true);
        onSpeakingStart?.();
      }
    } else if (wasSpeakingRef.current) {
      // Start hold timer
      if (!holdTimeoutRef.current) {
        holdTimeoutRef.current = setTimeout(() => {
          wasSpeakingRef.current = false;
          setIsSpeaking(false);
          onSpeakingEnd?.();
          holdTimeoutRef.current = null;
        }, holdTime);
      }
    }
  }, [level, threshold, holdTime, onSpeakingStart, onSpeakingEnd]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
      }
    };
  }, []);

  return {
    isSpeaking,
    audioLevel: level,
    setThreshold,
  };
}
