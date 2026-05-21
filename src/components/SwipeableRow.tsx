import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { AppText } from './primitives/AppText';
import { MECHANICAL_EASING, ANIMATION_DURATION } from '../theme/animation';
import { useColors } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import type { ColorPalette } from '../theme/palettes';

interface SwipeableRowProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftLabel?: string;
  rightLabel?: string;
}

export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftLabel = 'ARCHIVE',
  rightLabel = '→ PROJECT',
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const tx = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      tx.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX < -80 && onSwipeLeft) {
        runOnJS(onSwipeLeft)();
        tx.value = withTiming(0, { duration: ANIMATION_DURATION, easing: MECHANICAL_EASING });
      } else if (e.translationX > 80 && onSwipeRight) {
        runOnJS(onSwipeRight)();
        tx.value = withTiming(0, { duration: ANIMATION_DURATION, easing: MECHANICAL_EASING });
      } else {
        tx.value = withTiming(0, { duration: ANIMATION_DURATION, easing: MECHANICAL_EASING });
      }
    });

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }));

  return (
    <View style={styles.wrap}>
      <View style={[styles.action, styles.left]}>
        <AppText variant="label-sm" style={{ color: colors.accentRed }}>
          {leftLabel}
        </AppText>
      </View>
      <View style={[styles.action, styles.right]}>
        <AppText variant="label-sm" style={{ color: colors.outline }}>
          {rightLabel}
        </AppText>
      </View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.row, style]}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: { position: 'relative', overflow: 'hidden' },
  action: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  left: { right: 0 },
  right: { left: 0 },
  row: { backgroundColor: colors.background, paddingVertical: 16 },
});
