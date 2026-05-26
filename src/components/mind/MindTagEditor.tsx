import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppText } from '../primitives/AppText';
import type { MindItem } from '../../types';
import { normalizeMindTag, isJunkTopicToken } from '../../utils/mindTags';
import { getMindFormatBadge } from '../../utils/mindPlatformBadge';
import { MindFormatTagChip } from './MindFormatTagChip';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useMindStore } from '../../stores/useMindStore';
import { useIdeaUiStore } from '../../stores/useIdeaUiStore';
import type { ColorPalette } from '../../theme/palettes';

interface MindTagEditorProps {
  item: MindItem;
  onTagsChange: (tags: string[]) => void;
}

export const MindTagEditor: React.FC<MindTagEditorProps> = ({ item, onTagsChange }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const items = useMindStore((s) => s.items);
  const setMindSearch = useIdeaUiStore((s) => s.setMindSearch);
  const setMindTab = useIdeaUiStore((s) => s.setMindTab);
  const setViewMode = useIdeaUiStore((s) => s.setViewMode);

  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  const tags = item.autoTags ?? [];
  const formatBadge = getMindFormatBadge(item);

  // Suggestions of previously created tags
  const allUserTags = useMemo(() => {
    const all = items.flatMap((i) => i.autoTags ?? []);
    const unique = [...new Set(all)];
    const available = unique.filter((t) => !tags.includes(t) && !isJunkTopicToken(t));
    return available.slice(0, 10);
  }, [items, tags]);

  const addTag = (raw: string) => {
    const tag = normalizeMindTag(raw);
    if (!tag || tags.includes(tag)) {
      setDraft('');
      setAdding(false);
      return;
    }
    hapticLight();
    onTagsChange([...tags, tag]);
    setDraft('');
    setAdding(false);
  };

  const removeTag = (tag: string) => {
    hapticLight();
    onTagsChange(tags.filter((t) => t !== tag));
  };

  const onTagClick = (tag: string) => {
    hapticLight();
    setMindSearch('#' + tag);
    setMindTab('everything');
    setViewMode('vault');
    navigation.goBack();
  };

  return (
    <View style={styles.wrap}>
      <AppText variant="label-sm" style={styles.label}>
        MIND TAGS
      </AppText>

      {adding ? (
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.fullInput}
              value={draft}
              onChangeText={setDraft}
              placeholder="Type a tag name..."
              placeholderTextColor={colors.outlineVariant}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={() => addTag(draft)}
            />
            <Pressable style={styles.addSubmitButton} onPress={() => addTag(draft)}>
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          {allUserTags.length > 0 ? (
            <View style={styles.suggestionsRow}>
              <AppText style={styles.suggestionLabel}>Last used: </AppText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionList}
                keyboardShouldPersistTaps="handled"
              >
                {allUserTags.map((t, idx) => (
                  <Pressable key={t} onPress={() => addTag(t)}>
                    <AppText style={styles.suggestionText}>
                      {t}
                      {idx < allUserTags.length - 1 ? ', ' : ''}
                    </AppText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.tagGridContainer}>
        {!adding && (
          <Pressable
            style={styles.addButtonInline}
            onPress={() => {
              hapticLight();
              setAdding(true);
            }}
          >
            <AppText style={styles.addButtonText}>+ Add tag</AppText>
          </Pressable>
        )}

        {formatBadge ? <MindFormatTagChip badge={formatBadge} /> : null}

        {tags.map((tag) => (
          <Pressable
            key={tag}
            style={styles.tagChip}
            onHoverIn={() => setHoveredTag(tag)}
            onHoverOut={() => setHoveredTag(null)}
            onPress={() => onTagClick(tag)}
          >
            <AppText variant="body-md" style={styles.tagText}>
              {tag}
            </AppText>
            {hoveredTag === tag ? (
              <Pressable
                hitSlop={8}
                onPress={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                style={styles.closeBtn}
                accessibilityLabel={`Remove tag ${tag}`}
              >
                <MaterialIcons name="close" size={12} color={colors.onSurfaceVariant} />
              </Pressable>
            ) : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    fontFamily: 'SpaceGrotesk_700Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  tagGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
    width: '100%',
  },
  addButtonInline: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: spacing.pillRadius,
    backgroundColor: colors.accentRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 13,
    color: colors.onPrimary,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  inputContainer: {
    gap: spacing.xs,
    width: '100%',
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  fullInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.cardRadius - 4,
    backgroundColor: colors.surfaceContainerHigh || '#2A292D',
    color: colors.onSurface,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  addSubmitButton: {
    width: 44,
    height: 44,
    borderRadius: spacing.cardRadius - 4,
    backgroundColor: colors.accentRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  suggestionLabel: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: 'Inter_400Regular',
  },
  suggestionList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 12,
    color: colors.accentRed,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    borderRadius: spacing.pillRadius,
    backgroundColor: colors.surfaceContainerHigh || '#2A292D',
  },
  tagText: {
    fontSize: 13,
    color: colors.onSurface,
    fontFamily: 'Inter_400Regular',
  },
  closeBtn: {
    opacity: 0.75,
    marginLeft: 2,
  },
});
