/**
 * Discord slash command definitions
 */

import { z } from 'zod';

// ============================================================================
// Command Definitions (for Discord API registration)
// ============================================================================

export interface SlashCommandOption {
  name: string;
  description: string;
  type: number; // Discord ApplicationCommandOptionType
  required?: boolean;
  choices?: Array<{ name: string; value: string | number }>;
  min_value?: number;
  max_value?: number;
  options?: SlashCommandOption[];
}

export interface SlashCommandDefinition {
  name: string;
  description: string;
  options?: SlashCommandOption[];
  default_member_permissions?: string;
  dm_permission?: boolean;
}

// Discord option types
const STRING = 3;
const INTEGER = 4;
const SUBCOMMAND = 1;

// ============================================================================
// SPARC Command Definitions
// ============================================================================

export const SPARC_COMMANDS: SlashCommandDefinition[] = [
  {
    name: 'sparc',
    description: 'SPARC RPG commands',
    options: [
      // Roll subcommand
      {
        name: 'roll',
        description: 'Roll dice for an attribute check',
        type: SUBCOMMAND,
        options: [
          {
            name: 'attribute',
            description: 'The attribute to roll',
            type: STRING,
            required: true,
            choices: [
              { name: 'Might', value: 'might' },
              { name: 'Grace', value: 'grace' },
              { name: 'Wit', value: 'wit' },
              { name: 'Heart', value: 'heart' },
            ],
          },
          {
            name: 'difficulty',
            description: 'Target difficulty (3-18)',
            type: INTEGER,
            required: true,
            min_value: 3,
            max_value: 18,
          },
          {
            name: 'modifier',
            description: 'Bonus or penalty (-10 to +10)',
            type: INTEGER,
            required: false,
            min_value: -10,
            max_value: 10,
          },
        ],
      },
      
      // Character subcommand
      {
        name: 'character',
        description: 'Manage your linked SPARC character',
        type: SUBCOMMAND,
        options: [
          {
            name: 'action',
            description: 'What to do with your character',
            type: STRING,
            required: true,
            choices: [
              { name: 'Link a character', value: 'link' },
              { name: 'View linked character', value: 'view' },
              { name: 'Unlink character', value: 'unlink' },
              { name: 'Set default character', value: 'set-default' },
            ],
          },
        ],
      },
      
      // Session subcommand
      {
        name: 'session',
        description: 'Manage game sessions',
        type: SUBCOMMAND,
        options: [
          {
            name: 'action',
            description: 'Session action',
            type: STRING,
            required: true,
            choices: [
              { name: 'Create a session', value: 'create' },
              { name: 'Announce session', value: 'announce' },
              { name: 'Send reminder', value: 'remind' },
              { name: 'List sessions', value: 'list' },
            ],
          },
        ],
      },
      
      // LFG subcommand
      {
        name: 'lfg',
        description: 'Find or post looking-for-group listings',
        type: SUBCOMMAND,
        options: [
          {
            name: 'role',
            description: 'What role are you looking for?',
            type: STRING,
            required: true,
            choices: [
              { name: 'Looking to play (as player)', value: 'player' },
              { name: 'Looking to run (as Seer)', value: 'seer' },
              { name: 'Either role', value: 'either' },
            ],
          },
          {
            name: 'timezone',
            description: 'Your timezone (e.g., EST, PST, UTC+1)',
            type: STRING,
            required: true,
          },
          {
            name: 'availability',
            description: 'When are you available? (e.g., "Weekends, evenings")',
            type: STRING,
            required: true,
          },
          {
            name: 'experience',
            description: 'Your experience level',
            type: STRING,
            required: false,
            choices: [
              { name: 'New to SPARC', value: 'new' },
              { name: 'Some experience', value: 'intermediate' },
              { name: 'Experienced player', value: 'experienced' },
            ],
          },
        ],
      },
      
      // Setup subcommand (admin only)
      {
        name: 'setup',
        description: 'Configure SPARC for this server (admin only)',
        type: SUBCOMMAND,
      },
    ],
    dm_permission: false,
  },
];

// ============================================================================
// Command Input Validation Schemas
// ============================================================================

export const RollInputSchema = z.object({
  attribute: z.enum(['might', 'grace', 'wit', 'heart']),
  difficulty: z.number().int().min(3).max(18),
  modifier: z.number().int().min(-10).max(10).optional(),
});

export const LfgInputSchema = z.object({
  role: z.enum(['player', 'seer', 'either']),
  timezone: z.string().min(1).max(50),
  availability: z.string().min(1).max(200),
  experience: z.enum(['new', 'intermediate', 'experienced']).optional(),
});

export const SessionInputSchema = z.object({
  action: z.enum(['create', 'announce', 'remind', 'list']),
  sessionId: z.string().optional(),
});

export const CharacterInputSchema = z.object({
  action: z.enum(['link', 'view', 'unlink', 'set-default']),
  characterId: z.string().optional(),
});

// ============================================================================
// Command Handler Interface
// ============================================================================

export interface CommandContext {
  guildId: string;
  channelId: string;
  userId: string;
  username: string;
  isAdmin: boolean;
}

export interface CommandResult {
  success: boolean;
  ephemeral?: boolean;
  content?: string;
  embed?: Record<string, unknown>;
  components?: Array<Record<string, unknown>>;
}

export type CommandHandler<T> = (
  input: T,
  context: CommandContext
) => Promise<CommandResult>;
