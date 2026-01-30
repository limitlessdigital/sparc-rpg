"use client";


import { cn } from "../lib/utils";
import type { AdventureAnalytics } from "./types";

export interface AnalyticsPanelProps {
  analytics?: AdventureAnalytics;
  isLoading?: boolean;
  className?: string;
}

/**
 * Analytics panel showing adventure statistics
 * Placeholder implementation with mock data support
 */
export function AnalyticsPanel({
  analytics,
  isLoading = false,
  className,
}: AnalyticsPanelProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <label className="block text-sm font-medium text-muted-foreground">
          Analytics
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="p-3 rounded-md bg-surface-elevated animate-pulse"
            >
              <div className="h-4 w-16 bg-surface-divider rounded mb-2" />
              <div className="h-6 w-12 bg-surface-divider rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No data state
  if (!analytics) {
    return (
      <div className={cn("space-y-4", className)}>
        <label className="block text-sm font-medium text-muted-foreground">
          Analytics
        </label>
        <div className="p-6 rounded-md bg-surface-elevated text-center">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-sm text-muted-foreground">
            Analytics will appear here once your adventure is published and has
            been played.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <label className="block text-sm font-medium text-muted-foreground">
        Analytics
      </label>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total Plays"
          value={analytics.totalPlays}
          icon="🎮"
        />
        <StatCard
          label="Unique Players"
          value={analytics.uniquePlayers}
          icon="👥"
        />
        <StatCard
          label="Completions"
          value={analytics.completions}
          icon="🏆"
        />
        <StatCard
          label="Completion Rate"
          value={`${analytics.completionRate}%`}
          icon="📈"
        />
        <StatCard
          label="Avg Play Time"
          value={formatDuration(analytics.averagePlayTime)}
          icon="⏱️"
        />
        <StatCard
          label="Rating"
          value={
            analytics.averageRating
              ? `${analytics.averageRating.toFixed(1)} ⭐`
              : "No ratings"
          }
          subValue={
            analytics.ratingCount > 0
              ? `${analytics.ratingCount} reviews`
              : undefined
          }
          icon="⭐"
        />
      </div>

      {/* Rating Distribution */}
      {analytics.ratingCount > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">
            Rating Distribution
          </span>
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count =
                analytics.ratingDistribution[
                  stars as keyof typeof analytics.ratingDistribution
                ];
              const percentage =
                analytics.ratingCount > 0
                  ? (count / analytics.ratingCount) * 100
                  : 0;
              return (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-4">
                    {stars}⭐
                  </span>
                  <div className="flex-1 h-2 bg-surface-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-bronze rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Plays Chart Placeholder */}
      {analytics.playsByDay && analytics.playsByDay.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">
            Recent Activity
          </span>
          <div className="h-20 bg-surface-elevated rounded-md flex items-end gap-1 p-2">
            {analytics.playsByDay.slice(-14).map((day, i) => {
              const maxPlays = Math.max(
                ...analytics.playsByDay.map((d) => d.plays)
              );
              const height = maxPlays > 0 ? (day.plays / maxPlays) * 100 : 0;
              return (
                <div
                  key={i}
                  className="flex-1 bg-bronze/60 hover:bg-bronze rounded-t transition-colors"
                  style={{ height: `${Math.max(4, height)}%` }}
                  title={`${day.date}: ${day.plays} plays`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted">
            <span>14 days ago</span>
            <span>Today</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat card sub-component
function StatCard({
  label,
  value,
  subValue,
  icon,
}: {
  label: string;
  value: string | number;
  subValue?: string;
  icon: string;
}) {
  return (
    <div className="p-3 rounded-md bg-surface-elevated">
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-lg font-semibold">{value}</div>
      {subValue && (
        <div className="text-xs text-muted-foreground">{subValue}</div>
      )}
    </div>
  );
}

// Helper: Format duration in minutes to human readable
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
