import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { HabitToggle } from './HabitToggle';
import { getHabitMaterialIcon } from '../../utils/habitsTracker';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface HabitTrackerCardProps {
  name: string;
  icon: string;
  subtitle?: string;
  streak: number;
  completed: boolean;
  onToggle: () => void;
  onLongPress?: () => void;
  wide?: boolean;
}

export const HabitTrackerCard: React.FC<HabitTrackerCardProps> = ({
  name,
  icon,
  subtitle,
  streak,
  completed,
  onToggle,
  onLongPress,
  wide,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const materialIcon = getHabitMaterialIcon(icon);

  return (
    <Pressable onLongPress={onLongPress} delayLongPress={400}>
      <BentoCard style={[styles.card, wide && styles.cardWide]}>
        <View style={styles.top}>
          <View style={styles.left}>
            <View style={[styles.iconCircle, !completed && styles.iconCircleMuted]}>
              {materialIcon ? (
                <MaterialIcons
                  name={materialIcon as React.ComponentProps<typeof MaterialIcons>['name']}
                  size={22}
                  color={completed ? colors.onSurface : colors.onSurfaceVariant}
                />
              ) : (
                <Text style={styles.emoji}>{icon}</Text>
              )}
            </View>
            <View style={styles.textCol}>
              <AppText
                variant="headline-md"
                style={[styles.title, !completed && styles.titleMuted]}
                numberOfLines={2}
              >
                {name}
              </AppText>
              {subtitle ? (
                <AppText variant="body-md" muted numberOfLines={1}>
                  {subtitle}
                </AppText>
              ) : null}
            </View>
          </View>
          <HabitToggle value={completed} onValueChange={() => onToggle()} />
        </View>
        <View style={styles.footer}>
          <View style={[styles.streakDot, completed && styles.streakDotActive]} />
          <AppText variant="label-sm" style={[styles.streak, !completed && styles.streakMuted]}>
            {streak} DAY STREAK
          </AppText>
        </View>
      </BentoCard>
    </Pressable>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    minHeight: 160,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  cardWide: { minHeight: 160 },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleMuted: {
    backgroundColor: colors.surfaceContainerLowest,
  },
  emoji: { fontSize: 20 },
  textCol: { flex: 1, gap: 4 },
  title: { color: colors.onSurface },
  titleMuted: { color: colors.onSurfaceVariant },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.md,
  },
  streakDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.outlineVariant,
  },
  streakDotActive: {
    backgroundColor: colors.tertiary,
  },
  streak: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1.5,
    fontSize: 10,
  },
  streakMuted: {
    color: colors.outline,
  },
});
