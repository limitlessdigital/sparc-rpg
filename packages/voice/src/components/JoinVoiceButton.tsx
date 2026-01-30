/**
 * Join Voice Button - Button to join voice chat with permission handling
 */

import { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useMediaDevices } from '../hooks/use-media-devices';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface JoinVoiceButtonProps {
  onJoin: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

type PermissionState = 'idle' | 'requesting' | 'granted' | 'denied';

export function JoinVoiceButton({
  onJoin,
  disabled = false,
  className,
}: JoinVoiceButtonProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState>('idle');
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);

  const { requestPermissions, hasPermission, permissionDenied: _permissionDenied } = useMediaDevices({
    autoEnumerate: false,
  });

  const handleJoin = async () => {
    if (isJoining || disabled) return;

    // Check if we need permissions
    if (!hasPermission) {
      setPermissionState('requesting');
      const result = await requestPermissions(true, false);

      if (!result.audio) {
        setPermissionState('denied');
        setShowPermissionHelp(true);
        return;
      }

      setPermissionState('granted');
    }

    // Join the voice room
    setIsJoining(true);
    try {
      await onJoin();
    } catch (error) {
      console.error('Failed to join voice:', error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleJoin}
        disabled={disabled || isJoining}
        className={cn(
          'flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-all',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          disabled || isJoining
            ? 'cursor-not-allowed bg-slate-200 text-slate-400'
            : 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
          className
        )}
      >
        {isJoining ? (
          <>
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Connecting...
          </>
        ) : permissionState === 'requesting' ? (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            Allow Microphone Access
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            Join Voice
          </>
        )}
      </button>

      {/* Permission Help */}
      {showPermissionHelp && permissionState === 'denied' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Microphone Access Denied</p>
              <p className="mt-1 text-xs text-red-600">
                To join voice chat, you need to allow microphone access. Click the lock icon in your
                browser&apos;s address bar and enable microphone permissions.
              </p>
              <button
                onClick={() => setShowPermissionHelp(false)}
                className="mt-2 text-xs font-medium text-red-700 hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * External Voice Link Card - Button/card to join external voice service
 */
interface ExternalVoiceLinkCardProps {
  url: string;
  provider: 'discord' | 'zoom' | 'google-meet' | 'other';
  label?: string;
  className?: string;
}

export function ExternalVoiceLinkCard({
  url,
  provider,
  label,
  className,
}: ExternalVoiceLinkCardProps) {
  const providerConfig = {
    discord: {
      name: 'Discord',
      icon: '🎮',
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
    zoom: {
      name: 'Zoom',
      icon: '📹',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    'google-meet': {
      name: 'Google Meet',
      icon: '🎥',
      color: 'bg-green-500 hover:bg-green-600',
    },
    other: {
      name: 'External',
      icon: '🔗',
      color: 'bg-slate-500 hover:bg-slate-600',
    },
  };

  const config = providerConfig[provider];

  return (
    <div className={cn('rounded-lg border border-slate-200 bg-slate-50 p-4', className)}>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl">{config.icon}</span>
        <div>
          <h3 className="font-medium text-slate-900">Voice Chat: External Link</h3>
          <p className="text-sm text-slate-500">This session uses {config.name} for voice</p>
        </div>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium text-white transition-colors',
          config.color
        )}
      >
        Open {label || config.name}
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>

      <p className="mt-2 text-center text-xs text-slate-400">
        Built-in voice is disabled when using external links
      </p>
    </div>
  );
}
