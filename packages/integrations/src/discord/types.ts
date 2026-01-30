/**
 * Discord integration types
 */

import { z } from 'zod';

// ============================================================================
// Bot Configuration
// ============================================================================

export const DiscordBotConfigSchema = z.object({
  token: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
  publicKey: z.string(),
  guildId: z.string().optional(), // For development guild-specific commands
});
export type DiscordBotConfig = z.infer<typeof DiscordBotConfigSchema>;

// ============================================================================
// Server Configuration
// ============================================================================

export const DiscordServerConfigSchema = z.object({
  id: z.string(),
  guildId: z.string(),
  guildName: z.string(),
  
  // Channel assignments
  announcementChannelId: z.string().optional(),
  lfgChannelId: z.string().optional(),
  diceChannelId: z.string().optional(),
  
  // Features
  features: z.object({
    sessionAnnouncements: z.boolean().default(true),
    diceRolling: z.boolean().default(true),
    lfg: z.boolean().default(true),
    characterLinking: z.boolean().default(true),
  }),
  
  // Notification settings
  notifications: z.object({
    sessionReminders: z.boolean().default(true),
    reminderMinutesBefore: z.array(z.number()).default([60, 15]),
    mentionRole: z.string().optional(),
  }),
  
  // Templates
  templates: z.object({
    sessionAnnouncement: z.string().optional(),
    sessionReminder: z.string().optional(),
    lfgPost: z.string().optional(),
  }),
  
  installedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type DiscordServerConfig = z.infer<typeof DiscordServerConfigSchema>;

// ============================================================================
// User Linking
// ============================================================================

export const DiscordUserLinkSchema = z.object({
  id: z.string(),
  discordUserId: z.string(),
  discordUsername: z.string(),
  sparcUserId: z.string(),
  defaultCharacterId: z.string().optional(),
  linkedAt: z.string().datetime(),
});
export type DiscordUserLink = z.infer<typeof DiscordUserLinkSchema>;

// ============================================================================
// Command Types
// ============================================================================

export const AttributeSchema = z.enum(['might', 'grace', 'wit', 'heart']);
export type Attribute = z.infer<typeof AttributeSchema>;

export const RollCommandInputSchema = z.object({
  attribute: AttributeSchema,
  difficulty: z.number().int().min(3).max(18),
  modifier: z.number().int().min(-10).max(10).optional(),
  characterId: z.string().optional(),
});
export type RollCommandInput = z.infer<typeof RollCommandInputSchema>;

export const CharacterCommandActionSchema = z.enum(['link', 'view', 'unlink', 'set-default']);
export type CharacterCommandAction = z.infer<typeof CharacterCommandActionSchema>;

export const SessionCommandActionSchema = z.enum(['create', 'announce', 'remind', 'list']);
export type SessionCommandAction = z.infer<typeof SessionCommandActionSchema>;

export const LfgRoleSchema = z.enum(['player', 'seer', 'either']);
export type LfgRole = z.infer<typeof LfgRoleSchema>;

export const LfgPostSchema = z.object({
  id: z.string(),
  guildId: z.string(),
  channelId: z.string(),
  messageId: z.string(),
  userId: z.string(),
  role: LfgRoleSchema,
  timezone: z.string(),
  availability: z.string(),
  description: z.string().optional(),
  experienceLevel: z.enum(['new', 'intermediate', 'experienced']).optional(),
  gameStyle: z.array(z.string()).optional(),
  active: z.boolean().default(true),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
});
export type LfgPost = z.infer<typeof LfgPostSchema>;

// ============================================================================
// RSVP Types
// ============================================================================

export const RSVPStatusSchema = z.enum(['yes', 'no', 'maybe', 'pending']);
export type RSVPStatus = z.infer<typeof RSVPStatusSchema>;

export const SessionRSVPSchema = z.object({
  sessionId: z.string(),
  discordUserId: z.string(),
  discordUsername: z.string(),
  status: RSVPStatusSchema,
  respondedAt: z.string().datetime(),
});
export type SessionRSVP = z.infer<typeof SessionRSVPSchema>;

// ============================================================================
// Embed Colors
// ============================================================================

export const EMBED_COLORS = {
  success: 0x2ecc71, // Green
  failure: 0xe74c3c, // Red
  info: 0x3498db,    // Blue
  warning: 0xf39c12, // Orange
  sparc: 0x9b59b6,   // Purple (brand color)
  critical: 0xf1c40f, // Gold
} as const;
