"use client";

/**
 * @sparc/ui TutorialOverlay
 * 
 * Based on PRD 15: Onboarding Tutorial
 * Full-screen overlay for highlighting elements during the tutorial.
 */

import * as React from "react";
import { cn } from "../lib/utils";
import type { TutorialOverlayProps, HighlightZone, TooltipPosition } from "./types";

// =============================================================================
// Highlight Element Component
// =============================================================================

interface HighlightElementProps {
  zone: HighlightZone;
  onClick?: () => void;
}

function HighlightElement({ zone, onClick }: HighlightElementProps) {
  const [rect, setRect] = React.useState<DOMRect | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const element = document.querySelector(zone.selector);
    if (element) {
      const updateRect = () => {
        const newRect = element.getBoundingClientRect();
        setRect(newRect);
        setVisible(true);
      };
      
      updateRect();
      
      // Update on resize/scroll
      window.addEventListener("resize", updateRect);
      window.addEventListener("scroll", updateRect, true);
      
      return () => {
        window.removeEventListener("resize", updateRect);
        window.removeEventListener("scroll", updateRect, true);
      };
    }
  }, [zone.selector]);

  if (!rect || !visible) return null;

  const padding = 8;
  const tooltipOffset = 12;

  // Calculate tooltip position
  const getTooltipStyle = (position: TooltipPosition): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "absolute",
      zIndex: 52,
    };

    switch (position) {
      case "top":
        return {
          ...base,
          left: rect.left + rect.width / 2,
          top: rect.top - tooltipOffset,
          transform: "translate(-50%, -100%)",
        };
      case "bottom":
        return {
          ...base,
          left: rect.left + rect.width / 2,
          top: rect.bottom + tooltipOffset,
          transform: "translateX(-50%)",
        };
      case "left":
        return {
          ...base,
          left: rect.left - tooltipOffset,
          top: rect.top + rect.height / 2,
          transform: "translate(-100%, -50%)",
        };
      case "right":
        return {
          ...base,
          left: rect.right + tooltipOffset,
          top: rect.top + rect.height / 2,
          transform: "translateY(-50%)",
        };
    }
  };

  return (
    <>
      {/* Highlight cutout */}
      <div
        className={cn(
          "absolute rounded-lg",
          "ring-4 ring-bronze ring-offset-4 ring-offset-transparent",
          "bg-transparent",
          "cursor-pointer",
          "animate-pulse"
        )}
        style={{
          left: rect.left - padding,
          top: rect.top - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
          zIndex: 51,
        }}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onClick?.()}
        aria-label={zone.ariaLabel || zone.message}
      />

      {/* Tooltip */}
      <div
        style={getTooltipStyle(zone.position)}
        className={cn(
          "px-4 py-3 rounded-lg",
          "bg-surface-elevated text-foreground text-sm",
          "shadow-xl border-2 border-bronze/50",
          "max-w-xs",
          "animate-in fade-in-0 duration-200"
        )}
      >
        <p>{zone.message}</p>
        <div className="mt-2 text-xs text-muted-foreground">
          Click to continue
        </div>
      </div>
    </>
  );
}

// =============================================================================
// Spotlight Mask (SVG-based cutout)
// =============================================================================

interface SpotlightMaskProps {
  highlights: HighlightZone[];
}

function SpotlightMask({ highlights }: SpotlightMaskProps) {
  const [rects, setRects] = React.useState<Array<{ id: string; rect: DOMRect }>>([]);

  React.useEffect(() => {
    const updateRects = () => {
      const newRects = highlights
        .map((h) => {
          const element = document.querySelector(h.selector);
          return element ? { id: h.id, rect: element.getBoundingClientRect() } : null;
        })
        .filter((r): r is { id: string; rect: DOMRect } => r !== null);
      setRects(newRects);
    };

    updateRects();
    window.addEventListener("resize", updateRects);
    window.addEventListener("scroll", updateRects, true);

    return () => {
      window.removeEventListener("resize", updateRects);
      window.removeEventListener("scroll", updateRects, true);
    };
  }, [highlights]);

  const padding = 12;

  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 50 }}
    >
      <defs>
        <mask id="spotlight-mask">
          {/* White background = visible */}
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          {/* Black rectangles = transparent cutouts */}
          {rects.map(({ id, rect }) => (
            <rect
              key={id}
              x={rect.left - padding}
              y={rect.top - padding}
              width={rect.width + padding * 2}
              height={rect.height + padding * 2}
              rx="8"
              fill="black"
            />
          ))}
        </mask>
      </defs>
      {/* Dark overlay with mask */}
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="rgba(0, 0, 0, 0.7)"
        mask="url(#spotlight-mask)"
      />
    </svg>
  );
}

// =============================================================================
// TutorialOverlay Component
// =============================================================================

export function TutorialOverlay({
  highlights,
  onHighlightClick,
  showBackdrop = true,
}: TutorialOverlayProps) {
  // Prevent body scroll when overlay is visible
  React.useEffect(() => {
    if (highlights.length > 0) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [highlights.length]);

  if (highlights.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Tutorial highlight"
    >
      {/* Backdrop with spotlight cutouts */}
      {showBackdrop && <SpotlightMask highlights={highlights} />}

      {/* Highlight elements with tooltips */}
      {highlights.map((zone) => (
        <HighlightElement
          key={zone.id}
          zone={zone}
          onClick={() => onHighlightClick?.(zone.id)}
        />
      ))}

      {/* Keyboard navigation hint */}
      <div
        className={cn(
          "fixed bottom-4 left-1/2 -translate-x-1/2",
          "px-4 py-2 rounded-full",
          "bg-surface-elevated/90 text-muted-foreground text-xs",
          "backdrop-blur-sm"
        )}
        style={{ zIndex: 52 }}
      >
        Press <kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> or click highlighted area to continue
      </div>
    </div>
  );
}

// =============================================================================
// Exports
// =============================================================================

export type { TutorialOverlayProps } from "./types";
