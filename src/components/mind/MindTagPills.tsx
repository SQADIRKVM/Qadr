import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Chip } from '../primitives/Chip';
import { SectionHeader } from '../layout/SectionHeader';
import type { MindItem } from '../../types';
import { getMindFormatBadge } from '../../utils/mindPlatformBadge';
import { MindFormatTagChip } from './MindFormatTagChip';
import { spacing } from '../../theme/spacing';

interface MindTagPillsProps {
  item: MindItem;
}

export const MindTagPills: React.FC<MindTagPillsProps> = ({ item }) => {
  const tags = item.autoTags ?? [];
  const formatBadge = getMindFormatBadge(item);

  if (tags.length === 0 && !formatBadge) return null;

  return (
    <View style={styles.wrap}>
      <SectionHeader title="TAGS" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {formatBadge ? <MindFormatTagChip badge={formatBadge} /> : null}
        {tags.map((tag) => (
          <View key={tag} style={styles.chipWrap} pointerEvents="none">
            <Chip label={tag} selected={false} onPress={() => {}} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { gap: 8, paddingVertical: 4 },
  chipWrap: { opacity: 0.95 },
});
