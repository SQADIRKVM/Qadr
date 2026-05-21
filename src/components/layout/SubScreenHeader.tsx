import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../primitives/AppText';
import { ResponsiveContainer } from './ResponsiveContainer';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface SubScreenHeaderProps {
  title?: string;
  onBack: () => void;
  onSettingsPress?: () => void;
  onSensorsPress?: () => void;
}

export const SubScreenHeader: React.FC<SubScreenHeaderProps> = ({
  title,
  onBack,
  onSettingsPress,
  onSensorsPress,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.bar}>
    <ResponsiveContainer style={styles.inner}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Pressable
            onPress={() => {
              hapticLight();
              onBack();
            }}
            style={styles.backBtn}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
          </Pressable>
          <AppText variant="headline-md" style={styles.title} numberOfLines={1}>
            {title ?? 'Qadr'}
          </AppText>
        </View>
        {(onSensorsPress ?? onSettingsPress) ? (
          <Pressable
            onPress={() => {
              hapticLight();
              (onSensorsPress ?? onSettingsPress)?.();
            }}
            style={styles.iconBtn}
          >
            <Ionicons
              name={onSettingsPress && !onSensorsPress ? 'settings-outline' : 'pulse-outline'}
              size={22}
              color={colors.primary}
            />
          </Pressable>
        ) : (
          <View style={styles.iconSpacer} />
        )}
      </View>
    </ResponsiveContainer>
  </View>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  bar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  inner: { width: '100%' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    color: colors.onSurface,
    fontWeight: '700',
    letterSpacing: -0.5,
    minWidth: 0,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconSpacer: {
    width: 40,
  },
});
