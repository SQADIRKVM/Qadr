import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AppText } from '../primitives/AppText';
import { Button } from '../primitives/Button';
import { normalizeTime24 } from '../../utils/timeFormat';
import { userAlert } from '../../utils/userAlert';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface SleepTimePickerSheetProps {
  visible: boolean;
  label: string;
  value: string;
  onClose: () => void;
  onSave: (time: string) => void;
}

export const SleepTimePickerSheet: React.FC<SleepTimePickerSheetProps> = ({
  visible,
  label,
  value,
  onClose,
  onSave,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const handleSave = () => {
    const normalized = normalizeTime24(draft);
    if (!normalized) {
      userAlert('Invalid time', 'Use 24-hour times like 09:00 or 23:30.');
      return;
    }
    hapticLight();
    onSave(normalized);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <AppText variant="label-sm" style={styles.title}>
              {label}
            </AppText>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="23:30"
              placeholderTextColor={colors.outlineVariant}
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
              maxLength={5}
            />
            <View style={styles.actions}>
              <Button label="CANCEL" variant="secondary" onPress={onClose} />
              <Button label="SAVE" onPress={handleSave} />
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  flex: { flex: 1 },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  panel: {
    backgroundColor: colors.surfaceContainer,
    borderTopLeftRadius: spacing.cardRadius,
    borderTopRightRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.modalBorder,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.outlineVariant,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: { letterSpacing: 2, marginBottom: spacing.md, color: colors.onSurfaceVariant },
  input: {
    fontSize: 32,
    color: colors.onSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    fontVariant: ['tabular-nums'],
  },
  actions: { flexDirection: 'row', gap: spacing.sm },
});
