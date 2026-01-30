/**
 * Twitch chat integration for SPARC commands
 */

import type { TwitchChatCommand, DEFAULT_CHAT_COMMANDS } from './types';
import type { OverlayState } from './types';

// ============================================================================
// Chat Message Types
// ============================================================================

export interface TwitchChatMessage {
  id: string;
  channelId: string;
  userId: string;
  username: string;
  displayName: string;
  message: string;
  isMod: boolean;
  isBroadcaster: boolean;
  isSubscriber: boolean;
  badges: Map<string, string>;
  emotes: Map<string, string[]>;
  timestamp: Date;
}

export interface ChatCommandContext {
  message: TwitchChatMessage;
  args: string[];
  sessionState?: OverlayState;
}

export type ChatCommandHandler = (context: ChatCommandContext) => Promise<string | null>;

// ============================================================================
// Chat Command Registry
// ============================================================================

export class ChatCommandRegistry {
  private commands: Map<string, TwitchChatCommand> = new Map();
  private aliases: Map<string, string> = new Map(); // alias -> command name
  private handlers: Map<string, ChatCommandHandler> = new Map();
  private cooldowns: Map<string, Map<string, number>> = new Map(); // command -> (userId -> lastUsed)

  /**
   * Register a command with its handler
   */
  register(command: TwitchChatCommand, handler: ChatCommandHandler): void {
    this.commands.set(command.name, command);
    this.handlers.set(command.name, handler);
    
    // Register aliases
    for (const alias of command.aliases) {
      this.aliases.set(alias, command.name);
    }
    
    // Initialize cooldown tracking
    this.cooldowns.set(command.name, new Map());
  }

  /**
   * Unregister a command
   */
  unregister(commandName: string): void {
    const command = this.commands.get(commandName);
    if (command) {
      for (const alias of command.aliases) {
        this.aliases.delete(alias);
      }
    }
    this.commands.delete(commandName);
    this.handlers.delete(commandName);
    this.cooldowns.delete(commandName);
  }

  /**
   * Get command by name or alias
   */
  getCommand(nameOrAlias: string): TwitchChatCommand | undefined {
    const commandName = this.aliases.get(nameOrAlias) || nameOrAlias;
    return this.commands.get(commandName);
  }

  /**
   * Check if user is on cooldown for a command
   */
  isOnCooldown(commandName: string, userId: string): boolean {
    const command = this.commands.get(commandName);
    if (!command) return false;

    const cooldownMap = this.cooldowns.get(commandName);
    if (!cooldownMap) return false;

    const lastUsed = cooldownMap.get(userId);
    if (!lastUsed) return false;

    const cooldownMs = command.cooldownSeconds * 1000;
    return Date.now() - lastUsed < cooldownMs;
  }

  /**
   * Record command usage for cooldown
   */
  recordUsage(commandName: string, userId: string): void {
    const cooldownMap = this.cooldowns.get(commandName);
    if (cooldownMap) {
      cooldownMap.set(userId, Date.now());
    }
  }

  /**
   * Process a chat message and execute command if applicable
   */
  async processMessage(context: ChatCommandContext): Promise<string | null> {
    const { message } = context;
    
    // Check if message starts with command prefix
    if (!message.message.startsWith('!')) {
      return null;
    }

    const parts = message.message.slice(1).split(' ');
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    const command = this.getCommand(commandName);
    if (!command || !command.enabled) {
      return null;
    }

    // Check mod-only
    if (command.modOnly && !message.isMod && !message.isBroadcaster) {
      return null;
    }

    // Check cooldown
    if (this.isOnCooldown(command.name, message.userId)) {
      return null; // Silently ignore cooldown
    }

    const handler = this.handlers.get(command.name);
    if (!handler) {
      return null;
    }

    // Execute and record usage
    const result = await handler({ ...context, args });
    this.recordUsage(command.name, message.userId);

    return result;
  }

  /**
   * List all registered commands
   */
  listCommands(): TwitchChatCommand[] {
    return Array.from(this.commands.values());
  }
}

// ============================================================================
// Default Command Handlers
// ============================================================================

