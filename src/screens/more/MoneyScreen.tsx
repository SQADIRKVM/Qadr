import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type BottomSheet from '@gorhom/bottom-sheet';
import { ScreenShell, SubScreenHeader } from '../../components/layout';
import {
  MoneyScreenHero,
  MoneyModeControl,
  MoneySummaryCard,
  MoneySearchBar,
  MoneyContactList,
  MoneyContactFab,
  ImportContactsSheet,
  SubscriptionsSummaryCard,
  SubscriptionList,
  AddSubscriptionSheet,
  ExpensesSummaryCard,
  ExpenseList,
  AddExpenseSheet,
  FinanceCashflowCard,
  IncomeSummaryCard,
  IncomeList,
  AddIncomeSheet,
} from '../../components/money';
import { useMoneyStore } from '../../stores/useMoneyStore';
import { useResponsive } from '../../hooks/useResponsive';
import { getLedgerTotals, sortContacts } from '../../utils/ledger';
import {
  monthlySubscriptionBurn,
  activeSubscriptionCount,
  upcomingSubscriptions,
  sortSubscriptionsByDue,
  expenseTotalForPeriod,
  sortExpensesByDate,
  incomeTotalForPeriod,
  sortIncomesByDate,
  buildFinanceCashflow,
} from '../../utils/moneyTrackers';
import {
  buildLedgerSummaryReport,
  buildCashbookReport,
} from '../../utils/financeExport';
import { shareText } from '../../utils/shareText';
import {
  scheduleSubscriptionReminders,
  requestNotificationPermissions,
} from '../../services/notifications';
import type { DeviceContactRow } from '../../utils/contactImport';
import type { MoneyMode, Subscription, Expense, Income } from '../../types';
import type { MoreStackParamList } from '../../navigation/types';
import { spacing } from '../../theme/spacing';

const FAB_HEIGHT = 56;
const FAB_GAP = 12;

type SortMode = 'activity' | 'name' | 'balance';

const FAB_LABEL: Record<MoneyMode, string> = {
  ledger: 'ADD CONTACT',
  subscriptions: 'ADD SUBSCRIPTION',
  expenses: 'ADD EXPENSE',
  income: 'ADD INCOME',
};

