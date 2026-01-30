/**
 * CreatorStorefront - Creator profile and storefront page
 * Based on PRD 26: Marketplace & Monetization
 */

import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "../Button";
import { Card, CardContent } from "../Card";
import { Badge } from "../Badge";
import { Avatar } from "../Avatar";
import { Tabs, TabList, Tab, TabPanel } from "../Tabs";
import { Spinner } from "../Loading";
import {
  CreatorStorefrontProps,
  MarketplaceListing,
} from "./types";
import { ListingCard } from "./ListingCard";
import {
  formatPrice,
  formatCompactNumber,
  getRatingColor,
} from "./utils";

// ============================================
// Social Link Icons
// ============================================

const SOCIAL_ICONS: Record<string, string> = {
  twitter: '𝕏',
  youtube: '▶️',
  twitch: '📺',
  discord: '💬',
  website: '🌐',
};

// ============================================
// Sub-Components
// ============================================

function StorefrontHeader({
  storefront,
  onFollow,
  isFollowing,
}: {
  storefront: import('./types').CreatorStorefront;
  onFollow?: (id: string) => void;
  isFollowing?: boolean;
}) {
  const {
    displayName,
    bio,
    avatarUrl,
    bannerUrl,
    socialLinks,
    totalSales,
    followerCount,
    averageRating,
    verified,
  } = storefront;

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="relative h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-br from-primary/30 to-primary/10">
        {bannerUrl && (
          <img
            src={bannerUrl}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 md:-mt-20 px-4">
        {/* Avatar */}
        <Avatar
          src={avatarUrl}
          alt={displayName}
          size="xl"
          className="w-24 h-24 md:w-32 md:h-32 ring-4 ring-background"
        />

        {/* Info */}
        <div className="flex-1 space-y-2 pb-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold">{displayName}</h1>
            {verified && (
              <Badge variant="secondary" className="bg-blue-500 text-white border-0">
                ✓ Verified Creator
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground max-w-2xl">{bio}</p>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <span className={getRatingColor(averageRating)}>★</span>
              <span className="font-medium">{averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">rating</span>
            </div>
            <div>
              <span className="font-medium">{formatCompactNumber(totalSales)}</span>
              <span className="text-muted-foreground"> sales</span>
            </div>
            <div>
              <span className="font-medium">{formatCompactNumber(followerCount)}</span>
              <span className="text-muted-foreground"> followers</span>
            </div>
          </div>

          {/* Social Links */}
          {socialLinks && Object.keys(socialLinks).length > 0 && (
            <div className="flex items-center gap-3">
              {Object.entries(socialLinks).map(([platform, handle]) => 
                handle ? (
                  <a
                    key={platform}
                    href={platform === 'website' ? handle : `https://${platform}.com/${handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title={`@${handle} on ${platform}`}
                  >
                    {SOCIAL_ICONS[platform] || '🔗'} {handle}
                  </a>
                ) : null
              )}
            </div>
          )}
        </div>

        {/* Follow Button */}
        <Button
          variant={isFollowing ? "secondary" : "primary"}
          onClick={() => onFollow?.(storefront.id)}
          className="md:self-center"
        >
          {isFollowing ? '✓ Following' : '+ Follow'}
        </Button>
      </div>
    </div>
  );
}

function FeaturedSection({
  listings,
  onView,
  onAddToCart,
}: {
  listings: MarketplaceListing[];
  onView?: (id: string) => void;
  onAddToCart?: (listing: MarketplaceListing) => void;
}) {
  if (listings.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">⭐ Featured Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onView={onView}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Main Component
// ============================================

export function CreatorStorefront({
  storefront,
  listings,
  featuredListings,
  onView,
  onAddToCart,
  onFollow,
  onLoadMore,
  hasMore = false,
  isFollowing = false,
  className,
}: CreatorStorefrontProps) {
  const [activeTab, setActiveTab] = React.useState('all');
  const [loading, setLoading] = React.useState(false);

  // Group listings by content type
  const listingsByType = React.useMemo(() => {
    const grouped: Record<string, MarketplaceListing[]> = { all: listings };
    listings.forEach((listing) => {
      if (!grouped[listing.contentType]) {
        grouped[listing.contentType] = [];
      }
      grouped[listing.contentType].push(listing);
    });
    return grouped;
  }, [listings]);

  const contentTypes = Object.keys(listingsByType).filter(t => t !== 'all' && listingsByType[t].length > 0);

  const displayListings = listingsByType[activeTab] || [];

  const handleLoadMore = () => {
    setLoading(true);
    onLoadMore?.();
    // Reset loading after a moment (real implementation would be callback-based)
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <StorefrontHeader
        storefront={storefront}
        onFollow={onFollow}
        isFollowing={isFollowing}
      />

      {/* Featured Section */}
      {featuredListings.length > 0 && (
        <FeaturedSection
          listings={featuredListings}
          onView={onView}
          onAddToCart={onAddToCart}
        />
      )}

      {/* All Listings */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">All Content</h2>
          <span className="text-muted-foreground">
            {listings.length} item{listings.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Tabs for content types */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabList>
            <Tab value="all">
              All ({listings.length})
            </Tab>
            {contentTypes.map((type) => (
              <Tab key={type} value={type}>
                {type.replace('_', ' ')} ({listingsByType[type].length})
              </Tab>
            ))}
          </TabList>

          <TabPanel value={activeTab} className="mt-6">
            {displayListings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-4xl mb-4">📦</div>
                <p>No content in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onView={onView}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>
            )}
          </TabPanel>
        </Tabs>

        {/* Load More */}
        {hasMore && activeTab === 'all' && (
          <div className="flex justify-center pt-4">
            <Button
              variant="secondary"
              onClick={handleLoadMore}
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
    </div>
  );
}

export default CreatorStorefront;
