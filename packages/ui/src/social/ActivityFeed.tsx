/**
 * ActivityFeed - Display recent social activity
 */


import { cn } from '../lib/utils';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import type { ActivityEvent } from './types';
import { getActivityIcon, getActivityText, formatRelativeTime } from './utils';

// ============================================
// Activity Item Component
// ============================================

interface ActivityItemProps {
  event: ActivityEvent;
  onClick?: (event: ActivityEvent) => void;
}

export function ActivityItem({ event, onClick }: ActivityItemProps) {
  return (
    <button
      onClick={() => onClick?.(event)}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-elevated transition-colors text-left w-full"
    >
      {/* Icon or avatar */}
      <div className="relative flex-shrink-0">
        <Avatar
          src={event.userAvatar}
          alt={event.userName}
          fallback={event.userName.charAt(0).toUpperCase()}
          size="sm"
        />
        <span className="absolute -bottom-1 -right-1 text-sm">
          {getActivityIcon(event.type)}
        </span>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{event.userName}</span>
          {' '}
          <span className="text-muted-foreground">
            {getActivityText(event.type, event.data)}
          </span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatRelativeTime(event.createdAt)}
        </p>
      </div>
    </button>
  );
}

// ============================================
// Activity Card (for badges, achievements)
// ============================================

interface ActivityCardProps {
  event: ActivityEvent;
  onShare?: (event: ActivityEvent) => void;
}

export function ActivityCard({ event, onShare }: ActivityCardProps) {
  // For badge/achievement events, show a richer card
  if (event.type === 'badge_earned' || event.type === 'achievement_unlocked') {
    return (
      <div className="p-4 rounded-lg bg-gradient-to-br from-bronze/20 to-transparent border border-bronze/30">
        <div className="flex items-center gap-3 mb-3">
          <Avatar
            src={event.userAvatar}
            alt={event.userName}
            fallback={event.userName.charAt(0).toUpperCase()}
            size="sm"
          />
          <div>
            <span className="font-medium">{event.userName}</span>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(event.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-surface-elevated flex items-center justify-center text-3xl">
            {event.type === 'badge_earned' ? '🏆' : '🎉'}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {event.type === 'badge_earned' ? 'Earned Badge' : 'Achievement Unlocked'}
            </p>
            <p className="font-semibold text-lg">
              {String(event.data.badgeName || event.data.achievementName || 'Unknown')}
            </p>
          </div>
        </div>
        
        {onShare && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => onShare(event)}
          >
            Share
          </Button>
        )}
      </div>
    );
  }
  
  // Default activity item
  return <ActivityItem event={event} />;
}

// ============================================
// Activity Feed Component
// ============================================

export type ActivityFilter = 'all' | 'friends' | 'groups';

export interface ActivityFeedProps {
  events: ActivityEvent[];
  filter?: ActivityFilter;
  onFilterChange?: (filter: ActivityFilter) => void;
  onActivityClick?: (event: ActivityEvent) => void;
  onShare?: (event: ActivityEvent) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  className?: string;
}

export function ActivityFeed({
  events,
  filter = 'all',
  onFilterChange,
  onActivityClick,
  onShare,
  onLoadMore,
  hasMore,
  loading,
  className,
}: ActivityFeedProps) {
  const filters: { value: ActivityFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'friends', label: 'Friends' },
    { value: 'groups', label: 'Groups' },
  ];
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter tabs */}
      {onFilterChange && (
        <div className="flex gap-2">
          {filters.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onFilterChange(value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                filter === value
                  ? 'bg-bronze/20 text-bronze'
                  : 'text-muted-foreground hover:bg-surface-elevated'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      
      {/* Events list */}
      {events.length > 0 ? (
        <div className="space-y-2">
          {events.map((event) => {
            // Use richer card for achievements/badges
            if (event.type === 'badge_earned' || event.type === 'achievement_unlocked') {
              return (
                <ActivityCard
                  key={event.id}
                  event={event}
                  onShare={onShare}
                />
              );
            }
            
            return (
              <ActivityItem
                key={event.id}
                event={event}
                onClick={onActivityClick}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No recent activity</p>
        </div>
      )}
      
      {/* Load more */}
      {hasMore && (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={onLoadMore}
            loading={loading}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================
// Compact Activity List (for sidebar)
// ============================================

export interface CompactActivityListProps {
  events: ActivityEvent[];
  maxItems?: number;
  onViewAll?: () => void;
  className?: string;
}

export function CompactActivityList({
  events,
  maxItems = 5,
  onViewAll,
  className,
}: CompactActivityListProps) {
  const displayEvents = events.slice(0, maxItems);
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          Recent Activity
        </h3>
        {onViewAll && events.length > maxItems && (
          <button
            onClick={onViewAll}
            className="text-xs text-bronze hover:text-bronze-light"
          >
            View All
          </button>
        )}
      </div>
      
      <div className="space-y-1">
        {displayEvents.length > 0 ? (
          displayEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-2 p-2 text-sm"
            >
              <span>{getActivityIcon(event.type)}</span>
              <span className="flex-1 truncate">
                <span className="font-medium">{event.userName}</span>
                {' '}
                <span className="text-muted-foreground">
                  {getActivityText(event.type, event.data)}
                </span>
              </span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(event.createdAt)}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity
          </p>
        )}
      </div>
    </div>
  );
}
