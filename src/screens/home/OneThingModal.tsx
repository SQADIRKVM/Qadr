import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../../components/primitives/AppText';
import { UnderlineInput } from '../../components/primitives/UnderlineInput';
import { Button } from '../../components/primitives/Button';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

export const OneThingModal = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const oneThing = useDashboardStore((s) => s.oneThing);
  const setOneThing = useDashboardStore((s) => s.setOneThing);
  const markOneThingDone = useDashboardStore((s) => s.markOneThingDone);
  const clearOneThing = useDashboardStore((s) => s.clearOneThing);
  const hadExisting = Boolean(oneThing?.trim());
  const [text, setText] = useState(oneThing ?? '');

  const submit = () => {
    if (text.trim()) setOneThing(text.trim());
    navigation.goBack();
  };

  const markDone = () => {
    markOneThingDone();
    navigation.goBack();
  };

  const clear = () => {
    clearOneThing();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <AppText variant="label-sm" style={styles.label}>
          ONE THING
        </AppText>
        <AppText variant="headline-lg" style={styles.prompt}>
          what&apos;s the one thing that makes today a win?
        </AppText>
        <UnderlineInput
          value={text}
          onChangeText={setText}
          autoFocus
          multiline
          style={styles.input}
        />
        <Button
          label={hadExisting ? 'UPDATE' : 'PIN IT'}
          onPress={submit}
          disabled={!text.trim()}
        />
        {hadExisting ? (
          <View style={styles.secondaryActions}>
            <Pressable onPress={markDone} style={styles.secondaryBtn}>
              <AppText variant="label-sm" style={styles.secondaryText}>
                MARK DONE
              </AppText>
            </Pressable>
            <Pressable onPress={clear} style={styles.secondaryBtn}>
              <AppText variant="label-sm" style={styles.clearText}>
                CLEAR
              </AppText>
            </Pressable>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  inner: { flex: 1, padding: spacing.screenMargin, justifyContent: 'center' },
  label: { color: colors.outline, marginBottom: spacing.md },
  prompt: { marginBottom: spacing.lg },
  input: { fontSize: 28, marginBottom: spacing.lg },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  secondaryBtn: { paddingVertical: spacing.sm },
  secondaryText: { color: colors.primary, letterSpacing: 1 },
  clearText: { color: colors.onSurfaceVariant, letterSpacing: 1 },
});
