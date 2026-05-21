import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { Button } from '../primitives/Button';
import { Chip } from '../primitives/Chip';
import { EnergyDots } from '../EnergyDots';
import { spacing } from '../../theme/spacing';
import { isBedtimeLate } from '../../utils/selectors';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

const LATE_REASONS = ['Reels', 'YouTube', 'Coding', 'Overthinking', 'Chatting', 'Work', 'Other'];

interface SleepLogCardProps {
  sleptAt: string;
  wokeAt: string;
  quality: number;
  lateReasons: string[];
  editingDateLabel?: string;
  hasExistingLog: boolean;
  todayScore?: number;
  onSleptAtPress: () => void;
  onWokeAtPress: () => void;
  onQualityChange: (n: number) => void;
  onLateReasonToggle: (reason: string) => void;
  onLog: () => void;
  onDelete?: () => void;
}

export const SleepLogCard: React.FC<SleepLogCardProps> = ({
  sleptAt,
  wokeAt,
  quality,
  lateReasons,
  editingDateLabel,
  hasExistingLog,
  todayScore,
  onSleptAtPress,
  onWokeAtPress,
  onQualityChange,
  onLateReasonToggle,
  onLog,
  onDelete,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const late = isBedtimeLate(sleptAt);

  return (
    <BentoCard deep style={[styles.card, late && styles.cardLate]}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="bedtime" size={22} color={colors.onSurface} />
        </View>
        <View style={styles.headerText}>
          <AppText variant="headline-md" style={styles.title}>
            {hasExistingLog ? 'Edit Sleep' : 'Log Sleep'}
          </AppText>
          <AppText variant="body-md" muted>
            {editingDateLabel
              ? editingDateLabel
              : todayScore != null
                ? `Score ${todayScore} logged`
                : 'Track bedtime & quality'}
          </AppText>
        </View>
        {hasExistingLog && onDelete ? (
          <Pressable
            onPress={() => {
              hapticLight();
              onDelete();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Delete sleep log"
          >
            <AppText variant="label-sm" style={styles.deleteBtn}>
              DELETE
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.times}>
        <Pressable
          style={styles.timeBlock}
          onPress={() => {
            hapticLight();
            onSleptAtPress();
          }}
        >
          <AppText variant="label-sm" style={styles.timeLabel}>
            SLEPT AT
          </AppText>
          <AppText variant="headline-lg" style={styles.timeValue}>
            {sleptAt}
          </AppText>
        </Pressable>
        <Pressable
          style={styles.timeBlock}
          onPress={() => {
            hapticLight();
            onWokeAtPress();
          }}
        >
          <AppText variant="label-sm" style={styles.timeLabel}>
            WOKE AT
          </AppText>
          <AppText variant="headline-lg" style={styles.timeValue}>
            {wokeAt}
          </AppText>
        </Pressable>
      </View>

      <View style={styles.quality}>
        <AppText variant="label-sm" style={styles.timeLabel}>
          QUALITY
        </AppText>
        <EnergyDots count={quality} max={10} onChange={onQualityChange} redFill />
      </View>

      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.chips}
      >
        {LATE_REASONS.map((r) => (
          <Chip
            key={r}
            label={r}
            selected={lateReasons.includes(r)}
            onPress={() => onLateReasonToggle(r)}
          />
        ))}
      </ScrollView>

      <Button
        label={hasExistingLog ? 'UPDATE SLEEP' : 'LOG SLEEP'}
        onPress={onLog}
        style={styles.logBtn}
      />
    </BentoCard>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: spacing.lg,
    gap: spacing.md,
    minHeight: 320,
  },
  cardLate: {
    borderTopWidth: 2,
    borderTopColor: colors.accentRed,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 4 },
  title: { color: colors.onSurface },
  deleteBtn: { color: colors.onTertiaryContainer, letterSpacing: 1 },
  times: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeBlock: {
    flex: 1,
    backgroundColor: colors.surfaceLow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
  },
  timeLabel: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1.5,
    fontSize: 10,
    marginBottom: 4,
  },
  timeValue: { color: colors.onSurface },
  quality: { gap: 8 },
  chips: { marginHorizontal: -4 },
  logBtn: { marginTop: 4 },
});
