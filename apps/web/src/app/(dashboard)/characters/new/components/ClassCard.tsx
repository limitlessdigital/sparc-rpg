"use client";

import * as React from "react";
import { cn, Badge } from "@sparc/ui";
import type { ClassDefinition } from "../class-data";

// Official SPARC Attribute display config (Version E2)
const ATTRIBUTE_CONFIG = {
  str: { name: "STR", fullName: "Strength", icon: "💪", color: "text-str", bgColor: "bg-str" },
  dex: { name: "DEX", fullName: "Dexterity", icon: "🎯", color: "text-dex", bgColor: "bg-dex" },
  int: { name: "INT", fullName: "Intelligence", icon: "🧠", color: "text-int", bgColor: "bg-int" },
  cha: { name: "CHA", fullName: "Charisma", icon: "💜", color: "text-cha", bgColor: "bg-cha" },
};

interface ClassCardProps {
  classData: ClassDefinition;
  selected: boolean;
  onSelect: () => void;
  onShowPreview: () => void;
  /** For mobile - allow tap to preview */
  onTapToPreview?: () => void;
}

/**
 * ClassCard - Visual class selection card for wizard
 * PRD 13: Visual class cards with lore, stats preview, suggested playstyle
 */
export function ClassCard({
  classData,
  selected,
  onSelect,
  onShowPreview,
  onTapToPreview,
}: ClassCardProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (isMobile && onTapToPreview) {
      // On mobile, first tap shows preview, second tap selects
      e.preventDefault();
      onTapToPreview();
    } else {
      onSelect();
    }
  };

  return (
    <button
      data-testid={`class-${classData.id}`}
      onClick={handleInteraction}
      onMouseEnter={() => !isMobile && onShowPreview()}
      onFocus={onShowPreview}
      className={cn(
        "group relative w-full text-left p-4 md:p-5 rounded-xl",
        "border-2 transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-2",
        // Min touch target 48px
        "min-h-[80px] md:min-h-[100px]",
        selected
          ? "border-bronze bg-bronze/10 shadow-glow-gold"
          : "border-surface-divider bg-surface-card hover:border-bronze/50 hover:bg-surface-elevated"
      )}
      aria-pressed={selected}
      aria-label={`Select ${classData.name} class. ${classData.tagline}`}
    >
      {/* Selection indicator */}
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-bronze flex items-center justify-center">
          <span className="text-white text-sm">✓</span>
        </div>
      )}

      <div className="flex items-start gap-3 md:gap-4">
        {/* Class icon */}
        <div 
          className={cn(
            "flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg",
            "flex items-center justify-center p-2",
            "bg-[#2a5a8a] border border-[#3a6a9a]",
            "group-hover:scale-105 transition-transform"
          )}
        >
          <img 
            src={classData.icon} 
            alt={classData.name}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Name and primary attribute */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-base md:text-lg truncate">
              {classData.name}
            </h3>
            <Badge 
              variant="attribute" 
              attribute={getPrimaryAttribute(classData.attributes)} 
              size="sm"
            >
              {ATTRIBUTE_CONFIG[getPrimaryAttribute(classData.attributes)].name}
            </Badge>
          </div>

          {/* Tagline */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {classData.tagline}
          </p>

          {/* Compact stat preview - show as dice dots like character cards */}
          <div className="flex flex-wrap gap-3 md:gap-4">
            {(Object.keys(classData.attributes) as (keyof typeof classData.attributes)[]).map((attr) => {
              const config = ATTRIBUTE_CONFIG[attr];
              const value = classData.attributes[attr];
              return (
                <div 
                  key={attr} 
                  className="flex items-center gap-1.5 text-xs md:text-sm"
                  title={config.fullName}
                >
                  <span className={config.color}>
                    {config.icon}
                  </span>
                  <span className="font-medium text-muted-foreground">{config.name}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          i < value ? config.bgColor : "bg-surface-divider"
                        )}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* HP indicator */}
      <div className="absolute bottom-2 left-4 flex items-center gap-1 text-xs">
        <span>❤️</span>
        <span className="font-bold text-success">{classData.hitPoints}</span>
      </div>

      {/* Mobile: tap indicator */}
      {isMobile && !selected && (
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
          Tap for details
        </div>
      )}
    </button>
  );
}

/**
 * Get the primary (highest) attribute for a class
 */
function getPrimaryAttribute(attrs: { str: number; dex: number; int: number; cha: number }): "str" | "dex" | "int" | "cha" {
  const entries: [keyof typeof attrs, number][] = [
    ["str", attrs.str],
    ["dex", attrs.dex],
    ["int", attrs.int],
    ["cha", attrs.cha],
  ];
  let maxAttr: "str" | "dex" | "int" | "cha" = "str";
  let maxVal = -1;
  for (const [attr, val] of entries) {
    if (val > maxVal) {
      maxVal = val;
      maxAttr = attr;
    }
  }
  return maxAttr;
}

export default ClassCard;
