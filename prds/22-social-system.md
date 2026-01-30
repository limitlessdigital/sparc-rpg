# PRD 22: Social System

> **Status**: Ready for Implementation  
> **Priority**: P1 - High  
> **Estimated Effort**: 6 days  
> **Dependencies**: 17-database-schema, 18-authentication, 19-design-system

---

## Overview

The Social System enables players to connect, find gaming groups, and build community within SPARC RPG. It provides user profiles, friend management, group creation, and a Looking For Group (LFG) system to help players find the right gaming experiences.

### Goals
- Help players find others to play with
- Build a positive, welcoming gaming community
- Enable meaningful social connections around tabletop gaming
- Provide tools for groups to organize and communicate
- Protect players from harassment and toxic behavior

### Non-Goals
- Real-time chat/messaging (use existing platforms)
- Voice/video communication
- Social media features (news feed, posts)
- Marketplace or trading features
- Integration with external social platforms

---

## User Stories

### User Profiles

#### US-01: Create Profile
**As a** new user  
**I want to** set up my player profile  
**So that** others can learn about me as a player

**Acceptance Criteria:**
- [ ] Display name (unique, 3-30 characters)
- [ ] Avatar (upload or choose from presets)
- [ ] Bio (max 500 characters)
- [ ] Preferred play style tags (roleplay-focused, combat-focused, casual, serious)
- [ ] Time zone selection
- [ ] Availability (general times: weekdays, weekends, evenings)
- [ ] Profile auto-created on account creation

#### US-02: View Profile
**As a** player  
**I want to** view other players' profiles  
**So that** I can decide if I want to play with them

**Acceptance Criteria:**
- [ ] View display name, avatar, bio
- [ ] See play history (games played, characters, classes used)
- [ ] See badges and achievements
- [ ] See mutual friends (if any)
- [ ] See reputation score
- [ ] Respect privacy settings

#### US-03: Play History & Stats
**As a** player  
**I want to** see my gaming statistics  
**So that** I can track my progress and share accomplishments

**Acceptance Criteria:**
- [ ] Total sessions played
- [ ] Total time played
- [ ] Favorite class (most played)
- [ ] Sessions as Seer vs Player
- [ ] Adventures completed
- [ ] Characters created
- [ ] Win/completion rate
- [ ] Can toggle stats visibility (public/friends/private)

#### US-04: Badges & Achievements
**As a** player  
**I want to** earn and display badges  
**So that** I can showcase my accomplishments

**Acceptance Criteria:**
- [ ] Badges earned automatically based on activity
- [ ] Badge categories: Player, Seer, Community, Milestones
- [ ] Rarity levels: Common, Uncommon, Rare, Epic, Legendary
- [ ] Can pin up to 5 badges to profile
- [ ] Hover shows badge name and how to earn

**Badge Examples:**
| Badge | Criteria | Rarity |
|-------|----------|--------|
| First Adventure | Complete first session | Common |
| Seer Novice | Run first session as Seer | Common |
| Veteran | Complete 10 sessions | Uncommon |
| Master Seer | Run 25 sessions | Rare |
| All-Rounder | Play all 7 classes | Uncommon |
| Helpful | Receive 10 positive ratings | Uncommon |
| Legendary Hero | Complete 100 sessions | Epic |
| Community Star | 50+ positive ratings | Rare |

---

### Friends System

#### US-05: Send Friend Request
**As a** player  
**I want to** send friend requests to other players  
**So that** I can build my gaming network

**Acceptance Criteria:**
- [ ] Send request from profile page or post-session
- [ ] Include optional message (max 200 chars)
- [ ] Pending requests visible in notifications
- [ ] Cannot send if already friends or blocked
- [ ] Rate limit: 20 requests per day

#### US-06: Manage Friend Requests
**As a** player  
**I want to** accept or decline friend requests  
**So that** I control who's in my network

**Acceptance Criteria:**
- [ ] View pending requests with sender info
- [ ] See any message included with request
- [ ] Accept or decline buttons
- [ ] Declined requests do not notify sender
- [ ] Can block sender from request screen

