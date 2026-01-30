/**
 * Discord bot client and interaction handling
 */

import type {
  DiscordBotConfig,
  DiscordServerConfig,
  DiscordUserLink,
  RollCommandInput,
  LfgPost,
} from './types';
import type { CommandContext, CommandResult } from './commands';
import {
  buildRollEmbed,
  buildLfgEmbed,
  buildCharacterEmbed,
  buildErrorEmbed,
  buildSuccessEmbed,
  type DiscordEmbed,
} from './embeds';
import type { DiceRollResult } from '../types';

// ============================================================================
// Bot State Interface
// ============================================================================

export interface DiscordBotState {
  isReady: boolean;
  guildsCount: number;
  lastPingAt?: Date;
}

// ============================================================================
// Storage Interface (to be implemented by the consumer)
// ============================================================================

export interface DiscordStorage {
  // Server config
  getServerConfig(guildId: string): Promise<DiscordServerConfig | null>;
  saveServerConfig(config: DiscordServerConfig): Promise<void>;
  deleteServerConfig(guildId: string): Promise<void>;
  
  // User linking
  getUserLink(discordUserId: string): Promise<DiscordUserLink | null>;
  saveUserLink(link: DiscordUserLink): Promise<void>;
  deleteUserLink(discordUserId: string): Promise<void>;
  
  // LFG posts
  getLfgPosts(guildId: string): Promise<LfgPost[]>;
  saveLfgPost(post: LfgPost): Promise<void>;
  deleteLfgPost(id: string): Promise<void>;
}

// ============================================================================
// SPARC API Client Interface
// ============================================================================

export interface SparcApiClient {
  // Dice rolling
  rollDice(params: {
    userId: string;
    characterId?: string;
    attribute: string;
    difficulty: number;
    modifier?: number;
  }): Promise<DiceRollResult>;
  
  // Character operations
  getCharacter(characterId: string): Promise<{
    id: string;
    name: string;
    class: string;
    avatarUrl?: string;
    attributes: { might: number; grace: number; wit: number; heart: number };
  } | null>;
  
  listUserCharacters(userId: string): Promise<Array<{
    id: string;
    name: string;
    class: string;
  }>>;
}

// ============================================================================
// Command Handlers
// ============================================================================

export class DiscordCommandHandlers {
  constructor(
    private storage: DiscordStorage,
    private api: SparcApiClient
  ) {}

  async handleRoll(
    input: RollCommandInput,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      // Get user link to find character
      const userLink = await this.storage.getUserLink(context.userId);
      const characterId = input.characterId || userLink?.defaultCharacterId;

      // Execute the roll
      const roll = await this.api.rollDice({
        userId: context.userId,
        characterId,
        attribute: input.attribute,
        difficulty: input.difficulty,
        modifier: input.modifier,
      });

      // Get character avatar if we have a character
      let avatarUrl: string | undefined;
      if (characterId) {
        const character = await this.api.getCharacter(characterId);
        avatarUrl = character?.avatarUrl;
      }

      const embed = buildRollEmbed(roll, avatarUrl);

      return {
        success: true,
        embed: embed as unknown as Record<string, unknown>,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        ephemeral: true,
        embed: buildErrorEmbed('Roll Failed', message) as unknown as Record<string, unknown>,
      };
    }
  }

  async handleCharacterLink(
    _context: CommandContext
  ): Promise<CommandResult> {
    // This would typically open a modal or send a link to the SPARC web app
    return {
      success: true,
      ephemeral: true,
      content: '🔗 **Link Your Character**\n\nVisit https://sparc-rpg.com/link-discord to connect your SPARC account and characters.',
    };
  }

  async handleCharacterView(
    context: CommandContext
  ): Promise<CommandResult> {
    const userLink = await this.storage.getUserLink(context.userId);
    
    if (!userLink || !userLink.defaultCharacterId) {
      return {
        success: false,
        ephemeral: true,
        embed: buildErrorEmbed(
          'No Character Linked',
          'You haven\'t linked a SPARC character yet. Use `/sparc character link` to get started.'
        ) as unknown as Record<string, unknown>,
      };
    }

    const character = await this.api.getCharacter(userLink.defaultCharacterId);
    
    if (!character) {
      return {
        success: false,
        ephemeral: true,
        embed: buildErrorEmbed(
          'Character Not Found',
          'Your linked character could not be found. It may have been deleted.'
        ) as unknown as Record<string, unknown>,
      };
    }

    const embed = buildCharacterEmbed({
      name: character.name,
      class: character.class,
      avatarUrl: character.avatarUrl,
      attributes: character.attributes,
    });

    return {
      success: true,
      embed: embed as unknown as Record<string, unknown>,
    };
  }

  async handleLfg(
    input: {
      role: 'player' | 'seer' | 'either';
      timezone: string;
      availability: string;
      experience?: 'new' | 'intermediate' | 'experienced';
    },
    context: CommandContext
  ): Promise<CommandResult> {
    // Check if server has LFG enabled and configured
    const serverConfig = await this.storage.getServerConfig(context.guildId);
    
    if (!serverConfig?.lfgChannelId) {
      return {
        success: false,
        ephemeral: true,
        embed: buildErrorEmbed(
          'LFG Not Configured',
          'This server doesn\'t have an LFG channel configured. Ask an admin to run `/sparc setup`.'
        ) as unknown as Record<string, unknown>,
      };
    }

    const embed = buildLfgEmbed({
      username: context.username,
      role: input.role,
      timezone: input.timezone,
      availability: input.availability,
      experience: input.experience,
    });

    // The actual posting to the LFG channel would be done by the bot client
    // This returns the embed to be posted
    return {
      success: true,
      embed: embed as unknown as Record<string, unknown>,
    };
  }

  async handleSetup(
    context: CommandContext
  ): Promise<CommandResult> {
    if (!context.isAdmin) {
      return {
        success: false,
        ephemeral: true,
        embed: buildErrorEmbed(
          'Permission Denied',
          'Only server administrators can configure SPARC.'
        ) as unknown as Record<string, unknown>,
      };
    }

    // Return setup instructions
    return {
      success: true,
      ephemeral: true,
      content: `🔧 **SPARC Server Setup**

**Configure channels:**
• Set announcement channel: \`/sparc setup channel announcements #channel\`
• Set LFG channel: \`/sparc setup channel lfg #channel\`
• Set dice channel: \`/sparc setup channel dice #channel\`

**Toggle features:**
• Session announcements: \`/sparc setup toggle announcements\`
• Dice rolling: \`/sparc setup toggle dice\`
• Looking for Group: \`/sparc setup toggle lfg\`

**Advanced:**
Visit https://sparc-rpg.com/discord/settings to configure notification templates and more.`,
    };
  }
}

