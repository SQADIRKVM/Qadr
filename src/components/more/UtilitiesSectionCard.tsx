import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface UtilitiesSectionCardProps {
  title: string;
  headerIcon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export const UtilitiesSectionCard: React.FC<UtilitiesSectionCardProps> = ({
  title,
  headerIcon,
  children,
  style,
  contentStyle,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard deep style={[styles.card, style]}>
    <View style={styles.header}>
      <AppText variant="label-sm" style={styles.title}>
        {title}
      </AppText>
      <Ionicons name={headerIcon} size={16} color={colors.onSurfaceVariant} />
    </View>
    <View style={[styles.body, contentStyle]}>{children}</View>
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: { marginBottom: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  body: { gap: 4 },
});
