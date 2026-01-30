/**
 * SocialHub - Main social system container
 */

import * as React from 'react';
import { cn } from '../lib/utils';
import { Tabs, TabList, Tab, TabPanel } from '../Tabs';
import { ActivityFeed, ActivityFilter } from './ActivityFeed';
import { FriendsList, AddFriendModal } from './FriendsList';
import { LfgBrowser, CreateLfgPostModal, LfgResponseModal } from './LfgBrowser';
import { MessagingPanel } from './Messaging';
import type {
  ActivityEvent,
  Friend,
  FriendRequest,
  LfgPost,
  Conversation,
  DirectMessage,
  SocialHubTab,
} from './types';

// ============================================
// Social Hub Component
// ============================================

export interface SocialHubProps {
  // Activity
  activities: ActivityEvent[];
  activityFilter?: ActivityFilter;
  onActivityFilterChange?: (filter: ActivityFilter) => void;
  onActivityClick?: (event: ActivityEvent) => void;
  
  // Friends
  friends: Friend[];
  pendingRequests?: FriendRequest[];
  onInviteFriend?: (friendId: string) => void;
  onRemoveFriend?: (friendId: string) => void;
  onMessageFriend?: (friendId: string) => void;
  onViewProfile?: (userId: string) => void;
  onAcceptRequest?: (requestId: string) => void;
  onDeclineRequest?: (requestId: string) => void;
  onBlockUser?: (userId: string) => void;
  onSearchUsers?: (query: string) => void;
  onSendFriendRequest?: (userId: string, message?: string) => void;
  userSearchResults?: Array<{
    id: string;
    displayName: string;
    avatarUrl?: string;
    mutualFriends?: number;
  }>;
  
  // LFG
  lfgPosts: LfgPost[];
  onRespondToLfg?: (postId: string, message?: string) => void;
  onViewLfgDetails?: (postId: string) => void;
  onCreateLfgPost?: (data: {
    type: 'lfp' | 'lfs';
    adventureId?: string;
    scheduledFor?: string;
    duration: number;
    playersNeeded: number;
    experienceLevel: 'any' | 'newbie' | 'experienced';
    playStyleTags: string[];
    description?: string;
  }) => void;
  availableAdventures?: Array<{ id: string; name: string }>;
  
  // Messaging
  conversations: Conversation[];
  messages: DirectMessage[];
  currentUserId: string;
  activeConversationId?: string;
  onSelectConversation?: (conversationId: string) => void;
  onSendMessage?: (content: string) => void;
  onStartConversation?: () => void;
  
  // UI State
  loading?: boolean;
  activeTab?: SocialHubTab['id'];
  onTabChange?: (tabId: SocialHubTab['id']) => void;
  
  className?: string;
}

