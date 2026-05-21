import type { Contact, ExistingContact } from 'expo-contacts';
import type { MoneyContact } from '../types';

function hasContactId(c: Contact): c is ExistingContact {
  return typeof (c as ExistingContact).id === 'string' && (c as ExistingContact).id.length > 0;
}

export interface DeviceContactRow {
  deviceContactId: string;
  name: string;
  phone?: string;
}

export function getContactDisplayName(contact: Contact): string {
  if (contact.name?.trim()) return contact.name.trim();
  const parts = [contact.firstName, contact.lastName].filter(Boolean);
  if (parts.length > 0) return parts.join(' ').trim();
  return 'Unknown';
}

export function getPrimaryPhone(contact: Contact): string | undefined {
  const numbers = contact.phoneNumbers;
  if (!numbers?.length) return undefined;
  const mobile = numbers.find((n) => n.label?.toLowerCase().includes('mobile'));
  const raw = (mobile ?? numbers[0]).number ?? '';
  const digits = normalizePhoneForWa(raw);
  return digits || undefined;
}

export function normalizePhoneForWa(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function mapExpoContactsToRows(contacts: Contact[]): DeviceContactRow[] {
  const rows: DeviceContactRow[] = [];
  const seen = new Set<string>();

  for (const c of contacts) {
    if (!hasContactId(c)) continue;
    const id = c.id;
    const name = getContactDisplayName(c);
    if (!name || name === 'Unknown') continue;
    if (seen.has(id)) continue;
    seen.add(id);

    rows.push({
      deviceContactId: id,
      name,
      phone: getPrimaryPhone(c),
    });
  }

  rows.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  return rows;
}

export function isAlreadyImported(
  deviceContactId: string,
  storeContacts: MoneyContact[],
): boolean {
  return storeContacts.some((c) => c.deviceContactId === deviceContactId);
}

export function findContactByDeviceId(
  deviceContactId: string,
  storeContacts: MoneyContact[],
): MoneyContact | undefined {
  return storeContacts.find((c) => c.deviceContactId === deviceContactId);
}

export function filterDeviceContactRows(
  rows: DeviceContactRow[],
  query: string,
): DeviceContactRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      (r.phone?.includes(q.replace(/\D/g, '')) ?? false),
  );
}
