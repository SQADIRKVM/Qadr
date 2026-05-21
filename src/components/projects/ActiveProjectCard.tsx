import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { SegmentedProgressBar } from './SegmentedProgressBar';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface ActiveProjectCardProps {
  name?: string;
  tagline?: string;
  progress: number;
  style?: StyleProp<ViewStyle>;
}

export const ActiveProjectCard: React.FC<ActiveProjectCardProps> = ({
  name,
  tagline,
  progress,
  style,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard deep style={[styles.card, style]}>
    <View style={styles.header}>
      <View style={styles.labelRow}>
        {name ? <View style={styles.pulseDot} /> : null}
        <AppText variant="label-sm" style={styles.label}>
          ACTIVE PROJECT
        </AppText>
      </View>
    </View>

    {name ? (
      <>
        <AppText variant="headline-lg-mobile" style={styles.name}>
          {name}
        </AppText>
        {tagline ? (
          <AppText variant="body-lg" muted style={styles.tagline}>
            {tagline}
          </AppText>
        ) : null}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <AppText variant="label-sm" style={styles.progressLabel}>
              Progress
            </AppText>
            <AppText variant="headline-md" style={styles.progressPct}>
              {progress}%
            </AppText>
          </View>
          <SegmentedProgressBar percent={progress} />
        </View>
      </>
    ) : (
      <View style={styles.empty}>
        <AppText variant="body-lg" muted style={styles.emptyText}>
          No active project. Pick one from the queue below.
        </AppText>
      </View>
    )}
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: spacing.lg,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    fontSize: 10,
  },
  name: {
    color: colors.onSurface,
    marginBottom: 4,
  },
  tagline: {
    marginBottom: spacing.lg,
  },
  progressSection: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  progressLabel: {
    color: colors.onSurface,
    letterSpacing: 0.5,
    fontSize: 11,
  },
  progressPct: {
    color: colors.primary,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 24,
  },
});
