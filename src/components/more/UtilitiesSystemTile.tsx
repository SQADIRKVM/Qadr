import React from 'react';
import { Pressable, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../primitives/AppText';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface UtilitiesSystemTileProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const UtilitiesSystemTile: React.FC<UtilitiesSystemTileProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  style,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <Pressable
    onPress={() => {
      hapticLight();
      onPress();
    }}
    style={({ pressed }) => [styles.tile, pressed && styles.tilePressed, style]}
  >
    <View style={styles.left}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={22} color={colors.onSurfaceVariant} />
      </View>
      <View style={styles.text}>
        <AppText variant="body-md" style={styles.title}>
          {title}
        </AppText>
        <AppText variant="label-sm" style={styles.subtitle}>
          {subtitle}
        </AppText>
      </View>
    </View>
    <Ionicons name="arrow-forward" size={20} color={colors.outlineVariant} />
  </Pressable>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.cardBgDeep,
  },
  tilePressed: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceContainerHighest,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  title: { color: colors.primary },
  subtitle: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
