import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface RestRecoveryCardProps {
  hours: number | null;
  qualityLabel: string;
  description: string;
  style?: StyleProp<ViewStyle>;
}

export const RestRecoveryCard: React.FC<RestRecoveryCardProps> = ({
  hours,
  qualityLabel,
  description,
  style,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard deep style={[styles.card, style]}>
    <View style={styles.header}>
      <View style={styles.headerText}>
        <AppText variant="headline-md" style={styles.title}>
          Rest & Recovery
        </AppText>
        <AppText variant="label-sm" style={styles.subtitle}>
          {hours !== null ? "You're well-rested today" : 'LOG SLEEP TO TRACK'}
        </AppText>
      </View>
      {hours !== null ? (
        <View style={styles.pill}>
          <AppText variant="label-sm" style={styles.pillText}>
            Quality: {qualityLabel}
          </AppText>
        </View>
      ) : null}
    </View>
    <View style={styles.center}>
      <View style={styles.hoursRow}>
        <AppText variant="headline-xl" style={styles.hours}>
          {hours !== null ? hours.toFixed(1) : '—'}
        </AppText>
        {hours !== null ? (
          <AppText variant="headline-md" style={styles.hrsUnit}>
            hrs
          </AppText>
        ) : null}
      </View>
      <AppText variant="body-md" muted style={styles.desc}>
        {description}
      </AppText>
    </View>
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: spacing.lg,
    minHeight: 280,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  headerText: { flex: 1 },
  title: { color: colors.onSurface },
  subtitle: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    fontSize: 10,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  pill: {
    backgroundColor: colors.chipBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: spacing.pillRadius,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  pillText: {
    color: colors.onSurfaceVariant,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 8,
  },
  hours: { color: colors.onSurface },
  hrsUnit: { color: colors.onSurfaceVariant },
  desc: {
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 24,
  },
});
