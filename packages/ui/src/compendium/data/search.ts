/**
 * Compendium Search Utilities
 * 
 * Client-side search functionality for the compendium.
 */

import type { CompendiumEntry, CompendiumType, SearchResult, SearchFilters } from "../types";
import { CLASSES } from "./classes";
import { ITEMS } from "./items";
import { MONSTERS } from "./monsters";
import { ABILITIES } from "./abilities";
import { CONDITIONS } from "./conditions";
import { RULES } from "./rules";

// Combine all entries
export const ALL_ENTRIES: CompendiumEntry[] = [
  ...CLASSES,
  ...ITEMS,
  ...MONSTERS,
  ...ABILITIES,
  ...CONDITIONS,
  ...RULES,
];

// Build search index
const searchIndex = new Map<string, Set<string>>();

function buildSearchIndex() {
  if (searchIndex.size > 0) return; // Already built

  ALL_ENTRIES.forEach((entry) => {
    const terms = extractSearchTerms(entry);
    terms.forEach((term) => {
      if (!searchIndex.has(term)) {
        searchIndex.set(term, new Set());
      }
      searchIndex.get(term)!.add(entry.id);
    });
  });
}

function extractSearchTerms(entry: CompendiumEntry): string[] {
  const text = [
    entry.title,
    entry.summary,
    entry.content,
    entry.category,
    entry.subcategory || "",
    ...entry.tags,
  ].join(" ");

  return text
    .toLowerCase()
    .split(/\W+/)
    .filter((term) => term.length > 2);
}

/**
 * Get an entry by ID
 */
export function getEntryById(id: string): CompendiumEntry | undefined {
  return ALL_ENTRIES.find((entry) => entry.id === id);
}

/**
 * Get an entry by slug
 */
export function getEntryBySlug(slug: string): CompendiumEntry | undefined {
  return ALL_ENTRIES.find((entry) => entry.slug === slug);
}

/**
 * Get all entries of a specific type
 */
export function getEntriesByType(type: CompendiumType): CompendiumEntry[] {
  return ALL_ENTRIES.filter((entry) => entry.type === type);
}

/**
 * Get entries by category
 */
export function getEntriesByCategory(category: string): CompendiumEntry[] {
  return ALL_ENTRIES.filter((entry) => entry.category === category);
}

/**
 * Get entries by subcategory
 */
export function getEntriesBySubcategory(
  category: string,
  subcategory: string
): CompendiumEntry[] {
  return ALL_ENTRIES.filter(
    (entry) => entry.category === category && entry.subcategory === subcategory
  );
}

/**
 * Search entries with ranking
 */
export function searchEntries(filters: SearchFilters): SearchResult[] {
  buildSearchIndex();

  const { query, type, category, tags } = filters;
  const searchTerms = query.toLowerCase().split(/\W+/).filter((t) => t.length > 2);

  if (searchTerms.length === 0 && !type && !category) {
    return [];
  }

  // Find matching entries
  const scores = new Map<string, number>();

  // Search by terms
  searchTerms.forEach((term) => {
    // Exact matches
    const exactMatches = searchIndex.get(term) || new Set();
    exactMatches.forEach((id) => {
      scores.set(id, (scores.get(id) || 0) + 2);
    });

    // Prefix matches
    searchIndex.forEach((ids, indexTerm) => {
      if (indexTerm.startsWith(term) && indexTerm !== term) {
        ids.forEach((id) => {
          scores.set(id, (scores.get(id) || 0) + 1);
        });
      }
    });
  });

  // If no search terms but filters exist, include all entries with base score
  if (searchTerms.length === 0) {
    ALL_ENTRIES.forEach((entry) => {
      scores.set(entry.id, 1);
    });
  }

  // Get entries and apply filters
  let results: SearchResult[] = [];

  scores.forEach((score, id) => {
    const entry = getEntryById(id);
    if (!entry) return;

    // Apply type filter
    if (type && entry.type !== type) return;

    // Apply category filter
    if (category && entry.category !== category) return;

    // Apply tag filter
    if (tags && tags.length > 0) {
      const hasTag = tags.some((tag) => entry.tags.includes(tag));
      if (!hasTag) return;
    }

    // Boost score for title matches
    if (searchTerms.some((term) => entry.title.toLowerCase().includes(term))) {
      score += 5;
    }

    // Generate highlights
    const entryHighlights: { field: string; snippet: string }[] = [];

    searchTerms.forEach((term) => {
      if (entry.title.toLowerCase().includes(term)) {
        entryHighlights.push({
          field: "title",
          snippet: highlightTerm(entry.title, term),
        });
      }
      if (entry.summary.toLowerCase().includes(term)) {
        entryHighlights.push({
          field: "summary",
          snippet: highlightTerm(entry.summary, term),
        });
      }
    });

    results.push({
      entry,
      score,
      highlights: entryHighlights,
    });
  });

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Highlight a term in text
 */
function highlightTerm(text: string, term: string): string {
  const regex = new RegExp(`(${term})`, "gi");
  return text.replace(regex, "**$1**");
}

/**
 * Get related entries for an entry
 */
export function getRelatedEntries(entry: CompendiumEntry): CompendiumEntry[] {
  return entry.relatedEntries
    .map((id) => getEntryById(id))
    .filter((e): e is CompendiumEntry => e !== undefined);
}

/**
 * Get category statistics
 */
export function getCategoryStats(): {
  type: CompendiumType;
  name: string;
  icon: string;
  count: number;
  subcategories: { name: string; count: number }[];
}[] {
  const typeConfig: Record<CompendiumType, { name: string; icon: string }> = {
    rule: { name: "Rules", icon: "📖" },
    class: { name: "Classes", icon: "⚔️" },
    ability: { name: "Abilities", icon: "✨" },
    item: { name: "Items", icon: "📦" },
    monster: { name: "Monsters", icon: "👹" },
    condition: { name: "Conditions", icon: "💫" },
  };

  const stats: Record<CompendiumType, Map<string, number>> = {
    rule: new Map(),
    class: new Map(),
    ability: new Map(),
    item: new Map(),
    monster: new Map(),
    condition: new Map(),
  };

  ALL_ENTRIES.forEach((entry) => {
    const subcategory = entry.subcategory || "General";
    const current = stats[entry.type].get(subcategory) || 0;
    stats[entry.type].set(subcategory, current + 1);
  });

  return (Object.keys(typeConfig) as CompendiumType[]).map((type) => ({
    type,
    ...typeConfig[type],
    count: getEntriesByType(type).length,
    subcategories: Array.from(stats[type].entries()).map(([name, count]) => ({
      name,
      count,
    })),
  }));
}

/**
 * Get suggestions for search
 */
export function getSearchSuggestions(partial: string): string[] {
  if (partial.length < 2) return [];

  const lower = partial.toLowerCase();
  const suggestions = new Set<string>();

  // Add matching titles
  ALL_ENTRIES.forEach((entry) => {
    if (entry.title.toLowerCase().includes(lower)) {
      suggestions.add(entry.title);
    }
  });

  // Add matching tags
  ALL_ENTRIES.forEach((entry) => {
    entry.tags.forEach((tag) => {
      if (tag.toLowerCase().includes(lower)) {
        suggestions.add(tag);
      }
    });
  });

  return Array.from(suggestions).slice(0, 10);
}

/**
 * Get recently updated entries
 */
export function getRecentlyUpdated(limit: number = 10): CompendiumEntry[] {
  return [...ALL_ENTRIES]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}
