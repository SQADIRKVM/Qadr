import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Linking,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ScreenShell, SubScreenHeader } from '../../components/layout';
import { BentoCard } from '../../components/layout/BentoCard';
import { MindTldwCard, MindTagEditor, MindPreviewHero, MindSpacePicker } from '../../components/mind';
import { AppText } from '../../components/primitives/AppText';
import { Button } from '../../components/primitives/Button';
import { useMindStore } from '../../stores/useMindStore';
import { hasAIConfigured } from '../../services/ai/client';
import type { IdeasStackParamList } from '../../navigation/types';
import type { MindContentKind } from '../../types';
import { debounce } from '../../utils/debounce';
import { shareText } from '../../utils/shareText';
import { MAX_PINNED } from '../../utils/mindVault';
import { getMindContentKind } from '../../utils/mindUrl';
import {
  getMindDisplayTitle,
  getMindEditableTitle,
  getMindTitleHint,
  isInstagramCarouselSuspected,
  isMindDefaultTitle,
  isPersistableMindTitle,
  isProvisionalMindTitle,
  MIND_DEFAULT_TITLE,
} from '../../utils/mindTitle';
import { getMindPreviewSlides } from '../../utils/mindPlatformBadge';
import { hasInstagramEmbedHtml } from '../../utils/mindPreview';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { confirmAction } from '../../utils/confirmAction';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

const HERO_KINDS: MindContentKind[] = ['reel', 'video', 'article', 'social'];

