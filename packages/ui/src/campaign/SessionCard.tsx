/**
 * SessionCard - Display session information and recaps
 */

import * as React from 'react';
import { cn } from '../lib/utils';
import { Card, CardContent, CardHeader } from '../Card';
import { Button } from '../Button';
import { Badge } from '../Badge';
import type {
  CampaignSession,
  SessionRecap,
  SessionAttendee,
  KeyMoment,
  RsvpStatus,
  SessionCardProps,
} from './types';
import {
  getSessionStatusLabel,
  getSessionStatusColor,
  getSessionStatusIcon,
  getRsvpStatusIcon,
  getRsvpStatusColor,
  getKeyMomentTypeIcon,
  formatDuration,
  formatScheduledTime,
  formatRelativeTime,
  getTimeUntil,
  getRsvpSummary,
} from './utils';

// ============================================
// Session Status Badge
// ============================================

interface SessionStatusBadgeProps {
  status: CampaignSession['status'];
  className?: string;
}

export function SessionStatusBadge({ status, className }: SessionStatusBadgeProps) {
  const variants: Record<CampaignSession['status'], 'success' | 'warning' | 'secondary' | 'destructive'> = {
    scheduled: 'secondary',
    in_progress: 'success',
    completed: 'secondary',
    cancelled: 'destructive',
  };

  return (
    <Badge variant={variants[status]} className={className}>
      <span className="mr-1">{getSessionStatusIcon(status)}</span>
      {getSessionStatusLabel(status)}
    </Badge>
  );
}

// ============================================
// RSVP Buttons
// ============================================

interface RsvpButtonsProps {
  currentRsvp?: RsvpStatus;
  onRsvp?: (status: RsvpStatus) => void;
  disabled?: boolean;
  className?: string;
}

export function RsvpButtons({ currentRsvp, onRsvp, disabled, className }: RsvpButtonsProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      <Button
        size="sm"
        variant={currentRsvp === 'yes' ? 'default' : 'outline'}
        onClick={() => onRsvp?.('yes')}
        disabled={disabled}
        className={currentRsvp === 'yes' ? 'bg-green-600 hover:bg-green-700' : ''}
      >
        ✅ Going
      </Button>
      <Button
        size="sm"
        variant={currentRsvp === 'maybe' ? 'default' : 'outline'}
        onClick={() => onRsvp?.('maybe')}
        disabled={disabled}
        className={currentRsvp === 'maybe' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
      >
        ❓ Maybe
      </Button>
      <Button
        size="sm"
        variant={currentRsvp === 'no' ? 'default' : 'outline'}
        onClick={() => onRsvp?.('no')}
        disabled={disabled}
        className={currentRsvp === 'no' ? 'bg-red-600 hover:bg-red-700' : ''}
      >
        ❌ No
      </Button>
    </div>
  );
}

// ============================================
// RSVP Summary
// ============================================

interface RsvpSummaryProps {
  attendees: SessionAttendee[];
  showNames?: boolean;
  className?: string;
}

export function RsvpSummary({ attendees, showNames, className }: RsvpSummaryProps) {
  const summary = getRsvpSummary(attendees);

  if (showNames) {
    const grouped = {
      yes: attendees.filter((a) => a.rsvp === 'yes'),
      maybe: attendees.filter((a) => a.rsvp === 'maybe'),
      no: attendees.filter((a) => a.rsvp === 'no'),
      pending: attendees.filter((a) => a.rsvp === 'pending'),
    };

    return (
      <div className={cn('space-y-2', className)}>
        {grouped.yes.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-green-500">✅</span>
            <span className="text-sm text-muted-foreground">
              {grouped.yes.map((a) => a.memberName || a.characterName || 'Player').join(', ')}
            </span>
          </div>
        )}
        {grouped.maybe.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-yellow-500">❓</span>
            <span className="text-sm text-muted-foreground">
              {grouped.maybe.map((a) => a.memberName || a.characterName || 'Player').join(', ')}
            </span>
          </div>
        )}
        {grouped.no.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-red-500">❌</span>
            <span className="text-sm text-muted-foreground">
              {grouped.no.map((a) => a.memberName || a.characterName || 'Player').join(', ')}
            </span>
          </div>
        )}
        {grouped.pending.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">⏳</span>
            <span className="text-sm text-muted-foreground">
              {grouped.pending.map((a) => a.memberName || a.characterName || 'Player').join(', ')}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3 text-sm', className)}>
      <span className="text-green-500">✅ {summary.yes}</span>
      <span className="text-yellow-500">❓ {summary.maybe}</span>
      <span className="text-red-500">❌ {summary.no}</span>
      {summary.pending > 0 && <span className="text-gray-500">⏳ {summary.pending}</span>}
    </div>
  );
}

// ============================================
// Key Moments Display
// ============================================

interface KeyMomentsProps {
  moments: KeyMoment[];
  className?: string;
}

