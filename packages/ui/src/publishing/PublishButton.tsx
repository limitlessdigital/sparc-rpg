"use client";


import { cn } from "../lib/utils";
import { Button } from "../Button";
import type { PublishValidation, AdventureVisibility } from "./types";

export interface PublishButtonProps {
  /** Whether the adventure is already published */
  isPublished?: boolean;
  /** Current visibility if published */
  visibility?: AdventureVisibility;
  /** Validation result */
  validation?: PublishValidation;
  /** Click handler */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional class names */
  className?: string;
}

/**
 * Publish button component for adventure editor header
 * Shows status and navigates to publish flow
 */
export function PublishButton({
  isPublished = false,
  visibility = "private",
  validation,
  onClick,
  disabled = false,
  loading = false,
  size = "sm",
  className,
}: PublishButtonProps) {
  const canPublish = validation?.canPublish !== false;

  // Determine button state and text
  const getButtonContent = () => {
    if (isPublished) {
      const visibilityIcon =
        visibility === "public" ? "🌍" : visibility === "unlisted" ? "🔗" : "🔒";
      return (
        <>
          <span>{visibilityIcon}</span>
          <span>Published</span>
        </>
      );
    }

    if (!canPublish && validation) {
      return (
        <>
          <span className="text-error">⚠</span>
          <span>Fix Issues</span>
        </>
      );
    }

    return "Publish";
  };

  const getTooltip = () => {
    if (isPublished) {
      return `Adventure is ${visibility}. Click to manage.`;
    }
    if (!canPublish && validation && validation.errors.length > 0) {
      return `${validation.errors.length} issue(s) must be fixed before publishing`;
    }
    return "Publish this adventure to the library";
  };

  return (
    <Button
      variant={isPublished ? "secondary" : canPublish ? "primary" : "secondary"}
      size={size}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      title={getTooltip()}
      className={cn(
        isPublished && "border-success/50 text-success hover:bg-success/10",
        !canPublish && !isPublished && "border-error/50 text-error hover:bg-error/10",
        className
      )}
    >
      {getButtonContent()}
    </Button>
  );
}
