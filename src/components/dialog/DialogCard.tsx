import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AppText } from '../primitives/AppText';
import { DialogActions } from './DialogActions';
import { useDialogStore } from '../../stores/useDialogStore';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { glassModalSurface } from '../../theme/glass';
import { spacing } from '../../theme/spacing';
import type { ColorPalette } from '../../theme/palettes';

export const DialogHost: React.FC = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const visible = useDialogStore((s) => s.visible);
  const kind = useDialogStore((s) => s.kind);
  const title = useDialogStore((s) => s.title);
  const message = useDialogStore((s) => s.message);
  const confirmLabel = useDialogStore((s) => s.confirmLabel);
  const cancelLabel = useDialogStore((s) => s.cancelLabel);
  const destructive = useDialogStore((s) => s.destructive);
  const confirmPhrase = useDialogStore((s) => s.confirmPhrase);
  const phraseHint = useDialogStore((s) => s.phraseHint);
  const onConfirm = useDialogStore((s) => s.onConfirm);
  const onCancel = useDialogStore((s) => s.onCancel);
  const dismiss = useDialogStore((s) => s.dismiss);

  const [typed, setTyped] = useState('');
  const [loading, setLoading] = useState(false);

  const resetLocal = useCallback(() => {
    setTyped('');
    setLoading(false);
  }, []);

  useEffect(() => {
    if (visible) resetLocal();
  }, [visible, title, kind, resetLocal]);

  const handleDismiss = useCallback(() => {
    onCancel?.();
    dismiss();
    resetLocal();
  }, [dismiss, onCancel, resetLocal]);

  const handleConfirm = useCallback(async () => {
    if (!onConfirm) {
      dismiss();
      resetLocal();
      return;
    }
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      dismiss();
      resetLocal();
    }
  }, [dismiss, onConfirm, resetLocal]);

  const phraseMatch =
    kind !== 'typedConfirm' ||
    (confirmPhrase !== undefined && typed.trim() === confirmPhrase.trim());

  const backdropDismiss = kind === 'alert';

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          style={styles.backdrop}
          onPress={backdropDismiss ? handleDismiss : undefined}
        >
          <Pressable style={[styles.card, glassModalSurface(colors)]} onPress={() => {}}>
            <AppText variant="headline-md" style={styles.title}>
              {title}
            </AppText>
            {message ? (
              <AppText variant="body-md" muted style={styles.message}>
                {message}
              </AppText>
            ) : null}

            {kind === 'typedConfirm' ? (
              <View style={styles.typedBlock}>
                <AppText variant="label-sm" muted style={styles.typedLabel}>
                  Type to confirm
                </AppText>
                <AppText variant="body-md" style={styles.phraseHint}>
                  {phraseHint ?? confirmPhrase}
                </AppText>
                <TextInput
                  style={styles.input}
                  value={typed}
                  onChangeText={setTyped}
                  placeholder={phraseHint ?? confirmPhrase}
                  placeholderTextColor={colors.outlineVariant}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                />
              </View>
            ) : null}

            <DialogActions
              showCancel={kind !== 'alert'}
              cancelLabel={cancelLabel}
              confirmLabel={confirmLabel}
              destructive={destructive}
              confirmDisabled={kind === 'typedConfirm' && !phraseMatch}
              confirmLoading={loading}
              onCancel={kind === 'alert' ? undefined : handleDismiss}
              onConfirm={kind === 'alert' ? handleDismiss : handleConfirm}
            />
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    keyboard: { flex: 1 },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.md,
    },
    card: {
      width: '100%',
      maxWidth: 400,
      padding: spacing.lg,
      borderRadius: spacing.cardRadius,
    },
    title: { color: colors.onSurface, marginBottom: spacing.xs },
    message: { lineHeight: 22, marginBottom: spacing.xs },
    typedBlock: { marginTop: spacing.sm, gap: spacing.xs },
    typedLabel: { letterSpacing: 0.3, textTransform: 'none' },
    phraseHint: {
      fontFamily: 'SpaceMono_400Regular',
      fontSize: 14,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: spacing.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.onSurface,
      backgroundColor: colors.surfaceContainer,
    },
  });
