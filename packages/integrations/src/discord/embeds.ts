/**
 * Discord embed builders for SPARC RPG
 */

import { EMBED_COLORS, type Attribute, type RSVPStatus } from './types';
import type { DiceRollResult, SessionInfo } from '../types';

// ============================================================================
// Embed Types
// ============================================================================

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface EmbedFooter {
  text: string;
  icon_url?: string;
}

export interface EmbedAuthor {
  name: string;
  url?: string;
  icon_url?: string;
}

export interface EmbedThumbnail {
  url: string;
}

export interface EmbedImage {
  url: string;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: EmbedFooter;
  author?: EmbedAuthor;
  thumbnail?: EmbedThumbnail;
  image?: EmbedImage;
  fields?: EmbedField[];
}

// ============================================================================
// Dice Roll Embeds
// ============================================================================

const ATTRIBUTE_EMOJIS: Record<Attribute, string> = {
  might: '💪',
  grace: '🎯',
  wit: '🧠',
  heart: '❤️',
};

const DICE_EMOJIS = ['', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];

export function buildRollEmbed(
  roll: DiceRollResult,
  characterAvatar?: string
): DiscordEmbed {
  const emoji = ATTRIBUTE_EMOJIS[roll.attribute as Attribute] || '🎲';
  const diceDisplay = roll.results.map(d => DICE_EMOJIS[d] || `${d}`).join(' ');
  
  let resultText: string;
  let color: number;
  
  if (roll.isCritical) {
    resultText = '⭐ CRITICAL SUCCESS!';
    color = EMBED_COLORS.critical;
  } else if (roll.isFumble) {
    resultText = '💀 FUMBLE!';
    color = EMBED_COLORS.failure;
  } else if (roll.success) {
    resultText = `✅ SUCCESS (+${roll.margin})`;
    color = EMBED_COLORS.success;
  } else {
    resultText = `❌ FAILURE (${roll.margin})`;
    color = EMBED_COLORS.failure;
  }

  const embed: DiscordEmbed = {
    title: `${roll.characterName} rolls ${emoji} ${capitalize(roll.attribute)}!`,
    description: `**Difficulty:** ${roll.difficulty}`,
    color,
    fields: [
      {
        name: '🎲 Dice',
        value: diceDisplay,
        inline: true,
      },
      {
        name: '📊 Total',
        value: `**${roll.total}**`,
        inline: true,
      },
      {
        name: '📋 Result',
        value: resultText,
        inline: true,
      },
    ],
    footer: {
      text: 'SPARC RPG',
    },
    timestamp: new Date().toISOString(),
  };

  if (characterAvatar) {
    embed.thumbnail = { url: characterAvatar };
  }

  return embed;
}

// ============================================================================
// Session Embeds
// ============================================================================

export function buildSessionAnnouncementEmbed(
  session: SessionInfo,
  rsvps?: Array<{ username: string; status: RSVPStatus }>
): DiscordEmbed {
  const fields: EmbedField[] = [];

  if (session.scheduledAt) {
    const timestamp = Math.floor(new Date(session.scheduledAt).getTime() / 1000);
    fields.push({
      name: '📅 When',
      value: `<t:${timestamp}:F>\n(<t:${timestamp}:R>)`,
      inline: true,
    });
  }

  fields.push({
    name: '🎭 Seer',
    value: session.seerName,
    inline: true,
  });

  fields.push({
    name: '👥 Players',
    value: `${session.currentPlayers}/${session.maxPlayers}`,
    inline: true,
  });

  if (session.campaignName) {
    fields.push({
      name: '📖 Campaign',
      value: session.campaignName,
      inline: true,
    });
  }

  if (rsvps && rsvps.length > 0) {
    const attending = rsvps.filter(r => r.status === 'yes').map(r => r.username);
    const maybe = rsvps.filter(r => r.status === 'maybe').map(r => r.username);
    const declined = rsvps.filter(r => r.status === 'no').map(r => r.username);

    if (attending.length > 0) {
      fields.push({
        name: '✅ Attending',
        value: attending.join('\n') || 'None yet',
        inline: true,
      });
    }
    if (maybe.length > 0) {
      fields.push({
        name: '🤔 Maybe',
        value: maybe.join('\n') || 'None',
        inline: true,
      });
    }
    if (declined.length > 0) {
      fields.push({
        name: '❌ Declined',
        value: declined.join('\n') || 'None',
        inline: true,
      });
    }
  }

  return {
    title: `🎲 ${session.name}`,
    description: session.description || 'No description provided.',
    color: EMBED_COLORS.sparc,
    fields,
    footer: {
      text: 'React to RSVP: ✅ Yes | 🤔 Maybe | ❌ No',
    },
    timestamp: new Date().toISOString(),
  };
}

