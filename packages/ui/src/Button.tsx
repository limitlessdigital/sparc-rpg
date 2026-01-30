import * as React from "react";
import { cn } from "./lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "default" | "destructive";
  /** Size of the button */
  size?: "sm" | "md" | "lg";
  /** Loading state - shows spinner and disables interaction */
  loading?: boolean;
  /** Optional icon to display before children */
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Button component with SPARC design system styling
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md">Click me</Button>
 * <Button variant="secondary" loading>Loading...</Button>
 * <Button variant="danger" icon={<TrashIcon />}>Delete</Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      "inline-flex items-center justify-center gap-2",
      "font-semibold transition-all duration-fast",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base",
      "disabled:pointer-events-none disabled:opacity-50",
      "active:scale-[0.98]"
    );

    const variants = {
      primary: cn(
        "bg-gradient-to-br from-bronze to-bronze-600",
        "text-white border-none",
        "hover:brightness-110",
        "focus-visible:ring-bronze"
      ),
      secondary: cn(
        "bg-transparent",
        "text-bronze border-2 border-bronze",
        "hover:bg-bronze/10",
        "focus-visible:ring-bronze"
      ),
      ghost: cn(
        "bg-transparent",
        "text-muted-foreground",
        "hover:text-foreground hover:bg-surface-elevated",
        "focus-visible:ring-bronze"
      ),
      danger: cn(
        "bg-error text-white",
        "hover:bg-error-dark",
        "focus-visible:ring-error"
      ),
      // Aliases for shadcn/radix compatibility
      outline: cn(
        "bg-transparent",
        "text-bronze border-2 border-bronze",
        "hover:bg-bronze/10",
        "focus-visible:ring-bronze"
      ),
      default: cn(
        "bg-surface-elevated",
        "text-foreground border border-surface-divider",
        "hover:bg-surface-card",
        "focus-visible:ring-bronze"
      ),
      destructive: cn(
        "bg-error text-white",
        "hover:bg-error-dark",
        "focus-visible:ring-error"
      ),
    };

    const sizes = {
      sm: "h-8 px-3 text-sm rounded-md",
      md: "h-10 px-4 text-sm rounded-md",
      lg: "h-12 px-6 text-base rounded-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          icon
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