export function KeyMoments({ moments, className }: KeyMomentsProps) {
  if (moments.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-sm font-medium">Key Moments</h4>
      <ul className="space-y-1">
        {moments.map((moment, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <span>{getKeyMomentTypeIcon(moment.type)}</span>
            <span>
              {moment.characterName && (
                <strong className="text-foreground">{moment.characterName}: </strong>
              )}
              <span className="text-muted-foreground">{moment.description}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// Session Recap Component
// ============================================

interface SessionRecapCardProps {
  recap: SessionRecap;
  session: CampaignSession;
  onEdit?: () => void;
  canEdit?: boolean;
  className?: string;
}

export function SessionRecapCard({
  recap,
  session,
  onEdit,
  canEdit,
  className,
}: SessionRecapCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">Session {session.sessionNumber} Recap</h3>
            {session.title && (
              <p className="text-sm text-muted-foreground">{session.title}</p>
            )}
          </div>
          {canEdit && onEdit && (
            <Button size="sm" variant="ghost" onClick={onEdit}>
              Edit
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {session.endedAt && <span>📅 {formatRelativeTime(session.endedAt)}</span>}
          {session.duration && <span>⏱️ {formatDuration(session.duration)}</span>}
          <span>👥 {session.attendees.filter((a) => a.attended).length} players</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground whitespace-pre-wrap">{recap.summary}</p>
        </div>

        {/* Key Moments */}
        <KeyMoments moments={recap.keyMoments} />

        {/* NPCs Encountered */}
        {recap.npcsEncountered.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-1">NPCs Encountered</h4>
            <div className="flex flex-wrap gap-1">
              {recap.npcsEncountered.map((npc, index) => (
                <Badge key={index} variant="outline">
                  {npc}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Cliffhanger */}
        {recap.cliffhanger && (
          <div className="border-l-4 border-primary/50 pl-4 py-2 bg-primary/5 rounded-r">
            <h4 className="text-sm font-medium mb-1">🎬 Cliffhanger</h4>
            <p className="text-sm text-muted-foreground italic">{recap.cliffhanger}</p>
          </div>
        )}

        {/* Meta */}
        <div className="text-xs text-muted-foreground pt-2 border-t border-surface-divider">
          {recap.editedAt ? (
            <span>
              Edited {formatRelativeTime(recap.editedAt)}
              {recap.editedBy && ` by ${recap.editedBy}`}
            </span>
          ) : (
            <span>Generated {formatRelativeTime(recap.generatedAt)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Session Card Component
// ============================================

export function SessionCard({
  session,
  showCampaign,
  onViewDetails,
  onRsvp,
  onStart,
  onCancel,
}: SessionCardProps) {
  const isUpcoming =
    session.status === 'scheduled' &&
    session.scheduledFor &&
    new Date(session.scheduledFor) > new Date();

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        onViewDetails && 'cursor-pointer hover:border-primary/50'
      )}
      onClick={onViewDetails}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                #{session.sessionNumber}
              </span>
              <SessionStatusBadge status={session.status} />
            </div>
            <h4 className="font-medium mt-1 truncate">
              {session.title || `Session ${session.sessionNumber}`}
            </h4>
            {showCampaign && session.adventureName && (
              <p className="text-sm text-muted-foreground">{session.adventureName}</p>
            )}
          </div>

          {isUpcoming && session.scheduledFor && (
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-bold text-primary">
                {getTimeUntil(session.scheduledFor)}
              </div>
            </div>
          )}
        </div>

        {/* Timing */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {session.scheduledFor && <span>📅 {formatScheduledTime(session.scheduledFor)}</span>}
          {session.duration && <span>⏱️ {formatDuration(session.duration)}</span>}
        </div>

        {/* Arc */}
        {session.arcName && (
          <p className="text-xs text-muted-foreground">
            📖 {session.arcName}
          </p>
        )}

        {/* RSVPs for upcoming sessions */}
        {isUpcoming && session.attendees.length > 0 && (
          <RsvpSummary attendees={session.attendees} />
        )}

        {/* Attendees for completed sessions */}
        {session.status === 'completed' && session.attendees.length > 0 && (
          <p className="text-sm text-muted-foreground">
            👥 {session.attendees.filter((a) => a.attended).length} attended
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
          {isUpcoming && onRsvp && <RsvpButtons onRsvp={onRsvp} />}
          {isUpcoming && onStart && (
            <Button size="sm" onClick={onStart}>
              🎮 Start
            </Button>
          )}
          {isUpcoming && onCancel && (
            <Button size="sm" variant="destructive" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Session List
// ============================================

interface SessionListProps {
  sessions: CampaignSession[];
  loading?: boolean;
  emptyMessage?: string;
  showCampaign?: boolean;
  onSessionClick?: (sessionId: string) => void;
  onRsvp?: (sessionId: string, status: RsvpStatus) => void;
  onStart?: (sessionId: string) => void;
  onCancel?: (sessionId: string) => void;
}

export function SessionList({
  sessions,
  loading,
  emptyMessage = 'No sessions found',
  showCampaign,
  onSessionClick,
  onRsvp,
  onStart,
  onCancel,
}: SessionListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 space-y-3">
              <div className="h-5 bg-surface-elevated rounded w-1/3" />
              <div className="h-4 bg-surface-elevated rounded w-2/3" />
              <div className="h-4 bg-surface-elevated rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          showCampaign={showCampaign}
          onViewDetails={() => onSessionClick?.(session.id)}
          onRsvp={onRsvp ? (status) => onRsvp(session.id, status) : undefined}
          onStart={onStart ? () => onStart(session.id) : undefined}
          onCancel={onCancel ? () => onCancel(session.id) : undefined}
        />
      ))}
    </div>
  );
}
