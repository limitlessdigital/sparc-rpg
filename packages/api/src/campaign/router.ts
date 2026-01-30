/**
 * Campaign Management - tRPC Router
 * API endpoints for campaign features (PRD 23)
 */

import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../server";

// ============================================
// Input Schemas
// ============================================

const campaignPrivacySchema = z.enum(['public', 'unlisted', 'invite_only']);
const campaignStatusSchema = z.enum(['active', 'paused', 'completed', 'archived']);
const campaignFrequencySchema = z.enum(['weekly', 'biweekly', 'monthly', 'irregular']);
const campaignRoleSchema = z.enum(['owner', 'co_seer', 'player', 'spectator']);
const sessionStatusSchema = z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']);
const rsvpStatusSchema = z.enum(['yes', 'no', 'maybe', 'pending']);
const arcStatusSchema = z.enum(['upcoming', 'active', 'completed']);
const wikiCategorySchema = z.enum(['npc', 'location', 'item', 'lore', 'faction', 'other']);
const wikiVisibilitySchema = z.enum(['public', 'seer_only']);

const campaignSettingsSchema = z.object({
  maxPlayers: z.number().min(2).max(8).optional(),
  sessionDuration: z.number().min(30).max(480).optional(),
  frequency: campaignFrequencySchema.optional(),
  timezone: z.string().optional(),
  requireApproval: z.boolean().optional(),
  minPlayersToRun: z.number().min(1).max(8).optional(),
  absentXpPolicy: z.enum(['full', 'half', 'none']).optional(),
  reminderHours: z.array(z.number()).optional(),
});

const createCampaignSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(2000).optional(),
  bannerUrl: z.string().url().optional(),
  privacy: campaignPrivacySchema,
  settings: campaignSettingsSchema.optional(),
  templateId: z.string().optional(),
});

const updateCampaignSchema = z.object({
  campaignId: z.string(),
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(2000).optional(),
  bannerUrl: z.string().url().optional(),
  privacy: campaignPrivacySchema.optional(),
  settings: campaignSettingsSchema.optional(),
  status: campaignStatusSchema.optional(),
});

const createSessionSchema = z.object({
  campaignId: z.string(),
  title: z.string().max(200).optional(),
  adventureId: z.string().optional(),
  arcId: z.string().optional(),
  scheduledFor: z.string().datetime().optional(),
});

const updateSessionSchema = z.object({
  sessionId: z.string(),
  title: z.string().max(200).optional(),
  adventureId: z.string().optional(),
  arcId: z.string().optional(),
  scheduledFor: z.string().datetime().optional(),
  status: sessionStatusSchema.optional(),
});

