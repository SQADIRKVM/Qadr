import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { ProjectPillButton } from './ProjectPillButton';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MilestoneCardProps {
  daysLeft: number | null;
  disabled?: boolean;
  onPause: () => void;
  onCancel: () => void;
  onComplete: () => void;
  /** Stack Cancel/Complete vertically on narrow screens. */
  compactActions?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  daysLeft,
  disabled,
  onPause,
  onCancel,
  onComplete,
  compactActions = false,
  style,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard deep style={[styles.card, style]}>
    <View>
      <AppText variant="label-sm" style={styles.label}>
        NEXT MILESTONE
      </AppText>
      <View style={styles.countWrap}>
        <AppText variant="headline-xl" style={styles.count}>
          {daysLeft != null ? daysLeft : '—'}
        </AppText>
        <AppText variant="headline-md" style={styles.daysLabel}>
          Days
        </AppText>
      </View>
    </View>

    <View style={styles.actions}>
      <ProjectPillButton
        label="Pause"
        icon="pause"
        onPress={onPause}
        fullWidth={compactActions}
        disabled={disabled}
      />
      <View style={[styles.row, compactActions && styles.rowStack]}>
        <ProjectPillButton
          label="Cancel"
          icon="cancel"
          onPress={onCancel}
          variant="destructive"
          flex={!compactActions}
          fullWidth={compactActions}
          disabled={disabled}
        />
        <ProjectPillButton
          label="Complete"
          icon="done-all"
          onPress={onComplete}
          variant="primary"
          flex={!compactActions}
          fullWidth={compactActions}
          disabled={disabled}
        />
      </View>
    </View>
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: spacing.lg,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    fontSize: 10,
    marginBottom: spacing.md,
  },
  countWrap: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.lg,
  },
  count: {
    color: colors.onSurface,
    letterSpacing: -2,
  },
  daysLabel: {
    color: colors.outline,
    marginTop: 4,
  },
  actions: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowStack: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
});
