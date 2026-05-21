import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle, PressableProps } from 'react-native';
import { spacing } from '../../theme/spacing';
import { elevation } from '../../theme/elevation';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface CardProps extends PressableProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accentLeft?: boolean;
  muted?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  accentLeft,
  muted,
  onPress,
  ...rest
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const content = (
    <>
      {accentLeft && <View style={styles.accentBar} />}
      {children}
    </>
  );

  const cardStyle = [
    styles.card,
    muted && styles.muted,
    accentLeft && styles.accentCard,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          ...cardStyle,
          pressed && { borderColor: colors.cardBorderHover },
        ]}
        {...rest}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{content}</View>;
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    ...elevation.level1,
    borderRadius: spacing.cardRadius,
    padding: spacing.sm,
    overflow: 'hidden',
  },
  muted: { opacity: 0.5 },
  accentCard: { paddingLeft: spacing.sm + 4 },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.accentRed,
  },
});