export function buildSessionReminderEmbed(
  session: SessionInfo,
  minutesUntil: number
): DiscordEmbed {
  const timeText = minutesUntil >= 60 
    ? `${Math.floor(minutesUntil / 60)} hour(s)` 
    : `${minutesUntil} minutes`;

  return {
    title: `⏰ Session Starting Soon!`,
    description: `**${session.name}** begins in **${timeText}**!`,
    color: EMBED_COLORS.warning,
    fields: [
      {
        name: '🎭 Seer',
        value: session.seerName,
        inline: true,
      },
      {
        name: '📖 Campaign',
        value: session.campaignName || 'One-shot',
        inline: true,
      },
    ],
    footer: {
      text: 'SPARC RPG',
    },
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// LFG Embeds
// ============================================================================

export interface LfgEmbedData {
  username: string;
  role: 'player' | 'seer' | 'either';
  timezone: string;
  availability: string;
  experience?: 'new' | 'intermediate' | 'experienced';
  avatarUrl?: string;
}

const EXPERIENCE_TEXT = {
  new: '🌱 New to SPARC',
  intermediate: '📚 Some Experience',
  experienced: '⭐ Experienced',
};

const ROLE_TEXT = {
  player: '🎭 Looking to Play',
  seer: '📖 Looking to Run',
  either: '🎲 Player or Seer',
};

export function buildLfgEmbed(data: LfgEmbedData): DiscordEmbed {
  const fields: EmbedField[] = [
    {
      name: '🎯 Role',
      value: ROLE_TEXT[data.role],
      inline: true,
    },
    {
      name: '🌍 Timezone',
      value: data.timezone,
      inline: true,
    },
    {
      name: '📅 Availability',
      value: data.availability,
      inline: false,
    },
  ];

  if (data.experience) {
    fields.push({
      name: '📊 Experience',
      value: EXPERIENCE_TEXT[data.experience],
      inline: true,
    });
  }

  return {
    title: `${data.username} is Looking for Group!`,
    color: EMBED_COLORS.info,
    fields,
    footer: {
      text: 'React 👋 to show interest • Expires in 7 days',
    },
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// Character Embeds
// ============================================================================

export interface CharacterEmbedData {
  name: string;
  class: string;
  level?: number;
  avatarUrl?: string;
  attributes: {
    might: number;
    grace: number;
    wit: number;
    heart: number;
  };
  hp?: { current: number; max: number };
}

export function buildCharacterEmbed(character: CharacterEmbedData): DiscordEmbed {
  const fields: EmbedField[] = [
    {
      name: '💪 Might',
      value: `${character.attributes.might}`,
      inline: true,
    },
    {
      name: '🎯 Grace',
      value: `${character.attributes.grace}`,
      inline: true,
    },
    {
      name: '🧠 Wit',
      value: `${character.attributes.wit}`,
      inline: true,
    },
    {
      name: '❤️ Heart',
      value: `${character.attributes.heart}`,
      inline: true,
    },
  ];

  if (character.hp) {
    fields.push({
      name: '💚 HP',
      value: `${character.hp.current}/${character.hp.max}`,
      inline: true,
    });
  }

  const embed: DiscordEmbed = {
    title: character.name,
    description: `**${character.class}**${character.level ? ` • Level ${character.level}` : ''}`,
    color: EMBED_COLORS.sparc,
    fields,
    footer: {
      text: 'SPARC RPG Character',
    },
  };

  if (character.avatarUrl) {
    embed.thumbnail = { url: character.avatarUrl };
  }

  return embed;
}

// ============================================================================
// Error Embeds
// ============================================================================

export function buildErrorEmbed(
  title: string,
  message: string
): DiscordEmbed {
  return {
    title: `❌ ${title}`,
    description: message,
    color: EMBED_COLORS.failure,
    footer: {
      text: 'SPARC RPG',
    },
  };
}

export function buildSuccessEmbed(
  title: string,
  message: string
): DiscordEmbed {
  return {
    title: `✅ ${title}`,
    description: message,
    color: EMBED_COLORS.success,
    footer: {
      text: 'SPARC RPG',
    },
  };
}

// ============================================================================
// Utility
// ============================================================================

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
