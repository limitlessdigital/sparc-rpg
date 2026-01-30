/**
 * @sparc/api VTT Router
 * 
 * tRPC routes for Maps & VTT Lite system.
 * Based on PRD 29.
 */

import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../server';
import {
  createMapInputSchema,
  updateMapInputSchema,
  createTokenInputSchema,
  updateTokenInputSchema,
  updateFogInputSchema,
  createDrawingInputSchema,
  setSessionMapInputSchema,
  type VttMap,
  type SessionMapState,
  type MapToken,
  type Drawing,
} from './types';

// ============================================================================
// In-Memory Storage (Replace with Supabase in production)
// ============================================================================

const maps = new Map<string, VttMap>();
const sessionStates = new Map<string, SessionMapState>();

// ============================================================================
// Map Router
// ============================================================================

export const mapRouter = createTRPCRouter({
  // List user's maps
  list: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.session?.user?.id || 'anonymous';
    return Array.from(maps.values()).filter(
      (map) => map.ownerId === userId || map.isTemplate
    );
  }),

  // Get map by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ input }) => {
      const map = maps.get(input.id);
      if (!map) {
        throw new Error('Map not found');
      }
      return map;
    }),

  // Create new map
  create: protectedProcedure
    .input(createMapInputSchema)
    .mutation(({ input, ctx }) => {
      const userId = ctx.session?.user?.id || 'anonymous';
      const now = new Date().toISOString();

      const map: VttMap = {
        ...input,
        id: uuid(),
        ownerId: userId,
        createdAt: now,
        updatedAt: now,
      };

      maps.set(map.id, map);
      return map;
    }),

  // Update map
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateMapInputSchema,
      })
    )
    .mutation(({ input, ctx }) => {
      const userId = ctx.session?.user?.id || 'anonymous';
      const map = maps.get(input.id);

      if (!map) {
        throw new Error('Map not found');
      }

      if (map.ownerId !== userId) {
        throw new Error('Not authorized to update this map');
      }

      const updated: VttMap = {
        ...map,
        ...input.data,
        updatedAt: new Date().toISOString(),
      };

      maps.set(input.id, updated);
      return updated;
    }),

  // Delete map
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ input, ctx }) => {
      const userId = ctx.session?.user?.id || 'anonymous';
      const map = maps.get(input.id);

      if (!map) {
        throw new Error('Map not found');
      }

      if (map.ownerId !== userId) {
        throw new Error('Not authorized to delete this map');
      }

      maps.delete(input.id);
      return { success: true };
    }),

  // Duplicate map
  duplicate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ input, ctx }) => {
      const userId = ctx.session?.user?.id || 'anonymous';
      const original = maps.get(input.id);

      if (!original) {
        throw new Error('Map not found');
      }

      const now = new Date().toISOString();
      const duplicate: VttMap = {
        ...original,
        id: uuid(),
        ownerId: userId,
        name: `${original.name} (Copy)`,
        isTemplate: false,
        createdAt: now,
        updatedAt: now,
      };

      maps.set(duplicate.id, duplicate);
      return duplicate;
    }),

  // Get templates
  templates: publicProcedure.query(() => {
    return Array.from(maps.values()).filter((map) => map.isTemplate);
  }),
});

// ============================================================================
// Session Map State Router
// ============================================================================

export const sessionMapRouter = createTRPCRouter({
  // Get session map state
  get: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(({ input }) => {
      return sessionStates.get(input.sessionId) || null;
    }),

  // Set session map
  setMap: protectedProcedure
    .input(setSessionMapInputSchema)
    .mutation(({ input }) => {
      const map = maps.get(input.mapId);
      if (!map) {
        throw new Error('Map not found');
      }

      const existingState = sessionStates.get(input.sessionId);

      const state: SessionMapState = existingState
        ? {
            ...existingState,
            mapId: input.mapId,
            fogEnabled: input.fogEnabled,
          }
        : {
            id: uuid(),
            sessionId: input.sessionId,
            mapId: input.mapId,
            fogRevealed: [],
            fogEnabled: input.fogEnabled,
            tokens: [],
            drawings: [],
            activeLayer: 'tokens',
          };

      sessionStates.set(input.sessionId, state);
      return state;
    }),

  // Clear session map
  clear: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(({ input }) => {
      sessionStates.delete(input.sessionId);
      return { success: true };
    }),
});

// ============================================================================
// Token Router
// ============================================================================

