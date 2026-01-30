/**
 * ProfileCard - Display user profile information
 */


import { cn } from '../lib/utils';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { Card, CardContent, CardHeader } from '../Card';
import type { UserProfile, UserBadge, ReputationTier } from './types';
import {
  getReputationColor,
  getReputationIcon,
  getPlayStyleLabel,
  getPlayStyleIcon,
  formatPlayTime,
} from './utils';

// ============================================
// Reputation Badge Component
// ============================================

interface ReputationBadgeProps {
  tier: ReputationTier;
  className?: string;
}

export function ReputationBadge({ tier, className }: ReputationBadgeProps) {
  const labels: Record<ReputationTier, string> = {
    new: 'New Player',
    reliable: 'Reliable',
    trusted: 'Trusted',
    exemplary: 'Exemplary',
  };
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-sm font-medium',
      getReputationColor(tier),
      className
    )}>
      <span>{getReputationIcon(tier)}</span>
      <span>{labels[tier]}</span>
    </span>
  );
}

// ============================================
// Badge Display Component
// ============================================

interface BadgeShowcaseProps {
  badges: UserBadge[];
  maxDisplay?: number;
  className?: string;
}

export function BadgeShowcase({ badges, maxDisplay = 5, className }: BadgeShowcaseProps) {
  const displayBadges = badges.slice(0, maxDisplay);
  const remaining = badges.length - maxDisplay;
  
  if (badges.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No badges earned yet</p>
    );
  }
  
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {displayBadges.map((userBadge) => (
        <div
          key={userBadge.id}
          className="relative group"
          title={userBadge.badge?.description}
        >
          <div className="w-10 h-10 rounded-full bg-surface-elevated border border-surface-divider flex items-center justify-center text-lg">
            {userBadge.badge?.imageUrl ? (
              <img src={userBadge.badge.imageUrl} alt={userBadge.badge.name} className="w-6 h-6" />
            ) : (
              '🏆'
            )}
          </div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-surface-elevated rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {userBadge.badge?.name}
          </div>
        </div>
      ))}
      {remaining > 0 && (
        <div className="w-10 h-10 rounded-full bg-surface-elevated border border-surface-divider flex items-center justify-center text-sm text-muted-foreground">
          +{remaining}
        </div>
      )}
    </div>
  );
}

// ============================================
// Stats Grid Component
// ============================================

interface StatsGridProps {
  profile: UserProfile;
  compact?: boolean;
  className?: string;
}

export function StatsGrid({ profile, compact, className }: StatsGridProps) {
  const stats = [
    { label: 'Sessions', value: profile.sessionsPlayed },
    { label: 'As Seer', value: profile.sessionsRun },
    { label: 'Play Time', value: formatPlayTime(profile.totalPlayTime) },
    { label: 'Adventures', value: profile.adventuresCompleted },
    { label: 'Characters', value: profile.charactersCreated },
    { label: 'Friends', value: profile.friendCount },
  ];
  
  if (compact) {
    return (
      <div className={cn('flex gap-4 text-sm', className)}>
        <span><strong>{profile.sessionsPlayed}</strong> sessions</span>
        <span><strong>{profile.friendCount}</strong> friends</span>
      </div>
    );
  }
  
  return (
    <div className={cn('grid grid-cols-3 gap-4', className)}>
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <div className="text-lg font-bold text-foreground">{stat.value}</div>
          <div className="text-xs text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Play Style Tags Component
// ============================================

interface PlayStyleTagsProps {
  tags: string[];
  className?: string;
}

export function PlayStyleTags({ tags, className }: PlayStyleTagsProps) {
  if (tags.length === 0) return null;
  
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-elevated rounded-full text-xs text-muted-foreground"
        >
          <span>{getPlayStyleIcon(tag as any)}</span>
          <span>{getPlayStyleLabel(tag as any)}</span>
        </span>
      ))}
    </div>
  );
}

// ============================================
// Profile Card Component
// ============================================

export interface ProfileCardProps {
  profile: UserProfile;
  badges?: UserBadge[];
  showStats?: boolean;
  showActions?: boolean;
  isFriend?: boolean;
  isBlocked?: boolean;
  isOwnProfile?: boolean;
  onAddFriend?: () => void;
  onRemoveFriend?: () => void;
  onBlock?: () => void;
  onUnblock?: () => void;
  onReport?: () => void;
  onMessage?: () => void;
  onEdit?: () => void;
  className?: string;
}

export function ProfileCard({
  profile,
  badges = [],
  showStats = true,
  showActions = true,
  isFriend,
  isBlocked,
  isOwnProfile,
  onAddFriend,
  onRemoveFriend,
  onBlock,
  onUnblock,
  onReport,
  onMessage,
  onEdit,
  className,
}: ProfileCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Banner area */}
      <div className="h-20 bg-gradient-to-br from-bronze/20 to-bronze/5" />
      
      <CardHeader className="relative pt-0">
        {/* Avatar overlapping banner */}
        <div className="absolute -top-10 left-4">
          <Avatar
            src={profile.avatarUrl}
            alt={profile.displayName}
            fallback={profile.displayName.charAt(0).toUpperCase()}
            size="lg"
            className="ring-4 ring-surface"
          />
        </div>
        
        {/* Name and reputation */}
        <div className="ml-20 pt-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{profile.displayName}</h3>
            <ReputationBadge tier={profile.reputationTier} />
          </div>
          
          {profile.favoriteClass && (
            <p className="text-sm text-muted-foreground">
              Favorite class: {profile.favoriteClass}
            </p>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-muted-foreground">{profile.bio}</p>
        )}
        
        {/* Play style tags */}
        <PlayStyleTags tags={profile.playStyleTags} />
        
        {/* Badges */}
        {badges.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Badges
            </h4>
            <BadgeShowcase badges={badges} />
          </div>
        )}
        
        {/* Stats */}
        {showStats && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Stats
            </h4>
            <StatsGrid profile={profile} />
          </div>
        )}
        
        {/* Actions */}
        {showActions && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-surface-divider">
            {isOwnProfile ? (
              <Button variant="secondary" size="sm" onClick={onEdit}>
                Edit Profile
              </Button>
            ) : (
              <>
                {!isBlocked && (
                  <>
                    {isFriend ? (
                      <Button variant="ghost" size="sm" onClick={onRemoveFriend}>
                        Remove Friend
                      </Button>
                    ) : (
                      <Button variant="primary" size="sm" onClick={onAddFriend}>
                        Add Friend
                      </Button>
                    )}
                    <Button variant="secondary" size="sm" onClick={onMessage}>
                      Message
                    </Button>
                  </>
                )}
                
                {isBlocked ? (
                  <Button variant="ghost" size="sm" onClick={onUnblock}>
                    Unblock
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={onBlock}>
                    Block
                  </Button>
                )}
                
                <Button variant="ghost" size="sm" onClick={onReport} className="text-error">
                  Report
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Compact Profile Card
// ============================================

export interface CompactProfileCardProps {
  profile: UserProfile;
  onClick?: () => void;
  className?: string;
}

export function CompactProfileCard({ profile, onClick, className }: CompactProfileCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-surface-elevated transition-colors text-left w-full',
        className
      )}
    >
      <Avatar
        src={profile.avatarUrl}
        alt={profile.displayName}
        fallback={profile.displayName.charAt(0).toUpperCase()}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{profile.displayName}</span>
          <ReputationBadge tier={profile.reputationTier} />
        </div>
        <StatsGrid profile={profile} compact className="mt-0.5" />
      </div>
    </button>
  );
}
