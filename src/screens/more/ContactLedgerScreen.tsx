import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type BottomSheet from '@gorhom/bottom-sheet';
import BottomSheetLib, { BottomSheetView } from '@gorhom/bottom-sheet';
import { ScreenShell, BentoCard, SubScreenHeader } from '../../components/layout';
import {
  ContactLedgerHeader,
  ContactBalanceCard,
  ContactQuickActions,
  LedgerEntryRow,
  LedgerBottomActions,
  CollectionDateSheet,
} from '../../components/money';
import { AppText } from '../../components/primitives/AppText';
import { Button } from '../../components/primitives/Button';
import { UnderlineInput } from '../../components/primitives/UnderlineInput';
import { Separator } from '../../components/primitives/Separator';
import { useMoneyStore } from '../../stores/useMoneyStore';
import {
  buildWhatsAppReminder,
  buildWhatsAppUrl,
  getContactBalance,
  getEntriesForContact,
  getRunningBalanceAtIndex,
} from '../../utils/ledger';
import { buildContactLedgerReport } from '../../utils/financeExport';
import { shareText, buildSmsUrl } from '../../utils/shareText';
import { userAlert } from '../../utils/userAlert';
import type { LedgerEntryType } from '../../types';
import type { MoreStackParamList } from '../../navigation/types';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

type Route = RouteProp<MoreStackParamList, 'MoneyContact'>;

export const ContactLedgerScreen = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<StackNavigationProp<MoreStackParamList>>();
  const route = useRoute<Route>();
  const { contactId } = route.params;
  const { contacts, entries, addEntry, getContact, updateContactCollectionDate } = useMoneyStore();

  const contact = getContact(contactId) ?? contacts.find((c) => c.id === contactId);
  const sheetRef = useRef<BottomSheet>(null);
  const collectionSheetRef = useRef<BottomSheet>(null);
  const [entryType, setEntryType] = useState<LedgerEntryType>('gave');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const sortedEntries = useMemo(
    () => (contact ? getEntriesForContact(entries, contact.id) : []),
    [entries, contact],
  );

  const balance = useMemo(() => getContactBalance(sortedEntries), [sortedEntries]);

  if (!contact) {
    return (
      <ScreenShell header="none" scroll>
        <SubScreenHeader title="Contact" onBack={() => navigation.goBack()} />
        <AppText variant="body-md" muted>
          Contact not found.
        </AppText>
      </ScreenShell>
    );
  }

  const openEntrySheet = (type: LedgerEntryType) => {
    setEntryType(type);
    setAmount('');
    setNote('');
    sheetRef.current?.expand();
  };

  const saveEntry = () => {
    const num = Number(amount);
    if (!num || num <= 0) return;
    addEntry(contact.id, entryType, num, note);
    sheetRef.current?.close();
  };

  const openWhatsApp = () => {
    if (balance <= 0) {
      userAlert('Reminders', 'No outstanding balance to remind about.');
      return;
    }
    const msg = buildWhatsAppReminder(contact.name, balance);
    Linking.openURL(buildWhatsAppUrl(contact.phone, msg));
  };

  const shareReport = () => {
    shareText(
      `Ledger: ${contact.name}`,
      buildContactLedgerReport(contact, entries),
    );
  };

  const openSms = () => {
    if (balance <= 0) {
      userAlert('SMS', 'No outstanding balance to message about.');
      return;
    }
    const body = `Hi ${contact.name}, reminder about our ledger balance. Let me know when you can settle.`;
    Linking.openURL(buildSmsUrl(contact.phone, body)).catch(() => {
      userAlert('SMS', 'Could not open the SMS app.');
    });
  };

  return (
    <View style={styles.screen}>
      <ScreenShell header="none" scroll={false}>
        <SubScreenHeader title={contact.name} onBack={() => navigation.goBack()} />
        <ContactLedgerHeader contact={contact} />
        <ContactBalanceCard
          balance={balance}
          collectionDate={contact.collectionDate}
          onSetCollectionDates={() => collectionSheetRef.current?.expand()}
        />
        <ContactQuickActions onReport={shareReport} onRemind={openWhatsApp} onSms={openSms} />

        <View style={styles.columnHeader}>
          <AppText variant="label-sm" style={[styles.col, styles.colEntries]}>
            ENTRIES
          </AppText>
          <AppText variant="label-sm" style={[styles.col, styles.colGave]}>
            YOU GAVE
          </AppText>
          <AppText variant="label-sm" style={[styles.col, styles.colGot]}>
            YOU GOT
          </AppText>
        </View>

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <BentoCard deep style={styles.entriesCard}>
            {sortedEntries.length === 0 ? (
              <AppText variant="body-md" muted style={styles.empty}>
                No entries yet. Use YOU GAVE or YOU GOT below.
              </AppText>
            ) : (
              sortedEntries.map((entry, index) => (
                <View key={entry.id}>
                  <LedgerEntryRow
                    entry={entry}
                    runningBalance={getRunningBalanceAtIndex(sortedEntries, index)}
                  />
                  {index < sortedEntries.length - 1 ? <Separator /> : null}
                </View>
              ))
            )}
          </BentoCard>
        </ScrollView>
      </ScreenShell>

      <LedgerBottomActions onGave={() => openEntrySheet('gave')} onGot={() => openEntrySheet('got')} />

      <BottomSheetLib
        ref={sheetRef}
        index={-1}
        snapPoints={['40%']}
        enablePanDownToClose
        backgroundStyle={styles.sheetBg}
      >
        <BottomSheetView style={styles.sheet}>
          <AppText variant="label-sm" style={styles.sheetTitle}>
            {entryType === 'gave' ? 'YOU GAVE' : 'YOU GOT'}
          </AppText>
          <UnderlineInput
            label="AMOUNT"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <UnderlineInput label="NOTE (OPTIONAL)" value={note} onChangeText={setNote} />
          <Button label="SAVE ENTRY" onPress={saveEntry} />
        </BottomSheetView>
      </BottomSheetLib>

      <CollectionDateSheet
        sheetRef={collectionSheetRef}
        initialDate={contact.collectionDate}
        onSave={(date) => updateContactCollectionDate(contact.id, date)}
      />
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  screen: { flex: 1 },
  columnHeader: { flexDirection: 'row', paddingBottom: spacing.sm },
  col: { color: colors.onSurfaceVariant, letterSpacing: 1 },
  colEntries: { flex: 1.2 },
  colGave: { flex: 0.5, textAlign: 'right', paddingRight: spacing.xs },
  colGot: { flex: 0.5, textAlign: 'right' },
  list: { flex: 1, marginBottom: 96 },
  listContent: { paddingBottom: spacing.md },
  entriesCard: { padding: spacing.md },
  empty: { padding: spacing.lg, textAlign: 'center', fontStyle: 'italic' },
  sheetBg: { backgroundColor: colors.surfaceContainer },
  sheet: { padding: spacing.screenMargin, gap: 12 },
  sheetTitle: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
});
