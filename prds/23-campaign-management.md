# PRD 23: Campaign Management

> **Status**: Ready for Implementation  
> **Priority**: P1 - High  
> **Estimated Effort**: 7 days  
> **Dependencies**: 04-session-management, 17-database-schema, 18-authentication, 22-social-system

---

## Overview

Campaign Management extends SPARC RPG beyond one-shot sessions to support ongoing, multi-session adventures. It enables Seers and players to track story progression, maintain character continuity, schedule regular games, and preserve the shared narrative history of their adventures.

### Goals
- Support long-term storytelling across multiple sessions
- Maintain character state and progression over time
- Provide tools for campaign organization and scheduling
- Generate AI-powered session recaps for continuity
- Enable collaborative world-building through shared notes
- Make campaign management accessible to new Seers

### Non-Goals
- Custom rule systems or homebrew mechanics
- World map builders or complex cartography
- Voice/video recording of sessions
- Cross-campaign character transfers
- Monetization of campaigns

---

## User Stories

### Campaign Lifecycle

#### US-01: Create Campaign
**As a** Seer  
**I want to** create a campaign  
**So that** I can run an ongoing series of sessions

**Acceptance Criteria:**
- [ ] Campaign name (3-100 characters)
- [ ] Description (max 2000 characters)
- [ ] Campaign artwork/banner (optional)
- [ ] Privacy: public, unlisted, invite-only
- [ ] Adventure template selection (optional starting point)
- [ ] Expected session frequency (weekly, biweekly, monthly, irregular)
- [ ] Expected session duration
- [ ] Maximum players (2-8)
- [ ] Campaign auto-assigned unique invite code

#### US-02: Campaign Dashboard
**As a** Seer  
**I want to** see my campaign overview  
**So that** I can manage all aspects in one place

**Acceptance Criteria:**
- [ ] Campaign header with name, art, description
- [ ] Quick stats: sessions played, total hours, player count
- [ ] Next scheduled session with countdown
- [ ] Recent activity (new notes, character updates)
- [ ] Quick actions: schedule session, invite players, view notes
- [ ] Story arc progress indicator

#### US-03: Join Campaign
**As a** player  
**I want to** join a campaign  
**So that** I can participate in an ongoing story

**Acceptance Criteria:**
- [ ] Join via invite code or link
- [ ] Select existing character or create new
- [ ] See campaign description before joining
- [ ] Seer can approve/reject join requests (if configured)
- [ ] Automatic group creation for campaign players
- [ ] Welcome message from Seer (optional)

#### US-04: Leave Campaign
**As a** player  
**I want to** leave a campaign  
**So that** I can stop participating

**Acceptance Criteria:**
- [ ] Leave with confirmation prompt
- [ ] Character remains in campaign history (retired)
- [ ] Option to make character NPC (Seer controls)
- [ ] Notification sent to Seer
- [ ] Can rejoin if campaign still open

---

### Multi-Session Tracking

#### US-05: Session History
**As a** campaign participant  
**I want to** see all past sessions  
**So that** I can review what happened

**Acceptance Criteria:**
- [ ] List all sessions with date, duration, players present
- [ ] Session status: completed, cancelled, upcoming
- [ ] Click to view session details and recap
- [ ] Filter by date range
- [ ] Show character absences

#### US-06: Session Recap (AI-Generated)
**As a** campaign participant  
**I want to** read AI-generated session summaries  
**So that** I can remember what happened

**Acceptance Criteria:**
- [ ] Auto-generated after session ends
- [ ] Summary includes: key events, decisions, combat outcomes
- [ ] Character highlights (who did what)
- [ ] NPCs encountered
- [ ] Cliffhanger/hooks for next session
- [ ] Seer can edit/approve before publishing
- [ ] Players can add comments/corrections
- [ ] ~300-500 words

#### US-07: Manual Session Notes
**As a** Seer  
**I want to** add my own session notes  
**So that** I can supplement AI recaps

**Acceptance Criteria:**
- [ ] Rich text editor for session notes
- [ ] Can be public (all players) or private (Seer only)
- [ ] Attach images or links
- [ ] Notes linked to specific session
- [ ] Timestamps for organization

---

### Story Arc Progression

#### US-08: Story Arcs
**As a** Seer  
**I want to** define story arcs  
**So that** I can structure the campaign narrative

