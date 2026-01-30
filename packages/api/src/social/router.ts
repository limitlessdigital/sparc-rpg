/**
 * Social System - tRPC Router
 * API endpoints for social features (PRD 22)
 */

import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../server";

// ============================================
// Input Schemas
// ============================================

const playStyleTagSchema = z.enum([
  'roleplay-focused',
  'combat-focused',
  'casual',
  'serious',
  'newbie-friendly',
  'experienced-players',
]);

const availabilitySchema = z.object({
  day: z.enum(['weekdays', 'weekends', 'any']),
  time: z.enum(['morning', 'afternoon', 'evening', 'night', 'any']),
});

const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'friends', 'private']).optional(),
  statsVisibility: z.enum(['public', 'friends', 'private']).optional(),
  activityFeed: z.boolean().optional(),
  discoverability: z.boolean().optional(),
  onlineStatus: z.enum(['visible', 'friends', 'invisible']).optional(),
  friendRequests: z.enum(['anyone', 'mutuals', 'nobody']).optional(),
});

const updateProfileSchema = z.object({
  displayName: z.string().min(3).max(30).optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  timezone: z.string().optional(),
  availability: z.array(availabilitySchema).optional(),
  playStyleTags: z.array(playStyleTagSchema).max(6).optional(),
  pinnedBadges: z.array(z.string()).max(5).optional(),
  privacySettings: privacySettingsSchema.optional(),
});

const sendFriendRequestSchema = z.object({
  receiverId: z.string(),
  message: z.string().max(200).optional(),
});

const createLfgPostSchema = z.object({
  type: z.enum(['lfp', 'lfs']),
  adventureId: z.string().optional(),
  scheduledFor: z.string().datetime().optional(),
  duration: z.number().min(15).max(480),
  playersNeeded: z.number().min(1).max(10),
  experienceLevel: z.enum(['any', 'newbie', 'experienced']),
  playStyleTags: z.array(playStyleTagSchema),
  description: z.string().max(300).optional(),
});

const createGroupSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(1000).optional(),
  avatarUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  privacy: z.enum(['public', 'private', 'secret']),
});

const reportUserSchema = z.object({
  reportedUserId: z.string(),
  category: z.enum(['harassment', 'cheating', 'inappropriate', 'spam']),
  description: z.string().max(500).optional(),
  sessionId: z.string().optional(),
});

const ratePlayerSchema = z.object({
  sessionId: z.string(),
  ratedUserId: z.string(),
  rating: z.enum(['positive', 'neutral']),
  categories: z.array(z.enum(['fun', 'communicator', 'reliable'])),
  privateNote: z.string().max(200).optional(),
});

const sendMessageSchema = z.object({
  receiverId: z.string(),
  content: z.string().min(1).max(1000),
});

// ============================================
// Profile Router
// ============================================

