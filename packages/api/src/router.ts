import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "./server";
import { aiRouter } from "./ai/router";
import { socialRouter } from "./social/router";
import { campaignRouter } from "./campaign/router";
import { vttRouter } from "./vtt/router";

// Character router
const characterRouter = createTRPCRouter({
  list: protectedProcedure.query(({ ctx: _ctx }) => {
    // TODO: Fetch characters from Supabase using ctx.session.user.id
    return [];
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input: _input, ctx: _ctx }) => {
      // TODO: Fetch character by ID
      return null;
    }),
  
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        class: z.string(),
        attributes: z.record(z.number()).optional(),
      })
    )
    .mutation(({ input, ctx: _ctx }) => {
      // TODO: Create character in Supabase using ctx.session.user.id
      return { id: "placeholder", ...input };
    }),
});

// Session router (game sessions)
const sessionRouter = createTRPCRouter({
  list: protectedProcedure.query(({ ctx: _ctx }) => {
    // TODO: Fetch sessions
    return [];
  }),
  
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
      })
    )
    .mutation(({ input, ctx: _ctx }) => {
      // TODO: Create session
      return { id: "placeholder", ...input };
    }),
});

// Health check router
const healthRouter = createTRPCRouter({
  check: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),
});

// Main app router
export const appRouter = createTRPCRouter({
  health: healthRouter,
  character: characterRouter,
  session: sessionRouter,
  ai: aiRouter,
  social: socialRouter,
  campaign: campaignRouter,
  vtt: vttRouter,
});

export type AppRouter = typeof appRouter;
