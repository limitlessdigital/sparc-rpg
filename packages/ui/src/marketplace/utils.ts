/**
 * Marketplace Utilities
 * Based on PRD 26: Marketplace & Monetization
 */

import { ListingContentType, LicenseType, PriceType, SubscriptionTier } from './types';

// ============================================
// Formatting
// ============================================

/**
 * Format cents to currency string
 */
export function formatPrice(cents: number, currency = 'USD'): string {
  if (cents === 0) return 'Free';
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

/**
 * Format sale price with original price struck through
 */
export function formatSalePrice(originalCents: number, saleCents: number, currency = 'USD'): {
  original: string;
  sale: string;
  discount: number;
} {
  const original = formatPrice(originalCents, currency);
  const sale = formatPrice(saleCents, currency);
  const discount = Math.round(((originalCents - saleCents) / originalCents) * 100);
  return { original, sale, discount };
}

/**
 * Format compact number (e.g., 1.2k, 3.4M)
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

/**
 * Format date relative to now
 */
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Format countdown timer for sales
 */
export function formatCountdown(endDate: string): string | null {
  const end = new Date(endDate);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();

  if (diffMs <= 0) return null;

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

// ============================================
// Content Type Helpers
// ============================================

export const CONTENT_TYPE_ICONS: Record<ListingContentType, string> = {
  adventure: '🏰',
  asset_pack: '🎨',
  homebrew_bundle: '📜',
  token_pack: '🎭',
  audio_pack: '🎵',
  map_pack: '🗺️',
};

export const CONTENT_TYPE_LABELS: Record<ListingContentType, string> = {
  adventure: 'Adventure',
  asset_pack: 'Asset Pack',
  homebrew_bundle: 'Homebrew Bundle',
  token_pack: 'Token Pack',
  audio_pack: 'Audio Pack',
  map_pack: 'Map Pack',
};

export function getContentTypeIcon(type: ListingContentType): string {
  return CONTENT_TYPE_ICONS[type] || '📦';
}

export function getContentTypeLabel(type: ListingContentType): string {
  return CONTENT_TYPE_LABELS[type] || 'Content';
}

// ============================================
// License Helpers
// ============================================

export const LICENSE_DESCRIPTIONS: Record<LicenseType, string> = {
  personal: 'For personal use only',
  commercial: 'Can be used in commercial projects',
  attribution: 'Requires attribution to creator',
  exclusive: 'Exclusive rights to purchaser',
};

export function getLicenseDescription(type: LicenseType): string {
  return LICENSE_DESCRIPTIONS[type] || 'Standard license';
}

// ============================================
// Rating Helpers
// ============================================

/**
 * Get star display for rating
 */
export function getRatingStars(rating: number): { full: number; half: boolean; empty: number } {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return { full, half, empty };
}

/**
 * Get rating color based on value
 */
export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'text-amber-400';
  if (rating >= 4.0) return 'text-amber-500';
  if (rating >= 3.0) return 'text-yellow-500';
  if (rating >= 2.0) return 'text-orange-500';
  return 'text-red-500';
}

/**
 * Get rating label
 */
export function getRatingLabel(rating: number): string {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 4.0) return 'Very Good';
  if (rating >= 3.0) return 'Good';
  if (rating >= 2.0) return 'Fair';
  return 'Poor';
}

// ============================================
// Subscription Helpers
// ============================================

export const SUBSCRIPTION_PRICES: Record<SubscriptionTier, { monthly: number; annual: number }> = {
  free: { monthly: 0, annual: 0 },
  premium: { monthly: 499, annual: 4999 },
  creator: { monthly: 999, annual: 9999 },
};

export const SUBSCRIPTION_FEATURES: Record<SubscriptionTier, string[]> = {
  free: [
    'Play adventures',
    'Create up to 3 adventures',
    'Publish adventures',
    '10 AI Seer suggestions/day',
    'Basic audio ambiance',
  ],
  premium: [
    'Everything in Free',
    'Unlimited adventures',
    'Unlimited AI Seer suggestions',
    'Full audio library',
    'Custom tokens',
    'Priority support',
    'Early access to features',
  ],
  creator: [
    'Everything in Premium',
    'Sell content on marketplace',
    'Creator analytics dashboard',
    '80% revenue share',
    'Verified creator badge',
    'Priority listing placement',
  ],
};

export function getSubscriptionPrice(tier: SubscriptionTier, cycle: 'monthly' | 'annual'): number {
  return SUBSCRIPTION_PRICES[tier][cycle];
}

export function getSubscriptionFeatures(tier: SubscriptionTier): string[] {
  return SUBSCRIPTION_FEATURES[tier];
}

export function getAnnualSavings(tier: SubscriptionTier): number {
  const monthly = SUBSCRIPTION_PRICES[tier].monthly * 12;
  const annual = SUBSCRIPTION_PRICES[tier].annual;
  if (monthly === 0) return 0;
  return Math.round(((monthly - annual) / monthly) * 100);
}

// ============================================
// Revenue Calculations
// ============================================

export interface RevenueSplit {
  grossCents: number;
  stripeFeeCents: number;
  platformFeeCents: number;
  creatorEarningsCents: number;
}

