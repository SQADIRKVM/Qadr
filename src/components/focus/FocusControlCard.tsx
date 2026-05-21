import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { glowShadow } from '../../theme/shadows';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface FocusControlCardProps {
  dndEnabled: boolean;
  onToggleDnd: () => void;
}

export const FocusControlCard: React.FC<FocusControlCardProps> = ({
  dndEnabled,
  onToggleDnd,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard deep style={styles.card}>
    <View style={styles.topLine} pointerEvents="none" />
    <View style={styles.row}>
      <View style={styles.iconCircle}>
        <MaterialIcons name="notifications-paused" size={22} color={colors.primary} />
      </View>
      <View style={styles.copy}>
        <AppText variant="body-lg" style={styles.title}>
          Silence the World
        </AppText>
        <AppText variant="label-sm" style={styles.sub}>
          DND {dndEnabled ? 'Enabled' : 'Off'}
        </AppText>
      </View>
      <Pressable
        onPress={() => {
          hapticLight();
          onToggleDnd();
        }}
        style={[styles.toggle, dndEnabled && styles.toggleOn]}
        accessibilityRole="switch"
        accessibilityState={{ checked: dndEnabled }}
        accessibilityLabel="Toggle Do Not Disturb"
      >
        <View style={[styles.knob, dndEnabled && styles.knobOn]} />
      </Pressable>
    </View>
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    width: '100%',
    padding: spacing.lg,
    marginBottom: spacing.md,
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
  toggle: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.outlineVariant,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: {
    backgroundColor: colors.onTertiaryContainer,
    ...glowShadow,
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.inverseSurface,
    alignSelf: 'flex-start',
  },
  knobOn: {
    alignSelf: 'flex-end',
  },
});