const createArcSchema = z.object({
  campaignId: z.string(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  parentArcId: z.string().optional(),
});

const updateArcSchema = z.object({
  arcId: z.string(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: arcStatusSchema.optional(),
  progress: z.number().min(0).max(100).optional(),
});

const createWikiPageSchema = z.object({
  campaignId: z.string(),
  title: z.string().min(1).max(200),
  category: wikiCategorySchema,
  content: z.string(),
  visibility: wikiVisibilitySchema.optional(),
});

const updateWikiPageSchema = z.object({
  pageId: z.string(),
  title: z.string().min(1).max(200).optional(),
  category: wikiCategorySchema.optional(),
  content: z.string().optional(),
  visibility: wikiVisibilitySchema.optional(),
});

const createNoteSchema = z.object({
  campaignId: z.string(),
  title: z.string().max(200).optional(),
  content: z.string(),
  sessionId: z.string().optional(),
});

const createInviteSchema = z.object({
  campaignId: z.string(),
  inviteeId: z.string().optional(),
  role: campaignRoleSchema.optional(),
  expiresInDays: z.number().min(1).max(30).optional(),
});

const sessionRecapSchema = z.object({
  summary: z.string(),
  keyMoments: z.array(z.object({
    characterId: z.string(),
    characterName: z.string().optional(),
    description: z.string(),
    type: z.enum(['combat', 'roleplay', 'discovery', 'failure', 'heroic']),
  })),
  npcsEncountered: z.array(z.string()),
  cliffhanger: z.string().optional(),
});

// ============================================
// Campaign Router
// ============================================

const campaignCrudRouter = createTRPCRouter({
  // List user's campaigns
  list: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Fetch from Supabase using ctx.session.user.id
    const mockCampaigns = [
      {
        id: 'campaign-1',
        name: "The Dragon's Shadow",
        description: 'A dark force stirs in the northern mountains.',
        bannerUrl: undefined,
        ownerId: ctx.session?.user?.id || 'user-1',
        ownerName: 'TestSeer',
        inviteCode: 'ABC123XY',
        privacy: 'invite_only',
        settings: {
          maxPlayers: 4,
          sessionDuration: 120,
          frequency: 'weekly',
          timezone: 'America/New_York',
          requireApproval: true,
          minPlayersToRun: 2,
          absentXpPolicy: 'half',
          reminderHours: [24, 1],
        },
        sessionCount: 12,
        totalPlayTime: 1440,
        playerCount: 4,
        currentArcId: 'arc-1',
        status: 'active',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        lastSessionAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return { success: true, data: mockCampaigns };
  }),

  // Get campaign by ID
  getById: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ input }) => {
      // TODO: Fetch from Supabase, check permissions
      const mockCampaign = {
        id: input.campaignId,
        name: "The Dragon's Shadow",
        description: 'A dark force stirs in the northern mountains. Heroes must band together to uncover the ancient evil before it awakens.',
        bannerUrl: undefined,
        ownerId: 'user-1',
        ownerName: 'TestSeer',
        inviteCode: 'ABC123XY',
        privacy: 'invite_only',
        settings: {
          maxPlayers: 4,
          sessionDuration: 120,
          frequency: 'weekly',
          timezone: 'America/New_York',
          requireApproval: true,
          minPlayersToRun: 2,
          absentXpPolicy: 'half',
          reminderHours: [24, 1],
        },
        sessionCount: 12,
        totalPlayTime: 1440,
        playerCount: 4,
        currentArcId: 'arc-1',
        status: 'active',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        lastSessionAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      return { success: true, data: mockCampaign };
    }),

  // Create campaign
  create: protectedProcedure
    .input(createCampaignSchema)
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Create in Supabase, generate invite code
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      return {
        success: true,
        data: {
          id: 'campaign-new',
          ...input,
          ownerId: 'user-1',
          inviteCode,
          settings: {
            maxPlayers: 4,
            sessionDuration: 120,
            frequency: 'weekly',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            requireApproval: true,
            minPlayersToRun: 2,
            absentXpPolicy: 'half',
            reminderHours: [24, 1],
            ...input.settings,
          },
          sessionCount: 0,
          totalPlayTime: 0,
          playerCount: 1,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }),

  // Update campaign
  update: protectedProcedure
    .input(updateCampaignSchema)
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update in Supabase, check ownership
      return { success: true, data: { campaignId: input.campaignId, updated: true } };
    }),

  // Delete/archive campaign
  archive: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Archive in Supabase
      return { success: true, data: { campaignId: input.campaignId, archived: true } };
    }),

  // Join campaign via invite code
  join: protectedProcedure
    .input(z.object({
      inviteCode: z.string(),
      characterId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Lookup campaign by invite code, add member
      return {
        success: true,
        data: {
          campaignId: 'campaign-found',
          joined: true,
          requiresApproval: false,
        },
      };
    }),

  // Leave campaign
  leave: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Remove member from Supabase
      return { success: true, data: { campaignId: input.campaignId, left: true } };
    }),
});

// ============================================
// Session Router
// ============================================