#### US-07: Friends List
**As a** player  
**I want to** view and manage my friends  
**So that** I can stay connected with gaming partners

**Acceptance Criteria:**
- [ ] List all friends with online status
- [ ] Search/filter friends by name
- [ ] See friend's current activity (in session, idle)
- [ ] Sort by: recent activity, name, date added
- [ ] Remove friend option (no notification)
- [ ] Quick invite to session
- [ ] Maximum 500 friends

---

### Block & Safety

#### US-08: Block User
**As a** player  
**I want to** block other users  
**So that** I can protect myself from harassment

**Acceptance Criteria:**
- [ ] Block from profile, session, or any interaction point
- [ ] Blocked users cannot: send friend requests, join your sessions, see your profile
- [ ] You cannot see blocked user's profile or messages
- [ ] Block is silent (user not notified)
- [ ] Manage blocked list in settings
- [ ] Unblock at any time

#### US-09: Mute User
**As a** player  
**I want to** mute users without fully blocking  
**So that** I can reduce unwanted interactions

**Acceptance Criteria:**
- [ ] Muted users' messages hidden in session chat
- [ ] Can still play in same session
- [ ] Mute visible only to you
- [ ] Manage muted list in settings

#### US-10: Report User
**As a** player  
**I want to** report inappropriate behavior  
**So that** the community stays safe

**Acceptance Criteria:**
- [ ] Report categories: harassment, cheating, inappropriate content, spam
- [ ] Optional description (max 500 chars)
- [ ] Can attach session ID for context
- [ ] Reports reviewed by moderation team
- [ ] Reporter notified of action taken (vague)
- [ ] False reports may result in warnings

---

### Looking For Group (LFG)

#### US-11: Create LFG Post
**As a** player  
**I want to** post that I'm looking for a group  
**So that** I can find others to play with

**Acceptance Criteria:**
- [ ] Post type: Looking for Players (LFP) or Looking for Seer (LFS)
- [ ] Specify: adventure/any, date/time, session length
- [ ] Player count needed
- [ ] Experience level preferred (newbie-friendly, experienced)
- [ ] Play style tags
- [ ] Optional description (max 300 chars)
- [ ] Posts expire after 7 days or when filled
- [ ] Max 3 active posts per user

#### US-12: Browse LFG
**As a** player  
**I want to** browse LFG posts  
**So that** I can find games to join

**Acceptance Criteria:**
- [ ] Filter by: type (LFP/LFS), time, experience level, play style
- [ ] Sort by: newest, soonest, most responses
- [ ] Show poster's profile summary
- [ ] Show response count
- [ ] Quick respond button
- [ ] Real-time updates as posts are filled

#### US-13: Respond to LFG
**As a** player  
**I want to** respond to LFG posts  
**So that** I can join groups

**Acceptance Criteria:**
- [ ] Send interest with optional message
- [ ] Poster sees all responses
- [ ] Poster can accept/decline responses
- [ ] Accepted responders notified
- [ ] Post auto-closes when full
- [ ] Can withdraw response

---

### Groups & Guilds

#### US-14: Create Group
**As a** player  
**I want to** create a gaming group  
**So that** I can organize regular games with friends

**Acceptance Criteria:**
- [ ] Group name (unique, 3-50 chars)
- [ ] Group description (max 1000 chars)
- [ ] Group avatar/banner
- [ ] Privacy: public, private (invite-only), secret (hidden)
- [ ] Maximum 100 members per group
- [ ] Creator becomes owner

#### US-15: Group Membership
**As a** group member  
**I want to** participate in my groups  
**So that** I can coordinate games

**Acceptance Criteria:**
- [ ] View group roster with roles
- [ ] See group activity feed
- [ ] Access group's upcoming sessions
- [ ] Leave group at any time
- [ ] Roles: Owner, Admin, Member
- [ ] Maximum 20 groups per user

