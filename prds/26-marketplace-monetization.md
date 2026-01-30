# PRD 26: Marketplace & Monetization

> **Status**: Ready for Implementation  
> **Priority**: P1 - High  
> **Estimated Effort**: 10 days  
> **Dependencies**: 12-publishing-system, 18-authentication, 20-content-management, 24-audio-ambiance, 25-homebrew-system

---

## Overview

The Marketplace enables SPARC creators to monetize their content—adventures, asset packs, homebrew collections, and more. It provides a full commerce platform with creator storefronts, secure payments via Stripe, revenue sharing, and subscription tiers. This system transforms SPARC from a free tool into a sustainable ecosystem where creators are rewarded for quality content.

### Goals
- Enable creators to sell adventures and asset packs
- Provide sustainable revenue model for SPARC platform
- Build thriving creator economy with fair revenue sharing
- Support both free and premium content tiers
- Deliver seamless, secure purchase experience

### Non-Goals
- Physical merchandise sales
- Real-money gambling/loot boxes
- Cryptocurrency payments
- White-label marketplace for other platforms

---

## User Stories

### Creator Storefront

#### US-01: Create Storefront
**As a** creator  
**I want to** set up my own storefront  
**So that** I can sell my content and build my brand

**Acceptance Criteria:**
- [ ] Custom storefront URL (sparc.gg/creators/username)
- [ ] Profile customization (bio, avatar, banner)
- [ ] Social links (Twitter, YouTube, Discord)
- [ ] Featured content section
- [ ] All published content displayed
- [ ] Analytics dashboard access

#### US-02: Set Pricing
**As a** creator  
**I want to** price my content  
**So that** I can earn money from my work

**Acceptance Criteria:**
- [ ] Set price per item ($0.99 - $99.99)
- [ ] Free option with optional "tip jar"
- [ ] Price suggestions based on content type
- [ ] Support for multiple currencies display
- [ ] Price change history tracked

### Content Sales

#### US-03: Purchase Adventure
**As a** player  
**I want to** buy premium adventures  
**So that** I can access high-quality content

**Acceptance Criteria:**
- [ ] Clear price display before purchase
- [ ] Preview content before buying
- [ ] Secure checkout flow
- [ ] Instant access after purchase
- [ ] Receipt via email
- [ ] Purchase history in account

#### US-04: Sell Asset Packs
**As a** creator  
**I want to** sell asset packs  
**So that** other creators can use my art/audio

**Acceptance Criteria:**
- [ ] Bundle multiple assets (art, audio, tokens)
- [ ] Set pack pricing
- [ ] License terms selection
- [ ] Preview samples
- [ ] Track usage of assets

#### US-05: Create Bundles
**As a** creator  
**I want to** bundle multiple items  
**So that** buyers get better value

**Acceptance Criteria:**
- [ ] Select multiple items for bundle
- [ ] Set bundle discount (% off)
- [ ] Bundle-only exclusive items
- [ ] Limited-time bundle option
- [ ] Bundle analytics

### Revenue & Payouts

#### US-06: Track Earnings
**As a** creator  
**I want to** see my earnings  
**So that** I know how my content performs

**Acceptance Criteria:**
- [ ] Real-time earnings dashboard
- [ ] Sales by item, period, geography
- [ ] Refund tracking
- [ ] Revenue projections
- [ ] Export reports (CSV, PDF)

#### US-07: Receive Payouts
**As a** creator  
**I want to** receive my earnings  
**So that** I can be compensated for my work

**Acceptance Criteria:**
- [ ] Stripe Connect integration
- [ ] Weekly or monthly payout options
- [ ] Minimum payout threshold ($10)
- [ ] Tax document generation (1099)
- [ ] Payout history

### Subscription Tiers

#### US-08: Subscribe to Premium
**As a** player  
**I want to** subscribe to SPARC Premium  
**So that** I get extra features and value

**Acceptance Criteria:**
- [ ] Clear tier comparison
- [ ] Monthly and annual options
- [ ] Easy upgrade/downgrade
- [ ] Cancel anytime
- [ ] Prorated billing

