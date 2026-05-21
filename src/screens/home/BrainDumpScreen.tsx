import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenShell, BentoCard, SectionHeader, SubScreenHeader } from '../../components/layout';
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

export const BrainDumpScreen = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const [text, setText] = useState('');
  const [items, setItems] = useState<BrainDumpClassification[] | null>(null);
  const [loading, setLoading] = useState(false);
  const ideas = useIdeaStore((s) => s.ideas);
  const addIdea = useIdeaStore((s) => s.addFromBrainDump);
  const addTask = useProjectStore((s) => s.addTaskFromBrainDump);

  const recent = ideas.slice(0, 3);

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
    <ScreenShell header="none" scroll>
      <SubScreenHeader title="Brain Dump" onBack={() => navigation.goBack()} />
      <AIConfigBanner />
      <View style={styles.hero}>
        <AppText variant="headline-lg" style={styles.heroTitle}>
          What's on your mind?
        </AppText>
        <AppText variant="body-lg" muted>
          type everything. ai will sort it.
        </AppText>
      </View>

      {!items ? (
        <BentoCard deep style={styles.capture}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              multiline
              placeholder="Start typing a thought..."
              placeholderTextColor={colors.outlineVariant}
            />
            <Pressable style={styles.micBtn}>
              <Ionicons name="mic" size={32} color={colors.inverseOnSurface} />
            </Pressable>
          </View>
          <Button label={loading ? 'SORTING...' : 'SUBMIT'} onPress={submit} loading={loading} />
        </BentoCard>
      ) : (
        <ScrollView>
          {items.map((item, i) => (
            <BentoCard key={i} style={{ marginBottom: 8 }}>
              <AppText variant="body-md">{item.text}</AppText>
              <View style={styles.chips}>
                {(['idea', 'task', 'reminder', 'random'] as BrainDumpType[]).map((t) => (
                  <Chip key={t} label={t} selected={item.type === t} onPress={() => updateType(i, t)} />
                ))}
              </View>
            </BentoCard>
          ))}
          <Button label="CONFIRM" onPress={confirm} />
        </ScrollView>
      )}

      <SectionHeader title="RECENTLY CAPTURED" actionLabel="VIEW ALL" onAction={() => {}} />
      {recent.map((idea) => (
        <BentoCard key={idea.id} style={{ marginBottom: 8 }}>
          <AppText variant="label-sm">{idea.category}</AppText>
          <AppText variant="body-md">{idea.title}</AppText>
        </BentoCard>
      ))}
    </ScreenShell>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  hero: { marginTop: 16, marginBottom: 24 },
  heroTitle: { fontSize: 32 },
  capture: { padding: spacing.sm },
  inputWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, minHeight: 120 },
  input: {
    flex: 1,
    fontFamily: fontFamilies.inter,
    fontSize: 18,
    color: colors.onSurface,
    textAlignVertical: 'top',
  },
  micBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.inverseSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
});
