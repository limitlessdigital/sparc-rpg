/**
 * Cart - Shopping cart and checkout components
 * Based on PRD 26: Marketplace & Monetization
 */

import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "../Button";
import { Input, Textarea } from "../Input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../Card";
import { Badge } from "../Badge";
import { Spinner } from "../Loading";
import {
  CartPanelProps,
  CheckoutProps,
  Cart,
  CartItem,
  MarketplaceListing,
} from "./types";
import {
  formatPrice,
  getContentTypeIcon,
} from "./utils";

// ============================================
// Cart Item Component
// ============================================

function CartItemCard({
  item,
  onRemove,
}: {
  item: CartItem;
  onRemove?: (listingId: string) => void;
}) {
  const { listing } = item;
  const displayPrice = listing.saleActive && listing.salePriceCents
    ? listing.salePriceCents
    : listing.priceCents;

  return (
    <div className="flex gap-4 py-4 border-b border-border last:border-0">
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
        {listing.thumbnailUrl ? (
          <img
            src={listing.thumbnailUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            {getContentTypeIcon(listing.contentType)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{listing.title}</h4>
        <p className="text-sm text-muted-foreground">
          {listing.creator?.displayName || 'Unknown creator'}
        </p>
        {listing.saleActive && listing.salePriceCents && (
          <Badge variant="secondary" className="mt-1 bg-red-500/10 text-red-500 border-0">
            🔥 On Sale
          </Badge>
        )}
      </div>

      {/* Price & Remove */}
      <div className="flex flex-col items-end">
        <div className="text-right">
          {listing.saleActive && listing.salePriceCents ? (
            <>
              <span className="text-sm text-muted-foreground line-through mr-2">
                {formatPrice(listing.priceCents)}
              </span>
              <span className="font-semibold text-red-500">
                {formatPrice(listing.salePriceCents)}
              </span>
            </>
          ) : (
            <span className="font-semibold">
              {formatPrice(listing.priceCents)}
            </span>
          )}
        </div>
        <button
          onClick={() => onRemove?.(listing.id)}
          className="text-sm text-muted-foreground hover:text-red-500 mt-2"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

// ============================================
// Cart Panel Component
// ============================================

export function CartPanel({
  cart,
  onRemove,
  onCheckout,
  onContinueShopping,
  isGift = false,
  onToggleGift,
  giftRecipient,
  onGiftRecipientChange,
  giftMessage,
  onGiftMessageChange,
  className,
}: CartPanelProps) {
  const isEmpty = cart.items.length === 0;
  const [promoCode, setPromoCode] = React.useState('');
  const [promoError, setPromoError] = React.useState<string | null>(null);

  const handleApplyPromo = () => {
    // Placeholder for promo code validation
    setPromoError('Invalid promo code');
  };

  return (
    <Card className={cn("w-full max-w-lg", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🛒 Your Cart
          {!isEmpty && (
            <Badge variant="secondary">
              {cart.items.length} item{cart.items.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Empty State */}
        {isEmpty ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🛒</div>
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Button variant="primary" onClick={onContinueShopping}>
              Browse Marketplace
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="divide-y divide-border">
              {cart.items.map((item) => (
                <CartItemCard
                  key={item.listing.id}
                  item={item}
                  onRemove={onRemove}
                />
              ))}
            </div>

            {/* Promo Code */}
            <div className="pt-4">
              <button
                className="text-sm text-primary hover:underline"
                onClick={() => {/* Toggle promo input */}}
              >
                Have a promo code?
              </button>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1"
                />
                <Button variant="secondary" onClick={handleApplyPromo}>
                  Apply
                </Button>
              </div>
              {promoError && (
                <p className="text-sm text-red-500 mt-1">{promoError}</p>
              )}
            </div>

            {/* Gift Option */}
            <div className="pt-4 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => onToggleGift?.(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">🎁 Gift this purchase</span>
              </label>

              {isGift && (
                <div className="mt-4 space-y-3">
                  <Input
                    placeholder="Recipient email or username"
                    value={giftRecipient || ''}
                    onChange={(e) => onGiftRecipientChange?.(e.target.value)}
                  />
                  <Textarea
                    placeholder="Gift message (optional)"
                    value={giftMessage || ''}
                    onChange={(e) => onGiftMessageChange?.(e.target.value)}
                    rows={2}
                  />
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(cart.subtotalCents)}</span>
              </div>
              {cart.discountCents > 0 && (
                <div className="flex justify-between text-sm text-green-500">
                  <span>Discount</span>
                  <span>-{formatPrice(cart.discountCents)}</span>
                </div>
              )}
              {cart.taxCents > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(cart.taxCents)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2">
                <span>Total</span>
                <span>{formatPrice(cart.totalCents)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {!isEmpty && (
        <CardFooter className="flex-col gap-2">
          <Button
            variant="primary"
            className="w-full"
            onClick={onCheckout}
          >
            Proceed to Checkout
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={onContinueShopping}
          >
            Continue Shopping
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// ============================================
// Checkout Component
// ============================================

export function Checkout({
  cart,
  onComplete,
  onCancel,
  loading = false,
  error,
  className,
}: CheckoutProps) {
  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div>
          <h3 className="font-semibold mb-4">Order Summary</h3>
          <div className="space-y-3">
            {cart.items.map((item) => (
              <div key={item.listing.id} className="flex justify-between text-sm">
                <span className="truncate flex-1">
                  {getContentTypeIcon(item.listing.contentType)} {item.listing.title}
                </span>
                <span className="ml-4">
                  {formatPrice(
                    item.listing.saleActive && item.listing.salePriceCents
                      ? item.listing.salePriceCents
                      : item.listing.priceCents
                  )}
                </span>
              </div>
            ))}
          </div>

          <hr className="my-4" />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(cart.subtotalCents)}</span>
            </div>
            {cart.discountCents > 0 && (
              <div className="flex justify-between text-sm text-green-500">
                <span>Discount</span>
                <span>-{formatPrice(cart.discountCents)}</span>
              </div>
            )}
            {cart.taxCents > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatPrice(cart.taxCents)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2">
              <span>Total</span>
              <span>{formatPrice(cart.totalCents)}</span>
            </div>
          </div>
        </div>

        {/* Payment Section (Stripe placeholder) */}
        <div>
          <h3 className="font-semibold mb-4">Payment</h3>
          <div className="border border-border rounded-lg p-6 text-center bg-muted/30">
            <div className="text-4xl mb-2">💳</div>
            <p className="text-muted-foreground text-sm">
              Stripe payment form will be integrated here
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Secure payment processing powered by Stripe
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Terms */}
        <p className="text-xs text-muted-foreground text-center">
          By purchasing, you agree to our Terms of Service.
          All sales are final. Refund policy applies.
        </p>
      </CardContent>

      <CardFooter className="flex gap-3">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          onClick={() => {
            // Placeholder - would integrate with Stripe
            onComplete?.({
              id: 'purchase_' + Date.now(),
              userId: 'user_1',
              items: cart.items.map(i => ({
                listingId: i.listing.id,
                title: i.listing.title,
                priceCents: i.listing.priceCents,
                salePriceCents: i.listing.salePriceCents,
                creatorId: i.listing.creatorId,
              })),
              subtotalCents: cart.subtotalCents,
              discountCents: cart.discountCents,
              taxCents: cart.taxCents,
              totalCents: cart.totalCents,
              currency: 'USD',
              stripePaymentIntentId: 'pi_placeholder',
              paymentStatus: 'completed',
              isGift: false,
              createdAt: new Date().toISOString(),
              completedAt: new Date().toISOString(),
            });
          }}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Processing...
            </>
          ) : (
            `Pay ${formatPrice(cart.totalCents)}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// ============================================
// Mini Cart (for navbar)
// ============================================

export function MiniCart({
  cart,
  onViewCart,
  onRemove,
}: {
  cart: Cart;
  onViewCart?: () => void;
  onRemove?: (listingId: string) => void;
}) {
  const itemCount = cart.items.length;

  if (itemCount === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <div className="text-2xl mb-2">🛒</div>
        <p className="text-sm">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="w-80">
      <div className="p-4 border-b border-border">
        <h4 className="font-semibold">
          Cart ({itemCount} item{itemCount !== 1 ? 's' : ''})
        </h4>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {cart.items.slice(0, 3).map((item) => (
          <div key={item.listing.id} className="p-3 border-b border-border flex gap-3">
            <div className="w-10 h-10 rounded bg-muted flex-shrink-0 flex items-center justify-center">
              {getContentTypeIcon(item.listing.contentType)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.listing.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatPrice(
                  item.listing.saleActive && item.listing.salePriceCents
                    ? item.listing.salePriceCents
                    : item.listing.priceCents
                )}
              </p>
            </div>
            <button
              onClick={() => onRemove?.(item.listing.id)}
              className="text-muted-foreground hover:text-red-500"
            >
              ×
            </button>
          </div>
        ))}
        {cart.items.length > 3 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            +{cart.items.length - 3} more item{cart.items.length - 3 !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex justify-between mb-3">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-semibold">{formatPrice(cart.totalCents)}</span>
        </div>
        <Button variant="primary" className="w-full" onClick={onViewCart}>
          View Cart & Checkout
        </Button>
      </div>
    </div>
  );
}

export default CartPanel;