#### US-09: Gifting
**As a** player  
**I want to** gift content to friends  
**So that** I can share my favorite adventures

**Acceptance Criteria:**
- [ ] Gift specific items
- [ ] Gift subscriptions
- [ ] Send via email or username
- [ ] Custom gift message
- [ ] Recipient notification

### Discovery & Promotion

#### US-10: Featured Content
**As a** platform admin  
**I want to** feature quality content  
**So that** creators get visibility and users find great content

**Acceptance Criteria:**
- [ ] Curated featured sections
- [ ] Rotating featured items
- [ ] Category spotlights
- [ ] New release highlights
- [ ] Creator of the week

#### US-11: Discounts and Sales
**As a** creator  
**I want to** run sales on my content  
**So that** I can boost visibility and revenue

**Acceptance Criteria:**
- [ ] Set discount percentage
- [ ] Schedule sale dates
- [ ] Limited quantity sales
- [ ] Countdown timer display
- [ ] Sale analytics

---

## Technical Specification

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      MARKETPLACE ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ User         │───>│ SPARC API        │───>│ Stripe API       │
│ (Browser)    │    │ Gateway          │    │ (Payments)       │
└──────────────┘    └────────┬─────────┘    └──────────────────┘
                             │                        │
                             v                        v
┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Content      │<───│ Marketplace      │───>│ Stripe Connect   │
│ Delivery     │    │ Service          │    │ (Payouts)        │
└──────────────┘    └────────┬─────────┘    └──────────────────┘
                             │
                             v
┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Analytics    │<───│ PostgreSQL       │───>│ Redis Cache      │
│ Service      │    │ (Transactions)   │    │ (Cart, Prices)   │
└──────────────┘    └──────────────────┘    └──────────────────┘
```

### Data Models

```typescript
// Creator Storefront
interface CreatorStorefront {
  id: string;
  userId: string;
  
  // Profile
  displayName: string;
  slug: string;                 // URL-friendly name
  bio: string;
  avatarUrl?: string;
  bannerUrl?: string;
  
  // Social Links
  socialLinks: {
    twitter?: string;
    youtube?: string;
    twitch?: string;
    discord?: string;
    website?: string;
  };
  
  // Customization
  theme?: {
    primaryColor?: string;
    accentColor?: string;
  };
  featuredItemIds: string[];
  
  // Stats
  totalSales: number;
  totalRevenue: number;         // In cents
  followerCount: number;
  averageRating: number;
  
  // Verification
  verified: boolean;
  verifiedAt?: string;
  
  // Payout
  stripeConnectId?: string;
  payoutEnabled: boolean;
  
  createdAt: string;
  updatedAt: string;
}

// Marketplace Listing
interface MarketplaceListing {
  id: string;
  creatorId: string;
  
  // Content Reference
  contentType: ListingContentType;
  contentId: string;            // Adventure ID, asset pack ID, etc.
  
  // Listing Info
  title: string;
  description: string;
  shortDescription: string;     // Max 160 chars
  tags: string[];
  
  // Media
  thumbnailUrl: string;
  previewImages: string[];
  previewVideo?: string;
  
  // Pricing
  priceType: 'free' | 'paid' | 'pwyw';  // Pay what you want
  priceCents: number;           // In cents, 0 for free
  minimumPriceCents?: number;   // For PWYW
  suggestedPriceCents?: number; // For PWYW
  
  // Sale
  saleActive: boolean;
  salePriceCents?: number;
  saleStartAt?: string;
  saleEndAt?: string;
  
  // Status
  status: ListingStatus;
  publishedAt?: string;
  
  // Stats
  purchaseCount: number;
  viewCount: number;
  wishlistCount: number;
  averageRating: number;
  ratingCount: number;
  
  // Licensing
  licenseType: LicenseType;
  
  createdAt: string;
  updatedAt: string;
}

type ListingContentType = 
  | 'adventure'
  | 'asset_pack'
  | 'homebrew_bundle'
  | 'token_pack'
  | 'audio_pack'
  | 'map_pack';

type ListingStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'removed';
type LicenseType = 'personal' | 'commercial' | 'attribution' | 'exclusive';

