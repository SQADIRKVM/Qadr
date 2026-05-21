import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from '../primitives/AppText';
import type { MindItem } from '../../types';
import { normalizeMindTag } from '../../utils/mindTags';
import { getMindFormatBadge } from '../../utils/mindPlatformBadge';
import { MindFormatTagChip } from './MindFormatTagChip';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MindTagEditorProps {
  item: MindItem;
  onTagsChange: (tags: string[]) => void;
}

export const MindTagEditor: React.FC<MindTagEditorProps> = ({ item, onTagsChange }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [draft, setDraft] = useState('');
  const tags = item.autoTags ?? [];
  const formatBadge = getMindFormatBadge(item);

  const addTag = (raw: string) => {
    const tag = normalizeMindTag(raw);
    if (!tag || tags.includes(tag)) {
      setDraft('');
      return;
    }
    hapticLight();
    onTagsChange([...tags, tag]);
    setDraft('');
  };

  const removeTag = (tag: string) => {
    hapticLight();
    onTagsChange(tags.filter((t) => t !== tag));
  };

  return (
    <View style={styles.wrap}>
      <AppText variant="label-sm" style={styles.label}>
        Tags
      </AppText>

      {tags.length === 0 && !formatBadge ? (
        <AppText variant="body-md" muted style={styles.hint}>
          Add tags to find this later
        </AppText>
      ) : null}

      {formatBadge || tags.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagRow}
          keyboardShouldPersistTaps="handled"
        >
          {formatBadge ? <MindFormatTagChip badge={formatBadge} /> : null}
          {tags.map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <AppText variant="body-md" style={styles.tagText}>
                {tag}
              </AppText>
              <Pressable
                hitSlop={8}
                onPress={() => removeTag(tag)}
                accessibilityLabel={`Remove tag ${tag}`}
              >
                <MaterialIcons name="close" size={14} color={colors.onSurfaceVariant} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : null}

      <TextInput
        style={styles.input}
        value={draft}
        onChangeText={setDraft}
        placeholder="Add tag…"
        placeholderTextColor={colors.outlineVariant}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={() => addTag(draft)}
        onBlur={() => {
          if (draft.trim()) addTag(draft);
        }}
      />
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: { gap: spacing.sm },
  label: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  hint: { fontSize: 13 },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    borderRadius: spacing.pillRadius,
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tagText: {
    fontSize: 13,
    color: colors.onSurface,
  },
  input: {
    fontSize: 15,
    color: colors.onSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    paddingVertical: spacing.sm,
    fontFamily: 'Inter_400Regular',
  },
});