**Acceptance Criteria:**
- [ ] Create named story arcs (e.g., "The Dragon's Threat")
- [ ] Arc description and goals
- [ ] Mark arc status: upcoming, active, completed
- [ ] Link sessions to arcs
- [ ] Nested arcs (major arc → minor arcs)
- [ ] Visual progress indicator
- [ ] Max 5 active arcs at once

#### US-09: Campaign Timeline
**As a** campaign participant  
**I want to** see a visual timeline  
**So that** I understand the story progression

**Acceptance Criteria:**
- [ ] Chronological view of sessions
- [ ] Story arcs shown as spans
- [ ] Key events marked
- [ ] Character join/leave points
- [ ] In-game vs real-world time option
- [ ] Zoomable timeline

---

### Scheduling

#### US-10: Campaign Calendar
**As a** Seer  
**I want to** schedule sessions in advance  
**So that** players can plan attendance

**Acceptance Criteria:**
- [ ] Calendar view of scheduled sessions
- [ ] Create session with date/time, adventure, notes
- [ ] Recurring sessions (weekly/biweekly/monthly)
- [ ] Integration with external calendars (ICS export)
- [ ] Time zone handling for all players
- [ ] Conflict detection with other campaigns

#### US-11: Session RSVP
**As a** player  
**I want to** RSVP for upcoming sessions  
**So that** the Seer knows who's coming

**Acceptance Criteria:**
- [ ] RSVP options: Yes, No, Maybe
- [ ] Deadline for RSVP (configurable by Seer)
- [ ] Seer sees RSVP summary
- [ ] Reminder notifications before deadline
- [ ] Minimum players required to run (configurable)
- [ ] Auto-cancel if below minimum

#### US-12: Session Reminders
**As a** campaign participant  
**I want to** receive reminders  
**So that** I don't miss sessions

**Acceptance Criteria:**
- [ ] Reminder 24 hours before session
- [ ] Reminder 1 hour before session
- [ ] Customizable reminder timing
- [ ] Push notification, email, or both
- [ ] Include session link and adventure name

---

### Shared Campaign Notes

#### US-13: Campaign Wiki
**As a** campaign participant  
**I want to** access shared campaign notes  
**So that** everyone has the same information

**Acceptance Criteria:**
- [ ] Create wiki pages for: NPCs, locations, items, lore
- [ ] Categories for organization
- [ ] Search within wiki
- [ ] Link between pages (wiki-links)
- [ ] Edit history with rollback
- [ ] Permissions: view-only, edit (per page or global)
- [ ] Template pages for common content types

#### US-14: Player Notes
**As a** player  
**I want to** keep private notes  
**So that** I can track my character's perspective

**Acceptance Criteria:**
- [ ] Personal note space per campaign
- [ ] Only visible to note owner
- [ ] Rich text with sections
- [ ] Link to wiki pages
- [ ] Sync across devices
- [ ] Export option (markdown/PDF)

#### US-15: Seer's Private Notes
**As a** Seer  
**I want to** keep secret notes  
**So that** I can plan surprises

**Acceptance Criteria:**
- [ ] Private notes invisible to players
- [ ] Organize by session, arc, or free-form
- [ ] Mark notes as "revealed" to make public
- [ ] NPC secrets, plot twists, future plans
- [ ] Session prep checklist

---

### Character Progression

#### US-16: Character State Tracking
**As a** player  
**I want to** maintain my character across sessions  
**So that** progress carries over

**Acceptance Criteria:**
- [ ] HP, equipment, abilities persist between sessions
- [ ] Experience points tracked (if using XP)
- [ ] Level progression based on sessions completed
- [ ] Character history (what happened to them)
- [ ] Snapshot character state at session end

#### US-17: Character Growth
**As a** player  
**I want to** see my character's journey  
**So that** I feel a sense of progression

**Acceptance Criteria:**
- [ ] XP history graph
- [ ] Sessions participated list
- [ ] Key moments (first kill, critical fails, heroic saves)
- [ ] Equipment acquired over time
- [ ] Relationships formed (NPCs, other PCs)

#### US-18: Character Absence
**As a** Seer  
**I want to** handle absent players  
**So that** sessions can continue

**Acceptance Criteria:**
- [ ] Mark character as "absent" for session
- [ ] Options: in background, narrative excuse, NPC control
- [ ] Absent characters don't gain XP (configurable)
- [ ] Seer can run absent character if needed
- [ ] Character returns to previous state next session

---

### Campaign Permissions