// Asset Pack
interface AssetPack {
  id: string;
  creatorId: string;
  listingId?: string;
  
  name: string;
  description: string;
  category: AssetCategory;
  
  // Contents
  assets: AssetReference[];
  assetCount: number;
  
  // Metadata
  tags: string[];
  style?: string;               // "Fantasy", "Sci-Fi", "Horror"
  
  // Samples (free previews)
  sampleAssets: string[];
  
  createdAt: string;
  updatedAt: string;
}

type AssetCategory = 'art' | 'tokens' | 'maps' | 'audio' | 'mixed';

interface AssetReference {
  assetId: string;
  name: string;
  type: 'image' | 'audio' | 'map';
  thumbnailUrl: string;
}

// Bundle
interface Bundle {
  id: string;
  creatorId: string;
  
  name: string;
  description: string;
  
  // Items
  items: BundleItem[];
  totalValueCents: number;      // Sum of individual prices
  
  // Pricing
  bundlePriceCents: number;
  discountPercent: number;
  
  // Availability
  availableFrom?: string;
  availableUntil?: string;
  maxPurchases?: number;        // Limited quantity
  purchasesMade: number;
  
  // Status
  status: 'draft' | 'active' | 'ended' | 'soldout';
  
  createdAt: string;
}

interface BundleItem {
  listingId: string;
  title: string;
  priceCents: number;
  exclusive: boolean;           // Only available in bundle
}

// Purchase & Transaction
interface Purchase {
  id: string;
  userId: string;
  
  // Items
  items: PurchaseItem[];
  
  // Pricing
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;             // ISO 4217
  
  // Payment
  stripePaymentIntentId: string;
  paymentStatus: PaymentStatus;
  
  // Gift
  isGift: boolean;
  giftRecipientId?: string;
  giftMessage?: string;
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  
  createdAt: string;
  completedAt?: string;
  refundedAt?: string;
}

interface PurchaseItem {
  listingId: string;
  title: string;
  priceCents: number;
  salePriceCents?: number;
  creatorId: string;
}

type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

// Revenue & Payouts
interface CreatorEarnings {
  creatorId: string;
  period: string;               // "2025-01" for monthly
  
  // Gross
  grossRevenueCents: number;
  salesCount: number;
  
  // Deductions
  platformFeeCents: number;     // SPARC cut
  stripeFeesCents: number;
  refundsCents: number;
  
  // Net
  netEarningsCents: number;
  
  // Breakdown by listing
  byListing: {
    listingId: string;
    title: string;
    salesCount: number;
    revenueCents: number;
  }[];
}

interface Payout {
  id: string;
  creatorId: string;
  
  amountCents: number;
  currency: string;
  
  // Stripe
  stripeTransferId: string;
  stripePayoutId?: string;
  
  // Status
  status: PayoutStatus;
  
  // Period covered
  periodStart: string;
  periodEnd: string;
  
  // Tax
  taxFormGenerated: boolean;
  
  createdAt: string;
  completedAt?: string;
}

type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed';

// Subscription
interface Subscription {
  id: string;
  userId: string;
  
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  
  // Stripe
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  
  // Billing
  billingCycle: 'monthly' | 'annual';
  priceCents: number;
  currency: string;
  
  // Dates
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  
  // Gift
  isGifted: boolean;
  gifterId?: string;
  
  createdAt: string;
  canceledAt?: string;
}

type SubscriptionTier = 'free' | 'premium' | 'creator';
type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'incomplete';

// User Library
interface UserLibrary {
  userId: string;
  
  // Owned content
  purchases: UserPurchase[];
  
  // Wishlist
  wishlist: string[];           // Listing IDs
  
  // Following
  followedCreators: string[];
}

