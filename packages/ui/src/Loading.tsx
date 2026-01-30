import * as React from "react";
import { cn } from "./lib/utils";

/**
 * Loading components with SPARC design system styling
 * Includes Spinner, Skeleton, and LoadingDots
 * 
 * @example
 * ```tsx
 * <Spinner size="md" />
 * <Skeleton width={200} height={24} />
 * <Skeleton variant="circular" size={48} />
 * <LoadingDots />
 * ```
 */

// ============================================================================
// SPINNER
// ============================================================================

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Size of the spinner */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Custom color (defaults to bronze) */
  color?: "bronze" | "white" | "muted";
}

export function Spinner({
  size = "md",
  color = "bronze",
  className,
  ...props
}: SpinnerProps) {
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const colors = {
    bronze: "text-bronze",
    white: "text-white",
    muted: "text-muted",
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("inline-block animate-spin", sizes[size], colors[color], className)}
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="10" className="opacity-25" />
        <path d="M12 2a10 10 0 0 1 10 10" className="opacity-75" />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// ============================================================================
// SKELETON
// ============================================================================

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Variant of the skeleton shape */
  variant?: "rectangular" | "circular" | "text";
  /** Width (number for px, string for any CSS value) */
  width?: number | string;
  /** Height (number for px, string for any CSS value) */
  height?: number | string;
  /** Size for circular variant */
  size?: number;
  /** Number of text lines (for variant="text") */
  lines?: number;
  /** Whether to animate */
  animate?: boolean;
}

export function Skeleton({
  variant = "rectangular",
  width,
  height,
  size,
  lines = 1,
  animate = true,
  className,
  style,
  ...props
}: SkeletonProps) {
  const baseStyles = cn(
    "bg-surface-elevated",
    animate && "animate-pulse",
    className
  );

  const getSize = (value: number | string | undefined) => {
    if (value === undefined) return undefined;
    return typeof value === "number" ? `${value}px` : value;
  };

  if (variant === "circular") {
    const circularSize = size || 40;
    return (
      <div
        className={cn(baseStyles, "rounded-full")}
        style={{
          width: circularSize,
          height: circularSize,
          ...style,
        }}
        {...props}
      />
    );
  }

  if (variant === "text") {
    return (
      <div className="space-y-2" {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseStyles, "rounded h-4")}
            style={{
              width: i === lines - 1 && lines > 1 ? "60%" : width || "100%",
              ...style,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseStyles, "rounded")}
      style={{
        width: getSize(width) || "100%",
        height: getSize(height) || "1rem",
        ...style,
      }}
      {...props}
    />
  );
}

// ============================================================================
// LOADING DOTS
// ============================================================================

export interface LoadingDotsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Size of the dots */
  size?: "sm" | "md" | "lg";
  /** Color of the dots */
  color?: "bronze" | "white" | "muted";
}

export function LoadingDots({
  size = "md",
  color = "bronze",
  className,
  ...props
}: LoadingDotsProps) {
  const sizes = {
    sm: "w-1 h-1",
    md: "w-1.5 h-1.5",
    lg: "w-2 h-2",
  };

  const colors = {
    bronze: "bg-bronze",
    white: "bg-white",
    muted: "bg-muted",
  };

  const gaps = {
    sm: "gap-1",
    md: "gap-1.5",
    lg: "gap-2",
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("inline-flex items-center", gaps[size], className)}
      {...props}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            "rounded-full",
            sizes[size],
            colors[color],
            "animate-bounce"
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: "0.6s",
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// ============================================================================
// LOADING OVERLAY
// ============================================================================

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the overlay is visible */
  visible?: boolean;
  /** Text to display below spinner */
  text?: string;
  /** Whether to blur the background */
  blur?: boolean;
}

export function LoadingOverlay({
  visible = true,
  text,
  blur = false,
  className,
  ...props
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-50",
        "flex flex-col items-center justify-center",
        "bg-surface-base/80",
        blur && "backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <Spinner size="lg" />
      {text && (
        <p className="mt-4 text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
}

// ============================================================================
// CARD SKELETON
// ============================================================================

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-surface-card border border-surface-divider rounded-lg p-6",
        className
      )}
    >
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" size={48} />
        <div className="flex-1">
          <Skeleton height={20} width="60%" className="mb-2" />
          <Skeleton height={14} width="40%" />
        </div>
      </div>
      <Skeleton variant="text" lines={3} />
      <div className="flex gap-3 mt-4">
        <Skeleton height={36} width={100} className="rounded-md" />
        <Skeleton height={36} width={100} className="rounded-md" />
      </div>
    </div>
  );
}
