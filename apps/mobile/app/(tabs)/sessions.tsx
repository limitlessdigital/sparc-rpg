// Sessions Tab
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
import { SessionCard } from '../../src/components';
import { useAuthStore } from '../../src/stores/authStore';
import { sessionsApi } from '../../src/services/api';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../src/utils/theme';
import type { Session } from '../../src/types';

export default function SessionsScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { data: sessions = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await sessionsApi.list();
      if (response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to load sessions');
    },
    enabled: isAuthenticated,
  });

  const activeSessions = sessions.filter((s) => s.status === 'active');
  const upcomingSessions = sessions.filter((s) => s.status === 'scheduled');
  const pastSessions = sessions.filter((s) => s.status === 'completed');

  const handleSessionPress = (session: Session) => {
    router.push(`/session/${session.id}`);
  };

  const handleJoinSession = (session: Session) => {
    router.push(`/session/${session.id}`);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎲</Text>
        <Text style={styles.emptyTitle}>Game Sessions</Text>
        <Text style={styles.emptyText}>Sign in to view your sessions</Text>
        <Pressable style={styles.loginButton} onPress={() => router.push('/login')}>
          <Text style={styles.loginButtonText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  const renderSection = (title: string, data: Session[], emoji: string) => {
    if (data.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {emoji} {title}
        </Text>
        {data.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onPress={() => handleSessionPress(session)}
            onJoin={session.status === 'active' ? () => handleJoinSession(session) : undefined}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={[{ key: 'content' }]}
        keyExtractor={(item) => item.key}
        renderItem={() => (
          <View>
            {renderSection('Live Now', activeSessions, '🔴')}
            {renderSection('Upcoming', upcomingSessions, '📅')}
            {renderSection('Past Sessions', pastSessions, '📜')}
            
            {sessions.length === 0 && !isLoading && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No sessions yet</Text>
              </View>
            )}
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary[500]}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Sessions</Text>
            <Pressable
              style={styles.joinButton}
              onPress={() => router.push('/session/join')}
            >
              <Text style={styles.joinButtonText}>+ Join</Text>
            </Pressable>
          </View>
        }
        contentContainerStyle={styles.listContent}
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
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  joinButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  joinButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text.primary,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyStateText: {
    fontSize: fontSizes.md,
    color: colors.text.muted,
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
});
