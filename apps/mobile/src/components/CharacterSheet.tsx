// Mobile-Optimized Character Sheet
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
} from 'react-native';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../utils/theme';
import type { Character } from '../types';

interface CharacterSheetProps {
  character: Character;
  onEdit?: () => void;
  onPhotoPress?: () => void;
}

const CLASS_ICONS: Record<string, string> = {
  warrior: '⚔️',
  wizard: '🔮',
  rogue: '🗡️',
  cleric: '✨',
  ranger: '🏹',
  bard: '🎵',
};

export function CharacterSheet({ character, onEdit, onPhotoPress }: CharacterSheetProps) {
  const { stats } = character;
  const healthPercent = (stats.currentHp / stats.maxHp) * 100;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.avatarContainer} onPress={onPhotoPress}>
          {character.imageUrl ? (
            <Image source={{ uri: character.imageUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarIcon}>
                {CLASS_ICONS[character.class] || '🎭'}
              </Text>
              <Text style={styles.avatarHint}>📷</Text>
            </View>
          )}
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{character.name}</Text>
          <Text style={styles.classLevel}>
            {character.class.charAt(0).toUpperCase() + character.class.slice(1)}
          </Text>
          <Text style={styles.level}>Level {character.level}</Text>
        </View>
        {onEdit && (
          <Pressable style={styles.editButton} onPress={onEdit}>
            <Text style={styles.editButtonText}>✏️</Text>
          </Pressable>
        )}
      </View>

      {/* Health */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health</Text>
        <View style={styles.healthContainer}>
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
          <View style={styles.healthHearts}>
            {Array.from({ length: stats.maxHp }).map((_, i) => (
              <Text
                key={i}
                style={[
                  styles.heart,
                  i >= stats.currentHp && styles.heartEmpty,
                ]}
              >
                {i < stats.currentHp ? '❤️' : '🖤'}
              </Text>
            ))}
          </View>
          <Text style={styles.healthText}>
            {stats.currentHp} / {stats.maxHp} HP
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stats</Text>
        <View style={styles.statsGrid}>
          <StatBlock name="MIGHT" value={stats.might} color={colors.game.might} />
          <StatBlock name="GRACE" value={stats.grace} color={colors.game.grace} />
          <StatBlock name="WIT" value={stats.wit} color={colors.game.wit} />
          <StatBlock name="HEART" value={stats.heart} color={colors.game.heart} />
        </View>
      </View>

      {/* Special Abilities */}
      {character.abilities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📜 Special Abilities</Text>
          {character.abilities.map((ability) => (
            <View
              key={ability.id}
              style={[
                styles.abilityCard,
                ability.isUsed && styles.abilityCardUsed,
              ]}
            >
              <Text style={styles.abilityName}>{ability.name}</Text>
              <Text style={styles.abilityDescription}>{ability.description}</Text>
              {ability.rechargeTrigger && (
                <Text style={styles.abilityRecharge}>
                  Recharges: {ability.rechargeTrigger}
                </Text>
              )}
              {ability.isUsed && (
                <View style={styles.usedBadge}>
                  <Text style={styles.usedBadgeText}>USED</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Equipment */}
      {character.equipment.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎒 Equipment</Text>
          {character.equipment.map((item) => (
            <View key={item.id} style={styles.equipmentItem}>
              <Text style={styles.equipmentName}>
                {item.name}
                {item.quantity > 1 && ` (${item.quantity})`}
              </Text>
              {item.description && (
                <Text style={styles.equipmentDescription}>
                  {item.description}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Notes</Text>
        <View style={styles.notesContainer}>
          <Text style={styles.notesText}>
            {character.notes || 'No notes yet. Tap edit to add some!'}
          </Text>
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

function StatBlock({ name, value, color }: { name: string; value: number; color: string }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statName}>{name}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <View style={styles.statDots}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.statDot,
              i < value && { backgroundColor: color },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    fontSize: 40,
  },
  avatarHint: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    fontSize: 16,
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  classLevel: {
    fontSize: fontSizes.lg,
    color: colors.primary[400],
    marginTop: spacing.xs,
  },
  level: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
  },
  editButton: {
    padding: spacing.sm,
  },
  editButtonText: {
    fontSize: 24,
  },
  section: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.background.tertiary,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  healthContainer: {
    alignItems: 'center',
  },
  healthBarContainer: {
    width: '100%',
    height: 12,
    backgroundColor: colors.background.tertiary,
    borderRadius: 6,
    overflow: 'hidden',
  },
  healthBar: {
    height: '100%',
    borderRadius: 6,
  },
  healthHearts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  heart: {
    fontSize: 20,
    marginHorizontal: 2,
  },
  heartEmpty: {
    opacity: 0.5,
  },
  healthText: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBlock: {
    alignItems: 'center',
    flex: 1,
    padding: spacing.sm,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
  },
  statName: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
    fontWeight: '600',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: fontSizes.xxxl,
    fontWeight: 'bold',
    marginVertical: spacing.xs,
  },
  statDots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background.tertiary,
  },
  abilityCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    position: 'relative',
  },
  abilityCardUsed: {
    opacity: 0.6,
  },
  abilityName: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.primary[400],
  },
  abilityDescription: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  abilityRecharge: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  usedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  usedBadgeText: {
    fontSize: fontSizes.xs,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  equipmentItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.tertiary,
  },
  equipmentName: {
    fontSize: fontSizes.md,
    color: colors.text.primary,
  },
  equipmentDescription: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  notesContainer: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 100,
  },
  notesText: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});
