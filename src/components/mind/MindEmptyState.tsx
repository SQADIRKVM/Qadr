import React from 'react';
import { StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MindEmptyStateProps {
  variant: 'empty' | 'no-matches';
}

export const MindEmptyState: React.FC<MindEmptyStateProps> = ({ variant }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const isEmpty = variant === 'empty';

  return (
    <BentoCard deep style={styles.card}>
      <MaterialIcons
        name={isEmpty ? 'psychology' : 'search-off'}
        size={40}
        color={colors.onSurfaceVariant}
      />
      <AppText variant="label-sm" style={styles.label}>
        {isEmpty ? 'NO CAPTURES YET' : 'NO MATCHES'}
      </AppText>
      <AppText variant="body-md" muted style={styles.body}>
        {isEmpty
          ? 'Save a link, note, or image with +. Turn on Enhance with AI in the save sheet when you want tags and a summary.'
          : 'Try another query or filter.'}
      </AppText>
    </BentoCard>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    minHeight: 220,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.surfaceContainerLowest,
    marginVertical: spacing.lg,
  },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
