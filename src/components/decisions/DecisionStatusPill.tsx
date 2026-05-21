import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../primitives/AppText';
import type { DecisionStatus } from '../../types';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface DecisionStatusPillProps {
  status: DecisionStatus;
}

const LABELS: Record<DecisionStatus, string> = {
  decided: 'Decided',
  pending: 'Pending',
  revisited: 'Revisited',
};

export const DecisionStatusPill: React.FC<DecisionStatusPillProps> = ({ status }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const label = LABELS[status];

  if (status === 'decided') {
    return (
      <View style={[styles.pill, styles.decided]}>
        <AppText variant="label-sm" style={styles.decidedText}>
          {label}
        </AppText>
      </View>
    );
  }

  if (status === 'pending') {
    return (
      <View style={[styles.pill, styles.pending]}>
        <View style={styles.pendingDot} />
        <AppText variant="label-sm" style={styles.pendingText}>
          {label}
        </AppText>
      </View>
    );
  }

  return (
    <View style={[styles.pill, styles.revisited]}>
      <AppText variant="label-sm" style={styles.revisitedText}>
        {label}
      </AppText>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
  },
  decided: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  decidedText: {
    color: colors.onPrimary,
    textTransform: 'capitalize',
  },
  pending: {
    backgroundColor: 'transparent',
    borderColor: colors.outlineVariant,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.onTertiaryContainer,
  },
  pendingText: {
    color: colors.onSurfaceVariant,
    textTransform: 'capitalize',
  },
  revisited: {
    backgroundColor: colors.surfaceContainerHighest,
    borderColor: colors.outlineVariant,
  },
  revisitedText: {
    color: colors.onSurface,
    textTransform: 'capitalize',
  },
});
