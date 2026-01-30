/**
 * CreatorDashboard - Creator analytics and earnings dashboard
 * Based on PRD 26: Marketplace & Monetization
 */

import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "../Button";
import { Card, CardContent, CardHeader, CardTitle } from "../Card";
import { Badge } from "../Badge";
import { Select, SelectOption } from "../Select";
import {
  CreatorDashboardProps,
  CreatorAnalytics,
  CreatorEarnings,
  Payout,
} from "./types";
import {
  formatPrice,
  formatCompactNumber,
  formatRelativeDate,
  calculateRevenueSplit,
} from "./utils";

// ============================================
// Stat Card Component
// ============================================

function StatCard({
  title,
  value,
  subValue,
  change,
  icon,
}: {
  title: string;
  value: string;
  subValue?: string;
  change?: number;
  icon: string;
}) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subValue && (
              <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
            )}
            {change !== undefined && (
              <p className={cn(
                "text-sm mt-2 flex items-center gap-1",
                isPositive && "text-green-500",
                isNegative && "text-red-500",
                !isPositive && !isNegative && "text-muted-foreground"
              )}>
                {isPositive && '↑'}
                {isNegative && '↓'}
                {Math.abs(change)}%
                <span className="text-muted-foreground">vs last period</span>
              </p>
            )}
          </div>
          <div className="text-3xl">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Revenue Chart (Simplified)
// ============================================

