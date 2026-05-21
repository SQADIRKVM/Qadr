import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Platform,
  TextInput,
} from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as Contacts from 'expo-contacts';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from '../primitives/AppText';
import type { MoneyContact } from '../../types';
import {
  type DeviceContactRow,
  mapExpoContactsToRows,
  filterDeviceContactRows,
  findContactByDeviceId,
  isAlreadyImported,
} from '../../utils/contactImport';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface ImportContactsSheetProps {
  sheetRef: React.RefObject<BottomSheet | null>;
  storeContacts: MoneyContact[];
  onSelect: (row: DeviceContactRow, existingContactId?: string) => void;
}

type LoadState = 'idle' | 'loading' | 'ready' | 'denied' | 'unavailable' | 'error';

export const ImportContactsSheet: React.FC<ImportContactsSheetProps> = ({
  sheetRef,
  storeContacts,
  onSelect,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [rows, setRows] = useState<DeviceContactRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(
    () => filterDeviceContactRows(rows, searchQuery),
    [rows, searchQuery],
  );

  const loadContacts = useCallback(async () => {
    setSearchQuery('');
    setLoadState('loading');

    if (Platform.OS === 'web') {
      setLoadState('unavailable');
      return;
    }

    try {
      const available = await Contacts.isAvailableAsync();
      if (!available) {
        setLoadState('unavailable');
        return;
      }

      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        setLoadState('denied');
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        sort: Contacts.SortTypes.FirstName,
      });

      setRows(mapExpoContactsToRows(data));
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  }, []);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index >= 0) {
        loadContacts();
      } else {
        setLoadState('idle');
        setRows([]);
        setSearchQuery('');
      }
    },
    [loadContacts],
  );

  const renderRow = ({ item }: { item: DeviceContactRow }) => {
    const added = isAlreadyImported(item.deviceContactId, storeContacts);
    const existing = findContactByDeviceId(item.deviceContactId, storeContacts);
    const initial = item.name.trim()[0]?.toUpperCase() || '?';

    return (
      <Pressable
        style={({ pressed }) => [
          styles.row,
          added && styles.rowAdded,
          pressed && !added && styles.rowPressed,
        ]}
        disabled={false}
        onPress={() => onSelect(item, existing?.id)}
      >
        <View style={styles.avatar}>
          <AppText variant="body-md" style={styles.initial}>
            {initial}
          </AppText>
        </View>
        <View style={styles.info}>
          <AppText variant="body-md" style={styles.name}>
            {item.name}
          </AppText>
          {item.phone ? (
            <AppText variant="body-md" muted style={styles.phone}>
              {item.phone}
            </AppText>
          ) : null}
        </View>
        {added ? (
          <AppText variant="label-sm" style={styles.addedLabel}>
            ADDED
          </AppText>
        ) : (
          <MaterialIcons name="chevron-right" size={22} color={colors.onSurfaceVariant} />
        )}
      </Pressable>
    );
  };

  const renderContent = () => {
    if (loadState === 'loading' || loadState === 'idle') {
      return (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <AppText variant="body-md" muted style={styles.centerText}>
            Loading contacts…
          </AppText>
        </View>
      );
    }

    if (loadState === 'unavailable') {
      return (
        <View style={styles.center}>
          <AppText variant="body-md" muted style={styles.centerText}>
            Import from phone contacts is available on iOS and Android only.
          </AppText>
        </View>
      );
    }

    if (loadState === 'denied') {
      return (
        <View style={styles.center}>
          <AppText variant="body-md" muted style={styles.centerText}>
            Contact access was denied. Enable contacts permission in system settings to import
            people into your ledger.
          </AppText>
        </View>
      );
    }

    if (loadState === 'error') {
      return (
        <View style={styles.center}>
          <AppText variant="body-md" muted style={styles.centerText}>
            Could not load contacts. Try again.
          </AppText>
          <Pressable onPress={loadContacts} style={styles.retryBtn}>
            <AppText variant="label-sm" style={styles.retryText}>
              RETRY
            </AppText>
          </Pressable>
        </View>
      );
    }

    if (filtered.length === 0) {
      return (
        <View style={styles.center}>
          <AppText variant="body-md" muted style={styles.centerText}>
            {rows.length === 0 ? 'No contacts found on this device.' : 'No matches for your search.'}
          </AppText>
        </View>
      );
    }

    return (
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.deviceContactId}
        renderItem={renderRow}
        keyboardShouldPersistTaps="handled"
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    );
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={['90%']}
      enablePanDownToClose
      onChange={handleSheetChange}
      backgroundStyle={styles.sheetBg}
    >
      <BottomSheetView style={styles.sheet}>
        <AppText variant="label-sm" style={styles.title}>
          IMPORT CONTACT
        </AppText>
        {loadState === 'ready' && (
          <View style={styles.searchWrap}>
            <MaterialIcons name="search" size={18} color={colors.onSurfaceVariant} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="SEARCH CONTACT"
              placeholderTextColor={colors.outline}
              autoCapitalize="none"
            />
          </View>
        )}
        <View style={styles.listHost}>{renderContent()}</View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  sheetBg: {
    backgroundColor: colors.surfaceContainer,
  },
  sheet: {
    flex: 1,
    paddingHorizontal: spacing.screenMargin,
    paddingBottom: spacing.md,
  },
  title: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.cardBg,
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 14,
    padding: 0,
  },
  listHost: {
    flex: 1,
    minHeight: 200,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowPressed: {
    opacity: 0.85,
  },
  rowAdded: {
    opacity: 0.7,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: colors.primary,
    fontWeight: '600',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: colors.onSurface,
  },
  phone: {
    fontSize: 12,
    marginTop: 2,
  },
  addedLabel: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  separator: {
    height: 1,
    backgroundColor: colors.outlineVariant,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  centerText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
  },
  retryText: {
    color: colors.primary,
    letterSpacing: 1,
  },
});