const profileRouter = createTRPCRouter({
  // Get own profile
  me: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Fetch from Supabase using ctx.session.user.id
    const mockProfile = {
      id: 'profile-1',
      userId: ctx.session?.user?.id || 'user-1',
      displayName: 'TestUser',
      avatarUrl: undefined,
      bio: 'A SPARC RPG enthusiast',
      timezone: 'America/New_York',
      availability: [{ day: 'weekends', time: 'evening' }],
      playStyleTags: ['roleplay-focused', 'casual'],
      sessionsPlayed: 15,
      sessionsRun: 3,
      totalPlayTime: 1200,
      adventuresCompleted: 8,
      charactersCreated: 5,
      favoriteClass: 'Champion',
      friendCount: 12,
      reputationTier: 'reliable',
      reputationScore: 85,
      pinnedBadges: ['veteran'],
      privacySettings: {
        profileVisibility: 'public',
        statsVisibility: 'friends',
        activityFeed: true,
        discoverability: true,
        onlineStatus: 'visible',
        friendRequests: 'anyone',
      },
      createdAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
    
    return { success: true, data: mockProfile };
  }),
  
  // Get user profile by ID
  getById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      // TODO: Fetch from Supabase, respecting privacy settings
      const mockProfile = {
        id: 'profile-' + input.userId,
        userId: input.userId,
        displayName: 'OtherUser',
        avatarUrl: undefined,
        bio: 'Another player',
        timezone: 'UTC',
        availability: [],
        playStyleTags: ['combat-focused'],
        sessionsPlayed: 25,
        sessionsRun: 10,
        totalPlayTime: 3000,
        adventuresCompleted: 15,
        charactersCreated: 8,
        favoriteClass: 'Shadowblade',
        friendCount: 30,
        reputationTier: 'trusted',
        reputationScore: 150,
        pinnedBadges: ['master-seer', 'helpful'],
        privacySettings: {
          profileVisibility: 'public',
          statsVisibility: 'public',
          activityFeed: true,
          discoverability: true,
          onlineStatus: 'visible',
          friendRequests: 'anyone',
        },
        createdAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
      };
      
      return { success: true, data: mockProfile };
    }),
  
  // Update own profile
  update: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update in Supabase
      return { success: true, data: { ...input, updated: true } };
    }),
  
  // Get user badges
  badges: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input: _input }) => {
      // TODO: Fetch from Supabase
      const mockBadges = [
        { id: 'ub-1', userId: 'user-1', badgeId: 'veteran', earnedAt: new Date().toISOString() },
      ];
      
      return { success: true, data: mockBadges };
    }),
  
  // Search users
  search: protectedProcedure
    .input(z.object({ query: z.string().min(2) }))
    .query(async ({ input }) => {
      // TODO: Search in Supabase
      const mockResults = [
        { id: 'user-2', displayName: `User matching "${input.query}"`, avatarUrl: undefined, mutualFriends: 2 },
      ];
      
      return { success: true, data: mockResults };
    }),
});

// ============================================
// Friends Router
// ============================================

const friendsRouter = createTRPCRouter({
  // List friends
  list: protectedProcedure.query(async ({ ctx: _ctx }) => {
    // TODO: Fetch from Supabase
    const mockFriends = [
      {
        id: 'friend-1',
        friendId: 'user-2',
        displayName: 'OnlineFriend',
        avatarUrl: undefined,
        onlineStatus: 'online',
        currentActivity: 'Browsing Adventures',
        lastSeenAt: new Date().toISOString(),
        mutualFriends: 3,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'friend-2',
        friendId: 'user-3',
        displayName: 'OfflineFriend',
        avatarUrl: undefined,
        onlineStatus: 'offline',
        currentActivity: undefined,
        lastSeenAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        mutualFriends: 1,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    
    return { success: true, data: mockFriends };
  }),
  
  // Get pending friend requests
  requests: protectedProcedure.query(async ({ ctx: _ctx }) => {
    // TODO: Fetch from Supabase
    const mockRequests = [
      {
        id: 'req-1',
        senderId: 'user-4',
        senderName: 'NewPlayer',
        senderAvatar: undefined,
        receiverId: 'user-1',
        message: 'Hey! Want to play sometime?',
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
    ];
    
    return { success: true, data: mockRequests };
  }),
  
  // Send friend request
  sendRequest: protectedProcedure
    .input(sendFriendRequestSchema)
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Create in Supabase, check rate limits
      return {
        success: true,
        data: {
          id: 'req-new',
          senderId: 'user-1',
          receiverId: input.receiverId,
          message: input.message,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      };
    }),
  
  // Accept friend request
  acceptRequest: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update in Supabase, create friendship
      return { success: true, data: { requestId: input.requestId, accepted: true } };
    }),
  
  // Decline friend request
  declineRequest: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update in Supabase
      return { success: true, data: { requestId: input.requestId, declined: true } };
    }),
  
  // Remove friend
  remove: protectedProcedure
    .input(z.object({ friendId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Delete from Supabase
      return { success: true, data: { friendId: input.friendId, removed: true } };
    }),
});