export const MindFocusScreen = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<StackNavigationProp<IdeasStackParamList>>();
  const route = useRoute<RouteProp<IdeasStackParamList, 'MindFocus'>>();
  const { items, updateItem, togglePin, archiveItem, enrichItem, refetchPreview } =
    useMindStore();
  const item = items.find((i) => i.id === route.params.id);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState(item?.rawContent ?? '');
  const [notes, setNotes] = useState(item?.userNotes ?? '');
  const [titleEdited, setTitleEdited] = useState(false);
  const carouselRefetchCount = useRef(0);
  const prevEnrichPending = useRef(false);

  // Reset local fields only when navigating to a different capture.
  useEffect(() => {
    if (!item) return;
    setTitleEdited(false);
    carouselRefetchCount.current = 0;
    prevEnrichPending.current = false;
    setTitle(getMindEditableTitle(item));
    setBody(item.rawContent);
    setNotes(item.userNotes ?? '');
  }, [item?.id]);

  // Apply pipeline/AI title without overwriting user edits.
  useEffect(() => {
    if (!item || titleEdited || item.enrichPending) return;
    const next = getMindEditableTitle(item);
    if (next) setTitle(next);
  }, [item?.title, item?.previewTitle, item?.aiEnriched, item?.enrichPending, titleEdited]);

  useEffect(() => {
    if (item?.url && !item.previewImageUrl && !item.enrichPending) {
      void refetchPreview(item.id);
    }
  }, [item?.id, item?.url, item?.previewImageUrl, item?.enrichPending, refetchPreview]);

  useEffect(() => {
    if (!item) return;
    const wasPending = prevEnrichPending.current;
    prevEnrichPending.current = !!item.enrichPending;

    if (!isInstagramCarouselSuspected(item)) return;
    if (hasInstagramEmbedHtml(item)) return;
    if (getMindPreviewSlides(item).length > 1) return;
    if (item.enrichPending) return;

    const maxRetries = 2;
    if (carouselRefetchCount.current >= maxRetries) return;

    const shouldRetry =
      carouselRefetchCount.current === 0 || (wasPending && !item.enrichPending);
    if (!shouldRetry) return;

    carouselRefetchCount.current += 1;
    void refetchPreview(item.id);
  }, [
    item?.id,
    item?.platform,
    item?.previewImages,
    item?.previewImageUrl,
    item?.contentExcerpt,
    item?.enrichPending,
    refetchPreview,
  ]);

  const debouncedSave = useMemo(
    () =>
      debounce((t: string, b: string, n: string, id: string) => {
        const trimmed = t.trim();
        const current = useMindStore.getState().items.find((i) => i.id === id);
        if (!current) return;

        const patch: { title?: string; rawContent: string; userNotes: string } = {
          rawContent: b,
          userNotes: n,
        };
        if (trimmed && isPersistableMindTitle(trimmed, current)) {
          patch.title = trimmed;
        } else if (
          trimmed &&
          isProvisionalMindTitle(trimmed, current) &&
          isMindDefaultTitle(current)
        ) {
          // omit title — wait for AI / pipeline
        } else if (!isMindDefaultTitle(current) && !isProvisionalMindTitle(current.title, current)) {
          patch.title = MIND_DEFAULT_TITLE;
        }
        useMindStore.getState().updateItem(id, patch);
      }, 1000),
    [],
  );

  useEffect(() => {
    if (!item || item.enrichPending) return;
    debouncedSave(title, body, notes, item.id);
  }, [title, body, notes, item, debouncedSave, item?.enrichPending]);

  const onTagsChange = useCallback(
    (tags: string[]) => {
      if (!item) return;
      updateItem(item.id, { autoTags: tags });
    },
    [item, updateItem],
  );

  if (!item) {
    return (
      <ScreenShell header="none" scroll>
        <SubScreenHeader title="Capture" onBack={() => navigation.goBack()} />
        <AppText variant="body-md" muted style={{ padding: spacing.screenMargin }}>
          Item not found.
        </AppText>
      </ScreenShell>
    );
  }

  const pinnedCount = items.filter((i) => i.isPinned && !i.isArchived).length;
  const canPin = item.isPinned || pinnedCount < MAX_PINNED;
  const contentKind = getMindContentKind(item);
  const showAiBlocks = !!item.aiEnriched;
  const showAiPrompt = !item.aiEnriched && !item.enrichPending;
  const showHero = !!item.url && HERO_KINDS.includes(contentKind);
  const titleHint = getMindTitleHint(item);
  const slideCount = getMindPreviewSlides(item).length;
  const isWeb = Platform.OS === 'web';
  const hasEmbed = hasInstagramEmbedHtml(item);
  const carouselSuspected =
    isInstagramCarouselSuspected(item) && slideCount <= 1;
  const partialCarousel =
    item.platform === 'instagram' &&
    /instagram\.com\/p\//i.test(item.url ?? '') &&
    slideCount === 2;
  const showCarouselHint =
    (hasEmbed && isWeb) || ((carouselSuspected || partialCarousel) && !hasEmbed);
  const extractConfigured = !!process.env.EXPO_PUBLIC_CONTENT_EXTRACT_URL?.trim();

  const carouselHint = (() => {
    if (item.extractError) {
      return `Extract failed: ${item.extractError} — tap Refresh preview`;
    }
    if (item.enrichPending) return 'Loading carousel slides…';
    if (hasEmbed && isWeb) {
      return 'Swipe inside embed for all slides — or tap Refresh preview';
    }
    if (partialCarousel) {
      return '2 slides loaded from extract — Instagram may have more in app. Tap to refresh.';
    }
    if (extractConfigured) {
      return 'Only 1 slide loaded — tap Refresh preview or open on Instagram';
    }
    return 'Only 1 image loaded — run npm run mind-extract for multi-image swipe';
  })();
  const savedAgo = formatDistanceToNow(parseISO(item.createdAt), { addSuffix: true });
  const tldwVariant = contentKind === 'reel' || contentKind === 'video' ? 'tldw' : 'summary';

  const onEnhanceAi = () => {
    hapticLight();
    void enrichItem(item.id);
  };

  const openUrl = () => {
    if (!item.url) return;
    hapticLight();
    Linking.openURL(item.url);
  };

  const onShare = () => {
    const displayTitle = getMindDisplayTitle(item);
    const text = [displayTitle, item.summary, item.url, item.rawContent, item.userNotes]
      .filter(Boolean)
      .join('\n\n');
    void shareText(displayTitle, text);
  };

  const onArchive = () => {
    confirmAction(
      'Archive',
      'Archive this capture?',
      () => {
        archiveItem(item.id);
        navigation.goBack();
      },
      { confirmLabel: 'Archive', destructive: true },
    );
  };

  return (
    <ScreenShell header="none" scroll={false}>
      <SubScreenHeader title="Capture" onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {showHero ? (
          <View style={styles.heroBlock}>
            <MindPreviewHero item={item} onOpenUrl={openUrl} height={220} />
            {showCarouselHint ? (
              <Pressable
                onPress={() => {
                  hapticLight();
                  void refetchPreview(item.id);
                }}
              >
                <AppText variant="label-sm" muted style={styles.carouselHint}>
                  {carouselHint}
                </AppText>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={(text) => {
            setTitleEdited(true);
            setTitle(text);
          }}
          placeholder={MIND_DEFAULT_TITLE}
          placeholderTextColor={colors.outlineVariant}
        />

        {item.enrichPending ? (
          <AppText variant="label-sm" style={styles.enriching}>
            Analyzing…
          </AppText>
        ) : null}

        {titleHint && !title.trim() ? (
          <AppText variant="body-md" muted style={styles.previewHint} numberOfLines={2}>
            {titleHint}
          </AppText>
        ) : null}

        {isMindDefaultTitle(item) &&
        !title.trim() &&
        !item.enrichPending &&
        !item.previewTitle &&
        item.contentExcerpt ? (
          <AppText variant="body-md" muted style={styles.previewHint} numberOfLines={3}>
            {item.contentExcerpt.slice(0, 200)}
          </AppText>
        ) : null}

        {!showHero && item.url ? (
          <Pressable style={styles.linkRow} onPress={openUrl}>
            <MaterialIcons name="link" size={18} color={colors.primary} />
            <AppText variant="body-md" style={styles.linkText} numberOfLines={2}>
              {item.url}
            </AppText>
          </Pressable>
        ) : null}

        <MindTagEditor item={item} onTagsChange={onTagsChange} />

        <MindSpacePicker
          spaceId={item.spaceId}
          onSelect={(spaceId) => updateItem(item.id, { spaceId })}
        />

        <View style={styles.notesSection}>
          <AppText variant="label-sm" style={styles.sectionLabel}>
            Notes
          </AppText>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add a note..."
            placeholderTextColor={colors.outlineVariant}
            multiline
            textAlignVertical="top"
          />
        </View>

        {showAiPrompt ? (
          <BentoCard deep style={styles.aiPrompt}>
            <View style={styles.aiPromptRow}>
              <View style={styles.aiPromptCopy}>
                <MaterialIcons name="auto-awesome" size={20} color={colors.primary} />
                <View style={styles.aiPromptText}>
                  <AppText variant="body-md" style={styles.aiPromptTitle}>
                    AI summary & tags
                  </AppText>
                  <AppText variant="body-md" muted style={styles.aiPromptHint}>
                    {hasAIConfigured()
                      ? 'Reads captions, vision on images when caption is thin, then Groq for title and summary.'
                      : 'Uses offline rules from title and excerpt until Groq is configured.'}
                  </AppText>
                </View>
              </View>
              <Button label="RUN" variant="secondary" onPress={onEnhanceAi} />
            </View>
          </BentoCard>
        ) : null}

        {item.imageText && showAiBlocks ? (
          <BentoCard deep style={styles.imageTextCard}>
            <AppText variant="label-sm" style={styles.sectionLabel}>
              Text in image
            </AppText>
            <AppText variant="body-md" muted numberOfLines={6}>
              {item.imageText}
            </AppText>
          </BentoCard>
        ) : null}

        {showAiBlocks && item.summary ? (
          <MindTldwCard summary={item.summary} variant={tldwVariant} />
        ) : null}

        {contentKind === 'reel' || contentKind === 'video' ? (
          <Button
            label={item.watchedAt ? 'Watched' : "I've watched this"}
            variant={item.watchedAt ? 'secondary' : 'primary'}
            onPress={() => {
              hapticLight();
              updateItem(item.id, {
                watchedAt: item.watchedAt ? null : new Date().toISOString(),
              });
            }}
          />
        ) : null}

        {!showAiBlocks && !item.url ? (
          <TextInput
            style={styles.bodyInput}
            value={body}
            onChangeText={setBody}
            placeholder="Content..."
            placeholderTextColor={colors.outlineVariant}
            multiline
            textAlignVertical="top"
          />
        ) : null}

        <AppText variant="body-md" muted style={styles.meta}>
          Saved · {savedAgo}
        </AppText>

        <View style={styles.actions}>
          {showAiBlocks ? (
            <Button
              label="REFRESH AI"
              variant="secondary"
              onPress={onEnhanceAi}
              disabled={item.enrichPending}
            />
          ) : null}
          <Button
            label={item.isPinned ? 'UNPIN' : 'PIN'}
            variant="secondary"
            onPress={() => canPin && togglePin(item.id)}
            disabled={!canPin}
          />
          <Button label="SHARE" variant="secondary" onPress={onShare} />
          <Button label="ARCHIVE" variant="destructive" onPress={onArchive} />
        </View>
      </ScrollView>
    </ScreenShell>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    padding: spacing.screenMargin,
    paddingTop: spacing.sm,
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  titleInput: {
    fontSize: 24,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: colors.onSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    paddingVertical: spacing.sm,
  },
  heroBlock: {
    gap: spacing.sm,
  },
  carouselHint: {
    textAlign: 'center',
  },
  previewHint: {
    marginTop: -spacing.sm,
    lineHeight: 20,
  },
  enriching: {
    color: colors.primary,
    fontSize: 11,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  linkText: {
    flex: 1,
    color: colors.primary,
  },
  imageTextCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  notesSection: { gap: spacing.sm },
  sectionLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  notesInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: spacing.cardRadius,
    padding: spacing.md,
    fontSize: 16,
    color: colors.onSurface,
    fontFamily: 'Inter_400Regular',
    backgroundColor: colors.cardBgDeep,
  },
  aiPrompt: {
    padding: spacing.md,
  },
  aiPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  aiPromptCopy: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  aiPromptText: {
    flex: 1,
    gap: 2,
  },
  aiPromptTitle: {
    color: colors.onSurface,
    fontSize: 14,
  },
  aiPromptHint: {
    fontSize: 12,
    lineHeight: 18,
  },
  bodyInput: {
    minHeight: 120,
    fontSize: 16,
    color: colors.onSurface,
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },
  meta: {
    fontSize: 13,
    marginTop: spacing.xs,
  },
  actions: {
    gap: spacing.sm,
  },
});
