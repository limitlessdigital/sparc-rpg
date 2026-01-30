"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export interface HPChange {
  id: string;
  amount: number;
  type: "damage" | "heal";
  targetId: string;
  targetName: string;
  critical?: boolean;
}

export interface HPChangeDisplayProps {
  /** HP changes to display */
  changes: HPChange[];
  /** Duration to show each change (ms) */
  duration?: number;
  /** Custom class name */
  className?: string;
}

function HPChangePopup({
  change,
  onComplete,
}: {
  change: HPChange;
  onComplete: () => void;
}) {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 300); // Wait for fade out
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const isDamage = change.type === "damage";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-lg",
        "animate-in zoom-in-50 slide-in-from-bottom-4",
        "transition-opacity duration-300",
        !visible && "opacity-0",
        isDamage ? "bg-error text-white" : "bg-success text-white",
        change.critical && "ring-2 ring-gold ring-offset-2 ring-offset-surface-bg"
      )}
    >
      <span className="text-xl">
        {isDamage ? "💥" : "💚"}
      </span>
      <span>
        {isDamage ? "-" : "+"}
        {change.amount}
      </span>
      {change.critical && (
        <span className="text-xs ml-1">CRIT!</span>
      )}
    </div>
  );
}

export function HPChangeDisplay({
  changes,
  className,
}: HPChangeDisplayProps) {
  const [activeChanges, setActiveChanges] = React.useState<HPChange[]>([]);

  React.useEffect(() => {
    // Add new changes
    setActiveChanges((prev) => {
      const newChanges = changes.filter(
        (c) => !prev.some((p) => p.id === c.id)
      );
      return [...prev, ...newChanges];
    });
  }, [changes]);

  const handleComplete = React.useCallback((id: string) => {
    setActiveChanges((prev) => prev.filter((c) => c.id !== id));
  }, []);

  if (activeChanges.length === 0) return null;

  return (
    <div className={cn("fixed inset-0 pointer-events-none z-50", className)}>
      <div className="relative w-full h-full">
        {activeChanges.map((change) => (
          <div
            key={change.id}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <HPChangePopup
              change={change}
              onComplete={() => handleComplete(change.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Individual HP change for inline display
export function InlineHPChange({
  amount,
  type,
  critical,
  className,
}: {
  amount: number;
  type: "damage" | "heal";
  critical?: boolean;
  className?: string;
}) {
  const isDamage = type === "damage";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-bold",
        isDamage ? "text-error" : "text-success",
        critical && "animate-pulse",
        className
      )}
    >
      {isDamage ? "💥" : "💚"}
      <span>
        {isDamage ? "-" : "+"}
        {amount}
      </span>
      {critical && <span className="text-gold text-xs">✨</span>}
    </span>
  );
}

// Animated HP bar that shows changes
export function AnimatedHPBar({
  current,
  max,
  previousCurrent,
  showChange = true,
  size = "md",
  className,
}: {
  current: number;
  max: number;
  previousCurrent?: number;
  showChange?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [displayCurrent, setDisplayCurrent] = React.useState(current);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const percentage = Math.max(0, Math.min(100, (displayCurrent / max) * 100));
  const change = previousCurrent !== undefined ? current - previousCurrent : 0;
  const isDamage = change < 0;

  // Animate HP change
  React.useEffect(() => {
    if (previousCurrent === undefined || previousCurrent === current) {
      setDisplayCurrent(current);
      return;
    }

    setIsAnimating(true);
    const duration = 500;
    const startTime = Date.now();
    const startValue = previousCurrent;
    const endValue = current;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const value = startValue + (endValue - startValue) * eased;
      
      setDisplayCurrent(Math.round(value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [current, previousCurrent]);

  const heights = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">HP</span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-bold tabular-nums transition-colors",
              percentage > 50 ? "text-success" : percentage > 25 ? "text-warning" : "text-error",
              isAnimating && (isDamage ? "animate-pulse text-error" : "animate-pulse text-success")
            )}
          >
            {displayCurrent}/{max}
          </span>
          {showChange && change !== 0 && isAnimating && (
            <InlineHPChange
              amount={Math.abs(change)}
              type={isDamage ? "damage" : "heal"}
            />
          )}
        </div>
      </div>
      <div className={cn(
        "bg-surface-divider rounded-full overflow-hidden",
        heights[size]
      )}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            percentage > 50 ? "bg-success" : percentage > 25 ? "bg-warning" : "bg-error",
            isAnimating && (isDamage ? "animate-pulse" : "")
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
