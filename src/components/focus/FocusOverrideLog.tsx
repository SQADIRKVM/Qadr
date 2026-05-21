import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { Separator } from '../primitives/Separator';
import type { BlockOverride } from '../../types';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface FocusOverrideLogProps {
  overrides: BlockOverride[];
  maxItems?: number;
}

export const FocusOverrideLog: React.FC<FocusOverrideLogProps> = ({
  overrides,
  maxItems = 10,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const items = overrides.slice(0, maxItems);

  return (
    <BentoCard deep style={styles.card}>
      <AppText variant="label-sm" style={styles.sectionLabel}>
        OVERRIDE LOG
      </AppText>

      {items.length === 0 ? (
        <AppText variant="body-md" muted style={styles.empty}>
          No overrides logged yet.
        </AppText>
      ) : (
        items.map((o, i) => (
          <View key={o.id}>
            <View style={styles.logRow}>
              <AppText variant="body-md" style={styles.logPrimary}>
                {o.timestamp.split('T')[0]} · {o.mode.toUpperCase()}
              </AppText>
              <AppText variant="body-md" muted style={styles.logSecondary}>
                {o.reason} · {o.durationMinutes}m
              </AppText>
            </View>
            {i < items.length - 1 ? <Separator /> : null}
          </View>
        ))
      )}
    </BentoCard>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: spacing.lg,
  },
  sectionLabel: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  empty: {
    fontStyle: 'italic',
  },
  logRow: {
    paddingVertical: 12,
    gap: 4,
  },
  logPrimary: {
    color: colors.onSurface,
  },
  logSecondary: {
    fontSize: 14,
  },
});
