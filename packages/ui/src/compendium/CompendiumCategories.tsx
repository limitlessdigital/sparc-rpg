"use client";

import { cn } from "../lib/utils";
import type { CompendiumType } from "./types";
import { getCategoryStats } from "./data/search";

export interface CompendiumCategoriesProps {
  selectedType?: CompendiumType;
  onSelect: (type: CompendiumType) => void;
  className?: string;
}

export function CompendiumCategories({
  selectedType,
  onSelect,
  className,
}: CompendiumCategoriesProps) {
  const categories = getCategoryStats();

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3", className)}>
      {categories.map((category) => (
        <button
          key={category.type}
          onClick={() => onSelect(category.type)}
          className={cn(
            "p-4 rounded-lg border transition-all text-center",
            selectedType === category.type
              ? "bg-amber-500/20 border-amber-500 text-amber-300"
              : "bg-stone-800 border-stone-700 text-stone-300 hover:border-amber-500/50 hover:bg-stone-700"
          )}
        >
          <div className="text-3xl mb-2">{category.icon}</div>
          <div className="font-medium">{category.name}</div>
          <div className="text-sm text-stone-400">({category.count})</div>
        </button>
      ))}
    </div>
  );
}

export interface CompendiumSubcategoriesProps {
  type: CompendiumType;
  selectedSubcategory?: string;
  onSelect: (subcategory: string | undefined) => void;
  className?: string;
}

export function CompendiumSubcategories({
  type,
  selectedSubcategory,
  onSelect,
  className,
}: CompendiumSubcategoriesProps) {
  const categories = getCategoryStats();
  const category = categories.find((c) => c.type === type);

  if (!category || category.subcategories.length <= 1) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <button
        onClick={() => onSelect(undefined)}
        className={cn(
          "px-3 py-1 text-sm rounded-full transition-colors",
          !selectedSubcategory
            ? "bg-amber-500 text-stone-900"
            : "bg-stone-700 text-stone-300 hover:bg-stone-600"
        )}
      >
        All {category.name}
      </button>
      {category.subcategories.map((sub) => (
        <button
          key={sub.name}
          onClick={() =>
            onSelect(selectedSubcategory === sub.name ? undefined : sub.name)
          }
          className={cn(
            "px-3 py-1 text-sm rounded-full transition-colors",
            selectedSubcategory === sub.name
              ? "bg-amber-500 text-stone-900"
              : "bg-stone-700 text-stone-300 hover:bg-stone-600"
          )}
        >
          {sub.name} ({sub.count})
        </button>
      ))}
    </div>
  );
}
