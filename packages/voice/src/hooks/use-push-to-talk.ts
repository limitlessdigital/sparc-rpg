/**
 * Hook for push-to-talk functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePushToTalkOptions {
  key?: string; // Keyboard key code (e.g., 'Space', 'KeyT')
  onStart?: () => void;
  onEnd?: () => void;
  enabled?: boolean;
}

interface UsePushToTalkReturn {
  isPressed: boolean;
  isPushToTalkEnabled: boolean;
  setKey: (key: string) => void;
  setEnabled: (enabled: boolean) => void;
}

export function usePushToTalk(
  options: UsePushToTalkOptions = {}
): UsePushToTalkReturn {
  const {
    key = 'Space',
    onStart,
    onEnd,
    enabled = true,
  } = options;

  const [currentKey, setCurrentKey] = useState(key);
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [isPressed, setIsPressed] = useState(false);
  const isPressedRef = useRef(false);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled) return;

      // Check if the pressed key matches
      if (event.code === currentKey && !isPressedRef.current) {
        // Prevent default behavior (e.g., space scrolling)
        event.preventDefault();

        isPressedRef.current = true;
        setIsPressed(true);
        onStart?.();
      }
    },
    [currentKey, isEnabled, onStart]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled) return;

      if (event.code === currentKey && isPressedRef.current) {
        event.preventDefault();

        isPressedRef.current = false;
        setIsPressed(false);
        onEnd?.();
      }
    },
    [currentKey, isEnabled, onEnd]
  );

  // Handle window blur (release key when window loses focus)
  const handleBlur = useCallback(() => {
    if (isPressedRef.current) {
      isPressedRef.current = false;
      setIsPressed(false);
      onEnd?.();
    }
  }, [onEnd]);

  useEffect(() => {
    if (!isEnabled) return;

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isEnabled, handleKeyDown, handleKeyUp, handleBlur]);

  return {
    isPressed,
    isPushToTalkEnabled: isEnabled,
    setKey: setCurrentKey,
    setEnabled: setIsEnabled,
  };
}

/**
 * Hook for mobile push-to-talk (touch-based)
 */
interface UseMobilePushToTalkOptions {
  onStart?: () => void;
  onEnd?: () => void;
  enabled?: boolean;
}

interface UseMobilePushToTalkReturn {
  isPressed: boolean;
  bind: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    onMouseLeave: (e: React.MouseEvent) => void;
  };
}

export function useMobilePushToTalk(
  options: UseMobilePushToTalkOptions = {}
): UseMobilePushToTalkReturn {
  const { onStart, onEnd, enabled = true } = options;

  const [isPressed, setIsPressed] = useState(false);
  const isPressedRef = useRef(false);

  const handleStart = useCallback(() => {
    if (!enabled || isPressedRef.current) return;

    isPressedRef.current = true;
    setIsPressed(true);
    onStart?.();
  }, [enabled, onStart]);

  const handleEnd = useCallback(() => {
    if (!enabled || !isPressedRef.current) return;

    isPressedRef.current = false;
    setIsPressed(false);
    onEnd?.();
  }, [enabled, onEnd]);

  const bind = {
    onTouchStart: (_e: React.TouchEvent) => {
      handleStart();
    },
    onTouchEnd: (_e: React.TouchEvent) => {
      handleEnd();
    },
    onMouseDown: (_e: React.MouseEvent) => {
      handleStart();
    },
    onMouseUp: (_e: React.MouseEvent) => {
      handleEnd();
    },
    onMouseLeave: (_e: React.MouseEvent) => {
      handleEnd();
    },
  };

  return {
    isPressed,
    bind,
  };
}
