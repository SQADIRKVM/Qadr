import React from 'react';
import { StyleSheet } from 'react-native';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

export const AssistantEmptyState: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  return (
    <AppText variant="headline-lg-mobile" style={styles.title}>
      What are you working on?
    </AppText>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  title: {
    color: colors.onSurface,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
});
