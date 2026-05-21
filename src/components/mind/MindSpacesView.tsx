import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { Button } from '../primitives/Button';
import { useMindSpacesStore } from '../../stores/useMindSpacesStore';
import { useMindStore } from '../../stores/useMindStore';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { confirmAction } from '../../utils/confirmAction';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MindSpacesViewProps {
  onOpenSpace: (spaceId: string) => void;
}

export const MindSpacesView: React.FC<MindSpacesViewProps> = ({ onOpenSpace }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { spaces, addSpace, renameSpace, removeSpace } = useMindSpacesStore();
  const items = useMindStore((s) => s.items);
  const updateItem = useMindStore((s) => s.updateItem);
  const [newName, setNewName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of spaces) map[s.id] = 0;
    for (const item of items) {
      if (!item.isArchived && item.spaceId && map[item.spaceId] != null) {
        map[item.spaceId] += 1;
      }
    }
    return map;
  }, [spaces, items]);

  const unassigned = useMemo(
    () => items.filter((i) => !i.isArchived && !i.spaceId).length,
    [items],
  );

  const handleCreate = () => {
    const id = addSpace(newName);
    if (id) {
      setNewName('');
      hapticLight();
    }
  };

  const startRename = (id: string, name: string) => {
    setRenamingId(id);
    setRenameDraft(name);
  };

  const saveRename = () => {
    if (renamingId && renameDraft.trim()) {
      renameSpace(renamingId, renameDraft);
    }
    setRenamingId(null);
    setRenameDraft('');
  };

  const handleRemove = (id: string, name: string) => {
    confirmAction(
      'Delete space',
      `Remove "${name}"? Captures stay in your vault unassigned.`,
      () => {
        items
          .filter((i) => i.spaceId === id)
          .forEach((i) => updateItem(i.id, { spaceId: null }));
        removeSpace(id);
      },
      { confirmLabel: 'Delete', destructive: true },
    );
  };

  return (
    <View style={styles.wrap}>
      <BentoCard style={styles.createCard}>
        <AppText variant="label-sm" style={styles.label}>
          NEW SPACE
        </AppText>
        <TextInput
          style={styles.input}
          value={newName}
          onChangeText={setNewName}
          placeholder="Space name"
          placeholderTextColor={colors.outlineVariant}
        />
        <Button label="CREATE SPACE" onPress={handleCreate} />
      </BentoCard>

      <Pressable
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        onPress={() => onOpenSpace('')}
      >
        <BentoCard style={styles.spaceCard}>
          <AppText variant="headline-md">All captures</AppText>
          <AppText variant="body-md" muted>
            {unassigned} unassigned · {items.filter((i) => !i.isArchived).length} total
          </AppText>
        </BentoCard>
      </Pressable>

      {spaces.map((space) => (
        <View key={space.id} style={styles.row}>
          {renamingId === space.id ? (
            <BentoCard style={styles.spaceCard}>
              <TextInput
                style={styles.input}
                value={renameDraft}
                onChangeText={setRenameDraft}
                autoFocus
              />
              <View style={styles.inlineActions}>
                <Button label="SAVE" onPress={saveRename} />
                <Button label="CANCEL" variant="secondary" onPress={() => setRenamingId(null)} />
              </View>
            </BentoCard>
          ) : (
            <Pressable
              onPress={() => {
                hapticLight();
                onOpenSpace(space.id);
              }}
              style={({ pressed }) => pressed && { opacity: 0.9 }}
            >
              <BentoCard style={styles.spaceCard}>
                <View style={styles.spaceHeader}>
                  <AppText variant="headline-md">{space.name}</AppText>
                  <AppText variant="label-sm" style={styles.count}>
                    {counts[space.id] ?? 0} captures
                  </AppText>
                </View>
                <View style={styles.spaceActions}>
                  <Pressable onPress={() => startRename(space.id, space.name)} hitSlop={8}>
                    <AppText variant="label-sm" style={styles.action}>
                      RENAME
                    </AppText>
                  </Pressable>
                  <Pressable onPress={() => handleRemove(space.id, space.name)} hitSlop={8}>
                    <AppText variant="label-sm" style={styles.actionDanger}>
                      DELETE
                    </AppText>
                  </Pressable>
                </View>
              </BentoCard>
            </Pressable>
          )}
        </View>
      ))}

      {spaces.length === 0 ? (
        <AppText variant="body-md" muted style={styles.hint}>
          Create a space to group captures. Assign items from capture detail.
        </AppText>
      ) : null}
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: { gap: spacing.md, paddingBottom: spacing.xl },
  createCard: { padding: spacing.lg, gap: spacing.sm },
  label: { letterSpacing: 2, color: colors.onSurfaceVariant },
  input: {
    fontSize: 16,
    color: colors.onSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    paddingVertical: 8,
  },
  row: { width: '100%' },
  pressed: { opacity: 0.92 },
  spaceCard: { padding: spacing.lg, gap: spacing.sm },
  spaceHeader: { gap: 4 },
  count: { color: colors.onSurfaceVariant, letterSpacing: 1 },
  spaceActions: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xs },
  action: { color: colors.primary, letterSpacing: 1 },
  actionDanger: { color: colors.onTertiaryContainer, letterSpacing: 1 },
  inlineActions: { flexDirection: 'row', gap: spacing.sm },
  hint: { textAlign: 'center', marginTop: spacing.md },
});
