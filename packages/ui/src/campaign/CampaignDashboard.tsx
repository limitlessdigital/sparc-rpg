/**
 * CampaignDashboard - Main campaign management hub
 */

import * as React from 'react';
import { cn } from '../lib/utils';
import { Card, CardContent, CardHeader } from '../Card';
import { Button } from '../Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../Tabs';
import { Avatar } from '../Avatar';
import type {
  Campaign,
  CampaignSession,
  CampaignMember,
  StoryArc,
  WikiPage,
  CampaignNote,
  CampaignActivity,
  CampaignRole,
  RsvpStatus,
  CampaignDashboardTab,
} from './types';
import {
  getCampaignStatusIcon,
  getCampaignStatusLabel,
  getCampaignRoleIcon,
  getCampaignRoleLabel,
  formatRelativeTime,
  getNextSession,
} from './utils';
import { CampaignStats, NextSessionWidget } from './CampaignCard';
import { SessionList } from './SessionCard';
import { CampaignTimeline, StoryProgress } from './Timeline';
import { WikiBrowser } from './WikiBrowser';

// ============================================
// Campaign Header
// ============================================

interface CampaignHeaderProps {
  campaign: Campaign;
  userRole?: CampaignRole;
  onInvite?: () => void;
  onSettings?: () => void;
  className?: string;
}

