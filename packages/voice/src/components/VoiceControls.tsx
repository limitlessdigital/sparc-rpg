/**
 * Voice Controls - Main control bar for voice/video chat
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useVoiceStore } from '../stores/voice-store';
import type { VoiceControlsProps } from '../types';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Icons
const MicrophoneIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
    />
  </svg>
);

const MicrophoneOffIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
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
);

const VideoCameraIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const VideoCameraOffIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
    />
  </svg>
);

const ScreenShareIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const PhoneXIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
    />
  </svg>
);

interface VoiceControlButtonProps {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  danger?: boolean;
  children: React.ReactNode;
  label: string;
  className?: string;
}

function VoiceControlButton({
  onClick,
  disabled,
  active,
  danger,
  children,
  label,
  className,
}: VoiceControlButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full transition-all',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        disabled && 'cursor-not-allowed opacity-50',
        danger
          ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
          : active
            ? 'bg-slate-700 text-white hover:bg-slate-600 focus:ring-slate-500'
            : 'bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-500',
        className
      )}
    >
      {children}
    </button>
  );
}

export function VoiceControls({
  className,
  compact = false,
  onLeave,
}: Omit<VoiceControlsProps, 'sessionId'>) {
  const {
    isConnected,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    localParticipant,
    isRecording,
    openSettings,
    setAudioEnabled,
    setVideoEnabled,
    setScreenSharing,
  } = useVoiceStore();

  const participants = useVoiceStore((state) =>
    Array.from(state.participants.values())
  );

  const handleToggleMute = () => {
    setAudioEnabled(!isAudioEnabled);
  };

  const handleToggleVideo = () => {
    setVideoEnabled(!isVideoEnabled);
  };

  const handleToggleScreenShare = () => {
    setScreenSharing(!isScreenSharing);
  };

  const handleLeave = () => {
    onLeave?.();
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg bg-slate-100 p-2',
        compact ? 'flex-wrap' : 'flex-nowrap',
        className
      )}
    >
      {/* Connection Status */}
      <div className="flex items-center gap-2 px-2">
        <div className="flex h-2 w-2 rounded-full bg-green-500" />
        <span className="text-sm text-slate-600">
          {participants.length + 1} connected
        </span>
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center gap-1 px-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          <span className="text-sm font-medium text-red-600">REC</span>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Participant Avatars */}
      {!compact && (
        <div className="flex -space-x-2">
          {participants.slice(0, 5).map((participant) => (
            <div
              key={participant.id}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-300 text-xs font-medium',
                participant.isSpeaking && 'ring-2 ring-green-500'
              )}
              title={participant.displayName}
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
          ))}
          {participants.length > 5 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-400 text-xs font-medium text-white">
              +{participants.length - 5}
            </div>
          )}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        {/* Mute/Unmute */}
        <VoiceControlButton
          onClick={handleToggleMute}
          active={!isAudioEnabled}
          label={isAudioEnabled ? 'Mute' : 'Unmute'}
        >
          {isAudioEnabled ? (
            <MicrophoneIcon className="h-5 w-5" />
          ) : (
            <MicrophoneOffIcon className="h-5 w-5" />
          )}
        </VoiceControlButton>

        {/* Video On/Off */}
        <VoiceControlButton
          onClick={handleToggleVideo}
          active={!isVideoEnabled}
          label={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled ? (
            <VideoCameraIcon className="h-5 w-5" />
          ) : (
            <VideoCameraOffIcon className="h-5 w-5" />
          )}
        </VoiceControlButton>

        {/* Screen Share (Seer only) */}
        {localParticipant?.isSeer && (
          <VoiceControlButton
            onClick={handleToggleScreenShare}
            active={isScreenSharing}
            label={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <ScreenShareIcon className="h-5 w-5" />
          </VoiceControlButton>
        )}

        {/* Settings */}
        <VoiceControlButton onClick={openSettings} label="Settings">
          <SettingsIcon className="h-5 w-5" />
        </VoiceControlButton>

        {/* Leave */}
        <VoiceControlButton onClick={handleLeave} danger label="Leave voice">
          <PhoneXIcon className="h-5 w-5" />
        </VoiceControlButton>
      </div>
    </div>
  );
}
