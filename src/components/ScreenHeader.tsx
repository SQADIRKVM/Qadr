import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './primitives/AppText';
import { useColors } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import type { ColorPalette } from '../theme/palettes';

interface ScreenHeaderProps {
  title: string;
  badge?: string | number;
  right?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, badge, right }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.row}>
    <View style={styles.left}>
      <AppText variant="label-sm">{title}</AppText>
      {badge !== undefined && (
        <View style={styles.badge}>
          <AppText variant="label-sm" style={{ color: colors.onSecondaryContainer, fontSize: 10 }}>
            {badge}
          </AppText>
        </View>
      )}
    </View>
    {right}
  </View>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 9999,
  },
});
