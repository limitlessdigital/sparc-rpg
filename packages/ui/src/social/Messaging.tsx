/**
 * Messaging - Direct messaging components
 */

import * as React from 'react';
import { cn } from '../lib/utils';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { Input } from '../Input';
import type { Conversation, DirectMessage, OnlineStatus } from './types';
import { formatRelativeTime, getOnlineStatusColor } from './utils';

// ============================================
// Message Bubble
// ============================================

interface MessageBubbleProps {
  message: DirectMessage;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={cn('flex gap-2 mb-3', isOwn && 'flex-row-reverse')}>
      {!isOwn && (
        <Avatar
          src={message.senderAvatar}
          alt={message.senderName}
          fallback={message.senderName.charAt(0).toUpperCase()}
          size="sm"
        />
      )}
      <div
        className={cn(
          'max-w-[70%] px-3 py-2 rounded-lg',
          isOwn
            ? 'bg-bronze text-white rounded-br-none'
            : 'bg-surface-elevated rounded-bl-none'
        )}
      >
        <p className="text-sm">{message.content}</p>
        <p className={cn(
          'text-xs mt-1',
          isOwn ? 'text-white/70' : 'text-muted-foreground'
        )}>
          {formatRelativeTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

// ============================================
// Conversation List Item
// ============================================

interface ConversationItemProps {
  conversation: Conversation;
  isActive?: boolean;
  onClick?: () => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors',
        isActive
          ? 'bg-bronze/20'
          : 'hover:bg-surface-elevated'
      )}
    >
      <div className="relative">
        <Avatar
          src={conversation.participantAvatar}
          alt={conversation.participantName}
          fallback={conversation.participantName.charAt(0).toUpperCase()}
          size="md"
        />
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface',
            getOnlineStatusColor(conversation.participantOnlineStatus)
          )}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium truncate">
            {conversation.participantName}
          </span>
          {conversation.lastMessage && (
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>
        {conversation.lastMessage && (
          <p className="text-sm text-muted-foreground truncate">
            {conversation.lastMessage.content}
          </p>
        )}
      </div>
      
      {conversation.unreadCount > 0 && (
        <span className="w-5 h-5 flex items-center justify-center bg-bronze text-white text-xs rounded-full">
          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
        </span>
      )}
    </button>
  );
}

// ============================================
// Message Thread
// ============================================

interface MessageThreadProps {
  messages: DirectMessage[];
  currentUserId: string;
  onSend?: (content: string) => void;
  participant?: {
    id: string;
    name: string;
    avatar?: string;
    onlineStatus: OnlineStatus;
  };
  loading?: boolean;
}

export function MessageThread({
  messages,
  currentUserId,
  onSend,
  participant,
  loading,
}: MessageThreadProps) {
  const [input, setInput] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend?.(input.trim());
      setInput('');
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {participant && (
        <div className="flex items-center gap-3 p-4 border-b border-surface-divider">
          <div className="relative">
            <Avatar
              src={participant.avatar}
              alt={participant.name}
              fallback={participant.name.charAt(0).toUpperCase()}
              size="md"
            />
            <span
              className={cn(
                'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface',
                getOnlineStatusColor(participant.onlineStatus)
              )}
            />
          </div>
          <div>
            <h3 className="font-medium">{participant.name}</h3>
            <p className="text-xs text-muted-foreground">
              {participant.onlineStatus === 'offline' ? 'Offline' : 'Online'}
            </p>
          </div>
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">
            Loading messages...
          </div>
        ) : messages.length > 0 ? (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No messages yet. Say hello!
          </div>
        )}
      </div>
      
      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-surface-divider">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}

// ============================================
// Messaging Panel (Desktop)
// ============================================

export interface MessagingPanelProps {
  conversations: Conversation[];
  messages: DirectMessage[];
  currentUserId: string;
  activeConversationId?: string;
  onSelectConversation?: (conversationId: string) => void;
  onSendMessage?: (content: string) => void;
  onStartConversation?: () => void;
  loading?: boolean;
  className?: string;
}

export function MessagingPanel({
  conversations,
  messages,
  currentUserId,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  onStartConversation,
  loading,
  className,
}: MessagingPanelProps) {
  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );
  
  return (
    <div className={cn('flex h-full', className)}>
      {/* Conversation list */}
      <div className="w-80 border-r border-surface-divider flex flex-col">
        <div className="p-4 border-b border-surface-divider flex items-center justify-between">
          <h2 className="font-semibold">Messages</h2>
          <Button variant="ghost" size="sm" onClick={onStartConversation}>
            ✏️
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === activeConversationId}
                onClick={() => onSelectConversation?.(conversation.id)}
              />
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8 px-4">
              <p className="mb-4">No conversations yet</p>
              <Button variant="primary" size="sm" onClick={onStartConversation}>
                Start a Conversation
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Message thread */}
      <div className="flex-1">
        {activeConversation ? (
          <MessageThread
            messages={messages}
            currentUserId={currentUserId}
            onSend={onSendMessage}
            participant={{
              id: activeConversation.participantId,
              name: activeConversation.participantName,
              avatar: activeConversation.participantAvatar,
              onlineStatus: activeConversation.participantOnlineStatus,
            }}
            loading={loading}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Compact Message List (for notifications)
// ============================================

export interface MessagePreviewListProps {
  conversations: Conversation[];
  onSelect?: (conversationId: string) => void;
  onViewAll?: () => void;
  maxItems?: number;
  className?: string;
}

export function MessagePreviewList({
  conversations,
  onSelect,
  onViewAll,
  maxItems = 5,
  className,
}: MessagePreviewListProps) {
  const unreadConversations = conversations
    .filter((c) => c.unreadCount > 0)
    .slice(0, maxItems);
  
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">
          Messages
          {totalUnread > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-bronze text-white text-xs rounded-full">
              {totalUnread}
            </span>
          )}
        </h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-bronze hover:text-bronze-light"
          >
            View All
          </button>
        )}
      </div>
      
      {unreadConversations.length > 0 ? (
        <div className="space-y-1">
          {unreadConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelect?.(conversation.id)}
              className="flex items-center gap-2 p-2 w-full text-left rounded hover:bg-surface-elevated transition-colors"
            >
              <Avatar
                src={conversation.participantAvatar}
                alt={conversation.participantName}
                fallback={conversation.participantName.charAt(0).toUpperCase()}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">
                  {conversation.participantName}
                </span>
                {conversation.lastMessage && (
                  <p className="text-xs text-muted-foreground truncate">
                    {conversation.lastMessage.content}
                  </p>
                )}
              </div>
              {conversation.unreadCount > 0 && (
                <span className="w-5 h-5 flex items-center justify-center bg-bronze text-white text-xs rounded-full">
                  {conversation.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          No unread messages
        </p>
      )}
    </div>
  );
}
