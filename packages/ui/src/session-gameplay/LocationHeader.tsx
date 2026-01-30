"use client";

import { cn } from "../lib/utils";

export interface LocationHeaderProps {
  /** Location name */
  title: string;
  /** Optional subtitle (e.g., "Challenge", "Combat") */
  subtitle?: string;
  /** Node type for styling */
  nodeType?: "story" | "decision" | "challenge" | "combat";
  /** Show compass icon */
  showCompass?: boolean;
  /** On compass click */
  onCompassClick?: () => void;
  /** Custom class name */
  className?: string;
}

export function LocationHeader({
  title,
  subtitle,
  nodeType = "story",
  showCompass = true,
  onCompassClick,
  className,
}: LocationHeaderProps) {
  const typeColors: Record<string, string> = {
    story: "text-info",
    decision: "text-wit",
    challenge: "text-gold",
    combat: "text-error",
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center py-3 px-4",
        "bg-gradient-to-r from-[#0a1628] via-[#0d1f35] to-[#0a1628]",
        "border-b border-[#1a3a5c]/50",
        className
      )}
    >
      {/* Left decorative element */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-16 h-[1px] bg-gradient-to-r from-transparent to-[#2a4a6c]" />

      {/* Center content */}
      <div className="text-center">
        {subtitle && (
          <span className={cn(
            "block text-[10px] uppercase tracking-[0.2em] font-medium mb-0.5",
            typeColors[nodeType] || typeColors.story
          )}>
            {subtitle}
          </span>
        )}
        <h1 className="text-lg md:text-xl font-display font-bold text-white tracking-wide">
          {title}
        </h1>
      </div>

      {/* Right decorative element */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-[1px] bg-gradient-to-l from-transparent to-[#2a4a6c]" />

      {/* Compass button (optional) */}
      {showCompass && (
        <button
          type="button"
          onClick={onCompassClick}
          className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2",
            "w-8 h-8 rounded-full",
            "bg-[#1a3a5c]/50 hover:bg-[#2a4a6c]/70",
            "border border-[#3a5a7c]/50 hover:border-bronze-400",
            "flex items-center justify-center",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-bronze-400/50"
          )}
          aria-label="Open map"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#6a9acc]"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
        </button>
      )}

      {/* Bottom shine effect */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-[#4a7aa0]/50 to-transparent" />
    </div>
  );
}
