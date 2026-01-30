// Character Store with Offline Support
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Character, CachedCharacter } from '../types';

interface CharacterState {
  characters: CachedCharacter[];
  selectedCharacterId: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;

  // Actions
  loadCachedCharacters: () => Promise<void>;
  setCharacters: (characters: Character[]) => Promise<void>;
  updateCharacter: (id: string, updates: Partial<Character>) => Promise<void>;
  getCharacter: (id: string) => CachedCharacter | undefined;
  selectCharacter: (id: string | null) => void;
  markAsSynced: () => void;
  syncPendingChanges: () => Promise<void>;
}

const CHARACTERS_KEY = 'sparc_characters';

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: [],
  selectedCharacterId: null,
  isLoading: true,
  isSyncing: false,
  lastSyncedAt: null,

  loadCachedCharacters: async () => {
    try {
      const cached = await AsyncStorage.getItem(CHARACTERS_KEY);
      if (cached) {
        const characters = JSON.parse(cached) as CachedCharacter[];
        set({ characters, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load cached characters:', error);
      set({ isLoading: false });
    }
  },

  setCharacters: async (characters: Character[]) => {
    const cached: CachedCharacter[] = characters.map((char) => ({
      id: char.id,
      data: char,
      lastSynced: new Date().toISOString(),
      localChanges: false,
      version: 1,
    }));
    
    await AsyncStorage.setItem(CHARACTERS_KEY, JSON.stringify(cached));
    set({ characters: cached, isLoading: false, lastSyncedAt: new Date().toISOString() });
  },

  updateCharacter: async (id: string, updates: Partial<Character>) => {
    const { characters } = get();
    const updated = characters.map((char) => {
      if (char.id === id) {
        return {
          ...char,
          data: { ...char.data, ...updates, updatedAt: new Date().toISOString() },
          localChanges: true,
          version: char.version + 1,
        };
      }
      return char;
    });
    
    await AsyncStorage.setItem(CHARACTERS_KEY, JSON.stringify(updated));
    set({ characters: updated });
  },

  getCharacter: (id: string) => {
    return get().characters.find((c) => c.id === id);
  },

  selectCharacter: (id: string | null) => {
    set({ selectedCharacterId: id });
  },

  markAsSynced: () => {
    const { characters } = get();
    const synced = characters.map((char) => ({
      ...char,
      localChanges: false,
      lastSynced: new Date().toISOString(),
    }));
    set({ characters: synced, lastSyncedAt: new Date().toISOString() });
    AsyncStorage.setItem(CHARACTERS_KEY, JSON.stringify(synced));
  },

  syncPendingChanges: async () => {
    const { characters } = get();
    const pending = characters.filter((c) => c.localChanges);
    
    if (pending.length === 0) return;
    
    set({ isSyncing: true });
    
    try {
      // TODO: Implement actual API sync
      // For now, just mark as synced
      await new Promise((resolve) => setTimeout(resolve, 500));
      get().markAsSynced();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      set({ isSyncing: false });
    }
  },
}));
