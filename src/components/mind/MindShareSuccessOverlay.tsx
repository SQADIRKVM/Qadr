import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useFonts, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { AppText } from '../primitives/AppText';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';
import { spacing } from '../../theme/spacing';
import { isWebPlatform } from '../../utils/webLayout';

export type MindShareOverlayPhase = 'saving' | 'success' | 'error';

interface MindShareSuccessOverlayProps {
  visible: boolean;
  phase: MindShareOverlayPhase;
  errorMessage?: string;
  onAddTagsNotes: () => void;
  onDismiss: () => void;
  onRetry?: () => void;
}

export const MindShareSuccessOverlay: React.FC<MindShareSuccessOverlayProps> = ({
  visible,
  phase,
  errorMessage,
  onAddTagsNotes,
  onDismiss,
  onRetry,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [fontsLoaded] = useFonts({ SpaceGrotesk_700Bold });

  if (!visible) return null;

  const headline =
    phase === 'saving'
      ? 'Saving to your mind…'
      : phase === 'success'
        ? "Good find! It's in your mind."
        : errorMessage ?? "Couldn't save this link.";

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={phase !== 'saving' ? onDismiss : undefined}>
        {!isWebPlatform() ? (
          <BlurView intensity={72} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.webBlur]} />
        )}
        <View style={styles.center}>
          {phase === 'saving' ? (
            <ActivityIndicator size="large" color={colors.onSurface} style={styles.spinner} />
          ) : null}

          <AppText
            variant="headline-lg"
            style={[
              styles.headline,
              fontsLoaded ? { fontFamily: 'SpaceGrotesk_700Bold' } : undefined,
            ]}
          >
            {headline}
          </AppText>

          {phase === 'success' ? (
            <Pressable
              style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
              onPress={onAddTagsNotes}
            >
              <AppText variant="label-sm" style={styles.pillLabel}>
                + Add Tags/Notes
              </AppText>
            </Pressable>
          ) : null}

          {phase === 'error' && onRetry ? (
            <Pressable
              style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
              onPress={onRetry}
            >
              <AppText variant="label-sm" style={styles.pillLabel}>
                Try again
              </AppText>
            </Pressable>
          ) : null}

          {phase !== 'saving' ? (
            <Pressable onPress={onDismiss} hitSlop={12} style={styles.dismissTap}>
              <AppText variant="body-md" muted>
                Tap anywhere to close
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </Pressable>
    </Modal>
  );
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(19, 19, 19, 0.45)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    webBlur: {
      backgroundColor: 'rgba(19, 19, 19, 0.72)',
      backdropFilter: 'blur(24px)',
    } as object,
    center: {
      alignItems: 'center',
      paddingHorizontal: spacing.screenMargin,
      maxWidth: 360,
      gap: spacing.lg,
    },
    spinner: {
      marginBottom: spacing.sm,
    },
    headline: {
      color: colors.onSurface,
      textAlign: 'center',
      fontSize: 28,
      lineHeight: 36,
      letterSpacing: -0.5,
    },
    pill: {
      marginTop: spacing.sm,
      paddingHorizontal: spacing.xl,
      paddingVertical: 14,
      borderRadius: spacing.pillRadius,
      borderWidth: 1,
      borderColor: colors.onSurface,
      backgroundColor: 'transparent',
    },
    pillPressed: {
      opacity: 0.85,
      backgroundColor: 'rgba(229, 226, 225, 0.08)',
    },
    pillLabel: {
      color: colors.onSurface,
      letterSpacing: 0.5,
    },
    dismissTap: {
      marginTop: spacing.md,
    },
  });
