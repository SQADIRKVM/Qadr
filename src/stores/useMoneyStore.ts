import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import type {
  MoneyContact,
  LedgerEntry,
  LedgerEntryType,
  AddMoneyContactInput,
  Subscription,
  AddSubscriptionInput,
  Expense,
  AddExpenseInput,
  Income,
  AddIncomeInput,
} from '../types';
import { generateId } from '../utils/id';
import { advanceDueDate } from '../utils/moneyTrackers';
import { createPersistStorage } from './storage';

interface MoneyState {
  contacts: MoneyContact[];
  entries: LedgerEntry[];
  subscriptions: Subscription[];
  expenses: Expense[];
  incomes: Income[];
  addContact: (data: AddMoneyContactInput) => string;
  addEntry: (contactId: string, type: LedgerEntryType, amount: number, note?: string) => void;
  updateContactCollectionDate: (id: string, collectionDate: string | undefined) => void;
  getContact: (id: string) => MoneyContact | undefined;
  findByDeviceContactId: (deviceContactId: string) => MoneyContact | undefined;
  addSubscription: (data: AddSubscriptionInput) => string;
  updateSubscription: (id: string, data: Partial<AddSubscriptionInput> & { active?: boolean }) => void;
  toggleSubscriptionActive: (id: string) => void;
  markSubscriptionPaid: (id: string, logExpense?: boolean) => void;
  removeSubscription: (id: string) => void;
  addExpense: (data: AddExpenseInput) => string;
  updateExpense: (id: string, data: Partial<AddExpenseInput>) => void;
  removeExpense: (id: string) => void;
  addIncome: (data: AddIncomeInput) => string;
  updateIncome: (id: string, data: Partial<AddIncomeInput>) => void;
  removeIncome: (id: string) => void;
}

/** Legacy persisted shape before Khatabook ledger migration */
interface LegacyLending {
  id: string;
  name: string;
  amount: number;
  purpose: string;
  lentDate: string;
  returnDate: string;
  returned: boolean;
}

interface LegacyPersisted {
  lendings?: LegacyLending[];
  contacts?: MoneyContact[];
  entries?: LedgerEntry[];
  subscriptions?: Subscription[];
  expenses?: Expense[];
  incomes?: Income[];
}

function migrateLegacyLendings(lendings: LegacyLending[]): {
  contacts: MoneyContact[];
  entries: LedgerEntry[];
} {
  const contacts: MoneyContact[] = [];
  const entries: LedgerEntry[] = [];

  for (const l of lendings) {
    const contactId = l.id;
    const createdAt = l.lentDate.includes('T')
      ? l.lentDate
      : `${l.lentDate}T12:00:00.000Z`;
    const updatedAt = l.returned
      ? l.returnDate.includes('T')
        ? l.returnDate
        : `${l.returnDate}T12:00:00.000Z`
      : createdAt;

    contacts.push({
      id: contactId,
      name: l.name,
      type: 'customer',
      createdAt,
      updatedAt,
    });

    entries.push({
      id: generateId(),
      contactId,
      type: 'gave',
      amount: l.amount,
      note: l.purpose || undefined,
      createdAt,
    });

    if (l.returned) {
      const gotAt = l.returnDate.includes('T')
        ? l.returnDate
        : `${l.returnDate}T12:00:00.000Z`;
      entries.push({
        id: generateId(),
        contactId,
        type: 'got',
        amount: l.amount,
        note: 'Returned',
        createdAt: gotAt,
      });
    }
  }

  return { contacts, entries };
}

