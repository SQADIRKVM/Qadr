import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getContactBalance,
  getLedgerTotals,
  getBalanceLabel,
} from '../ledger';
import type { LedgerEntry } from '../../types';

describe('ledger', () => {
  it('getContactBalance nets gave vs got', () => {
    const entries: LedgerEntry[] = [
      {
        id: '1',
        contactId: 'c1',
        type: 'gave',
        amount: 100,
        createdAt: '2026-01-01T12:00:00.000Z',
      },
      {
        id: '2',
        contactId: 'c1',
        type: 'got',
        amount: 40,
        createdAt: '2026-01-02T12:00:00.000Z',
      },
    ];
    assert.equal(getContactBalance(entries), 60);
  });

  it('getLedgerTotals aggregates will give and will get', () => {
    const contacts = [
      {
        id: 'a',
        name: 'A',
        type: 'customer' as const,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'b',
        name: 'B',
        type: 'customer' as const,
        createdAt: '',
        updatedAt: '',
      },
    ];
    const entries: LedgerEntry[] = [
      { id: '1', contactId: 'a', type: 'gave', amount: 50, createdAt: '' },
      { id: '2', contactId: 'b', type: 'got', amount: 30, createdAt: '' },
    ];
    const totals = getLedgerTotals(contacts, entries);
    assert.equal(totals.willGet, 50);
    assert.equal(totals.willGive, 30);
  });

  it('getBalanceLabel classifies settled', () => {
    assert.equal(getBalanceLabel(0).kind, 'settled');
  });
});
