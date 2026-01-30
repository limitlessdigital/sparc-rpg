"use client";


import { cn } from "../lib/utils";
import { Badge } from "../Badge";
import type { PublishMetadata, PublishValidation } from "./types";

export interface PublishPreviewProps {
  metadata: PublishMetadata;
  stats?: AdventureStats;
  validation: PublishValidation;
  authorName?: string;
  className?: string;
}

/**
 * Preview component showing how the adventure will appear in the library
 */
export function PublishPreview({
  metadata,
  stats,
  validation,
  authorName = "Anonymous",
  className,
}: PublishPreviewProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <label className="block text-sm font-medium text-muted-foreground">
        Preview
      </label>

      {/* Validation Summary */}
      {!validation.isValid && validation.errors.length > 0 && (
        <div className="p-3 rounded-md bg-error/10 border border-error/30">
          <p className="text-sm font-medium text-error mb-2">
            Cannot Publish - Fix These Issues:
          </p>
          <ul className="space-y-1">
            {validation.errors.map((error, i) => (
              <li key={i} className="text-xs text-error flex items-start gap-2">
                <span>•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="p-3 rounded-md bg-warning/10 border border-warning/30">
          <p className="text-sm font-medium text-warning mb-2">Suggestions:</p>
          <ul className="space-y-1">
            {validation.warnings.map((warning, i) => (
              <li
                key={i}
                className="text-xs text-warning flex items-start gap-2"
              >
                <span>•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Card Preview */}
      <div className="rounded-lg border border-surface-divider overflow-hidden bg-surface-card">
        {/* Cover Image */}
        <div className="aspect-video bg-surface-elevated relative">
          {metadata.coverImageUrl ? (
            <img
              src={metadata.coverImageUrl}
              alt={metadata.title || "Adventure cover"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🗺️</div>
                <span className="text-xs text-muted-foreground">
                  No cover image
                </span>
              </div>
            </div>
          )}

          {/* Difficulty Badge */}
          <div className="absolute top-2 right-2">
            <Badge
              variant={
                metadata.difficulty === "beginner"
                  ? "success"
                  : metadata.difficulty === "intermediate"
                  ? "warning"
                  : "error"
              }
            >
              {metadata.difficulty.charAt(0).toUpperCase() +
                metadata.difficulty.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">
              {metadata.title || "Untitled Adventure"}
            </h3>
            <p className="text-sm text-muted-foreground">by {authorName}</p>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {metadata.description || "No description provided."}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {stats && (
              <span className="flex items-center gap-1">
                ⏱️ {stats.estimatedDurationMinutes} min
              </span>
            )}
            <span className="flex items-center gap-1">
              👥 {metadata.recommendedPlayers.min}-
              {metadata.recommendedPlayers.max} players
            </span>
          </div>

          {/* Stats Preview */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">⭐ — (0 reviews)</span>
            <span className="text-muted-foreground">🎮 0 plays</span>
          </div>

          {/* Tags */}
          {metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {metadata.tags.slice(0, 5).map((tag) => (
                <Badge key={tag} variant="default" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {metadata.tags.length > 5 && (
                <Badge variant="default" className="text-xs">
                  +{metadata.tags.length - 5} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Visibility Info */}
      <div className="p-3 rounded-md bg-surface-elevated">
        <div className="flex items-center gap-2">
          <span>
            {metadata.visibility === "public"
              ? "🌍"
              : metadata.visibility === "unlisted"
              ? "🔗"
              : "🔒"}
          </span>
          <div>
            <p className="text-sm font-medium">
              {metadata.visibility === "public"
                ? "Public Adventure"
                : metadata.visibility === "unlisted"
                ? "Unlisted Adventure"
                : "Private Adventure"}
            </p>
            <p className="text-xs text-muted-foreground">
              {metadata.visibility === "public"
                ? "Will appear in the public library for everyone to discover"
                : metadata.visibility === "unlisted"
                ? "Only accessible via direct link"
                : "Only you can access this adventure"}
            </p>
          </div>
        </div>
      </div>

      {/* Adventure Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-md bg-surface-elevated">
            <div className="text-lg font-semibold">{stats.nodeCount}</div>
            <div className="text-xs text-muted-foreground">Nodes</div>
          </div>
          <div className="p-2 rounded-md bg-surface-elevated">
            <div className="text-lg font-semibold">{stats.combatEncounters}</div>
            <div className="text-xs text-muted-foreground">Combats</div>
          </div>
          <div className="p-2 rounded-md bg-surface-elevated">
            <div className="text-lg font-semibold">{stats.decisionPoints}</div>
            <div className="text-xs text-muted-foreground">Decisions</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Interface for AdventureStats (duplicated from adventure-forge for independence)
interface AdventureStats {
  nodeCount: number;
  connectionCount: number;
  averagePathLength: number;
  shortestPath: number;
  longestPath: number;
  combatEncounters: number;
  challengeCount: number;
  decisionPoints: number;
  estimatedDurationMinutes: number;
}
