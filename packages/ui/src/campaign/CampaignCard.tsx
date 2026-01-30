/**
 * CampaignCard - Display campaign information
 */

import * as React from 'react';
import { cn } from '../lib/utils';
import { Card, CardContent, CardHeader } from '../Card';
import { Button } from '../Button';
import { Badge } from '../Badge';
import type {
  Campaign,
  CampaignRole,
  CampaignSession,
  CampaignCardProps,
} from './types';
import {
  getCampaignStatusLabel,
  getCampaignStatusIcon,
  getCampaignPrivacyLabel,
  getCampaignFrequencyLabel,
  getCampaignRoleIcon,
  formatPlayTime,
  formatRelativeTime,
  formatScheduledTime,
  getTimeUntil,
} from './utils';

// ============================================
// Campaign Stats Display
// ============================================

interface CampaignStatsProps {
  campaign: Campaign;
  compact?: boolean;
  className?: string;
}

export function CampaignStats({ campaign, compact, className }: CampaignStatsProps) {
  if (compact) {
    return (
      <div className={cn('flex gap-4 text-sm text-muted-foreground', className)}>
        <span>🎭 {campaign.playerCount} players</span>
        <span>📅 {campaign.sessionCount} sessions</span>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-3 gap-4 text-center', className)}>
      <div>
        <div className="text-lg font-bold text-foreground">{campaign.playerCount}</div>
        <div className="text-xs text-muted-foreground">Players</div>
      </div>
      <div>
        <div className="text-lg font-bold text-foreground">{campaign.sessionCount}</div>
        <div className="text-xs text-muted-foreground">Sessions</div>
      </div>
      <div>
        <div className="text-lg font-bold text-foreground">
          {formatPlayTime(campaign.totalPlayTime)}
        </div>
        <div className="text-xs text-muted-foreground">Played</div>
      </div>
    </div>
  );
}

// ============================================
// Campaign Status Badge
// ============================================

interface CampaignStatusBadgeProps {
  status: Campaign['status'];
  className?: string;
}

export function CampaignStatusBadge({ status, className }: CampaignStatusBadgeProps) {
  return (
    <Badge
      variant={status === 'active' ? 'success' : status === 'paused' ? 'warning' : 'secondary'}
      className={className}
    >
      <span className="mr-1">{getCampaignStatusIcon(status)}</span>
      {getCampaignStatusLabel(status)}
    </Badge>
  );
}

// ============================================
// Campaign Card Component
// ============================================

export function CampaignCard({
  campaign,
  role,
  onClick,
  onManage,
}: CampaignCardProps) {
  return (
    <Card
      className={cn(
        'group transition-all duration-200',
        onClick && 'cursor-pointer hover:border-primary/50'
      )}
      onClick={onClick}
    >
      {/* Banner */}
      {campaign.bannerUrl && (
        <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20 overflow-hidden">
          <img
            src={campaign.bannerUrl}
            alt={campaign.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
              {campaign.name}
            </h3>
            {role && (
              <span className="text-xs text-muted-foreground">
                {getCampaignRoleIcon(role)} {role === 'owner' ? 'Your Campaign' : role}
              </span>
            )}
          </div>
          <CampaignStatusBadge status={campaign.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {campaign.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {campaign.description}
          </p>
        )}

        <CampaignStats campaign={campaign} compact />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{getCampaignFrequencyLabel(campaign.settings.frequency)}</span>
          <span>{getCampaignPrivacyLabel(campaign.privacy)}</span>
        </div>

        {campaign.lastSessionAt && (
          <p className="text-xs text-muted-foreground">
            Last session: {formatRelativeTime(campaign.lastSessionAt)}
          </p>
        )}

        {onManage && role && (role === 'owner' || role === 'co_seer') && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onManage();
            }}
          >
            Manage Campaign
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Compact Campaign Card
// ============================================

interface CompactCampaignCardProps {
  campaign: Campaign;
  role?: CampaignRole;
  nextSession?: CampaignSession;
  onClick?: () => void;
}

export function CompactCampaignCard({
  campaign,
  role,
  nextSession,
  onClick,
}: CompactCampaignCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg bg-surface-elevated border border-surface-divider',
        onClick && 'cursor-pointer hover:border-primary/50 transition-colors'
      )}
      onClick={onClick}
    >
      {/* Avatar/Banner Thumbnail */}
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xl flex-shrink-0">
        {campaign.bannerUrl ? (
          <img
            src={campaign.bannerUrl}
            alt={campaign.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          '🎭'
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium truncate">{campaign.name}</h4>
          {role && (
            <span className="text-xs text-muted-foreground">
              {getCampaignRoleIcon(role)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{campaign.playerCount} players</span>
          <span>{campaign.sessionCount} sessions</span>
        </div>
      </div>

      {/* Next Session */}
      {nextSession?.scheduledFor && (
        <div className="text-right flex-shrink-0">
          <div className="text-xs text-muted-foreground">Next session</div>
          <div className="text-sm font-medium text-primary">
            {getTimeUntil(nextSession.scheduledFor)}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Campaign List
// ============================================

interface CampaignListProps {
  campaigns: Campaign[];
  userRoles?: Record<string, CampaignRole>;
  loading?: boolean;
  emptyMessage?: string;
  onCampaignClick?: (campaignId: string) => void;
  onManageCampaign?: (campaignId: string) => void;
}

export function CampaignList({
  campaigns,
  userRoles,
  loading,
  emptyMessage = 'No campaigns found',
  onCampaignClick,
  onManageCampaign,
}: CampaignListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-32 bg-surface-elevated" />
            <CardContent className="space-y-3 p-4">
              <div className="h-6 bg-surface-elevated rounded w-3/4" />
              <div className="h-4 bg-surface-elevated rounded w-full" />
              <div className="h-4 bg-surface-elevated rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          role={userRoles?.[campaign.id]}
          onClick={() => onCampaignClick?.(campaign.id)}
          onManage={() => onManageCampaign?.(campaign.id)}
        />
      ))}
    </div>
  );
}

// ============================================
// Next Session Widget
// ============================================

interface NextSessionWidgetProps {
  session: CampaignSession;
  campaignName?: string;
  onViewDetails?: () => void;
  onRsvp?: (status: 'yes' | 'no' | 'maybe') => void;
  onStart?: () => void;
  canStart?: boolean;
  className?: string;
}

export function NextSessionWidget({
  session,
  campaignName,
  onViewDetails,
  onRsvp,
  onStart,
  canStart,
  className,
}: NextSessionWidgetProps) {
  if (!session.scheduledFor) return null;

  return (
    <Card className={cn('border-primary/30', className)}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Next Session
            </p>
            <h4 className="font-medium">
              {session.title || `Session ${session.sessionNumber}`}
            </h4>
            {campaignName && (
              <p className="text-sm text-muted-foreground">{campaignName}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-primary">
              {getTimeUntil(session.scheduledFor)}
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          📅 {formatScheduledTime(session.scheduledFor)}
        </p>

        {session.attendees.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500">
              ✅ {session.attendees.filter((a) => a.rsvp === 'yes').length}
            </span>
            <span className="text-yellow-500">
              ❓ {session.attendees.filter((a) => a.rsvp === 'maybe').length}
            </span>
            <span className="text-red-500">
              ❌ {session.attendees.filter((a) => a.rsvp === 'no').length}
            </span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {onRsvp && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRsvp('yes')}
                className="flex-1"
              >
                ✅ Going
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRsvp('maybe')}
                className="flex-1"
              >
                ❓ Maybe
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRsvp('no')}
                className="flex-1"
              >
                ❌ No
              </Button>
            </>
          )}
        </div>

        <div className="flex gap-2">
          {onViewDetails && (
            <Button size="sm" variant="ghost" onClick={onViewDetails} className="flex-1">
              View Details
            </Button>
          )}
          {canStart && onStart && (
            <Button size="sm" onClick={onStart} className="flex-1">
              🎮 Start Session
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