const sessionRouter = createTRPCRouter({
  // List campaign sessions
  list: protectedProcedure
    .input(z.object({
      campaignId: z.string(),
      status: sessionStatusSchema.optional(),
      limit: z.number().min(1).max(50).optional(),
      cursor: z.string().optional(),
    }))
    .query(async ({ input: _input }) => {
      // TODO: Fetch from Supabase
      const mockSessions = [
        {
          id: 'session-1',
          campaignId: 'campaign-1',
          sessionNumber: 13,
          title: "Into the Dragon's Lair",
          adventureId: 'adv-1',
          adventureName: "The Dragon's Lair",
          arcId: 'arc-1',
          arcName: 'Act II: The Mountain Fortress',
          scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          startedAt: undefined,
          endedAt: undefined,
          duration: undefined,
          status: 'scheduled',
          attendees: [
            { memberId: 'm1', memberName: 'Player1', characterId: 'c1', characterName: 'Lyra', rsvp: 'yes', attended: false },
            { memberId: 'm2', memberName: 'Player2', characterId: 'c2', characterName: 'Theron', rsvp: 'yes', attended: false },
            { memberId: 'm3', memberName: 'Player3', characterId: 'c3', characterName: 'Mira', rsvp: 'maybe', attended: false },
          ],
          recap: undefined,
          seerNotes: undefined,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'session-2',
          campaignId: 'campaign-1',
          sessionNumber: 12,
          title: 'The Fortress Gates',
          adventureId: 'adv-1',
          adventureName: "The Dragon's Lair",
          arcId: 'arc-1',
          arcName: 'Act II: The Mountain Fortress',
          scheduledFor: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 72 * 60 * 1000).toISOString(),
          duration: 72,
          status: 'completed',
          attendees: [
            { memberId: 'm1', memberName: 'Player1', characterId: 'c1', characterName: 'Lyra', rsvp: 'yes', attended: true },
            { memberId: 'm2', memberName: 'Player2', characterId: 'c2', characterName: 'Theron', rsvp: 'yes', attended: true },
            { memberId: 'm3', memberName: 'Player3', characterId: 'c3', characterName: 'Mira', rsvp: 'yes', attended: true },
            { memberId: 'm4', memberName: 'Player4', characterId: 'c4', characterName: 'Eldric', rsvp: 'yes', attended: true },
          ],
          recap: {
            summary: "The party approached the fortress under cover of darkness. Lyra's reconnaissance revealed two guards at the main gate and a possible entry point through the drainage grate.",
            keyMoments: [
              { characterId: 'c1', characterName: 'Lyra', description: 'Critical hit on the alarm crystal', type: 'heroic' },
              { characterId: 'c2', characterName: 'Theron', description: 'Held off three guards single-handedly', type: 'combat' },
            ],
            npcsEncountered: ['Guard Captain Vex', 'The Shadow'],
            cliffhanger: 'As the party reunited in the inner courtyard, the ground trembled. The dragon is awake.',
            generatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            published: true,
          },
          seerNotes: 'Remember: Dragon knows their names now',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      return { success: true, data: mockSessions };
    }),

  // Get session by ID
  getById: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input: _input }) => {
      // TODO: Fetch from Supabase
      return { success: true, data: null };
    }),

  // Create/schedule session
  create: protectedProcedure
    .input(createSessionSchema)
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Create in Supabase
      return {
        success: true,
        data: {
          id: 'session-new',
          ...input,
          sessionNumber: 14,
          status: 'scheduled',
          attendees: [],
          createdAt: new Date().toISOString(),
        },
      };
    }),

  // Update session
  update: protectedProcedure
    .input(updateSessionSchema)
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update in Supabase
      return { success: true, data: { sessionId: input.sessionId, updated: true } };
    }),

  // Cancel session
  cancel: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update status in Supabase
      return { success: true, data: { sessionId: input.sessionId, cancelled: true } };
    }),

  // Start session
  start: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update status, set startedAt
      return { success: true, data: { sessionId: input.sessionId, started: true } };
    }),

  // End session
  end: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update status, set endedAt, calculate duration
      return { success: true, data: { sessionId: input.sessionId, ended: true } };
    }),

  // RSVP for session
  rsvp: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      status: rsvpStatusSchema,
    }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update attendee RSVP in Supabase
      return { success: true, data: { sessionId: input.sessionId, rsvp: input.status } };
    }),

  // Update session recap
  updateRecap: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      recap: sessionRecapSchema,
      publish: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update recap in Supabase
      return { success: true, data: { sessionId: input.sessionId, recapUpdated: true } };
    }),

  // Generate AI recap
  generateRecap: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Call AI service to generate recap
      return {
        success: true,
        data: {
          sessionId: input.sessionId,
          recap: {
            summary: 'AI-generated summary would go here...',
            keyMoments: [],
            npcsEncountered: [],
            cliffhanger: undefined,
            generatedAt: new Date().toISOString(),
            published: false,
          },
        },
      };
    }),
});