export const tokenRouter = createTRPCRouter({
  // Add token
  add: protectedProcedure
    .input(createTokenInputSchema)
    .mutation(({ input, ctx }) => {
      const { sessionId, ...tokenData } = input;
      const state = sessionStates.get(sessionId);

      if (!state) {
        throw new Error('No map loaded for this session');
      }

      const token: MapToken = {
        ...tokenData,
        id: uuid(),
      };

      state.tokens.push(token);
      return token;
    }),

  // Update token
  update: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        tokenId: z.string().uuid(),
        data: updateTokenInputSchema,
      })
    )
    .mutation(({ input }) => {
      const state = sessionStates.get(input.sessionId);

      if (!state) {
        throw new Error('No map loaded for this session');
      }

      const tokenIndex = state.tokens.findIndex((t) => t.id === input.tokenId);
      if (tokenIndex === -1) {
        throw new Error('Token not found');
      }

      state.tokens[tokenIndex] = {
        ...state.tokens[tokenIndex],
        ...input.data,
      };

      return state.tokens[tokenIndex];
    }),

  // Move token
  move: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        tokenId: z.string().uuid(),
        x: z.number().int().min(0),
        y: z.number().int().min(0),
      })
    )
    .mutation(({ input }) => {
      const state = sessionStates.get(input.sessionId);

      if (!state) {
        throw new Error('No map loaded for this session');
      }

      const token = state.tokens.find((t) => t.id === input.tokenId);
      if (!token) {
        throw new Error('Token not found');
      }

      token.x = input.x;
      token.y = input.y;

      return token;
    }),

  // Remove token
  remove: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        tokenId: z.string().uuid(),
      })
    )
    .mutation(({ input }) => {
      const state = sessionStates.get(input.sessionId);

      if (!state) {
        throw new Error('No map loaded for this session');
      }

      state.tokens = state.tokens.filter((t) => t.id !== input.tokenId);
      return { success: true };
    }),
});

// ============================================================================
// Fog Router
// ============================================================================

export const fogRouter = createTRPCRouter({
  // Update fog (reveal/hide/reset)
  update: protectedProcedure.input(updateFogInputSchema).mutation(({ input }) => {
    const state = sessionStates.get(input.sessionId);

    if (!state) {
      throw new Error('No map loaded for this session');
    }

    switch (input.action) {
      case 'reveal':
        if (input.region) {
          state.fogRevealed.push(input.region);
        }
        break;
      case 'hide':
        // In a full implementation, this would subtract the region
        // For simplicity, we'll just not add it
        break;
      case 'reset':
        state.fogRevealed = [];
        break;
    }

    return { revealed: state.fogRevealed };
  }),

  // Toggle fog enabled
  toggle: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        enabled: z.boolean(),
      })
    )
    .mutation(({ input }) => {
      const state = sessionStates.get(input.sessionId);

      if (!state) {
        throw new Error('No map loaded for this session');
      }

      state.fogEnabled = input.enabled;
      return { fogEnabled: state.fogEnabled };
    }),
});

// ============================================================================
// Drawing Router
// ============================================================================

export const drawingRouter = createTRPCRouter({
  // Add drawing
  add: protectedProcedure
    .input(createDrawingInputSchema)
    .mutation(({ input, ctx }) => {
      const { sessionId, ...drawingData } = input;
      const userId = ctx.session?.user?.id || 'anonymous';
      const state = sessionStates.get(sessionId);

      if (!state) {
        throw new Error('No map loaded for this session');
      }

      const drawing: Drawing = {
        ...drawingData,
        id: uuid(),
        createdBy: userId,
        createdAt: new Date().toISOString(),
      };

      state.drawings.push(drawing);
      return drawing;
    }),

  // Remove drawing
  remove: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        drawingId: z.string().uuid(),
      })
    )
    .mutation(({ input }) => {
      const state = sessionStates.get(input.sessionId);

      if (!state) {
        throw new Error('No map loaded for this session');
      }

      state.drawings = state.drawings.filter((d) => d.id !== input.drawingId);
      return { success: true };
    }),

  // Clear drawings
  clear: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        layer: z.enum(['gm', 'drawings']).optional(),
      })
    )
    .mutation(({ input }) => {
      const state = sessionStates.get(input.sessionId);

      if (!state) {
        throw new Error('No map loaded for this session');
      }

      if (input.layer) {
        state.drawings = state.drawings.filter((d) => d.layer !== input.layer);
      } else {
        state.drawings = [];
      }

      return { success: true };
    }),
});

// ============================================================================
// Combined VTT Router
// ============================================================================

export const vttRouter = createTRPCRouter({
  map: mapRouter,
  session: sessionMapRouter,
  token: tokenRouter,
  fog: fogRouter,
  drawing: drawingRouter,
});
