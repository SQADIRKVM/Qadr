import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  monthlySubscriptionBurn,
  advanceDueDate,
  expenseTotalForPeriod,
  buildFinanceCashflow,
} from '../moneyTrackers';
import type { Subscription, Expense } from '../../types';

describe('moneyTrackers', () => {
  it('monthlySubscriptionBurn normalizes yearly to monthly', () => {
    const subs: Subscription[] = [
      {
        id: '1',
        name: 'Annual',
        amount: 1200,
        cycle: 'yearly',
        nextDueDate: '2026-06-01',
        active: true,
        createdAt: '',
      },
    ];
    const burn = monthlySubscriptionBurn(subs);
    assert.equal(burn, 100);
  });

  it('advanceDueDate moves monthly due date forward', () => {
    const next = advanceDueDate('2026-05-01', 'monthly');
    assert.equal(next, '2026-05-31');
  });

  it('expenseTotalForPeriod sums recent expenses', () => {
    const today = new Date().toISOString().slice(0, 10);
    const expenses: Expense[] = [
      { id: '1', amount: 100, date: today, createdAt: '' },
      { id: '2', amount: 50, date: '2020-01-01', createdAt: '' },
    ];
    assert.equal(expenseTotalForPeriod(expenses, 7), 100);
  });

  it('buildFinanceCashflow computes net position', () => {
    const snap = buildFinanceCashflow(10, 20, [], [], []);
    assert.equal(snap.ledgerWillGive, 10);
    assert.equal(snap.ledgerWillGet, 20);
    assert.equal(snap.netPosition, 10);
  });
});
