import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { ProgressRing } from '../ProgressRing';
import { EnergyDots } from '../EnergyDots';
import { useResponsive } from '../../hooks/useResponsive';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface HealthEnergyCardProps {
  sleepScore: number | null;
  energyPercent: number | null;
  energyLevel?: number;
  onEnergyChange?: (level: number) => void;
  onBioSyncPress?: () => void;
  onLogEnergyInHabits?: () => void;
  style?: ViewStyle;
}

export const HealthEnergyCard: React.FC<HealthEnergyCardProps> = ({
  sleepScore,
  energyPercent,
  energyLevel = 0,
  onEnergyChange,
  onBioSyncPress,
  onLogEnergyInHabits,
  style,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { ringSize, ringStroke, cardPadding, isMobile } = useResponsive();
  const sleepVal = sleepScore ?? 0;
  const energyVal = energyPercent ?? 0;
  const valueVariant = isMobile ? 'headline-md' : 'headline-lg';

  const showHabitsCta = Boolean(onLogEnergyInHabits && energyLevel === 0);

  return (
    <BentoCard style={[styles.card, { padding: cardPadding }, style]}>
      <View style={styles.body}>
        <View style={styles.header}>
          <AppText variant="label-sm" style={styles.label}>
            HEALTH & ENERGY
          </AppText>
          {onBioSyncPress ? (
            <Pressable onPress={onBioSyncPress} hitSlop={8} accessibilityRole="button">
              <AppText variant="label-sm" style={styles.bioLink}>
                BIO-SYNC
              </AppText>
            </Pressable>
          ) : (
            <Ionicons name="pulse-outline" size={22} color={colors.onSurfaceVariant} />
          )}
        </View>
        <View style={styles.divider} />
        <View style={[styles.rings, isMobile && styles.ringsStack]}>
          <Pressable
            onPress={onBioSyncPress}
            disabled={!onBioSyncPress}
            style={styles.ringCol}
            accessibilityRole={onBioSyncPress ? 'button' : undefined}
            accessibilityLabel="Open Bio-Sync health details"
          >
            <ProgressRing
              progress={sleepScore !== null ? sleepVal : 0}
              size={ringSize}
              strokeWidth={ringStroke}
              strokeColor={colors.primary}
              trackColor={colors.cardBorder}
            >
              <View style={styles.ringCenter}>
                <AppText variant={valueVariant} style={{ color: colors.primary }}>
                  {sleepScore !== null ? sleepVal : '—'}
                </AppText>
                <AppText variant="label-sm" style={styles.ringLabel}>
                  SLEEP
                </AppText>
              </View>
            </ProgressRing>
          </Pressable>
          <View style={styles.ringCol}>
            <ProgressRing
              progress={energyPercent !== null ? energyVal : 0}
              size={ringSize}
              strokeWidth={ringStroke}
              strokeColor={colors.tertiary}
              trackColor={colors.cardBorder}
            >
              <View style={styles.ringCenter}>
                <AppText variant={valueVariant} style={{ color: colors.tertiary }}>
                  {energyPercent !== null ? `${energyVal}%` : '—'}
                </AppText>
                <AppText variant="label-sm" style={styles.ringLabel}>
                  ENERGY
                </AppText>
              </View>
            </ProgressRing>
            {onEnergyChange ? (
              <View style={styles.energyDots}>
                <EnergyDots count={energyLevel} onChange={onEnergyChange} redFill />
              </View>
            ) : null}
          </View>
        </View>
        {showHabitsCta ? (
          <Pressable onPress={onLogEnergyInHabits} style={styles.habitsCta}>
            <AppText variant="label-sm" style={styles.habitsCtaText}>
              LOG SLEEP & ENERGY IN HABITS
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </BentoCard>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: { flex: 1, minWidth: 0 },
  body: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: { letterSpacing: 2 },
  bioLink: { color: colors.onTertiaryContainer, letterSpacing: 1 },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginBottom: spacing.lg,
  },
  rings: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  ringsStack: {
    justifyContent: 'center',
  },
  ringCol: {
    alignItems: 'center',
    flex: 1,
    minWidth: 120,
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  ringLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 2,
  },
  energyDots: {
    marginTop: spacing.sm,
  },
  habitsCta: {
    marginTop: 'auto',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignSelf: 'center',
  },
  habitsCtaText: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
});
