"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "../Button";
import { Badge } from "../Badge";
import type { VersionHistoryItem } from "./types";

export interface VersionManagerProps {
  currentVersion: string;
  versions: VersionHistoryItem[];
  onPublishUpdate?: (changelog: string) => void;
  onRollback?: (version: string) => void;
  hasChanges?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Version management component for published adventures
 * Shows version history and allows publishing updates
 */
export function VersionManager({
  currentVersion,
  versions,
  onPublishUpdate,
  onRollback,
  hasChanges = false,
  disabled = false,
  className,
}: VersionManagerProps) {
  const [showChangelog, setShowChangelog] = React.useState(false);
  const [changelog, setChangelog] = React.useState("");

  const handlePublishUpdate = () => {
    if (onPublishUpdate) {
      onPublishUpdate(changelog);
      setChangelog("");
      setShowChangelog(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-muted-foreground">
          Version History
        </label>
        <Badge variant="info">v{currentVersion}</Badge>
      </div>

      {/* Update Notice */}
      {hasChanges && (
        <div className="p-3 rounded-md bg-warning/10 border border-warning/30">
          <div className="flex items-start gap-2">
            <span className="text-warning">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-warning">
                Unpublished Changes
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You have changes that haven't been published yet. Publish an
                update to make them live.
              </p>
            </div>
          </div>
          
          {!showChangelog ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowChangelog(true)}
              disabled={disabled}
              className="mt-3"
            >
              Publish Update
            </Button>
          ) : (
            <div className="mt-3 space-y-2">
              <textarea
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                placeholder="Describe what changed in this version..."
                disabled={disabled}
                className={cn(
                  "w-full px-3 py-2 rounded-md min-h-[80px]",
                  "bg-surface-card border border-surface-divider",
                  "text-sm text-foreground placeholder:text-muted",
                  "focus:outline-none focus:border-bronze focus:ring-2 focus:ring-bronze/20",
                  "disabled:opacity-50"
                )}
              />
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePublishUpdate}
                  disabled={disabled}
                >
                  Publish v{incrementVersion(currentVersion)}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowChangelog(false);
                    setChangelog("");
                  }}
                  disabled={disabled}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Version List */}
      <div className="space-y-2">
        {versions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No versions published yet
          </p>
        ) : (
          versions.map((version) => (
            <div
              key={version.version}
              className={cn(
                "p-3 rounded-md border",
                version.isCurrent
                  ? "bg-bronze/10 border-bronze/30"
                  : "bg-surface-card border-surface-divider"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium">
                    v{version.version}
                  </span>
                  {version.isCurrent && (
                    <Badge variant="success" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(version.publishedAt)}
                </span>
              </div>
              
              {version.changelog && (
                <p className="text-sm text-muted-foreground mt-2">
                  {version.changelog}
                </p>
              )}
              
              {!version.isCurrent && onRollback && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRollback(version.version)}
                  disabled={disabled}
                  className="mt-2"
                >
                  Rollback to this version
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <p className="text-xs text-muted-foreground">
        Active sessions continue using their original version. New sessions will
        use the latest version.
      </p>
    </div>
  );
}

// Helper: Increment semantic version patch number
function incrementVersion(version: string): string {
  const parts = version.split(".").map(Number);
  if (parts.length === 3) {
    parts[2]++;
    return parts.join(".");
  }
  return `${version}.1`;
}

// Helper: Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
