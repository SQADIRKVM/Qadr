import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';
import { AppText } from '../primitives/AppText';
import type { MindFormatBadge } from '../../utils/mindPlatformBadge';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MindFormatTagChipProps {
  badge: MindFormatBadge;
}

export const MindFormatTagChip: React.FC<MindFormatTagChipProps> = ({ badge }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.chip}>
      {badge.platform === 'twitter' ? (
        <FontAwesome6 name="x-twitter" size={12} color={colors.onSurface} />
      ) : (
        <MaterialCommunityIcons name={badge.icon} size={14} color={colors.onSurface} />
      )}
      <AppText variant="body-md" style={styles.label}>
        {badge.label}
      </AppText>
    </View>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 10,
    paddingRight: 12,
    paddingVertical: 6,
    borderRadius: spacing.pillRadius,
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  label: {
    fontSize: 13,
    color: colors.onSurface,
  },
});
