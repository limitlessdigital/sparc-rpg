// Authentication Store
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  
  // Actions
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

const TOKEN_KEY = 'sparc_auth_token';
const USER_KEY = 'sparc_user';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,

  login: async (user: User, token: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadSession: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userJson = await SecureStore.getItemAsync(USER_KEY);
      
      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      set({ isLoading: false });
    }
  },

  updateUser: (updates: Partial<User>) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, ...updates };
      set({ user: updatedUser });
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));
    }
  },
}));
