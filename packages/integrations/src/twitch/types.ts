/**
 * Twitch integration types
 */

import { z } from 'zod';

// ============================================================================
// Configuration
// ============================================================================

export const TwitchConfigSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  webhookSecret: z.string(),
  webhookCallbackUrl: z.string().url(),
});
export type TwitchConfig = z.infer<typeof TwitchConfigSchema>;

// ============================================================================
// User Connection
// ============================================================================

export const TwitchUserConnectionSchema = z.object({
  id: z.string(),
  sparcUserId: z.string(),
  twitchUserId: z.string(),
  twitchUsername: z.string(),
  twitchDisplayName: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenExpiresAt: z.string().datetime(),
  scopes: z.array(z.string()),
  isStreamer: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type TwitchUserConnection = z.infer<typeof TwitchUserConnectionSchema>;

// ============================================================================
// Overlay Configuration
// ============================================================================

export const OverlayThemeSchema = z.enum(['dark', 'light', 'transparent', 'custom']);
export type OverlayTheme = z.infer<typeof OverlayThemeSchema>;

export const OverlayComponentsSchema = z.object({
  currentScene: z.boolean().default(true),
  diceRolls: z.boolean().default(true),
  characterBars: z.boolean().default(true),
  turnOrder: z.boolean().default(false),
  chatFeed: z.boolean().default(false),
  timer: z.boolean().default(false),
});
export type OverlayComponents = z.infer<typeof OverlayComponentsSchema>;

export const OverlayPositionSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().min(100).max(1920),
  height: z.number().min(100).max(1080),
});
export type OverlayPosition = z.infer<typeof OverlayPositionSchema>;

export const OverlayConfigSchema = z.object({
  id: z.string(),
  streamerId: z.string(),
  sessionId: z.string().optional(),
  
  // Appearance
  theme: OverlayThemeSchema.default('dark'),
  components: OverlayComponentsSchema,
  position: OverlayPositionSchema.optional(),
  customCss: z.string().optional(),
  
  // Behavior
  animationSpeed: z.enum(['slow', 'normal', 'fast']).default('normal'),
  rollDisplayDuration: z.number().min(1000).max(30000).default(5000),
  autoHideInactive: z.boolean().default(true),
  
  // Access
  overlayToken: z.string(), // For browser source URL authentication
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type OverlayConfig = z.infer<typeof OverlayConfigSchema>;

// ============================================================================
// Overlay State (Real-time data pushed to overlay)
// ============================================================================

export interface OverlaySceneState {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface OverlayCharacterState {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  avatar?: string;
  isActive: boolean;
  conditions?: string[];
}

export interface OverlayRollState {
  id: string;
  character: string;
  characterAvatar?: string;
  attribute: string;
  diceResults: number[];
  total: number;
  difficulty: number;
  success: boolean;
  isCritical: boolean;
  isFumble: boolean;
  timestamp: string;
}

export interface OverlayTurnState {
  currentTurn: string;
  turnOrder: Array<{
    characterId: string;
    characterName: string;
    initiative: number;
  }>;
  round: number;
}

export interface OverlayState {
  sessionId: string;
  isLive: boolean;
  scene?: OverlaySceneState;
  characters: OverlayCharacterState[];
  lastRoll?: OverlayRollState;
  turnState?: OverlayTurnState;
  lastUpdated: string;
}

// ============================================================================
// EventSub Types
// ============================================================================

export const EventSubSubscriptionTypeSchema = z.enum([
  'channel.follow',
  'channel.subscribe',
  'channel.subscription.gift',
  'channel.cheer',
  'channel.raid',
  'channel.channel_points_custom_reward_redemption.add',
  'channel.poll.begin',
  'channel.poll.progress',
  'channel.poll.end',
  'stream.online',
  'stream.offline',
]);
export type EventSubSubscriptionType = z.infer<typeof EventSubSubscriptionTypeSchema>;

export const EventSubSubscriptionSchema = z.object({
  id: z.string(),
  streamerId: z.string(),
  type: EventSubSubscriptionTypeSchema,
  twitchSubscriptionId: z.string(),
  status: z.enum(['enabled', 'disabled', 'webhook_callback_verification_pending', 'webhook_callback_verification_failed']),
  createdAt: z.string().datetime(),
});
export type EventSubSubscription = z.infer<typeof EventSubSubscriptionSchema>;

// ============================================================================
// Channel Point Redemption
// ============================================================================

export const ChannelPointRedemptionSchema = z.object({
  id: z.string(),
  streamerId: z.string(),
  rewardId: z.string(),
  rewardTitle: z.string(),
  
  // What happens when redeemed
  action: z.enum([
    'trigger_random_event',
    'add_modifier',
    'heal_character',
    'damage_character',
    'reroll_dice',
    'custom_webhook',
  ]),
  
  // Action configuration
  actionConfig: z.record(z.unknown()).optional(),
  
  isEnabled: z.boolean().default(true),
  createdAt: z.string().datetime(),
});
export type ChannelPointRedemption = z.infer<typeof ChannelPointRedemptionSchema>;

// ============================================================================
// Chat Command Types
// ============================================================================

export const TwitchChatCommandSchema = z.object({
  name: z.string(),
  aliases: z.array(z.string()).default([]),
  description: z.string(),
  cooldownSeconds: z.number().min(0).max(300).default(10),
  modOnly: z.boolean().default(false),
  enabled: z.boolean().default(true),
});
export type TwitchChatCommand = z.infer<typeof TwitchChatCommandSchema>;

// Default chat commands
export const DEFAULT_CHAT_COMMANDS: TwitchChatCommand[] = [
  {
    name: 'sparc',
    aliases: [],
    description: 'Show SPARC RPG info and link',
    cooldownSeconds: 30,
    modOnly: false,
    enabled: true,
  },
  {
    name: 'roll',
    aliases: ['dice', 'd6'],
    description: 'Show the last dice roll result',
    cooldownSeconds: 5,
    modOnly: false,
    enabled: true,
  },
  {
    name: 'characters',
    aliases: ['party', 'players'],
    description: 'List current session characters',
    cooldownSeconds: 30,
    modOnly: false,
    enabled: true,
  },
  {
    name: 'scene',
    aliases: ['where'],
    description: 'Show current scene description',
    cooldownSeconds: 30,
    modOnly: false,
    enabled: true,
  },
];

// ============================================================================
// Viewer Interaction Types
// ============================================================================

export interface ViewerPoll {
  id: string;
  sessionId: string;
  question: string;
  options: Array<{
    id: string;
    title: string;
    votes: number;
  }>;
  twitchPollId?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  winner?: string;
  createdAt: string;
  endsAt: string;
}

export interface ViewerSuggestion {
  id: string;
  sessionId: string;
  viewerUsername: string;
  suggestion: string;
  status: 'pending' | 'approved' | 'rejected' | 'used';
  createdAt: string;
}