// ============================================================================
// Bot Client Class
// ============================================================================

export class DiscordBot {
  private config: DiscordBotConfig;
  private storage: DiscordStorage;
  private api: SparcApiClient;
  private handlers: DiscordCommandHandlers;
  private state: DiscordBotState = {
    isReady: false,
    guildsCount: 0,
  };

  constructor(
    config: DiscordBotConfig,
    storage: DiscordStorage,
    api: SparcApiClient
  ) {
    this.config = config;
    this.storage = storage;
    this.api = api;
    this.handlers = new DiscordCommandHandlers(storage, api);
  }

  getConfig(): DiscordBotConfig {
    return this.config;
  }

  getState(): DiscordBotState {
    return { ...this.state };
  }

  /**
   * Process a slash command interaction
   */
  async handleInteraction(interaction: {
    type: string;
    data: {
      name: string;
      options?: Array<{
        name: string;
        value?: string | number;
        options?: Array<{ name: string; value: string | number }>;
      }>;
    };
    guild_id: string;
    channel_id: string;
    member: {
      user: { id: string; username: string };
      permissions: string;
    };
  }): Promise<CommandResult> {
    const context: CommandContext = {
      guildId: interaction.guild_id,
      channelId: interaction.channel_id,
      userId: interaction.member.user.id,
      username: interaction.member.user.username,
      // Check for ADMINISTRATOR permission (0x8)
      isAdmin: (BigInt(interaction.member.permissions) & BigInt(0x8)) !== BigInt(0),
    };

    const subcommand = interaction.data.options?.[0];
    if (!subcommand) {
      return {
        success: false,
        ephemeral: true,
        content: 'Invalid command',
      };
    }

    const options = subcommand.options || [];
    const getOption = (name: string) => options.find(o => o.name === name)?.value;

    switch (subcommand.name) {
      case 'roll':
        return this.handlers.handleRoll(
          {
            attribute: getOption('attribute') as RollCommandInput['attribute'],
            difficulty: getOption('difficulty') as number,
            modifier: getOption('modifier') as number | undefined,
          },
          context
        );

      case 'character': {
        const action = getOption('action');
        if (action === 'link') {
          return this.handlers.handleCharacterLink(context);
        } else if (action === 'view') {
          return this.handlers.handleCharacterView(context);
        }
        return { success: false, content: 'Unknown action' };
      }

      case 'lfg':
        return this.handlers.handleLfg(
          {
            role: getOption('role') as 'player' | 'seer' | 'either',
            timezone: getOption('timezone') as string,
            availability: getOption('availability') as string,
            experience: getOption('experience') as 'new' | 'intermediate' | 'experienced' | undefined,
          },
          context
        );

      case 'setup':
        return this.handlers.handleSetup(context);

      default:
        return {
          success: false,
          ephemeral: true,
          content: 'Unknown command',
        };
    }
  }

  /**
   * Register commands with Discord API
   */
  async registerCommands(): Promise<void> {
    // This would use the Discord REST API to register global or guild commands
    // Implementation depends on whether using discord.js or raw REST
    console.log('Registering SPARC commands with Discord...');
  }

  /**
   * Start the bot (connect to Discord Gateway)
   */
  async start(): Promise<void> {
    // Connect to Discord Gateway
    // This is a placeholder - actual implementation would use discord.js Client
    this.state.isReady = true;
    console.log('SPARC Discord bot started');
  }

  /**
   * Stop the bot
   */
  async stop(): Promise<void> {
    this.state.isReady = false;
    console.log('SPARC Discord bot stopped');
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createDiscordBot(
  config: DiscordBotConfig,
  storage: DiscordStorage,
  api: SparcApiClient
): DiscordBot {
  return new DiscordBot(config, storage, api);
}
