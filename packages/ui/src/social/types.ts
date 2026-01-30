/**
 * Social System - Type Definitions
 * Based on PRD 22: Social System
 */

// ============================================
// User Profile Types
// ============================================

export type PlayStyleTag =
  | 'roleplay-focused'
  | 'combat-focused'
  | 'casual'
  | 'serious'
  | 'newbie-friendly'
  | 'experienced-players';

export interface Availability {
  day: 'weekdays' | 'weekends' | 'any';
  time: 'morning' | 'afternoon' | 'evening' | 'night' | 'any';
}

export type ReputationTier = 'new' | 'reliable' | 'trusted' | 'exemplary';

export type ProfileVisibility = 'public' | 'friends' | 'private';
export type OnlineStatusVisibility = 'visible' | 'friends' | 'invisible';
export type FriendRequestSetting = 'anyone' | 'mutuals' | 'nobody';

export interface PrivacySettings {
  profileVisibility: ProfileVisibility;
  statsVisibility: ProfileVisibility;
  activityFeed: boolean;
  discoverability: boolean;
  onlineStatus: OnlineStatusVisibility;
  friendRequests: FriendRequestSetting;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  timezone?: string;
  availability: Availability[];
  playStyleTags: PlayStyleTag[];
  
  // Stats
  sessionsPlayed: number;
  sessionsRun: number;
  totalPlayTime: number; // minutes
  adventuresCompleted: number;
  charactersCreated: number;
  favoriteClass?: string;
  
  // Social
  friendCount: number;
  reputationTier: ReputationTier;
  reputationScore: number;
  pinnedBadges: string[];
  
  // Privacy
  privacySettings: PrivacySettings;
  
  // Metadata
  createdAt: string;
  lastSeenAt: string;
}

// ============================================
// Badge Types
// ============================================

export type BadgeCategory = 'player' | 'seer' | 'community' | 'milestone';
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  criteria: Record<string, unknown>;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badge?: Badge;
  earnedAt: string;
}

// ============================================
// Friends Types
// ============================================

export type OnlineStatus = 'online' | 'idle' | 'in-session' | 'offline';

export interface Friend {
  id: string;
  friendId: string;
  displayName: string;
  avatarUrl?: string;
  onlineStatus: OnlineStatus;
  currentActivity?: string;
  lastSeenAt: string;
  mutualFriends?: number;
  createdAt: string;
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  message?: string;
  status: FriendRequestStatus;
  createdAt: string;
  respondedAt?: string;
}

// ============================================
// Block & Mute Types
// ============================================

export interface BlockedUser {
  id: string;
  userId: string;
  blockedUserId: string;
  blockedUserName: string;
  blockedUserAvatar?: string;
  createdAt: string;
}

export interface MutedUser {
  id: string;
  userId: string;
  mutedUserId: string;
  mutedUserName: string;
  mutedUserAvatar?: string;
  createdAt: string;
}

// ============================================
// Report Types
// ============================================

export type ReportCategory = 'harassment' | 'cheating' | 'inappropriate' | 'spam';
export type ReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed';

export interface UserReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  category: ReportCategory;
  description?: string;
  sessionId?: string;
  status: ReportStatus;
  createdAt: string;
  reviewedAt?: string;
}

// ============================================
// LFG (Looking For Group) Types
// ============================================

export type LfgType = 'lfp' | 'lfs'; // Looking for Players / Looking for Seer
export type LfgStatus = 'open' | 'filled' | 'cancelled' | 'expired';
export type ExperienceLevel = 'any' | 'newbie' | 'experienced';

export interface LfgPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorReputation: ReputationTier;
  type: LfgType;
  adventureId?: string;
  adventureName?: string;
  scheduledFor?: string;
  duration: number; // minutes
  playersNeeded: number;
  experienceLevel: ExperienceLevel;
  playStyleTags: PlayStyleTag[];
  description?: string;
  responseCount: number;
  status: LfgStatus;
  createdAt: string;
  expiresAt: string;
}

export type LfgResponseStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn';

export interface LfgResponse {
  id: string;
  postId: string;
  responderId: string;
  responderName: string;
  responderAvatar?: string;
  responderReputation: ReputationTier;
  message?: string;
  status: LfgResponseStatus;
  createdAt: string;
}

