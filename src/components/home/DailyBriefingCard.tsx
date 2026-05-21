import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { buildBriefingLines, type DailyBriefingData } from '../../utils/dailyBriefing';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface DailyBriefingCardProps {
  data: DailyBriefingData;
}

export const DailyBriefingCard: React.FC<DailyBriefingCardProps> = ({ data }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const lines = useMemo(() => buildBriefingLines(data), [data]);

  return (
    <BentoCard style={styles.card}>
      <AppText variant="label-sm" style={styles.label}>
        DAILY BRIEFING
      </AppText>
      <View style={styles.lines}>
        {lines.map((line) => (
          <View key={line} style={styles.row}>
            <AppText variant="body-md" style={styles.bullet}>
              ✧
            </AppText>
            <AppText variant="body-md" style={styles.text}>
              {line}
            </AppText>
          </View>
        ))}
      </View>
    </BentoCard>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  lines: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  bullet: {
    color: colors.primary,
    marginRight: 10,
    lineHeight: 22,
    fontSize: 12,
  },
  text: {
    flex: 1,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
});
