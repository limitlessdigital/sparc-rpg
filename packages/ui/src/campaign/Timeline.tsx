/**
 * Timeline - Visual campaign story progression
 */

import * as React from 'react';
import { cn } from '../lib/utils';
import { Card, CardContent, CardHeader } from '../Card';
import { Button } from '../Button';
import type {
  CampaignSession,
  StoryArc,
  TimelineProps,
} from './types';
import {
  getSessionStatusIcon,
  getSessionStatusColor,
  getArcStatusLabel,
  getArcStatusColor,
  formatRelativeTime,
  formatScheduledTime,
  formatDuration,
} from './utils';

// ============================================
// Arc Progress Bar
// ============================================

interface ArcProgressBarProps {
  arc: StoryArc;
  onClick?: () => void;
  className?: string;
}

export function ArcProgressBar({ arc, onClick, className }: ArcProgressBarProps) {
  return (
    <div
      className={cn(
        'space-y-2 p-3 rounded-lg bg-surface-elevated border border-surface-divider',
        onClick && 'cursor-pointer hover:border-primary/50 transition-colors',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">{arc.name}</h4>
        <span className={cn('text-xs', getArcStatusColor(arc.status))}>
          {getArcStatusLabel(arc.status)}
        </span>
      </div>
      <div className="relative h-2 bg-surface-divider rounded-full overflow-hidden">
        <div
          className={cn(
            'absolute left-0 top-0 h-full rounded-full transition-all duration-300',
            arc.status === 'completed'
              ? 'bg-green-500'
              : arc.status === 'active'
              ? 'bg-primary'
              : 'bg-blue-500'
          )}
          style={{ width: `${arc.progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{arc.sessions.length} sessions</span>
        <span>{arc.progress}%</span>
      </div>
    </div>
  );
}

// ============================================
// Story Arc Card
// ============================================

interface StoryArcCardProps {
  arc: StoryArc;
  sessions?: CampaignSession[];
  childArcs?: StoryArc[];
  onClick?: () => void;
  onSessionClick?: (sessionId: string) => void;
  expanded?: boolean;
  className?: string;
}

export function StoryArcCard({
  arc,
  sessions = [],
  childArcs = [],
  onClick,
  onSessionClick,
  expanded = false,
  className,
}: StoryArcCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(expanded);

  const arcSessions = sessions.filter((s) => arc.sessions.includes(s.id));

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div
        className={cn(
          'p-4 flex items-center justify-between',
          onClick && 'cursor-pointer hover:bg-surface-elevated/50 transition-colors'
        )}
        onClick={() => {
          setIsExpanded(!isExpanded);
          onClick?.();
        }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {arc.status === 'completed'
                ? '✅'
                : arc.status === 'active'
                ? '📖'
                : '📝'}
            </span>
            <h3 className="font-semibold">{arc.name}</h3>
            <span className={cn('text-xs px-2 py-0.5 rounded', getArcStatusColor(arc.status))}>
              {getArcStatusLabel(arc.status)}
            </span>
          </div>
          {arc.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {arc.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-lg font-bold">{arc.progress}%</div>
            <div className="text-xs text-muted-foreground">
              {arcSessions.length} sessions
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? '▲' : '▼'}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pb-2">
        <div className="relative h-2 bg-surface-divider rounded-full overflow-hidden">
          <div
            className={cn(
              'absolute left-0 top-0 h-full rounded-full transition-all duration-300',
              arc.status === 'completed'
                ? 'bg-green-500'
                : arc.status === 'active'
                ? 'bg-primary'
                : 'bg-blue-500'
            )}
            style={{ width: `${arc.progress}%` }}
          />
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Child Arcs */}
          {childArcs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Sub-Arcs</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {childArcs.map((childArc) => (
                  <ArcProgressBar
                    key={childArc.id}
                    arc={childArc}
                    onClick={() => onClick?.()}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sessions */}
          {arcSessions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Sessions</h4>
              <div className="space-y-1">
                {arcSessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded text-sm',
                      onSessionClick && 'cursor-pointer hover:bg-surface-elevated transition-colors'
                    )}
                    onClick={() => onSessionClick?.(session.id)}
                  >
                    <span>{getSessionStatusIcon(session.status)}</span>
                    <span className="flex-1 truncate">
                      {session.title || `Session ${session.sessionNumber}`}
                    </span>
                    {session.scheduledFor && (
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(session.scheduledFor)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ============================================
// Timeline Session Node
// ============================================

interface TimelineNodeProps {
  session: CampaignSession;
  isFirst?: boolean;
  isLast?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function TimelineNode({
  session,
  isFirst,
  isLast,
  isActive,
  onClick,
  className,
}: TimelineNodeProps) {
  return (
    <div className={cn('relative flex items-start gap-4', className)}>
      {/* Connector Line */}
      <div className="flex flex-col items-center">
        {!isFirst && (
          <div className="w-0.5 h-4 bg-surface-divider" />
        )}
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 border-2 transition-colors',
            session.status === 'completed'
              ? 'bg-green-500/20 border-green-500 text-green-500'
              : session.status === 'in_progress'
              ? 'bg-primary/20 border-primary text-primary animate-pulse'
              : session.status === 'cancelled'
              ? 'bg-red-500/20 border-red-500 text-red-500'
              : 'bg-surface-elevated border-surface-divider',
            isActive && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
          )}
        >
          {getSessionStatusIcon(session.status)}
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 min-h-[2rem] bg-surface-divider" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          'flex-1 pb-6 -mt-1',
          onClick && 'cursor-pointer'
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            #{session.sessionNumber}
          </span>
          {session.arcName && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
              {session.arcName}
            </span>
          )}
        </div>
        <h4 className={cn(
          'font-medium mt-0.5',
          onClick && 'hover:text-primary transition-colors'
        )}>
          {session.title || `Session ${session.sessionNumber}`}
        </h4>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          {session.scheduledFor && (
            <span>📅 {formatScheduledTime(session.scheduledFor)}</span>
          )}
          {session.duration && (
            <span>⏱️ {formatDuration(session.duration)}</span>
          )}
          {session.status === 'completed' && session.attendees.length > 0 && (
            <span>👥 {session.attendees.filter((a) => a.attended).length}</span>
          )}
        </div>
        {session.recap?.cliffhanger && session.status === 'completed' && (
          <p className="text-xs text-muted-foreground mt-2 italic line-clamp-2">
            &ldquo;{session.recap.cliffhanger}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================
// Story Progress Display
// ============================================

interface StoryProgressProps {
  arcs: StoryArc[];
  onArcClick?: (arcId: string) => void;
  className?: string;
}

export function StoryProgress({ arcs, onArcClick, className }: StoryProgressProps) {
  const activeArcs = arcs.filter((a) => a.status === 'active' && !a.parentArcId);
  const upcomingArcs = arcs.filter((a) => a.status === 'upcoming' && !a.parentArcId);

  if (activeArcs.length === 0 && upcomingArcs.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <h3 className="font-semibold">Story Progress</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeArcs.map((arc) => {
          const childArcs = arcs.filter((a) => a.parentArcId === arc.id);
          return (
            <div key={arc.id} className="space-y-2">
              <ArcProgressBar arc={arc} onClick={() => onArcClick?.(arc.id)} />
              {childArcs.length > 0 && (
                <div className="pl-4 space-y-2">
                  {childArcs.map((child) => (
                    <ArcProgressBar
                      key={child.id}
                      arc={child}
                      onClick={() => onArcClick?.(child.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ============================================
// Campaign Timeline Component
// ============================================

export function CampaignTimeline({
  sessions,
  arcs,
  onSessionClick,
  onArcClick,
}: TimelineProps) {
  const [viewMode, setViewMode] = React.useState<'timeline' | 'arcs'>('timeline');

  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.sessionNumber !== b.sessionNumber) {
      return a.sessionNumber - b.sessionNumber;
    }
    if (a.scheduledFor && b.scheduledFor) {
      return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
    }
    return 0;
  });

  const topLevelArcs = arcs.filter((a) => !a.parentArcId).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={viewMode === 'timeline' ? 'default' : 'outline'}
          onClick={() => setViewMode('timeline')}
        >
          📅 Timeline
        </Button>
        <Button
          size="sm"
          variant={viewMode === 'arcs' ? 'default' : 'outline'}
          onClick={() => setViewMode('arcs')}
        >
          📖 Story Arcs
        </Button>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="pl-2">
          {sortedSessions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No sessions yet. Schedule your first session to begin the story!
            </p>
          ) : (
            sortedSessions.map((session, index) => (
              <TimelineNode
                key={session.id}
                session={session}
                isFirst={index === 0}
                isLast={index === sortedSessions.length - 1}
                isActive={session.status === 'in_progress'}
                onClick={() => onSessionClick?.(session.id)}
              />
            ))
          )}
        </div>
      )}

      {/* Arcs View */}
      {viewMode === 'arcs' && (
        <div className="space-y-4">
          {topLevelArcs.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No story arcs defined. Create arcs to organize your campaign narrative!
            </p>
          ) : (
            topLevelArcs.map((arc) => {
              const childArcs = arcs.filter((a) => a.parentArcId === arc.id);
              return (
                <StoryArcCard
                  key={arc.id}
                  arc={arc}
                  sessions={sessions}
                  childArcs={childArcs}
                  onClick={() => onArcClick?.(arc.id)}
                  onSessionClick={onSessionClick}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
