/**
 * ListingDetail - Full listing detail page component
 * Based on PRD 26: Marketplace & Monetization
 */

import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "../Button";
import { Card, CardContent, CardHeader, CardTitle } from "../Card";
import { Badge } from "../Badge";
import { Avatar } from "../Avatar";
import {
  ListingDetailProps,
  MarketplaceListing,
  CreatorStorefront,
  ListingReview,
} from "./types";
import {
  formatPrice,
  formatSalePrice,
  formatCompactNumber,
  formatRelativeDate,
  formatCountdown,
  getContentTypeIcon,
  getContentTypeLabel,
  getLicenseDescription,
  getRatingStars,
  getRatingColor,
} from "./utils";

// ============================================
// Sub-Components
// ============================================

function ImageGallery({
  images,
  thumbnail,
  video,
}: {
  images: string[];
  thumbnail: string;
  video?: string;
}) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const allMedia = [thumbnail, ...images];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
        {video && selectedIndex === 0 ? (
          <video
            src={video}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={allMedia[selectedIndex] || '/placeholder.jpg'}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Thumbnails */}
      {allMedia.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allMedia.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "w-20 h-14 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors",
                selectedIndex === i
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/50"
              )}
            >
              <img
                src={src || '/placeholder.jpg'}
                alt={`Preview ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RatingStars({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const { full, half, empty } = getRatingStars(rating);
  const sizeClass = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  }[size];

  return (
    <span className={cn(sizeClass, getRatingColor(rating))}>
      {'★'.repeat(full)}
      {half && '⯨'}
      {'☆'.repeat(empty)}
    </span>
  );
}

function CreatorCard({
  creator,
  onFollow,
  isFollowing,
}: {
  creator: CreatorStorefront;
  onFollow?: (id: string) => void;
  isFollowing?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar
            src={creator.avatarUrl}
            alt={creator.displayName}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold truncate">{creator.displayName}</h4>
              {creator.verified && (
                <Badge variant="secondary" className="bg-blue-500 text-white border-0">
                  ✓ Verified
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {creator.bio}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>⭐ {creator.averageRating.toFixed(1)}</span>
              <span>📦 {formatCompactNumber(creator.totalSales)} sales</span>
              <span>👥 {formatCompactNumber(creator.followerCount)} followers</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            variant={isFollowing ? "secondary" : "primary"}
            size="sm"
            className="flex-1"
            onClick={() => onFollow?.(creator.id)}
          >
            {isFollowing ? '✓ Following' : '+ Follow'}
          </Button>
          <Button variant="ghost" size="sm">
            View Store →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewCard({
  review,
  onHelpful,
  onReport,
}: {
  review: ListingReview;
  onHelpful?: (id: string) => void;
  onReport?: (id: string) => void;
}) {
  return (
    <div className="border-b border-border pb-4 last:border-0">
      <div className="flex items-start gap-3">
        <Avatar
          src={review.userAvatar}
          alt={review.userName}
          size="sm"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{review.userName}</span>
            <RatingStars rating={review.rating} size="sm" />
            {review.verifiedPurchase && (
              <Badge variant="secondary" className="text-xs">
                ✓ Verified Purchase
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatRelativeDate(review.createdAt)}
            </span>
          </div>
          
          {review.title && (
            <h5 className="font-medium mt-2">{review.title}</h5>
          )}
          
          <p className="text-sm text-muted-foreground mt-1">
            {review.content}
          </p>

          {/* Creator Response */}
          {review.creatorResponse && (
            <div className="mt-3 pl-4 border-l-2 border-primary">
              <p className="text-xs font-medium text-primary">Creator Response</p>
              <p className="text-sm text-muted-foreground mt-1">
                {review.creatorResponse}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => onHelpful?.(review.id)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              👍 Helpful ({review.helpful})
            </button>
            <button
              onClick={() => onReport?.(review.id)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              🚩 Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function ListingDetail({
  listing,
  creator,
  reviews,
  relatedListings,
  onAddToCart,
  onWishlist,
  onGift,
  onWriteReview,
  onFollowCreator,
  onReportReview,
  isWishlisted = false,
  isOwned = false,
  isFollowing = false,
  className,
}: ListingDetailProps) {
  const {
    id,
    title,
    description,
    contentType,
    thumbnailUrl,
    previewImages,
    previewVideo,
    priceType,
    priceCents,
    saleActive,
    salePriceCents,
    saleEndAt,
    purchaseCount,
    viewCount,
    averageRating,
    ratingCount,
    licenseType,
    tags,
  } = listing;

  const displayPrice = saleActive && salePriceCents ? salePriceCents : priceCents;
  const countdown = saleEndAt ? formatCountdown(saleEndAt) : null;

  return (
    <div className={cn("space-y-8", className)}>
      {/* Back Link */}
      <Button variant="ghost" size="sm" className="gap-2">
        ← Back to Marketplace
      </Button>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images & Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <ImageGallery
            thumbnail={thumbnailUrl}
            images={previewImages}
            video={previewVideo}
          />

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {description.split('\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Reviews</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {ratingCount} reviews • {averageRating.toFixed(1)} average
                </p>
              </div>
              {isOwned && (
                <Button variant="secondary" size="sm" onClick={onWriteReview}>
                  ✏️ Write Review
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No reviews yet. Be the first to review!
                </p>
              ) : (
                reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onReport={onReportReview}
                  />
                ))
              )}
              {reviews.length > 0 && reviews.length < ratingCount && (
                <Button variant="ghost" className="w-full">
                  Show more reviews...
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Purchase & Info */}
        <div className="space-y-6">
          {/* Purchase Card */}
          <Card className="sticky top-4">
            <CardContent className="p-6 space-y-4">
              {/* Title & Rating */}
              <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <RatingStars rating={averageRating} />
                  <span className="text-muted-foreground">
                    ({ratingCount} reviews)
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  by {creator.displayName}
                  {creator.verified && ' ✓'}
                </p>
              </div>

              <hr className="border-border" />

              {/* Price */}
              <div>
                {saleActive && salePriceCents ? (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-red-500">
                        {formatPrice(salePriceCents)}
                      </span>
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(priceCents)}
                      </span>
                    </div>
                    {countdown && (
                      <Badge variant="secondary" className="mt-2 bg-red-500/10 text-red-500 border-red-500/20">
                        🔥 Sale ends in {countdown}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className={cn(
                    "text-3xl font-bold",
                    priceType === 'free' && "text-green-500"
                  )}>
                    {formatPrice(priceCents)}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {isOwned ? (
                  <Button variant="secondary" className="w-full" disabled>
                    ✓ Owned
                  </Button>
                ) : priceType === 'free' ? (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => onAddToCart?.(listing)}
                  >
                    Get for Free
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => onAddToCart?.(listing)}
                  >
                    🛒 Add to Cart
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={isWishlisted ? "secondary" : "ghost"}
                    onClick={() => onWishlist?.(id)}
                  >
                    {isWishlisted ? '❤️ Wishlisted' : '🤍 Wishlist'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onGift?.(id)}
                  >
                    🎁 Gift
                  </Button>
                </div>
              </div>

              <hr className="border-border" />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Content Type</p>
                  <p className="font-medium">
                    {getContentTypeIcon(contentType)} {getContentTypeLabel(contentType)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">License</p>
                  <p className="font-medium capitalize">{licenseType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sales</p>
                  <p className="font-medium">{formatCompactNumber(purchaseCount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Views</p>
                  <p className="font-medium">{formatCompactNumber(viewCount)}</p>
                </div>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Creator Card */}
          <CreatorCard
            creator={creator}
            onFollow={onFollowCreator}
            isFollowing={isFollowing}
          />
        </div>
      </div>

      {/* Related Listings */}
      {relatedListings && relatedListings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>You might also like</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedListings.slice(0, 4).map((related) => (
                <div
                  key={related.id}
                  className="cursor-pointer group"
                  onClick={() => {/* Navigate to listing */}}
                >
                  <div className="aspect-[4/3] rounded-md overflow-hidden bg-muted mb-2">
                    <img
                      src={related.thumbnailUrl || '/placeholder.jpg'}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="font-medium text-sm truncate group-hover:text-primary">
                    {related.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(related.saleActive && related.salePriceCents 
                      ? related.salePriceCents 
                      : related.priceCents
                    )}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ListingDetail;
