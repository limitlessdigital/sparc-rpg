import * as React from "react";
import { cn } from "./lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message - puts input in error state when present */
  error?: string;
  /** Helper text shown below input (when no error) */
  helperText?: string;
  /** Icon to display at the start of the input */
  startIcon?: React.ReactNode;
  /** Icon to display at the end of the input */
  endIcon?: React.ReactNode;
}

/**
 * Input component with SPARC design system styling
 * Supports labels, error states, helper text, and icons
 * 
 * @example
 * ```tsx
 * <Input label="Character Name" placeholder="Enter name..." />
 * <Input label="Email" type="email" error="Invalid email address" />
 * <Input startIcon={<SearchIcon />} placeholder="Search..." />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      startIcon,
      endIcon,
      id,
      ...props
    },
    ref
  ) => {
    // Generate unique ID - always call useId for consistent hook ordering
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-2 text-sm font-medium text-muted-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
              {startIcon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            ref={ref}
            className={cn(
              "w-full px-4 py-3",
              "bg-surface-card border rounded-md",
              "text-foreground text-base placeholder:text-muted",
              "transition-all duration-fast",
              "focus:outline-none focus:border-bronze focus:ring-2 focus:ring-bronze/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-error focus:border-error focus:ring-error/20"
                : "border-surface-divider",
              startIcon && "pl-10",
              endIcon && "pr-10",
              className
            )}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
              {endIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-error" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-xs text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

/**
 * Textarea component with SPARC design system styling
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    // Generate unique ID - always call useId for consistent hook ordering
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block mb-2 text-sm font-medium text-muted-foreground"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            "w-full px-4 py-3 min-h-[100px]",
            "bg-surface-card border rounded-md",
            "text-foreground text-base placeholder:text-muted",
            "transition-all duration-fast resize-y",
            "focus:outline-none focus:border-bronze focus:ring-2 focus:ring-bronze/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-error focus:border-error focus:ring-error/20"
              : "border-surface-divider",
            className
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-error" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-xs text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
