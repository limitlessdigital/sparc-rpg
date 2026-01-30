/**
 * Campaign Management - Type Definitions
 * Based on PRD 23: Campaign Management
 */

// ============================================
// Campaign Types
// ============================================

export type CampaignPrivacy = 'public' | 'unlisted' | 'invite_only';
export type CampaignStatus = 'active' | 'paused' | 'completed' | 'archived';
export type CampaignFrequency = 'weekly' | 'biweekly' | 'monthly' | 'irregular';
export type CampaignRole = 'owner' | 'co_seer' | 'player' | 'spectator';
export type AbsentXpPolicy = 'full' | 'half' | 'none';

export interface CampaignSettings {
  maxPlayers: number; // 2-8
  sessionDuration: number; // Minutes
  frequency: CampaignFrequency;
  timezone: string;
  requireApproval: boolean;
  minPlayersToRun: number;
  absentXpPolicy: AbsentXpPolicy;
  reminderHours: number[];
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  bannerUrl?: string;
  ownerId: string;
  ownerName?: string;
  inviteCode: string;
  privacy: CampaignPrivacy;
  settings: CampaignSettings;
  sessionCount: number;
  totalPlayTime: number; // Minutes
  playerCount: number;
  currentArcId?: string;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
  lastSessionAt?: string;
}

// ============================================
// Campaign Member Types
// ============================================

export type MemberStatus = 'active' | 'inactive' | 'left';

export interface CampaignMember {
  id: string;
  campaignId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  characterId?: string;
  characterName?: string;
  role: CampaignRole;
  joinedAt: string;
  status: MemberStatus;
}

// ============================================
// Campaign Session Types
// ============================================

export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type RsvpStatus = 'yes' | 'no' | 'maybe' | 'pending';
export type KeyMomentType = 'combat' | 'roleplay' | 'discovery' | 'failure' | 'heroic';

export interface SessionAttendee {
  memberId: string;
  memberName?: string;
  memberAvatar?: string;
  characterId: string;
  characterName?: string;
  rsvp: RsvpStatus;
  attended: boolean;
  rsvpAt?: string;
}

export interface KeyMoment {
  characterId: string;
  characterName?: string;
  description: string;
  type: KeyMomentType;
}

export interface SessionRecap {
  summary: string;
  keyMoments: KeyMoment[];
  npcsEncountered: string[];
  cliffhanger?: string;
  generatedAt: string;
  editedAt?: string;
  editedBy?: string;
  published: boolean;
}

export interface CampaignSession {
  id: string;
  campaignId: string;
  sessionNumber: number;
  title?: string;
  adventureId?: string;
  adventureName?: string;
  arcId?: string;
  arcName?: string;
  scheduledFor?: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number; // Actual minutes
  status: SessionStatus;
  attendees: SessionAttendee[];
  recap?: SessionRecap;
  seerNotes?: string;
  createdAt: string;
}

// ============================================
// Story Arc Types
// ============================================

export type ArcStatus = 'upcoming' | 'active' | 'completed';

export interface StoryArc {
  id: string;
  campaignId: string;
  parentArcId?: string;
  name: string;
  description?: string;
  status: ArcStatus;
  order: number;
  progress: number; // 0-100
  sessions: string[]; // Session IDs
  createdAt: string;
}

// ============================================
// Campaign Wiki Types
// ============================================

export type WikiCategory = 'npc' | 'location' | 'item' | 'lore' | 'faction' | 'other';
export type WikiVisibility = 'public' | 'seer_only';

