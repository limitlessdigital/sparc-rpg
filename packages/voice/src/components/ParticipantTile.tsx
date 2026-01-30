/**
 * Participant Tile - Individual video/audio participant display
 */

import { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ParticipantTileProps } from '../types';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Connection quality indicator
function ConnectionQualityIndicator({
  quality,
}: {
  quality: 'excellent' | 'good' | 'poor' | 'disconnected';
}) {
  const bars = quality === 'excellent' ? 4 : quality === 'good' ? 3 : quality === 'poor' ? 1 : 0;
  
  return (
    <div className="flex items-end gap-0.5" title={`Connection: ${quality}`}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            'w-1 rounded-sm transition-colors',
            i <= bars ? 'bg-green-500' : 'bg-slate-300',
            i === 1 && 'h-1',
            i === 2 && 'h-2',
            i === 3 && 'h-3',
            i === 4 && 'h-4'
          )}
        />
      ))}
    </div>
  );
}

// Microphone indicator
function MicrophoneIndicator({
  enabled,
  isSpeaking,
}: {
  enabled: boolean;
  isSpeaking: boolean;
}) {
  if (!enabled) {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-full transition-colors',
        isSpeaking ? 'bg-green-500' : 'bg-slate-600'
      )}
    >
      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
    </div>
  );
}

// Speaking animation ring
function SpeakingRing({ isSpeaking }: { isSpeaking: boolean }) {
  if (!isSpeaking) return null;

  return (
    <div className="absolute inset-0 animate-pulse rounded-lg ring-2 ring-green-500 ring-opacity-75" />
  );
}

export function ParticipantTile({
  participant,
  isLocal = false,
  isPinned = false,
  isSpeaking = false,
  showVideo = true,
  videoTrack,
  audioTrack,
  className,
  onClick,
}: ParticipantTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Attach video track
  useEffect(() => {
    if (videoRef.current && videoTrack && showVideo) {
      const stream = new MediaStream([videoTrack]);
      videoRef.current.srcObject = stream;
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [videoTrack, showVideo]);

  // Attach audio track (only for remote participants)
  useEffect(() => {
    if (!isLocal && audioRef.current && audioTrack) {
      const stream = new MediaStream([audioTrack]);
      audioRef.current.srcObject = stream;
    } else if (audioRef.current) {
      audioRef.current.srcObject = null;
    }
  }, [audioTrack, isLocal]);

  const showVideoFeed = showVideo && participant.videoEnabled && videoTrack;

  return (
    <div
      className={cn(
        'relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-slate-800',
        isPinned && 'ring-2 ring-blue-500',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Speaking Ring Animation */}
      <SpeakingRing isSpeaking={isSpeaking || participant.isSpeaking} />

      {/* Video Feed */}
      {showVideoFeed ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="h-full w-full object-cover"
        />
      ) : (
        /* Avatar Fallback */
        <div className="flex flex-col items-center justify-center gap-2">
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-full bg-slate-600 text-2xl font-semibold text-white',
              (isSpeaking || participant.isSpeaking) && 'ring-2 ring-green-500'
            )}
          >
            {participant.avatarUrl ? (
              <img
                src={participant.avatarUrl}
                alt={participant.displayName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              participant.displayName.slice(0, 2).toUpperCase()
            )}
          </div>
        </div>
      )}

      {/* Hidden audio element for remote participants */}
      {!isLocal && <audio ref={audioRef} autoPlay />}

      {/* Overlay Info */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-2">
        <div className="flex items-center gap-2">
          {/* Seer Badge */}
          {participant.isSeer && (
            <span className="rounded bg-amber-500 px-1.5 py-0.5 text-xs font-medium text-white">
              Seer
            </span>
          )}
          
          {/* Name */}
          <span className="text-sm font-medium text-white">
            {participant.displayName}
            {isLocal && ' (You)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection Quality */}
          <ConnectionQualityIndicator quality={participant.connectionQuality} />

          {/* Microphone Status */}
          <MicrophoneIndicator
            enabled={participant.audioEnabled}
            isSpeaking={isSpeaking || participant.isSpeaking}
          />
        </div>
      </div>

      {/* Pin Indicator */}
      {isPinned && (
        <div className="absolute right-2 top-2 rounded bg-blue-500 px-1.5 py-0.5 text-xs font-medium text-white">
          Pinned
        </div>
      )}

      {/* Screen Share Indicator */}
      {participant.screenShareEnabled && (
        <div className="absolute left-2 top-2 rounded bg-green-500 px-1.5 py-0.5 text-xs font-medium text-white">
          Sharing
        </div>
      )}
    </div>
  );
}