// ============================================
// Block/Mute Router
// ============================================

const safetyRouter = createTRPCRouter({
  // List blocked users
  blocked: protectedProcedure.query(async ({ ctx: _ctx }) => {
    // TODO: Fetch from Supabase
    return { success: true, data: [] };
  }),
  
  // Block user
  block: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Create in Supabase
      return { success: true, data: { userId: input.userId, blocked: true } };
    }),
  
  // Unblock user
  unblock: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Delete from Supabase
      return { success: true, data: { userId: input.userId, unblocked: true } };
    }),
  
  // List muted users
  muted: protectedProcedure.query(async ({ ctx: _ctx }) => {
    // TODO: Fetch from Supabase
    return { success: true, data: [] };
  }),
  
  // Mute user
  mute: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Create in Supabase
      return { success: true, data: { userId: input.userId, muted: true } };
    }),
  
  // Unmute user
  unmute: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Delete from Supabase
      return { success: true, data: { userId: input.userId, unmuted: true } };
    }),
  
  // Report user
  report: protectedProcedure
    .input(reportUserSchema)
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Create in Supabase
      return {
        success: true,
        data: {
          id: 'report-new',
          ...input,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      };
    }),
});

// ============================================
// LFG Router
// ============================================

const lfgRouter = createTRPCRouter({
  // List LFG posts
  list: publicProcedure
    .input(z.object({
      type: z.enum(['lfp', 'lfs', 'all']).optional(),
      experienceLevel: z.enum(['any', 'newbie', 'experienced', 'all']).optional(),
      limit: z.number().min(1).max(50).optional(),
      cursor: z.string().optional(),
    }).optional())
    .query(async ({ input: _input }) => {
      // TODO: Fetch from Supabase with filters
      const mockPosts = [
        {
          id: 'lfg-1',
          authorId: 'user-2',
          authorName: 'ExperiencedSeer',
          authorAvatar: undefined,
          authorReputation: 'trusted',
          type: 'lfp',
          adventureId: 'adv-1',
          adventureName: 'The Crystal Caverns',
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration: 120,
          playersNeeded: 3,
          experienceLevel: 'any',
          playStyleTags: ['roleplay-focused', 'casual'],
          description: 'Fun beginner-friendly run through the caves!',
          responseCount: 2,
          status: 'open',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'lfg-2',
          authorId: 'user-3',
          authorName: 'AdventureGroup',
          authorAvatar: undefined,
          authorReputation: 'reliable',
          type: 'lfs',
          adventureId: undefined,
          adventureName: undefined,
          scheduledFor: undefined,
          duration: 90,
          playersNeeded: 1,
          experienceLevel: 'experienced',
          playStyleTags: ['combat-focused', 'serious'],
          description: 'We need an experienced Seer for our veteran group!',
          responseCount: 0,
          status: 'open',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      
      return { success: true, data: mockPosts };
    }),
  
  // Get LFG post details
  getById: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input: _input }) => {
      // TODO: Fetch from Supabase
      return { success: true, data: null };
    }),
  
  // Create LFG post
  create: protectedProcedure
    .input(createLfgPostSchema)
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Create in Supabase
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      return {
        success: true,
        data: {
          id: 'lfg-new',
          authorId: 'user-1',
          authorName: 'You',
          ...input,
          responseCount: 0,
          status: 'open',
          createdAt: new Date().toISOString(),
          expiresAt,
        },
      };
    }),
  
  // Cancel LFG post
  cancel: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update in Supabase
      return { success: true, data: { postId: input.postId, cancelled: true } };
    }),
  
  // Respond to LFG post
  respond: protectedProcedure
    .input(z.object({ postId: z.string(), message: z.string().max(300).optional() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Create in Supabase
      return {
        success: true,
        data: {
          id: 'response-new',
          postId: input.postId,
          responderId: 'user-1',
          message: input.message,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      };
    }),
  
  // Withdraw LFG response
  withdrawResponse: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update in Supabase
      return { success: true, data: { postId: input.postId, withdrawn: true } };
    }),
  
  // Accept LFG response
  acceptResponse: protectedProcedure
    .input(z.object({ postId: z.string(), responseId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update in Supabase
      return { success: true, data: { responseId: input.responseId, accepted: true } };
    }),
  
  // Decline LFG response
  declineResponse: protectedProcedure
    .input(z.object({ postId: z.string(), responseId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update in Supabase
      return { success: true, data: { responseId: input.responseId, declined: true } };
    }),
});

