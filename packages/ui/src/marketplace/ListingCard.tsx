/**
 * ListingCard - Marketplace listing card component
 * Based on PRD 26: Marketplace & Monetization
 */

import * as React from "react";
import { cn } from "../lib/utils";
import { Card, CardContent, CardFooter } from "../Card";
import { Button } from "../Button";
import { Badge } from "../Badge";
import { 
  ListingCardProps, 
  MarketplaceListing,
} from "./types";
import {
  formatPrice,
  formatSalePrice,
  formatCompactNumber,
  formatCountdown,
  getContentTypeIcon,
  getContentTypeLabel,
  getRatingStars,
  getRatingColor,
} from "./utils";

// ============================================
// Rating Stars Component
// ============================================

function RatingStars({ rating, showValue = true, size = 'sm' }: { 
  rating: number; 
  showValue?: boolean;
  size?: 'sm' | 'md';
}) {
  const { full, half, empty } = getRatingStars(rating);
  const starSize = size === 'sm' ? 'text-sm' : 'text-base';
  
  return (
    <span className={cn("inline-flex items-center gap-1", getRatingColor(rating))}>
      <span className={starSize}>
        {'★'.repeat(full)}
        {half && '⯨'}
        {'☆'.repeat(empty)}
      </span>
      {showValue && (
        <span className="text-muted-foreground text-xs">
          ({rating.toFixed(1)})
        </span>
      )}
    </span>
  );
}

// ============================================
// Sale Badge Component
// ============================================

function SaleBadge({ 
  originalCents, 
  saleCents, 
  endAt 
}: { 
  originalCents: number; 
  saleCents: number;
  endAt?: string;
}) {
  const { discount } = formatSalePrice(originalCents, saleCents);
  const countdown = endAt ? formatCountdown(endAt) : null;
  
  return (
    <div className="absolute top-2 left-2 z-10">
      <Badge variant="secondary" className="bg-red-500 text-white border-0">
        🔥 {discount}% OFF
        {countdown && <span className="ml-1 opacity-80">• {countdown}</span>}
      </Badge>
    </div>
  );
}

// ============================================
// Listing Card Component
// ============================================

export function ListingCard({
  listing,
  onView,
  onAddToCart,
  onWishlist,
  isWishlisted = false,
  isOwned = false,
  compact = false,
  className,
}: ListingCardProps) {
  const {
    id,
    title,
    shortDescription,
    contentType,
    thumbnailUrl,
    priceType,
    priceCents,
    saleActive,
    salePriceCents,
    saleEndAt,
    purchaseCount,
    averageRating,
    ratingCount,
    creator,
  } = listing;

  const displayPrice = saleActive && salePriceCents ? salePriceCents : priceCents;
  const hasRatings = ratingCount > 0;

  const handleView = () => onView?.(id);
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(listing);
  };
  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWishlist?.(id);
  };

  if (compact) {
    return (
      <Card
        className={cn(
          "group cursor-pointer hover:shadow-md transition-shadow",
          className
        )}
        onClick={handleView}
      >
        <CardContent className="p-3 flex gap-3">
          {/* Thumbnail */}
          <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                {getContentTypeIcon(contentType)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{title}</h4>
            <p className="text-xs text-muted-foreground truncate">
              {creator?.displayName || 'Unknown creator'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {hasRatings && (
                <RatingStars rating={averageRating} showValue={false} />
              )}
              <span className={cn(
                "text-sm font-semibold",
                saleActive && "text-red-500"
              )}>
                {formatPrice(displayPrice)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group cursor-pointer hover:shadow-lg transition-all overflow-hidden",
        className
      )}
      onClick={handleView}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {saleActive && salePriceCents && (
          <SaleBadge
            originalCents={priceCents}
            saleCents={salePriceCents}
            endAt={saleEndAt}
          />
        )}
        
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {getContentTypeIcon(contentType)}
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleView}
          >
            Preview
          </Button>
          {!isOwned && priceType !== 'free' && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          )}
        </div>

        {/* Content Type Badge */}
        <Badge
          variant="secondary"
          className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm"
        >
          {getContentTypeIcon(contentType)} {getContentTypeLabel(contentType)}
        </Badge>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={cn(
            "absolute top-2 right-2 p-2 rounded-full transition-colors",
            isWishlisted
              ? "bg-red-500 text-white"
              : "bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground"
          )}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>

        {/* Owned Badge */}
        {isOwned && (
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 bg-green-500/90 text-white border-0"
          >
            ✓ Owned
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Creator */}
        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
          by {creator?.displayName || 'Unknown'} 
          {creator?.verified && <span title="Verified Creator">✓</span>}
        </p>

        {/* Description */}
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {shortDescription}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        {/* Rating & Sales */}
        <div className="flex items-center gap-3 text-sm">
          {hasRatings ? (
            <RatingStars rating={averageRating} />
          ) : (
            <span className="text-muted-foreground text-xs">No reviews yet</span>
          )}
          <span className="text-muted-foreground">
            {formatCompactNumber(purchaseCount)} sold
          </span>
        </div>

        {/* Price */}
        <div className="text-right">
          {saleActive && salePriceCents ? (
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(priceCents)}
              </span>
              <span className="font-bold text-red-500">
                {formatPrice(salePriceCents)}
              </span>
            </div>
          ) : (
            <span className={cn(
              "font-bold",
              priceType === 'free' && "text-green-500"
            )}>
              {formatPrice(priceCents)}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

// ============================================
// Featured Listing Card (larger variant)
// ============================================

export function FeaturedListingCard({
  listing,
  onView,
  onAddToCart,
  className,
}: {
  listing: MarketplaceListing;
  onView?: (id: string) => void;
  onAddToCart?: (listing: MarketplaceListing) => void;
  className?: string;
}) {
  const {
    id,
    title,
    shortDescription,
    contentType,
    thumbnailUrl,
    priceCents,
    saleActive,
    salePriceCents,
    averageRating,
    ratingCount,
    creator,
  } = listing;

  const displayPrice = saleActive && salePriceCents ? salePriceCents : priceCents;

  return (
    <Card
      className={cn(
        "group cursor-pointer hover:shadow-xl transition-all overflow-hidden",
        className
      )}
      onClick={() => onView?.(id)}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl bg-gradient-to-br from-primary/20 to-primary/5">
            {getContentTypeIcon(contentType)}
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <Badge variant="secondary" className="mb-3 bg-primary">
            ⭐ Featured
          </Badge>
          
          <h3 className="font-bold text-2xl mb-1">{title}</h3>
          
          <p className="text-sm text-white/80 flex items-center gap-1 mb-2">
            by {creator?.displayName || 'Unknown'}
            {creator?.verified && <span>✓</span>}
          </p>
          
          <p className="text-sm text-white/70 line-clamp-2 mb-4">
            {shortDescription}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {ratingCount > 0 && (
                <span className="text-amber-400">
                  {'★'.repeat(Math.floor(averageRating))} {averageRating.toFixed(1)}
                </span>
              )}
              <span className="font-bold text-lg">
                {formatPrice(displayPrice)}
              </span>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart?.(listing);
              }}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ListingCard;
