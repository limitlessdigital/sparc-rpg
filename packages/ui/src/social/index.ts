/**
 * Social System - Component Library
 * Based on PRD 22: Social System
 */

// Types
export * from './types';

// Utilities
export {
  calculateReputationScore,
  getReputationTier,
  getReputationColor,
  getReputationIcon,
  getOnlineStatusColor,
  getOnlineStatusText,
  getBadgeRarityColor,
  getBadgeRarityGlow,
  getPlayStyleLabel,
  getPlayStyleIcon,
  getExperienceLevelLabel,
  getExperienceLevelIcon,
  getActivityIcon,
  getActivityText,
  formatRelativeTime,
  formatDuration,
  formatPlayTime,
  validateDisplayName,
  validateBio,
  validateGroupName,
  DEFAULT_PRIVACY_SETTINGS,
  ALL_PLAY_STYLE_TAGS,
  SAMPLE_BADGES,
} from './utils';

// Profile Components
export {
  ProfileCard,
  CompactProfileCard,
  ReputationBadge,
  BadgeShowcase,
  StatsGrid,
  PlayStyleTags,
} from './ProfileCard';
export type { ProfileCardProps, CompactProfileCardProps } from './ProfileCard';

// Friends Components
export {
  FriendsList,
  FriendCard,
  FriendRequestCard,
  AddFriendModal,
  OnlineStatusIndicator,
} from './FriendsList';
export type { FriendsListProps, AddFriendModalProps } from './FriendsList';

// Activity Components
export {
  ActivityFeed,
  ActivityItem,
  ActivityCard,
  CompactActivityList,
} from './ActivityFeed';
export type {
  ActivityFeedProps,
  CompactActivityListProps,
  ActivityFilter,
} from './ActivityFeed';

// LFG Components
export {
  LfgBrowser,
  LfgPostCard,
  LfgFilters,
  CreateLfgPostModal,
  LfgResponseModal,
} from './LfgBrowser';
export type {
  LfgBrowserProps,
  CreateLfgPostModalProps,
  LfgResponseModalProps,
} from './LfgBrowser';

// Messaging Components
export {
  MessagingPanel,
  MessageThread,
  MessageBubble,
  ConversationItem,
  MessagePreviewList,
} from './Messaging';
export type { MessagingPanelProps, MessagePreviewListProps } from './Messaging';

// Social Hub (Main Container)
export { SocialHub, SocialWidget } from './SocialHub';
export type { SocialHubProps, SocialWidgetProps } from './SocialHub';
