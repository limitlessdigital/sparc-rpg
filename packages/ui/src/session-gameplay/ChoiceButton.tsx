"use client";

import { cn } from "../lib/utils";

export interface Choice {
  id: string;
  text: string;
  type?: "default" | "combat" | "challenge" | "danger";
  disabled?: boolean;
}

export interface ChoiceButtonProps {
  /** Choice data */
  choice: Choice;
  /** Click handler */
  onClick?: (choice: Choice) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Selected state */
  isSelected?: boolean;
  /** Custom class name */
  className?: string;
}

export function ChoiceButton({
  choice,
  onClick,
  isLoading = false,
  isSelected = false,
  className,
}: ChoiceButtonProps) {
  const baseStyles = cn(
    // Base styles
    "relative w-full px-4 py-3 text-sm font-bold uppercase tracking-wide",
    "border-2 rounded-lg transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a1628]",
    // Text styling
    "text-center leading-tight",
    // Disabled state
    choice.disabled && "opacity-50 cursor-not-allowed",
    !choice.disabled && "cursor-pointer",
  );

  // Color variants based on choice type
  const variantStyles = {
    default: cn(
      "bg-gradient-to-b from-[#2a4a6c] to-[#1a3a5c]",
      "border-[#4a7aa0] hover:border-bronze-400",
      "text-[#8ab4dc] hover:text-white",
      "hover:from-[#3a5a7c] hover:to-[#2a4a6c]",
      "focus:ring-bronze-500",
      isSelected && "border-gold bg-gold/10 text-gold"
    ),
    combat: cn(
      "bg-gradient-to-b from-[#8B4513] to-[#6B3410]",
      "border-bronze-400 hover:border-gold",
      "text-[#FFD9A0] hover:text-white",
      "hover:from-bronze-500 hover:to-[#8B4513]",
      "focus:ring-bronze-400",
      "shadow-[0_2px_8px_rgba(204,122,0,0.3)]",
      isSelected && "border-gold bg-gold/20 text-gold"
    ),
    challenge: cn(
      "bg-gradient-to-b from-[#5a4a00] to-[#3a3000]",
      "border-[#aa8a00] hover:border-gold",
      "text-[#ffd700] hover:text-white",
      "hover:from-[#6a5a00] hover:to-[#4a4000]",
      "focus:ring-gold",
      isSelected && "border-gold bg-gold/20"
    ),
    danger: cn(
      "bg-gradient-to-b from-[#6a1a1a] to-[#4a0a0a]",
      "border-error hover:border-error-light",
      "text-[#ff8a8a] hover:text-white",
      "hover:from-[#7a2a2a] hover:to-[#5a1a1a]",
      "focus:ring-error",
      isSelected && "border-error-light bg-error/20"
    ),
  };

  const type = choice.type || "default";

  return (
    <button
      type="button"
      disabled={choice.disabled || isLoading}
      onClick={() => onClick?.(choice)}
      className={cn(baseStyles, variantStyles[type], className)}
    >
      {/* Bronze/Gold edge highlight */}
      <div className={cn(
        "absolute inset-x-0 top-0 h-[1px]",
        type === "combat" ? "bg-gradient-to-r from-transparent via-gold/50 to-transparent" :
        type === "challenge" ? "bg-gradient-to-r from-transparent via-gold/30 to-transparent" :
        "bg-gradient-to-r from-transparent via-[#6a9acc]/30 to-transparent"
      )} />

      {/* Button content */}
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        choice.text
      )}
    </button>
  );
}

export interface ChoiceButtonGroupProps {
  /** Array of choices */
  choices: Choice[];
  /** Click handler */
  onSelect?: (choice: Choice) => void;
  /** Selected choice ID */
  selectedId?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Layout direction */
  layout?: "horizontal" | "vertical";
  /** Custom class name */
  className?: string;
}

export function ChoiceButtonGroup({
  choices,
  onSelect,
  selectedId,
  isLoading = false,
  layout = "horizontal",
  className,
}: ChoiceButtonGroupProps) {
  return (
    <div
      className={cn(
        "flex gap-3",
        layout === "horizontal" ? "flex-row flex-wrap justify-center" : "flex-col",
        className
      )}
    >
      {choices.map((choice) => (
        <ChoiceButton
          key={choice.id}
          choice={choice}
          onClick={onSelect}
          isSelected={selectedId === choice.id}
          isLoading={isLoading && selectedId === choice.id}
          className={layout === "horizontal" ? "flex-1 min-w-[200px] max-w-[300px]" : "w-full"}
        />
      ))}
    </div>
  );
}
