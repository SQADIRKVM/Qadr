import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { JournalCard } from './JournalCard';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface WeeklyDirectiveCardProps {
  title: string;
  subtitle: string;
  onPress?: () => void;
}

export const WeeklyDirectiveCard: React.FC<WeeklyDirectiveCardProps> = ({
  title,
  subtitle,
  onPress,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.wrap}>
    <AppText variant="label-sm" style={styles.sectionLabel}>
      LOOKING AHEAD
    </AppText>
    <JournalCard style={styles.inner} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="edit-note" size={24} color={colors.onSurface} style={{ opacity: 0.8 }} />
        </View>
        <View style={styles.textCol}>
          <AppText variant="headline-md" style={styles.title}>
            {title}
          </AppText>
          <AppText variant="body-md" muted style={styles.subtitle}>
            {subtitle}
          </AppText>
        </View>
        <MaterialIcons name="arrow-forward" size={22} color={colors.onSurfaceVariant} />
      </View>
    </JournalCard>
  </View>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  sectionLabel: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  inner: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: colors.cardBorder,
    padding: spacing.lg,
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
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.onSurface,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.8,
  },
});
