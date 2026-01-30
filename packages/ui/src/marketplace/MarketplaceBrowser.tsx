/**
 * MarketplaceBrowser - Browse and discover marketplace content
 * Based on PRD 26: Marketplace & Monetization
 */

import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "../Button";
import { Input } from "../Input";
import { Select, SelectOption } from "../Select";
import { Spinner } from "../Loading";
import { Badge } from "../Badge";
import {
  MarketplaceBrowserProps,
  ListingFilters,
  ListingContentType,
  ListingSortBy,
  FeaturedSection,
} from "./types";
import { ListingCard, FeaturedListingCard } from "./ListingCard";
import {
  formatPrice,
  getContentTypeIcon,
  getContentTypeLabel,
  CONTENT_TYPE_LABELS,
} from "./utils";

// ============================================
// Constants
// ============================================

const SORT_OPTIONS: { value: ListingSortBy; label: string }[] = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
];

const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Free', min: 0, max: 0 },
  { label: 'Under $5', min: 1, max: 499 },
  { label: '$5 - $10', min: 500, max: 1000 },
  { label: '$10 - $20', min: 1000, max: 2000 },
  { label: '$20+', min: 2000, max: Infinity },
];

// ============================================
// Sub-Components
// ============================================

function CategoryTabs({
  selected,
  onChange,
  facets,
}: {
  selected?: ListingContentType;
  onChange: (type?: ListingContentType) => void;
  facets?: { type: ListingContentType; count: number }[];
}) {
  const categories: (ListingContentType | 'all')[] = [
    'all',
    'adventure',
    'asset_pack',
    'token_pack',
    'audio_pack',
    'map_pack',
    'homebrew_bundle',
  ];

  const getCount = (type: ListingContentType) => {
    const facet = facets?.find(f => f.type === type);
    return facet?.count || 0;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const isAll = cat === 'all';
        const isSelected = isAll ? !selected : selected === cat;
        const count = isAll ? undefined : getCount(cat as ListingContentType);

        return (
          <button
            key={cat}
            onClick={() => onChange(isAll ? undefined : cat as ListingContentType)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
          >
            {isAll ? '🎯 All' : `${getContentTypeIcon(cat as ListingContentType)} ${getContentTypeLabel(cat as ListingContentType)}`}
            {count !== undefined && count > 0 && (
              <span className="ml-1 opacity-70">({count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function FilterBar({
  filters,
  onFilterChange,
  facets,
}: {
  filters?: ListingFilters;
  onFilterChange?: (filters: ListingFilters) => void;
  facets?: import('./types').ListingFacets;
}) {
  const [searchValue, setSearchValue] = React.useState(filters?.search || '');
  const [selectedPriceRange, setSelectedPriceRange] = React.useState(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange?.({ ...filters, search: searchValue, offset: 0 });
  };

  const handleSortChange = (sortBy: ListingSortBy) => {
    onFilterChange?.({ ...filters, sortBy, offset: 0 });
  };

  const handlePriceRangeChange = (index: number) => {
    setSelectedPriceRange(index);
    const range = PRICE_RANGES[index];
    onFilterChange?.({
      ...filters,
      priceMin: range.min || undefined,
      priceMax: range.max === Infinity ? undefined : range.max,
      offset: 0,
    });
  };

  const handleOnSaleToggle = () => {
    onFilterChange?.({
      ...filters,
      onSale: !filters?.onSale,
      offset: 0,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search marketplace..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="primary">
          🔍 Search
        </Button>
      </form>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Price Range */}
        <Select
          value={selectedPriceRange.toString()}
          onChange={(val) => handlePriceRangeChange(parseInt(val))}
          className="w-40"
        >
          {PRICE_RANGES.map((range, i) => (
            <SelectOption key={i} value={i.toString()}>
              {range.label}
            </SelectOption>
          ))}
        </Select>

        {/* Sort */}
        <Select
          value={filters?.sortBy || 'popular'}
          onChange={(val) => handleSortChange(val as ListingSortBy)}
          className="w-48"
        >
          {SORT_OPTIONS.map((opt) => (
            <SelectOption key={opt.value} value={opt.value}>
              {opt.label}
            </SelectOption>
          ))}
        </Select>

        {/* On Sale Toggle */}
        <button
          onClick={handleOnSaleToggle}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
            filters?.onSale
              ? "bg-red-500 text-white"
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
          )}
        >
          🔥 On Sale
        </button>

        {/* Tag Filters */}
        {facets?.tags && facets.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {facets.tags.slice(0, 5).map((tag) => (
              <Badge
                key={tag.tag}
                variant={filters?.tags?.includes(tag.tag) ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => {
                  const currentTags = filters?.tags || [];
                  const newTags = currentTags.includes(tag.tag)
                    ? currentTags.filter(t => t !== tag.tag)
                    : [...currentTags, tag.tag];
                  onFilterChange?.({ ...filters, tags: newTags, offset: 0 });
                }}
              >
                {tag.tag} ({tag.count})
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FeaturedCarousel({
  section,
  onView,
  onAddToCart,
}: {
  section: FeaturedSection;
  onView?: (id: string) => void;
  onAddToCart?: (listing: import('./types').MarketplaceListing) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{section.title}</h2>
          {section.subtitle && (
            <p className="text-sm text-muted-foreground">{section.subtitle}</p>
          )}
        </div>
        <Button variant="ghost" size="sm">
          View All →
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {section.listings.slice(0, 3).map((listing) => (
          section.type === 'curated' || section.type === 'creator_spotlight' ? (
            <FeaturedListingCard
              key={listing.id}
              listing={listing}
              onView={onView}
              onAddToCart={onAddToCart}
            />
          ) : (
            <ListingCard
              key={listing.id}
              listing={listing}
              onView={onView}
              onAddToCart={onAddToCart}
            />
          )
        ))}
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function MarketplaceBrowser({
  listings,
  loading = false,
  total = 0,
  facets,
  filters,
  onFilterChange,
  onView,
  onAddToCart,
  onWishlist,
  onLoadMore,
  hasMore = false,
  wishlist,
  owned,
  featuredSections,
  className,
}: MarketplaceBrowserProps) {
  const handleCategoryChange = (contentType?: ListingContentType) => {
    onFilterChange?.({ ...filters, contentType, offset: 0 });
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">SPARC Marketplace</h1>
        <p className="text-muted-foreground">
          Discover adventures, assets, and homebrew content from creators around the world
        </p>
      </div>

      {/* Featured Sections (show when not filtering) */}
      {featuredSections && !filters?.search && !filters?.contentType && (
        <div className="space-y-8">
          {featuredSections.map((section) => (
            <FeaturedCarousel
              key={section.id}
              section={section}
              onView={onView}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}

      {/* Category Tabs */}
      <CategoryTabs
        selected={filters?.contentType}
        onChange={handleCategoryChange}
        facets={facets?.contentTypes}
      />

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={onFilterChange}
        facets={facets}
      />

      {/* Results Count */}
      {total > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing {listings.length} of {total} results
          {filters?.search && ` for "${filters.search}"`}
        </p>
      )}

      {/* Loading State */}
      {loading && listings.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
          <span className="ml-3 text-muted-foreground">Loading marketplace...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && listings.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">No listings found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search terms
          </p>
          <Button
            variant="secondary"
            onClick={() => onFilterChange?.({})}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Listings Grid */}
      {listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onView={onView}
              onAddToCart={onAddToCart}
              onWishlist={onWishlist}
              isWishlisted={wishlist?.has(listing.id)}
              isOwned={owned?.has(listing.id)}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="secondary"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default MarketplaceBrowser;
