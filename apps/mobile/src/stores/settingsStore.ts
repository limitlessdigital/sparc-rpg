// Settings Store
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NotificationPreferences, DiceRollGesture } from '../types';

interface SettingsState {
  notifications: NotificationPreferences;
  diceGesture: DiceRollGesture;
  hapticEnabled: boolean;
  biometricUnlock: boolean;
  isDarkMode: boolean;

  // Actions
  loadSettings: () => Promise<void>;
  updateNotifications: (updates: Partial<NotificationPreferences>) => Promise<void>;
  updateDiceGesture: (updates: Partial<DiceRollGesture>) => Promise<void>;
  toggleHaptic: () => Promise<void>;
  toggleBiometric: () => Promise<void>;
  toggleDarkMode: () => Promise<void>;
}

const SETTINGS_KEY = 'sparc_settings';

const defaultNotifications: NotificationPreferences = {
  sessionReminder24h: true,
  sessionReminder1h: true,
  turnAlerts: true,
  sessionInvites: true,
  dndStart: '22:00',
  dndEnd: '08:00',
  dndEnabled: false,
};

const defaultDiceGesture: DiceRollGesture = {
  type: 'swipe',
  sensitivity: 'medium',
  hapticEnabled: true,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  notifications: defaultNotifications,
  diceGesture: defaultDiceGesture,
  hapticEnabled: true,
  biometricUnlock: false,
  isDarkMode: true,

  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        set({
          notifications: settings.notifications ?? defaultNotifications,
          diceGesture: settings.diceGesture ?? defaultDiceGesture,
          hapticEnabled: settings.hapticEnabled ?? true,
          biometricUnlock: settings.biometricUnlock ?? false,
          isDarkMode: settings.isDarkMode ?? true,
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },

  updateNotifications: async (updates) => {
    const current = get();
    const notifications = { ...current.notifications, ...updates };
    set({ notifications });
    await saveSettings(get());
  },

  updateDiceGesture: async (updates) => {
    const current = get();
    const diceGesture = { ...current.diceGesture, ...updates };
    set({ diceGesture });
    await saveSettings(get());
  },

  toggleHaptic: async () => {
    set((state) => ({ hapticEnabled: !state.hapticEnabled }));
    await saveSettings(get());
  },

  toggleBiometric: async () => {
    set((state) => ({ biometricUnlock: !state.biometricUnlock }));
    await saveSettings(get());
  },

  toggleDarkMode: async () => {
    set((state) => ({ isDarkMode: !state.isDarkMode }));
    await saveSettings(get());
  },
}));

async function saveSettings(state: SettingsState) {
  await AsyncStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({
      notifications: state.notifications,
      diceGesture: state.diceGesture,
      hapticEnabled: state.hapticEnabled,
      biometricUnlock: state.biometricUnlock,
      isDarkMode: state.isDarkMode,
    })
  );
}
