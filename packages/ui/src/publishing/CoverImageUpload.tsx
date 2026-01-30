"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "../Button";

export interface CoverImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Cover image upload component for adventures
 * Supports URL input and drag-drop (placeholder for file upload)
 */
export function CoverImageUpload({
  value,
  onChange,
  disabled = false,
  className,
}: CoverImageUploadProps) {
  const [urlInput, setUrlInput] = React.useState("");
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    
    // Basic URL validation
    try {
      new URL(urlInput);
      onChange(urlInput);
      setUrlInput("");
      setError(null);
    } catch {
      setError("Invalid URL format");
    }
  };

  const handleRemove = () => {
    onChange(undefined);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    // Check for URL in dropped text
    const url = e.dataTransfer.getData("text/plain");
    if (url) {
      try {
        new URL(url);
        onChange(url);
        setError(null);
      } catch {
        setError("Invalid URL dropped");
      }
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <label className="block text-sm font-medium text-muted-foreground">
        Cover Image
      </label>

      {/* Preview / Drop Zone */}
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed overflow-hidden",
          "transition-all duration-200",
          isDragging
            ? "border-bronze bg-bronze/10"
            : value
            ? "border-surface-divider"
            : "border-surface-divider hover:border-bronze/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {value ? (
          <div className="relative aspect-video">
            <img
              src={value}
              alt="Cover preview"
              className="w-full h-full object-cover"
              onError={() => setError("Failed to load image")}
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRemove}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video flex flex-col items-center justify-center p-6 text-center">
            <div className="text-4xl mb-2">🖼️</div>
            <p className="text-sm text-muted-foreground mb-1">
              Drag & drop an image URL here
            </p>
            <p className="text-xs text-muted">
              Or enter a URL below
            </p>
          </div>
        )}
      </div>

      {/* URL Input */}
      {!value && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
            placeholder="https://example.com/image.jpg"
            disabled={disabled}
            className={cn(
              "flex-1 px-3 py-2 rounded-md",
              "bg-surface-card border border-surface-divider",
              "text-sm text-foreground placeholder:text-muted",
              "focus:outline-none focus:border-bronze focus:ring-2 focus:ring-bronze/20",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleUrlSubmit}
            disabled={disabled || !urlInput.trim()}
          >
            Add
          </Button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-error">{error}</p>
      )}

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground">
        Recommended size: 1280×720 pixels (16:9 aspect ratio)
      </p>
    </div>
  );
}
