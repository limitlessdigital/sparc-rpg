/**
 * Campaign Management - Component Library
 * Based on PRD 23: Campaign Management
 */

// Types
export * from './types';

// Utilities
export {
  DEFAULT_CAMPAIGN_SETTINGS,
  ALL_WIKI_CATEGORIES,
  getCampaignPrivacyLabel,
  getCampaignPrivacyDescription,
  getCampaignStatusLabel,
  getCampaignStatusColor,
  getCampaignStatusIcon,
  getCampaignFrequencyLabel,
  getCampaignRoleLabel,
  getCampaignRoleColor,
  getCampaignRoleIcon,
  getSessionStatusLabel,
  getSessionStatusColor,
  getSessionStatusIcon,
  getRsvpStatusLabel,
  getRsvpStatusColor,
  getRsvpStatusIcon,
  getArcStatusLabel,
  getArcStatusColor,
  getWikiCategoryLabel,
  getWikiCategoryIcon,
  getKeyMomentTypeLabel,
  getKeyMomentTypeIcon,
  formatDuration,
  formatPlayTime,
  formatRelativeTime,
  formatScheduledTime,
  getTimeUntil,
  validateCampaignName,
  validateCampaignDescription,
  validateSessionTitle,
  validateArcName,
  validateWikiTitle,
  generateSlug,
  generateInviteCode,
  calculateArcProgress,
  canManageCampaign,
  canEditWiki,
  canViewSeerOnlyContent,
  getRsvpSummary,
  isSessionUpcoming,
  getNextSession,
} from './utils';

// Campaign Card Components
export {
  CampaignCard,
  CompactCampaignCard,
  CampaignList,
  CampaignStats,
  CampaignStatusBadge,
  NextSessionWidget,
} from './CampaignCard';
export type { CampaignCardProps } from './types';

// Session Components
export {
  SessionCard,
  SessionList,
  SessionStatusBadge,
  SessionRecapCard,
  RsvpButtons,
  RsvpSummary,
  KeyMoments,
} from './SessionCard';
export type { SessionCardProps } from './types';

// Timeline Components
export {
  CampaignTimeline,
  TimelineNode,
  StoryArcCard,
  ArcProgressBar,
  StoryProgress,
} from './Timeline';
export type { TimelineProps } from './types';

// Wiki Components
export {
  WikiBrowser,
  WikiPageCard,
  WikiPageList,
  WikiPageView,
  WikiRevisionList,
  WikiCategoryPills,
  WikiSidebar,
} from './WikiBrowser';
export type { WikiBrowserProps } from './types';

// Dashboard Components
export {
  CampaignDashboard,
  CampaignHeader,
  MembersList,
  RecentActivity,
  NotesList,
} from './CampaignDashboard';
export type { CampaignDashboardProps } from './CampaignDashboard';
