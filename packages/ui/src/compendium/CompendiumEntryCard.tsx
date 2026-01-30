"use client";

import { cn } from "../lib/utils";
import { Badge } from "../Badge";
import type { CompendiumEntry, CompendiumType } from "./types";

export interface CompendiumEntryCardProps {
  entry: CompendiumEntry;
  onClick?: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  showType?: boolean;
  compact?: boolean;
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

const TYPE_COLORS: Record<CompendiumType, string> = {
  rule: "bg-blue-500/20 text-blue-300",
  class: "bg-purple-500/20 text-purple-300",
  ability: "bg-amber-500/20 text-amber-300",
  item: "bg-green-500/20 text-green-300",
  monster: "bg-red-500/20 text-red-300",
  condition: "bg-cyan-500/20 text-cyan-300",
};

export function CompendiumEntryCard({
  entry,
  onClick,
  isBookmarked,
  onToggleBookmark,
  showType = true,
  compact = false,
  className,
}: CompendiumEntryCardProps) {
  const isNew =
    new Date().getTime() - new Date(entry.createdAt).getTime() <
    7 * 24 * 60 * 60 * 1000;
  const isUpdated =
    !isNew &&
    new Date().getTime() - new Date(entry.updatedAt).getTime() <
      7 * 24 * 60 * 60 * 1000;

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-3 p-3 rounded-lg border border-stone-700 bg-stone-800/50",
          "hover:border-amber-500/50 hover:bg-stone-800 transition-colors text-left",
          className
        )}
      >
        <span className="text-xl">{TYPE_ICONS[entry.type]}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-stone-200 truncate">{entry.title}</div>
          {entry.subcategory && (
            <div className="text-xs text-stone-500">{entry.subcategory}</div>
          )}
        </div>
        {onToggleBookmark && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark();
            }}
            className={cn(
              "p-1 hover:text-amber-400 transition-colors",
              isBookmarked ? "text-amber-400" : "text-stone-500"
            )}
          >
            {isBookmarked ? "★" : "☆"}
          </button>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-lg border border-stone-700 bg-stone-800/50",
        "hover:border-amber-500/50 hover:bg-stone-800 transition-colors text-left",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{TYPE_ICONS[entry.type]}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-stone-200">{entry.title}</h3>
              {isNew && (
                <Badge variant="success" className="text-xs">New</Badge>
              )}
              {isUpdated && (
                <Badge variant="info" className="text-xs">Updated</Badge>
              )}
            </div>
            {showType && (
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={cn(
                    "px-2 py-0.5 text-xs rounded-full",
                    TYPE_COLORS[entry.type]
                  )}
                >
                  {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                </span>
                {entry.subcategory && (
                  <span className="text-xs text-stone-500">
                    {entry.subcategory}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {onToggleBookmark && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark();
            }}
            className={cn(
              "p-1 text-xl hover:text-amber-400 transition-colors",
              isBookmarked ? "text-amber-400" : "text-stone-500"
            )}
          >
            {isBookmarked ? "★" : "☆"}
          </button>
        )}
      </div>

      <p className="mt-2 text-sm text-stone-400 line-clamp-2">{entry.summary}</p>

      {entry.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {entry.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs bg-stone-700/50 text-stone-400 rounded"
            >
              {tag}
            </span>
          ))}
          {entry.tags.length > 4 && (
            <span className="px-2 py-0.5 text-xs text-stone-500">
              +{entry.tags.length - 4} more
            </span>
          )}
        </div>
      )}
    </button>
  );
}