#### US-19: Permission Levels
**As a** Seer  
**I want to** control who can do what  
**So that** the campaign stays organized

**Acceptance Criteria:**
- [ ] Roles: Owner (Seer), Co-Seer, Player, Spectator
- [ ] Co-Seer: can run sessions, edit wiki, manage players
- [ ] Player: can edit own character, view wiki, add notes
- [ ] Spectator: read-only access to public content
- [ ] Invite links can specify role
- [ ] Transfer ownership to Co-Seer

#### US-20: Campaign Invites
**As a** Seer  
**I want to** invite players  
**So that** the right people can join

**Acceptance Criteria:**
- [ ] Generate invite link with expiration
- [ ] Invite specific users by username
- [ ] Bulk invite from friends list
- [ ] Track pending invites
- [ ] Revoke invites
- [ ] Join approval queue (optional)

---

### Campaign Templates

#### US-21: Use Campaign Template
**As a** Seer  
**I want to** start from a template  
**So that** I don't start from scratch

**Acceptance Criteria:**
- [ ] Browse template library
- [ ] Preview template content (structure, suggested arcs)
- [ ] Clone template to new campaign
- [ ] Templates include: initial wiki pages, arc suggestions
- [ ] Official templates provided
- [ ] Community templates (future)

#### US-22: Save as Template
**As a** Seer  
**I want to** save my campaign as a template  
**So that** others can use my structure

