/**
 * Video Grid - Responsive grid layout for video participants
 */

import * as React from 'react';
import { useMemo } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ParticipantTile } from './ParticipantTile';
import type { VideoGridProps, VoiceParticipant } from '../types';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type GridLayout = 'grid' | 'spotlight' | 'sidebar';

interface GridConfig {
  columns: number;
  rows: number;
  className: string;
}

// Calculate optimal grid configuration based on participant count
function getGridConfig(count: number): GridConfig {
  if (count <= 1) {
    return { columns: 1, rows: 1, className: 'grid-cols-1' };
  }
  if (count === 2) {
    return { columns: 2, rows: 1, className: 'grid-cols-2' };
  }
  if (count <= 4) {
    return { columns: 2, rows: 2, className: 'grid-cols-2' };
  }
  if (count <= 6) {
    return { columns: 3, rows: 2, className: 'grid-cols-3' };
  }
  if (count <= 9) {
    return { columns: 3, rows: 3, className: 'grid-cols-3' };
  }
  return { columns: 4, rows: 3, className: 'grid-cols-4' };
}

export function VideoGrid({
  participants,
  localParticipant,
  layout = 'grid',
  screenShareTrack,
  className,
  onPinParticipant,
}: VideoGridProps) {
  // Combine local and remote participants
  const allParticipants = useMemo(() => {
    const list: VoiceParticipant[] = [];
    if (localParticipant) {
      list.push(localParticipant);
    }
    list.push(...participants);
    return list;
  }, [localParticipant, participants]);

  // Find the participant sharing screen
  const screenSharer = useMemo(
    () => allParticipants.find((p) => p.screenShareEnabled),
    [allParticipants]
  );

  // Determine effective layout
  const effectiveLayout: GridLayout = screenSharer ? 'spotlight' : layout;

  // Get grid configuration
  const gridConfig = useMemo(
    () => getGridConfig(allParticipants.length),
    [allParticipants.length]
  );

  if (allParticipants.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg bg-slate-900 p-8',
          className
        )}
      >
        <p className="text-slate-400">No participants connected</p>
      </div>
    );
  }

  // Spotlight layout (screen share or pinned participant)
  if (effectiveLayout === 'spotlight') {
    const spotlightParticipant = screenSharer || allParticipants[0];
    const sidebarParticipants = allParticipants.filter(
      (p) => p.id !== spotlightParticipant?.id
    );

    return (
      <div className={cn('flex h-full gap-2', className)}>
        {/* Main spotlight view */}
        <div className="flex-1">
          {spotlightParticipant && (
            <div className="h-full">
              {screenShareTrack ? (
                <ScreenShareView track={screenShareTrack} />
              ) : (
                <ParticipantTile
                  participant={spotlightParticipant}
                  isLocal={spotlightParticipant.id === localParticipant?.id}
                  isPinned
                  className="h-full"
                />
              )}
            </div>
          )}
        </div>

        {/* Sidebar with other participants */}
        {sidebarParticipants.length > 0 && (
          <div className="flex w-48 flex-col gap-2 overflow-y-auto">
            {sidebarParticipants.map((participant) => (
              <ParticipantTile
                key={participant.id}
                participant={participant}
                isLocal={participant.id === localParticipant?.id}
                onClick={() => onPinParticipant?.(participant.id)}
                className="flex-shrink-0"
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Sidebar layout
  if (effectiveLayout === 'sidebar') {
    return (
      <div className={cn('flex h-full gap-2', className)}>
        {/* Main content area */}
        <div className="flex-1 rounded-lg bg-slate-900" />

        {/* Sidebar with participants */}
        <div className="flex w-48 flex-col gap-2 overflow-y-auto">
          {allParticipants.map((participant) => (
            <ParticipantTile
              key={participant.id}
              participant={participant}
              isLocal={participant.id === localParticipant?.id}
              onClick={() => onPinParticipant?.(participant.id)}
              className="flex-shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }

  // Default grid layout
  return (
    <div
      className={cn(
        'grid h-full gap-2 p-2',
        gridConfig.className,
        className
      )}
    >
      {allParticipants.map((participant) => (
        <ParticipantTile
          key={participant.id}
          participant={participant}
          isLocal={participant.id === localParticipant?.id}
          onClick={() => onPinParticipant?.(participant.id)}
        />
      ))}
    </div>
  );
}

// Screen share view component
function ScreenShareView({ track }: { track: MediaStreamTrack }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current && track) {
      const stream = new MediaStream([track]);
      videoRef.current.srcObject = stream;
    }
  }, [track]);

  return (
    <div className="relative h-full w-full rounded-lg bg-slate-900">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full object-contain"
      />
      <div className="absolute left-2 top-2 rounded bg-green-500 px-2 py-1 text-xs font-medium text-white">
        Screen Share
      </div>
    </div>
  );
}

// Audio-only participant strip (when no video is being used)
export function AudioOnlyStrip({
  participants,
  localParticipant,
  className,
}: Omit<VideoGridProps, 'layout' | 'screenShareTrack' | 'onPinParticipant'>) {
  const allParticipants = useMemo(() => {
    const list: VoiceParticipant[] = [];
    if (localParticipant) {
      list.push(localParticipant);
    }
    list.push(...participants);
    return list;
  }, [localParticipant, participants]);

  return (
    <div className={cn('flex flex-wrap items-center gap-2 p-2', className)}>
      {allParticipants.map((participant) => (
        <div
          key={participant.id}
          className={cn(
            'flex items-center gap-2 rounded-full bg-slate-700 px-3 py-1.5',
            participant.isSpeaking && 'ring-2 ring-green-500'
          )}
        >
          {/* Avatar */}
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-xs font-medium text-white'
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

          {/* Name */}
          <span className="text-sm font-medium text-white">
            {participant.displayName}
          </span>

          {/* Speaking indicator */}
          {participant.isSpeaking && (
            <div className="flex items-end gap-0.5">
              <div className="h-2 w-0.5 animate-pulse rounded-full bg-green-500" style={{ animationDelay: '0ms' }} />
              <div className="h-3 w-0.5 animate-pulse rounded-full bg-green-500" style={{ animationDelay: '150ms' }} />
              <div className="h-2 w-0.5 animate-pulse rounded-full bg-green-500" style={{ animationDelay: '300ms' }} />
            </div>
          )}

          {/* Muted indicator */}
          {!participant.audioEnabled && (
            <svg className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          )}
        </div>
      ))}
    </div>
  );
}
