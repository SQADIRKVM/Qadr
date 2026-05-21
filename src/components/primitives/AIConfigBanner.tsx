import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { hasAIConfigured } from '../../services/ai/client';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface AIConfigBannerProps {
  onPressSettings?: () => void;
}

export const AIConfigBanner: React.FC<AIConfigBannerProps> = ({ onPressSettings }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  if (hasAIConfigured()) return null;

  return (
    <Pressable
      style={({ pressed }) => [styles.banner, pressed && styles.pressed]}
      onPress={onPressSettings}
      disabled={!onPressSettings}
    >
      <MaterialIcons name="info-outline" size={18} color={colors.primary} />
      <AppText variant="body-md" style={styles.text}>
        AI features use your local workspace data until you set{' '}
        <AppText variant="body-md" style={styles.mono}>
          EXPO_PUBLIC_GROQ_API_KEY
        </AppText>{' '}
        in `.env`. See README.
      </AppText>
    </Pressable>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardBg,
  },
  pressed: { opacity: 0.9 },
  text: {
    flex: 1,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  mono: {
    color: colors.primary,
    fontSize: 12,
  },
});
