"use client";

import * as React from "react";
import { cn, Input, Button } from "@sparc/ui";
import { 
  generateNameSuggestions, 
  validateCharacterName, 
  formatCharacterName 
} from "../class-data";

interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onValidate?: (isValid: boolean) => void;
  className?: string;
  autoFocus?: boolean;
}

/**
 * NameInput - Character name input with validation and suggestions
 * PRD 13: Name entry with suggestions and validation
 */
export function NameInput({
  value,
  onChange,
  error: externalError,
  onValidate,
  className,
  autoFocus = false,
}: NameInputProps) {
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [internalError, setInternalError] = React.useState<string | undefined>();

  const error = externalError || internalError;

  // Validate on change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear error while typing if previously invalid
    if (internalError) {
      setInternalError(undefined);
    }

    // Validate
    if (newValue.trim().length > 0) {
      const result = validateCharacterName(newValue);
      onValidate?.(result.valid);
      if (!result.valid && newValue.length >= 2) {
        setInternalError(result.error);
      }
    } else {
      onValidate?.(false);
    }
  };

  // Format on blur
  const handleBlur = () => {
    if (value.trim().length >= 2) {
      const formatted = formatCharacterName(value);
      if (formatted !== value) {
        onChange(formatted);
      }
      // Final validation
      const result = validateCharacterName(formatted);
      onValidate?.(result.valid);
      if (!result.valid) {
        setInternalError(result.error);
      }
    }
  };

  // Generate name suggestions
  const handleGenerateSuggestions = () => {
    setIsGenerating(true);
    // Small delay for UX feedback
    setTimeout(() => {
      const names = generateNameSuggestions(5);
      setSuggestions(names);
      setShowSuggestions(true);
      setIsGenerating(false);
    }, 200);
  };

  // Apply a suggested name
  const applySuggestion = (name: string) => {
    onChange(name);
    setShowSuggestions(false);
    setInternalError(undefined);
    onValidate?.(true);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Input
          data-testid="character-name-input"
          label="Character Name"
          placeholder="Enter a name for your hero..."
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          error={error}
          helperText={!error ? "2-50 characters, letters and spaces only" : undefined}
          className="text-lg"
        />
      </div>

      {/* Suggestion button */}
      <div className="flex items-center gap-3">
        <Button
          data-testid="suggest-name-button"
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleGenerateSuggestions}
          loading={isGenerating}
          className="flex items-center gap-2"
        >
          <span>🎲</span>
          Suggest Names
        </Button>

        {showSuggestions && suggestions.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSuggestions(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Hide suggestions
          </button>
        )}
      </div>

      {/* Suggestions list */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          className="flex flex-wrap gap-2 p-3 bg-surface-elevated rounded-lg border border-surface-divider"
          role="listbox"
          aria-label="Name suggestions"
        >
          {suggestions.map((name, i) => (
            <button
              key={i}
              type="button"
              role="option"
              onClick={() => applySuggestion(name)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium",
                "bg-surface-card border border-surface-divider",
                "hover:bg-bronze/10 hover:border-bronze/50",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze",
                "transition-colors"
              )}
            >
              {name}
            </button>
          ))}
          <button
            type="button"
            onClick={handleGenerateSuggestions}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm",
              "bg-transparent border border-dashed border-surface-divider",
              "hover:border-bronze/50 text-muted-foreground hover:text-foreground",
              "transition-colors"
            )}
            disabled={isGenerating}
          >
            {isGenerating ? "..." : "↻ More"}
          </button>
        </div>
      )}
    </div>
  );
}

export default NameInput;