**Acceptance Criteria:**
- [ ] Export campaign structure (not player data)
- [ ] Include: wiki pages, arc structure, notes format
- [ ] Exclude: session history, character data, private notes
- [ ] Name and describe template
- [ ] Share publicly or keep private

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      CAMPAIGN MANAGEMENT FLOW                           │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────┐
  │ Seer creates    │
  │ new campaign    │
  └────────┬────────┘
           │
           ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │ CREATE CAMPAIGN                                                 │
  │                                                                 │
  │ Campaign Name: [The Dragon's Shadow                    ]        │
  │                                                                 │
  │ Description:                                                    │
  │ ┌─────────────────────────────────────────────────────────────┐│
  │ │ A dark force stirs in the northern mountains. Heroes must   ││
  │ │ band together to uncover the ancient evil before it...      ││
  │ └─────────────────────────────────────────────────────────────┘│
  │                                                                 │
  │ [📷 Upload Banner]                                              │
  │                                                                 │
  │ Privacy: (•) Invite Only  ( ) Unlisted  ( ) Public              │
  │ Max Players: [4 ▼]   Session Length: [60 min ▼]                 │
  │ Frequency: [Weekly ▼]                                           │
  │                                                                 │
  │ Template: [Start Fresh ▼]                                       │
  │                                                                 │
  │                                    [Cancel]  [Create Campaign]  │
  └─────────────────────────────────────────────────────────────────┘
           │
           │ Campaign created
           ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │ CAMPAIGN DASHBOARD: The Dragon's Shadow                         │
  │                                                                 │
  │ ┌────────────────────────────────────────────────────────────┐ │
  │ │ [Banner Image]                                              │ │
  │ │                                                             │ │
  │ │ 🎭 4 Players • 📅 12 Sessions • ⏱️ 15 hours played          │ │
  │ └────────────────────────────────────────────────────────────┘ │
  │                                                                 │
  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
  │ │Sessions │ │Timeline │ │  Wiki   │ │ Players │ │Settings │   │
  │ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
  │                                                                 │
  │ NEXT SESSION                               [+ Schedule Session] │
  │ ┌─────────────────────────────────────────────────────────────┐│
  │ │ 📅 Saturday, Feb 3rd at 7:00 PM                             ││
  │ │ Episode 13: Into the Dragon's Lair                          ││
  │ │ RSVPs: ✅ 3 Yes  ❓ 1 Maybe  ❌ 0 No                         ││
  │ │                                   [View Details] [Start]    ││
  │ └─────────────────────────────────────────────────────────────┘│
  │                                                                 │
  │ STORY PROGRESS                                                  │
  │ ┌─────────────────────────────────────────────────────────────┐│
  │ │ Act II: The Mountain Fortress          ████████░░░░ 67%     ││
  │ │   └─ Chapter 5: The Dragon's Lair      ████░░░░░░░░ 33%     ││
  │ └─────────────────────────────────────────────────────────────┘│
  │                                                                 │
  │ RECENT ACTIVITY                                                 │
  │ • @WizardFan updated "Eldric the Wise" character      2h ago   │
  │ • Session 12 recap published                          1d ago   │
  │ • @Seer added wiki page "The Dragon's History"        2d ago   │
  └─────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────┐
  │ SESSION RECAP - Episode 12: The Fortress Gates                  │
  │                                                                 │
  │ 📅 January 27, 2024 • ⏱️ 72 minutes • 👥 4 players              │
  │                                                                 │
  │ ─────────────────────────────────────────────────────────────── │
  │                                                                 │
  │ ## Summary                                                      │
  │                                                                 │
  │ The party approached the fortress under cover of darkness.      │
  │ Lyra's reconnaissance revealed two guards at the main gate      │
  │ and a possible entry point through the drainage grate.          │
  │                                                                 │
  │ After a tense debate, the group split: Theron and Mira          │
  │ created a distraction at the front while Lyra and Eldric        │
  │ slipped through the sewers. The plan nearly failed when         │
  │ Eldric triggered a magical alarm, but Lyra's quick thinking     │
  │ (and a well-placed arrow) saved the day.                        │
  │                                                                 │
  │ ## Key Moments                                                  │
  │ • 🎯 Lyra: Critical hit on the alarm crystal                   │
  │ • ⚔️ Theron: Held off three guards single-handedly              │
  │ • 🔮 Eldric: Discovered the dragon's true name                  │
  │ • 💔 Mira used her last Heroic Save                             │
  │                                                                 │
  │ ## Cliffhanger                                                  │
  │ As the party reunited in the inner courtyard, the ground        │
  │ trembled. The dragon is awake.                                  │
  │                                                                 │
  │ [Edit Recap]  [💬 3 Comments]                                   │
  └─────────────────────────────────────────────────────────────────┘
```

---

## Technical Specification

### Data Models

```typescript
// Campaign
interface Campaign {
  id: string;
  name: string;                      // 3-100 chars
  description: string;               // Max 2000 chars
  bannerUrl?: string;
  ownerId: string;                   // Seer user ID
  inviteCode: string;                // Unique, URL-safe
  privacy: 'public' | 'unlisted' | 'invite_only';
  settings: CampaignSettings;
  
  // Stats
  sessionCount: number;
  totalPlayTime: number;             // Minutes
  playerCount: number;
  
  // Story
  currentArcId?: string;
  
  // Metadata
  status: 'active' | 'paused' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  lastSessionAt?: string;
}

interface CampaignSettings {
  maxPlayers: number;                // 2-8
  sessionDuration: number;           // Minutes
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'irregular';
  timezone: string;
  requireApproval: boolean;          // Join requests need approval
  minPlayersToRun: number;
  absentXpPolicy: 'full' | 'half' | 'none';
  reminderHours: number[];           // e.g., [24, 1]
}

// Campaign Member
interface CampaignMember {
  id: string;
  campaignId: string;
  userId: string;
  characterId?: string;              // Linked character
  role: CampaignRole;
  joinedAt: string;
  status: 'active' | 'inactive' | 'left';
}

type CampaignRole = 'owner' | 'co_seer' | 'player' | 'spectator';

// Campaign Session
interface CampaignSession {
  id: string;
  campaignId: string;
  sessionNumber: number;             // Sequential
  title: string;
  adventureId?: string;
  arcId?: string;
  
  // Scheduling
  scheduledFor?: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number;                 // Actual minutes
  
  // State
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  
  // Attendance
  attendees: SessionAttendee[];
  
  // Recap
  recap?: SessionRecap;
  seerNotes?: string;                // Private
  
  createdAt: string;
}

interface SessionAttendee {
  memberId: string;
  characterId: string;
  rsvp: 'yes' | 'no' | 'maybe' | 'pending';
  attended: boolean;
  rsvpAt?: string;
}

interface SessionRecap {
  summary: string;                   // AI-generated
  keyMoments: KeyMoment[];
  npcsEncountered: string[];
  cliffhanger?: string;
  generatedAt: string;
  editedAt?: string;
  editedBy?: string;
  published: boolean;
}

interface KeyMoment {
  characterId: string;
  description: string;
  type: 'combat' | 'roleplay' | 'discovery' | 'failure' | 'heroic';
}

// Story Arcs
interface StoryArc {
  id: string;
  campaignId: string;
  parentArcId?: string;              // For nested arcs
  name: string;
  description?: string;
  status: 'upcoming' | 'active' | 'completed';
  order: number;                     // Display order
  progress: number;                  // 0-100
  sessions: string[];                // Session IDs in this arc
  createdAt: string;
}

// Campaign Wiki
interface WikiPage {
  id: string;
  campaignId: string;
  title: string;
  slug: string;                      // URL-safe
  category: WikiCategory;
  content: string;                   // Markdown
  visibility: 'public' | 'seer_only';
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

type WikiCategory = 'npc' | 'location' | 'item' | 'lore' | 'faction' | 'other';

interface WikiRevision {
  id: string;
  pageId: string;
  content: string;
  editedBy: string;
  editedAt: string;
  version: number;
}

// Personal Notes
interface CampaignNote {
  id: string;
  campaignId: string;
  userId: string;
  title: string;
  content: string;
  isPrivate: boolean;                // Always true for player notes
  sessionId?: string;                // Link to specific session
  createdAt: string;
  updatedAt: string;
}

// Campaign Invite
interface CampaignInvite {
  id: string;
  campaignId: string;
  inviterId: string;
  inviteeId?: string;                // Null for link invites
  code: string;                      // For link invites
  role: CampaignRole;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: string;
  createdAt: string;
}

// Character State Snapshot
interface CharacterSnapshot {
  id: string;
  characterId: string;
  sessionId: string;
  campaignId: string;
  state: {
    hitPoints: number;
    maxHitPoints: number;
    experience: number;
    level: number;
    equipment: string[];
    abilities: string[];
    conditions: string[];
  };
  takenAt: string;
}

// Campaign Template
interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  isOfficial: boolean;
  privacy: 'public' | 'private';
  structure: {
    suggestedArcs: Partial<StoryArc>[];
    wikiPages: Partial<WikiPage>[];
    settings: Partial<CampaignSettings>;
  };
  usageCount: number;
  createdAt: string;
}
```

### Database Schema

```sql
-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description VARCHAR(2000),
  banner_url TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  invite_code VARCHAR(20) UNIQUE NOT NULL,
  privacy VARCHAR(20) DEFAULT 'invite_only',
  settings JSONB DEFAULT '{}',
  session_count INTEGER DEFAULT 0,
  total_play_time INTEGER DEFAULT 0,
  player_count INTEGER DEFAULT 0,
  current_arc_id UUID,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_session_at TIMESTAMPTZ
);

