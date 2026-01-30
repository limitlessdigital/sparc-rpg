/**
 * Marketplace System - Component Library
 * Based on PRD 26: Marketplace & Monetization
 */

// Types
export * from './types';

// Utilities
export {
  // Formatting
  formatPrice,
  formatSalePrice,
  formatCompactNumber,
  formatRelativeDate,
  formatCountdown,
  // Content Type Helpers
  CONTENT_TYPE_ICONS,
  CONTENT_TYPE_LABELS,
  getContentTypeIcon,
  getContentTypeLabel,
  // License Helpers
  LICENSE_DESCRIPTIONS,
  getLicenseDescription,
  // Rating Helpers
  getRatingStars,
  getRatingColor,
  getRatingLabel,
  // Subscription Helpers
  SUBSCRIPTION_PRICES,
  SUBSCRIPTION_FEATURES,
  getSubscriptionPrice,
  getSubscriptionFeatures,
  getAnnualSavings,
  // Revenue Calculations
  calculateRevenueSplit,
  getCreatorCutPercent,
  // Validation
  validateListingTitle,
  validateListingDescription,
  validatePrice,
  // Tags
  SUGGESTED_MARKETPLACE_TAGS,
  getSuggestedTags,
  // Sample Data
  SAMPLE_LISTING,
  SAMPLE_STOREFRONT,
} from './utils';
export type { RevenueSplit } from './utils';

// Listing Components
export { ListingCard, FeaturedListingCard } from './ListingCard';

// Browser Components
export { MarketplaceBrowser } from './MarketplaceBrowser';

// Detail Components
export { ListingDetail } from './ListingDetail';

// Creator Storefront
export { CreatorStorefront } from './CreatorStorefront';

// Cart & Checkout
export { CartPanel, Checkout, MiniCart } from './Cart';

// Reviews
export { ReviewList, WriteReview, RatingSummary } from './Reviews';

// Creator Dashboard
export { CreatorDashboard } from './CreatorDashboard';
