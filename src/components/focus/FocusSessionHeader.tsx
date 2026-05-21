import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface FocusSessionHeaderProps {
  onBack: () => void;
  onPressEdit?: () => void;
}

export const FocusSessionHeader: React.FC<FocusSessionHeaderProps> = ({
  onBack,
  onPressEdit,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.bar}>
    <Pressable
      onPress={() => {
        hapticLight();
        onBack();
      }}
      style={styles.backBtn}
      accessibilityLabel="Go back"
    >
      <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
    </Pressable>

    <View style={styles.center} pointerEvents="none">
      <AppText variant="label-sm" style={styles.label}>
        SESSION ACTIVE
      </AppText>
    </View>

    {onPressEdit ? (
      <Pressable
        onPress={() => {
          hapticLight();
          onPressEdit();
        }}
        style={styles.editBtn}
        accessibilityRole="button"
        accessibilityLabel="Edit focus setup"
      >
        <AppText variant="label-sm" style={styles.editLabel}>
          Edit
        </AppText>
      </Pressable>
    ) : (
      <View style={styles.spacer} />
    )}
  </View>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenMargin,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  spacer: {
    width: 48,
    height: 48,
  },
  editBtn: {
    minWidth: 48,
    height: 48,
    paddingHorizontal: spacing.sm,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editLabel: {
    color: colors.onTertiaryContainer,
    letterSpacing: 1,
  },
});
