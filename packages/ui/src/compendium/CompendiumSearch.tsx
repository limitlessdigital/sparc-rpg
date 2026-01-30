"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "../lib/utils";
import { Input } from "../Input";
import type { CompendiumType, SearchFilters } from "./types";
import { getSearchSuggestions } from "./data/search";

export interface CompendiumSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (filters: SearchFilters) => void;
  typeFilter?: CompendiumType;
  onTypeFilterChange?: (type: CompendiumType | undefined) => void;
  placeholder?: string;
  className?: string;
}

const TYPE_OPTIONS: { value: CompendiumType; label: string; icon: string }[] = [
  { value: "rule", label: "Rules", icon: "📖" },
  { value: "class", label: "Classes", icon: "⚔️" },
  { value: "ability", label: "Abilities", icon: "✨" },
  { value: "item", label: "Items", icon: "📦" },
  { value: "monster", label: "Monsters", icon: "👹" },
  { value: "condition", label: "Conditions", icon: "💫" },
];

export function CompendiumSearch({
  value,
  onChange,
  onSearch,
  typeFilter,
  onTypeFilterChange,
  placeholder = "Search rules, items, monsters...",
  className,
}: CompendiumSearchProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch({
        query: value,
        type: typeFilter,
      });

      // Update suggestions
      if (value.length >= 2) {
        setSuggestions(getSearchSuggestions(value));
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, typeFilter, onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, suggestions.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        const selected = suggestions[selectedIndex];
        if (selected) {
          onChange(selected);
          setShowSuggestions(false);
          setSelectedIndex(-1);
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    },
    [suggestions, selectedIndex, onChange]
  );

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
            🔍
          </span>
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setShowSuggestions(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pl-10"
          />
          {value && (
            <button
              onClick={() => {
                onChange("");
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-stone-800 border border-stone-700 rounded-lg shadow-xl overflow-hidden"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => {
                  onChange(suggestion);
                  setShowSuggestions(false);
                }}
                className={cn(
                  "w-full px-4 py-2 text-left text-sm transition-colors",
                  index === selectedIndex
                    ? "bg-amber-500/20 text-amber-300"
                    : "text-stone-300 hover:bg-stone-700"
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Type Filters */}
      {onTypeFilterChange && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onTypeFilterChange(undefined)}
            className={cn(
              "px-3 py-1 text-sm rounded-full transition-colors",
              !typeFilter
                ? "bg-amber-500 text-stone-900"
                : "bg-stone-700 text-stone-300 hover:bg-stone-600"
            )}
          >
            All
          </button>
          {TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() =>
                onTypeFilterChange(
                  typeFilter === option.value ? undefined : option.value
                )
              }
              className={cn(
                "px-3 py-1 text-sm rounded-full transition-colors flex items-center gap-1",
                typeFilter === option.value
                  ? "bg-amber-500 text-stone-900"
                  : "bg-stone-700 text-stone-300 hover:bg-stone-600"
              )}
            >
              <span>{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
