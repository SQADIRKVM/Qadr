import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import type { MultiFactorResolver } from 'firebase/auth';
import { AppText } from '../primitives/AppText';
import { glassModalSurface } from '../../theme/glass';
import { spacing } from '../../theme/spacing';
import { resolveTotpSignIn } from '../../services/auth/mfa';
import { userAlert } from '../../utils/userAlert';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MfaVerifyModalProps {
  visible: boolean;
  resolver: MultiFactorResolver | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const MfaVerifyModal: React.FC<MfaVerifyModalProps> = ({
  visible,
  resolver,
  onClose,
  onSuccess,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!resolver || code.trim().length < 6) {
      userAlert('Verification', 'Enter your 6-digit authenticator code.');
      return;
    }
    setLoading(true);
    try {
      await resolveTotpSignIn(resolver, code);
      setCode('');
      onSuccess();
    } catch (e) {
      userAlert(
        'Verification failed',
        e instanceof Error ? e.message : 'Check the code and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, glassModalSurface(colors)]}
          onPress={(e) => e.stopPropagation()}
        >
          <AppText variant="headline-md" style={styles.title}>
            Authenticator code
          </AppText>
          <AppText variant="body-md" muted style={styles.sub}>
            Enter the 6-digit code from your authenticator app to finish signing in.
          </AppText>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="000000"
            placeholderTextColor={colors.outlineVariant}
            keyboardType="number-pad"
            maxLength={6}
            autoComplete={Platform.OS === 'web' ? 'one-time-code' : undefined}
          />
          <Pressable
            onPress={() => void submit()}
            disabled={loading}
            style={({ pressed }) => [styles.btn, pressed && !loading && { opacity: 0.9 }]}
          >
            {loading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <AppText variant="label-sm" style={styles.btnLabel}>
                Verify
              </AppText>
            )}
          </Pressable>
          <Pressable onPress={onClose} style={styles.cancel}>
            <AppText variant="body-md" muted>
              Cancel
            </AppText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    sheet: {
      borderRadius: spacing.cardRadius,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    title: { color: colors.onSurface },
    sub: { lineHeight: 22, marginBottom: spacing.xs },
    input: {
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: 12,
      padding: spacing.sm,
      fontSize: 24,
      letterSpacing: 8,
      textAlign: 'center',
      color: colors.onSurface,
      backgroundColor: colors.surfaceContainer,
    },
    btn: {
      backgroundColor: colors.primary,
      borderRadius: spacing.pillRadius,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    btnLabel: { color: colors.onPrimary },
    cancel: { alignItems: 'center', paddingVertical: spacing.sm },
  });