interface UserPurchase {
  purchaseId: string;
  listingId: string;
  contentType: ListingContentType;
  contentId: string;
  title: string;
  purchasedAt: string;
  giftedBy?: string;
}
```

### API Endpoints

#### Storefronts

##### GET /api/v1/storefronts/:slug

Get creator storefront.

```typescript
interface GetStorefrontResponse {
  success: true;
  data: {
    storefront: CreatorStorefront;
    listings: MarketplaceListing[];
    featured: MarketplaceListing[];
    stats: {
      totalProducts: number;
      averageRating: number;
    };
  };
}
```

##### PUT /api/v1/storefronts/me

Update own storefront.

```typescript
interface UpdateStorefrontRequest {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  socialLinks?: Partial<CreatorStorefront['socialLinks']>;
  theme?: Partial<CreatorStorefront['theme']>;
  featuredItemIds?: string[];
}
```

#### Listings

##### POST /api/v1/marketplace/listings

Create marketplace listing.

```typescript
interface CreateListingRequest {
  contentType: ListingContentType;
  contentId: string;
  title: string;
  description: string;
  shortDescription: string;
  tags: string[];
  thumbnailUrl: string;
  previewImages: string[];
  priceType: 'free' | 'paid' | 'pwyw';
  priceCents?: number;
  licenseType: LicenseType;
}

interface CreateListingResponse {
  success: true;
  data: {
    listing: MarketplaceListing;
  };
}
```

##### GET /api/v1/marketplace/listings

Browse marketplace.

```typescript
interface BrowseListingsRequest {
  contentType?: ListingContentType;
  tags?: string[];
  priceMin?: number;
  priceMax?: number;
  onSale?: boolean;
  sortBy?: 'popular' | 'newest' | 'rating' | 'price_low' | 'price_high';
  search?: string;
  creatorId?: string;
  limit?: number;
  offset?: number;
}

interface BrowseListingsResponse {
  success: true;
  data: {
    listings: MarketplaceListing[];
    total: number;
    facets: {
      contentTypes: { type: string; count: number }[];
      priceRanges: { range: string; count: number }[];
      tags: { tag: string; count: number }[];
    };
  };
}
```

##### PUT /api/v1/marketplace/listings/:id/price

Update pricing.

```typescript
interface UpdatePriceRequest {
  priceCents?: number;
  saleActive?: boolean;
  salePriceCents?: number;
  saleStartAt?: string;
  saleEndAt?: string;
}
```

#### Purchases

##### POST /api/v1/marketplace/checkout

Create checkout session.

```typescript
interface CreateCheckoutRequest {
  items: {
    listingId: string;
    quantity?: number;          // For bundles
  }[];
  giftRecipientId?: string;
  giftMessage?: string;
}

interface CreateCheckoutResponse {
  success: true;
  data: {
    sessionId: string;          // Stripe Checkout Session
    clientSecret: string;
    totalCents: number;
  };
}
```

##### POST /api/v1/marketplace/checkout/:sessionId/complete

Complete purchase (called by Stripe webhook).

##### GET /api/v1/marketplace/purchases

Get user's purchase history.

```typescript
interface PurchaseHistoryResponse {
  success: true;
  data: {
    purchases: Purchase[];
    total: number;
  };
}
```

##### POST /api/v1/marketplace/purchases/:id/refund

Request refund.

```typescript
interface RefundRequest {
  reason: string;
}
```

#### Creator Analytics

##### GET /api/v1/creators/me/analytics

Get creator analytics.

```typescript
interface CreatorAnalyticsRequest {
  period?: 'day' | 'week' | 'month' | 'year' | 'all';
  startDate?: string;
  endDate?: string;
}

interface CreatorAnalyticsResponse {
  success: true;
  data: {
    summary: {
      totalRevenueCents: number;
      totalSales: number;
      averageOrderCents: number;
      conversionRate: number;
    };
    timeSeries: {
      date: string;
      revenueCents: number;
      salesCount: number;
    }[];
    topListings: {
      listingId: string;
      title: string;
      salesCount: number;
      revenueCents: number;
    }[];
    geography: {
      country: string;
      salesCount: number;
      revenueCents: number;
    }[];
  };
}
```

##### GET /api/v1/creators/me/earnings

Get earnings breakdown.

```typescript
interface EarningsResponse {
  success: true;
  data: {
    currentBalance: number;     // Available for payout
    pendingBalance: number;     // Processing
    lifetimeEarnings: number;
    
    recentEarnings: CreatorEarnings[];
    
    nextPayout: {
      estimatedAmount: number;
      scheduledDate: string;
    } | null;
  };
}
```

#### Payouts

##### POST /api/v1/creators/me/payouts/setup

Set up Stripe Connect for payouts.

```typescript
interface SetupPayoutResponse {
  success: true;
  data: {
    stripeConnectUrl: string;   // Onboarding URL
  };
}
```

##### GET /api/v1/creators/me/payouts

Get payout history.

```typescript
interface PayoutHistoryResponse {
  success: true;
  data: {
    payouts: Payout[];
    total: number;
  };
}
```

#### Subscriptions

##### POST /api/v1/subscriptions

Create subscription.

```typescript
interface CreateSubscriptionRequest {
  tier: 'premium' | 'creator';
  billingCycle: 'monthly' | 'annual';
  giftRecipientId?: string;
}

