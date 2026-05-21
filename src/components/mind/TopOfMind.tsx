import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../primitives/AppText';
import type { MindItem } from '../../types';
import { getMindDisplayTitle } from '../../utils/mindTitle';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface TopOfMindProps {
  items: MindItem[];
  onPressItem: (id: string) => void;
}

export const TopOfMind: React.FC<TopOfMindProps> = ({ items, onPressItem }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  if (items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <AppText variant="label-sm" style={styles.label}>
        PINNED
      </AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={styles.chip}
            onPress={() => {
              hapticLight();
              onPressItem(item.id);
            }}
          >
            <AppText variant="body-md" numberOfLines={1} style={styles.chipText}>
              {getMindDisplayTitle(item)}
            </AppText>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    fontSize: 10,
  },
  row: {
    gap: spacing.sm,
  },
  chip: {
    maxWidth: 180,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.pillRadius,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardBg,
  },
  chipText: {
    color: colors.onSurface,
  },
});
