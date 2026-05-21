import { format, formatDistanceToNow, parseISO } from 'date-fns';
import type { LedgerEntry, LedgerEntryType, MoneyContact } from '../types';

export function getContactBalance(entries: LedgerEntry[]): number {
  return entries.reduce((sum, e) => {
    if (e.type === 'gave') return sum + e.amount;
    return sum - e.amount;
  }, 0);
}

export type BalanceKind = 'get' | 'give' | 'settled';

export function getBalanceLabel(balance: number): {
  kind: BalanceKind;
  amount: number;
  listLabel: string;
} {
  if (balance > 0) {
    return {
      kind: 'get',
      amount: balance,
      listLabel: "You'll Get",
    };
  }
  if (balance < 0) {
    return {
      kind: 'give',
      amount: Math.abs(balance),
      listLabel: "You'll Give",
    };
  }
  return { kind: 'settled', amount: 0, listLabel: 'Settled' };
}

export function formatRupee(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-IN', {
    maximumFractionDigits: 1,
    minimumFractionDigits: abs % 1 === 0 ? 0 : 1,
  });
  return `₹ ${formatted}`;
}

export function formatLedgerDate(iso: string): string {
  const d = parseISO(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return format(d, 'dd MMM yy • h:mm a');
}

export function getRelativeActivity(updatedAt: string): string {
  const d = parseISO(updatedAt);
  if (Number.isNaN(d.getTime())) return '';
  return formatDistanceToNow(d, { addSuffix: true });
}

export function getEntriesForContact(entries: LedgerEntry[], contactId: string): LedgerEntry[] {
  return entries
    .filter((e) => e.contactId === contactId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getLedgerTotals(
  contacts: MoneyContact[],
  entries: LedgerEntry[],
): { willGive: number; willGet: number } {
  let willGive = 0;
  let willGet = 0;

  for (const contact of contacts) {
    const balance = getContactBalance(getEntriesForContact(entries, contact.id));
    if (balance > 0) willGet += balance;
    else if (balance < 0) willGive += Math.abs(balance);
  }

  return { willGive, willGet };
}

/** Running balance after each entry when sorted newest-first (index 0 = latest). */
export function getRunningBalanceAtIndex(
  sortedNewestFirst: LedgerEntry[],
  index: number,
): number {
  const chronological = [...sortedNewestFirst].reverse();
  const target = sortedNewestFirst[index];
  const idx = chronological.findIndex((e) => e.id === target.id);
  return getContactBalance(chronological.slice(0, idx + 1));
}

export function sortContacts(
  contacts: MoneyContact[],
  entries: LedgerEntry[],
  sortBy: 'name' | 'balance' | 'activity',
): MoneyContact[] {
  const copy = [...contacts];
  copy.sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'activity') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    const balA = Math.abs(getContactBalance(getEntriesForContact(entries, a.id)));
    const balB = Math.abs(getContactBalance(getEntriesForContact(entries, b.id)));
    return balB - balA;
  });
  return copy;
}

export function buildWhatsAppReminder(name: string, amount: number): string {
  return encodeURIComponent(
    `Hey ${name}, reminder about ${formatRupee(amount)} on our ledger. Let me know when you can settle.`,
  );
}

export function buildWhatsAppUrl(phone: string | undefined, message: string): string {
  if (phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits) return `https://wa.me/${digits}?text=${message}`;
  }
  return `https://wa.me/?text=${message}`;
}