interface CreateSubscriptionResponse {
  success: true;
  data: {
    clientSecret: string;       // Stripe subscription payment
    subscriptionId: string;
  };
}
```

##### PUT /api/v1/subscriptions/me

Update subscription.

```typescript
interface UpdateSubscriptionRequest {
  tier?: 'premium' | 'creator';
  billingCycle?: 'monthly' | 'annual';
  cancelAtPeriodEnd?: boolean;
}
```

##### DELETE /api/v1/subscriptions/me

Cancel subscription.

#### Bundles

##### POST /api/v1/marketplace/bundles

Create bundle.

```typescript
interface CreateBundleRequest {
  name: string;
  description: string;
  items: { listingId: string; exclusive?: boolean }[];
  bundlePriceCents: number;
  availableFrom?: string;
  availableUntil?: string;
  maxPurchases?: number;
}
```

#### Gifting

##### POST /api/v1/marketplace/gifts

Send gift.

```typescript
interface SendGiftRequest {
  listingId?: string;           // For single item
  subscriptionTier?: SubscriptionTier;
  recipientEmail?: string;
  recipientUserId?: string;
  message?: string;
}

interface SendGiftResponse {
  success: true;
  data: {
    giftId: string;
    checkoutUrl: string;
  };
}
```

### Stripe Integration

#### Webhook Events

```typescript
const HANDLED_EVENTS = [
  'checkout.session.completed',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'invoice.paid',
  'invoice.payment_failed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'transfer.created',
  'payout.paid',
  'payout.failed',
];

// Webhook handler
async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object);
      break;
    case 'invoice.paid':
      await handleSubscriptionPayment(event.data.object);
      break;
    // ...
  }
}
```

#### Revenue Split

```typescript
interface RevenueConfig {
  platformFeePercent: number;   // SPARC takes 20%
  stripeFeePercent: number;     // ~2.9% + $0.30
  creatorPercent: number;       // ~77%
}

