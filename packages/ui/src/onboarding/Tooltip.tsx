"use client";

/**
 * @sparc/ui Tooltip Components
 * 
 * Based on PRD 15: Onboarding Tutorial
 * Tooltip and contextual help components for the tutorial and general app use.
 */

import * as React from "react";
import { cn } from "../lib/utils";
import type { TooltipProps, TooltipPosition, ContextualHelpProps } from "./types";

// =============================================================================
// Position Utilities
// =============================================================================

const positionStyles: Record<TooltipPosition, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrowStyles: Record<TooltipPosition, string> = {
  top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-surface-elevated",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-surface-elevated",
  left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-surface-elevated",
  right: "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-surface-elevated",
};

// =============================================================================
// Tooltip Component
// =============================================================================

export function Tooltip({
  content,
  position = "top",
  open: controlledOpen,
  onOpenChange,
  trigger,
  children,
  showArrow = true,
  dismissible = false,
  className,
}: TooltipProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleOpen = (open: boolean) => {
    if (!isControlled) {
      setInternalOpen(open);
    }
    onOpenChange?.(open);
  };

  const handleMouseEnter = () => !isControlled && handleOpen(true);
  const handleMouseLeave = () => !isControlled && handleOpen(false);
  const handleFocus = () => !isControlled && handleOpen(true);
  const handleBlur = () => !isControlled && handleOpen(false);

  const triggerElement = trigger || children;

  return (
    <div className="relative inline-block">
      {/* Trigger */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {triggerElement}
      </div>

      {/* Tooltip Content */}
      {isOpen && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 pointer-events-none",
            positionStyles[position],
            "animate-in fade-in-0 zoom-in-95 duration-100",
            className
          )}
        >
          <div
            className={cn(
              "px-3 py-2 rounded-lg",
              "bg-surface-elevated text-foreground text-sm",
              "shadow-lg border border-border-default",
              "max-w-xs"
            )}
          >
            {content}
            {dismissible && (
              <button
                onClick={() => handleOpen(false)}
                className="ml-2 text-muted-foreground hover:text-foreground"
                aria-label="Dismiss"
              >
                ×
              </button>
            )}
          </div>
          
          {/* Arrow */}
          {showArrow && (
            <div
              className={cn(
                "absolute w-0 h-0 border-8",
                arrowStyles[position]
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Tutorial Tooltip (Styled for tutorials)
// =============================================================================

export interface TutorialTooltipProps {
  content: React.ReactNode;
  position?: TooltipPosition;
  step?: number;
  totalSteps?: number;
  onNext?: () => void;
  onDismiss?: () => void;
  children: React.ReactNode;
  open?: boolean;
  className?: string;
}

export function TutorialTooltip({
  content,
  position = "bottom",
  step,
  totalSteps,
  onNext,
  onDismiss,
  children,
  open = true,
  className,
}: TutorialTooltipProps) {
  if (!open) return <>{children}</>;

  return (
    <div className="relative inline-block">
      {/* Highlight ring */}
      <div className="relative">
        <div className="absolute -inset-2 rounded-lg ring-2 ring-bronze ring-offset-2 ring-offset-surface-base animate-pulse" />
        {children}
      </div>

      {/* Tooltip */}
      <div
        role="tooltip"
        className={cn(
          "absolute z-50",
          positionStyles[position],
          "animate-in fade-in-0 slide-in-from-bottom-2 duration-200",
          className
        )}
      >
        <div
          className={cn(
            "p-4 rounded-xl",
            "bg-surface-elevated text-foreground",
            "shadow-xl border-2 border-bronze/50",
            "min-w-[250px] max-w-sm"
          )}
        >
          {/* Content */}
          <div className="text-sm leading-relaxed mb-3">{content}</div>

          {/* Footer with step indicator and actions */}
          <div className="flex items-center justify-between">
            {step && totalSteps && (
              <span className="text-xs text-muted-foreground">
                {step} of {totalSteps}
              </span>
            )}
            
            <div className="flex items-center gap-2 ml-auto">
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Got it
                </button>
              )}
              {onNext && (
                <button
                  onClick={onNext}
                  className="px-3 py-1 text-xs font-medium rounded bg-bronze text-white hover:brightness-110"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div
          className={cn(
            "absolute w-0 h-0 border-8",
            arrowStyles[position]
          )}
        />
      </div>
    </div>
  );
}

// =============================================================================
// Contextual Help (Self-dismissing hints)
// =============================================================================

const DISMISSED_HINTS_KEY = "sparc-dismissed-hints";

function getDismissedHints(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(DISMISSED_HINTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function dismissHint(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const dismissed = getDismissedHints();
    if (!dismissed.includes(id)) {
      dismissed.push(id);
      localStorage.setItem(DISMISSED_HINTS_KEY, JSON.stringify(dismissed));
    }
  } catch {
    // Ignore storage errors
  }
}

export function ContextualHelp({
  id,
  content,
  position = "top",
  children,
  autoShow = false,
  dismissKey,
}: ContextualHelpProps) {
  const [show, setShow] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const key = dismissKey || `hint-${id}`;

  React.useEffect(() => {
    const alreadyDismissed = getDismissedHints().includes(key);
    setDismissed(alreadyDismissed);
    
    if (autoShow && !alreadyDismissed) {
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [key, autoShow]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    dismissHint(key);
  };

  if (dismissed && !show) {
    return <>{children}</>;
  }

  return (
    <Tooltip
      content={
        <div className="flex items-start gap-2">
          <span>💡</span>
          <span>{content}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="ml-2 text-muted-foreground hover:text-foreground text-xs"
            aria-label="Dismiss hint"
          >
            ×
          </button>
        </div>
      }
      position={position}
      open={show}
      onOpenChange={setShow}
      showArrow
    >
      {children}
    </Tooltip>
  );
}

// =============================================================================
// Help Icon Button
// =============================================================================

export interface HelpIconProps {
  content: string;
  position?: TooltipPosition;
  size?: "sm" | "md";
}

export function HelpIcon({ content, position = "top", size = "sm" }: HelpIconProps) {
  const sizeClasses = {
    sm: "w-4 h-4 text-xs",
    md: "w-5 h-5 text-sm",
  };

  return (
    <Tooltip content={content} position={position}>
      <button
        type="button"
        className={cn(
          "inline-flex items-center justify-center",
          "rounded-full bg-muted text-muted-foreground",
          "hover:bg-bronze/20 hover:text-bronze",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze",
          "transition-colors cursor-help",
          sizeClasses[size]
        )}
        aria-label="Help"
      >
        ?
      </button>
    </Tooltip>
  );
}

// =============================================================================
// Exports
// =============================================================================

export type { TooltipProps, ContextualHelpProps } from "./types";
