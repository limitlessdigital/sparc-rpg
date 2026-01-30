/**
 * Reviews - Review system components
 * Based on PRD 26: Marketplace & Monetization
 */

import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "../Button";
import { Input, Textarea } from "../Input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../Card";
import { Badge } from "../Badge";
import { Avatar } from "../Avatar";
import { Select, SelectOption } from "../Select";
import { Spinner } from "../Loading";
import {
  ReviewListProps,
  WriteReviewProps,
  ListingReview,
} from "./types";
import {
  formatRelativeDate,
  getRatingStars,
  getRatingColor,
  getRatingLabel,
} from "./utils";

// ============================================
// Star Rating Input
// ============================================

function StarRatingInput({
  value,
  onChange,
  size = 'lg',
}: {
  value: number;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [hoverValue, setHoverValue] = React.useState(0);
  const displayValue = hoverValue || value;

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          className={cn(
            sizeClasses[size],
            "transition-colors cursor-pointer",
            star <= displayValue ? "text-amber-400" : "text-muted-foreground/30"
          )}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ============================================
// Rating Summary
// ============================================

export function RatingSummary({
  averageRating,
  totalRatings,
  distribution,
}: {
  averageRating: number;
  totalRatings: number;
  distribution?: Record<number, number>;
}) {
  const defaultDistribution = distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const maxCount = Math.max(...Object.values(defaultDistribution), 1);

  return (
    <div className="flex gap-8">
      {/* Average Rating */}
      <div className="text-center">
        <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
        <div className={cn("text-2xl", getRatingColor(averageRating))}>
          {'★'.repeat(Math.round(averageRating))}
          {'☆'.repeat(5 - Math.round(averageRating))}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {totalRatings} review{totalRatings !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Distribution */}
      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = defaultDistribution[stars] || 0;
          const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;

          return (
            <div key={stars} className="flex items-center gap-2">
              <span className="text-sm w-8">{stars}★</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-12 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// Review Card
// ============================================

function ReviewCard({
  review,
  onHelpful,
  onReport,
}: {
  review: ListingReview;
  onHelpful?: (id: string) => void;
  onReport?: (id: string) => void;
}) {
  const { full, half, empty } = getRatingStars(review.rating);

  return (
    <div className="py-4 border-b border-border last:border-0">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar
          src={review.userAvatar}
          alt={review.userName}
          size="md"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{review.userName}</span>
            {review.verifiedPurchase && (
              <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                ✓ Verified Purchase
              </Badge>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("text-lg", getRatingColor(review.rating))}>
              {'★'.repeat(full)}
              {half && '⯨'}
              {'☆'.repeat(empty)}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatRelativeDate(review.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-3 ml-11">
        {review.title && (
          <h4 className="font-semibold mb-1">{review.title}</h4>
        )}
        <p className="text-muted-foreground">{review.content}</p>

        {/* Creator Response */}
        {review.creatorResponse && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
            <p className="text-xs font-medium text-primary mb-1">
              Creator Response
            </p>
            <p className="text-sm text-muted-foreground">
              {review.creatorResponse}
            </p>
            {review.creatorResponseAt && (
              <p className="text-xs text-muted-foreground mt-2">
                {formatRelativeDate(review.creatorResponseAt)}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={() => onHelpful?.(review.id)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            👍 Helpful ({review.helpful})
          </button>
          <button
            onClick={() => onReport?.(review.id)}
            className="text-sm text-muted-foreground hover:text-red-500 transition-colors"
          >
            🚩 Report
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Review List Component
// ============================================

export function ReviewList({
  reviews,
  onHelpful,
  onReport,
  onLoadMore,
  hasMore = false,
  sortBy = 'newest',
  onSortChange,
  className,
}: ReviewListProps) {
  const [loading, setLoading] = React.useState(false);

  const handleLoadMore = () => {
    setLoading(true);
    onLoadMore?.();
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Sort */}
      {onSortChange && (
        <div className="flex justify-end">
          <Select
            value={sortBy}
            onChange={(val) => onSortChange(val as typeof sortBy)}
            className="w-40"
          >
            <SelectOption value="newest">Newest First</SelectOption>
            <SelectOption value="oldest">Oldest First</SelectOption>
            <SelectOption value="helpful">Most Helpful</SelectOption>
            <SelectOption value="rating_high">Highest Rated</SelectOption>
            <SelectOption value="rating_low">Lowest Rated</SelectOption>
          </Select>
        </div>
      )}

      {/* Reviews */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-4xl mb-2">📝</div>
          <p>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onHelpful={onHelpful}
              onReport={onReport}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="ghost"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Loading...
              </>
            ) : (
              'Show more reviews'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================
// Write Review Component
// ============================================

export function WriteReview({
  listingId,
  onSubmit,
  onCancel,
  loading = false,
  className,
}: WriteReviewProps) {
  const [rating, setRating] = React.useState(0);
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (content.trim().length < 10) {
      setError('Review must be at least 10 characters');
      return;
    }

    onSubmit?.({
      rating,
      title: title.trim() || undefined,
      content: content.trim(),
    });
  };

  return (
    <Card className={cn("w-full max-w-lg", className)}>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Rating */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              How would you rate this content?
            </p>
            <StarRatingInput
              value={rating}
              onChange={setRating}
            />
            {rating > 0 && (
              <p className="text-sm mt-2 font-medium">
                {getRatingLabel(rating)}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium">
              Review Title <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={100}
              className="mt-1"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium">
              Your Review <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What did you like or dislike? Would you recommend this to others?"
              rows={4}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {content.length}/1000 characters
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={loading || rating === 0}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default ReviewList;
