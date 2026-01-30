/**
 * Push to Talk Button - Mobile-friendly PTT button
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useMobilePushToTalk } from '../hooks/use-push-to-talk';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface PushToTalkButtonProps {
  onStart: () => void;
  onEnd: () => void;
  enabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PushToTalkButton({
  onStart,
  onEnd,
  enabled = true,
  size = 'md',
  className,
}: PushToTalkButtonProps) {
  const { isPressed, bind } = useMobilePushToTalk({
    onStart,
    onEnd,
    enabled,
  });

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20',
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  return (
    <button
      {...bind}
      disabled={!enabled}
      className={cn(
        'relative flex items-center justify-center rounded-full transition-all',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'select-none touch-none', // Prevent text selection and touch callout
        sizeClasses[size],
        isPressed
          ? 'scale-95 bg-green-500 text-white shadow-lg ring-4 ring-green-300'
          : enabled
            ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-500'
            : 'cursor-not-allowed bg-slate-100 text-slate-400',
        className
      )}
      aria-label={isPressed ? 'Transmitting' : 'Push to talk'}
    >
      {/* Microphone Icon */}
      <svg
        className={cn(iconSizes[size], 'transition-transform', isPressed && 'scale-110')}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>

      {/* Transmitting Animation */}
      {isPressed && (
        <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-75" />
      )}

      {/* Sound Waves */}
      {isPressed && (
        <div className="absolute -right-2 -top-2 flex items-center gap-0.5">
          <div
            className="h-3 w-1 animate-pulse rounded-full bg-green-300"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="h-4 w-1 animate-pulse rounded-full bg-green-300"
            style={{ animationDelay: '100ms' }}
          />
          <div
            className="h-3 w-1 animate-pulse rounded-full bg-green-300"
            style={{ animationDelay: '200ms' }}
          />
        </div>
      )}
    </button>
  );
}

/**
 * Push to Talk Hint - Shows keyboard shortcut hint
 */
interface PushToTalkHintProps {
  keyCode: string;
  isActive?: boolean;
  className?: string;
}

export function PushToTalkHint({ keyCode, isActive, className }: PushToTalkHintProps) {
  // Convert key code to display name
  const displayKey = keyCode
    .replace('Key', '')
    .replace('Space', 'Spacebar')
    .replace('Control', 'Ctrl');

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
        isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600',
        className
      )}
    >
      <svg
        className={cn('h-4 w-4', isActive ? 'text-green-600' : 'text-slate-400')}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
      <span>
        Hold <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-xs">{displayKey}</kbd> to talk
      </span>
      {isActive && (
        <span className="ml-auto flex h-2 w-2">
          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
      )}
    </div>
  );
}