export function SocialHub({
  // Activity
  activities,
  activityFilter,
  onActivityFilterChange,
  onActivityClick,
  
  // Friends
  friends,
  pendingRequests = [],
  onInviteFriend,
  onRemoveFriend,
  onMessageFriend,
  onViewProfile,
  onAcceptRequest,
  onDeclineRequest,
  onBlockUser,
  onSearchUsers,
  onSendFriendRequest,
  userSearchResults,
  
  // LFG
  lfgPosts,
  onRespondToLfg,
  onViewLfgDetails,
  onCreateLfgPost,
  availableAdventures,
  
  // Messaging
  conversations,
  messages,
  currentUserId,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  onStartConversation,
  
  // UI State
  loading,
  activeTab: controlledActiveTab,
  onTabChange,
  
  className,
}: SocialHubProps) {
  const [internalActiveTab, setInternalActiveTab] = React.useState<SocialHubTab['id']>('activity');
  const [showAddFriendModal, setShowAddFriendModal] = React.useState(false);
  const [showCreateLfgModal, setShowCreateLfgModal] = React.useState(false);
  const [showLfgResponseModal, setShowLfgResponseModal] = React.useState(false);
  const [selectedLfgPost, setSelectedLfgPost] = React.useState<LfgPost | undefined>();
  
  const activeTab = controlledActiveTab ?? internalActiveTab;
  
  const handleTabChange = (tabId: SocialHubTab['id']) => {
    setInternalActiveTab(tabId);
    onTabChange?.(tabId);
  };
  
  // Calculate counts for tabs
  const unreadMessages = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  
  const tabs: SocialHubTab[] = [
    { id: 'activity', label: 'Activity' },
    { id: 'friends', label: 'Friends', count: pendingRequests.length || undefined },
    { id: 'lfg', label: 'LFG', count: lfgPosts.filter(p => p.status === 'open').length || undefined },
    { id: 'messages', label: 'Messages', count: unreadMessages || undefined },
  ];
  
  // LFG response handling
  const handleLfgRespond = (postId: string) => {
    const post = lfgPosts.find(p => p.id === postId);
    setSelectedLfgPost(post);
    setShowLfgResponseModal(true);
  };
  
  const handleLfgResponseSubmit = (postId: string, message?: string) => {
    onRespondToLfg?.(postId, message);
    setShowLfgResponseModal(false);
    setSelectedLfgPost(undefined);
  };
  
  return (
    <div className={cn('flex flex-col h-full', className)}>
      <Tabs value={activeTab} onChange={(v) => handleTabChange(v as SocialHubTab['id'])}>
        {/* Tab list */}
        <TabList className="px-4 border-b border-surface-divider">
          {tabs.map((tab) => (
            <Tab key={tab.id} value={tab.id} className="relative">
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-bronze text-white text-xs rounded-full">
                  {tab.count}
                </span>
              )}
            </Tab>
          ))}
        </TabList>
        
        {/* Activity tab */}
        <TabPanel value="activity" className="flex-1 overflow-y-auto p-4">
          <ActivityFeed
            events={activities}
            filter={activityFilter}
            onFilterChange={onActivityFilterChange}
            onActivityClick={onActivityClick}
            loading={loading}
          />
        </TabPanel>
        
        {/* Friends tab */}
        <TabPanel value="friends" className="flex-1 overflow-y-auto p-4">
          <FriendsList
            friends={friends}
            pendingRequests={pendingRequests}
            onInvite={onInviteFriend}
            onRemove={onRemoveFriend}
            onMessage={onMessageFriend}
            onViewProfile={onViewProfile}
            onAcceptRequest={onAcceptRequest}
            onDeclineRequest={onDeclineRequest}
            onBlockUser={onBlockUser}
            onAddFriend={() => setShowAddFriendModal(true)}
          />
        </TabPanel>
        
        {/* LFG tab */}
        <TabPanel value="lfg" className="flex-1 overflow-y-auto p-4">
          <LfgBrowser
            posts={lfgPosts}
            onRespond={handleLfgRespond}
            onViewDetails={onViewLfgDetails}
            onCreatePost={() => setShowCreateLfgModal(true)}
            loading={loading}
          />
        </TabPanel>
        
        {/* Messages tab */}
        <TabPanel value="messages" className="flex-1 overflow-hidden">
          <MessagingPanel
            conversations={conversations}
            messages={messages}
            currentUserId={currentUserId}
            activeConversationId={activeConversationId}
            onSelectConversation={onSelectConversation}
            onSendMessage={onSendMessage}
            onStartConversation={onStartConversation}
            loading={loading}
          />
        </TabPanel>
      </Tabs>
      
      {/* Modals */}
      <AddFriendModal
        open={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
        onSendRequest={(userId, message) => {
          onSendFriendRequest?.(userId, message);
          setShowAddFriendModal(false);
        }}
        searchResults={userSearchResults}
        onSearch={onSearchUsers || (() => {})}
        loading={loading}
      />
      
      <CreateLfgPostModal
        open={showCreateLfgModal}
        onClose={() => setShowCreateLfgModal(false)}
        onSubmit={(data) => {
          onCreateLfgPost?.(data);
          setShowCreateLfgModal(false);
        }}
        adventures={availableAdventures}
        loading={loading}
      />
      
      <LfgResponseModal
        open={showLfgResponseModal}
        onClose={() => {
          setShowLfgResponseModal(false);
          setSelectedLfgPost(undefined);
        }}
        post={selectedLfgPost}
        onSubmit={handleLfgResponseSubmit}
        loading={loading}
      />
    </div>
  );
}

