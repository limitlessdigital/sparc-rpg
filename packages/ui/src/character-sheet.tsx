"use client";

import { cn } from "./lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import { Button } from "./Button";
import { Badge, AttributeType } from "./Badge";

// SPARC character types
export interface SPARCCharacter {
  id: string;
  name: string;
  class: SPARCClass;
  level: number;
  experience: number;
  attributes: SPARCAttributes;
  hitPoints: {
    current: number;
    max: number;
  };
  equipment: EquipmentItem[];
  abilities: Ability[];
  notes?: string;
}

// Official SPARC Classes (Version E2)
export type SPARCClass = 
  | "warrior" 
  | "wizard" 
  | "cleric" 
  | "rogue" 
  | "ranger" 
  | "paladin" 
  | "necromancer";

// Official SPARC Attributes (Version E2)
export interface SPARCAttributes {
  might: number;  // Physical power
  grace: number;  // Agility and finesse
  wit: number;  // Intelligence and magic
  heart: number;  // Charisma and willpower
}

export interface EquipmentItem {
  id: string;
  name: string;
  type: "weapon" | "armor" | "accessory" | "consumable" | "misc";
  equipped?: boolean;
  description?: string;
}

export interface Ability {
  id: string;
  name: string;
  type: "passive" | "active" | "reaction";
  description: string;
  usesPerSession?: number;
  usesRemaining?: number;
}

// Official SPARC Class definitions (Version E2)
export const SPARC_CLASSES: Record<SPARCClass, {
  name: string;
  icon: string;
  description: string;
  primaryAttribute: AttributeType;
  startingAttributes: SPARCAttributes;
  hitPoints: number;
  specialAbility: string;
}> = {
  warrior: {
    name: "Warrior",
    icon: "⚔️",
    description: "A master of martial combat who excels at direct confrontation",
    primaryAttribute: "might",
    startingAttributes: { might: 3, grace: 2, wit: 0, heart: 0 },
    hitPoints: 12,
    specialAbility: "Flurry",
  },
  wizard: {
    name: "Wizard",
    icon: "📖",
    description: "A scholar who has mastered devastating arcane attacks",
    primaryAttribute: "wit",
    startingAttributes: { might: 0, grace: 2, wit: 3, heart: 0 },
    hitPoints: 7,
    specialAbility: "Meteor Swarm",
  },
  cleric: {
    name: "Cleric",
    icon: "✝️",
    description: "A divine healer who channels sacred power",
    primaryAttribute: "wit",
    startingAttributes: { might: 1, grace: 0, wit: 3, heart: 1 },
    hitPoints: 9,
    specialAbility: "Heal",
  },
  rogue: {
    name: "Rogue",
    icon: "🗡️",
    description: "A deadly operative who excels at stealth and precision",
    primaryAttribute: "grace",
    startingAttributes: { might: 0, grace: 3, wit: 1, heart: 1 },
    hitPoints: 9,
    specialAbility: "Backstab",
  },
  ranger: {
    name: "Ranger",
    icon: "🏹",
    description: "A skilled hunter who excels at ranged combat",
    primaryAttribute: "grace",
    startingAttributes: { might: 1, grace: 3, wit: 1, heart: 0 },
    hitPoints: 11,
    specialAbility: "Multishot",
  },
  paladin: {
    name: "Paladin",
    icon: "🛡️",
    description: "A holy warrior who combines martial prowess with divine protection",
    primaryAttribute: "might",
    startingAttributes: { might: 3, grace: 0, wit: 1, heart: 1 },
    hitPoints: 12,
    specialAbility: "Divine Shield",
  },
  necromancer: {
    name: "Necromancer",
    icon: "💀",
    description: "A dark spellcaster who manipulates life force",
    primaryAttribute: "wit",
    startingAttributes: { might: 0, grace: 1, wit: 3, heart: 1 },
    hitPoints: 7,
    specialAbility: "Transfer Life",
  },
};

// Attribute display info
const ATTRIBUTE_INFO: Record<any, {
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}> = {
  might: { 
    name: "Might", 
    icon: "💪", 
    color: "text-might", 
    bgColor: "bg-might",
    description: "Physical power, endurance, and combat prowess",
  },
  grace: { 
    name: "Grace", 
    icon: "🎯", 
    color: "text-grace", 
    bgColor: "bg-grace",
    description: "Agility, reflexes, and finesse",
  },
  wit: { 
    name: "Wit", 
    icon: "🧠", 
    color: "text-wit", 
    bgColor: "bg-wit",
    description: "Intelligence, knowledge, and magical aptitude",
  },
  heart: { 
    name: "Heart", 
    icon: "💜", 
    color: "text-heart", 
    bgColor: "bg-heart",
    description: "Charisma, empathy, and social influence",
  },
};

export interface CharacterSheetProps {
  character: SPARCCharacter;
  /** Allow editing HP */
  editable?: boolean;
  /** Callback when HP changes */
  onHPChange?: (current: number, max: number) => void;
  /** Callback when ability is used */
  onUseAbility?: (abilityId: string) => void;
  /** Compact mode for sidebar */
  compact?: boolean;
  /** Custom class name */
  className?: string;
}

