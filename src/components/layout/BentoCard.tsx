import React from 'react';
import { Pressable, View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { spacing } from '../../theme/spacing';
import { ghostHighlight } from '../../theme/patterns';
import { glassCardBase, glassCardDeep } from '../../theme/glass';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface BentoCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accentLeft?: boolean;
  deep?: boolean;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  onPress,
  style,
  accentLeft,
  deep,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const cardStyle = [
    styles.card,
    deep ? glassCardDeep(colors) : glassCardBase(colors),
    accentLeft && styles.accentPad,
    ghostHighlight(colors),
    style,
  ];

  const inner = (
    <>
      {accentLeft && <View style={styles.accentBar} />}
      {children}
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [...cardStyle, pressed && styles.pressed]}>
        {inner}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{inner}</View>;
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: spacing.md,
  },
  deep: {},
  accentPad: { paddingLeft: spacing.sm + 4 },
  pressed: { borderColor: colors.cardBorderHover },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.accentRed,
  },
});