// ============================================
// Compact Social Widget (for dashboard sidebar)
// ============================================

export interface SocialWidgetProps {
  onlineFriends: Friend[];
  recentActivity: ActivityEvent[];
  unreadMessages: number;
  pendingRequests: number;
  onViewFriends?: () => void;
  onViewActivity?: () => void;
  onViewMessages?: () => void;
  className?: string;
}

export function SocialWidget({
  onlineFriends,
  recentActivity,
  unreadMessages,
  pendingRequests,
  onViewFriends,
  onViewActivity,
  onViewMessages,
  className,
}: SocialWidgetProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Quick stats */}
      <div className="flex justify-around py-2 bg-surface rounded-lg">
        <button
          onClick={onViewFriends}
          className="text-center hover:text-bronze transition-colors"
        >
          <div className="text-lg font-bold">{onlineFriends.length}</div>
          <div className="text-xs text-muted-foreground">Online</div>
        </button>
        <button
          onClick={onViewMessages}
          className="text-center hover:text-bronze transition-colors relative"
        >
          <div className="text-lg font-bold">{unreadMessages}</div>
          <div className="text-xs text-muted-foreground">Messages</div>
          {unreadMessages > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-bronze rounded-full" />
          )}
        </button>
        <button
          onClick={onViewFriends}
          className="text-center hover:text-bronze transition-colors relative"
        >
          <div className="text-lg font-bold">{pendingRequests}</div>
          <div className="text-xs text-muted-foreground">Requests</div>
          {pendingRequests > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-bronze rounded-full" />
          )}
        </button>
      </div>
      
      {/* Online friends preview */}
      {onlineFriends.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Online Friends
            </h4>
            <button
              onClick={onViewFriends}
              className="text-xs text-bronze hover:text-bronze-light"
            >
              View All
            </button>
          </div>
          <div className="flex -space-x-2">
            {onlineFriends.slice(0, 5).map((friend) => (
              <div
                key={friend.id}
                className="w-8 h-8 rounded-full bg-surface-elevated border-2 border-surface flex items-center justify-center text-xs font-medium"
                title={friend.displayName}
              >
                {friend.avatarUrl ? (
                  <img
                    src={friend.avatarUrl}
                    alt={friend.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  friend.displayName.charAt(0).toUpperCase()
                )}
              </div>
            ))}
            {onlineFriends.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-surface-elevated border-2 border-surface flex items-center justify-center text-xs">
                +{onlineFriends.length - 5}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Recent activity preview */}
      {recentActivity.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Recent Activity
            </h4>
            <button
              onClick={onViewActivity}
              className="text-xs text-bronze hover:text-bronze-light"
            >
              View All
            </button>
          </div>
          <div className="space-y-1 text-sm">
            {recentActivity.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-center gap-2 text-muted-foreground">
                <span className="text-xs">
                  {event.type === 'session_completed' ? '✅' :
                   event.type === 'badge_earned' ? '🏆' :
                   event.type === 'friend_added' ? '🤝' : '•'}
                </span>
                <span className="truncate">
                  <span className="text-foreground">{event.userName}</span>
                  {' '}
                  {event.type === 'session_completed' ? 'completed a session' :
                   event.type === 'badge_earned' ? 'earned a badge' :
                   event.type === 'friend_added' ? 'added a friend' : 'did something'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