function calculateRevenueSplit(grossCents: number): RevenueSplit {
  const stripeFee = Math.ceil(grossCents * 0.029) + 30;
  const platformFee = Math.ceil((grossCents - stripeFee) * 0.20);
  const creatorEarnings = grossCents - stripeFee - platformFee;
  
  return {
    grossCents,
    stripeFeeCents: stripeFee,
    platformFeeCents: platformFee,
    creatorEarningsCents: creatorEarnings,
  };
}
```

---

## Subscription Tiers

### Tier Comparison

| Feature | Free | Premium ($4.99/mo) | Creator ($9.99/mo) |
|---------|------|-------------------|-------------------|
| Play adventures | ✅ | ✅ | ✅ |
| Create adventures | 3 max | Unlimited | Unlimited |
| Publish adventures | ✅ | ✅ | ✅ |
| AI Seer suggestions | 10/day | Unlimited | Unlimited |
| Audio ambiance | Basic | Full library | Full library |
| Custom tokens | ❌ | ✅ | ✅ |
| Priority support | ❌ | ✅ | ✅ |
| Sell content | ❌ | ❌ | ✅ |
| Creator analytics | ❌ | ❌ | ✅ |
| Revenue share | — | — | 80% |
| Verified badge | ❌ | ❌ | ✅ |
| Early access | ❌ | ✅ | ✅ |

### Pricing

| Tier | Monthly | Annual | Savings |
|------|---------|--------|---------|
| Premium | $4.99 | $49.99 | ~17% |
| Creator | $9.99 | $99.99 | ~17% |

---

## UI/UX Specifications

### Marketplace Browse

```
┌─────────────────────────────────────────────────────────────────────────┐
│ SPARC Marketplace                                    🔍 Search...       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ⭐ Featured This Week                                                   │
│ ┌─────────────────────────────────────────────────────────────────────┐│
│ │ 🏰 The Dragon's Lair    🌲 Lost Temple     ⚔️ Epic Battle Pack     ││
│ │ $4.99 ★★★★★ (4.9)      $2.99 ★★★★☆ (4.3)  $7.99 ★★★★★ (4.8)      ││
│ │ by DragonMaster42       by TempleSeeker    by ArtistPro            ││
│ └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ Categories                                                              │
│ [All] [Adventures] [Asset Packs] [Tokens] [Audio] [Maps] [Homebrew]    │
│                                                                         │
│ Filters: [Price ▼] [Rating ▼] [On Sale ☐]     Sort: [Popular ▼]       │
│                                                                         │
│ ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐   │
│ │ 🏰                 │ │ 🎨                 │ │ 🎵                 │   │
│ │ The Crystal Caves  │ │ Fantasy Tokens     │ │ Dungeon Ambiance   │   │
│ │ Adventure          │ │ Token Pack (50)    │ │ Audio Pack         │   │
│ │                    │ │                    │ │                    │   │
│ │ $3.99              │ │ $1.99              │ │ $2.49              │   │
│ │ ★★★★☆ (4.2) 234    │ │ ★★★★★ (4.7) 892   │ │ ★★★★☆ (4.4) 156   │   │
│ │ by CaveExplorer    │ │ by TokenMaster     │ │ by SoundWizard     │   │
│ │                    │ │                    │ │                    │   │
│ │ [Preview] [Buy]    │ │ [Preview] [Buy]    │ │ [Preview] [Buy]    │   │
│ └────────────────────┘ └────────────────────┘ └────────────────────┘   │
│                                                                         │
│ ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐   │
│ │ 🗡️                 │ │ 📜                 │ │ 🔥 SALE            │   │
│ │ Weapon Art Pack    │ │ Monster Manual     │ │ Horror Bundle      │   │
│ │ Asset Pack         │ │ Homebrew Bundle    │ │ 3 Adventures       │   │
│ │                    │ │                    │ │                    │   │
│ │ $4.99              │ │ FREE               │ │ $9.99 $14.99       │   │
│ │ ★★★★★ (4.9) 567   │ │ ★★★★☆ (4.1) 1.2k  │ │ ★★★★★ (4.8) 89    │   │
│ │ by WeaponForge     │ │ by BestiaryPro     │ │ by HorrorMaster    │   │
│ │                    │ │                    │ │                    │   │
│ │ [Preview] [Buy]    │ │ [Preview] [Get]    │ │ [Preview] [Buy]    │   │
│ └────────────────────┘ └────────────────────┘ └────────────────────┘   │
│                                                                         │
│ [Load More...]                                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Listing Detail Page

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ← Back to Marketplace                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌──────────────────────────────┐  ┌────────────────────────────────┐   │
│ │                              │  │ The Crystal Caves              │   │
│ │                              │  │ ★★★★☆ 4.2 (234 reviews)        │   │
│ │    [Adventure Thumbnail]     │  │                                │   │
│ │                              │  │ by CaveExplorer ✓ Verified     │   │
│ │                              │  │                                │   │
│ │                              │  │ ────────────────────────────── │   │
│ │                              │  │                                │   │
│ │                              │  │ $3.99                          │   │
│ └──────────────────────────────┘  │                                │   │
│                                    │ [🛒 Add to Cart]               │   │
│ ┌──────┐┌──────┐┌──────┐┌──────┐  │ [♡ Wishlist]  [🎁 Gift]       │   │
│ │ img1 ││ img2 ││ img3 ││ img4 │  │                                │   │
│ └──────┘└──────┘└──────┘└──────┘  │ ────────────────────────────── │   │
│                                    │                                │   │
│ Description                        │ Includes:                      │   │
│ ────────────────────────────────── │ • 5 unique scenes              │   │
│ Explore the mysterious Crystal     │ • 3 custom monsters            │   │
│ Caves in this 90-minute adventure  │ • 12 custom tokens             │   │
│ for 3-5 players. Discover ancient  │ • Ambient audio pack           │   │
│ treasures and face the guardian of │                                │   │
│ the depths!                        │ ────────────────────────────── │   │
│                                    │                                │   │
│ Perfect for:                       │ 📊 Stats                       │   │
│ • New players                      │ • 1,234 purchases              │   │
│ • One-shot sessions                │ • ~90 min playtime             │   │
│ • Fantasy themes                   │ • 3-5 players                  │   │
│                                    │ • Difficulty: Beginner         │   │
│                                    │                                │   │
│                                    └────────────────────────────────┘   │
│                                                                         │
│ Reviews                                                      [Write ▼] │
│ ────────────────────────────────────────────────────────────────────── │
│ ★★★★★  "Amazing adventure! My group loved it."                         │
│ by TableTopFan • Jan 28, 2025                                          │
│                                                                         │
│ ★★★★☆  "Great for beginners, maybe too easy for experienced players"   │
│ by VeteranGM • Jan 25, 2025                                            │
│   ↳ Creator: Thanks for the feedback! Working on a hard mode variant.  │
│                                                                         │
│ [Show more reviews...]                                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Creator Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Creator Dashboard                                        [View Store →] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ 💰 Earnings Overview                              [This Month ▼]        │
│ ┌─────────────────────────────────────────────────────────────────────┐│
│ │                                                                     ││
│ │  Revenue         Sales         Avg Order        Conversion         ││
│ │  $1,247.50       312           $4.00            3.2%               ││
│ │  ↑ 23%           ↑ 15%         ↑ 5%             ↑ 0.4%             ││
│ │                                                                     ││
│ │  ┌─────────────────────────────────────────────────────────┐       ││
│ │  │ Revenue Chart                                           │       ││
│ │  │   $100│    ╭─╮                                          │       ││
│ │  │       │ ╭──╯ ╰──╮  ╭──────╮                             │       ││
│ │  │    $50│─╯        ╰──╯      ╰────                        │       ││
│ │  │       └─────────────────────────────────                │       ││
│ │  │         Jan 1        Jan 15         Jan 29              │       ││
│ │  └─────────────────────────────────────────────────────────┘       ││
│ │                                                                     ││
│ └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ 📦 Top Products                                                         │
│ ┌──────────────────────────────────────────────────────────┬──────────┐│
│ │ Product                                        Sales     │ Revenue  ││
│ ├──────────────────────────────────────────────────────────┼──────────┤│
│ │ 🏰 The Crystal Caves                          156       │ $623.44  ││
│ │ 🎨 Fantasy Token Pack Vol. 1                  98        │ $195.02  ││
│ │ 🎵 Dungeon Ambiance                           58        │ $144.42  ││
│ └──────────────────────────────────────────────────────────┴──────────┘│
│                                                                         │
│ 💳 Payout Status                                                        │
│ ┌─────────────────────────────────────────────────────────────────────┐│
│ │ Available Balance: $847.25                                          ││
│ │ Pending: $400.25 (clearing Jan 31)                                  ││
│ │                                                                     ││
│ │ Next Payout: Feb 1, 2025 (est. $847.25)        [Request Payout]    ││
│ └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ 📊 Quick Actions                                                        │
│ [+ New Listing]  [Create Bundle]  [Run Sale]  [View Analytics]         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Checkout Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Checkout                                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Your Cart (2 items)                                                     │
│ ┌─────────────────────────────────────────────────────────────────────┐│
│ │ ┌────┐                                                              ││
│ │ │ 🏰 │ The Crystal Caves                               $3.99       ││
│ │ └────┘ Adventure by CaveExplorer                       [Remove]    ││
│ │                                                                     ││
│ │ ┌────┐                                                              ││
│ │ │ 🎨 │ Fantasy Token Pack Vol. 1                       $1.99       ││
│ │ └────┘ Token Pack by TokenMaster                       [Remove]    ││
│ └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐│
│ │ [Have a promo code?]                                                ││
│ │                                                                     ││
│ │ Subtotal                                                  $5.98    ││
│ │ Tax                                                       $0.00    ││
│ │ ──────────────────────────────────────────────────────────────     ││
│ │ Total                                                     $5.98    ││
│ └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ ☐ Gift this purchase                                                   │
│                                                                         │
│ [Pay with Card]                    Powered by Stripe                   │
│                                                                         │
│ By purchasing, you agree to our Terms of Service.                      │
│ All sales final. Refund policy applies.                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Security & Compliance

