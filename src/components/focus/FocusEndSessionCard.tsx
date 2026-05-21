import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface FocusEndSessionCardProps {
  onPress: () => void;
}

export const FocusEndSessionCard: React.FC<FocusEndSessionCardProps> = ({ onPress }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <Pressable
    onPress={() => {
      hapticLight();
      onPress();
    }}
    style={({ pressed }) => [pressed && styles.pressed]}
  >
    <BentoCard deep style={styles.card}>
      <View style={styles.topLine} pointerEvents="none" />
      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="stop" size={22} color={colors.primary} />
        </View>
        <View style={styles.copy}>
          <AppText variant="body-lg" style={styles.title}>
            End Session
          </AppText>
          <AppText variant="label-sm" style={styles.sub}>
            Return to standard
          </AppText>
        </View>
      </View>
    </BentoCard>
  </Pressable>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  pressed: {
    opacity: 0.92,
  },
  card: {
    width: '100%',
    padding: spacing.lg,
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.onSurface,
    fontWeight: '500',
  },
  sub: {
    color: colors.onSurfaceVariant,
    marginTop: 4,
    letterSpacing: 0.5,
  },
});
