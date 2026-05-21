import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface BioSyncHeroProps {
  statusLine: string;
  compact?: boolean;
}

export const BioSyncHero: React.FC<BioSyncHeroProps> = ({ statusLine, compact }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.wrap}>
    <AppText variant={compact ? 'headline-lg-mobile' : 'headline-xl'} style={styles.title}>
      Your Bio-Sync
    </AppText>
    <View style={styles.statusRow}>
      <View style={styles.dot} />
      <AppText variant="body-lg" style={styles.status}>
        {statusLine}
      </AppText>
    </View>
  </View>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: { flex: 1, minWidth: 0 },
  title: {
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  status: {
    color: colors.onSurfaceVariant,
    flex: 1,
  },
});
