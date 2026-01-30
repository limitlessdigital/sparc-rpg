"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "../lib/utils";
import type { CompendiumEntry, CompendiumType, TooltipData } from "./types";
import { getEntryById, getEntryBySlug } from "./data/search";

export interface CompendiumTooltipProps {
  /** Entry ID to show tooltip for */
  entryId?: string;
  /** Entry slug to show tooltip for */
  slug?: string;
  /** Entry type (for lookup by name) - reserved for future use */
  type?: CompendiumType;
  /** Entry name (for lookup by type + name) - reserved for future use */
  name?: string;
  /** Child element that triggers tooltip */
  children: React.ReactNode;
  /** Optional click handler */
  onClick?: (entry: CompendiumEntry) => void;
  /** Custom className */
  className?: string;
}

const TYPE_ICONS: Record<CompendiumType, string> = {
  rule: "📖",
  class: "⚔️",
  ability: "✨",
  item: "📦",
  monster: "👹",
  condition: "💫",
};

function getTooltipData(entry: CompendiumEntry): TooltipData {
  const keyStats: Record<string, string> = {};

  if (entry.stats) {
    const stats = entry.stats as unknown as Record<string, unknown>;
    
    // Extract key stats based on type
    if (entry.type === "item") {
      if (stats.damage) keyStats["Damage"] = String(stats.damage);
      if (stats.defense) keyStats["Defense"] = `+${stats.defense}`;
      if (stats.range) keyStats["Range"] = String(stats.range);
    } else if (entry.type === "monster") {
      keyStats["HP"] = String(stats.hitPoints);
      keyStats["Challenge"] = String(stats.challenge);
    } else if (entry.type === "class") {
      keyStats["Primary"] = String(stats.primaryAttribute);
      keyStats["HP"] = String(stats.hitPoints);
    } else if (entry.type === "ability") {
      if (stats.usesPerSession) keyStats["Uses"] = `${stats.usesPerSession}/session`;
      if (stats.abilityType) keyStats["Type"] = String(stats.abilityType);
    } else if (entry.type === "condition") {
      keyStats["Duration"] = String(stats.duration);
    }
  }

  return {
    id: entry.id,
    title: entry.title,
    type: entry.type,
    summary: entry.summary,
    keyStats,
  };
}

export function CompendiumTooltip({
  entryId,
  slug,
  type: _type, // Reserved for future use
  name: _name, // Reserved for future use
  children,
  onClick,
  className,
}: CompendiumTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Suppress unused variable warnings
  void _type;
  void _name;

  // Find the entry
  let entry: CompendiumEntry | undefined;
  if (entryId) {
    entry = getEntryById(entryId);
  } else if (slug) {
    entry = getEntryBySlug(slug);
  }
  // TODO: Add lookup by type + name if needed

  const tooltipData = entry ? getTooltipData(entry) : null;

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = triggerRect.bottom + 8;
    let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);

    // Prevent going off right edge
    if (left + tooltipRect.width > viewportWidth - 16) {
      left = viewportWidth - tooltipRect.width - 16;
    }

    // Prevent going off left edge
    if (left < 16) {
      left = 16;
    }

    // If tooltip would go below viewport, show above trigger
    if (top + tooltipRect.height > viewportHeight - 16) {
      top = triggerRect.top - tooltipRect.height - 8;
    }

    setPosition({ top, left });
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 500); // 500ms delay before showing
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 100); // Small delay to allow moving to tooltip
  }, []);

  const handleTooltipMouseEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  }, []);

  const handleTooltipMouseLeave = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleClick = useCallback(() => {
    if (entry && onClick) {
      onClick(entry);
    }
  }, [entry, onClick]);

  // Update position when tooltip opens
  useEffect(() => {
    if (isOpen) {
      // Use requestAnimationFrame to ensure tooltip is rendered before measuring
      requestAnimationFrame(() => {
        updatePosition();
      });
    }
  }, [isOpen, updatePosition]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  if (!tooltipData) {
    return <span className={className}>{children}</span>;
  }

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={cn(
          "cursor-help border-b border-dotted border-amber-500/50 hover:border-amber-500",
          onClick && "cursor-pointer",
          className
        )}
      >
        {children}
      </span>

      {isOpen && (
        <div
          ref={tooltipRef}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            zIndex: 9999,
          }}
          className="w-72 p-3 bg-stone-800 border border-stone-600 rounded-lg shadow-xl animate-in fade-in duration-150"
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{TYPE_ICONS[tooltipData.type]}</span>
            <div>
              <div className="font-semibold text-stone-100">{tooltipData.title}</div>
              <div className="text-xs text-stone-500 capitalize">{tooltipData.type}</div>
            </div>
          </div>

          {/* Summary */}
          <p className="text-sm text-stone-300 mb-2">{tooltipData.summary}</p>

          {/* Key Stats */}
          {Object.keys(tooltipData.keyStats).length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-700">
              {Object.entries(tooltipData.keyStats).map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className="text-stone-500">{key}:</span>{" "}
                  <span className="text-stone-200 font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Click hint */}
          {onClick && (
            <div className="mt-2 text-xs text-stone-500 text-center">
              Click to view full entry
            </div>
          )}
        </div>
      )}
    </>
  );
}

/**
 * Process text to add compendium tooltips
 * Detects [[type:name]] patterns and replaces with tooltip components
 */
export function processCompendiumLinks(
  text: string,
  onClick?: (entry: CompendiumEntry) => void
): React.ReactNode {
  const LINK_REGEX = /\[\[(\w+):([^\]]+)\]\]/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyCounter = 0;

  while ((match = LINK_REGEX.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const [, type, name] = match;
    parts.push(
      <CompendiumTooltip
        key={`tooltip-${keyCounter++}`}
        type={type as CompendiumType}
        name={name}
        onClick={onClick}
      >
        {name}
      </CompendiumTooltip>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
