import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

type Status = 'pending' | 'active' | 'overdue' | 'done';

interface StatusChipProps {
  label: string;
  status: Status;
}

export const StatusChip: React.FC<StatusChipProps> = ({ label, status }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const statusStyles: Record<Status, { bg: string; text: string; border?: string }> = {
    pending: { bg: colors.secondaryContainer, text: colors.onSecondaryContainer },
    active: { bg: colors.surfaceLow, text: colors.primary, border: colors.primary },
    overdue: { bg: colors.overdueBg, text: colors.error },
    done: { bg: colors.surfaceLow, text: colors.outline },
  };
  const s = statusStyles[status];
  return (
    <View style={[styles.chip, { backgroundColor: s.bg, borderColor: s.border ?? 'transparent', borderWidth: s.border ? 1 : 0 }]}>
      <AppText variant="label-sm" style={{ color: s.text, fontSize: 10 }}>
        {label}
      </AppText>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: spacing.pillRadius,
  },
});
