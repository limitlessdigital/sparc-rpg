/**
 * @sparc/api VTT Types
 * 
 * Zod schemas and types for VTT API validation.
 */

import { z } from 'zod';

// ============================================================================
// Fog Region Schemas
// ============================================================================

export const fogRectSchema = z.object({
  type: z.literal('rect'),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

export const fogPolygonSchema = z.object({
  type: z.literal('polygon'),
  points: z.array(z.tuple([z.number(), z.number()])),
});

export const fogCircleSchema = z.object({
  type: z.literal('circle'),
  cx: z.number(),
  cy: z.number(),
  radius: z.number(),
});

export const fogRegionSchema = z.discriminatedUnion('type', [
  fogRectSchema,
  fogPolygonSchema,
  fogCircleSchema,
]);

export type FogRegion = z.infer<typeof fogRegionSchema>;

// ============================================================================
// Token Schema
// ============================================================================

export const tokenConditionSchema = z.enum([
  'poisoned',
  'stunned',
  'prone',
  'grappled',
  'restrained',
  'blinded',
  'deafened',
  'frightened',
  'charmed',
  'paralyzed',
  'petrified',
  'invisible',
  'incapacitated',
  'exhausted',
  'concentrating',
]);

export const mapTokenSchema = z.object({
  id: z.string().uuid(),
  characterId: z.string().uuid().optional(),
  name: z.string().min(1).max(50),
  imageUrl: z.string().url().optional(),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  width: z.number().int().min(1).max(3),
  height: z.number().int().min(1).max(3),
  color: z.string(),
  borderColor: z.string(),
  showName: z.boolean(),
  showHpBar: z.boolean(),
  hp: z.number().int().optional(),
  maxHp: z.number().int().optional(),
  conditions: z.array(tokenConditionSchema),
  controlledBy: z.array(z.string().uuid()),
  isHidden: z.boolean(),
});

export type MapToken = z.infer<typeof mapTokenSchema>;

// ============================================================================
// Drawing Schema
// ============================================================================

export const drawingTypeSchema = z.enum(['path', 'line', 'rect', 'circle', 'text']);

export const drawingSchema = z.object({
  id: z.string().uuid(),
  type: drawingTypeSchema,
  layer: z.enum(['gm', 'drawings']),
  strokeColor: z.string(),
  strokeWidth: z.number().min(1).max(20),
  fillColor: z.string().optional(),
  path: z.string().optional(),
  x1: z.number().optional(),
  y1: z.number().optional(),
  x2: z.number().optional(),
  y2: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  radius: z.number().optional(),
  text: z.string().optional(),
  fontSize: z.number().optional(),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export type Drawing = z.infer<typeof drawingSchema>;

// ============================================================================
// Map Schema
// ============================================================================

export const vttMapSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url(),
  imageWidth: z.number().int().min(100).max(8192),
  imageHeight: z.number().int().min(100).max(8192),
  gridColumns: z.number().int().min(4).max(100),
  gridRows: z.number().int().min(4).max(100),
  gridOffsetX: z.number().default(0),
  gridOffsetY: z.number().default(0),
  gridColor: z.string().default('#ffffff'),
  gridOpacity: z.number().min(0).max(1).default(0.3),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  isTemplate: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export type VttMap = z.infer<typeof vttMapSchema>;

// ============================================================================
// Session Map State Schema
// ============================================================================

export const sessionMapStateSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  mapId: z.string().uuid(),
  fogRevealed: z.array(fogRegionSchema),
  fogEnabled: z.boolean(),
  tokens: z.array(mapTokenSchema),
  drawings: z.array(drawingSchema),
  activeLayer: z.enum(['background', 'gm', 'tokens', 'drawings']),
});

export type SessionMapState = z.infer<typeof sessionMapStateSchema>;

// ============================================================================
// Input Schemas
// ============================================================================

export const createMapInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url(),
  imageWidth: z.number().int().min(100).max(8192).default(800),
  imageHeight: z.number().int().min(100).max(8192).default(600),
  gridColumns: z.number().int().min(4).max(100),
  gridRows: z.number().int().min(4).max(100),
  gridOffsetX: z.number().default(0),
  gridOffsetY: z.number().default(0),
  gridColor: z.string().default('#ffffff'),
  gridOpacity: z.number().min(0).max(1).default(0.3),
  isTemplate: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export type CreateMapInput = z.infer<typeof createMapInputSchema>;

export const updateMapInputSchema = createMapInputSchema.partial();
export type UpdateMapInput = z.infer<typeof updateMapInputSchema>;

export const createTokenInputSchema = z.object({
  sessionId: z.string().uuid(),
  characterId: z.string().uuid().optional(),
  name: z.string().min(1).max(50),
  imageUrl: z.string().url().optional(),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  width: z.number().int().min(1).max(3).default(1),
  height: z.number().int().min(1).max(3).default(1),
  color: z.string().default('#22c55e'),
  borderColor: z.string().default('#ffffff'),
  showName: z.boolean().default(true),
  showHpBar: z.boolean().default(false),
  hp: z.number().int().optional(),
  maxHp: z.number().int().optional(),
  conditions: z.array(tokenConditionSchema).default([]),
  controlledBy: z.array(z.string().uuid()).default([]),
  isHidden: z.boolean().default(false),
});

export type CreateTokenInput = z.infer<typeof createTokenInputSchema>;

export const updateTokenInputSchema = createTokenInputSchema.partial().omit({ sessionId: true });
export type UpdateTokenInput = z.infer<typeof updateTokenInputSchema>;

export const updateFogInputSchema = z.object({
  sessionId: z.string().uuid(),
  action: z.enum(['reveal', 'hide', 'reset']),
  region: fogRegionSchema.optional(),
});

export type UpdateFogInput = z.infer<typeof updateFogInputSchema>;

export const createDrawingInputSchema = z.object({
  sessionId: z.string().uuid(),
  type: drawingTypeSchema,
  layer: z.enum(['gm', 'drawings']),
  strokeColor: z.string(),
  strokeWidth: z.number().min(1).max(20),
  fillColor: z.string().optional(),
  path: z.string().optional(),
  x1: z.number().optional(),
  y1: z.number().optional(),
  x2: z.number().optional(),
  y2: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  radius: z.number().optional(),
  text: z.string().optional(),
  fontSize: z.number().optional(),
});

export type CreateDrawingInput = z.infer<typeof createDrawingInputSchema>;

export const setSessionMapInputSchema = z.object({
  sessionId: z.string().uuid(),
  mapId: z.string().uuid(),
  fogEnabled: z.boolean().default(true),
});

export type SetSessionMapInput = z.infer<typeof setSessionMapInputSchema>;
