import * as React from "react";
import { cn } from "./lib/utils";

/**
 * Select/Dropdown component with SPARC design system styling
 * Native select with custom styling for accessibility
 * 
 * @example
 * ```tsx
 * <Select label="Class" value={classId} onChange={setClassId}>
 *   <SelectOption value="warrior">Warrior</SelectOption>
 *   <SelectOption value="mage">Mage</SelectOption>
 *   <SelectOption value="rogue">Rogue</SelectOption>
 * </Select>
 * ```
 */

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  /** Label text displayed above the select */
  label?: string;
  /** Error message - puts select in error state when present */
  error?: string;
  /** Helper text shown below select (when no error) */
  helperText?: string;
  /** Options as array (alternative to children) */
  options?: SelectOption[];
  /** Placeholder option text */
  placeholder?: string;
  /** Controlled value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      placeholder,
      value,
      onChange,
      children,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    // Generate unique ID - always call useId for consistent hook ordering
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block mb-2 text-sm font-medium text-muted-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={cn(
              "w-full px-4 py-3 pr-10 appearance-none",
              "bg-surface-card border rounded-md",
              "text-foreground text-base",
              "transition-all duration-fast cursor-pointer",
              "focus:outline-none focus:border-bronze focus:ring-2 focus:ring-bronze/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-error focus:border-error focus:ring-error/20"
                : "border-surface-divider",
              !value && placeholder && "text-muted",
              className
            )}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))
              : children}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
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

Select.displayName = "Select";

/**
 * SelectOption component for use as children of Select
 */
export interface SelectOptionProps extends React.OptionHTMLAttributes<HTMLOptionElement> {}

export function SelectOption({ children, ...props }: SelectOptionProps) {
  return <option {...props}>{children}</option>;
}
