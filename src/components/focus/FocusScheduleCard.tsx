import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { glowShadow } from '../../theme/shadows';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface FocusScheduleCardProps {
  workOn: string;
  workOff: string;
  examOn: string;
  examOff: string;
  nightOn: string;
  nightOff: string;
  nightAuto: boolean;
  bedtime: string;
  onPressEdit: () => void;
  onToggleNightAuto: () => void;
}

export const FocusScheduleCard: React.FC<FocusScheduleCardProps> = ({
  workOn,
  workOff,
  examOn,
  examOff,
  nightOn,
  nightOff,
  nightAuto,
  bedtime,
  onPressEdit,
  onToggleNightAuto,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard deep style={styles.card}>
    <View style={styles.sectionHeader}>
      <AppText variant="label-sm" style={styles.sectionLabel}>
        SCHEDULE
      </AppText>
      <Pressable
        onPress={() => {
          hapticLight();
          onPressEdit();
        }}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Edit schedule"
      >
        <AppText variant="label-sm" style={styles.editBtn}>
          Edit
        </AppText>
      </Pressable>
    </View>

    <View style={styles.rows}>
      <ScheduleRow label="WORK" value={`${workOn} – ${workOff}`} />
      <ScheduleRow label="EXAM" value={`${examOn} – ${examOff}`} />
      <ScheduleRow label="NIGHT" value={`${nightOn} – ${nightOff}`} />
    </View>

    <View style={styles.nightRow}>
      <View style={styles.nightCopy}>
        <AppText variant="body-md" style={styles.nightTitle}>
          Night auto
        </AppText>
        <AppText variant="body-md" muted>
          {nightAuto ? 'ON' : 'OFF'} · bedtime {bedtime}
        </AppText>
      </View>
      <Pressable
        onPress={() => {
          hapticLight();
          onToggleNightAuto();
        }}
        style={[styles.toggle, nightAuto && styles.toggleOn]}
        accessibilityRole="switch"
        accessibilityState={{ checked: nightAuto }}
      >
        <View style={[styles.knob, nightAuto && styles.knobOn]} />
      </Pressable>
    </View>
  </BentoCard>
  );
};

const ScheduleRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.scheduleRow}>
      <AppText variant="label-sm" style={styles.rowLabel}>
        {label}
      </AppText>
      <AppText variant="body-md" muted>
        {value}
      </AppText>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
  },
  editBtn: {
    color: colors.onTertiaryContainer,
    letterSpacing: 1.5,
  },
  rows: {
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowLabel: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    minWidth: 48,
  },
  nightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  nightCopy: {
    flex: 1,
    minWidth: 0,
  },
  nightTitle: {
    color: colors.onSurface,
    marginBottom: 4,
  },
  toggle: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.outlineVariant,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: {
    backgroundColor: colors.onTertiaryContainer,
    ...glowShadow,
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.inverseSurface,
    alignSelf: 'flex-start',
  },
  knobOn: {
    alignSelf: 'flex-end',
  },
});
