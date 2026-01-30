/**
 * HomebrewBrowser - Browse and discover community homebrew content
 * Based on PRD 25: Homebrew System
 */

import { cn } from "../lib/utils";
import { Button } from "../Button";
import { Input } from "../Input";
import { Select, SelectOption } from "../Select";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../Card";
import { Badge } from "../Badge";
import { Spinner } from "../Loading";
import {
  HomebrewSummary,
  HomebrewCategory,
  HomebrewBrowseFilters,
  HomebrewBrowseFacets,
  HomebrewSortBy,
} from "./types";

// ============================================
// Props & Types
// ============================================

export interface HomebrewBrowserProps {
  /** Homebrew items to display */
  items: HomebrewSummary[];
  /** Loading state */
  loading?: boolean;
  /** Total count for pagination */
  total?: number;
  /** Facets for filtering */
  facets?: HomebrewBrowseFacets;
  /** Current filters */
  filters?: HomebrewBrowseFilters;
  /** Called when filters change */
  onFilterChange?: (filters: HomebrewBrowseFilters) => void;
  /** Called when importing homebrew */
  onImport?: (id: string) => void;
  /** Called when favoriting */
  onFavorite?: (id: string) => void;
  /** Called when viewing details */
  onView?: (id: string) => void;
  /** Called when loading more */
  onLoadMore?: () => void;
  /** Has more items to load */
  hasMore?: boolean;
  /** Set of favorited IDs */
  favorites?: Set<string>;
  /** Set of imported IDs */
  imported?: Set<string>;
  /** Additional class name */
  className?: string;
}

// ============================================
// Constants
// ============================================

const CATEGORY_ICONS: Record<HomebrewCategory, string> = {
  monster: '🐉',
  item: '🗡️',
  ability: '⚡',
  spell: '✨',
  class: '⚔️',
};

const SORT_OPTIONS: { value: HomebrewSortBy; label: string }[] = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'updated', label: 'Recently Updated' },
];

// ============================================
// Sub-Components
// ============================================

function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  
  return (
    <span className="text-amber-400">
      {'★'.repeat(fullStars)}
      {hasHalf && '½'}
      {'☆'.repeat(5 - fullStars - (hasHalf ? 1 : 0))}
    </span>
  );
}

function HomebrewCard({
  item,
  onImport,
  onFavorite,
  onView,
  isFavorite,
  isImported,
}: {
  item: HomebrewSummary;
  onImport?: () => void;
  onFavorite?: () => void;
  onView?: () => void;
  isFavorite?: boolean;
  isImported?: boolean;
}) {
  const icon = CATEGORY_ICONS[item.category];

  return (
    <Card 
      interactive 
      onClick={onView}
      className="flex flex-col"
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="text-3xl">{icon}</div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{item.name}</CardTitle>
            <p className="text-xs text-muted-foreground capitalize">
              {item.category} • by {item.creatorName}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {item.description || 'No description'}
        </p>
        
        <div className="flex items-center gap-2 text-sm mb-2">
          <RatingStars rating={item.averageRating} />
          <span className="text-muted-foreground">
            ({item.ratingCount.toLocaleString()})
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>👥 {item.usageCount.toLocaleString()} uses</span>
        </div>
        
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex gap-2 w-full">
          <Button
            variant={isImported ? 'secondary' : 'primary'}
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onImport?.();
            }}
            disabled={isImported}
          >
            {isImported ? '✓ Imported' : 'Import'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onFavorite?.();
            }}
            className={cn(isFavorite && 'text-red-400')}
          >
            {isFavorite ? '❤️' : '♡'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function FilterBar({
  filters,
  facets,
  onChange,
}: {
  filters: HomebrewBrowseFilters;
  facets?: HomebrewBrowseFacets;
  onChange: (filters: HomebrewBrowseFilters) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Search homebrew..."
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full"
        />
      </div>

      {/* Category */}
      <Select
        value={filters.category || 'all'}
        onChange={(v) => onChange({ ...filters, category: v === 'all' ? undefined : v as HomebrewCategory })}
      >
        <SelectOption value="all">All Types</SelectOption>
        {facets?.categories.map(cat => (
          <SelectOption key={cat.category} value={cat.category}>
            {CATEGORY_ICONS[cat.category]} {cat.category.charAt(0).toUpperCase() + cat.category.slice(1)} ({cat.count})
          </SelectOption>
        ))}
      </Select>

      {/* Sort */}
      <Select
        value={filters.sortBy || 'popular'}
        onChange={(v) => onChange({ ...filters, sortBy: v as HomebrewSortBy })}
      >
        {SORT_OPTIONS.map(opt => (
          <SelectOption key={opt.value} value={opt.value}>
            {opt.label}
          </SelectOption>
        ))}
      </Select>

      {/* Min Rating */}
      <Select
        value={filters.minRating?.toString() || '0'}
        onChange={(v) => onChange({ ...filters, minRating: parseInt(v) || undefined })}
      >
        <SelectOption value="0">Any Rating</SelectOption>
        <SelectOption value="3">3+ Stars</SelectOption>
        <SelectOption value="4">4+ Stars</SelectOption>
        <SelectOption value="5">5 Stars Only</SelectOption>
      </Select>
    </div>
  );
}

function TagFilter({
  tags,
  selected,
  onChange,
}: {
  tags: { tag: string; count: number }[];
  selected: string[];
  onChange: (tags: string[]) => void;
}) {
  if (!tags || tags.length === 0) return null;

  const toggleTag = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.slice(0, 20).map(({ tag, count }) => (
        <Badge
          key={tag}
          variant={selected.includes(tag) ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => toggleTag(tag)}
        >
          {tag} ({count})
        </Badge>
      ))}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function HomebrewBrowser({
  items,
  loading = false,
  total = 0,
  facets,
  filters = {},
  onFilterChange,
  onImport,
  onFavorite,
  onView,
  onLoadMore,
  hasMore = false,
  favorites = new Set(),
  imported = new Set(),
  className,
}: HomebrewBrowserProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Community Homebrew</h2>
        <p className="text-muted-foreground">
          Discover and import custom content created by the community
        </p>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        facets={facets}
        onChange={(f) => onFilterChange?.(f)}
      />

      {/* Tags */}
      {facets?.tags && facets.tags.length > 0 && (
        <TagFilter
          tags={facets.tags}
          selected={filters.tags || []}
          onChange={(tags) => onFilterChange?.({ ...filters, tags })}
        />
      )}

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {total > 0 ? (
          `Showing ${items.length} of ${total.toLocaleString()} results`
        ) : loading ? (
          'Loading...'
        ) : (
          'No results found'
        )}
      </div>

      {/* Grid */}
      {loading && items.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-lg font-medium mb-2">No homebrew found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <HomebrewCard
                key={item.id}
                item={item}
                onImport={() => onImport?.(item.id)}
                onFavorite={() => onFavorite?.(item.id)}
                onView={() => onView?.(item.id)}
                isFavorite={favorites.has(item.id)}
                isImported={imported.has(item.id)}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="secondary"
                onClick={onLoadMore}
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default HomebrewBrowser;