CREATE INDEX idx_campaigns_owner ON campaigns(owner_id);
CREATE INDEX idx_campaigns_invite ON campaigns(invite_code);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- Campaign members
CREATE TABLE campaign_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id UUID,
  role VARCHAR(20) DEFAULT 'player',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active',
  UNIQUE(campaign_id, user_id)
);

CREATE INDEX idx_members_campaign ON campaign_members(campaign_id);
CREATE INDEX idx_members_user ON campaign_members(user_id);

-- Campaign sessions
CREATE TABLE campaign_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  title VARCHAR(200),
  adventure_id UUID,
  arc_id UUID,
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration INTEGER,
  status VARCHAR(20) DEFAULT 'scheduled',
  attendees JSONB DEFAULT '[]',
  recap JSONB,
  seer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, session_number)
);

CREATE INDEX idx_sessions_campaign ON campaign_sessions(campaign_id);
CREATE INDEX idx_sessions_scheduled ON campaign_sessions(scheduled_for);

-- Story arcs
CREATE TABLE story_arcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  parent_arc_id UUID REFERENCES story_arcs(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'upcoming',
  display_order INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  sessions UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_arcs_campaign ON story_arcs(campaign_id);

-- Wiki pages
CREATE TABLE wiki_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  category VARCHAR(50) DEFAULT 'other',
  content TEXT,
  visibility VARCHAR(20) DEFAULT 'public',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  UNIQUE(campaign_id, slug)
);

CREATE INDEX idx_wiki_campaign ON wiki_pages(campaign_id);
CREATE INDEX idx_wiki_category ON wiki_pages(category);

-- Wiki revisions
CREATE TABLE wiki_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES wiki_pages(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  edited_by UUID NOT NULL REFERENCES auth.users(id),
  edited_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER NOT NULL
);

-- Personal notes
CREATE TABLE campaign_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200),
  content TEXT,
  is_private BOOLEAN DEFAULT true,
  session_id UUID REFERENCES campaign_sessions(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notes_campaign_user ON campaign_notes(campaign_id, user_id);

-- Campaign invites
CREATE TABLE campaign_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id),
  invitee_id UUID REFERENCES auth.users(id),
  code VARCHAR(20),
  role VARCHAR(20) DEFAULT 'player',
  status VARCHAR(20) DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Character snapshots
