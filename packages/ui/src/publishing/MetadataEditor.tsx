"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { Input, Textarea } from "../Input";
import { Badge } from "../Badge";
import type { PublishMetadata } from "./types";
import { ALL_SUGGESTED_TAGS } from "./types";

export interface MetadataEditorProps {
  metadata: PublishMetadata;
  onChange: (metadata: PublishMetadata) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Metadata editor for publishing adventures
 * Allows editing title, description, tags, difficulty, visibility, and player count
 */
export function MetadataEditor({
  metadata,
  onChange,
  disabled = false,
  className,
}: MetadataEditorProps) {
  const [tagInput, setTagInput] = React.useState("");

  const handleChange = <K extends keyof PublishMetadata>(
    key: K,
    value: PublishMetadata[K]
  ) => {
    onChange({ ...metadata, [key]: value });
  };

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !metadata.tags.includes(normalizedTag)) {
      handleChange("tags", [...metadata.tags, normalizedTag]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    handleChange(
      "tags",
      metadata.tags.filter((t) => t !== tag)
    );
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Title */}
      <Input
        label="Adventure Title"
        value={metadata.title}
        onChange={(e) => handleChange("title", e.target.value)}
        placeholder="Enter adventure title..."
        disabled={disabled}
        helperText="This will be displayed in the library"
      />

      {/* Description */}
      <Textarea
        label="Description"
        value={metadata.description}
        onChange={(e) => handleChange("description", e.target.value)}
        placeholder="Describe your adventure. What makes it unique? What can players expect?"
        disabled={disabled}
        className="min-h-[120px]"
        helperText="A compelling description helps players decide to play your adventure"
      />

      {/* Tags */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-muted-foreground">
          Tags
        </label>
        
        {/* Current tags */}
        <div className="flex flex-wrap gap-2 min-h-[32px]">
          {metadata.tags.map((tag) => (
            <Badge
              key={tag}
              variant="default"
              className="cursor-pointer hover:bg-error/20"
              onClick={() => !disabled && handleRemoveTag(tag)}
            >
              {tag}
              {!disabled && <span className="ml-1">×</span>}
            </Badge>
          ))}
        </div>
        
        {/* Tag input */}
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="Add tags (press Enter)"
          disabled={disabled}
        />
        
        {/* Suggested tags */}
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Suggestions:</span>
          <div className="flex flex-wrap gap-1">
            {ALL_SUGGESTED_TAGS
              .filter((tag) => !metadata.tags.includes(tag))
              .slice(0, 12)
              .map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  disabled={disabled}
                  className={cn(
                    "px-2 py-0.5 text-xs rounded-full",
                    "bg-surface-elevated text-muted-foreground",
                    "hover:bg-bronze/20 hover:text-bronze",
                    "transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  + {tag}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-muted-foreground">
          Difficulty
        </label>
        <div className="flex gap-2">
          {(["beginner", "intermediate", "advanced"] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => handleChange("difficulty", level)}
              disabled={disabled}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium",
                "border transition-all",
                metadata.difficulty === level
                  ? level === "beginner"
                    ? "bg-success/20 border-success text-success"
                    : level === "intermediate"
                    ? "bg-warning/20 border-warning text-warning"
                    : "bg-error/20 border-error text-error"
                  : "bg-surface-card border-surface-divider text-muted-foreground hover:border-bronze/50",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {metadata.difficulty === "beginner" &&
            "Recommended for new players or casual sessions"}
          {metadata.difficulty === "intermediate" &&
            "Some experience recommended, balanced challenge"}
          {metadata.difficulty === "advanced" &&
            "For experienced players seeking a tough challenge"}
        </p>
      </div>

      {/* Visibility */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-muted-foreground">
          Visibility
        </label>
        <div className="flex gap-2">
          {(["private", "unlisted", "public"] as const).map((vis) => (
            <button
              key={vis}
              type="button"
              onClick={() => handleChange("visibility", vis)}
              disabled={disabled}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium",
                "border transition-all",
                metadata.visibility === vis
                  ? "bg-bronze/20 border-bronze text-bronze"
                  : "bg-surface-card border-surface-divider text-muted-foreground hover:border-bronze/50",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {vis.charAt(0).toUpperCase() + vis.slice(1)}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {metadata.visibility === "private" && "Only you can see this adventure"}
          {metadata.visibility === "unlisted" && "Anyone with the link can see it"}
          {metadata.visibility === "public" && "Listed in the public library"}
        </p>
      </div>

      {/* Recommended Players */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-muted-foreground">
          Recommended Players
        </label>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              type="number"
              min={1}
              max={12}
              value={metadata.recommendedPlayers.min}
              onChange={(e) =>
                handleChange("recommendedPlayers", {
                  ...metadata.recommendedPlayers,
                  min: Math.max(1, parseInt(e.target.value) || 1),
                })
              }
              disabled={disabled}
            />
            <span className="text-xs text-muted-foreground mt-1 block">Min</span>
          </div>
          <span className="text-muted-foreground">to</span>
          <div className="flex-1">
            <Input
              type="number"
              min={1}
              max={12}
              value={metadata.recommendedPlayers.max}
              onChange={(e) =>
                handleChange("recommendedPlayers", {
                  ...metadata.recommendedPlayers,
                  max: Math.max(
                    metadata.recommendedPlayers.min,
                    parseInt(e.target.value) || 1
                  ),
                })
              }
              disabled={disabled}
            />
            <span className="text-xs text-muted-foreground mt-1 block">Max</span>
          </div>
        </div>
      </div>
    </div>
  );
}
