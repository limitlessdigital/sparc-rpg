"use client";

import * as React from "react";
import {
  SocialHub,
  useToast,
  type ActivityEvent,
  type Friend,
  type FriendRequest,
  type LfgPost,
  type Conversation,
  type DirectMessage,
  type ActivityFilter,
  type SocialHubTab,
} from "@sparc/ui";
import { useAuth } from "@/lib/auth-context";

// ============================================
// Mock Data
// ============================================

const mockActivities: ActivityEvent[] = [
  {
    id: "activity-1",
    userId: "user-2",
    userName: "DragonSlayer",
    userAvatar: undefined,
    type: "badge_earned",
    data: { badgeName: "Master Seer" },
    visibility: "public",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "activity-2",
    userId: "user-3",
    userName: "WizardFan",
    userAvatar: undefined,
    type: "session_completed",
    data: { adventureName: "Crystal Caverns" },
    visibility: "friends",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "activity-3",
    userId: "user-4",
    userName: "Knights of Valor",
    userAvatar: undefined,
    type: "session_scheduled",
    data: { adventureName: "The Dragon's Lair", scheduledFor: "Saturday" },
    visibility: "group",
    groupId: "group-1",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "activity-4",
    userId: "user-5",
    userName: "NewbieHero",
    userAvatar: undefined,
    type: "session_completed",
    data: { adventureName: "First Steps" },
    visibility: "public",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "activity-5",
    userId: "user-6",
    userName: "VeteranPlayer",
    userAvatar: undefined,
    type: "achievement_unlocked",
    data: { achievementName: "100 Sessions Complete" },
    visibility: "public",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockFriends: Friend[] = [
  {
    id: "friend-1",
    friendId: "user-2",
    displayName: "WizardFan",
    avatarUrl: undefined,
    onlineStatus: "in-session",
    currentActivity: "Playing: Crystal Caverns",
    lastSeenAt: new Date().toISOString(),
    mutualFriends: 3,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "friend-2",
    friendId: "user-3",
    displayName: "DragonSlayer",
    avatarUrl: undefined,
    onlineStatus: "online",
    currentActivity: "Browsing Adventures",
    lastSeenAt: new Date().toISOString(),
    mutualFriends: 5,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "friend-3",
    friendId: "user-4",
    displayName: "PaladinPete",
    avatarUrl: undefined,
    onlineStatus: "offline",
    currentActivity: undefined,
    lastSeenAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    mutualFriends: 2,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "friend-4",
    friendId: "user-5",
    displayName: "RogueRunner",
    avatarUrl: undefined,
    onlineStatus: "offline",
    currentActivity: undefined,
    lastSeenAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    mutualFriends: 1,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "friend-5",
    friendId: "user-6",
    displayName: "MysticMage",
    avatarUrl: undefined,
    onlineStatus: "idle",
    currentActivity: undefined,
    lastSeenAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    mutualFriends: 4,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockPendingRequests: FriendRequest[] = [
  {
    id: "req-1",
    senderId: "user-7",
    senderName: "NewPlayer123",
    senderAvatar: undefined,
    receiverId: "user-1",
    message: "Hey! Saw you in my last session, want to be friends?",
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

const mockLfgPosts: LfgPost[] = [
  {
    id: "lfg-1",
    authorId: "user-8",
    authorName: "MasterSeer",
    authorAvatar: undefined,
    authorReputation: "trusted",
    type: "lfp",
    adventureId: "adv-1",
    adventureName: "Crystal Caverns",
    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    duration: 120,
    playersNeeded: 2,
    experienceLevel: "any",
    playStyleTags: ["casual", "newbie-friendly"],
    description: "Need 2 more for a fun beginner-friendly run!",
    responseCount: 3,
    status: "open",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "lfg-2",
    authorId: "user-9",
    authorName: "AdventureParty",
    authorAvatar: undefined,
    authorReputation: "reliable",
    type: "lfs",
    adventureId: undefined,
    adventureName: undefined,
    scheduledFor: undefined,
    duration: 90,
    playersNeeded: 1,
    experienceLevel: "experienced",
    playStyleTags: ["roleplay-focused", "serious"],
    description: "Experienced group looking for a creative Seer!",
    responseCount: 0,
    status: "open",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "lfg-3",
    authorId: "user-10",
    authorName: "WeekendWarrior",
    authorAvatar: undefined,
    authorReputation: "exemplary",
    type: "lfp",
    adventureId: "adv-2",
    adventureName: "The Dragon's Lair",
    scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 180,
    playersNeeded: 4,
    experienceLevel: "experienced",
    playStyleTags: ["combat-focused", "serious"],
    description: "Epic dungeon crawl - experienced players only!",
    responseCount: 1,
    status: "open",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    participantId: "user-2",
    participantName: "WizardFan",
    participantAvatar: undefined,
    participantOnlineStatus: "in-session",
    lastMessage: {
      id: "msg-3",
      senderId: "user-2",
      senderName: "WizardFan",
      senderAvatar: undefined,
      receiverId: "user-1",
      content: "Ready for the session?",
      read: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    unreadCount: 1,
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "conv-2",
    participantId: "user-3",
    participantName: "DragonSlayer",
    participantAvatar: undefined,
    participantOnlineStatus: "online",
    lastMessage: {
      id: "msg-5",
      senderId: "user-1",
      senderName: "You",
      senderAvatar: undefined,
      receiverId: "user-3",
      content: "Thanks for the session yesterday!",
      read: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

const mockMessages: DirectMessage[] = [
  {
    id: "msg-1",
    senderId: "user-2",
    senderName: "WizardFan",
    senderAvatar: undefined,
    receiverId: "user-1",
    content: "Hey, want to play tonight?",
    read: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "msg-2",
    senderId: "user-1",
    senderName: "You",
    senderAvatar: undefined,
    receiverId: "user-2",
    content: "Sure! What adventure?",
    read: true,
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
  {
    id: "msg-3",
    senderId: "user-2",
    senderName: "WizardFan",
    senderAvatar: undefined,
    receiverId: "user-1",
    content: "Ready for the session?",
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

const mockAdventures = [
  { id: "adv-1", name: "Crystal Caverns" },
  { id: "adv-2", name: "The Dragon's Lair" },
  { id: "adv-3", name: "Forest of Shadows" },
  { id: "adv-4", name: "The Haunted Manor" },
];

const mockUserSearchResults = [
  { id: "user-11", displayName: "SearchResult1", avatarUrl: undefined, mutualFriends: 2 },
  { id: "user-12", displayName: "SearchResult2", avatarUrl: undefined, mutualFriends: 0 },
];

// ============================================
// Social Page Component
// ============================================

export default function SocialPage(): JSX.Element | null {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  // State
  const [activities] = React.useState(mockActivities);
  const [activityFilter, setActivityFilter] = React.useState<ActivityFilter>("all");
  const [friends, setFriends] = React.useState(mockFriends);
  const [pendingRequests, setPendingRequests] = React.useState(mockPendingRequests);
  const [lfgPosts, setLfgPosts] = React.useState(mockLfgPosts);
  const [conversations, setConversations] = React.useState(mockConversations);
  const [messages, setMessages] = React.useState(mockMessages);
  const [activeConversationId, setActiveConversationId] = React.useState<string | undefined>();
  const [activeTab, setActiveTab] = React.useState<SocialHubTab["id"]>("activity");
  const [userSearchResults, setUserSearchResults] = React.useState(mockUserSearchResults);
  const [loading] = React.useState(false);
  
  // Current user ID (mock)
  const currentUserId = user?.id || "user-1";
  
  // Handlers
  const handleActivityFilterChange = (filter: ActivityFilter) => {
    setActivityFilter(filter);
    // In real implementation, would filter activities or refetch
  };
  
  const handleActivityClick = (event: ActivityEvent) => {
    // Navigate to relevant page based on activity type
    console.log("Activity clicked:", event);
  };
  
  const handleInviteFriend = (friendId: string) => {
    const friend = friends.find(f => f.friendId === friendId);
    addToast({
      title: "Invite Sent",
      description: `Invited ${friend?.displayName} to your session`,
      variant: "success",
    });
  };
  
  const handleRemoveFriend = (friendId: string) => {
    const friend = friends.find(f => f.friendId === friendId);
    setFriends(prev => prev.filter(f => f.friendId !== friendId));
    addToast({
      title: "Friend Removed",
      description: `${friend?.displayName} has been removed from your friends list`,
      variant: "info",
    });
  };
  
  const handleMessageFriend = (friendId: string) => {
    // Find or create conversation and switch to messages tab
    const existingConv = conversations.find(c => c.participantId === friendId);
    if (existingConv) {
      setActiveConversationId(existingConv.id);
    } else {
      const friend = friends.find(f => f.friendId === friendId);
      if (friend) {
        const newConv: Conversation = {
          id: `conv-${Date.now()}`,
          participantId: friendId,
          participantName: friend.displayName,
          participantAvatar: friend.avatarUrl,
          participantOnlineStatus: friend.onlineStatus,
          lastMessage: undefined,
          unreadCount: 0,
          updatedAt: new Date().toISOString(),
        };
        setConversations(prev => [newConv, ...prev]);
        setActiveConversationId(newConv.id);
      }
    }
    setActiveTab("messages");
  };
  
  const handleViewProfile = (userId: string) => {
    // In real implementation, would navigate to profile page
    console.log("View profile:", userId);
    addToast({
      title: "Coming Soon",
      description: "Profile pages are coming soon!",
      variant: "info",
    });
  };
  
  const handleAcceptRequest = (requestId: string) => {
    const request = pendingRequests.find(r => r.id === requestId);
    if (request) {
      // Add to friends
      const newFriend: Friend = {
        id: `friend-${Date.now()}`,
        friendId: request.senderId,
        displayName: request.senderName,
        avatarUrl: request.senderAvatar,
        onlineStatus: "offline",
        lastSeenAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      setFriends(prev => [newFriend, ...prev]);
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      
      addToast({
        title: "Friend Added",
        description: `You are now friends with ${request.senderName}`,
        variant: "success",
      });
    }
  };
  
  const handleDeclineRequest = (requestId: string) => {
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
  };
  
  const handleBlockUser = (_userId: string) => {
    addToast({
      title: "User Blocked",
      description: "This user has been blocked",
      variant: "info",
    });
  };
  
  const handleSearchUsers = (query: string) => {
    // In real implementation, would search via API
    if (query.length > 0) {
      setUserSearchResults([
        { id: "user-13", displayName: `${query}_player1`, avatarUrl: undefined, mutualFriends: 1 },
        { id: "user-14", displayName: `${query}_player2`, avatarUrl: undefined, mutualFriends: 0 },
      ]);
    } else {
      setUserSearchResults([]);
    }
  };
  
  const handleSendFriendRequest = (_userId: string, _message?: string) => {
    addToast({
      title: "Request Sent",
      description: "Your friend request has been sent",
      variant: "success",
    });
  };
  
  const handleRespondToLfg = (postId: string, _message?: string) => {
    const post = lfgPosts.find(p => p.id === postId);
    if (post) {
      // Update response count
      setLfgPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, responseCount: p.responseCount + 1 } : p
      ));
      
      addToast({
        title: "Response Sent",
        description: `You've responded to ${post.authorName}'s post`,
        variant: "success",
      });
    }
  };
  
  const handleViewLfgDetails = (postId: string) => {
    console.log("View LFG details:", postId);
  };
  
  const handleCreateLfgPost = (data: any) => {
    const newPost: LfgPost = {
      id: `lfg-${Date.now()}`,
      authorId: currentUserId,
      authorName: user?.username || "You",
      authorAvatar: user?.avatarUrl,
      authorReputation: "reliable",
      ...data,
      responseCount: 0,
      status: "open",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    setLfgPosts(prev => [newPost, ...prev]);
    addToast({
      title: "Post Created",
      description: "Your LFG post has been published",
      variant: "success",
    });
  };
  
  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    // Mark messages as read
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, unreadCount: 0 } : c
    ));
  };
  
  const handleSendMessage = (content: string) => {
    if (!activeConversationId) return;
    
    const conversation = conversations.find(c => c.id === activeConversationId);
    if (!conversation) return;
    
    const newMessage: DirectMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      senderName: user?.username || "You",
      senderAvatar: user?.avatarUrl || undefined,
      receiverId: conversation.participantId,
      content,
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Update conversation's last message
    setConversations(prev => prev.map(c =>
      c.id === activeConversationId
        ? { ...c, lastMessage: newMessage, updatedAt: new Date().toISOString() }
        : c
    ));
  };
  
  const handleStartConversation = () => {
    // Would open a modal to select a friend to message
    addToast({
      title: "Select a Friend",
      description: "Use the Friends tab to start a conversation",
      variant: "info",
    });
    setActiveTab("friends");
  };
  
  return (
    <div className="h-[calc(100vh-8rem)]">
      <SocialHub
        // Activity
        activities={activities}
        activityFilter={activityFilter}
        onActivityFilterChange={handleActivityFilterChange}
        onActivityClick={handleActivityClick}
        
        // Friends
        friends={friends}
        pendingRequests={pendingRequests}
        onInviteFriend={handleInviteFriend}
        onRemoveFriend={handleRemoveFriend}
        onMessageFriend={handleMessageFriend}
        onViewProfile={handleViewProfile}
        onAcceptRequest={handleAcceptRequest}
        onDeclineRequest={handleDeclineRequest}
        onBlockUser={handleBlockUser}
        onSearchUsers={handleSearchUsers}
        onSendFriendRequest={handleSendFriendRequest}
        userSearchResults={userSearchResults}
        
        // LFG
        lfgPosts={lfgPosts}
        onRespondToLfg={handleRespondToLfg}
        onViewLfgDetails={handleViewLfgDetails}
        onCreateLfgPost={handleCreateLfgPost}
        availableAdventures={mockAdventures}
        
        // Messaging
        conversations={conversations}
        messages={messages}
        currentUserId={currentUserId}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onSendMessage={handleSendMessage}
        onStartConversation={handleStartConversation}
        
        // UI State
        loading={loading}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