function RevenueChart({
  timeSeries,
}: {
  timeSeries: import('./types').TimeSeriesPoint[];
}) {
  if (timeSeries.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  const maxRevenue = Math.max(...timeSeries.map(t => t.revenueCents), 1);

  return (
    <div className="h-48 flex items-end gap-1">
      {timeSeries.map((point, i) => (
        <div
          key={i}
          className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t relative group"
          style={{ height: `${(point.revenueCents / maxRevenue) * 100}%`, minHeight: '4px' }}
        >
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
            <div className="bg-popover text-popover-foreground text-xs p-2 rounded shadow-lg whitespace-nowrap">
              <p className="font-medium">{formatPrice(point.revenueCents)}</p>
              <p className="text-muted-foreground">{point.salesCount} sales</p>
              <p className="text-muted-foreground">{point.date}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Top Products Table
// ============================================

function TopProductsTable({
  listings,
  onView,
}: {
  listings: import('./types').TopListing[];
  onView?: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium">Product</th>
            <th className="text-right py-3 px-4 font-medium">Sales</th>
            <th className="text-right py-3 px-4 font-medium">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((listing, i) => (
            <tr
              key={listing.listingId}
              className="border-b border-border hover:bg-muted/50 cursor-pointer"
              onClick={() => onView?.(listing.listingId)}
            >
              <td className="py-3 px-4">
                <span className="text-muted-foreground mr-2">#{i + 1}</span>
                {listing.title}
              </td>
              <td className="text-right py-3 px-4">
                {formatCompactNumber(listing.salesCount)}
              </td>
              <td className="text-right py-3 px-4 font-medium">
                {formatPrice(listing.revenueCents)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// Payout Status Card
// ============================================

function PayoutStatusCard({
  availableBalance,
  pendingBalance,
  nextPayout,
  onRequestPayout,
  payoutEnabled,
}: {
  availableBalance: number;
  pendingBalance: number;
  nextPayout?: { amount: number; date: string };
  onRequestPayout?: () => void;
  payoutEnabled?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💳 Payout Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold text-green-500">
              {formatPrice(availableBalance)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">
              {formatPrice(pendingBalance)}
            </p>
            <p className="text-xs text-muted-foreground">Clearing soon</p>
          </div>
        </div>

        {nextPayout && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm">
              <span className="text-muted-foreground">Next Payout:</span>{' '}
              <span className="font-medium">{nextPayout.date}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Estimated:</span>{' '}
              <span className="font-medium text-green-500">
                {formatPrice(nextPayout.amount)}
              </span>
            </p>
          </div>
        )}

        {!payoutEnabled ? (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-500">
              ⚠️ Set up Stripe Connect to receive payouts
            </p>
            <Button variant="secondary" size="sm" className="mt-2">
              Connect Stripe
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            className="w-full"
            onClick={onRequestPayout}
            disabled={availableBalance < 1000} // $10 minimum
          >
            Request Payout
          </Button>
        )}

        {availableBalance < 1000 && availableBalance > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Minimum payout: $10.00
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Payout History
// ============================================

function PayoutHistory({
  payouts,
}: {
  payouts: Payout[];
}) {
  if (payouts.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No payouts yet
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {payouts.map((payout) => (
        <div
          key={payout.id}
          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
        >
          <div>
            <p className="font-medium">{formatPrice(payout.amountCents)}</p>
            <p className="text-xs text-muted-foreground">
              {payout.periodStart} - {payout.periodEnd}
            </p>
          </div>
          <Badge
            variant={payout.status === 'paid' ? 'default' : 'secondary'}
            className={cn(
              payout.status === 'paid' && 'bg-green-500',
              payout.status === 'processing' && 'bg-yellow-500',
              payout.status === 'failed' && 'bg-red-500'
            )}
          >
            {payout.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function CreatorDashboard({
  storefront,
  analytics,
  earnings,
  payouts,
  period = 'month',
  onPeriodChange,
  onRequestPayout,
  onViewListing,
  onCreateListing,
  onCreateBundle,
  onRunSale,
  payoutEnabled = false,
  availableBalance = 0,
  pendingBalance = 0,
  className,
}: CreatorDashboardProps) {
  const periodLabels: Record<string, string> = {
    day: 'Today',
    week: 'This Week',
    month: 'This Month',
    year: 'This Year',
    all: 'All Time',
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Creator Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {storefront.displayName}
            {storefront.verified && ' ✓'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={period}
            onChange={(val) => onPeriodChange?.(val as typeof period)}
            className="w-40"
          >
            <SelectOption value="day">Today</SelectOption>
            <SelectOption value="week">This Week</SelectOption>
            <SelectOption value="month">This Month</SelectOption>
            <SelectOption value="year">This Year</SelectOption>
            <SelectOption value="all">All Time</SelectOption>
          </Select>
          <Button variant="ghost" onClick={() => window.open(`/creators/${storefront.slug}`, '_blank')}>
            View Store →
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Revenue"
          value={formatPrice(analytics.summary.totalRevenueCents)}
          icon="💰"
          change={23}
        />
        <StatCard
          title="Sales"
          value={formatCompactNumber(analytics.summary.totalSales)}
          icon="📦"
          change={15}
        />
        <StatCard
          title="Avg Order"
          value={formatPrice(analytics.summary.averageOrderCents)}
          icon="📊"
          change={5}
        />
        <StatCard
          title="Conversion"
          value={`${analytics.summary.conversionRate.toFixed(1)}%`}
          icon="🎯"
          change={0.4}
        />
      </div>

      {/* Revenue Chart & Payout Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart timeSeries={analytics.timeSeries} />
          </CardContent>
        </Card>

        <PayoutStatusCard
          availableBalance={availableBalance}
          pendingBalance={pendingBalance}
          onRequestPayout={onRequestPayout}
          payoutEnabled={payoutEnabled}
          nextPayout={{
            amount: availableBalance,
            date: 'Feb 1, 2025',
          }}
        />
      </div>

      {/* Top Products & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <TopProductsTable
              listings={analytics.topListings}
              onView={onViewListing}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="primary"
              className="w-full justify-start"
              onClick={onCreateListing}
            >
              ➕ New Listing
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={onCreateBundle}
            >
              📦 Create Bundle
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={onRunSale}
            >
              🔥 Run Sale
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              📊 View Full Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <PayoutHistory payouts={payouts} />
        </CardContent>
      </Card>

      {/* Revenue Split Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div>
              <h4 className="font-semibold">Revenue Split</h4>
              <p className="text-sm text-muted-foreground mt-1">
                You keep approximately 77% of each sale. Stripe processing fees (~2.9% + $0.30) 
                and platform fees (20%) are deducted automatically.
              </p>
              <div className="mt-3 text-sm">
                <span className="text-muted-foreground">Example: $10 sale → </span>
                <span className="font-medium text-green-500">
                  {formatPrice(calculateRevenueSplit(1000).creatorEarningsCents)} to you
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreatorDashboard;