export function createDefaultHandlers(): Map<string, ChatCommandHandler> {
  const handlers = new Map<string, ChatCommandHandler>();

  // !sparc - Info command
  handlers.set('sparc', async () => {
    return 'SPARC RPG - A tabletop roleplaying game focused on narrative and meaningful choices. Learn more at https://sparc-rpg.com';
  });

  // !roll - Last roll command
  handlers.set('roll', async ({ sessionState }) => {
    if (!sessionState?.lastRoll) {
      return 'No recent dice rolls to show.';
    }

    const roll = sessionState.lastRoll;
    const result = roll.success ? '✓ Success' : '✗ Failure';
    const special = roll.isCritical ? ' (CRITICAL!)' : roll.isFumble ? ' (Fumble!)' : '';
    
    return `${roll.character} rolled ${roll.attribute}: [${roll.diceResults.join(', ')}] = ${roll.total} vs DC ${roll.difficulty} → ${result}${special}`;
  });

  // !characters - Party list
  handlers.set('characters', async ({ sessionState }) => {
    if (!sessionState?.characters || sessionState.characters.length === 0) {
      return 'No characters in the current session.';
    }

    const charList = sessionState.characters
      .map(c => `${c.name} (${c.hp}/${c.maxHp} HP)`)
      .join(' | ');
    
    return `Current party: ${charList}`;
  });

  // !scene - Current scene
  handlers.set('scene', async ({ sessionState }) => {
    if (!sessionState?.scene) {
      return 'No active scene.';
    }

    return `📍 ${sessionState.scene.title}: ${sessionState.scene.description}`;
  });

  return handlers;
}

// ============================================================================
// Chat Bot Service
// ============================================================================

export interface TwitchChatClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  join(channel: string): Promise<void>;
  part(channel: string): Promise<void>;
  say(channel: string, message: string): Promise<void>;
  onMessage(callback: (message: TwitchChatMessage) => void): void;
}

export class TwitchChatBot {
  private registry: ChatCommandRegistry;
  private channels: Set<string> = new Set();
  private sessionStates: Map<string, OverlayState> = new Map(); // channelId -> state

  constructor(
    private client: TwitchChatClient,
    commands?: TwitchChatCommand[]
  ) {
    this.registry = new ChatCommandRegistry();
    
    // Register default handlers
    const defaultHandlers = createDefaultHandlers();
    const commandsToRegister = commands || ([] as TwitchChatCommand[]);
    
    for (const cmd of commandsToRegister) {
      const handler = defaultHandlers.get(cmd.name);
      if (handler) {
        this.registry.register(cmd, handler);
      }
    }

    // Set up message handler
    this.client.onMessage((message) => {
      void this.handleMessage(message);
    });
  }

  /**
   * Start the chat bot
   */
  async start(): Promise<void> {
    await this.client.connect();
  }

  /**
   * Stop the chat bot
   */
  async stop(): Promise<void> {
    await this.client.disconnect();
    this.channels.clear();
  }

  /**
   * Join a channel
   */
  async joinChannel(channel: string): Promise<void> {
    await this.client.join(channel);
    this.channels.add(channel);
  }

  /**
   * Leave a channel
   */
  async leaveChannel(channel: string): Promise<void> {
    await this.client.part(channel);
    this.channels.delete(channel);
    this.sessionStates.delete(channel);
  }

  /**
   * Update session state for a channel
   */
  updateSessionState(channelId: string, state: OverlayState): void {
    this.sessionStates.set(channelId, state);
  }

  /**
   * Register a custom command
   */
  registerCommand(command: TwitchChatCommand, handler: ChatCommandHandler): void {
    this.registry.register(command, handler);
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(message: TwitchChatMessage): Promise<void> {
    const sessionState = this.sessionStates.get(message.channelId);
    
    const response = await this.registry.processMessage({
      message,
      args: [],
      sessionState,
    });

    if (response) {
      await this.client.say(message.channelId, response);
    }
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createChatCommandRegistry(): ChatCommandRegistry {
  return new ChatCommandRegistry();
}

export function createTwitchChatBot(
  client: TwitchChatClient,
  commands?: TwitchChatCommand[]
): TwitchChatBot {
  return new TwitchChatBot(client, commands);
}
