import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../../components/primitives/AppText';
import { Button } from '../../components/primitives/Button';
import { Chip } from '../../components/primitives/Chip';
import { AIConfigBanner } from '../../components/primitives/AIConfigBanner';
import { classifyBrainDump } from '../../services/ai/brainDump';
import { hasAIConfigured } from '../../services/ai/client';
import type { BrainDumpClassification } from '../../services/ai/types';
import type { BrainDumpType } from '../../types';
import { useIdeaStore } from '../../stores/useIdeaStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { fontFamilies } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { userAlert } from '../../utils/userAlert';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

export const BrainDumpModal = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const [text, setText] = useState('');
  const [items, setItems] = useState<BrainDumpClassification[] | null>(null);
  const [loading, setLoading] = useState(false);
  const addIdea = useIdeaStore((s) => s.addFromBrainDump);
  const addTask = useProjectStore((s) => s.addTaskFromBrainDump);

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const { items: classified, fromStub, error } = await classifyBrainDump(text);
    setItems(classified);
    setLoading(false);
    if (hasAIConfigured() && fromStub && error) {
      userAlert('Brain Dump', 'AI classification failed — using offline rules.');
    }
  };

  const updateType = (index: number, type: BrainDumpType) => {
    if (!items) return;
    const next = [...items];
    next[index] = { ...next[index], type };
    setItems(next);
  };

  const confirm = () => {
    items?.forEach((item) => {
      if (item.type === 'idea') addIdea(item.text);
      else if (item.type === 'task') addTask(item.text);
    });
    hapticLight();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <AppText variant="label-sm">BRAIN DUMP</AppText>
          <AppText variant="body-md" muted>
            type everything. ai will sort it.
          </AppText>
        </View>
        <AIConfigBanner />
        {!items ? (
          <>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              multiline
              autoFocus
              placeholderTextColor={colors.outlineVariant}
            />
            <Button
              label={loading ? 'SORTING...' : 'SUBMIT'}
              onPress={submit}
              loading={loading}
              disabled={!text.trim() || loading}
            />
          </>
        ) : (
          <ScrollView style={{ flex: 1 }}>
            {items.map((item, i) => (
              <View key={i} style={styles.chipRow}>
                <AppText variant="body-md" style={{ flex: 1 }}>
                  {item.text}
                </AppText>
                <View style={styles.types}>
                  {(['idea', 'task', 'reminder', 'random'] as BrainDumpType[]).map((t) => (
                    <Chip
                      key={t}
                      label={t}
                      selected={item.type === t}
                      onPress={() => updateType(i, t)}
                    />
                  ))}
                </View>
              </View>
            ))}
            <Button label="CONFIRM" onPress={confirm} style={{ marginTop: 16 }} />
            <Button
              label="DISCARD"
              variant="secondary"
              onPress={() => navigation.goBack()}
              style={{ marginTop: 8 }}
            />
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black, padding: spacing.screenMargin },
  header: { marginBottom: spacing.md },
  input: {
    flex: 1,
    fontFamily: fontFamilies.mono,
    fontSize: 18,
    color: colors.onSurface,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  chipRow: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
});
