import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface UserMessageBubbleProps {
  text: string;
}

export const UserMessageBubble: React.FC<UserMessageBubbleProps> = ({ text }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.wrap}>
    <AppText variant="label-sm" style={styles.label}>
      YOU
    </AppText>
    <View style={styles.bubble}>
      <AppText variant="body-md" style={styles.text}>
        {text}
      </AppText>
    </View>
  </View>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: {
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.onSurfaceVariant,
    opacity: 0.7,
    letterSpacing: 2,
    fontSize: 10,
  },
  bubble: {
    maxWidth: '90%',
    backgroundColor: colors.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 24,
    borderTopRightRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: spacing.md,
  },
  text: {
    color: colors.onSurface,
    lineHeight: 24,
  },
});