export interface WikiPage {
  id: string;
  campaignId: string;
  title: string;
  slug: string;
  category: WikiCategory;
  content: string; // Markdown
  visibility: WikiVisibility;
  createdBy: string;
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface WikiRevision {
  id: string;
  pageId: string;
  content: string;
  editedBy: string;
  editedByName?: string;
  editedAt: string;
  version: number;
}

// ============================================
// Campaign Notes Types
// ============================================

export interface CampaignNote {
  id: string;
  campaignId: string;
  userId: string;
  title?: string;
  content: string;
  isPrivate: boolean;
  sessionId?: string;
  sessionNumber?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Campaign Invite Types
// ============================================

export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface CampaignInvite {
  id: string;
  campaignId: string;
  campaignName?: string;
  inviterId: string;
  inviterName?: string;
  inviteeId?: string;
  inviteeName?: string;
  code: string;
  role: CampaignRole;
  status: InviteStatus;
  expiresAt: string;
  createdAt: string;
}

// ============================================
// Character Snapshot Types
// ============================================

export interface CharacterState {
  hitPoints: number;
  maxHitPoints: number;
  experience: number;
  level: number;
  equipment: string[];
  abilities: string[];
  conditions: string[];
}

export interface CharacterSnapshot {
  id: string;
  characterId: string;
  characterName?: string;
  sessionId: string;
  campaignId: string;
  state: CharacterState;
  takenAt: string;
}

// ============================================
// Campaign Template Types
// ============================================

export interface CampaignTemplateStructure {
  suggestedArcs: Partial<StoryArc>[];
  wikiPages: Partial<WikiPage>[];
  settings: Partial<CampaignSettings>;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  creatorName?: string;
  isOfficial: boolean;
  privacy: 'public' | 'private';
  structure: CampaignTemplateStructure;
  usageCount: number;
  createdAt: string;
}

// ============================================
// Activity Types
// ============================================

export type CampaignActivityType =
  | 'session_completed'
  | 'session_scheduled'
  | 'member_joined'
  | 'member_left'
  | 'wiki_updated'
  | 'character_updated'
  | 'arc_completed'
  | 'recap_published';

export interface CampaignActivity {
  id: string;
  campaignId: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  type: CampaignActivityType;
  data: Record<string, unknown>;
  createdAt: string;
}

// ============================================
// Component Props Types
// ============================================

export interface CampaignDashboardTab {
  id: 'overview' | 'sessions' | 'timeline' | 'wiki' | 'players' | 'settings';
  label: string;
  count?: number;
}

export interface CampaignCardProps {
  campaign: Campaign;
  role?: CampaignRole;
  onClick?: () => void;
  onManage?: () => void;
}

export interface SessionCardProps {
  session: CampaignSession;
  showCampaign?: boolean;
  onViewDetails?: () => void;
  onRsvp?: (status: RsvpStatus) => void;
  onStart?: () => void;
  onCancel?: () => void;
}

export interface TimelineProps {
  sessions: CampaignSession[];
  arcs: StoryArc[];
  onSessionClick?: (sessionId: string) => void;
  onArcClick?: (arcId: string) => void;
}

export interface WikiBrowserProps {
  pages: WikiPage[];
  categories?: WikiCategory[];
  onPageSelect?: (pageId: string) => void;
  onCreatePage?: () => void;
  canEdit?: boolean;
}

// ============================================
// API Input Types
// ============================================

export interface CreateCampaignInput {
  name: string;
  description?: string;
  bannerUrl?: string;
  privacy: CampaignPrivacy;
  settings?: Partial<CampaignSettings>;
  templateId?: string;
}

export interface UpdateCampaignInput {
  name?: string;
  description?: string;
  bannerUrl?: string;
  privacy?: CampaignPrivacy;
  settings?: Partial<CampaignSettings>;
  status?: CampaignStatus;
}

export interface CreateSessionInput {
  campaignId: string;
  title?: string;
  adventureId?: string;
  arcId?: string;
  scheduledFor?: string;
}

export interface UpdateSessionInput {
  title?: string;
  adventureId?: string;
  arcId?: string;
  scheduledFor?: string;
  status?: SessionStatus;
}

export interface CreateArcInput {
  campaignId: string;
  name: string;
  description?: string;
  parentArcId?: string;
}

export interface UpdateArcInput {
  name?: string;
  description?: string;
  status?: ArcStatus;
  progress?: number;
}

export interface CreateWikiPageInput {
  campaignId: string;
  title: string;
  category: WikiCategory;
  content: string;
  visibility?: WikiVisibility;
}

export interface UpdateWikiPageInput {
  title?: string;
  category?: WikiCategory;
  content?: string;
  visibility?: WikiVisibility;
}

export interface CreateNoteInput {
  campaignId: string;
  title?: string;
  content: string;
  sessionId?: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
}

export interface CreateInviteInput {
  campaignId: string;
  inviteeId?: string;
  role?: CampaignRole;
  expiresInDays?: number;
}