### Payment Security

- All payments processed through Stripe (PCI DSS compliant)
- No card details stored on SPARC servers
- Webhook signature verification
- Idempotency keys for all transactions

### Fraud Prevention

```typescript
interface FraudCheck {
  // Velocity checks
  purchasesLastHour: number;
  purchasesLastDay: number;
  
  // Risk signals
  ipMismatch: boolean;
  newAccount: boolean;
  unusualAmount: boolean;
  
  // Action
  decision: 'allow' | 'review' | 'block';
  riskScore: number;
}

// Block suspicious activity
if (fraudCheck.purchasesLastHour > 10) {
  throw new Error('Too many purchases. Please try again later.');
}
```

### Tax Compliance

- Stripe Tax for automatic tax calculation
- Tax documents for creators (1099-K for US)
- VAT handling for EU customers
- Sales tax collection where required

### Content Policies

- No sale of copyrighted material without license
- No adult/NSFW content
- Creator verification for high-volume sellers
- DMCA takedown process

---

## Testing Requirements

### Unit Tests

```typescript
describe('RevenueSplit', () => {
  it('should calculate correct split for $10 purchase', () => {
    const split = calculateRevenueSplit(1000);
    expect(split.stripeFeeCents).toBe(59);      // 2.9% + 30¢
    expect(split.platformFeeCents).toBe(188);    // 20% of net
    expect(split.creatorEarningsCents).toBe(753); // Remainder
  });
});

describe('Checkout', () => {
  it('should apply bundle discount correctly', () => {
    const bundle = createBundle({ items: [500, 500], discount: 20 });
    expect(bundle.bundlePriceCents).toBe(800);
  });
  
  it('should validate gift recipient exists', async () => {
    const result = await validateGiftRecipient('nonexistent@email.com');
    expect(result.valid).toBe(false);
  });
});
```

