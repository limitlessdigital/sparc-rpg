"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "../Button";
import { Tabs, TabList, Tab, TabPanel } from "../Tabs";
import { MetadataEditor } from "./MetadataEditor";
import { CoverImageUpload } from "./CoverImageUpload";
import { VersionManager } from "./VersionManager";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { PublishPreview } from "./PublishPreview";
import type {
  PublishMetadata,
  PublishValidation,
  AdventureAnalytics,
  VersionHistoryItem,
} from "./types";

// Adventure stats interface (from adventure-forge)
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

export interface PublishFlowProps {
  // Initial data
  adventureId: string;
  initialMetadata: PublishMetadata;
  isPublished?: boolean;
  currentVersion?: string;
  versions?: VersionHistoryItem[];
  stats?: AdventureStats;
  analytics?: AdventureAnalytics;
  authorName?: string;

  // Validation
  validation: PublishValidation;

  // Callbacks
  onPublish: (metadata: PublishMetadata) => Promise<void>;
  onUnpublish?: () => Promise<void>;
  onUpdateVersion?: (changelog: string) => Promise<void>;
  onRollback?: (version: string) => Promise<void>;
  onCancel?: () => void;

  // Loading states
  isPublishing?: boolean;

  className?: string;
}

/**
 * Main publish flow component for adventures
 * Combines all publishing sub-components into a tabbed interface
 */
export function PublishFlow({
  adventureId,
  initialMetadata,
  isPublished = false,
  currentVersion = "1.0.0",
  versions = [],
  stats,
  analytics,
  authorName,
  validation,
  onPublish,
  onUnpublish,
  onUpdateVersion,
  onRollback,
  onCancel,
  isPublishing = false,
  className,
}: PublishFlowProps) {
  const [metadata, setMetadata] = React.useState<PublishMetadata>(initialMetadata);
  const [activeTab, setActiveTab] = React.useState<string>("details");
  const [hasChanges, setHasChanges] = React.useState(false);

  // Track changes
  React.useEffect(() => {
    const changed = JSON.stringify(metadata) !== JSON.stringify(initialMetadata);
    setHasChanges(changed);
  }, [metadata, initialMetadata]);

  const handlePublish = async () => {
    await onPublish(metadata);
  };

  const canPublish = validation.canPublish && !isPublishing;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-surface-divider">
        <div>
          <h2 className="text-xl font-semibold">
            {isPublished ? "Manage Publication" : "Publish Adventure"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isPublished
              ? `Currently published as v${currentVersion}`
              : "Share your adventure with the SPARC community"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {isPublished && onUnpublish && (
            <Button
              variant="danger"
              size="sm"
              onClick={onUnpublish}
              disabled={isPublishing}
            >
              Unpublish
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handlePublish}
            disabled={!canPublish}
            loading={isPublishing}
          >
            {isPublished ? "Update Publication" : "Publish"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden pt-4">
        <Tabs value={activeTab} onChange={setActiveTab} className="h-full flex flex-col">
          <TabList variant="pills" className="shrink-0">
            <Tab value="details">Details</Tab>
            <Tab value="preview">Preview</Tab>
            {isPublished && <Tab value="versions">Versions</Tab>}
            {isPublished && <Tab value="analytics">Analytics</Tab>}
          </TabList>

          <div className="flex-1 overflow-auto pt-4">
            <TabPanel value="details" className="h-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Metadata */}
                <div className="space-y-6">
                  <MetadataEditor
                    metadata={metadata}
                    onChange={setMetadata}
                    disabled={isPublishing}
                  />
                </div>

                {/* Right Column - Cover Image */}
                <div className="space-y-6">
                  <CoverImageUpload
                    value={metadata.coverImageUrl}
                    onChange={(url) =>
                      setMetadata({ ...metadata, coverImageUrl: url })
                    }
                    disabled={isPublishing}
                  />

                  {/* Quick Stats */}
                  {stats && (
                    <div className="p-4 rounded-md bg-surface-elevated space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Adventure Summary
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Nodes: </span>
                          <span className="font-medium">{stats.nodeCount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Est. Duration: </span>
                          <span className="font-medium">
                            {stats.estimatedDurationMinutes}m
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Combats: </span>
                          <span className="font-medium">{stats.combatEncounters}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Decisions: </span>
                          <span className="font-medium">{stats.decisionPoints}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabPanel>

            <TabPanel value="preview" className="h-full">
              <PublishPreview
                metadata={metadata}
                stats={stats}
                validation={validation}
                authorName={authorName}
              />
            </TabPanel>

            {isPublished && (
              <TabPanel value="versions" className="h-full">
                <VersionManager
                  currentVersion={currentVersion}
                  versions={versions}
                  onPublishUpdate={onUpdateVersion}
                  onRollback={onRollback}
                  hasChanges={hasChanges}
                  disabled={isPublishing}
                />
              </TabPanel>
            )}

            {isPublished && (
              <TabPanel value="analytics" className="h-full">
                <AnalyticsPanel analytics={analytics} />
              </TabPanel>
            )}
          </div>
        </Tabs>
      </div>

      {/* Validation Status Bar */}
      <div className="pt-4 border-t border-surface-divider mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {validation.isValid ? (
              <>
                <span className="text-success">✓</span>
                <span className="text-sm text-success">Ready to publish</span>
              </>
            ) : (
              <>
                <span className="text-error">✗</span>
                <span className="text-sm text-error">
                  {validation.errors.length} issue
                  {validation.errors.length !== 1 && "s"} must be fixed
                </span>
              </>
            )}
            {validation.warnings.length > 0 && (
              <span className="text-sm text-warning ml-2">
                ({validation.warnings.length} warning
                {validation.warnings.length !== 1 && "s"})
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            Adventure ID: {adventureId}
          </span>
        </div>
      </div>
    </div>
  );
}
