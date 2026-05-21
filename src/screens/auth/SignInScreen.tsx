import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { AppText } from '../../components/primitives/AppText';
import { BentoCard } from '../../components/layout/BentoCard';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { AuthScreenShell } from '../../components/auth/AuthScreenShell';
import { signInWithGoogle } from '../../services/auth/authApi';
import { isMfaRequiredError } from '../../services/auth/mfa';
import { MfaVerifyModal } from '../../components/auth/MfaVerifyModal';
import { userAlert } from '../../utils/userAlert';
import type { MultiFactorResolver } from 'firebase/auth';
import { spacing } from '../../theme/spacing';
import { glassCardBase } from '../../theme/glass';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

const APP_ICON = require('../../../assets/icon.png');

export const SignInScreen: React.FC = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { height } = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null);

  const submit = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      if (isMfaRequiredError(e)) {
        setMfaResolver(e.resolver);
        return;
      }
      userAlert('Sign in failed', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS === 'web' && { minHeight: height },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image source={APP_ICON} style={styles.appIcon} resizeMode="cover" />
        <AppText variant="headline-lg-mobile" style={styles.title}>
          Access your workspace
        </AppText>
        <AppText variant="body-md" muted style={styles.sub}>
          Sign in with Google to sync habits, Mind, and projects across devices.
        </AppText>

        <BentoCard style={[styles.card, glassCardBase(colors)]}>
          <AppText variant="body-md" muted style={styles.hint}>
            One account. Your habits, projects, and Mind library stay in sync when you are
            online.
          </AppText>
          <GoogleSignInButton onPress={submit} loading={loading} style={styles.googleBtn} />
        </BentoCard>
      </ScrollView>
      <MfaVerifyModal
        visible={mfaResolver != null}
        resolver={mfaResolver}
        onClose={() => setMfaResolver(null)}
        onSuccess={() => setMfaResolver(null)}
      />
    </AuthScreenShell>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.screenMargin,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  appIcon: {
    width: 104,
    height: 104,
    borderRadius: 24,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(229, 226, 225, 0.15)',
  },
  title: { color: colors.primary, textAlign: 'center', marginBottom: spacing.xs },
  sub: { textAlign: 'center', marginBottom: spacing.lg, maxWidth: 320 },
  card: { padding: spacing.md, width: '100%', maxWidth: 400 },
  hint: { marginBottom: spacing.lg, textAlign: 'center' },
  googleBtn: { width: '100%' },
});
