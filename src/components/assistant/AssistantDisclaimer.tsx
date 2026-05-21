import React from 'react';
import { StyleSheet } from 'react-native';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

export const AssistantDisclaimer: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  return (
    <AppText variant="label-sm" style={styles.text}>
      Qadr uses your workspace data to personalize replies.
    </AppText>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  text: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 4,
    paddingHorizontal: spacing.sm,
    fontSize: 11,
    lineHeight: 16,
  },
});
