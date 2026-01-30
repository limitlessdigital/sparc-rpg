"use client";

import * as React from "react";
import { cn, Button } from "@sparc/ui";
import type { ClassDefinition } from "../class-data";

// Official SPARC Attribute display config (Version E2)
const ATTRIBUTE_CONFIG = {
  str: { name: "STR", fullName: "Strength", icon: "💪", color: "text-str", bgColor: "bg-str/20" },
  dex: { name: "DEX", fullName: "Dexterity", icon: "🎯", color: "text-dex", bgColor: "bg-dex/20" },
  int: { name: "INT", fullName: "Intelligence", icon: "🧠", color: "text-int", bgColor: "bg-int/20" },
  cha: { name: "CHA", fullName: "Charisma", icon: "💜", color: "text-cha", bgColor: "bg-cha/20" },
};

interface ClassPreviewPanelProps {
  classData: ClassDefinition;
  onSelect: () => void;
  onClose?: () => void;
  /** Show as full-screen modal on mobile */
  isMobile?: boolean;
}

/**
 * ClassPreviewPanel - Expanded class details panel
 * PRD 13: Shows expanded preview (abilities, stats, equipment, playstyle)
 */
export function ClassPreviewPanel({
  classData,
  onSelect,
  onClose,
  isMobile = false,
}: ClassPreviewPanelProps) {
  return (
    <div
      className={cn(
        "bg-surface-card border border-surface-divider rounded-xl overflow-hidden",
        isMobile && "fixed inset-0 z-50 flex flex-col"
      )}
      role="dialog"
      aria-label={`${classData.name} class details`}
    >
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-surface-divider bg-surface-elevated">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-[#2a5a8a] border border-[#3a6a9a] flex items-center justify-center p-3">
              <img 
                src={classData.icon} 
                alt={classData.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold">{classData.name}</h2>
              <p className="text-muted-foreground">{classData.tagline}</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-divider transition-colors"
              aria-label="Close preview"
            >
              <span className="text-lg">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={cn(
        "p-4 md:p-6 space-y-6",
        isMobile && "flex-1 overflow-y-auto"
      )}>
        {/* Description */}
        <div>
          <p className="text-sm md:text-base text-foreground">
            {classData.description}
          </p>
        </div>

        {/* Attributes */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Attributes
          </h3>
          <div className="space-y-2">
            {(Object.keys(classData.attributes) as (keyof typeof classData.attributes)[]).map((attr) => (
              <AttributeBar
                key={attr}
                attribute={attr}
                value={classData.attributes[attr]}
              />
            ))}
          </div>
        </div>

        {/* Special Ability */}
        <div className="p-4 rounded-lg bg-surface-elevated border border-bronze/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚔️</span>
            <h3 className="font-bold">{classData.specialAbility.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {classData.specialAbility.description}
          </p>
        </div>

        {/* Starting Equipment */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <span>📦</span>
            Starting Equipment
          </h3>
          <ul className="space-y-1.5">
            {classData.equipment.map((item, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="text-bronze">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Hit Points */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-surface-elevated">
          <div className="flex items-center gap-2">
            <span className="text-lg">❤️</span>
            <span className="text-sm">Hit Points:</span>
          </div>
          <span className="font-bold text-success text-lg">
            {classData.hitPoints}
          </span>
        </div>

        {/* Playstyle Hint */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-bronze/10 to-gold/10 border border-bronze/20">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <p className="text-sm italic">
              {classData.playstyleHint}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 md:p-6 border-t border-surface-divider bg-surface-elevated">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={onSelect}
        >
          Select {classData.name} →
        </Button>
      </div>
    </div>
  );
}

/**
 * Visual attribute bar - shows dice dots like character cards
 */
function AttributeBar({ 
  attribute, 
  value 
}: { 
  attribute: "str" | "dex" | "int" | "cha"; 
  value: number; 
}) {
  const config = ATTRIBUTE_CONFIG[attribute];

  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-sm",
        config.bgColor
      )}>
        {config.icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{config.name}</span>
          <span className={cn("font-bold", config.color)}>{value}</span>
        </div>
        {/* Show as dice dots like the character cards */}
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                i < value 
                  ? attribute === "str" ? "bg-str" 
                    : attribute === "dex" ? "bg-dex"
                    : attribute === "int" ? "bg-int"
                    : "bg-cha"
                  : "bg-surface-divider"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ClassPreviewPanel;
