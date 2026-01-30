"use client";

import * as React from "react";
import { cn, Badge } from "@sparc/ui";
import type { ClassDefinition } from "../class-data";

// Official SPARC Attribute display config (Version E2)
const ATTRIBUTE_CONFIG = {
  str: { name: "STR", fullName: "Strength", icon: "💪", color: "text-str", bgColor: "bg-str/20" },
  dex: { name: "DEX", fullName: "Dexterity", icon: "🎯", color: "text-dex", bgColor: "bg-dex/20" },
  int: { name: "INT", fullName: "Intelligence", icon: "🧠", color: "text-int", bgColor: "bg-int/20" },
  cha: { name: "CHA", fullName: "Charisma", icon: "💜", color: "text-cha", bgColor: "bg-cha/20" },
};

interface CharacterPreviewCardProps {
  name: string;
  classData: ClassDefinition;
  className?: string;
}

/**
 * CharacterPreviewCard - Full character sheet preview before confirmation
 * PRD 13: Full character card shown (name, class, stats, ability, equipment)
 */
export function CharacterPreviewCard({
  name,
  classData,
  className,
}: CharacterPreviewCardProps) {
  // Use official SPARC hitPoints from class definition
  const startingHP = classData.hitPoints;

  return (
    <div
      data-testid="character-card"
      className={cn(
        "bg-gradient-to-br from-surface-card to-surface-elevated",
        "border-2 border-bronze/30 rounded-2xl overflow-hidden shadow-xl",
        className
      )}
    >
      {/* Header with character portrait area */}
      <div className="relative p-6 pb-4 bg-gradient-to-r from-bronze/10 via-gold/5 to-transparent border-b border-surface-divider">
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-bronze/40 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-bronze/40 rounded-tr-2xl" />

        <div className="flex items-center gap-5">
          {/* Class icon/portrait placeholder */}
          <div className="relative">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-[#2a5a8a] border-2 border-[#3a6a9a] flex items-center justify-center p-3 shadow-inner">
              <img 
                src={classData.icon} 
                alt={classData.name}
                className="w-full h-full object-contain"
              />
            </div>
            {/* Level badge */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-bronze flex items-center justify-center text-white text-sm font-bold shadow-lg">
              1
            </div>
          </div>

          {/* Name and class */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight truncate">
              {name || "Unnamed Hero"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground">{classData.name}</span>
              <Badge variant="success" size="sm">Level 1</Badge>
            </div>
            {/* HP display */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg">❤️</span>
              <div className="flex-1 max-w-32 h-3 bg-surface-divider rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full" style={{ width: "100%" }} />
              </div>
              <span className="font-bold text-success">{startingHP}/{startingHP} HP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid - Official SPARC attributes */}
      <div className="p-4 md:p-6 grid grid-cols-2 gap-3 md:gap-4 border-b border-surface-divider">
        {(Object.keys(classData.attributes) as (keyof typeof classData.attributes)[]).map((attr) => {
          const config = ATTRIBUTE_CONFIG[attr];
          const value = classData.attributes[attr];
          return (
            <div
              key={attr}
              className="flex items-center gap-3 p-3 bg-surface-elevated rounded-lg border border-surface-divider"
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-lg",
                config.bgColor
              )}>
                {config.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{config.name}</p>
                <p className={cn("text-xl font-bold", config.color)}>
                  {value}
                </p>
              </div>
              {/* Visual dice indicator */}
              <div className="flex gap-0.5 ml-auto">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2 h-2 rounded-full",
                      i < value ? config.bgColor : "bg-surface-divider"
                    )}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Special Ability */}
      <div className="p-4 md:p-6 border-b border-surface-divider">
        <div className="p-4 rounded-lg bg-gradient-to-r from-bronze/10 to-transparent border border-bronze/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚔️</span>
            <h3 className="font-bold">{classData.specialAbility.name}</h3>
            <div className="ml-auto">
              <Badge variant="outline" size="sm">✓ Ready</Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {classData.specialAbility.description}
          </p>
        </div>
      </div>

      {/* Equipment list */}
      <div className="p-4 md:p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <span>📦</span>
          Starting Equipment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {classData.equipment.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-2 rounded bg-surface-elevated text-sm"
            >
              <span className="text-bronze">•</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Heroic Save indicator */}
      <div className="px-4 md:px-6 pb-4 md:pb-6">
        <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-surface-elevated border border-surface-divider">
          <span className="text-lg">🛡️</span>
          <span className="text-sm text-muted-foreground">Heroic Save</span>
          <Badge variant="outline" size="sm">Available</Badge>
        </div>
      </div>

      {/* Decorative footer */}
      <div className="h-2 bg-gradient-to-r from-bronze via-gold to-bronze" />
    </div>
  );
}

export default CharacterPreviewCard;
