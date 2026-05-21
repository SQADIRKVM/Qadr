import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Switch } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { AppText } from '../primitives/AppText';
import { Button } from '../primitives/Button';
import { useMindStore } from '../../stores/useMindStore';
import { detectMindPlatform } from '../../utils/mindUrl';
import { hasAIConfigured } from '../../services/ai/client';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { isWebPlatform } from '../../utils/webLayout';
import { userAlert } from '../../utils/userAlert';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

type SaveTab = 'note' | 'url' | 'image';

interface MindSaveSheetProps {
  sheetRef: React.RefObject<BottomSheet | null>;
}

export const MindSaveSheet: React.FC<MindSaveSheetProps> = ({ sheetRef }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const addItem = useMindStore((s) => s.addItem);
  const [tab, setTab] = useState<SaveTab>('note');
  const [noteText, setNoteText] = useState('');
  const [urlText, setUrlText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [enrichWithAi, setEnrichWithAi] = useState(hasAIConfigured);

  const urlDetection = urlText.trim() ? detectMindPlatform(urlText.trim()) : null;
  const aiReady = hasAIConfigured();

  useEffect(() => {
    setEnrichWithAi(hasAIConfigured());
  }, []);

  const reset = () => {
    setNoteText('');
    setUrlText('');
    setImageUri(null);
    setTab('note');
    setEnrichWithAi(hasAIConfigured());
  };

  const save = () => {
    const options = { enrichWithAi };
    if (tab === 'note') {
      const text = noteText.trim();
      if (!text) return;
      addItem({ kind: 'note', rawContent: text }, options);
    } else if (tab === 'url') {
      const url = urlText.trim();
      if (!url) return;
      addItem({ kind: 'url', url }, options);
    } else if (imageUri) {
      addItem({ kind: 'image', imageUri }, options);
    } else {
      return;
    }
    hapticLight();
    reset();
    sheetRef.current?.close();
  };

  const pasteUrl = async () => {
    const clip = await Clipboard.getStringAsync();
    if (clip?.trim()) setUrlText(clip.trim());
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      userAlert('Photos', 'Allow photo access to save images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={['70%']}
      enablePanDownToClose
      bottomInset={isWebPlatform() ? 0 : undefined}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={{ backgroundColor: colors.outline }}
    >
      <BottomSheetView style={styles.sheet}>
        <AppText variant="label-sm">SAVE TO MIND</AppText>
        <View style={styles.tabs}>
          {(['note', 'url', 'image'] as SaveTab[]).map((t) => (
            <Pressable
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}
            >
              <AppText variant="label-sm" style={tab === t ? styles.tabLabelActive : styles.tabLabel}>
                {t.toUpperCase()}
              </AppText>
            </Pressable>
          ))}
        </View>

        {tab === 'note' ? (
          <TextInput
            style={styles.multiline}
            placeholder="Write anything..."
            placeholderTextColor={colors.outlineVariant}
            value={noteText}
            onChangeText={setNoteText}
            multiline
          />
        ) : null}

        {tab === 'url' ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              placeholderTextColor={colors.outlineVariant}
              value={urlText}
              onChangeText={setUrlText}
              autoCapitalize="none"
              keyboardType="url"
            />
            <Pressable onPress={pasteUrl}>
              <AppText variant="label-sm" style={styles.paste}>
                PASTE FROM CLIPBOARD
              </AppText>
            </Pressable>
            {urlDetection ? (
              <AppText variant="body-md" muted>
                {urlDetection.label} detected{urlDetection.isReel ? ' — reel tags when AI is on' : ''}
              </AppText>
            ) : null}
          </>
        ) : null}

        {tab === 'image' ? (
          <>
            <Button label="PICK IMAGE" variant="secondary" onPress={pickImage} />
            {imageUri ? (
              <AppText variant="body-md" muted numberOfLines={1}>
                {imageUri}
              </AppText>
            ) : null}
          </>
        ) : null}

        <View style={styles.aiRow}>
          <View style={styles.aiCopy}>
            <AppText variant="body-md" style={styles.aiLabel}>
              Enhance with AI
            </AppText>
            <AppText variant="body-md" muted style={styles.aiHint}>
              Reads captions and page text to set title, topic tags, and summary. Text in images is not read (no OCR yet).
            </AppText>
            {!aiReady ? (
              <AppText variant="body-md" muted style={styles.aiHint}>
                Uses offline rules until you add a Groq key in Settings.
              </AppText>
            ) : null}
          </View>
          <Switch
            value={enrichWithAi}
            onValueChange={(v) => {
              hapticLight();
              setEnrichWithAi(v);
            }}
            trackColor={{ false: colors.surfaceContainerHigh, true: colors.primary }}
            thumbColor={enrichWithAi ? colors.onPrimary : colors.onSurfaceVariant}
            ios_backgroundColor={colors.surfaceContainerHigh}
          />
        </View>

        <Button label="SAVE" onPress={save} />
      </BottomSheetView>
    </BottomSheet>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  sheetBg: {
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.modalBorder,
  },
  sheet: { padding: spacing.screenMargin, gap: 12 },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: spacing.pillRadius,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tabActive: {
    backgroundColor: colors.surfaceContainerHigh,
    borderColor: colors.primary,
  },
  tabLabel: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  tabLabelActive: {
    color: colors.primary,
    letterSpacing: 1,
  },
  input: {
    fontSize: 16,
    color: colors.onSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    paddingVertical: 8,
  },
  multiline: {
    minHeight: 120,
    fontSize: 16,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: spacing.cardRadius,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
  paste: {
    color: colors.primary,
    letterSpacing: 1,
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surfaceContainerLowest,
  },
  aiCopy: { flex: 1, gap: 4 },
  aiLabel: { color: colors.onSurface },
  aiHint: { fontSize: 12, lineHeight: 18 },
});
