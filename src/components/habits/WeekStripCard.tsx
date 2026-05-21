import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { format } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import type { DayDotState } from '../../utils/habitsTracker';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface WeekDay {
  date: Date;
  state: DayDotState;
}

interface WeekStripCardProps {
  weekLabel: string;
  days: WeekDay[];
  onDayPress?: (date: Date) => void;
  selectedDate?: string;
}

export const WeekStripCard: React.FC<WeekStripCardProps> = ({
  weekLabel,
  days,
  onDayPress,
  selectedDate,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard style={styles.card}>
    <View style={styles.header}>
      <AppText variant="label-sm" style={styles.label}>
        {weekLabel}
      </AppText>
      <MaterialIcons name="calendar-today" size={18} color={colors.onSurfaceVariant} />
    </View>
    <View style={styles.row}>
      {days.map(({ date, state }) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const selected = selectedDate === dateKey;
        const col = (
          <>
            <AppText
              variant="label-sm"
              style={[
                styles.dayLabel,
                state === 'today' && styles.dayLabelToday,
                state === 'future' && styles.dayLabelFuture,
                selected && styles.dayLabelSelected,
              ]}
            >
              {format(date, 'EEEEE').charAt(0)}
            </AppText>
            <View style={styles.dotWrap}>
              {state === 'today' ? <View style={styles.todayRing} /> : null}
              <View style={[styles.dot, dotStyle(state, colors), selected && styles.dotSelected]} />
            </View>
          </>
        );
        return onDayPress ? (
          <Pressable
            key={dateKey}
            style={styles.dayCol}
            onPress={() => onDayPress(date)}
            disabled={state === 'future'}
          >
            {col}
          </Pressable>
        ) : (
          <View key={dateKey} style={styles.dayCol}>
            {col}
          </View>
        );
      })}
    </View>
  </BentoCard>
  );
};

function dotStyle(state: DayDotState, colors: ColorPalette) {
  switch (state) {
    case 'complete':
      return { backgroundColor: colors.onSurfaceVariant };
    case 'partial':
      return { backgroundColor: colors.tertiary };
    case 'today':
      return { backgroundColor: colors.onSurface };
    case 'future':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.outlineVariant,
      };
    default:
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.outlineVariant,
      };
  }
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: { padding: spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1.5,
    fontSize: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dayLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  dayLabelToday: { color: colors.onSurface },
  dayLabelFuture: { color: colors.outline },
  dayLabelSelected: { color: colors.onTertiaryContainer },
  dotWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayRing: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotSelected: {
    transform: [{ scale: 1.35 }],
    borderWidth: 1,
    borderColor: colors.onTertiaryContainer,
  },
});