// ============================================
// Groups Router
// ============================================

const groupsRouter = createTRPCRouter({
  // List user's groups
  list: protectedProcedure.query(async ({ ctx: _ctx }) => {
    // TODO: Fetch from Supabase
    const mockGroups = [
      {
        id: 'group-1',
        name: 'Weekend Warriors',
        description: 'A group for weekend gaming sessions',
        avatarUrl: undefined,
        bannerUrl: undefined,
        privacy: 'public',
        ownerId: 'user-1',
        ownerName: 'TestUser',
        memberCount: 8,
        announcement: 'Next session this Saturday!',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    
    return { success: true, data: mockGroups };
  }),
  
  // Get group details
  getById: publicProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ input: _input }) => {
      // TODO: Fetch from Supabase, respecting privacy
      return { success: true, data: null };
    }),
  
  // Create group
  create: protectedProcedure
    .input(createGroupSchema)
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Create in Supabase
      return {
        success: true,
        data: {
          id: 'group-new',
          ...input,
          ownerId: 'user-1',
          ownerName: 'TestUser',
          memberCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }),
  
  // Update group
  update: protectedProcedure
    .input(z.object({
      groupId: z.string(),
      name: z.string().min(3).max(50).optional(),
      description: z.string().max(1000).optional(),
      avatarUrl: z.string().url().optional(),
      bannerUrl: z.string().url().optional(),
      privacy: z.enum(['public', 'private', 'secret']).optional(),
      announcement: z.string().max(500).optional(),
    }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update in Supabase
      return { success: true, data: { groupId: input.groupId, updated: true } };
    }),
  
  // Delete group
  delete: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Delete from Supabase
      return { success: true, data: { groupId: input.groupId, deleted: true } };
    }),
  
  // Get group members
  members: publicProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ input: _input }) => {
      // TODO: Fetch from Supabase
      return { success: true, data: [] };
    }),
  
  // Invite to group
  invite: protectedProcedure
    .input(z.object({ groupId: z.string(), userId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Create invite in Supabase
      return { success: true, data: { userId: input.userId, invited: true } };
    }),
  
  // Join public group
  join: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Create membership in Supabase
      return { success: true, data: { groupId: input.groupId, joined: true } };
    }),
  
  // Leave group
  leave: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Delete membership from Supabase
      return { success: true, data: { groupId: input.groupId, left: true } };
    }),
  
  // Remove member
  removeMember: protectedProcedure
    .input(z.object({ groupId: z.string(), userId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Delete membership from Supabase
      return { success: true, data: { userId: input.userId, removed: true } };
    }),
  
  // Change member role
  updateMemberRole: protectedProcedure
    .input(z.object({
      groupId: z.string(),
      userId: z.string(),
      role: z.enum(['admin', 'member']),
    }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update in Supabase
      return { success: true, data: { userId: input.userId, role: input.role } };
    }),
});

// ============================================
// Activity Router
// ============================================

