import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { ScreenShell } from '../../components/layout';
import {
  IdeaModeToggle,
  IdeaVaultHeader,
  IdeaVaultSearch,
  IdeaCategoryPills,
  IdeaVaultCard,
  IdeaVaultNewCard,
} from '../../components/ideas';
import { AppText } from '../../components/primitives/AppText';
import { Chip } from '../../components/primitives/Chip';
import { SwipeableRow } from '../../components/SwipeableRow';
import { Button } from '../../components/primitives/Button';
import { useIdeaStore } from '../../stores/useIdeaStore';
import { useIdeaUiStore } from '../../stores/useIdeaUiStore';
import { MindVaultView } from './MindVaultView';
import type { IdeasStackParamList } from '../../navigation/types';
import type { IdeaCategory as Cat } from '../../types';
import {
  type VaultCategoryFilter,
  matchesVaultCategory,
  matchesVaultSearch,
  hasSundayReviewIdeas,
} from '../../utils/ideaVault';
import { useResponsive } from '../../hooks/useResponsive';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { isWebPlatform } from '../../utils/webLayout';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

const CATEGORIES: Cat[] = ['app', 'business', 'content', 'agency', 'crypto', 'other'];

export const IdeaVaultScreen = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<StackNavigationProp<IdeasStackParamList>>();
  const { ideas, addIdea, archiveIdea, moveToProject } = useIdeaStore();
  const addSheetNonce = useIdeaUiStore((s) => s.addSheetNonce);
  const viewMode = useIdeaUiStore((s) => s.viewMode);
  const setViewMode = useIdeaUiStore((s) => s.setViewMode);
  const { isMobile, isTablet, isDesktop, gutter, bottomInset } = useResponsive();
  const sheetRef = useRef<BottomSheet>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<VaultCategoryFilter>('all');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Cat>('other');
  const [lock24h, setLock24h] = useState(false);
  const [sundayReview, setSundayReview] = useState(false);

  const columns = isDesktop ? 3 : isTablet ? 2 : 1;
  const itemWidthPercent = 100 / columns;

  useEffect(() => {
    if (addSheetNonce > 0 && viewMode === 'vault') {
      sheetRef.current?.expand();
    }
  }, [addSheetNonce, viewMode]);

  const activeIdeas = useMemo(
    () => ideas.filter((i) => i.status !== 'archived'),
    [ideas],
  );

  const filtered = useMemo(
    () =>
      activeIdeas.filter(
        (i) => matchesVaultCategory(i, categoryFilter) && matchesVaultSearch(i, searchQuery),
      ),
    [activeIdeas, categoryFilter, searchQuery],
  );

  const showSundayLink = hasSundayReviewIdeas(ideas);

  const openAdd = () => {
    hapticLight();
    sheetRef.current?.expand();
  };

  const saveIdea = () => {
    if (!title.trim()) return;
    addIdea({ title: title.trim(), description, category, lock24h, sundayReview });
    setTitle('');
    setDescription('');
    setLock24h(false);
    setSundayReview(false);
    sheetRef.current?.close();
  };

  return (
    <ScreenShell header="workspace" scroll={false}>
      <View style={styles.root}>
        <View style={styles.modeRow}>
          <IdeaModeToggle mode={viewMode} onChange={setViewMode} />
        </View>

        {viewMode === 'mind' ? (
          <MindVaultView />
        ) : (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset }]}
            >
              <IdeaVaultHeader
                count={activeIdeas.length}
                showSundayReview={showSundayLink}
                onSundayReviewPress={() => navigation.navigate('SundayReview')}
              />

              <View style={[styles.controls, !isMobile && styles.controlsWide]}>
                <IdeaVaultSearch value={searchQuery} onChangeText={setSearchQuery} />
                <IdeaCategoryPills value={categoryFilter} onChange={setCategoryFilter} />
              </View>

              <View style={[styles.grid, { marginHorizontal: -gutter / 2 }]}>
                {filtered.map((idea) => (
                  <View
                    key={idea.id}
                    style={[
                      styles.gridItem,
                      {
                        width: `${itemWidthPercent}%`,
                        paddingHorizontal: gutter / 2,
                        marginBottom: gutter,
                      },
                    ]}
                  >
                    <SwipeableRow
                      onSwipeLeft={() => archiveIdea(idea.id)}
                      onSwipeRight={() => moveToProject(idea.id)}
                    >
                      <IdeaVaultCard idea={idea} />
                    </SwipeableRow>
                  </View>
                ))}
                <View
                  style={[
                    styles.gridItem,
                    {
                      width: `${itemWidthPercent}%`,
                      paddingHorizontal: gutter / 2,
                      marginBottom: gutter,
                    },
                  ]}
                >
                  <IdeaVaultNewCard onPress={openAdd} />
                </View>
              </View>

              {filtered.length === 0 && searchQuery.trim() ? (
                <AppText variant="body-md" muted style={styles.emptyHint}>
                  No ideas match your query.
                </AppText>
              ) : null}
            </ScrollView>

            <BottomSheet
              ref={sheetRef}
              index={-1}
              snapPoints={['65%']}
              enablePanDownToClose
              bottomInset={isWebPlatform() ? 0 : undefined}
              backgroundStyle={styles.sheetBg}
              handleIndicatorStyle={{ backgroundColor: colors.outline }}
            >
              <BottomSheetView style={styles.sheet}>
                <AppText variant="label-sm">ADD IDEA</AppText>
                <TextInput
                  style={styles.input}
                  placeholder="Title"
                  placeholderTextColor={colors.outlineVariant}
                  value={title}
                  onChangeText={setTitle}
                />
                <TextInput
                  style={[styles.input, { fontFamily: 'Inter_400Regular' }]}
                  placeholder="Description (optional)"
                  placeholderTextColor={colors.outlineVariant}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {CATEGORIES.map((c) => (
                    <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
                  ))}
                </ScrollView>
                <View style={styles.toggleRow}>
                  <AppText variant="body-md">24hr Lock</AppText>
                  <Switch value={lock24h} onValueChange={setLock24h} trackColor={{ true: colors.primary }} />
                </View>
                <View style={styles.toggleRow}>
                  <AppText variant="body-md">Sunday Review</AppText>
                  <Switch
                    value={sundayReview}
                    onValueChange={setSundayReview}
                    trackColor={{ true: colors.primary }}
                  />
                </View>
                <Button label="SAVE" onPress={saveIdea} />
              </BottomSheetView>
            </BottomSheet>
          </>
        )}
      </View>
    </ScreenShell>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  root: { flex: 1, width: '100%', minHeight: 0 },
  modeRow: {
    paddingTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  scroll: {
    paddingTop: spacing.xs,
    flexGrow: 1,
  },
  controls: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  controlsWide: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  gridItem: {},
  emptyHint: {
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  sheetBg: {
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.modalBorder,
  },
  sheet: { padding: spacing.screenMargin, gap: 12 },
  input: {
    fontSize: 18,
    color: colors.onSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    paddingVertical: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