// ============================================
// Story Arc Router
// ============================================

const arcRouter = createTRPCRouter({
  // List campaign arcs
  list: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ input: _input }) => {
      // TODO: Fetch from Supabase
      const mockArcs = [
        {
          id: 'arc-1',
          campaignId: 'campaign-1',
          parentArcId: undefined,
          name: 'Act II: The Mountain Fortress',
          description: 'The party must infiltrate the fortress to find the dragon.',
          status: 'active',
          order: 2,
          progress: 67,
          sessions: ['session-10', 'session-11', 'session-12'],
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'arc-2',
          campaignId: 'campaign-1',
          parentArcId: 'arc-1',
          name: "Chapter 5: The Dragon's Lair",
          description: 'Final confrontation with the dragon.',
          status: 'active',
          order: 1,
          progress: 33,
          sessions: ['session-12'],
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      return { success: true, data: mockArcs };
    }),

  // Create arc
  create: protectedProcedure
    .input(createArcSchema)
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Create in Supabase
      return {
        success: true,
        data: {
          id: 'arc-new',
          ...input,
          status: 'upcoming',
          order: 0,
          progress: 0,
          sessions: [],
          createdAt: new Date().toISOString(),
        },
      };
    }),

  // Update arc
  update: protectedProcedure
    .input(updateArcSchema)
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update in Supabase
      return { success: true, data: { arcId: input.arcId, updated: true } };
    }),

  // Delete arc
  delete: protectedProcedure
    .input(z.object({ arcId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Delete from Supabase
      return { success: true, data: { arcId: input.arcId, deleted: true } };
    }),

  // Link session to arc
  linkSession: protectedProcedure
    .input(z.object({
      arcId: z.string(),
      sessionId: z.string(),
    }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update session's arcId and arc's sessions array
      return { success: true, data: { arcId: input.arcId, sessionLinked: true } };
    }),
});

// ============================================
// Wiki Router
// ============================================

const wikiRouter = createTRPCRouter({
  // List wiki pages
  list: protectedProcedure
    .input(z.object({
      campaignId: z.string(),
      category: wikiCategorySchema.optional(),
    }))
    .query(async ({ input: _input }) => {
      // TODO: Fetch from Supabase
      const mockPages = [
        {
          id: 'wiki-1',
          campaignId: 'campaign-1',
          title: "Vexmor the Shadow Dragon",
          slug: 'vexmor-the-shadow-dragon',
          category: 'npc',
          content: '# Vexmor the Shadow Dragon\n\nAn ancient dragon who has slumbered beneath the mountain for centuries...',
          visibility: 'public',
          createdBy: 'user-1',
          createdByName: 'TestSeer',
          updatedBy: 'user-1',
          updatedByName: 'TestSeer',
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          version: 3,
        },
        {
          id: 'wiki-2',
          campaignId: 'campaign-1',
          title: 'The Mountain Fortress',
          slug: 'the-mountain-fortress',
          category: 'location',
          content: '# The Mountain Fortress\n\nA massive stone fortress built into the northern mountains...',
          visibility: 'public',
          createdBy: 'user-1',
          createdByName: 'TestSeer',
          updatedBy: 'user-2',
          updatedByName: 'Player1',
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          version: 5,
        },
      ];

      return { success: true, data: mockPages };
    }),

  // Get page by slug
  getBySlug: protectedProcedure
    .input(z.object({
      campaignId: z.string(),
      slug: z.string(),
    }))
    .query(async ({ input: _input }) => {
      // TODO: Fetch from Supabase
      return { success: true, data: null };
    }),

  // Create page
  create: protectedProcedure
    .input(createWikiPageSchema)
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Create in Supabase, generate slug
      const slug = input.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

      return {
        success: true,
        data: {
          id: 'wiki-new',
          ...input,
          slug,
          visibility: input.visibility || 'public',
          createdBy: 'user-1',
          createdByName: 'TestSeer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
        },
      };
    }),

  // Update page
  update: protectedProcedure
    .input(updateWikiPageSchema)
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update in Supabase, create revision
      return { success: true, data: { pageId: input.pageId, updated: true } };
    }),

  // Delete page
  delete: protectedProcedure
    .input(z.object({ pageId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Delete from Supabase
      return { success: true, data: { pageId: input.pageId, deleted: true } };
    }),

  // Get page history
  history: protectedProcedure
    .input(z.object({ pageId: z.string() }))
    .query(async ({ input: _input }) => {
      // TODO: Fetch revisions from Supabase
      return { success: true, data: [] };
    }),

  // Revert to version
  revert: protectedProcedure
    .input(z.object({
      pageId: z.string(),
      version: z.number(),
    }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Revert in Supabase
      return { success: true, data: { pageId: input.pageId, revertedTo: input.version } };
    }),
});

