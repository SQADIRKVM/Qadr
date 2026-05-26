import React from 'react';
import { View, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <AppText variant="label-sm" style={styles.label}>
          {variant === 'tldw' ? 'TLDW' : 'Summary'}
        </AppText>
        <View style={styles.dividerLine} />
      </View>
      <BentoCard deep accentLeft style={styles.card}>
        <AppText variant="body-md" style={styles.body}>
          {summary}
        </AppText>
      </BentoCard>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: {
    gap: spacing.xs,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.accentRed,
    fontSize: 12,
    fontFamily: 'SpaceGrotesk_700Bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  dividerLine: {
    flex: 1,
    height: 1.2,
    backgroundColor: colors.accentRed,
    opacity: 0.35,
  },
  card: {
    padding: spacing.md,
    borderRadius: spacing.cardRadius,
  },
  body: {
    color: colors.onSurface,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
});