#### US-16: Group Management
**As a** group owner/admin  
**I want to** manage my group  
**So that** it stays organized and safe

**Acceptance Criteria:**
- [ ] Invite players to group
- [ ] Remove members
- [ ] Promote/demote members (admins)
- [ ] Edit group info
- [ ] Transfer ownership
- [ ] Delete group (owner only)
- [ ] Set group announcement

#### US-17: Group Session Scheduling
**As a** group member  
**I want to** schedule sessions for my group  
**So that** we can play together regularly

**Acceptance Criteria:**
- [ ] Create session visible to group only
- [ ] Poll for best time (Doodle-style)
- [ ] RSVP: Yes, No, Maybe
- [ ] Reminder notifications
- [ ] Recurring session option (weekly)
- [ ] Link session to specific adventure

---

### Activity & Reputation

#### US-18: Activity Feed
**As a** player  
**I want to** see recent activity  
**So that** I stay connected with my network

**Acceptance Criteria:**
- [ ] Shows: friends joining sessions, completing adventures, earning badges
- [ ] Shows: group announcements, upcoming group sessions
- [ ] Filter by: all, friends, groups
- [ ] Limited to last 7 days
- [ ] Respects privacy settings
- [ ] Can hide specific activity types

#### US-19: Player Ratings
**As a** player  
**I want to** rate players after sessions  
**So that** good players are recognized

**Acceptance Criteria:**
- [ ] Rate players after session ends (optional)
- [ ] Simple rating: Positive, Neutral, or Skip
- [ ] Rate categories: Fun to play with, Good communicator, Reliable
- [ ] Can add private note (not shared)
- [ ] Ratings anonymous to receiver
- [ ] Aggregate shown on profile

#### US-20: Reputation Score
**As a** player  
**I want to** see reputation scores  
**So that** I know who to trust

**Acceptance Criteria:**
- [ ] Score based on: ratings, session completions, reports against
- [ ] Displayed as tier: New, Reliable, Trusted, Exemplary
- [ ] Low reputation triggers warnings to potential groupmates
- [ ] Reputation recoverable over time
- [ ] Not shown for players with <5 sessions

---

### Privacy Controls

#### US-21: Privacy Settings
**As a** player  
**I want to** control my privacy  
**So that** I share only what I'm comfortable with

**Acceptance Criteria:**
- [ ] Profile visibility: Public, Friends Only, Private
- [ ] Stats visibility: separate from profile
- [ ] Activity feed: opt-in/out
- [ ] Discoverability: appear in LFG searches or not
- [ ] Online status: visible, invisible, friends-only
- [ ] Who can send friend requests: anyone, mutual group members, nobody

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SOCIAL HUB                                     │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────┐
  │ Player opens    │
  │ Social Hub      │
  └────────┬────────┘
           │
           ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │ SOCIAL                                         [@username ▼]    │
  │                                                                 │
  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
  │ │ Activity │ │ Friends  │ │  Groups  │ │   LFG    │            │
  │ │   Feed   │ │  (47)    │ │   (3)    │ │  Posts   │            │
  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
  │                                                                 │
  │ ═══════════════════════════════════════════════════════════════│
  │                                                                 │
  │ ACTIVITY FEED                              [Filter: All ▼]      │
  │ ┌─────────────────────────────────────────────────────────────┐│
  │ │ 🏆 @DragonSlayer earned "Master Seer" badge         2h ago ││
  │ │ ⚔️ @WizardFan completed "Crystal Caverns"           4h ago ││
  │ │ 👥 Knights of Valor scheduled session for Saturday  6h ago ││
  │ │ 🎮 @NewbieHero joined their first game!            12h ago ││
  │ └─────────────────────────────────────────────────────────────┘│
  └─────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────┐
  │ FRIENDS                                    [🔍] [+ Add Friend]  │
  │                                                                 │
  │ ONLINE (5)                                                      │
  │ ┌─────────────────────────────────────────────────────────────┐│
  │ │ 🟢 @WizardFan          In Session: Crystal Caverns  [Invite]││
  │ │ 🟢 @DragonSlayer       Browsing Adventures          [Invite]││
  │ └─────────────────────────────────────────────────────────────┘│
  │                                                                 │
  │ OFFLINE (42)                                                    │
  │ ┌─────────────────────────────────────────────────────────────┐│
  │ │ ⚫ @PaladinPete        Last seen: 2 days ago                ││
  │ │ ⚫ @RogueRunner        Last seen: 1 week ago                ││
  │ └─────────────────────────────────────────────────────────────┘│
  └─────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────┐
  │ LOOKING FOR GROUP                          [+ Create Post]      │
  │                                                                 │
  │ Filters: [Any Type ▼] [Any Time ▼] [Any Experience ▼]          │
  │                                                                 │
  │ ┌─────────────────────────────────────────────────────────────┐│
  │ │ 🔍 LOOKING FOR PLAYERS                                      ││
  │ │ @MasterSeer • Crystal Caverns • Tomorrow 7pm EST            ││
  │ │ "Need 2 more for a fun beginner-friendly run!"              ││
  │ │ 🏷️ Casual • Newbie-Friendly                      [Respond] ││
  │ ├─────────────────────────────────────────────────────────────┤│
  │ │ 🎭 LOOKING FOR SEER                                         ││
  │ │ @AdventureParty (3 players) • Any Adventure • Flexible      ││
  │ │ "Experienced group looking for a creative Seer!"            ││
  │ │ 🏷️ Roleplay-Heavy • Experienced              [Respond]     ││
  │ └─────────────────────────────────────────────────────────────┘│
  └─────────────────────────────────────────────────────────────────┘