const activityRouter = createTRPCRouter({
  // Get activity feed
  feed: protectedProcedure
    .input(z.object({
      filter: z.enum(['all', 'friends', 'groups']).optional(),
      limit: z.number().min(1).max(50).optional(),
      cursor: z.string().optional(),
    }).optional())
    .query(async ({ input: _input }) => {
      // TODO: Fetch from Supabase
      const mockActivity = [
        {
          id: 'activity-1',
          userId: 'user-2',
          userName: 'DragonSlayer',
          userAvatar: undefined,
          type: 'badge_earned',
          data: { badgeName: 'Master Seer' },
          visibility: 'public',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'activity-2',
          userId: 'user-3',
          userName: 'WizardFan',
          userAvatar: undefined,
          type: 'session_completed',
          data: { adventureName: 'Crystal Caverns' },
          visibility: 'friends',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'activity-3',
          userId: 'user-4',
          userName: 'NewbieHero',
          userAvatar: undefined,
          type: 'session_completed',
          data: { adventureName: 'First Adventure' },
          visibility: 'public',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
      ];
      
      return { success: true, data: mockActivity };
    }),
});

// ============================================
// Ratings Router
// ============================================

const ratingsRouter = createTRPCRouter({
  // Get pending ratings
  pending: protectedProcedure.query(async ({ ctx: _ctx }) => {
    // TODO: Fetch from Supabase
    return { success: true, data: [] };
  }),
  
  // Submit rating
  submit: protectedProcedure
    .input(ratePlayerSchema)
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Create in Supabase
      return {
        success: true,
        data: {
          id: 'rating-new',
          ...input,
          raterId: 'user-1',
          createdAt: new Date().toISOString(),
        },
      };
    }),
});

// ============================================
// Messaging Router
// ============================================

const messagingRouter = createTRPCRouter({
  // List conversations
  conversations: protectedProcedure.query(async ({ ctx: _ctx }) => {
    // TODO: Fetch from Supabase
    const mockConversations = [
      {
        id: 'conv-1',
        participantId: 'user-2',
        participantName: 'OnlineFriend',
        participantAvatar: undefined,
        participantOnlineStatus: 'online',
        lastMessage: {
          id: 'msg-1',
          senderId: 'user-2',
          senderName: 'OnlineFriend',
          receiverId: 'user-1',
          content: 'Ready for the session?',
          read: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        unreadCount: 1,
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
    ];
    
    return { success: true, data: mockConversations };
  }),
  
  // Get messages in conversation
  messages: protectedProcedure
    .input(z.object({
      participantId: z.string(),
      limit: z.number().min(1).max(100).optional(),
      cursor: z.string().optional(),
    }))
    .query(async ({ input }) => {
      // TODO: Fetch from Supabase
      const mockMessages = [
        {
          id: 'msg-1',
          senderId: input.participantId,
          senderName: 'Friend',
          receiverId: 'user-1',
          content: 'Hey, want to play tonight?',
          read: true,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'msg-2',
          senderId: 'user-1',
          senderName: 'You',
          receiverId: input.participantId,
          content: 'Sure! What adventure?',
          read: true,
          createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        },
        {
          id: 'msg-3',
          senderId: input.participantId,
          senderName: 'Friend',
          receiverId: 'user-1',
          content: 'Ready for the session?',
          read: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
      ];
      
      return { success: true, data: mockMessages };
    }),
  
  // Send message
  send: protectedProcedure
    .input(sendMessageSchema)
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Create in Supabase
      return {
        success: true,
        data: {
          id: 'msg-new',
          senderId: 'user-1',
          senderName: 'You',
          receiverId: input.receiverId,
          content: input.content,
          read: false,
          createdAt: new Date().toISOString(),
        },
      };
    }),
  
  // Mark messages as read
  markRead: protectedProcedure
    .input(z.object({ participantId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update in Supabase
      return { success: true, data: { participantId: input.participantId, marked: true } };
    }),
});

// ============================================
// Main Social Router
// ============================================

export const socialRouter = createTRPCRouter({
  profile: profileRouter,
  friends: friendsRouter,
  safety: safetyRouter,
  lfg: lfgRouter,
  groups: groupsRouter,
  activity: activityRouter,
  ratings: ratingsRouter,
  messaging: messagingRouter,
});

export type SocialRouter = typeof socialRouter;