// ============================================
// Notes Router
// ============================================

const notesRouter = createTRPCRouter({
  // List my notes for campaign
  list: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ input: _input }) => {
      // TODO: Fetch from Supabase (only user's notes)
      const mockNotes = [
        {
          id: 'note-1',
          campaignId: 'campaign-1',
          userId: 'user-1',
          title: 'Session 12 Notes',
          content: "Remember to ask about the Shadow's true identity...",
          isPrivate: true,
          sessionId: 'session-2',
          sessionNumber: 12,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      return { success: true, data: mockNotes };
    }),

  // Create note
  create: protectedProcedure
    .input(createNoteSchema)
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Create in Supabase
      return {
        success: true,
        data: {
          id: 'note-new',
          ...input,
          userId: 'user-1',
          isPrivate: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }),

  // Update note
  update: protectedProcedure
    .input(z.object({
      noteId: z.string(),
      title: z.string().max(200).optional(),
      content: z.string().optional(),
    }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update in Supabase
      return { success: true, data: { noteId: input.noteId, updated: true } };
    }),

  // Delete note
  delete: protectedProcedure
    .input(z.object({ noteId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Delete from Supabase
      return { success: true, data: { noteId: input.noteId, deleted: true } };
    }),
});

// ============================================
// Members Router
// ============================================

const membersRouter = createTRPCRouter({
  // List campaign members
  list: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ input: _input }) => {
      // TODO: Fetch from Supabase
      const mockMembers = [
        {
          id: 'm-1',
          campaignId: 'campaign-1',
          userId: 'user-1',
          userName: 'TestSeer',
          userAvatar: undefined,
          characterId: undefined,
          characterName: undefined,
          role: 'owner',
          joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
        },
        {
          id: 'm-2',
          campaignId: 'campaign-1',
          userId: 'user-2',
          userName: 'Player1',
          userAvatar: undefined,
          characterId: 'c-1',
          characterName: 'Lyra the Swift',
          role: 'player',
          joinedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
        },
        {
          id: 'm-3',
          campaignId: 'campaign-1',
          userId: 'user-3',
          userName: 'Player2',
          userAvatar: undefined,
          characterId: 'c-2',
          characterName: 'Theron the Brave',
          role: 'player',
          joinedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
        },
      ];

      return { success: true, data: mockMembers };
    }),

  // Update member role
  updateRole: protectedProcedure
    .input(z.object({
      memberId: z.string(),
      role: campaignRoleSchema,
    }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update in Supabase (owner only)
      return { success: true, data: { memberId: input.memberId, role: input.role } };
    }),

  // Remove member
  remove: protectedProcedure
    .input(z.object({ memberId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Remove from Supabase
      return { success: true, data: { memberId: input.memberId, removed: true } };
    }),

  // Approve join request
  approveJoin: protectedProcedure
    .input(z.object({ memberId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Update member status
      return { success: true, data: { memberId: input.memberId, approved: true } };
    }),

  // Reject join request
  rejectJoin: protectedProcedure
    .input(z.object({ memberId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Delete pending member
      return { success: true, data: { memberId: input.memberId, rejected: true } };
    }),
});

// ============================================
// Invites Router
// ============================================

const invitesRouter = createTRPCRouter({
  // List pending invites
  list: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ input: _input }) => {
      // TODO: Fetch from Supabase
      return { success: true, data: [] };
    }),

  // Create invite
  create: protectedProcedure
    .input(createInviteSchema)
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Create in Supabase
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const expiresAt = new Date(Date.now() + (input.expiresInDays || 7) * 24 * 60 * 60 * 1000);

      return {
        success: true,
        data: {
          id: 'invite-new',
          ...input,
          code,
          role: input.role || 'player',
          status: 'pending',
          expiresAt: expiresAt.toISOString(),
          createdAt: new Date().toISOString(),
        },
      };
    }),

  // Revoke invite
  revoke: protectedProcedure
    .input(z.object({ inviteId: z.string() }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Delete from Supabase
      return { success: true, data: { inviteId: input.inviteId, revoked: true } };
    }),
});

