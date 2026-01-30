// Dice Tab
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DiceRoller } from '../../src/components';
import { colors } from '../../src/utils/theme';

export default function DiceScreen() {
  return (
    <View style={styles.container}>
      <DiceRoller />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});