### Integration Tests

- Stripe checkout flow end-to-end
- Webhook handling for all event types
- Payout creation and processing
- Subscription lifecycle

### E2E Tests

- Complete purchase flow
- Creator onboarding to first sale
- Subscription upgrade/downgrade
- Refund processing

---

## Performance Requirements

| Operation | Target |
|-----------|--------|
| Marketplace browse | <500ms |
| Checkout creation | <1s |
| Payment processing | <3s (Stripe) |
| Payout initiation | <2s |
| Analytics dashboard | <1s |

---

## Implementation Phases

### Phase 1: Core Commerce (Days 1-3)
- Stripe integration setup
- Checkout flow
- Purchase and library management
- Webhook handling

### Phase 2: Creator Tools (Days 4-5)
- Storefront creation
- Listing management
- Pricing and sales

### Phase 3: Payouts (Days 6-7)
- Stripe Connect integration
- Earnings tracking
- Payout processing
- Tax document generation

### Phase 4: Subscriptions (Day 8)
- Subscription tiers
- Billing management
- Feature gating

### Phase 5: Discovery & Gifting (Days 9-10)
- Featured content curation
- Bundles and discounts
- Gifting system
- Testing and launch prep

---

## Future Enhancements

- **Creator Crowdfunding**: Kickstarter-style adventure funding
- **Tip Jar**: Direct creator support without purchase
- **Affiliate Program**: Referral commissions
- **Enterprise Licensing**: Bulk purchases for schools/clubs
- **Print on Demand**: Physical adventure books
- **NFT Collectibles**: Limited edition digital items (if market recovers)

---

*PRD 26 - Marketplace & Monetization*  
*Version 1.0 | January 2025*
