import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO, differenceInDays } from 'date-fns';
import { BentoCard } from '../layout/BentoCard';
import { SquareCheckbox } from '../layout/SquareCheckbox';
import { AppText } from '../primitives/AppText';
import { useResponsive } from '../../hooks/useResponsive';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import type { ProjectTask } from '../../types';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface DailyGoalsCardProps {
  tasks: ProjectTask[];
  onToggleTask: (taskId: string) => void;
  onAddGoal: () => void;
  style?: ViewStyle;
}

const taskMeta = (task: ProjectTask): string => {
  if (task.done) {
    return `Completed ${format(parseISO(task.lastTouched), 'hh:mm a')}`;
  }
  const days = differenceInDays(new Date(), parseISO(task.lastTouched));
  if (days >= 7) return 'Ghost task — needs attention';
  return 'Due EOD';
};

export const DailyGoalsCard: React.FC<DailyGoalsCardProps> = ({
  tasks,
  onToggleTask,
  onAddGoal,
  style,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { cardPadding } = useResponsive();

  return (
    <BentoCard style={[styles.card, { padding: cardPadding }, style]}>
      <View style={styles.header}>
        <AppText variant="label-sm" style={styles.label}>
          DAILY GOALS
        </AppText>
        <Ionicons name="list-outline" size={22} color={colors.onSurfaceVariant} />
      </View>
      <View style={styles.divider} />
      {tasks.length === 0 ? (
        <AppText variant="body-md" muted style={{ paddingVertical: 16 }}>
          No active tasks. Add a goal to get started.
        </AppText>
      ) : (
        tasks.map((task) => (
          <Pressable
            key={task.id}
            style={[styles.row, task.done && styles.rowDone]}
            onPress={() => {
              hapticLight();
              onToggleTask(task.id);
            }}
          >
            <SquareCheckbox
              checked={task.done}
              onPress={() => {
                hapticLight();
                onToggleTask(task.id);
              }}
            />
            <View style={styles.rowText}>
              <AppText
                variant="body-md"
                style={task.done ? styles.titleDone : undefined}
              >
                {task.title}
              </AppText>
              <AppText variant="label-sm" style={styles.meta}>
                {taskMeta(task)}
              </AppText>
            </View>
          </Pressable>
        ))
      )}
      <Pressable
        style={styles.addBtn}
        onPress={() => {
          hapticLight();
          onAddGoal();
        }}
      >
        <Ionicons name="add" size={16} color={colors.onSurface} />
        <AppText variant="label-sm">Add Goal</AppText>
      </Pressable>
    </BentoCard>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: { flex: 1, minWidth: 0 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: { letterSpacing: 2 },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginHorizontal: -8,
    borderRadius: 8,
  },
  rowDone: { backgroundColor: colors.surfaceContainerHighest },
  rowText: { flex: 1, minWidth: 0 },
  titleDone: { textDecorationLine: 'line-through', opacity: 0.5 },
  meta: {
    color: colors.onSurfaceVariant,
    marginTop: 4,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  addBtn: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: spacing.sm,
  },
});
