/**
 * FriendsList - Display and manage friends
 */

import * as React from 'react';
import { cn } from '../lib/utils';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { Input } from '../Input';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../Modal';
import type { Friend, FriendRequest, OnlineStatus } from './types';
import { getOnlineStatusColor, getOnlineStatusText, formatRelativeTime } from './utils';

// ============================================
// Online Status Indicator
// ============================================

interface OnlineStatusIndicatorProps {
  status: OnlineStatus;
  className?: string;
}

export function OnlineStatusIndicator({ status, className }: OnlineStatusIndicatorProps) {
  return (
    <span
      className={cn(
        'w-3 h-3 rounded-full border-2 border-surface',
        getOnlineStatusColor(status),
        className
      )}
      title={getOnlineStatusText(status)}
    />
  );
}

// ============================================
// Friend Card Component
// ============================================

interface FriendCardProps {
  friend: Friend;
  onInvite?: (friendId: string) => void;
  onRemove?: (friendId: string) => void;
  onMessage?: (friendId: string) => void;
  onViewProfile?: (friendId: string) => void;
  compact?: boolean;
}

export function FriendCard({
  friend,
  onInvite,
  onRemove,
  onMessage,
  onViewProfile,
  compact,
}: FriendCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-surface-elevated transition-colors',
      compact && 'p-2'
    )}>
      {/* Avatar with status */}
      <div className="relative">
        <Avatar
          src={friend.avatarUrl}
          alt={friend.displayName}
          fallback={friend.displayName.charAt(0).toUpperCase()}
          size={compact ? 'sm' : 'md'}
        />
        <OnlineStatusIndicator
          status={friend.onlineStatus}
          className="absolute -bottom-0.5 -right-0.5"
        />
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <button
          onClick={() => onViewProfile?.(friend.friendId)}
          className="font-medium truncate hover:text-bronze transition-colors text-left"
        >
          {friend.displayName}
        </button>
        <p className="text-xs text-muted-foreground truncate">
          {friend.onlineStatus === 'offline'
            ? `Last seen ${formatRelativeTime(friend.lastSeenAt)}`
            : friend.currentActivity || getOnlineStatusText(friend.onlineStatus)}
        </p>
      </div>
      
      {/* Actions */}
      {!compact && (
        <div className="flex items-center gap-1">
          {friend.onlineStatus !== 'offline' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onInvite?.(friend.friendId)}
            >
              Invite
            </Button>
          )}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
            >
              ⋮
            </Button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-40 bg-surface-elevated rounded-lg shadow-lg border border-surface-divider z-20">
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-surface transition-colors"
                    onClick={() => {
                      onMessage?.(friend.friendId);
                      setShowMenu(false);
                    }}
                  >
                    Message
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-surface transition-colors"
                    onClick={() => {
                      onViewProfile?.(friend.friendId);
                      setShowMenu(false);
                    }}
                  >
                    View Profile
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm text-error hover:bg-surface transition-colors"
                    onClick={() => {
                      onRemove?.(friend.friendId);
                      setShowMenu(false);
                    }}
                  >
                    Remove Friend
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Friend Request Card
// ============================================

interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
  onBlock?: (senderId: string) => void;
}

export function FriendRequestCard({
  request,
  onAccept,
  onDecline,
  onBlock,
}: FriendRequestCardProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-surface">
      <Avatar
        src={request.senderAvatar}
        alt={request.senderName}
        fallback={request.senderName.charAt(0).toUpperCase()}
        size="md"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{request.senderName}</span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(request.createdAt)}
          </span>
        </div>
        
        {request.message && (
          <p className="text-sm text-muted-foreground mt-1">
            "{request.message}"
          </p>
        )}
        
        <div className="flex gap-2 mt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onAccept?.(request.id)}
          >
            Accept
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDecline?.(request.id)}
          >
            Decline
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBlock?.(request.senderId)}
            className="text-error"
          >
            Block
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Friends List Component
// ============================================

export interface FriendsListProps {
  friends: Friend[];
  pendingRequests?: FriendRequest[];
  onSearch?: (query: string) => void;
  onInvite?: (friendId: string) => void;
  onRemove?: (friendId: string) => void;
  onMessage?: (friendId: string) => void;
  onViewProfile?: (friendId: string) => void;
  onAcceptRequest?: (requestId: string) => void;
  onDeclineRequest?: (requestId: string) => void;
  onBlockUser?: (userId: string) => void;
  onAddFriend?: () => void;
  className?: string;
}

