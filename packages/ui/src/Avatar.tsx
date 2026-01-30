import * as React from "react";
import { cn } from "./lib/utils";

/**
 * Avatar component with SPARC design system styling
 * Supports images with fallback to initials
 * 
 * @example
 * ```tsx
 * <Avatar src={user.avatarUrl} alt={user.name} size="md" />
 * <Avatar fallback="JD" size="lg" />
 * <AvatarGroup users={players} max={4} />
 * ```
 */

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image source URL */
  src?: string | null;
  /** Alt text for the image */
  alt?: string;
  /** Fallback text (usually initials) when no image */
  fallback?: string;
  /** Size of the avatar */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Online status indicator */
  status?: "online" | "away" | "offline";
  /** Whether the avatar is a bordered ring style */
  ring?: boolean;
}

export function Avatar({
  src,
  alt,
  fallback,
  size = "md",
  status,
  ring = false,
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const showFallback = !src || imageError;

  const sizes = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const statusSizes = {
    xs: "w-2 h-2 border",
    sm: "w-2.5 h-2.5 border",
    md: "w-3 h-3 border-2",
    lg: "w-3.5 h-3.5 border-2",
    xl: "w-4 h-4 border-2",
  };

  const statusColors = {
    online: "bg-success",
    away: "bg-warning",
    offline: "bg-muted",
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full",
        "bg-surface-elevated overflow-hidden",
        ring && "ring-2 ring-bronze ring-offset-2 ring-offset-surface-base",
        sizes[size],
        className
      )}
      {...props}
    >
      {showFallback ? (
        <span className="font-medium text-muted-foreground uppercase select-none">
          {fallback || "?"}
        </span>
      ) : (
        <img
          src={src!}
          alt={alt || "Avatar"}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-surface-card",
            statusSizes[size],
            statusColors[status]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}

export interface AvatarGroupProps {
  /** Array of avatar data */
  avatars: Array<{
    src?: string | null;
    alt?: string;
    fallback?: string;
  }>;
  /** Maximum number of avatars to show */
  max?: number;
  /** Size of avatars */
  size?: AvatarProps["size"];
  /** Additional class names */
  className?: string;
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = "md",
  className,
}: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  const overlapSizes = {
    xs: "-ml-2",
    sm: "-ml-2.5",
    md: "-ml-3",
    lg: "-ml-4",
    xl: "-ml-5",
  };

  return (
    <div className={cn("flex items-center", className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          alt={avatar.alt}
          fallback={avatar.fallback}
          size={size}
          className={cn(
            index > 0 && overlapSizes[size],
            "ring-2 ring-surface-base"
          )}
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            "inline-flex items-center justify-center rounded-full",
            "bg-surface-elevated ring-2 ring-surface-base",
            "text-xs font-medium text-muted-foreground",
            overlapSizes[size],
            {
              xs: "w-6 h-6",
              sm: "w-8 h-8",
              md: "w-10 h-10",
              lg: "w-12 h-12",
              xl: "w-16 h-16",
            }[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