// HP Bar component
function HPBar({ 
  current, 
  max, 
  editable,
  onChange,
}: { 
  current: number; 
  max: number; 
  editable?: boolean;
  onChange?: (current: number, max: number) => void;
}) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  const isLow = percentage <= 25;
  const isMedium = percentage > 25 && percentage <= 50;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Hit Points</span>
        <div className="flex items-center gap-2">
          {editable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange?.(Math.max(0, current - 1), max)}
              disabled={current <= 0}
              className="h-6 w-6 p-0"
            >
              −
            </Button>
          )}
          <span className={cn(
            "font-bold tabular-nums",
            isLow && "text-error",
            isMedium && "text-warning",
            !isLow && !isMedium && "text-success"
          )}>
            {current} / {max}
          </span>
          {editable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange?.(Math.min(max, current + 1), max)}
              disabled={current >= max}
              className="h-6 w-6 p-0"
            >
              +
            </Button>
          )}
        </div>
      </div>
      <div className="h-3 bg-surface-divider rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-300 rounded-full",
            isLow && "bg-error",
            isMedium && "bg-warning",
            !isLow && !isMedium && "bg-success"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Attribute display component
function AttributeDisplay({ 
  type, 
  value,
  compact,
}: { 
  type: AttributeType; 
  value: number;
  compact?: boolean;
}) {
  const info = ATTRIBUTE_INFO[type];
  
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className={info.color}>{info.icon}</span>
        <span className="font-bold">{value}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-surface-card border border-surface-divider rounded-lg">
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center text-lg",
        info.bgColor,
        "bg-opacity-20"
      )}>
        {info.icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium">{info.name}</span>
          <span className={cn("text-xl font-bold", info.color)}>{value}</span>
        </div>
        <p className="text-xs text-muted-foreground">{info.description}</p>
      </div>
    </div>
  );
}

export function CharacterSheet({
  character,
  editable = false,
  onHPChange,
  onUseAbility,
  compact = false,
  className,
}: CharacterSheetProps) {
  const classInfo = SPARC_CLASSES[character.class];
  const xpForNextLevel = character.level * 100; // Simple XP formula

  if (compact) {
    return (
      <Card className={cn("bg-surface-card", className)}>
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">{character.name}</h3>
              <p className="text-sm text-muted-foreground">
                {classInfo.icon} {classInfo.name} · Level {character.level}
              </p>
            </div>
          </div>

          {/* HP */}
          <HPBar
            current={character.hitPoints.current}
            max={character.hitPoints.max}
            editable={editable}
            onChange={onHPChange}
          />

          {/* Attributes grid */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {(Object.keys(character.attributes) as AttributeType[]).map((attr) => (
              <div key={attr} className="p-2 bg-surface-elevated rounded">
                <div className={ATTRIBUTE_INFO[attr].color}>
                  {ATTRIBUTE_INFO[attr].icon}
                </div>
                <div className="font-bold">{character.attributes[attr]}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {character.name}
                <Badge variant="attribute" attribute={classInfo.primaryAttribute}>
                  Level {character.level}
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                <span className="text-lg mr-1">{classInfo.icon}</span>
                {classInfo.name}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* HP */}
          <HPBar
            current={character.hitPoints.current}
            max={character.hitPoints.max}
            editable={editable}
            onChange={onHPChange}
          />

          {/* XP Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Experience</span>
              <span>{character.experience} / {xpForNextLevel} XP</span>
            </div>
            <div className="h-2 bg-surface-divider rounded-full overflow-hidden">
              <div
                className="h-full bg-gold rounded-full transition-all"
                style={{ width: `${(character.experience / xpForNextLevel) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attributes Card */}
      <Card>
        <CardHeader>
          <CardTitle>Attributes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(Object.keys(character.attributes) as AttributeType[]).map((attr) => (
            <AttributeDisplay
              key={attr}
              type={attr}
              value={character.attributes[attr]}
            />
          ))}
        </CardContent>
      </Card>

      {/* Abilities Card */}
      {character.abilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Special Abilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {character.abilities.map((ability) => (
              <div
                key={ability.id}
                className="p-3 bg-surface-elevated border border-surface-divider rounded-lg"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{ability.name}</span>
                    <Badge variant="outline" size="sm">
                      {ability.type}
                    </Badge>
                  </div>
                  {ability.usesPerSession !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {ability.usesRemaining ?? ability.usesPerSession}/{ability.usesPerSession}
                      </span>
                      {editable && (ability.usesRemaining ?? ability.usesPerSession) > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onUseAbility?.(ability.id)}
                          className="h-6 px-2 text-xs"
                        >
                          Use
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{ability.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Equipment Card */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          {character.equipment.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No equipment
            </p>
          ) : (
            <ul className="space-y-2">
              {character.equipment.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-surface-elevated rounded"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {item.type === "weapon" && "⚔️"}
                      {item.type === "armor" && "🛡️"}
                      {item.type === "accessory" && "💍"}
                      {item.type === "consumable" && "🧪"}
                      {item.type === "misc" && "📦"}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  {item.equipped && (
                    <Badge variant="success" size="sm">Equipped</Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {character.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {character.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Utility to create a new character
export function createSPARCCharacter(
  name: string,
  characterClass: SPARCClass
): SPARCCharacter {
  const classInfo = SPARC_CLASSES[characterClass];
  const maxHP = classInfo.hitPoints + classInfo.startingAttributes.might;

  return {
    id: crypto.randomUUID(),
    name,
    class: characterClass,
    level: 1,
    experience: 0,
    attributes: { ...classInfo.startingAttributes },
    hitPoints: {
      current: maxHP,
      max: maxHP,
    },
    equipment: [],
    abilities: [],
  };
}