export const MoneyScreen = () => {
  const navigation = useNavigation<StackNavigationProp<MoreStackParamList>>();
  const {
    contacts,
    entries,
    subscriptions,
    expenses,
    incomes,
    addContact,
    addSubscription,
    updateSubscription,
    toggleSubscriptionActive,
    markSubscriptionPaid,
    removeSubscription,
    addExpense,
    updateExpense,
    removeExpense,
    addIncome,
    updateIncome,
    removeIncome,
  } = useMoneyStore();
  const { tabBarHeight, gutter } = useResponsive();
  const fabClearance = tabBarHeight + FAB_HEIGHT + FAB_GAP + spacing.md;

  const [mode, setMode] = useState<MoneyMode>('ledger');
  const importSheetRef = useRef<BottomSheet>(null);
  const subscriptionSheetRef = useRef<BottomSheet>(null);
  const expenseSheetRef = useRef<BottomSheet>(null);
  const incomeSheetRef = useRef<BottomSheet>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('activity');
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = q
      ? contacts.filter((c) => c.name.toLowerCase().includes(q))
      : contacts;
    return sortContacts(list, entries, sortMode);
  }, [contacts, entries, searchQuery, sortMode]);

  const totals = useMemo(() => getLedgerTotals(contacts, entries), [contacts, entries]);

  const cashflow = useMemo(
    () =>
      buildFinanceCashflow(
        totals.willGive,
        totals.willGet,
        subscriptions,
        expenses,
        incomes,
      ),
    [totals, subscriptions, expenses, incomes],
  );

  const subscriptionMetrics = useMemo(() => {
    const upcoming = upcomingSubscriptions(subscriptions, 14);
    return {
      monthlyBurn: monthlySubscriptionBurn(subscriptions),
      activeCount: activeSubscriptionCount(subscriptions),
      upcomingCount: upcoming.length,
      sorted: sortSubscriptionsByDue(subscriptions),
    };
  }, [subscriptions]);

  const expenseMetrics = useMemo(
    () => ({
      last7: expenseTotalForPeriod(expenses, 7),
      last30: expenseTotalForPeriod(expenses, 30),
      sorted: sortExpensesByDate(expenses),
    }),
    [expenses],
  );

  const incomeMetrics = useMemo(
    () => ({
      last7: incomeTotalForPeriod(incomes, 7),
      last30: incomeTotalForPeriod(incomes, 30),
      sorted: sortIncomesByDate(incomes),
    }),
    [incomes],
  );

  useEffect(() => {
    (async () => {
      const ok = await requestNotificationPermissions();
      if (ok) await scheduleSubscriptionReminders(subscriptions);
    })();
  }, [subscriptions]);

  const cycleSort = () => {
    setSortMode((m) => (m === 'activity' ? 'name' : m === 'name' ? 'balance' : 'activity'));
  };

  const openFab = () => {
    if (mode === 'ledger') {
      importSheetRef.current?.expand();
    } else if (mode === 'subscriptions') {
      setEditingSubscription(null);
      subscriptionSheetRef.current?.expand();
    } else if (mode === 'expenses') {
      setEditingExpense(null);
      expenseSheetRef.current?.expand();
    } else {
      setEditingIncome(null);
      incomeSheetRef.current?.expand();
    }
  };

  const shareLedgerReport = () => {
    shareText('Ledger report', buildLedgerSummaryReport(contacts, entries));
  };

  const shareCashbook = () => {
    shareText(
      'Cashbook',
      buildCashbookReport(contacts, entries, subscriptions, expenses, incomes),
    );
  };

  const handleImportSelect = (row: DeviceContactRow, existingContactId?: string) => {
    importSheetRef.current?.close();
    const contactId =
      existingContactId ??
      addContact({
        name: row.name,
        type: 'customer',
        phone: row.phone,
        deviceContactId: row.deviceContactId,
      });
    navigation.navigate('MoneyContact', { contactId });
  };

  const openSubscriptionEdit = (id: string) => {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return;
    setEditingSubscription(sub);
    subscriptionSheetRef.current?.expand();
  };

  const openExpenseEdit = (id: string) => {
    const exp = expenses.find((e) => e.id === id);
    if (!exp) return;
    setEditingExpense(exp);
    expenseSheetRef.current?.expand();
  };

  const openIncomeEdit = (id: string) => {
    const inc = incomes.find((i) => i.id === id);
    if (!inc) return;
    setEditingIncome(inc);
    incomeSheetRef.current?.expand();
  };

  return (
    <View style={styles.screen}>
      <ScreenShell
        header="none"
        scroll
        scrollProps={{
          contentContainerStyle: { paddingBottom: fabClearance, paddingTop: spacing.xs },
        }}
      >
        <View style={[styles.content, { gap: gutter }]}>
          <SubScreenHeader title="Money" onBack={() => navigation.goBack()} />
          <MoneyScreenHero mode={mode} />
          <MoneyModeControl value={mode} onChange={setMode} />
          <FinanceCashflowCard snapshot={cashflow} />

          {mode === 'ledger' && (
            <>
              <MoneySummaryCard
                willGive={totals.willGive}
                willGet={totals.willGet}
                onViewReport={shareLedgerReport}
                onOpenCashbook={shareCashbook}
              />
              <MoneySearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSortPress={cycleSort}
                onPdfPress={shareCashbook}
              />
              <MoneyContactList
                contacts={filtered}
                entries={entries}
                onContactPress={(id) => navigation.navigate('MoneyContact', { contactId: id })}
              />
            </>
          )}

          {mode === 'subscriptions' && (
            <>
              <SubscriptionsSummaryCard
                monthlyBurn={subscriptionMetrics.monthlyBurn}
                activeCount={subscriptionMetrics.activeCount}
                upcomingCount={subscriptionMetrics.upcomingCount}
              />
              <SubscriptionList
                subscriptions={subscriptionMetrics.sorted}
                onSubscriptionPress={openSubscriptionEdit}
              />
            </>
          )}

          {mode === 'expenses' && (
            <>
              <ExpensesSummaryCard
                last7Days={expenseMetrics.last7}
                last30Days={expenseMetrics.last30}
              />
              <ExpenseList
                expenses={expenseMetrics.sorted}
                onExpensePress={openExpenseEdit}
              />
            </>
          )}

          {mode === 'income' && (
            <>
              <IncomeSummaryCard
                last7Days={incomeMetrics.last7}
                last30Days={incomeMetrics.last30}
              />
              <IncomeList incomes={incomeMetrics.sorted} onIncomePress={openIncomeEdit} />
            </>
          )}
        </View>
      </ScreenShell>

      <MoneyContactFab onPress={openFab} label={FAB_LABEL[mode]} />

      <ImportContactsSheet
        sheetRef={importSheetRef}
        storeContacts={contacts}
        onSelect={handleImportSelect}
      />

      <AddSubscriptionSheet
        sheetRef={subscriptionSheetRef}
        editing={editingSubscription}
        onDismiss={() => setEditingSubscription(null)}
        onSave={(data) => {
          if (editingSubscription) {
            updateSubscription(editingSubscription.id, data);
          } else {
            addSubscription(data);
          }
          setEditingSubscription(null);
        }}
        onMarkPaid={(id) => markSubscriptionPaid(id, true)}
        onToggleActive={toggleSubscriptionActive}
        onDelete={removeSubscription}
      />

      <AddExpenseSheet
        sheetRef={expenseSheetRef}
        editing={editingExpense}
        onDismiss={() => setEditingExpense(null)}
        onSave={(data) => {
          if (editingExpense) {
            updateExpense(editingExpense.id, data);
          } else {
            addExpense(data);
          }
          setEditingExpense(null);
        }}
        onDelete={removeExpense}
      />

      <AddIncomeSheet
        sheetRef={incomeSheetRef}
        editing={editingIncome}
        onDismiss={() => setEditingIncome(null)}
        onSave={(data) => {
          if (editingIncome) {
            updateIncome(editingIncome.id, data);
          } else {
            addIncome(data);
          }
          setEditingIncome(null);
        }}
        onDelete={removeIncome}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { width: '100%' },
});
