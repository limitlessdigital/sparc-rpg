// Root Layout
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/stores/authStore';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useCharacterStore } from '../src/stores/characterStore';
import { colors } from '../src/utils/theme';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const loadSession = useAuthStore((state) => state.loadSession);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const loadCachedCharacters = useCharacterStore((state) => state.loadCachedCharacters);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    async function init() {
      try {
        // Load all persisted data
        await Promise.all([
          loadSession(),
          loadSettings(),
          loadCachedCharacters(),
        ]);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    init();
  }, []);

  if (isLoading) {
    return null; // Splash screen is still visible
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background.secondary,
          },
          headerTintColor: colors.text.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: colors.background.primary,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="login"
          options={{
            title: 'Sign In',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="character/[id]"
          options={{
            title: 'Character',
          }}
        />
        <Stack.Screen
          name="session/[id]"
          options={{
            title: 'Session',
          }}
        />
        <Stack.Screen
          name="session/join"
          options={{
            title: 'Join Session',
            presentation: 'modal',
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
