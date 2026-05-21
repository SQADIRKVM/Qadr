import React from 'react';
import { Pressable, View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface JournalCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export const JournalCard: React.FC<JournalCardProps> = ({ children, style, onPress }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const cardStyle = [styles.card, style];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed, Platform.OS === 'web' && styles.webPressable]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{children}</View>;
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 24,
    overflow: 'hidden',
  },
  pressed: {
    borderColor: colors.modalBorder,
  },
  webPressable: Platform.select({
    web: { outlineStyle: 'none' } as object,
    default: {},
  }),
});
