import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { JournalCard } from './JournalCard';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface ProductivityFlowCardProps {
  focusScore: number;
}

export const ProductivityFlowCard: React.FC<ProductivityFlowCardProps> = ({ focusScore }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const pct = Math.min(100, Math.max(0, Math.round(focusScore)));

  return (
    <JournalCard style={styles.card}>
      <View style={styles.header}>
        <AppText variant="label-sm" style={styles.label}>
          PRODUCTIVITY FLOW
        </AppText>
        <MaterialIcons name="water-drop" size={22} color={colors.primary} style={{ opacity: 0.6 }} />
      </View>
      <View style={styles.valueRow}>
        <AppText variant="headline-xl" style={styles.value}>
          {pct}
        </AppText>
        <AppText variant="headline-md" style={styles.percent}>
          %
        </AppText>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
    </JournalCard>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  value: {
    color: colors.onSurface,
    lineHeight: 56,
  },
  percent: {
    color: colors.onSurfaceVariant,
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: '300',
  },
  track: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: 'rgba(229, 226, 225, 0.8)',
    borderRadius: 9999,
  },
});
