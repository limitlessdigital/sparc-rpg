// Mobile Dice Roller with Touch Gestures and Haptics
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { roll, formatRoll, type DiceRoll } from '@sparc/game-logic/dice';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../utils/theme';
import { useSettingsStore } from '../stores/settingsStore';

interface DiceRollerProps {
  notation?: string;
  label?: string;
  difficulty?: number;
  onRoll?: (result: DiceRoll) => void;
}

const DICE_OPTIONS = ['1d20', '1d12', '1d10', '1d8', '1d6', '1d4', '2d6', '3d6'];

const { height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;

export function DiceRoller({ 
  notation: initialNotation, 
  label, 
  difficulty, 
  onRoll 
}: DiceRollerProps) {
  const [selectedNotation, setSelectedNotation] = useState(initialNotation || '1d20');
  const [result, setResult] = useState<DiceRoll | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  
  const { hapticEnabled, diceGesture } = useSettingsStore();
  
  const diceScale = useRef(new Animated.Value(1)).current;
  const diceRotation = useRef(new Animated.Value(0)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const swipeY = useRef(new Animated.Value(0)).current;

  const performRoll = useCallback(async () => {
    if (isRolling) return;
    
    setIsRolling(true);
    setResult(null);
    
    // Haptic feedback for roll start
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Rolling animation
    resultOpacity.setValue(0);
    
    Animated.parallel([
      // Scale bounce
      Animated.sequence([
        Animated.timing(diceScale, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(diceScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      // Rotation
      Animated.sequence([
        Animated.timing(diceRotation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(diceRotation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Rolling haptic pattern
    if (hapticEnabled) {
      for (let i = 0; i < 4; i++) {
        await new Promise((resolve) => setTimeout(resolve, 60));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }

    // Perform the roll
    await new Promise((resolve) => setTimeout(resolve, 200));
    const rollResult = roll(selectedNotation);
    setResult(rollResult);
    
    // Result reveal haptic
    if (hapticEnabled) {
      if (rollResult.criticalSuccess) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (rollResult.criticalFailure) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    }

    // Fade in result
    Animated.timing(resultOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setIsRolling(false);
    onRoll?.(rollResult);
  }, [selectedNotation, isRolling, hapticEnabled, onRoll, diceScale, diceRotation, resultOpacity]);

  // Swipe gesture handler
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => diceGesture.type === 'swipe',
      onMoveShouldSetPanResponder: () => diceGesture.type === 'swipe',
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) {
          swipeY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -SWIPE_THRESHOLD) {
          performRoll();
        }
        Animated.spring(swipeY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const rotationInterpolate = diceRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getResultColor = () => {
    if (result?.criticalSuccess) return colors.success;
    if (result?.criticalFailure) return colors.error;
    if (difficulty && result) {
      return result.total >= difficulty ? colors.success : colors.error;
    }
    return colors.text.primary;
  };

  return (
    <View style={styles.container}>
      {/* Dice Selection */}
      <View style={styles.diceOptions}>
        {DICE_OPTIONS.map((d) => (
          <Pressable
            key={d}
            style={[
              styles.diceOption,
              selectedNotation === d && styles.diceOptionSelected,
            ]}
            onPress={() => setSelectedNotation(d)}
          >
            <Text
              style={[
                styles.diceOptionText,
                selectedNotation === d && styles.diceOptionTextSelected,
              ]}
            >
              {d}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Label and Difficulty */}
      {(label || difficulty) && (
        <View style={styles.labelContainer}>
          {label && <Text style={styles.label}>{label}</Text>}
          {difficulty && (
            <Text style={styles.difficulty}>Difficulty: {difficulty}</Text>
          )}
        </View>
      )}

      {/* Dice Display */}
      <Animated.View
        style={[
          styles.diceArea,
          {
            transform: [
              { scale: diceScale },
              { rotate: rotationInterpolate },
              { translateY: swipeY },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Pressable 
          onPress={diceGesture.type === 'tap' ? performRoll : undefined}
          style={styles.dicePressable}
        >
          <View style={styles.diceDisplay}>
            <Text style={styles.diceEmoji}>🎲</Text>
            <Text style={styles.diceNotation}>{selectedNotation}</Text>
          </View>
        </Pressable>
      </Animated.View>

      {/* Result Display */}
      <Animated.View
        style={[styles.resultContainer, { opacity: resultOpacity }]}
      >
        {result && (
          <>
            <Text style={[styles.resultTotal, { color: getResultColor() }]}>
              {result.total}
            </Text>
            <Text style={styles.resultBreakdown}>
              [{result.rolls.join(' + ')}]
              {result.modifier !== 0 &&
                ` ${result.modifier > 0 ? '+' : ''} ${result.modifier}`}
            </Text>
            {result.criticalSuccess && (
              <Text style={styles.criticalSuccess}>🎯 CRITICAL SUCCESS!</Text>
            )}
            {result.criticalFailure && (
              <Text style={styles.criticalFailure}>💀 CRITICAL FAILURE!</Text>
            )}
            {difficulty && (
              <Text
                style={[
                  styles.passFailText,
                  { color: result.total >= difficulty ? colors.success : colors.error },
                ]}
              >
                {result.total >= difficulty ? '✓ PASS' : '✗ FAIL'}
              </Text>
            )}
          </>
        )}
      </Animated.View>

      {/* Roll Instructions */}
      <View style={styles.instructionsContainer}>
        {diceGesture.type === 'swipe' && (
          <Text style={styles.instructions}>↑ SWIPE UP TO ROLL ↑</Text>
        )}
        {diceGesture.type === 'tap' && (
          <Text style={styles.instructions}>TAP TO ROLL</Text>
        )}
        {diceGesture.type === 'shake' && (
          <Text style={styles.instructions}>📱 SHAKE TO ROLL</Text>
        )}
      </View>

      {/* Manual Roll Button */}
      <Pressable
        style={[styles.rollButton, isRolling && styles.rollButtonDisabled]}
        onPress={performRoll}
        disabled={isRolling}
      >
        <Text style={styles.rollButtonText}>
          {isRolling ? 'Rolling...' : 'Roll Dice'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  diceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  diceOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
  },
  diceOptionSelected: {
    backgroundColor: colors.primary[600],
  },
  diceOptionText: {
    color: colors.text.secondary,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  diceOptionTextSelected: {
    color: colors.text.primary,
  },
  labelContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  difficulty: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  diceArea: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dicePressable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  diceDisplay: {
    width: 150,
    height: 150,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.glow,
  },
  diceEmoji: {
    fontSize: 64,
  },
  diceNotation: {
    fontSize: fontSizes.lg,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  resultContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
    minHeight: 100,
  },
  resultTotal: {
    fontSize: fontSizes.display,
    fontWeight: 'bold',
  },
  resultBreakdown: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  criticalSuccess: {
    fontSize: fontSizes.lg,
    color: colors.success,
    fontWeight: 'bold',
    marginTop: spacing.sm,
  },
  criticalFailure: {
    fontSize: fontSizes.lg,
    color: colors.error,
    fontWeight: 'bold',
    marginTop: spacing.sm,
  },
  passFailText: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    marginTop: spacing.sm,
  },
  instructionsContainer: {
    marginVertical: spacing.md,
  },
  instructions: {
    fontSize: fontSizes.md,
    color: colors.text.muted,
    letterSpacing: 2,
  },
  rollButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  rollButtonDisabled: {
    opacity: 0.6,
  },
  rollButtonText: {
    color: colors.text.primary,
    fontSize: fontSizes.lg,
    fontWeight: '600',
  },
});