// ============================================
// Activity Router
// ============================================

const activityRouter = createTRPCRouter({
  // Get campaign activity feed
  list: protectedProcedure
    .input(z.object({
      campaignId: z.string(),
      limit: z.number().min(1).max(50).optional(),
      cursor: z.string().optional(),
    }))
    .query(async ({ input: _input }) => {
      // TODO: Fetch from Supabase
      const mockActivities = [
        {
          id: 'activity-1',
          campaignId: 'campaign-1',
          userId: 'user-2',
          userName: 'Player1',
          userAvatar: undefined,
          type: 'character_updated',
          data: { characterName: 'Lyra the Swift' },
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'activity-2',
          campaignId: 'campaign-1',
          userId: 'user-1',
          userName: 'TestSeer',
          userAvatar: undefined,
          type: 'recap_published',
          data: { sessionNumber: 12 },
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'activity-3',
          campaignId: 'campaign-1',
          userId: 'user-1',
          userName: 'TestSeer',
          userAvatar: undefined,
          type: 'wiki_updated',
          data: { pageTitle: "The Dragon's History" },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      return { success: true, data: mockActivities };
    }),
});

// ============================================
// Templates Router
// ============================================

const templatesRouter = createTRPCRouter({
  // List available templates
  list: publicProcedure
    .input(z.object({
      isOfficial: z.boolean().optional(),
    }).optional())
    .query(async ({ input: _input }) => {
      // TODO: Fetch from Supabase
      const mockTemplates = [
        {
          id: 'template-1',
          name: 'Classic Fantasy Campaign',
          description: 'A traditional fantasy campaign structure with epic story arcs.',
          creatorId: 'system',
          creatorName: 'SPARC RPG',
          isOfficial: true,
          privacy: 'public',
          structure: {
            suggestedArcs: [],
            wikiPages: [],
            settings: {},
          },
          usageCount: 1234,
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      return { success: true, data: mockTemplates };
    }),

  // Get template by ID
  getById: publicProcedure
    .input(z.object({ templateId: z.string() }))
    .query(async ({ input: _input }) => {
      // TODO: Fetch from Supabase
      return { success: true, data: null };
    }),

  // Export campaign as template
  exportFromCampaign: protectedProcedure
    .input(z.object({
      campaignId: z.string(),
      name: z.string().min(3).max(100),
      description: z.string().max(2000).optional(),
      privacy: z.enum(['public', 'private']),
    }))
    .mutation(async ({ input, ctx: _ctx }) => {
      // TODO: Create template from campaign
      return {
        success: true,
        data: {
          id: 'template-new',
          ...input,
          creatorId: 'user-1',
          isOfficial: false,
          structure: {
            suggestedArcs: [],
            wikiPages: [],
            settings: {},
          },
          usageCount: 0,
          createdAt: new Date().toISOString(),
        },
      };
    }),
});

// ============================================
// Main Campaign Router
// ============================================

export const campaignRouter = createTRPCRouter({
  campaigns: campaignCrudRouter,
  sessions: sessionRouter,
  arcs: arcRouter,
  wiki: wikiRouter,
  notes: notesRouter,
  members: membersRouter,
  invites: invitesRouter,
  activity: activityRouter,
  templates: templatesRouter,
});

export type CampaignRouter = typeof campaignRouter;
