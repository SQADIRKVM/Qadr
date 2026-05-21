import { format } from 'date-fns';
import type { Expense, Income, LedgerEntry, MoneyContact, Subscription } from '../types';
import {
  formatLedgerDate,
  formatRupee,
  getBalanceLabel,
  getContactBalance,
  getEntriesForContact,
  getLedgerTotals,
} from './ledger';
import { monthlySubscriptionBurn } from './moneyTrackers';

export function buildLedgerSummaryReport(
  contacts: MoneyContact[],
  entries: LedgerEntry[],
): string {
  const { willGive, willGet } = getLedgerTotals(contacts, entries);
  const lines = [
    'Qadr — Ledger Summary',
    format(new Date(), 'dd MMM yyyy • h:mm a'),
    '',
    `You will give: ${formatRupee(willGive)}`,
    `You will get: ${formatRupee(willGet)}`,
    '',
    'Contacts:',
  ];

  for (const c of contacts) {
    const contactEntries = getEntriesForContact(entries, c.id);
    const balance = getContactBalance(contactEntries);
    const label = getBalanceLabel(balance);
    lines.push(
      `• ${c.name}: ${label.kind === 'settled' ? 'Settled' : `${label.listLabel} ${formatRupee(label.amount)}`}`,
    );
  }

  return lines.join('\n');
}

export function buildContactLedgerReport(
  contact: MoneyContact,
  entries: LedgerEntry[],
): string {
  const sorted = getEntriesForContact(entries, contact.id);
  const balance = getContactBalance(sorted);
  const label = getBalanceLabel(balance);
  const lines = [
    `Qadr — Ledger: ${contact.name}`,
    format(new Date(), 'dd MMM yyyy • h:mm a'),
    '',
    `Balance: ${label.kind === 'settled' ? 'Settled' : `${label.listLabel} ${formatRupee(label.amount)}`}`,
    contact.collectionDate ? `Collection target: ${contact.collectionDate}` : '',
    '',
    'Entries (newest first):',
  ].filter(Boolean);

  for (const e of sorted) {
    const side = e.type === 'gave' ? 'YOU GAVE' : 'YOU GOT';
    lines.push(
      `• ${formatLedgerDate(e.createdAt)} | ${side} ${formatRupee(e.amount)}${e.note ? ` — ${e.note}` : ''}`,
    );
  }

  if (sorted.length === 0) lines.push('(no entries)');
  return lines.join('\n');
}

export function buildCashbookReport(
  contacts: MoneyContact[],
  entries: LedgerEntry[],
  subscriptions: Subscription[],
  expenses: Expense[],
  incomes: Income[],
): string {
  const ledger = buildLedgerSummaryReport(contacts, entries);
  const burn = monthlySubscriptionBurn(subscriptions);
  const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const incomeTotal = incomes.reduce((s, i) => s + i.amount, 0);

  return [
    ledger,
    '',
    '--- Finance snapshot ---',
    `Monthly subscription burn: ${formatRupee(burn)}`,
    `Total expenses logged: ${formatRupee(expenseTotal)}`,
    `Total income logged: ${formatRupee(incomeTotal)}`,
  ].join('\n');
}
