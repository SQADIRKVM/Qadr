import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { AppText } from '../primitives/AppText';
import { Button } from '../primitives/Button';
import { MindTagEditor } from './MindTagEditor';
import { glassModalSurface } from '../../theme/glass';
import { useMindStore } from '../../stores/useMindStore';
import type { MindItem } from '../../types';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { isWebPlatform } from '../../utils/webLayout';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MindShareTagNotesSheetProps {
  visible: boolean;
  itemId: string | null;
  onClose: () => void;
  onDone: () => void;
}

export const MindShareTagNotesSheet: React.FC<MindShareTagNotesSheetProps> = ({
  visible,
  itemId,
  onClose,
  onDone,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const item = useMindStore((s) => s.items.find((i) => i.id === itemId));
  const updateItem = useMindStore((s) => s.updateItem);
  const [notes, setNotes] = useState(item?.userNotes ?? '');

  useEffect(() => {
    if (item) setNotes(item.userNotes ?? '');
  }, [item?.id, item?.userNotes]);

  if (!visible || !item) return null;

  const handleTagsChange = (tags: string[]) => {
    updateItem(item.id, { autoTags: tags });
  };

  const handleDone = () => {
    hapticLight();
    updateItem(item.id, { userNotes: notes.trim() || undefined });
    onDone();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          {!isWebPlatform() ? (
            <BlurView intensity={48} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.webBlur]} />
          )}
        </Pressable>
        <Pressable style={styles.sheetWrap} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.sheet, glassModalSurface(colors)]}>
            <AppText variant="label-sm" style={styles.label}>
              Tags & notes
            </AppText>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scroll}
            >
              <MindTagEditor item={item as MindItem} onTagsChange={handleTagsChange} />
              <View style={styles.notesBlock}>
                <AppText variant="label-sm" style={styles.label}>
                  Notes
                </AppText>
                <TextInput
                  style={styles.notesInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Optional notes…"
                  placeholderTextColor={colors.outlineVariant}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>
            <Button label="Done" onPress={handleDone} />
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    flex: { flex: 1, justifyContent: 'flex-end' },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(19, 19, 19, 0.5)',
    },
    webBlur: {
      backgroundColor: 'rgba(19, 19, 19, 0.65)',
    },
    sheetWrap: {
      maxHeight: '78%',
    },
    sheet: {
      borderTopLeftRadius: spacing.cardRadius + 4,
      borderTopRightRadius: spacing.cardRadius + 4,
      padding: spacing.screenMargin,
      paddingBottom: spacing.screenMargin + 8,
      gap: spacing.md,
    },
    label: {
      color: colors.onSurfaceVariant,
      letterSpacing: 1,
    },
    scroll: {
      gap: spacing.lg,
      paddingBottom: spacing.sm,
    },
    notesBlock: { gap: spacing.sm },
    notesInput: {
      minHeight: 88,
      fontSize: 15,
      color: colors.onSurface,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderRadius: spacing.cardRadius,
      padding: spacing.md,
      fontFamily: 'Inter_400Regular',
    },
  });