```

---

## Technical Specification

### Data Models

```typescript
// User Profile
interface UserProfile {
  id: string;
  userId: string;                    // Auth user ID
  displayName: string;               // Unique, 3-30 chars
  avatarUrl: string;
  bio: string;                       // Max 500 chars
  timezone: string;                  // IANA timezone
  availability: Availability[];
  playStyleTags: PlayStyleTag[];
  
  // Stats
  sessionsPlayed: number;
  sessionsRun: number;
  totalPlayTime: number;             // Minutes
  adventuresCompleted: number;
  charactersCreated: number;
  favoriteClass: string;
  
  // Social
  friendCount: number;
  reputationTier: ReputationTier;
  reputationScore: number;           // Internal
  pinnedBadges: string[];            // Badge IDs, max 5
  
  // Privacy
  privacySettings: PrivacySettings;
  
  // Metadata
  createdAt: string;
  lastSeenAt: string;
}

type PlayStyleTag = 
  | 'roleplay-focused'
  | 'combat-focused'
  | 'casual'
  | 'serious'
  | 'newbie-friendly'
  | 'experienced-players';

interface Availability {
  day: 'weekdays' | 'weekends' | 'any';
  time: 'morning' | 'afternoon' | 'evening' | 'night' | 'any';
}

type ReputationTier = 'new' | 'reliable' | 'trusted' | 'exemplary';

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  statsVisibility: 'public' | 'friends' | 'private';
  activityFeed: boolean;
  discoverability: boolean;
  onlineStatus: 'visible' | 'friends' | 'invisible';
  friendRequests: 'anyone' | 'mutuals' | 'nobody';
}

// Badges
interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: 'player' | 'seer' | 'community' | 'milestone';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  criteria: BadgeCriteria;
}

interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
}

// Friends
interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  createdAt: string;
}

interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  message?: string;                  // Max 200 chars
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  respondedAt?: string;
}

// Block & Mute
interface UserBlock {
  id: string;
  userId: string;                    // Blocker
  blockedUserId: string;             // Blocked
  createdAt: string;
}

interface UserMute {
  id: string;
  userId: string;
  mutedUserId: string;
  createdAt: string;
}

// Reports
interface UserReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  category: 'harassment' | 'cheating' | 'inappropriate' | 'spam';
  description?: string;              // Max 500 chars
  sessionId?: string;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  action?: string;
}

