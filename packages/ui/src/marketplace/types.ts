/**
 * Marketplace Types
 * Based on PRD 26: Marketplace & Monetization
 */

// ============================================
// Core Types
// ============================================

export type ListingContentType =
  | 'adventure'
  | 'asset_pack'
  | 'homebrew_bundle'
  | 'token_pack'
  | 'audio_pack'
  | 'map_pack';

export type ListingStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'removed';
export type LicenseType = 'personal' | 'commercial' | 'attribution' | 'exclusive';
export type PriceType = 'free' | 'paid' | 'pwyw';
export type AssetCategory = 'art' | 'tokens' | 'maps' | 'audio' | 'mixed';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed';
export type SubscriptionTier = 'free' | 'premium' | 'creator';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'incomplete';
export type BillingCycle = 'monthly' | 'annual';

// ============================================
// Creator & Storefront
// ============================================

export interface SocialLinks {
  twitter?: string;
  youtube?: string;
  twitch?: string;
  discord?: string;
  website?: string;
}

export interface StorefrontTheme {
  primaryColor?: string;
  accentColor?: string;
}

export interface CreatorStorefront {
  id: string;
  userId: string;
  displayName: string;
  slug: string;
  bio: string;
  avatarUrl?: string;
  bannerUrl?: string;
  socialLinks: SocialLinks;
  theme?: StorefrontTheme;
  featuredItemIds: string[];
  totalSales: number;
  totalRevenue: number;
  followerCount: number;
  averageRating: number;
  verified: boolean;
  verifiedAt?: string;
  stripeConnectId?: string;
  payoutEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Listings
// ============================================

export interface MarketplaceListing {
  id: string;
  creatorId: string;
  creator?: CreatorStorefront;
  contentType: ListingContentType;
  contentId: string;
  title: string;
  description: string;
  shortDescription: string;
  tags: string[];
  thumbnailUrl: string;
  previewImages: string[];
  previewVideo?: string;
  priceType: PriceType;
  priceCents: number;
  minimumPriceCents?: number;
  suggestedPriceCents?: number;
  saleActive: boolean;
  salePriceCents?: number;
  saleStartAt?: string;
  saleEndAt?: string;
  status: ListingStatus;
  publishedAt?: string;
  purchaseCount: number;
  viewCount: number;
  wishlistCount: number;
  averageRating: number;
  ratingCount: number;
  licenseType: LicenseType;
  createdAt: string;
  updatedAt: string;
}

export type ListingSortBy = 'popular' | 'newest' | 'rating' | 'price_low' | 'price_high';

export interface ListingFilters {
  contentType?: ListingContentType;
  tags?: string[];
  priceMin?: number;
  priceMax?: number;
  onSale?: boolean;
  sortBy?: ListingSortBy;
  search?: string;
  creatorId?: string;
  limit?: number;
  offset?: number;
}

export interface ListingFacets {
  contentTypes: { type: ListingContentType; count: number }[];
  priceRanges: { range: string; min: number; max: number; count: number }[];
  tags: { tag: string; count: number }[];
}

// ============================================
// Asset Packs & Bundles
// ============================================

export interface AssetReference {
  assetId: string;
  name: string;
  type: 'image' | 'audio' | 'map';
  thumbnailUrl: string;
}

export interface AssetPack {
  id: string;
  creatorId: string;
  listingId?: string;
  name: string;
  description: string;
  category: AssetCategory;
  assets: AssetReference[];
  assetCount: number;
  tags: string[];
  style?: string;
  sampleAssets: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BundleItem {
  listingId: string;
  title: string;
  priceCents: number;
  exclusive: boolean;
}

export interface Bundle {
  id: string;
  creatorId: string;
  name: string;
  description: string;
  items: BundleItem[];
  totalValueCents: number;
  bundlePriceCents: number;
  discountPercent: number;
  availableFrom?: string;
  availableUntil?: string;
  maxPurchases?: number;
  purchasesMade: number;
  status: 'draft' | 'active' | 'ended' | 'soldout';
  createdAt: string;
}

// ============================================
// Purchases & Transactions
// ============================================

export interface PurchaseItem {
  listingId: string;
  title: string;
  priceCents: number;
  salePriceCents?: number;
  creatorId: string;
}

export interface Purchase {
  id: string;
  userId: string;
  items: PurchaseItem[];
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  stripePaymentIntentId: string;
  paymentStatus: PaymentStatus;
  isGift: boolean;
  giftRecipientId?: string;
  giftMessage?: string;
  createdAt: string;
  completedAt?: string;
  refundedAt?: string;
}

export interface CartItem {
  listing: MarketplaceListing;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
}

// ============================================
// Reviews & Ratings
// ============================================

export interface ListingReview {
  id: string;
  listingId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  content: string;
  helpful: number;
  creatorResponse?: string;
  creatorResponseAt?: string;
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Creator Earnings & Payouts
// ============================================

export interface ListingEarnings {
  listingId: string;
  title: string;
  salesCount: number;
  revenueCents: number;
}

export interface CreatorEarnings {
  creatorId: string;
  period: string;
  grossRevenueCents: number;
  salesCount: number;
  platformFeeCents: number;
  stripeFeesCents: number;
  refundsCents: number;
  netEarningsCents: number;
  byListing: ListingEarnings[];
}

export interface Payout {
  id: string;
  creatorId: string;
  amountCents: number;
  currency: string;
  stripeTransferId: string;
  stripePayoutId?: string;
  status: PayoutStatus;
  periodStart: string;
  periodEnd: string;
  taxFormGenerated: boolean;
  createdAt: string;
  completedAt?: string;
}

// ============================================
// Subscriptions
// ============================================

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  billingCycle: BillingCycle;
  priceCents: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  isGifted: boolean;
  gifterId?: string;
  createdAt: string;
  canceledAt?: string;
}

// ============================================
// User Library
// ============================================

export interface UserPurchase {
  purchaseId: string;
  listingId: string;
  contentType: ListingContentType;
  contentId: string;
  title: string;
  thumbnailUrl?: string;
  purchasedAt: string;
  giftedBy?: string;
}

export interface UserLibrary {
  userId: string;
  purchases: UserPurchase[];
  wishlist: string[];
  followedCreators: string[];
}

// ============================================
// Analytics
// ============================================

export interface TimeSeriesPoint {
  date: string;
  revenueCents: number;
  salesCount: number;
}

export interface TopListing {
  listingId: string;
  title: string;
  salesCount: number;
  revenueCents: number;
}

export interface GeographySales {
  country: string;
  salesCount: number;
  revenueCents: number;
}

export interface AnalyticsSummary {
  totalRevenueCents: number;
  totalSales: number;
  averageOrderCents: number;
  conversionRate: number;
}

export interface CreatorAnalytics {
  summary: AnalyticsSummary;
  timeSeries: TimeSeriesPoint[];
  topListings: TopListing[];
  geography: GeographySales[];
}

// ============================================
// Featured Content
// ============================================

export interface FeaturedSection {
  id: string;
  title: string;
  subtitle?: string;
  type: 'curated' | 'trending' | 'new_releases' | 'on_sale' | 'creator_spotlight';
  listings: MarketplaceListing[];
  creator?: CreatorStorefront;
}

// ============================================
// Component Props
// ============================================

export interface ListingCardProps {
  listing: MarketplaceListing;
  onView?: (id: string) => void;
  onAddToCart?: (listing: MarketplaceListing) => void;
  onWishlist?: (id: string) => void;
  isWishlisted?: boolean;
  isOwned?: boolean;
  compact?: boolean;
  className?: string;
}

export interface MarketplaceBrowserProps {
  listings: MarketplaceListing[];
  loading?: boolean;
  total?: number;
  facets?: ListingFacets;
  filters?: ListingFilters;
  onFilterChange?: (filters: ListingFilters) => void;
  onView?: (id: string) => void;
  onAddToCart?: (listing: MarketplaceListing) => void;
  onWishlist?: (id: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  wishlist?: Set<string>;
  owned?: Set<string>;
  featuredSections?: FeaturedSection[];
  className?: string;
}

export interface ListingDetailProps {
  listing: MarketplaceListing;
  creator: CreatorStorefront;
  reviews: ListingReview[];
  relatedListings?: MarketplaceListing[];
  onAddToCart?: (listing: MarketplaceListing) => void;
  onWishlist?: (id: string) => void;
  onGift?: (id: string) => void;
  onWriteReview?: () => void;
  onFollowCreator?: (creatorId: string) => void;
  onReportReview?: (reviewId: string) => void;
  isWishlisted?: boolean;
  isOwned?: boolean;
  isFollowing?: boolean;
  className?: string;
}

export interface CreatorStorefrontProps {
  storefront: CreatorStorefront;
  listings: MarketplaceListing[];
  featuredListings: MarketplaceListing[];
  onView?: (id: string) => void;
  onAddToCart?: (listing: MarketplaceListing) => void;
  onFollow?: (creatorId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isFollowing?: boolean;
  className?: string;
}

export interface CartPanelProps {
  cart: Cart;
  onUpdateQuantity?: (listingId: string, quantity: number) => void;
  onRemove?: (listingId: string) => void;
  onCheckout?: () => void;
  onContinueShopping?: () => void;
  isGift?: boolean;
  onToggleGift?: (isGift: boolean) => void;
  giftRecipient?: string;
  onGiftRecipientChange?: (recipient: string) => void;
  giftMessage?: string;
  onGiftMessageChange?: (message: string) => void;
  className?: string;
}

export interface CheckoutProps {
  cart: Cart;
  onComplete?: (purchase: Purchase) => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export interface ReviewListProps {
  reviews: ListingReview[];
  onHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  sortBy?: 'newest' | 'oldest' | 'helpful' | 'rating_high' | 'rating_low';
  onSortChange?: (sort: 'newest' | 'oldest' | 'helpful' | 'rating_high' | 'rating_low') => void;
  className?: string;
}

export interface WriteReviewProps {
  listingId: string;
  onSubmit?: (review: { rating: number; title?: string; content: string }) => void;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
}

export interface CreatorDashboardProps {
  storefront: CreatorStorefront;
  analytics: CreatorAnalytics;
  earnings: CreatorEarnings;
  payouts: Payout[];
  period?: 'day' | 'week' | 'month' | 'year' | 'all';
  onPeriodChange?: (period: 'day' | 'week' | 'month' | 'year' | 'all') => void;
  onRequestPayout?: () => void;
  onViewListing?: (id: string) => void;
  onCreateListing?: () => void;
  onCreateBundle?: () => void;
  onRunSale?: () => void;
  payoutEnabled?: boolean;
  availableBalance?: number;
  pendingBalance?: number;
  className?: string;
}

export interface UserLibraryProps {
  library: UserLibrary;
  onViewContent?: (purchase: UserPurchase) => void;
  onRemoveFromWishlist?: (listingId: string) => void;
  onUnfollowCreator?: (creatorId: string) => void;
  activeTab?: 'purchases' | 'wishlist' | 'following';
  onTabChange?: (tab: 'purchases' | 'wishlist' | 'following') => void;
  className?: string;
}