CREATE TABLE character_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL,
  session_id UUID NOT NULL REFERENCES campaign_sessions(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  state JSONB NOT NULL,
  taken_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_snapshots_character ON character_snapshots(character_id);
CREATE INDEX idx_snapshots_session ON character_snapshots(session_id);

-- Campaign templates
CREATE TABLE campaign_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  is_official BOOLEAN DEFAULT false,
  privacy VARCHAR(20) DEFAULT 'private',
  structure JSONB NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_notes ENABLE ROW LEVEL SECURITY;

-- Campaign visibility
CREATE POLICY "Campaigns viewable based on privacy"
  ON campaigns FOR SELECT
  USING (
    privacy = 'public'
    OR owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM campaign_members
      WHERE campaign_id = campaigns.id AND user_id = auth.uid()
    )
  );

-- Members can view other members
CREATE POLICY "Campaign members visible to participants"
  ON campaign_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = campaign_members.campaign_id
      AND cm.user_id = auth.uid()
    )
  );

-- Wiki visibility based on role and page settings
CREATE POLICY "Wiki pages viewable by members"
  ON wiki_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = wiki_pages.campaign_id
      AND cm.user_id = auth.uid()
      AND (
        wiki_pages.visibility = 'public'
        OR cm.role IN ('owner', 'co_seer')
      )
    )
  );

-- Notes only visible to owner
CREATE POLICY "Notes visible to owner only"
  ON campaign_notes FOR SELECT
  USING (user_id = auth.uid());
```

### API Endpoints

#### Campaigns

```
POST   /api/v1/campaigns                         # Create campaign
GET    /api/v1/campaigns                         # List my campaigns
GET    /api/v1/campaigns/:id                     # Get campaign details
PATCH  /api/v1/campaigns/:id                     # Update campaign
DELETE /api/v1/campaigns/:id                     # Archive campaign
POST   /api/v1/campaigns/:id/join                # Join via invite code
POST   /api/v1/campaigns/:id/leave               # Leave campaign
```

#### Sessions

```
GET    /api/v1/campaigns/:id/sessions            # List sessions
POST   /api/v1/campaigns/:id/sessions            # Schedule session
GET    /api/v1/campaigns/:id/sessions/:sid       # Get session details
PATCH  /api/v1/campaigns/:id/sessions/:sid       # Update session
DELETE /api/v1/campaigns/:id/sessions/:sid       # Cancel session
POST   /api/v1/campaigns/:id/sessions/:sid/rsvp  # RSVP for session
POST   /api/v1/campaigns/:id/sessions/:sid/start # Start session
POST   /api/v1/campaigns/:id/sessions/:sid/end   # End session
GET    /api/v1/campaigns/:id/sessions/:sid/recap # Get recap
PATCH  /api/v1/campaigns/:id/sessions/:sid/recap # Edit recap
```

#### Story Arcs

```
GET    /api/v1/campaigns/:id/arcs                # List arcs
POST   /api/v1/campaigns/:id/arcs                # Create arc
PATCH  /api/v1/campaigns/:id/arcs/:aid           # Update arc
DELETE /api/v1/campaigns/:id/arcs/:aid           # Delete arc
POST   /api/v1/campaigns/:id/arcs/:aid/sessions  # Link session to arc
```

#### Wiki

```
GET    /api/v1/campaigns/:id/wiki                # List wiki pages
POST   /api/v1/campaigns/:id/wiki                # Create page
GET    /api/v1/campaigns/:id/wiki/:slug          # Get page
PATCH  /api/v1/campaigns/:id/wiki/:slug          # Update page
DELETE /api/v1/campaigns/:id/wiki/:slug          # Delete page
GET    /api/v1/campaigns/:id/wiki/:slug/history  # Get revisions
POST   /api/v1/campaigns/:id/wiki/:slug/revert   # Revert to version
```

#### Notes

```
GET    /api/v1/campaigns/:id/notes               # List my notes
POST   /api/v1/campaigns/:id/notes               # Create note
PATCH  /api/v1/campaigns/:id/notes/:nid          # Update note
DELETE /api/v1/campaigns/:id/notes/:nid          # Delete note
```

#### Members & Invites

```
GET    /api/v1/campaigns/:id/members             # List members
PATCH  /api/v1/campaigns/:id/members/:uid        # Update member role
DELETE /api/v1/campaigns/:id/members/:uid        # Remove member
POST   /api/v1/campaigns/:id/invites             # Create invite
GET    /api/v1/campaigns/:id/invites             # List pending invites
DELETE /api/v1/campaigns/:id/invites/:iid        # Revoke invite
```

#### Templates

```
GET    /api/v1/campaign-templates                # List templates
GET    /api/v1/campaign-templates/:id            # Get template
POST   /api/v1/campaign-templates                # Create template
POST   /api/v1/campaigns/:id/export-template     # Export as template
```

---

## AI Session Recap Generation

### Recap Pipeline

```typescript
interface RecapInput {
  sessionId: string;
  campaignContext: {
    name: string;
    currentArc: string;
    previousRecap?: string;
    characterNames: string[];
  };
  sessionData: {
    diceRolls: DiceRoll[];
    combatEvents: CombatEvent[];
    decisions: DecisionEvent[];
    duration: number;
  };
}