export function FriendsList({
  friends,
  pendingRequests = [],
  onSearch,
  onInvite,
  onRemove,
  onMessage,
  onViewProfile,
  onAcceptRequest,
  onDeclineRequest,
  onBlockUser,
  onAddFriend,
  className,
}: FriendsListProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'activity' | 'name' | 'date'>('activity');
  
  // Filter friends by search
  const filteredFriends = React.useMemo(() => {
    let result = friends;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((f) =>
        f.displayName.toLowerCase().includes(query)
      );
    }
    
    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.displayName.localeCompare(b.displayName);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'activity':
        default:
          // Online first, then by last seen
          if (a.onlineStatus !== 'offline' && b.onlineStatus === 'offline') return -1;
          if (a.onlineStatus === 'offline' && b.onlineStatus !== 'offline') return 1;
          return new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime();
      }
    });
    
    return result;
  }, [friends, searchQuery, sortBy]);
  
  // Separate online and offline
  const onlineFriends = filteredFriends.filter((f) => f.onlineStatus !== 'offline');
  const offlineFriends = filteredFriends.filter((f) => f.onlineStatus === 'offline');
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search friends..."
          value={searchQuery}
          onChange={handleSearch}
          className="flex-1"
        />
        <Button variant="primary" onClick={onAddFriend}>
          Add Friend
        </Button>
      </div>
      
      {/* Sort options */}
      <div className="flex gap-2 text-sm">
        <span className="text-muted-foreground">Sort by:</span>
        {(['activity', 'name', 'date'] as const).map((option) => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            className={cn(
              'px-2 py-0.5 rounded transition-colors',
              sortBy === option
                ? 'bg-bronze/20 text-bronze'
                : 'hover:bg-surface-elevated'
            )}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              Friend Requests
              <span className="px-1.5 py-0.5 bg-bronze text-white text-xs rounded-full">
                {pendingRequests.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingRequests.map((request) => (
              <FriendRequestCard
                key={request.id}
                request={request}
                onAccept={onAcceptRequest}
                onDecline={onDeclineRequest}
                onBlock={onBlockUser}
              />
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Online friends */}
      {onlineFriends.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Online ({onlineFriends.length})
          </h3>
          <div className="space-y-1">
            {onlineFriends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onInvite={onInvite}
                onRemove={onRemove}
                onMessage={onMessage}
                onViewProfile={onViewProfile}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Offline friends */}
      {offlineFriends.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Offline ({offlineFriends.length})
          </h3>
          <div className="space-y-1">
            {offlineFriends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onRemove={onRemove}
                onMessage={onMessage}
                onViewProfile={onViewProfile}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {filteredFriends.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? 'No friends match your search'
              : "You haven't added any friends yet"}
          </p>
          {!searchQuery && (
            <Button variant="primary" onClick={onAddFriend}>
              Find Friends
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Add Friend Modal
// ============================================

export interface AddFriendModalProps {
  open: boolean;
  onClose: () => void;
  onSendRequest: (userId: string, message?: string) => void;
  searchResults?: Array<{
    id: string;
    displayName: string;
    avatarUrl?: string;
    mutualFriends?: number;
  }>;
  onSearch: (query: string) => void;
  loading?: boolean;
}

export function AddFriendModal({
  open,
  onClose,
  onSendRequest,
  searchResults = [],
  onSearch,
  loading,
}: AddFriendModalProps) {
  const [query, setQuery] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [selectedUser, setSelectedUser] = React.useState<string | null>(null);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };
  
  const handleSend = () => {
    if (selectedUser) {
      onSendRequest(selectedUser, message || undefined);
      setSelectedUser(null);
      setMessage('');
      onClose();
    }
  };
  
  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Add Friend</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Input
          placeholder="Search by username..."
          value={query}
          onChange={handleSearch}
          className="mb-4"
        />
        
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Searching...
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {searchResults.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user.id)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg w-full text-left transition-colors',
                  selectedUser === user.id
                    ? 'bg-bronze/20 ring-2 ring-bronze'
                    : 'bg-surface hover:bg-surface-elevated'
                )}
              >
                <Avatar
                  src={user.avatarUrl}
                  alt={user.displayName}
                  fallback={user.displayName.charAt(0).toUpperCase()}
                  size="sm"
                />
                <div>
                  <div className="font-medium">{user.displayName}</div>
                  {user.mutualFriends !== undefined && user.mutualFriends > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {user.mutualFriends} mutual friend{user.mutualFriends > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                {selectedUser === user.id && (
                  <span className="ml-auto text-bronze">✓</span>
                )}
              </button>
            ))}
          </div>
        ) : query.length > 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No users found
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Enter a username to search
          </div>
        )}
        
        {selectedUser && (
          <div className="mt-4">
            <Input
              placeholder="Add a message (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {message.length}/200
            </p>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSend}
          disabled={!selectedUser}
        >
          Send Request
        </Button>
      </ModalFooter>
    </Modal>
  );
}