// LFG
interface LfgPost {
  id: string;
  authorId: string;
  type: 'lfp' | 'lfs';               // Looking for Players/Seer
  adventureId?: string;              // Specific or null for any
  scheduledFor?: string;             // ISO datetime or null for flexible
  duration: number;                  // Minutes
  playersNeeded: number;
  experienceLevel: 'any' | 'newbie' | 'experienced';
  playStyleTags: PlayStyleTag[];
  description?: string;              // Max 300 chars
  responseCount: number;
  status: 'open' | 'filled' | 'cancelled' | 'expired';
  createdAt: string;
  expiresAt: string;                 // Auto-expire after 7 days
}

interface LfgResponse {
  id: string;
  postId: string;
  responderId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn';
  createdAt: string;
}

// Groups
interface Group {
  id: string;
  name: string;                      // Unique, 3-50 chars
  description: string;               // Max 1000 chars
  avatarUrl?: string;
  bannerUrl?: string;
  privacy: 'public' | 'private' | 'secret';
  ownerId: string;
  memberCount: number;
  announcement?: string;
  createdAt: string;
  updatedAt: string;
}

interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

interface GroupInvite {
  id: string;
  groupId: string;
  inviterId: string;
  inviteeId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

// Ratings
interface PlayerRating {
  id: string;
  sessionId: string;
  raterId: string;
  ratedUserId: string;
  rating: 'positive' | 'neutral';
  categories: RatingCategory[];      // What was good
  privateNote?: string;
  createdAt: string;
}

type RatingCategory = 'fun' | 'communicator' | 'reliable';

// Activity
interface ActivityEvent {
  id: string;
  userId: string;
  type: ActivityType;
  data: Record<string, any>;
  visibility: 'public' | 'friends' | 'group';
  groupId?: string;
  createdAt: string;
}

type ActivityType = 
  | 'session_completed'
  | 'badge_earned'
  | 'achievement_unlocked'
  | 'group_joined'
  | 'session_scheduled';
```

### Database Schema

```sql
-- User profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(30) UNIQUE NOT NULL,
  avatar_url TEXT,
  bio VARCHAR(500),
  timezone VARCHAR(50),
  availability JSONB DEFAULT '[]',
  play_style_tags TEXT[] DEFAULT '{}',
  sessions_played INTEGER DEFAULT 0,
  sessions_run INTEGER DEFAULT 0,
  total_play_time INTEGER DEFAULT 0,
  adventures_completed INTEGER DEFAULT 0,
  characters_created INTEGER DEFAULT 0,
  favorite_class VARCHAR(50),
  friend_count INTEGER DEFAULT 0,
  reputation_tier VARCHAR(20) DEFAULT 'new',
  reputation_score INTEGER DEFAULT 0,
  pinned_badges UUID[] DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_display_name ON user_profiles(display_name);
CREATE INDEX idx_profiles_reputation ON user_profiles(reputation_tier);

-- Badges
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  category VARCHAR(50) NOT NULL,
  rarity VARCHAR(20) NOT NULL,
  criteria JSONB NOT NULL
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Friendships (symmetric: store both directions)
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_friendships_user ON friendships(user_id);

CREATE TABLE friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message VARCHAR(200),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE(sender_id, receiver_id)
);

-- Blocks and mutes
CREATE TABLE user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id)
);

CREATE TABLE user_mutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  muted_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, muted_user_id)
);

-- Reports
CREATE TABLE user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  description VARCHAR(500),
  session_id UUID,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  action TEXT
);

-- LFG posts
CREATE TABLE lfg_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL,
  adventure_id UUID,
  scheduled_for TIMESTAMPTZ,
  duration INTEGER NOT NULL,
  players_needed INTEGER NOT NULL,
  experience_level VARCHAR(20) DEFAULT 'any',
  play_style_tags TEXT[] DEFAULT '{}',
  description VARCHAR(300),
  response_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_lfg_status ON lfg_posts(status);