/**
 * Calculate revenue split for a sale
 */
export function calculateRevenueSplit(grossCents: number): RevenueSplit {
  // Stripe: 2.9% + 30¢
  const stripeFeeCents = Math.ceil(grossCents * 0.029) + 30;
  // Platform: 20% of (gross - stripe)
  const platformFeeCents = Math.ceil((grossCents - stripeFeeCents) * 0.20);
  // Creator gets the rest (~77%)
  const creatorEarningsCents = grossCents - stripeFeeCents - platformFeeCents;

  return {
    grossCents,
    stripeFeeCents,
    platformFeeCents,
    creatorEarningsCents,
  };
}

/**
 * Calculate creator's cut as percentage
 */
export function getCreatorCutPercent(grossCents: number): number {
  const split = calculateRevenueSplit(grossCents);
  return Math.round((split.creatorEarningsCents / grossCents) * 100);
}

// ============================================
// Validation
// ============================================

export function validateListingTitle(title: string): { valid: boolean; error?: string } {
  if (!title.trim()) {
    return { valid: false, error: 'Title is required' };
  }
  if (title.length < 3) {
    return { valid: false, error: 'Title must be at least 3 characters' };
  }
  if (title.length > 100) {
    return { valid: false, error: 'Title must be under 100 characters' };
  }
  return { valid: true };
}

export function validateListingDescription(description: string): { valid: boolean; error?: string } {
  if (!description.trim()) {
    return { valid: false, error: 'Description is required' };
  }
  if (description.length < 50) {
    return { valid: false, error: 'Description must be at least 50 characters' };
  }
  if (description.length > 5000) {
    return { valid: false, error: 'Description must be under 5000 characters' };
  }
  return { valid: true };
}

export function validatePrice(priceCents: number, priceType: PriceType): { valid: boolean; error?: string } {
  if (priceType === 'free') return { valid: true };
  
  if (priceCents < 99) {
    return { valid: false, error: 'Minimum price is $0.99' };
  }
  if (priceCents > 9999) {
    return { valid: false, error: 'Maximum price is $99.99' };
  }
  return { valid: true };
}

// ============================================
// Suggested Tags
// ============================================

export const SUGGESTED_MARKETPLACE_TAGS = {
  adventure: ['one-shot', 'campaign', 'beginner-friendly', 'horror', 'mystery', 'combat-heavy', 'roleplay-focused'],
  asset_pack: ['fantasy', 'sci-fi', 'horror', 'modern', 'historical', 'hand-drawn', 'pixel-art', 'realistic'],
  homebrew_bundle: ['monsters', 'items', 'spells', 'classes', 'races', 'balanced', 'experimental'],
  token_pack: ['characters', 'monsters', 'npcs', 'animals', 'vehicles', 'animated'],
  audio_pack: ['ambient', 'music', 'sfx', 'nature', 'urban', 'dungeon', 'tavern', 'battle'],
  map_pack: ['dungeon', 'wilderness', 'city', 'interior', 'battle-map', 'world-map', 'animated'],
};

export function getSuggestedTags(contentType: ListingContentType): string[] {
  return SUGGESTED_MARKETPLACE_TAGS[contentType] || [];
}

// ============================================
// Sample Data (for development)
// ============================================

export const SAMPLE_LISTING: import('./types').MarketplaceListing = {
  id: 'listing_1',
  creatorId: 'creator_1',
  contentType: 'adventure',
  contentId: 'adv_1',
  title: 'The Crystal Caves',
  description: 'Explore the mysterious Crystal Caves in this 90-minute adventure for 3-5 players...',
  shortDescription: 'A beginner-friendly dungeon crawl with mysterious crystals and ancient treasures.',
  tags: ['one-shot', 'beginner-friendly', 'dungeon'],
  thumbnailUrl: '/samples/crystal-caves.jpg',
  previewImages: ['/samples/crystal-1.jpg', '/samples/crystal-2.jpg'],
  priceType: 'paid',
  priceCents: 399,
  saleActive: false,
  status: 'published',
  publishedAt: new Date().toISOString(),
  purchaseCount: 234,
  viewCount: 1502,
  wishlistCount: 89,
  averageRating: 4.2,
  ratingCount: 47,
  licenseType: 'personal',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const SAMPLE_STOREFRONT: import('./types').CreatorStorefront = {
  id: 'storefront_1',
  userId: 'user_1',
  displayName: 'CaveExplorer',
  slug: 'caveexplorer',
  bio: 'Creating immersive dungeon adventures since 2020. Specializing in atmospheric one-shots.',
  avatarUrl: '/samples/avatar.jpg',
  bannerUrl: '/samples/banner.jpg',
  socialLinks: {
    twitter: 'caveexplorer',
    discord: 'caveexplorer#1234',
  },
  featuredItemIds: ['listing_1', 'listing_2'],
  totalSales: 892,
  totalRevenue: 425600,
  followerCount: 1247,
  averageRating: 4.6,
  verified: true,
  verifiedAt: new Date().toISOString(),
  payoutEnabled: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
