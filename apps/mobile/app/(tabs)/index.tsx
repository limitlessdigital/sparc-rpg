// Characters Tab
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { CharacterCard } from '../../src/components';
import { useCharacterStore } from '../../src/stores/characterStore';
import { useAuthStore } from '../../src/stores/authStore';
import { charactersApi } from '../../src/services/api';
import { colors, spacing, fontSizes, borderRadius } from '../../src/utils/theme';
import type { Character } from '../../src/types';

export default function CharactersScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const cachedCharacters = useCharacterStore((state) => state.characters);
  const setCharacters = useCharacterStore((state) => state.setCharacters);
  const isSyncing = useCharacterStore((state) => state.isSyncing);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['characters'],
    queryFn: async () => {
      const response = await charactersApi.list();
      if (response.data) {
        await setCharacters(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to load characters');
    },
    enabled: isAuthenticated,
  });

  const characters = data || cachedCharacters.map((c) => c.data);

  const handleCharacterPress = (character: Character) => {
    router.push(`/character/${character.id}`);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎭</Text>
        <Text style={styles.emptyTitle}>Welcome to SPARC RPG</Text>
        <Text style={styles.emptyText}>Sign in to view your characters</Text>
        <Pressable style={styles.loginButton} onPress={() => router.push('/login')}>
          <Text style={styles.loginButtonText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  if (characters.length === 0 && !isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>⚔️</Text>
        <Text style={styles.emptyTitle}>No Characters Yet</Text>
        <Text style={styles.emptyText}>
          Create your first character on the web app, then view it here!
        </Text>
        <Pressable style={styles.refreshButton} onPress={() => refetch()}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isSyncing && (
        <View style={styles.syncBanner}>
          <Text style={styles.syncText}>Syncing changes...</Text>
        </View>
      )}
      
      <FlatList
        data={characters}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const cached = cachedCharacters.find((c) => c.id === item.id);
          return (
            <CharacterCard
              character={item}
              hasLocalChanges={cached?.localChanges}
              onPress={() => handleCharacterPress(item)}
            />
          );
        }}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary[500]}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Characters</Text>
            <Text style={styles.headerSubtitle}>
              {characters.length} character{characters.length !== 1 ? 's' : ''}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  syncBanner: {
    backgroundColor: colors.primary[700],
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  syncText: {
    fontSize: fontSizes.sm,
    color: colors.text.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.primary,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  loginButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  loginButtonText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  refreshButton: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  refreshButtonText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
