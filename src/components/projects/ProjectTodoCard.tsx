import React from 'react';
import { View, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import type { ProjectTask } from '../../types';
import type { TaskDisplayTag } from '../../utils/projectManager';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

export interface TodoItem {
  task: ProjectTask;
  tag: TaskDisplayTag | null;
}

interface ProjectTodoCardProps {
  items: TodoItem[];
  onToggle: (taskId: string) => void;
  onAdd: () => void;
  style?: StyleProp<ViewStyle>;
  emptyMessage?: string;
}

export const ProjectTodoCard: React.FC<ProjectTodoCardProps> = ({
  items,
  onToggle,
  onAdd,
  style,
  emptyMessage,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard deep style={[styles.card, style]}>
    <View style={styles.header}>
      <MaterialIcons name="checklist" size={20} color={colors.onSurfaceVariant} />
      <AppText variant="label-sm" style={styles.label}>
        TO-DO
      </AppText>
    </View>

    {items.length === 0 && emptyMessage ? (
      <AppText variant="body-md" muted style={styles.emptyMsg}>
        {emptyMessage}
      </AppText>
    ) : null}

    {items.map(({ task, tag }, index) => (
      <Pressable
        key={task.id}
        onPress={() => {
          hapticLight();
          onToggle(task.id);
        }}
        style={[styles.row, index < items.length - 1 && styles.rowBorder]}
      >
        <MaterialIcons
          name={task.done ? 'check-box' : 'check-box-outline-blank'}
          size={22}
          color={task.done ? colors.primary : colors.outlineVariant}
          style={styles.checkbox}
        />
        <View style={styles.rowText}>
          <AppText
            variant="body-md"
            style={[styles.title, task.done && styles.titleDone]}
          >
            {task.title}
          </AppText>
          {tag && !task.done ? (
            <View style={[styles.tag, tag === 'blocker' && styles.tagBlocker]}>
              <AppText
                variant="label-sm"
                style={[styles.tagText, tag === 'blocker' && styles.tagTextBlocker]}
              >
                {tag === 'critical' ? 'Critical' : 'Blocker'}
              </AppText>
            </View>
          ) : null}
        </View>
      </Pressable>
    ))}

    <Pressable
      onPress={() => {
        hapticLight();
        onAdd();
      }}
      style={styles.addRow}
    >
      <MaterialIcons name="add" size={24} color={colors.outlineVariant} />
    </Pressable>
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    fontSize: 10,
  },
  emptyMsg: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  checkbox: {
    marginTop: 2,
  },
  rowText: {
    flex: 1,
    gap: 8,
  },
  title: {
    color: colors.onSurface,
  },
  titleDone: {
    color: colors.outline,
    textDecorationLine: 'line-through',
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.modalBorder,
  },
  tagBlocker: {
    borderColor: colors.onTertiaryContainer,
  },
  tagText: {
    fontSize: 10,
    color: colors.outlineVariant,
    letterSpacing: 0.5,
  },
  tagTextBlocker: {
    color: colors.onTertiaryContainer,
  },
  addRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
});