async function generateSessionRecap(input: RecapInput): Promise<SessionRecap> {
  const prompt = buildRecapPrompt(input);
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: RECAP_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });
  
  const recap = parseRecapResponse(response);
  return recap;
}

const RECAP_SYSTEM_PROMPT = `
You are a skilled storyteller summarizing a tabletop RPG session.
Write engaging, narrative-style recaps that:
- Highlight character actions and decisions
- Mention key combat moments and outcomes
- Note important discoveries or plot developments
- End with a cliffhanger or hook for the next session
- Use character names, not player names
- Keep the tone consistent with the campaign

Format:
- Summary: 2-3 paragraphs (200-400 words)
- Key Moments: 3-5 bullet points with character attribution
- Cliffhanger: 1-2 sentences teasing what's next

Do NOT include mechanical details (dice numbers, HP values).
`;
```

---

## Component Architecture

```typescript
// Campaign Dashboard
<CampaignDashboard campaignId={id}>
  <CampaignHeader />
  <CampaignTabs>
    <SessionsTab />
    <TimelineTab />
    <WikiTab />
    <PlayersTab />
    <SettingsTab />
  </CampaignTabs>
  <NextSessionCard />
  <StoryProgress />
  <RecentActivity />
</CampaignDashboard>

// Session components
<SessionList campaignId={id}>
  <SessionFilters />
  <SessionCard session={session} />
</SessionList>

<SessionRecap sessionId={id}>
  <RecapSummary />
  <KeyMoments />
  <RecapComments />
</SessionRecap>

// Wiki components
<WikiBrowser campaignId={id}>
  <WikiSidebar categories={categories} />
  <WikiSearch />
  <WikiPageView page={page} />
</WikiBrowser>

<WikiEditor page={page}>
  <MarkdownEditor />
  <WikiLinkSelector />
  <VisibilityToggle />
</WikiEditor>

// Calendar components
<CampaignCalendar campaignId={id}>
  <CalendarView />
  <ScheduleSessionModal />
  <SessionDetailModal />
</CampaignCalendar>

<RsvpWidget session={session}>
  <RsvpButtons />
  <AttendeeList />
</RsvpWidget>
```

---

## Testing Requirements

### Unit Tests
- Campaign creation validation
- Invite code generation uniqueness
- Session number sequencing
- Arc progress calculation
- Recap generation parsing

### Integration Tests
- Full campaign lifecycle (create → sessions → archive)
- Member permission enforcement
- Wiki revision history
- Character state snapshots
- Recap generation pipeline

### E2E Tests
- Create campaign flow
- Join campaign via invite link
- Schedule and RSVP for session
- Edit wiki collaboratively
- View session recap

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Campaigns with 3+ sessions | 40% of campaigns |
| Average sessions per active campaign | 6+ |
| Session RSVP completion rate | 80% |
| Wiki pages created per campaign | 5+ |
| Recap edit rate (Seer corrections) | <30% |
| Player note adoption | 50% of players |

---

## Future Considerations

- Campaign streaming/spectator mode
- Cross-campaign character arcs
- AI-assisted story suggestions
- Campaign achievement system
- Campaign merchandise (art prints, etc.)
- Integration with virtual tabletops
- Campaign export (PDF, ebook format)
- Voice/video session recording and transcription
- Community campaign ratings and reviews
