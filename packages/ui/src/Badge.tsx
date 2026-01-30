import * as React from "react";
import { cn } from "./lib/utils";

/**
 * Badge component with SPARC design system styling
 * Used for labels, status indicators, and tags
 * 
 * @example
 * ```tsx
 * <Badge>Player</Badge>
 * <Badge variant="success">Online</Badge>
 * <Badge variant="attribute" attribute="might">Might +2</Badge>
 * ```
 */

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "outline"
  | "attribute"
  | "secondary"
  | "destructive";

// Official SPARC Attribute Types (Version E2)
export type AttributeType = "str" | "dex" | "int" | "cha";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visual style variant */
  variant?: BadgeVariant;
  /** Attribute type (only used with variant="attribute") */
  attribute?: AttributeType;
  /** Size of the badge */
  size?: "sm" | "md";
  /** Optional icon before text */
  icon?: React.ReactNode;
}

export function Badge({
  variant = "default",
  attribute,
  size = "md",
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  const baseStyles = cn(
    "inline-flex items-center justify-center gap-1",
    "font-medium rounded-full whitespace-nowrap"
  );

  const variants: Record<BadgeVariant, string> = {
    default: "bg-surface-elevated text-muted-foreground",
    success: "bg-success/20 text-success",
    warning: "bg-warning/20 text-warning",
    error: "bg-error/20 text-error",
    info: "bg-info/20 text-info",
    outline: "bg-transparent border border-surface-divider text-muted-foreground",
    attribute: "", // Handled separately
    secondary: "bg-surface-card text-muted-foreground",
    destructive: "bg-error text-white",
  };

  const attributeStyles: Record<AttributeType, string> = {
    str: "bg-str/20 text-str",
    dex: "bg-dex/20 text-dex",
    int: "bg-int/20 text-int",
    cha: "bg-cha/20 text-cha",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  };

  const variantStyle =
    variant === "attribute" && attribute
      ? attributeStyles[attribute]
      : variants[variant];

  return (
    <span
      className={cn(baseStyles, variantStyle, sizes[size], className)}
      {...props}
    >
      {icon && <span className="w-3 h-3">{icon}</span>}
      {children}
    </span>
  );
}

/**
 * Attribute icons for use with Badge (STR, DEX, INT, CHA)
 */
export const AttributeIcons: Record<AttributeType, React.ReactNode> = {
  str: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L4 7v7c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V7l-8-5zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 8H8v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1z" />
    </svg>
  ),
  dex: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  ),
  int: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 017 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
    </svg>
  ),
  cha: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
};
