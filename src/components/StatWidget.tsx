import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from './primitives/Card';
import { AppText } from './primitives/AppText';
import { DotMatrixText } from './DotMatrixText';
import { ProgressRing } from './ProgressRing';
import { spacing } from '../theme/spacing';
import { useColors } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import type { ColorPalette } from '../theme/palettes';

interface StatWidgetProps {
  label: string;
  value?: string | number;
  dotMatrix?: boolean;
  alert?: boolean;
  ring?: number;
  dots?: number;
}

export const StatWidget: React.FC<StatWidgetProps> = ({
  label,
  value,
  dotMatrix,
  alert,
  ring,
  dots,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <Card style={styles.widget}>
    <AppText variant="label-sm" style={styles.label}>
      {label}
    </AppText>
    {ring !== undefined && <ProgressRing progress={ring} size={40} />}
    {dots !== undefined && (
      <View style={styles.dotRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            style={[styles.energyDot, i <= dots && styles.energyFilled]}
          />
        ))}
      </View>
    )}
    {value !== undefined && dotMatrix && (
      <DotMatrixText value={value} size="sm" alert={alert} />
    )}
    {value !== undefined && !dotMatrix && !ring && dots === undefined && (
      <AppText variant="mono-md" style={alert ? { color: colors.accentRed } : undefined}>
        {value}
      </AppText>
    )}
  </Card>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  widget: {
    width: 120,
    height: spacing.statWidgetHeight,
    marginRight: 8,
    justifyContent: 'space-between',
  },
  label: { fontSize: 9 },
  dotRow: { flexDirection: 'row', gap: 4, marginTop: 8 },
  energyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  energyFilled: { backgroundColor: colors.primary, borderColor: colors.primary },
});
