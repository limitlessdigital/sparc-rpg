// Session Card for List View
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../utils/theme';
import type { Session } from '../types';

interface SessionCardProps {
  session: Session;
  onPress?: () => void;
  onJoin?: () => void;
}

const STATUS_COLORS = {
  scheduled: colors.info,
  active: colors.success,
  completed: colors.text.muted,
  cancelled: colors.error,
};

const STATUS_LABELS = {
  scheduled: 'Scheduled',
  active: 'Live Now',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function SessionCard({ session, onPress, onJoin }: SessionCardProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'TBD';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: STATUS_COLORS[session.status] },
          ]}
        >
          <Text style={styles.statusText}>{STATUS_LABELS[session.status]}</Text>
        </View>
        <Text style={styles.players}>
          👥 {session.currentPlayers}/{session.maxPlayers}
        </Text>
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {session.name}
      </Text>
      
      <Text style={styles.seer}>Seer: {session.seerName}</Text>

      {session.description && (
        <Text style={styles.description} numberOfLines={2}>
          {session.description}
        </Text>
      )}

      <View style={styles.footer}>
        <Text style={styles.dateText}>
          📅 {formatDate(session.scheduledAt || session.startedAt)}
        </Text>

        {session.status === 'active' && onJoin && (
          <Pressable style={styles.joinButton} onPress={onJoin}>
            <Text style={styles.joinButtonText}>Join Now</Text>
          </Pressable>
        )}

        {session.status === 'scheduled' && (
          <Text style={styles.codeText}>Code: {session.inviteCode}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  players: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  name: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  seer: {
    fontSize: fontSizes.sm,
    color: colors.primary[400],
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.background.tertiary,
    paddingTop: spacing.sm,
  },
  dateText: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
  },
  codeText: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
    fontFamily: 'monospace',
  },
  joinButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  joinButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