export const useMoneyStore = create<MoneyState>()(
  persist(
    (set, get) => ({
      contacts: [],
      entries: [],
      subscriptions: [],
      expenses: [],
      incomes: [],
      addContact: (data) => {
        const existing = data.deviceContactId
          ? get().contacts.find((c) => c.deviceContactId === data.deviceContactId)
          : undefined;
        if (existing) return existing.id;

        const now = new Date().toISOString();
        const contact: MoneyContact = {
          id: generateId(),
          name: data.name.trim(),
          type: data.type,
          phone: data.phone,
          deviceContactId: data.deviceContactId,
          createdAt: now,
          updatedAt: now,
        };
        set({ contacts: [contact, ...get().contacts] });
        return contact.id;
      },
      addEntry: (contactId, type, amount, note) => {
        const now = new Date().toISOString();
        const entry: LedgerEntry = {
          id: generateId(),
          contactId,
          type,
          amount,
          note: note?.trim() || undefined,
          createdAt: now,
        };
        set({
          entries: [entry, ...get().entries],
          contacts: get().contacts.map((c) =>
            c.id === contactId ? { ...c, updatedAt: now } : c,
          ),
        });
      },
      updateContactCollectionDate: (id, collectionDate) => {
        const now = new Date().toISOString();
        set({
          contacts: get().contacts.map((c) =>
            c.id === id
              ? {
                  ...c,
                  collectionDate: collectionDate?.trim() || undefined,
                  updatedAt: now,
                }
              : c,
          ),
        });
      },
      getContact: (id) => get().contacts.find((c) => c.id === id),
      findByDeviceContactId: (deviceContactId) =>
        get().contacts.find((c) => c.deviceContactId === deviceContactId),
      addSubscription: (data) => {
        const now = new Date().toISOString();
        const sub: Subscription = {
          id: generateId(),
          name: data.name.trim(),
          amount: data.amount,
          cycle: data.cycle,
          nextDueDate: data.nextDueDate,
          active: true,
          note: data.note?.trim() || undefined,
          createdAt: now,
        };
        set({ subscriptions: [sub, ...get().subscriptions] });
        return sub.id;
      },
      updateSubscription: (id, data) => {
        set({
          subscriptions: get().subscriptions.map((s) => {
            if (s.id !== id) return s;
            return {
              ...s,
              ...(data.name !== undefined ? { name: data.name.trim() } : {}),
              ...(data.amount !== undefined ? { amount: data.amount } : {}),
              ...(data.cycle !== undefined ? { cycle: data.cycle } : {}),
              ...(data.nextDueDate !== undefined ? { nextDueDate: data.nextDueDate } : {}),
              ...(data.note !== undefined ? { note: data.note.trim() || undefined } : {}),
              ...(data.active !== undefined ? { active: data.active } : {}),
            };
          }),
        });
      },
      toggleSubscriptionActive: (id) => {
        set({
          subscriptions: get().subscriptions.map((s) =>
            s.id === id ? { ...s, active: !s.active } : s,
          ),
        });
      },
      markSubscriptionPaid: (id, logExpense = true) => {
        const sub = get().subscriptions.find((s) => s.id === id);
        if (!sub) return;
        const nextDue = advanceDueDate(sub.nextDueDate, sub.cycle);
        set({
          subscriptions: get().subscriptions.map((s) =>
            s.id === id ? { ...s, nextDueDate: nextDue } : s,
          ),
        });
        if (logExpense) {
          get().addExpense({
            amount: sub.amount,
            category: 'Subscription',
            note: sub.name,
            date: format(new Date(), 'yyyy-MM-dd'),
          });
        }
      },
      removeSubscription: (id) => {
        set({ subscriptions: get().subscriptions.filter((s) => s.id !== id) });
      },
      addExpense: (data) => {
        const now = new Date().toISOString();
        const expense: Expense = {
          id: generateId(),
          amount: data.amount,
          category: data.category?.trim() || undefined,
          note: data.note?.trim() || undefined,
          date: data.date ?? format(new Date(), 'yyyy-MM-dd'),
          createdAt: now,
        };
        set({ expenses: [expense, ...get().expenses] });
        return expense.id;
      },
      updateExpense: (id, data) => {
        set({
          expenses: get().expenses.map((e) => {
            if (e.id !== id) return e;
            return {
              ...e,
              ...(data.amount !== undefined ? { amount: data.amount } : {}),
              ...(data.category !== undefined
                ? { category: data.category.trim() || undefined }
                : {}),
              ...(data.note !== undefined ? { note: data.note.trim() || undefined } : {}),
              ...(data.date !== undefined ? { date: data.date } : {}),
            };
          }),
        });
      },
      removeExpense: (id) => {
        set({ expenses: get().expenses.filter((e) => e.id !== id) });
      },
      addIncome: (data) => {
        const now = new Date().toISOString();
        const income: Income = {
          id: generateId(),
          amount: data.amount,
          source: data.source?.trim() || undefined,
          note: data.note?.trim() || undefined,
          date: data.date ?? format(new Date(), 'yyyy-MM-dd'),
          createdAt: now,
        };
        set({ incomes: [income, ...get().incomes] });
        return income.id;
      },
      updateIncome: (id, data) => {
        set({
          incomes: get().incomes.map((i) => {
            if (i.id !== id) return i;
            return {
              ...i,
              ...(data.amount !== undefined ? { amount: data.amount } : {}),
              ...(data.source !== undefined
                ? { source: data.source.trim() || undefined }
                : {}),
              ...(data.note !== undefined ? { note: data.note.trim() || undefined } : {}),
              ...(data.date !== undefined ? { date: data.date } : {}),
            };
          }),
        });
      },
      removeIncome: (id) => {
        set({ incomes: get().incomes.filter((i) => i.id !== id) });
      },
    }),
    {
      name: 'qadr-money',
      version: 4,
      storage: createPersistStorage(),
      migrate: (persisted: unknown, version) => {
        const state = persisted as LegacyPersisted;
        const baseIncomes = state?.incomes ?? [];
        if (version >= 4 && state?.contacts && state?.entries) {
          return {
            contacts: state.contacts,
            entries: state.entries,
            subscriptions: state.subscriptions ?? [],
            expenses: state.expenses ?? [],
            incomes: baseIncomes,
          };
        }
        if (version >= 3 && state?.contacts && state?.entries) {
          return {
            contacts: state.contacts,
            entries: state.entries,
            subscriptions: state.subscriptions ?? [],
            expenses: state.expenses ?? [],
            incomes: [],
          };
        }
        if (state?.contacts && state?.entries) {
          return {
            contacts: state.contacts,
            entries: state.entries,
            subscriptions: [],
            expenses: [],
            incomes: [],
          };
        }
        if (state?.lendings?.length) {
          const migrated = migrateLegacyLendings(state.lendings);
          return { ...migrated, subscriptions: [], expenses: [], incomes: [] };
        }
        return { contacts: [], entries: [], subscriptions: [], expenses: [], incomes: [] };
      },
    },
  ),
);
