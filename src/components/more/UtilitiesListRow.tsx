import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../primitives/AppText';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface UtilitiesListRowProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export const UtilitiesListRow: React.FC<UtilitiesListRowProps> = ({
  label,
  icon,
  onPress,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <Pressable
    onPress={() => {
      hapticLight();
      onPress();
    }}
    style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
  >
    <View style={styles.left}>
      <Ionicons name={icon} size={22} color={colors.onSurfaceVariant} />
      <AppText variant="body-md" style={styles.label}>
        {label}
      </AppText>
    </View>
    <Ionicons name="arrow-forward" size={18} color={colors.outlineVariant} />
  </Pressable>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: -4,
  },
  rowPressed: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  label: {
    color: colors.onSurfaceVariant,
    flex: 1,
  },
});
