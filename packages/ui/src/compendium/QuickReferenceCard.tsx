"use client";

import { cn } from "../lib/utils";
import { Button } from "../Button";
import type {
  CompendiumEntry,
  CompendiumType,
  ClassStats,
  ItemStats,
  MonsterStats,
  AbilityStats,
  ConditionStats,
} from "./types";

export interface QuickReferenceCardProps {
  entry: CompendiumEntry;
  isPinned?: boolean;
  onPin?: () => void;
  onClose?: () => void;
  onExpand?: () => void;
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

function QuickStats({ entry }: { entry: CompendiumEntry }) {
  const stats = entry.stats;
  if (!stats) return null;

  switch (entry.type) {
    case "class": {
      const s = stats as unknown as ClassStats;
      return (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><span className="text-stone-500">Primary:</span> <span className="capitalize">{s.primaryAttribute}</span></div>
          <div><span className="text-stone-500">HP:</span> {s.hitPoints}</div>
          <div className="col-span-2 text-amber-300">{s.specialAbility.split(" - ")[0]}</div>
        </div>
      );
    }
    case "item": {
      const s = stats as unknown as ItemStats;
      return (
        <div className="flex flex-wrap gap-2 text-xs">
          {s.damage && <span className="text-red-400">⚔️ {s.damage}</span>}
          {s.defense !== undefined && <span className="text-blue-400">🛡️ +{s.defense}</span>}
          {s.range && <span className="text-stone-400">📏 {s.range}</span>}
          {s.properties.slice(0, 2).map(p => (
            <span key={p} className="text-stone-500">{p}</span>
          ))}
        </div>
      );
    }
    case "monster": {
      const s = stats as unknown as MonsterStats;
      return (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-red-400">❤️ {s.hitPoints}</span>
            <span className="capitalize text-stone-500">{s.challenge}</span>
          </div>
          <div className="flex gap-3">
            <span>💪{s.might}</span>
            <span>🎯{s.grace}</span>
            <span>🧠{s.wit}</span>
            <span>❤️{s.heart}</span>
          </div>
        </div>
      );
    }
    case "ability": {
      const s = stats as unknown as AbilityStats;
      return (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="capitalize text-stone-400">{s.abilityType}</span>
          {s.usesPerSession && <span className="text-amber-400">{s.usesPerSession}/session</span>}
          {s.range && <span className="text-stone-400">Range: {s.range}</span>}
          {s.duration && <span className="text-stone-400">{s.duration}</span>}
        </div>
      );
    }
    case "condition": {
      const s = stats as unknown as ConditionStats;
      return (
        <div className="space-y-1 text-xs">
          <div className="text-stone-400">{s.duration}</div>
          <ul className="space-y-0.5">
            {s.effects.slice(0, 3).map((e, i) => (
              <li key={i} className="text-red-300">• {e}</li>
            ))}
          </ul>
        </div>
      );
    }
    default:
      return null;
  }
}

export function QuickReferenceCard({
  entry,
  isPinned,
  onPin,
  onClose,
  onExpand,
  className,
}: QuickReferenceCardProps) {
  return (
    <div
      className={cn(
        "w-64 bg-stone-800 border border-stone-700 rounded-lg shadow-xl overflow-hidden",
        isPinned && "ring-2 ring-amber-500",
        className
      )}
    >
      {/* Header */}
      <div className="px-3 py-2 bg-stone-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{TYPE_ICONS[entry.type]}</span>
          <span className="font-medium text-sm text-stone-200 truncate">
            {entry.title}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onPin && (
            <button
              onClick={onPin}
              className={cn(
                "p-1 text-xs hover:text-amber-400 transition-colors",
                isPinned ? "text-amber-400" : "text-stone-500"
              )}
              title={isPinned ? "Unpin" : "Pin"}
            >
              📌
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-xs text-stone-500 hover:text-stone-200 transition-colors"
              title="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Summary */}
        <p className="text-xs text-stone-400 line-clamp-2">{entry.summary}</p>

        {/* Quick Stats */}
        <QuickStats entry={entry} />
      </div>

      {/* Footer */}
      {onExpand && (
        <div className="px-3 py-2 bg-stone-900/50 border-t border-stone-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExpand}
            className="w-full text-xs"
          >
            View Full Entry →
          </Button>
        </div>
      )}
    </div>
  );
}

export interface PinnedCardsContainerProps {
  entries: CompendiumEntry[];
  onUnpin: (entryId: string) => void;
  onExpand: (entry: CompendiumEntry) => void;
  className?: string;
}

export function PinnedCardsContainer({
  entries,
  onUnpin,
  onExpand,
  className,
}: PinnedCardsContainerProps) {
  if (entries.length === 0) return null;

  return (
    <div className={cn("fixed bottom-4 right-4 flex flex-col gap-2 z-40", className)}>
      {entries.map((entry) => (
        <QuickReferenceCard
          key={entry.id}
          entry={entry}
          isPinned
          onPin={() => onUnpin(entry.id)}
          onClose={() => onUnpin(entry.id)}
          onExpand={() => onExpand(entry)}
        />
      ))}
    </div>
  );
}
