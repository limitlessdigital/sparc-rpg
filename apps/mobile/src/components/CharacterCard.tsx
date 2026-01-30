// Character Card Component for List View
import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../utils/theme';
import type { Character } from '../types';

interface CharacterCardProps {
  character: Character;
  hasLocalChanges?: boolean;
  onPress?: () => void;
}

const CLASS_ICONS: Record<string, string> = {
  warrior: '⚔️',
  wizard: '🔮',
  rogue: '🗡️',
  cleric: '✨',
  ranger: '🏹',
  bard: '🎵',
};

export function CharacterCard({ character, hasLocalChanges, onPress }: CharacterCardProps) {
  const healthPercent = (character.stats.currentHp / character.stats.maxHp) * 100;
  
  return (
    <Pressable style={styles.container} onPress={onPress}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {character.imageUrl ? (
          <Image source={{ uri: character.imageUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarIcon}>
              {CLASS_ICONS[character.class] || '🎭'}
            </Text>
          </View>
        )}
        {hasLocalChanges && <View style={styles.syncIndicator} />}
      </View>

      {/* Character Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {character.name}
        </Text>
        <Text style={styles.classLevel}>
          {character.class.charAt(0).toUpperCase() + character.class.slice(1)} • Level{' '}
          {character.level}
        </Text>

        {/* Health Bar */}
        <View style={styles.healthBarContainer}>
          <View
            style={[
              styles.healthBar,
              {
                width: `${healthPercent}%`,
                backgroundColor:
                  healthPercent > 50
                    ? colors.success
                    : healthPercent > 25
                    ? colors.warning
                    : colors.error,
              },
            ]}
          />
        </View>
        <Text style={styles.healthText}>
          HP: {character.stats.currentHp}/{character.stats.maxHp}
        </Text>
      </View>

      {/* Stats Preview */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.game.might }]}>
            {character.stats.might}
          </Text>
          <Text style={styles.statLabel}>M</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.game.grace }]}>
            {character.stats.grace}
          </Text>
          <Text style={styles.statLabel}>G</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.game.wit }]}>
            {character.stats.wit}
          </Text>
          <Text style={styles.statLabel}>W</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.game.heart }]}>
            {character.stats.heart}
          </Text>
          <Text style={styles.statLabel}>H</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    ...shadows.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    fontSize: 28,
  },
  syncIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.warning,
    borderWidth: 2,
    borderColor: colors.background.elevated,
  },
  infoContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  classLevel: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  healthBarContainer: {
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  healthBar: {
    height: '100%',
    borderRadius: 2,
  },
  healthText: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'column',
    marginLeft: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 1,
  },
  statValue: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    width: 20,
    textAlign: 'right',
  },
  statLabel: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
    marginLeft: spacing.xs,
  },
});
