import React from 'react';
import { StyleSheet } from 'react-native';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MindTldwCardProps {
  summary: string;
  variant?: 'tldw' | 'summary';
}

export const MindTldwCard: React.FC<MindTldwCardProps> = ({ summary, variant = 'summary' }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard style={styles.card}>
    <AppText variant="label-sm" style={styles.label}>
      {variant === 'tldw' ? 'TLDW' : 'Summary'}
    </AppText>
    <AppText variant="body-md" style={styles.body}>
      {summary}
    </AppText>
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  label: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  body: {
    color: colors.onSurface,
    lineHeight: 24,
  },
});
