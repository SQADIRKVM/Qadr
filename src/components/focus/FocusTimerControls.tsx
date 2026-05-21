import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import type { TimerPhase } from '../../utils/focusTimer';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface FocusTimerControlsProps {
  isPaused: boolean;
  timerPhase: TimerPhase;
  breakComplete: boolean;
  onPauseResume: () => void;
  onSkipToBreak: () => void;
  onStartNext: () => void;
}

export const FocusTimerControls: React.FC<FocusTimerControlsProps> = ({
  isPaused,
  timerPhase,
  breakComplete,
  onPauseResume,
  onSkipToBreak,
  onStartNext,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.wrap}>
    <Pressable
      onPress={() => {
        hapticLight();
        onPauseResume();
      }}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <BentoCard deep style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconCircle}>
            <MaterialIcons
              name={isPaused ? 'play-arrow' : 'pause'}
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={styles.copy}>
            <AppText variant="body-lg" style={styles.title}>
              {isPaused ? 'Resume' : 'Pause'}
            </AppText>
            <AppText variant="label-sm" style={styles.sub}>
              {timerPhase === 'focus' ? 'Focus timer' : 'Break timer'}
            </AppText>
          </View>
        </View>
      </BentoCard>
    </Pressable>

    {breakComplete ? (
      <Pressable
        onPress={() => {
          hapticLight();
          onStartNext();
        }}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        <BentoCard deep style={[styles.card, styles.nextCard]}>
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="replay" size={22} color={colors.onTertiaryContainer} />
            </View>
            <View style={styles.copy}>
              <AppText variant="body-lg" style={styles.title}>
                Start next focus
              </AppText>
              <AppText variant="label-sm" style={styles.sub}>
                Begin another block
              </AppText>
            </View>
          </View>
        </BentoCard>
      </Pressable>
    ) : timerPhase === 'focus' ? (
      <Pressable
        onPress={() => {
          hapticLight();
          onSkipToBreak();
        }}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        <BentoCard deep style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="free-breakfast" size={22} color={colors.primary} />
            </View>
            <View style={styles.copy}>
              <AppText variant="body-lg" style={styles.title}>
                Start break
              </AppText>
              <AppText variant="label-sm" style={styles.sub}>
                Skip to break early
              </AppText>
            </View>
          </View>
        </BentoCard>
      </Pressable>
    ) : null}
  </View>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: {
    width: '100%',
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.92,
  },
  card: {
    width: '100%',
    padding: spacing.lg,
  },
  nextCard: {
    borderColor: colors.onTertiaryContainer,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.onSurface,
    fontWeight: '500',
  },
  sub: {
    color: colors.onSurfaceVariant,
    marginTop: 4,
    letterSpacing: 0.5,
  },
});
