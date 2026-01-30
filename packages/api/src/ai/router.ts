/**
 * AI Seer Assistant - tRPC Router
 * API endpoints for AI functionality
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../server";
import {
  getAIAdvice,
  handleShortcode,
  listShortcodes,
  type AISeerAdviceRequest,
  type GameContext,
} from "./index";

// Input validation schemas
const adviceRequestSchema = z.object({
  sessionId: z.string(),
  sceneContext: z.string(),
  playerAction: z.string().min(1).max(500),
  difficultyPreference: z.enum(["easy", "medium", "hard"]).default("medium"),
  recentHistory: z.array(z.string()).optional(),
  characterContext: z
    .object({
      name: z.string(),
      class: z.string(),
      relevantStats: z.record(z.number()),
    })
    .optional(),
});

// Shortcode request schema (used inline below)

// AI Router
export const aiRouter = createTRPCRouter({
  /**
   * Get AI advice for a game situation
   */
  advice: protectedProcedure
    .input(adviceRequestSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session?.user?.id || "anonymous";

      // Build context from session (in real impl, fetch from DB)
      const context = await buildContextFromSession(input.sessionId);

      const request: AISeerAdviceRequest = {
        sessionId: input.sessionId,
        sceneContext: input.sceneContext,
        playerAction: input.playerAction,
        difficultyPreference: input.difficultyPreference,
        recentHistory: input.recentHistory,
        characterContext: input.characterContext,
      };

      const response = await getAIAdvice(request, context, userId);

      return {
        success: true,
        data: response,
      };
    }),

  /**
   * Execute a shortcode command
   */
  shortcode: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        sessionId: z.string(),
        params: z.record(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const context = await buildContextFromSession(input.sessionId);
      const result = handleShortcode(input.code, input.sessionId, context, input.params);

      return {
        success: true,
        data: result,
      };
    }),

  /**
   * List available shortcodes
   */
  shortcodes: protectedProcedure.query(() => {
    return {
      success: true,
      data: listShortcodes(),
    };
  }),

  /**
   * Quick advice (no context required)
   */
  quickAdvice: protectedProcedure
    .input(
      z.object({
        question: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session?.user?.id || "anonymous";

      const request: AISeerAdviceRequest = {
        sessionId: "quick",
        sceneContext: "",
        playerAction: input.question,
        difficultyPreference: "medium",
      };

      const response = await getAIAdvice(request, null, userId);

      return {
        success: true,
        data: response,
      };
    }),
});

/**
 * Build game context from session ID
 * In real implementation, this would fetch from Supabase
 */
async function buildContextFromSession(sessionId: string): Promise<GameContext | null> {
  // Mock context for development
  // TODO: Replace with actual Supabase queries

  if (sessionId === "quick" || !sessionId) {
    return null;
  }

  return {
    session: {
      id: sessionId,
      adventureName: "The Dark Forest",
      status: "active",
    },
    currentNode: {
      id: "node-1",
      title: "The Forest Clearing",
      type: "story",
      content:
        "The party emerges into a moonlit clearing. Ancient stones stand in a circle, covered in moss and strange runes.",
    },
    players: [
      {
        id: "player-1",
        name: "Thorin Ironfist",
        characterClass: "Champion",
        currentHP: 8,
        maxHP: 12,
        attributes: { might: 16, grace: 10, wit: 8, heart: 12 },
        isConnected: true,
      },
      {
        id: "player-2",
        name: "Lira Shadowstep",
        characterClass: "Shadowblade",
        currentHP: 5,
        maxHP: 8,
        attributes: { might: 8, grace: 18, wit: 14, heart: 10 },
        isConnected: true,
      },
      {
        id: "player-3",
        name: "Maximus the Bold",
        characterClass: "Herald",
        currentHP: 6,
        maxHP: 10,
        attributes: { might: 12, grace: 8, wit: 12, heart: 18 },
        isConnected: false,
      },
    ],
    recentHistory: [
      "Party entered the forest",
      "Discovered strange tracks",
      "Heard howling in the distance",
    ],
    inventory: [
      { name: "Healing Potion", quantity: 2 },
      { name: "Torch", quantity: 5 },
      { name: "Gold", quantity: 50 },
    ],
    flags: ["forest_entered", "tracks_discovered"],
  };
}

export type AIRouter = typeof aiRouter;
