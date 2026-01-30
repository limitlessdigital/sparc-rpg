// Reference Tab - Quick Rules Lookup
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../src/utils/theme';

interface ReferenceCategory {
  id: string;
  title: string;
  icon: string;
  items: ReferenceItem[];
}

interface ReferenceItem {
  id: string;
  title: string;
  content: string;
}

// Sample reference data - would come from API/cache in production
const REFERENCE_DATA: ReferenceCategory[] = [
  {
    id: 'stats',
    title: 'Stats',
    icon: '📊',
    items: [
      {
        id: 'might',
        title: 'Might',
        content: 'Physical strength and power. Used for melee attacks, feats of strength, and intimidation.',
      },
      {
        id: 'grace',
        title: 'Grace',
        content: 'Agility and finesse. Used for dodging, ranged attacks, stealth, and acrobatics.',
      },
      {
        id: 'wit',
        title: 'Wit',
        content: 'Intelligence and perception. Used for knowledge, investigation, and spellcasting.',
      },
      {
        id: 'heart',
        title: 'Heart',
        content: 'Charisma and willpower. Used for persuasion, healing, and resisting fear.',
      },
    ],
  },
  {
    id: 'combat',
    title: 'Combat',
    icon: '⚔️',
    items: [
      {
        id: 'initiative',
        title: 'Initiative',
        content: 'Roll 1d20 + Grace at the start of combat. Higher results go first.',
      },
      {
        id: 'attack',
        title: 'Attacks',
        content: 'Roll 1d20 + relevant stat. Meet or beat the target\'s difficulty to hit.',
      },
      {
        id: 'damage',
        title: 'Damage',
        content: 'Weapons deal their listed damage on a successful hit. Critical hits (natural 20) deal double damage.',
      },
      {
        id: 'healing',
        title: 'Healing',
        content: 'Short rest: Restore 1 HP. Long rest: Restore all HP and recharge abilities.',
      },
    ],
  },
  {
    id: 'dice',
    title: 'Dice Rolls',
    icon: '🎲',
    items: [
      {
        id: 'standard',
        title: 'Standard Rolls',
        content: 'Roll 1d20 + stat modifier. Meet or beat the difficulty to succeed.',
      },
      {
        id: 'advantage',
        title: 'Advantage',
        content: 'Roll twice and take the higher result. Granted by favorable conditions.',
      },
      {
        id: 'disadvantage',
        title: 'Disadvantage',
        content: 'Roll twice and take the lower result. Applied when conditions are unfavorable.',
      },
      {
        id: 'criticals',
        title: 'Critical Rolls',
        content: 'Natural 20 is always a success with bonus effect. Natural 1 is always a failure.',
      },
    ],
  },
  {
    id: 'conditions',
    title: 'Conditions',
    icon: '⚠️',
    items: [
      {
        id: 'stunned',
        title: 'Stunned',
        content: 'Cannot take actions. Attacks against you have advantage. Clears at end of your turn.',
      },
      {
        id: 'poisoned',
        title: 'Poisoned',
        content: 'Disadvantage on attacks and stat checks. Take 1 damage at start of turn.',
      },
      {
        id: 'frightened',
        title: 'Frightened',
        content: 'Cannot move toward source of fear. Disadvantage on rolls while you can see the source.',
      },
      {
        id: 'invisible',
        title: 'Invisible',
        content: 'Cannot be seen without special abilities. Attacks against you have disadvantage.',
      },
    ],
  },
];

export default function ReferenceScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const filteredData = searchQuery
    ? REFERENCE_DATA.map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.content.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((category) => category.items.length > 0)
    : REFERENCE_DATA;

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    setExpandedItem(null);
  };

  const toggleItem = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search rules..."
          placeholderTextColor={colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </Pressable>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredData.map((category) => (
          <View key={category.id} style={styles.category}>
            <Pressable
              style={styles.categoryHeader}
              onPress={() => toggleCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.expandIcon}>
                {expandedCategory === category.id ? '−' : '+'}
              </Text>
            </Pressable>

            {(expandedCategory === category.id || searchQuery) && (
              <View style={styles.categoryContent}>
                {category.items.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.item}
                    onPress={() => toggleItem(item.id)}
                  >
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemExpandIcon}>
                        {expandedItem === item.id ? '▼' : '▶'}
                      </Text>
                    </View>
                    {expandedItem === item.id && (
                      <Text style={styles.itemContent}>{item.content}</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        ))}

        {filteredData.length === 0 && (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>No results found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSizes.md,
    color: colors.text.primary,
  },
  clearButton: {
    padding: spacing.sm,
  },
  clearButtonText: {
    fontSize: fontSizes.md,
    color: colors.text.muted,
  },
  scrollView: {
    flex: 1,
  },
  category: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  categoryTitle: {
    flex: 1,
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  expandIcon: {
    fontSize: fontSizes.xl,
    color: colors.text.muted,
  },
  categoryContent: {
    borderTopWidth: 1,
    borderTopColor: colors.background.tertiary,
  },
  item: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.tertiary,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: fontSizes.md,
    fontWeight: '500',
    color: colors.primary[400],
  },
  itemExpandIcon: {
    fontSize: fontSizes.sm,
    color: colors.text.muted,
  },
  itemContent: {
    marginTop: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  noResults: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  noResultsText: {
    fontSize: fontSizes.md,
    color: colors.text.muted,
  },
});
