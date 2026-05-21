import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
  Pressable,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { TotpSecret } from 'firebase/auth';
import { ScreenShell, SubScreenHeader } from '../../components/layout';
import { AppText } from '../../components/primitives/AppText';
import { BentoCard } from '../../components/layout/BentoCard';
import {
  completeTotpEnrollment,
  formatMfaError,
  startTotpEnrollment,
} from '../../services/auth/mfa';
import { userAlert } from '../../utils/userAlert';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';
import * as Clipboard from 'expo-clipboard';

export const MfaEnrollScreen: React.FC = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [secret, setSecret] = useState<TotpSecret | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await startTotpEnrollment();
        if (cancelled) return;
        setSecret(result.secret);
        setQrUrl(result.qrUrl);
      } catch (e) {
        userAlert('Two-factor setup', formatMfaError(e));
        navigation.goBack();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigation]);

  const qrImageUri =
    qrUrl != null
      ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`
      : null;

  const submit = async () => {
    if (!secret || code.trim().length < 6) {
      userAlert('Verification', 'Enter the 6-digit code from your authenticator app.');
      return;
    }
    setSubmitting(true);
    try {
      await completeTotpEnrollment(secret, code);
      userAlert('Two-factor enabled', 'Your account now requires an authenticator code at sign-in.');
      navigation.goBack();
    } catch (e) {
      userAlert('Verification failed', formatMfaError(e));
    } finally {
      setSubmitting(false);
    }
  };

  const copySecret = async () => {
    if (!secret?.secretKey) return;
    await Clipboard.setStringAsync(secret.secretKey);
    userAlert('Copied', 'Secret key copied to clipboard.');
  };

  return (
    <ScreenShell header="none" scroll>
      <SubScreenHeader title="Two-factor auth" onBack={() => navigation.goBack()} />
      <AppText variant="body-md" muted style={styles.sub}>
        Scan the QR code with Google Authenticator, 1Password, or another TOTP app, then enter the
        6-digit code to confirm.
      </AppText>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <BentoCard deep style={styles.card}>
          {qrImageUri ? (
            <Image source={{ uri: qrImageUri }} style={styles.qr} accessibilityLabel="QR code" />
          ) : null}
          {secret ? (
            <Pressable onPress={() => void copySecret()} style={styles.secretRow}>
              <AppText variant="label-sm" muted>
                Manual key (tap to copy)
              </AppText>
              <AppText variant="body-md" style={styles.secretKey}>
                {secret.secretKey}
              </AppText>
            </Pressable>
          ) : null}
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
            disabled={submitting}
            style={({ pressed }) => [styles.btn, pressed && { opacity: 0.9 }]}
          >
            {submitting ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <AppText variant="label-sm" style={styles.btnLabel}>
                Enable 2FA
              </AppText>
            )}
          </Pressable>
        </BentoCard>
      )}
    </ScreenShell>
  );
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    sub: { marginBottom: spacing.md, lineHeight: 22 },
    loader: { marginTop: spacing.xl },
    card: { padding: spacing.lg, alignItems: 'center', gap: spacing.md },
    qr: { width: 200, height: 200, borderRadius: 12 },
    secretRow: { width: '100%', gap: 4 },
    secretKey: { color: colors.onSurface, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    input: {
      width: '100%',
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
      width: '100%',
      backgroundColor: colors.primary,
      borderRadius: spacing.pillRadius,
      paddingVertical: 14,
      alignItems: 'center',
    },
    btnLabel: { color: colors.onPrimary },
  });