export function CampaignHeader({
  campaign,
  userRole,
  onInvite,
  onSettings,
  className,
}: CampaignHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Banner */}
      <div
        className={cn(
          'h-48 rounded-lg overflow-hidden relative',
          campaign.bannerUrl
            ? 'bg-surface-elevated'
            : 'bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20'
        )}
      >
        {campaign.bannerUrl && (
          <img
            src={campaign.bannerUrl}
            alt={campaign.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                {campaign.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/80">
                  {getCampaignStatusIcon(campaign.status)} {getCampaignStatusLabel(campaign.status)}
                </span>
                {userRole && (
                  <span className="text-white/80">
                    • {getCampaignRoleIcon(userRole)} {getCampaignRoleLabel(userRole)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {onInvite && (
                <Button onClick={onInvite} size="sm">
                  Invite Players
                </Button>
              )}
              {onSettings && (userRole === 'owner' || userRole === 'co_seer') && (
                <Button onClick={onSettings} variant="outline" size="sm">
                  ⚙️ Settings
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <CampaignStats campaign={campaign} />

      {/* Description */}
      {campaign.description && (
        <p className="text-muted-foreground">{campaign.description}</p>
      )}
    </div>
  );
}

// ============================================
// Members List
// ============================================

interface MembersListProps {
  members: CampaignMember[];
  currentUserId?: string;
  onViewProfile?: (userId: string) => void;
  onRemoveMember?: (memberId: string) => void;
  onChangeRole?: (memberId: string, role: CampaignRole) => void;
  canManage?: boolean;
  className?: string;
}

export function MembersList({
  members,
  currentUserId,
  onViewProfile,
  onRemoveMember,
  onChangeRole,
  canManage,
  className,
}: MembersListProps) {
  // Sort: owner first, then co-seers, then players
  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { owner: 0, co_seer: 1, player: 2, spectator: 3 };
    return roleOrder[a.role] - roleOrder[b.role];
  });

  return (
    <div className={cn('space-y-3', className)}>
      {sortedMembers.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated border border-surface-divider"
        >
          <div className="flex items-center gap-3">
            <Avatar
              src={member.userAvatar}
              alt={member.userName || 'Member'}
              size="md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{member.userName || 'Player'}</span>
                <span className="text-sm text-muted-foreground">
                  {getCampaignRoleIcon(member.role)}
                </span>
                {member.userId === currentUserId && (
                  <span className="text-xs text-primary">(You)</span>
                )}
              </div>
              {member.characterName && (
                <p className="text-sm text-muted-foreground">
                  Playing: {member.characterName}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onViewProfile && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onViewProfile(member.userId)}
              >
                View Profile
              </Button>
            )}
            {canManage && member.role !== 'owner' && member.userId !== currentUserId && (
              <>
                {onChangeRole && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      onChangeRole(
                        member.id,
                        member.role === 'co_seer' ? 'player' : 'co_seer'
                      )
                    }
                  >
                    {member.role === 'co_seer' ? 'Demote' : 'Promote'}
                  </Button>
                )}
                {onRemoveMember && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onRemoveMember(member.id)}
                  >
                    Remove
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Recent Activity
// ============================================

interface RecentActivityProps {
  activities: CampaignActivity[];
  limit?: number;
  onViewAll?: () => void;
  className?: string;
}

export function RecentActivity({
  activities,
  limit = 5,
  onViewAll,
  className,
}: RecentActivityProps) {
  const displayActivities = activities.slice(0, limit);

  const getActivityIcon = (type: CampaignActivity['type']): string => {
    const icons: Record<CampaignActivity['type'], string> = {
      session_completed: '✅',
      session_scheduled: '📅',
      member_joined: '👋',
      member_left: '👤',
      wiki_updated: '📝',
      character_updated: '⚔️',
      arc_completed: '🏆',
      recap_published: '📖',
    };
    return icons[type];
  };

  const getActivityText = (activity: CampaignActivity): string => {
    const { type, userName, data } = activity;
    switch (type) {
      case 'session_completed':
        return `Session ${data.sessionNumber || ''} completed`;
      case 'session_scheduled':
        return `${userName || 'Someone'} scheduled a new session`;
      case 'member_joined':
        return `${userName || 'Someone'} joined the campaign`;
      case 'member_left':
        return `${userName || 'Someone'} left the campaign`;
      case 'wiki_updated':
        return `${userName || 'Someone'} updated "${data.pageTitle || 'a page'}"`;
      case 'character_updated':
        return `${userName || 'Someone'} updated their character`;
      case 'arc_completed':
        return `Story arc "${data.arcName || ''}" completed!`;
      case 'recap_published':
        return `Session ${data.sessionNumber || ''} recap published`;
      default:
        return 'Activity';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Recent Activity</h3>
          {onViewAll && activities.length > limit && (
            <Button size="sm" variant="ghost" onClick={onViewAll}>
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {displayActivities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity
          </p>
        ) : (
          <div className="space-y-3">
            {displayActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <span className="text-lg">{getActivityIcon(activity.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{getActivityText(activity)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Notes List
// ============================================

interface NotesListProps {
  notes: CampaignNote[];
  onNoteSelect?: (noteId: string) => void;
  onCreateNote?: () => void;
  loading?: boolean;
  className?: string;
}

export function NotesList({
  notes,
  onNoteSelect,
  onCreateNote,
  loading,
  className,
}: NotesListProps) {
  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-3 rounded-lg bg-surface-elevated animate-pulse"
          >
            <div className="h-5 bg-surface-divider rounded w-1/3 mb-2" />
            <div className="h-4 bg-surface-divider rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {onCreateNote && (
        <Button onClick={onCreateNote} className="w-full">
          + New Note
        </Button>
      )}

      {notes.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No notes yet. Create your first note to keep track of your campaign!
        </p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className={cn(
                'p-3 rounded-lg bg-surface-elevated border border-surface-divider',
                onNoteSelect && 'cursor-pointer hover:border-primary/50 transition-colors'
              )}
              onClick={() => onNoteSelect?.(note.id)}
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-sm">
                  {note.title || 'Untitled Note'}
                </h4>
                {note.sessionNumber && (
                  <span className="text-xs text-muted-foreground">
                    Session #{note.sessionNumber}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {note.content}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {formatRelativeTime(note.updatedAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Campaign Dashboard Props
// ============================================

export interface CampaignDashboardProps {
  campaign: Campaign;
  sessions: CampaignSession[];
  members: CampaignMember[];
  arcs: StoryArc[];
  wikiPages: WikiPage[];
  notes: CampaignNote[];
  activities: CampaignActivity[];
  currentUserId?: string;
  userRole?: CampaignRole;
  loading?: boolean;

  // Actions
  onInvitePlayers?: () => void;
  onCampaignSettings?: () => void;
  onScheduleSession?: () => void;
  onSessionClick?: (sessionId: string) => void;
  onSessionRsvp?: (sessionId: string, status: RsvpStatus) => void;
  onStartSession?: (sessionId: string) => void;
  onCancelSession?: (sessionId: string) => void;
  onArcClick?: (arcId: string) => void;
  onCreateArc?: () => void;
  onWikiPageSelect?: (pageId: string) => void;
  onCreateWikiPage?: () => void;
  onNoteSelect?: (noteId: string) => void;
  onCreateNote?: () => void;
  onViewMemberProfile?: (userId: string) => void;
  onRemoveMember?: (memberId: string) => void;
  onChangeMemberRole?: (memberId: string, role: CampaignRole) => void;
}

// ============================================
// Campaign Dashboard Component
// ============================================

export function CampaignDashboard({
  campaign,
  sessions,
  members,
  arcs,
  wikiPages,
  notes,
  activities,
  currentUserId,
  userRole,
  loading,
  onInvitePlayers,
  onCampaignSettings,
  onScheduleSession,
  onSessionClick,
  onSessionRsvp,
  onStartSession,
  onCancelSession,
  onArcClick,
  onCreateArc,
  onWikiPageSelect,
  onCreateWikiPage,
  onNoteSelect,
  onCreateNote,
  onViewMemberProfile,
  onRemoveMember,
  onChangeMemberRole,
}: CampaignDashboardProps) {
  const canManage = userRole === 'owner' || userRole === 'co_seer';
  const canEditWiki = userRole !== 'spectator';

  const nextSession = getNextSession(sessions) as any;
  const upcomingSessions = sessions
    .filter((s) => s.status === 'scheduled')
    .sort((a, b) => {
      if (!a.scheduledFor || !b.scheduledFor) return 0;
      return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
    });
  const pastSessions = sessions
    .filter((s) => s.status === 'completed')
    .sort((a, b) => b.sessionNumber - a.sessionNumber);

  const tabs: CampaignDashboardTab[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'sessions', label: 'Sessions', count: sessions.length },
    { id: 'timeline', label: 'Timeline' },
    { id: 'wiki', label: 'Wiki', count: wikiPages.length },
    { id: 'players', label: 'Players', count: members.length },
    ...(canManage ? [{ id: 'settings' as const, label: 'Settings' }] : []),
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-surface-elevated rounded-lg" />
        <div className="h-24 bg-surface-elevated rounded-lg" />
        <div className="h-64 bg-surface-elevated rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <CampaignHeader
        campaign={campaign}
        userRole={userRole}
        onInvite={onInvitePlayers}
        onSettings={onCampaignSettings}
      />

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1 text-xs text-muted-foreground">({tab.count})</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Next Session */}
              {nextSession && (
                <NextSessionWidget
                  session={nextSession}
                  onViewDetails={() => onSessionClick?.(nextSession.id)}
                  onRsvp={(status) => onSessionRsvp?.(nextSession.id, status)}
                  onStart={() => onStartSession?.(nextSession.id)}
                  canStart={canManage}
                />
              )}

              {/* Story Progress */}
              {arcs.length > 0 && (
                <StoryProgress arcs={arcs} onArcClick={onArcClick} />
              )}

              {/* Quick Actions */}
              {canManage && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={onScheduleSession}>
                        📅 Schedule Session
                      </Button>
                      <Button variant="outline" onClick={onCreateArc}>
                        📖 Create Story Arc
                      </Button>
                      <Button variant="outline" onClick={onCreateWikiPage}>
                        📝 Add Wiki Page
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <RecentActivity activities={activities} />

              {/* My Notes */}
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="font-semibold">My Notes</h3>
                </CardHeader>
                <CardContent>
                  <NotesList
                    notes={notes.slice(0, 3)}
                    onNoteSelect={onNoteSelect}
                    onCreateNote={onCreateNote}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          {canManage && (
            <Button onClick={onScheduleSession}>
              + Schedule Session
            </Button>
          )}

          {upcomingSessions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Upcoming Sessions</h3>
              <SessionList
                sessions={upcomingSessions}
                onSessionClick={onSessionClick}
                onRsvp={onSessionRsvp}
                onStart={canManage ? onStartSession : undefined}
                onCancel={canManage ? onCancelSession : undefined}
              />
            </div>
          )}

          {pastSessions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Past Sessions</h3>
              <SessionList
                sessions={pastSessions}
                onSessionClick={onSessionClick}
              />
            </div>
          )}

          {sessions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No sessions yet. Schedule your first session to begin!</p>
            </div>
          )}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          {canManage && (
            <div className="mb-6">
              <Button onClick={onCreateArc}>+ Create Story Arc</Button>
            </div>
          )}
          <CampaignTimeline
            sessions={sessions}
            arcs={arcs}
            onSessionClick={onSessionClick}
            onArcClick={onArcClick}
          />
        </TabsContent>

        {/* Wiki Tab */}
        <TabsContent value="wiki">
          <WikiBrowser
            pages={wikiPages}
            onPageSelect={onWikiPageSelect}
            onCreatePage={canEditWiki ? onCreateWikiPage : undefined}
            canEdit={canEditWiki}
          />
        </TabsContent>

        {/* Players Tab */}
        <TabsContent value="players">
          <MembersList
            members={members}
            currentUserId={currentUserId}
            onViewProfile={onViewMemberProfile}
            onRemoveMember={canManage ? onRemoveMember : undefined}
            onChangeRole={canManage ? onChangeMemberRole : undefined}
            canManage={canManage}
          />
        </TabsContent>

        {/* Settings Tab (Seer only) */}
        {canManage && (
          <TabsContent value="settings">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  Campaign settings will be implemented here. For now, use the Settings button in the header.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
