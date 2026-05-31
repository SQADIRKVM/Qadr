import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import BottomSheet from '@gorhom/bottom-sheet';
import {
  MindCaptureHeader,
  MindCard,
  MindSearchBar,
  MindSaveSheet,
  MindSpacesView,
  MindEmptyState,
  TopOfMind,
} from '../../components/mind';
import { AppText } from '../../components/primitives/AppText';
import { AIConfigBanner } from '../../components/primitives/AIConfigBanner';
import { useMindStore } from '../../stores/useMindStore';
import { useMindSpacesStore } from '../../stores/useMindSpacesStore';
import { useIdeaUiStore } from '../../stores/useIdeaUiStore';
import type { IdeasStackParamList } from '../../navigation/types';
import type { MindItem } from '../../types';
import {
  getActiveMindItems,
  getPinnedMindItems,
  matchesMindSearch,
} from '../../utils/mindVault';
import { getMindContentKind } from '../../utils/mindUrl';
import { debounce } from '../../utils/debounce';
import { useResponsive } from '../../hooks/useResponsive';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

export const MindVaultView: React.FC = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<StackNavigationProp<IdeasStackParamList>>();
  const { items, enrichPendingItems } = useMindStore();
  const spaces = useMindSpacesStore((s) => s.spaces);
  const mindSheetNonce = useIdeaUiStore((s) => s.mindSheetNonce);
  const mindTab = useIdeaUiStore((s) => s.mindTab);
  const setMindTab = useIdeaUiStore((s) => s.setMindTab);
  const activeSpaceId = useIdeaUiStore((s) => s.activeSpaceId);
  const setActiveSpaceId = useIdeaUiStore((s) => s.setActiveSpaceId);
  const { isMobile, isTablet, isDesktop, gutter, listBottomPadding } = useResponsive();
  const sheetRef = useRef<BottomSheet>(null);

  const mindSearch = useIdeaUiStore((s) => s.mindSearch);
  const setMindSearch = useIdeaUiStore((s) => s.setMindSearch);

  const [searchInput, setSearchInput] = useState(mindSearch);
  const [searchQuery, setSearchQuery] = useState(mindSearch);
  const [refreshing, setRefreshing] = useState(false);

  const debouncedSetSearch = useMemo(
    () => debounce((q: string) => setSearchQuery(q), 300),
    [],
  );

  useEffect(() => {
    debouncedSetSearch(searchInput);
  }, [searchInput, debouncedSetSearch]);

  useEffect(() => {
    setSearchInput(mindSearch);
  }, [mindSearch]);

  const pendingCount = useMemo(() => items.filter((i) => i.enrichPending).length, [items]);

  useEffect(() => {
    if (pendingCount > 0) {
      void enrichPendingItems();
    }
  }, [pendingCount, enrichPendingItems]);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    setMindSearch(val);
  };

  useEffect(() => {
    if (mindSheetNonce > 0) sheetRef.current?.expand();
  }, [mindSheetNonce]);

  const activeCount = useMemo(() => getActiveMindItems(items).length, [items]);
  const pinned = useMemo(() => getPinnedMindItems(items), [items]);

  const activeSpace = useMemo(
    () => spaces.find((s) => s.id === activeSpaceId),
    [spaces, activeSpaceId]
  );

  const filtered = useMemo(() => {
    let list = getActiveMindItems(items);
    if (activeSpaceId) {
      list = list.filter((i) => i.spaceId === activeSpaceId);
    }
    return list.filter((i) => matchesMindSearch(i, searchQuery));
  }, [items, searchQuery, activeSpaceId]);

  const openFocus = useCallback(
    (id: string) => navigation.navigate('MindFocus', { id }),
    [navigation],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await enrichPendingItems();
    setRefreshing(false);
  };

  const renderItem = useCallback(
    ({ item }: { item: MindItem }) => (
      <View style={{ paddingHorizontal: gutter / 2, paddingBottom: gutter }}>
        <MindCard item={item} onPress={() => openFocus(item.id)} />
      </View>
    ),
    [gutter, openFocus],
  );

  const getItemType = useCallback((item: MindItem) => {
    if (item.imageUri || item.previewImageUrl) return 'media';
    const kind = getMindContentKind(item);
    if (kind === 'reel' || kind === 'video') return 'media';
    if (item.url) return 'url';
    return 'note';
  }, []);

  const emptyVariant = searchQuery.trim() ? 'no-matches' : 'empty';

  const showingSpaces = mindTab === 'spaces';
  const columns = isDesktop ? 4 : isTablet ? 3 : 2;

  return (
    <View style={styles.root}>
      <MindCaptureHeader
        count={activeSpaceId ? filtered.length : activeCount}
        showingSpaces={showingSpaces}
        activeSpaceName={activeSpace?.name}
        onClearSpace={() => setActiveSpaceId(null)}
        onRediscoverPress={() => navigation.navigate('MindSerendipity')}
        onSpacesPress={() => setMindTab('spaces')}
        onBackFromSpaces={() => setMindTab('everything')}
      />

      {showingSpaces ? (
        <MindSpacesView
          onOpenSpace={(id) => {
            setActiveSpaceId(id || null);
            setMindTab('everything');
          }}
        />
      ) : (
        <>
          <View style={styles.headerExtras}>
            <AIConfigBanner />
          </View>

          <TopOfMind items={pinned} onPressItem={openFocus} />

          <View style={styles.controls}>
            <MindSearchBar value={searchInput} onChangeText={handleSearchChange} />
          </View>

          <FlashList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            masonry
            numColumns={columns}
            optimizeItemArrangement
            getItemType={getItemType}
            style={styles.list}
            contentContainerStyle={{
              paddingBottom: listBottomPadding,
              paddingHorizontal: gutter / 2,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={{ paddingHorizontal: gutter / 2 }}>
                <MindEmptyState variant={emptyVariant} />
              </View>
            }
          />
        </>
      )}

      <MindSaveSheet sheetRef={sheetRef} />
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  root: { flex: 1, minHeight: 0 },
  list: { flex: 1 },
  headerExtras: { marginBottom: spacing.sm },
  controls: {
    marginBottom: spacing.md,
  },
});