CREATE INDEX idx_lfg_expires ON lfg_posts(expires_at);

CREATE TABLE lfg_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES lfg_posts(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message VARCHAR(300),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, responder_id)
);

-- Groups
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(1000),
  avatar_url TEXT,
  banner_url TEXT,
  privacy VARCHAR(20) DEFAULT 'public',
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  member_count INTEGER DEFAULT 1,
  announcement TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_groups_privacy ON groups(privacy);

CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE group_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, invitee_id)
);

-- Ratings
CREATE TABLE player_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  rater_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rated_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating VARCHAR(20) NOT NULL,
  categories TEXT[] DEFAULT '{}',
  private_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, rater_id, rated_user_id)
);

-- Activity feed
CREATE TABLE activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  data JSONB DEFAULT '{}',
  visibility VARCHAR(20) DEFAULT 'friends',
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON activity_events(user_id);
CREATE INDEX idx_activity_created ON activity_events(created_at);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lfg_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Profile visibility based on privacy settings (simplified)
CREATE POLICY "Profiles viewable based on privacy"
  ON user_profiles FOR SELECT
  USING (
    privacy_settings->>'profileVisibility' = 'public'
    OR auth.uid() = user_id
    OR (
      privacy_settings->>'profileVisibility' = 'friends'
      AND EXISTS (
        SELECT 1 FROM friendships
        WHERE user_id = auth.uid() AND friend_id = user_profiles.user_id
      )
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Block filtering
CREATE OR REPLACE FUNCTION is_blocked(viewer_id UUID, target_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_blocks
    WHERE (user_id = viewer_id AND blocked_user_id = target_id)
       OR (user_id = target_id AND blocked_user_id = viewer_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### API Endpoints

#### Profiles

```
GET    /api/v1/social/profile                    # Get own profile
GET    /api/v1/social/profile/:userId            # Get user profile
PATCH  /api/v1/social/profile                    # Update own profile
GET    /api/v1/social/profile/:userId/badges     # Get user badges
```

#### Friends

```
GET    /api/v1/social/friends                    # List friends
POST   /api/v1/social/friends/request            # Send friend request
GET    /api/v1/social/friends/requests           # List pending requests
POST   /api/v1/social/friends/requests/:id/accept
POST   /api/v1/social/friends/requests/:id/decline
DELETE /api/v1/social/friends/:friendId          # Remove friend
```

#### Blocks & Mutes

```
GET    /api/v1/social/blocks                     # List blocked users
POST   /api/v1/social/blocks                     # Block user
DELETE /api/v1/social/blocks/:userId             # Unblock user
GET    /api/v1/social/mutes                      # List muted users
POST   /api/v1/social/mutes                      # Mute user
DELETE /api/v1/social/mutes/:userId              # Unmute user
```

#### Reports

```
POST   /api/v1/social/reports                    # Submit report
```

#### LFG

```
GET    /api/v1/social/lfg                        # List LFG posts
POST   /api/v1/social/lfg                        # Create LFG post
GET    /api/v1/social/lfg/:id                    # Get LFG post details
DELETE /api/v1/social/lfg/:id                    # Cancel own post
POST   /api/v1/social/lfg/:id/respond            # Respond to post
DELETE /api/v1/social/lfg/:id/respond            # Withdraw response
POST   /api/v1/social/lfg/:id/accept/:responseId # Accept response
POST   /api/v1/social/lfg/:id/decline/:responseId
```

#### Groups

```
GET    /api/v1/social/groups                     # List user's groups
POST   /api/v1/social/groups                     # Create group
GET    /api/v1/social/groups/:id                 # Get group details
PATCH  /api/v1/social/groups/:id                 # Update group
DELETE /api/v1/social/groups/:id                 # Delete group
GET    /api/v1/social/groups/:id/members         # List members
POST   /api/v1/social/groups/:id/invite          # Invite user
POST   /api/v1/social/groups/:id/join            # Join public group
DELETE /api/v1/social/groups/:id/leave           # Leave group
DELETE /api/v1/social/groups/:id/members/:userId # Remove member
PATCH  /api/v1/social/groups/:id/members/:userId # Change role
```

#### Activity & Ratings

```
GET    /api/v1/social/activity                   # Get activity feed
POST   /api/v1/social/ratings                    # Submit rating
GET    /api/v1/social/ratings/pending            # Get sessions to rate
```

---

## Reputation Algorithm

```typescript
function calculateReputationScore(userId: string): number {
  const positiveRatings = countRatings(userId, 'positive');
  const neutralRatings = countRatings(userId, 'neutral');
  const sessionsCompleted = getSessionsCompleted(userId);
  const reportsAgainst = getReportsActioned(userId);
  
  // Base score from sessions
  let score = Math.min(sessionsCompleted * 2, 100);
  
  // Bonus from positive ratings
  score += positiveRatings * 5;
  
  // Small bonus from neutral (at least not negative)
  score += neutralRatings * 1;
  
  // Penalty from reports
  score -= reportsAgainst * 20;
  
  return Math.max(0, Math.min(score, 500));
}

function getReputationTier(score: number, sessions: number): ReputationTier {
  if (sessions < 5) return 'new';
  if (score >= 200) return 'exemplary';
  if (score >= 100) return 'trusted';
  if (score >= 30) return 'reliable';
  return 'new';
}
```

---

## Component Architecture

```typescript
// Social Hub
<SocialHub>
  <SocialTabs>
    <ActivityFeed />
    <FriendsList />
    <GroupsList />
    <LfgBrowser />
  </SocialTabs>
</SocialHub>

// Profile components
<UserProfile userId={id}>
  <ProfileHeader />
  <ProfileStats />
  <BadgeShowcase />
  <ReputationBadge />
  <ActionButtons />   {/* Add Friend, Block, Report */}
</UserProfile>

// Friends components
<FriendsList>
  <FriendSearch />
  <OnlineFriends />
  <OfflineFriends />
</FriendsList>

<FriendRequestsModal>
  <RequestList />
</FriendRequestsModal>

// LFG components
<LfgBrowser>
  <LfgFilters />
  <LfgPostList />
</LfgBrowser>

<CreateLfgModal>
  <LfgForm />
</CreateLfgModal>

// Group components
<GroupPage groupId={id}>
  <GroupHeader />
  <GroupAnnouncement />
  <MemberRoster />
  <GroupSessions />
</GroupPage>
```

---

## Real-time Features

### Online Status

```typescript
// Presence channel via Supabase Realtime
const presenceChannel = supabase.channel('online-users')
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState();
    updateOnlineUsers(state);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({
        odOnlineUserId: user.id,
        lastSeen: new Date().toISOString(),
      });
    }
  });
```

### LFG Updates

```typescript
// Subscribe to LFG changes
const lfgChannel = supabase.channel('lfg-updates')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'lfg_posts' },
    (payload) => handleLfgUpdate(payload)
  )
  .subscribe();
```

---

## Testing Requirements

### Unit Tests
- Reputation calculation algorithm
- Privacy setting enforcement
- Friend request validation
- Block/mute filtering

### Integration Tests
- Friend request flow (send → accept → friends)
- Block prevents all interaction
- LFG post lifecycle
- Group creation and management

### E2E Tests
- Complete profile setup flow
- LFG post → response → session creation
- Group invite → join → participate
- Rate player after session

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Users with completed profiles | 70% |
| Users with 1+ friends | 50% |
| LFG posts filled within 24h | 60% |
| Active groups (1+ session/month) | 40% |
| Positive rating percentage | 85%+ |
| Reports per 1000 sessions | <5 |

---

## Future Considerations

- Direct messaging (encrypted)
- Voice chat integration
- Tournament/event system
- Public group discovery
- Achievement leaderboards
- Community challenges
- Mentorship program (experienced → new players)
- Verified creator badges
