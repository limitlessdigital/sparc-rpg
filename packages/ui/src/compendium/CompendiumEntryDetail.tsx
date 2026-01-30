"use client";

import { cn } from "../lib/utils";
import { Badge } from "../Badge";
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
import { getRelatedEntries } from "./data/search";

export interface CompendiumEntryDetailProps {
  entry: CompendiumEntry;
  onClose?: () => void;
  onNavigate?: (entryId: string) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
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

function renderStats(entry: CompendiumEntry) {
  const stats = entry.stats;
  if (!stats) return null;

  switch (entry.type) {
    case "class":
      return <ClassStatsView stats={stats as unknown as ClassStats} />;
    case "item":
      return <ItemStatsView stats={stats as unknown as ItemStats} />;
    case "monster":
      return <MonsterStatsView stats={stats as unknown as MonsterStats} />;
    case "ability":
      return <AbilityStatsView stats={stats as unknown as AbilityStats} />;
    case "condition":
      return <ConditionStatsView stats={stats as unknown as ConditionStats} />;
    default:
      return null;
  }
}

function ClassStatsView({ stats }: { stats: ClassStats }) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-stone-800/50 rounded-lg">
      <div>
        <div className="text-xs text-stone-500 uppercase">Primary Attribute</div>
        <div className="font-medium text-stone-200 capitalize">
          {stats.primaryAttribute}
        </div>
      </div>
      <div>
        <div className="text-xs text-stone-500 uppercase">Hit Points</div>
        <div className="font-medium text-stone-200">{stats.hitPoints}</div>
      </div>
      <div>
        <div className="text-xs text-stone-500 uppercase">Hit Die</div>
        <div className="font-medium text-stone-200">d{stats.hitDie}</div>
      </div>
      <div>
        <div className="text-xs text-stone-500 uppercase">Special Ability</div>
        <div className="font-medium text-amber-300 text-sm">
          {stats.specialAbility.split(" - ")[0]}
        </div>
      </div>
      <div className="col-span-2">
        <div className="text-xs text-stone-500 uppercase mb-2">
          Starting Attributes
        </div>
        <div className="flex gap-2">
          {Object.entries(stats.startingAttributes).map(([attr, value]) => (
            <div
              key={attr}
              className="px-3 py-1 bg-stone-700 rounded text-sm flex items-center gap-1"
            >
              <span className="text-stone-400 capitalize">{attr}:</span>
              <span className="text-stone-200 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-2">
        <div className="text-xs text-stone-500 uppercase mb-2">
          Starting Equipment
        </div>
        <div className="flex flex-wrap gap-2">
          {stats.startingEquipment.map((item) => (
            <Badge key={item} variant="info">
              {item}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function ItemStatsView({ stats }: { stats: ItemStats }) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-stone-800/50 rounded-lg">
      <div>
        <div className="text-xs text-stone-500 uppercase">Type</div>
        <div className="font-medium text-stone-200 capitalize">
          {stats.itemType}
        </div>
      </div>
      {stats.damage && (
        <div>
          <div className="text-xs text-stone-500 uppercase">Damage</div>
          <div className="font-medium text-red-400">{stats.damage}</div>
        </div>
      )}
      {stats.defense !== undefined && (
        <div>
          <div className="text-xs text-stone-500 uppercase">Defense</div>
          <div className="font-medium text-blue-400">+{stats.defense}</div>
        </div>
      )}
      {stats.range && (
        <div>
          <div className="text-xs text-stone-500 uppercase">Range</div>
          <div className="font-medium text-stone-200">{stats.range}</div>
        </div>
      )}
      {stats.value !== undefined && (
        <div>
          <div className="text-xs text-stone-500 uppercase">Value</div>
          <div className="font-medium text-amber-400">{stats.value} gp</div>
        </div>
      )}
      {stats.weight !== undefined && (
        <div>
          <div className="text-xs text-stone-500 uppercase">Weight</div>
          <div className="font-medium text-stone-200">{stats.weight} lbs</div>
        </div>
      )}
      {stats.properties.length > 0 && (
        <div className="col-span-2">
          <div className="text-xs text-stone-500 uppercase mb-2">Properties</div>
          <div className="flex flex-wrap gap-2">
            {stats.properties.map((prop) => (
              <Badge key={prop} variant="info">
                {prop}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MonsterStatsView({ stats }: { stats: MonsterStats }) {
  const challengeColors = {
    minion: "bg-green-500/20 text-green-300",
    standard: "bg-blue-500/20 text-blue-300",
    elite: "bg-purple-500/20 text-purple-300",
    boss: "bg-red-500/20 text-red-300",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className={cn("px-3 py-1 rounded-full text-sm font-medium", challengeColors[stats.challenge])}>
          {stats.challenge.charAt(0).toUpperCase() + stats.challenge.slice(1)}
        </span>
        <span className="text-red-400 font-medium">❤️ {stats.hitPoints} HP</span>
      </div>
      <div className="grid grid-cols-4 gap-2 p-4 bg-stone-800/50 rounded-lg">
        <div className="text-center">
          <div className="text-xs text-stone-500">Might</div>
          <div className="text-lg font-bold text-stone-200">{stats.might}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-stone-500">Grace</div>
          <div className="text-lg font-bold text-stone-200">{stats.grace}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-stone-500">Wit</div>
          <div className="text-lg font-bold text-stone-200">{stats.wit}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-stone-500">Heart</div>
          <div className="text-lg font-bold text-stone-200">{stats.heart}</div>
        </div>
      </div>
      {stats.abilities.length > 0 && (
        <div>
          <div className="text-xs text-stone-500 uppercase mb-2">Abilities</div>
          <div className="space-y-1">
            {stats.abilities.map((ability) => (
              <div
                key={ability}
                className="px-3 py-2 bg-stone-800/50 rounded text-sm text-stone-300"
              >
                {ability}
              </div>
            ))}
          </div>
        </div>
      )}
      {stats.loot && stats.loot.length > 0 && (
        <div>
          <div className="text-xs text-stone-500 uppercase mb-2">Loot</div>
          <div className="flex flex-wrap gap-2">
            {stats.loot.map((item) => (
              <Badge key={item} variant="warning">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AbilityStatsView({ stats }: { stats: AbilityStats }) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-stone-800/50 rounded-lg">
      <div>
        <div className="text-xs text-stone-500 uppercase">Type</div>
        <div className="font-medium text-stone-200 capitalize">
          {stats.abilityType}
        </div>
      </div>
      {stats.usesPerSession && (
        <div>
          <div className="text-xs text-stone-500 uppercase">Uses</div>
          <div className="font-medium text-amber-400">
            {stats.usesPerSession}/session
          </div>
        </div>
      )}
      {stats.targetType && (
        <div>
          <div className="text-xs text-stone-500 uppercase">Target</div>
          <div className="font-medium text-stone-200 capitalize">
            {stats.targetType}
          </div>
        </div>
      )}
      {stats.range && (
        <div>
          <div className="text-xs text-stone-500 uppercase">Range</div>
          <div className="font-medium text-stone-200">{stats.range}</div>
        </div>
      )}
      {stats.duration && (
        <div>
          <div className="text-xs text-stone-500 uppercase">Duration</div>
          <div className="font-medium text-stone-200">{stats.duration}</div>
        </div>
      )}
    </div>
  );
}

function ConditionStatsView({ stats }: { stats: ConditionStats }) {
  return (
    <div className="space-y-4 p-4 bg-stone-800/50 rounded-lg">
      <div>
        <div className="text-xs text-stone-500 uppercase">Duration</div>
        <div className="font-medium text-stone-200">{stats.duration}</div>
      </div>
      <div>
        <div className="text-xs text-stone-500 uppercase mb-2">Effects</div>
        <ul className="space-y-1">
          {stats.effects.map((effect) => (
            <li key={effect} className="text-sm text-red-300 flex items-start gap-2">
              <span>•</span>
              {effect}
            </li>
          ))}
        </ul>
      </div>
      {stats.removedBy && stats.removedBy.length > 0 && (
        <div>
          <div className="text-xs text-stone-500 uppercase mb-2">Removed By</div>
          <ul className="space-y-1">
            {stats.removedBy.map((method) => (
              <li key={method} className="text-sm text-green-300 flex items-start gap-2">
                <span>✓</span>
                {method}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function CompendiumEntryDetail({
  entry,
  onClose,
  onNavigate,
  isBookmarked,
  onToggleBookmark,
  isPinned,
  onTogglePin,
  className,
}: CompendiumEntryDetailProps) {
  const relatedEntries = getRelatedEntries(entry);

  // Simple markdown-ish rendering
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("# ")) {
        return (
          <h1 key={i} className="text-2xl font-bold text-stone-100 mt-4 mb-2">
            {line.slice(2)}
          </h1>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={i} className="text-xl font-semibold text-stone-200 mt-4 mb-2">
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <p key={i} className="font-semibold text-amber-300 my-2">
            {line.slice(2, -2)}
          </p>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li key={i} className="text-stone-300 ml-4">
            {line.slice(2)}
          </li>
        );
      }
      if (line.trim() === "") {
        return <br key={i} />;
      }
      return (
        <p key={i} className="text-stone-300 my-1">
          {line}
        </p>
      );
    });
  };

  return (
    <div className={cn("bg-stone-900 rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 bg-stone-800 border-b border-stone-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{TYPE_ICONS[entry.type]}</span>
          <div>
            <h2 className="text-xl font-bold text-stone-100">{entry.title}</h2>
            <div className="text-sm text-stone-400">
              {entry.category}
              {entry.subcategory && ` › ${entry.subcategory}`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onToggleBookmark && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleBookmark}
              className={isBookmarked ? "text-amber-400" : ""}
            >
              {isBookmarked ? "★" : "☆"} Bookmark
            </Button>
          )}
          {onTogglePin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onTogglePin}
              className={isPinned ? "text-amber-400" : ""}
            >
              📌 {isPinned ? "Unpin" : "Pin"}
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-h-[70vh] overflow-y-auto">
        {/* Stats */}
        {renderStats(entry)}

        {/* Divider */}
        <hr className="my-6 border-stone-700" />

        {/* Full Content */}
        <div className="prose prose-invert prose-stone max-w-none">
          {renderContent(entry.content)}
        </div>

        {/* Related Entries */}
        {relatedEntries.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-stone-200 mb-3">
              Related Entries
            </h3>
            <div className="flex flex-wrap gap-2">
              {relatedEntries.map((related) => (
                <button
                  key={related.id}
                  onClick={() => onNavigate?.(related.id)}
                  className="px-3 py-1 bg-stone-800 hover:bg-stone-700 rounded-full text-sm text-stone-300 transition-colors flex items-center gap-1"
                >
                  <span>{TYPE_ICONS[related.type]}</span>
                  {related.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="mt-8 pt-4 border-t border-stone-700 text-xs text-stone-500">
          Last updated: {new Date(entry.updatedAt).toLocaleDateString()}
          {" · "}
          Version {entry.version}
        </div>
      </div>
    </div>
  );
}