// ============================================
// Group Types
// ============================================

export type GroupPrivacy = 'public' | 'private' | 'secret';
export type GroupRole = 'owner' | 'admin' | 'member';

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  privacy: GroupPrivacy;
  ownerId: string;
  ownerName: string;
  memberCount: number;
  announcement?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  role: GroupRole;
  joinedAt: string;
  onlineStatus?: OnlineStatus;
}

export type GroupInviteStatus = 'pending' | 'accepted' | 'declined';

export interface GroupInvite {
  id: string;
  groupId: string;
  groupName: string;
  inviterId: string;
  inviterName: string;
  inviteeId: string;
  status: GroupInviteStatus;
  createdAt: string;
}

// ============================================
// Activity Feed Types
// ============================================

export type ActivityType =
  | 'session_completed'
  | 'badge_earned'
  | 'achievement_unlocked'
  | 'group_joined'
  | 'session_scheduled'
  | 'friend_added'
  | 'level_up';

export type ActivityVisibility = 'public' | 'friends' | 'group';

export interface ActivityEvent {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: ActivityType;
  data: Record<string, unknown>;
  visibility: ActivityVisibility;
  groupId?: string;
  createdAt: string;
}

// ============================================
// Rating Types
// ============================================

export type RatingValue = 'positive' | 'neutral';
export type RatingCategory = 'fun' | 'communicator' | 'reliable';

export interface PlayerRating {
  id: string;
  sessionId: string;
  raterId: string;
  ratedUserId: string;
  rating: RatingValue;
  categories: RatingCategory[];
  privateNote?: string;
  createdAt: string;
}

export interface PendingRating {
  sessionId: string;
  sessionName: string;
  completedAt: string;
  playersToRate: Array<{
    userId: string;
    displayName: string;
    avatarUrl?: string;
  }>;
}

// ============================================
// Messaging Types (Basic DMs)
// ============================================

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  participantOnlineStatus: OnlineStatus;
  lastMessage?: DirectMessage;
  unreadCount: number;
  updatedAt: string;
}

// ============================================
// Component Props Types
// ============================================

export interface SocialHubTab {
  id: 'activity' | 'friends' | 'groups' | 'lfg' | 'messages';
  label: string;
  count?: number;
}

export interface ProfileCardProps {
  profile: UserProfile;
  badges?: UserBadge[];
  showActions?: boolean;
  isFriend?: boolean;
  isBlocked?: boolean;
  onAddFriend?: () => void;
  onRemoveFriend?: () => void;
  onBlock?: () => void;
  onReport?: () => void;
  onMessage?: () => void;
}

export interface FriendListProps {
  friends: Friend[];
  onInvite?: (friendId: string) => void;
  onRemove?: (friendId: string) => void;
  onMessage?: (friendId: string) => void;
  onViewProfile?: (friendId: string) => void;
}

export interface LfgBrowserProps {
  posts: LfgPost[];
  onRespond?: (postId: string) => void;
  onViewDetails?: (postId: string) => void;
}

// ============================================
// API Input Types
// ============================================

export interface UpdateProfileInput {
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  timezone?: string;
  availability?: Availability[];
  playStyleTags?: PlayStyleTag[];
  pinnedBadges?: string[];
  privacySettings?: Partial<PrivacySettings>;
}

export interface SendFriendRequestInput {
  receiverId: string;
  message?: string;
}

export interface CreateLfgPostInput {
  type: LfgType;
  adventureId?: string;
  scheduledFor?: string;
  duration: number;
  playersNeeded: number;
  experienceLevel: ExperienceLevel;
  playStyleTags: PlayStyleTag[];
  description?: string;
}

export interface CreateGroupInput {
  name: string;
  description?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  privacy: GroupPrivacy;
}

export interface ReportUserInput {
  reportedUserId: string;
  category: ReportCategory;
  description?: string;
  sessionId?: string;
}

export interface RatePlayerInput {
  sessionId: string;
  ratedUserId: string;
  rating: RatingValue;
  categories: RatingCategory[];
  privateNote?: string;
}

export interface SendMessageInput {
  receiverId: string;
  content: string;
}
