import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from '../primitives/Chip';
import { VAULT_CATEGORY_PILLS, type VaultCategoryFilter } from '../../utils/ideaVault';

interface IdeaCategoryPillsProps {
  value: VaultCategoryFilter;
  onChange: (value: VaultCategoryFilter) => void;
}

export const IdeaCategoryPills: React.FC<IdeaCategoryPillsProps> = ({ value, onChange }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.row}
    style={styles.scroll}
  >
    {VAULT_CATEGORY_PILLS.map((pill) => (
      <Chip
        key={pill.value}
        label={pill.label}
        selected={value === pill.value}
        onPress={() => onChange(pill.value)}
      />
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, maxWidth: '100%' },
  row: { gap: 8, paddingVertical: 4 },
});
