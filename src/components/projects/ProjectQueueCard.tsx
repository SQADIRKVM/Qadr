import React from 'react';
import { View, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

export interface QueueItem {
  id: string;
  name: string;
}

interface ProjectQueueCardProps {
  items: QueueItem[];
  capacityLabel: string;
  onSelect: (id: string) => void;
  onAddProject?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ProjectQueueCard: React.FC<ProjectQueueCardProps> = ({
  items,
  capacityLabel,
  onSelect,
  onAddProject,
  style,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard deep style={[styles.card, style]}>
    <View style={styles.header}>
      <MaterialIcons name="inventory-2" size={20} color={colors.onSurfaceVariant} />
      <AppText variant="label-sm" style={styles.label}>
        PROJECT QUEUE
      </AppText>
    </View>

    {items.length === 0 ? (
      <Pressable
        onPress={() => {
          hapticLight();
          onAddProject?.();
        }}
        style={styles.emptyRow}
      >
        <AppText variant="body-md" muted>
          Queue is empty. Tap to add a project.
        </AppText>
      </Pressable>
    ) : (
      items.map((item, index) => (
        <Pressable
          key={item.id}
          onPress={() => {
            hapticLight();
            onSelect(item.id);
          }}
          style={[styles.row, index < items.length - 1 && styles.rowBorder]}
        >
          <View style={styles.rowLeft}>
            <View style={styles.dot} />
            <AppText variant="body-md" style={styles.name}>
              {item.name}
            </AppText>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
        </Pressable>
      ))
    )}

    <View style={styles.footer}>
      <AppText variant="label-sm" style={styles.footerLabel}>
        Capacity
      </AppText>
      <Pressable
        onPress={() => {
          if (onAddProject) {
            hapticLight();
            onAddProject();
          }
        }}
        disabled={!onAddProject}
      >
        <AppText variant="label-sm" style={styles.capacity}>
          {capacityLabel}
        </AppText>
      </Pressable>
    </View>
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
  emptyRow: {
    paddingVertical: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.outline,
  },
  name: {
    color: colors.onSurface,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  footerLabel: {
    color: colors.outlineVariant,
    letterSpacing: 1,
    fontSize: 10,
  },
  capacity: {
    color: colors.outlineVariant,
    letterSpacing: 1,
    fontSize: 10,
  },
});
