// SPARC RPG Mobile Types

export interface Character {
  id: string;
  userId: string;
  name: string;
  class: CharacterClass;
  level: number;
  stats: CharacterStats;
  abilities: Ability[];
  equipment: Equipment[];
  notes: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type CharacterClass =
  | 'warrior'
  | 'wizard'
  | 'rogue'
  | 'cleric'
  | 'ranger'
  | 'bard';

export interface CharacterStats {
  might: number;
  grace: number;
  wit: number;
  heart: number;
  currentHp: number;
  maxHp: number;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  rechargeTrigger?: string;
  isUsed: boolean;
}

export interface Equipment {
  id: string;
  name: string;
  description?: string;
  quantity: number;
}

export interface CachedCharacter {
  id: string;
  data: Character;
  lastSynced: string;
  localChanges: boolean;
  version: number;
}

export interface Session {
  id: string;
  name: string;
  description?: string;
  seerName: string;
  seerId: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  inviteCode: string;
  maxPlayers: number;
  currentPlayers: number;
}

export interface NotificationPreferences {
  sessionReminder24h: boolean;
  sessionReminder1h: boolean;
  turnAlerts: boolean;
  sessionInvites: boolean;
  dndStart: string;
  dndEnd: string;
  dndEnabled: boolean;
}

export interface DiceRollGesture {
  type: 'swipe' | 'shake' | 'tap';
  sensitivity: 'low' | 'medium' | 'high';
  hapticEnabled: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}
