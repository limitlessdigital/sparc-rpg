"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "../lib/utils";
import { Modal, ModalBody } from "../Modal";
import type { CompendiumEntry, CompendiumType, SearchFilters, SearchResult } from "./types";
import { CompendiumSearch } from "./CompendiumSearch";
import { CompendiumCategories, CompendiumSubcategories } from "./CompendiumCategories";
import { CompendiumEntryCard } from "./CompendiumEntryCard";
import { CompendiumEntryDetail } from "./CompendiumEntryDetail";
import { PinnedCardsContainer } from "./QuickReferenceCard";
import { searchEntries, getEntriesByType, getEntryById, getRecentlyUpdated } from "./data/search";

export interface CompendiumPageProps {
  /** Initial search query */
  initialQuery?: string;
  /** Initial type filter */
  initialType?: CompendiumType;
  /** Bookmarked entry IDs */
  bookmarks?: string[];
  /** Callback when bookmark is toggled */
  onToggleBookmark?: (entryId: string) => void;
  /** Maximum pinned cards (default 3) */
  maxPinnedCards?: number;
  /** Custom className */
  className?: string;
}

export function CompendiumPage({
  initialQuery = "",
  initialType,
  bookmarks = [],
  onToggleBookmark,
  maxPinnedCards = 3,
  className,
}: CompendiumPageProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState<CompendiumType | undefined>(initialType);
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Selection state
  const [selectedEntry, setSelectedEntry] = useState<CompendiumEntry | null>(null);
  const [pinnedEntries, setPinnedEntries] = useState<CompendiumEntry[]>([]);

  // Recent entries
  const recentEntries = useMemo(() => getRecentlyUpdated(5), []);

  // Display entries
  const displayEntries = useMemo(() => {
    // If searching, show search results
    if (searchQuery.trim() || searchResults.length > 0) {
      return searchResults.map((r) => r.entry);
    }

    // If type selected, show entries of that type
    if (typeFilter) {
      let entries = getEntriesByType(typeFilter);
      if (subcategoryFilter) {
        entries = entries.filter((e) => e.subcategory === subcategoryFilter);
      }
      return entries.sort((a, b) => a.title.localeCompare(b.title));
    }

    // Otherwise show nothing (categories view)
    return [];
  }, [searchQuery, searchResults, typeFilter, subcategoryFilter]);

  // Handlers
  const handleSearch = useCallback((filters: SearchFilters) => {
    if (filters.query.trim()) {
      const results = searchEntries(filters);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, []);

  const handleTypeChange = useCallback((type: CompendiumType | undefined) => {
    setTypeFilter(type);
    setSubcategoryFilter(undefined);
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  const handleSelectEntry = useCallback((entry: CompendiumEntry) => {
    setSelectedEntry(entry);
  }, []);

  const handleCloseEntry = useCallback(() => {
    setSelectedEntry(null);
  }, []);

  const handleNavigateToEntry = useCallback((entryId: string) => {
    const entry = getEntryById(entryId);
    if (entry) {
      setSelectedEntry(entry);
    }
  }, []);

  const handleTogglePin = useCallback((entry: CompendiumEntry) => {
    setPinnedEntries((prev) => {
      const isPinned = prev.some((e) => e.id === entry.id);
      if (isPinned) {
        return prev.filter((e) => e.id !== entry.id);
      }
      if (prev.length >= maxPinnedCards) {
        // Remove oldest and add new
        return [...prev.slice(1), entry];
      }
      return [...prev, entry];
    });
  }, [maxPinnedCards]);

  const handleUnpin = useCallback((entryId: string) => {
    setPinnedEntries((prev) => prev.filter((e) => e.id !== entryId));
  }, []);

  const isBookmarked = useCallback(
    (entryId: string) => bookmarks.includes(entryId),
    [bookmarks]
  );

  const isPinned = useCallback(
    (entryId: string) => pinnedEntries.some((e) => e.id === entryId),
    [pinnedEntries]
  );

  return (
    <div className={cn("min-h-screen", className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-100 mb-2 flex items-center gap-3">
          📚 Compendium
        </h1>
        <p className="text-stone-400">
          Your complete reference for SPARC RPG rules, classes, items, and monsters.
        </p>
      </div>

      {/* Search */}
      <CompendiumSearch
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={handleSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={handleTypeChange}
        className="mb-6"
      />

      {/* Show categories when not searching */}
      {!searchQuery && !typeFilter && (
        <div className="space-y-8">
          {/* Categories */}
          <div>
            <h2 className="text-lg font-semibold text-stone-200 mb-4">Browse by Category</h2>
            <CompendiumCategories
              selectedType={typeFilter}
              onSelect={handleTypeChange}
            />
          </div>

          {/* Recently Updated */}
          {recentEntries.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-stone-200 mb-4">Recently Updated</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {recentEntries.map((entry) => (
                  <CompendiumEntryCard
                    key={entry.id}
                    entry={entry}
                    onClick={() => handleSelectEntry(entry)}
                    isBookmarked={isBookmarked(entry.id)}
                    onToggleBookmark={
                      onToggleBookmark ? () => onToggleBookmark(entry.id) : undefined
                    }
                    compact
                  />
                ))}
              </div>
            </div>
          )}

          {/* Bookmarks */}
          {bookmarks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-stone-200 mb-4">★ Your Bookmarks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {bookmarks.slice(0, 6).map((id) => {
                  const entry = getEntryById(id);
                  if (!entry) return null;
                  return (
                    <CompendiumEntryCard
                      key={entry.id}
                      entry={entry}
                      onClick={() => handleSelectEntry(entry)}
                      isBookmarked
                      onToggleBookmark={
                        onToggleBookmark ? () => onToggleBookmark(entry.id) : undefined
                      }
                      compact
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Show subcategories when type selected */}
      {typeFilter && !searchQuery && (
        <div className="mb-4">
          <button
            onClick={() => handleTypeChange(undefined)}
            className="text-amber-400 hover:text-amber-300 mb-3 flex items-center gap-1"
          >
            ← Back to Categories
          </button>
          <CompendiumSubcategories
            type={typeFilter}
            selectedSubcategory={subcategoryFilter}
            onSelect={setSubcategoryFilter}
          />
        </div>
      )}

      {/* Results */}
      {displayEntries.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-200">
              {searchQuery ? "Search Results" : `All ${typeFilter ? typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1) + "s" : "Entries"}`}
            </h2>
            <span className="text-sm text-stone-500">{displayEntries.length} entries</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayEntries.map((entry) => (
              <CompendiumEntryCard
                key={entry.id}
                entry={entry}
                onClick={() => handleSelectEntry(entry)}
                isBookmarked={isBookmarked(entry.id)}
                onToggleBookmark={
                  onToggleBookmark ? () => onToggleBookmark(entry.id) : undefined
                }
                showType={!typeFilter}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state for search */}
      {searchQuery && displayEntries.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-stone-400">No results found for "{searchQuery}"</p>
          <p className="text-sm text-stone-500 mt-2">
            Try different keywords or browse by category
          </p>
        </div>
      )}

      {/* Entry Detail Modal */}
      <Modal
        open={!!selectedEntry}
        onClose={handleCloseEntry}
        size="lg"
      >
        <ModalBody className="p-0">
          {selectedEntry && (
            <CompendiumEntryDetail
              entry={selectedEntry}
              onClose={handleCloseEntry}
              onNavigate={handleNavigateToEntry}
              isBookmarked={isBookmarked(selectedEntry.id)}
              onToggleBookmark={
                onToggleBookmark ? () => onToggleBookmark(selectedEntry.id) : undefined
              }
              isPinned={isPinned(selectedEntry.id)}
              onTogglePin={() => handleTogglePin(selectedEntry)}
            />
          )}
        </ModalBody>
      </Modal>

      {/* Pinned Cards */}
      <PinnedCardsContainer
        entries={pinnedEntries}
        onUnpin={handleUnpin}
        onExpand={handleSelectEntry}
      />
    </div>
  );
}
