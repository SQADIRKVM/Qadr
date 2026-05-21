import { addDays, differenceInCalendarDays, format, parseISO, startOfDay, subDays } from 'date-fns';
import type { BillingCycle, Expense, Income, Subscription } from '../types';

const CYCLE_MONTHLY_FACTOR: Record<BillingCycle, number> = {
  weekly: 52 / 12,
  monthly: 1,
  yearly: 1 / 12,
};

export function monthlyAmountForCycle(amount: number, cycle: BillingCycle): number {
  return Math.round(amount * CYCLE_MONTHLY_FACTOR[cycle] * 100) / 100;
}

export function monthlySubscriptionBurn(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((s) => s.active)
    .reduce((sum, s) => sum + monthlyAmountForCycle(s.amount, s.cycle), 0);
}

export function activeSubscriptionCount(subscriptions: Subscription[]): number {
  return subscriptions.filter((s) => s.active).length;
}

export function upcomingSubscriptions(
  subscriptions: Subscription[],
  withinDays = 14,
): Subscription[] {
  const today = startOfDay(new Date());
  const end = addDays(today, withinDays);

  return subscriptions
    .filter((s) => s.active)
    .filter((s) => {
      const due = parseISO(s.nextDueDate);
      return !Number.isNaN(due.getTime()) && due >= today && due <= end;
    })
    .sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate));
}

export function formatBillingCycle(cycle: BillingCycle): string {
  return cycle.charAt(0).toUpperCase() + cycle.slice(1);
}

export function formatDueLabel(nextDueDate: string): string {
  const due = parseISO(nextDueDate);
  if (Number.isNaN(due.getTime())) return '—';
  const days = differenceInCalendarDays(startOfDay(due), startOfDay(new Date()));
  if (days < 0) return 'Overdue';
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days <= 7) return `Due in ${days}d`;
  return format(due, 'MMM d');
}

export function expenseTotalForPeriod(expenses: Expense[], days: number): number {
  const end = startOfDay(new Date());
  const start = subDays(end, days - 1);

  return expenses.reduce((sum, e) => {
    const d = parseISO(e.date);
    if (Number.isNaN(d.getTime())) return sum;
    const day = startOfDay(d);
    if (day >= start && day <= end) return sum + e.amount;
    return sum;
  }, 0);
}

export function sortExpensesByDate(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

export function sortSubscriptionsByDue(subscriptions: Subscription[]): Subscription[] {
  return [...subscriptions].sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1;
    return a.nextDueDate.localeCompare(b.nextDueDate);
  });
}

export function advanceDueDate(current: string, cycle: BillingCycle): string {
  const due = parseISO(current);
  if (Number.isNaN(due.getTime())) return format(new Date(), 'yyyy-MM-dd');
  const next =
    cycle === 'weekly'
      ? addDays(due, 7)
      : cycle === 'yearly'
        ? addDays(due, 365)
        : addDays(due, 30);
  return format(next, 'yyyy-MM-dd');
}

export function incomeTotalForPeriod(incomes: Income[], days: number): number {
  const end = startOfDay(new Date());
  const start = subDays(end, days - 1);
  return incomes.reduce((sum, i) => {
    const d = parseISO(i.date);
    if (Number.isNaN(d.getTime())) return sum;
    const day = startOfDay(d);
    if (day >= start && day <= end) return sum + i.amount;
    return sum;
  }, 0);
}

export function sortIncomesByDate(incomes: Income[]): Income[] {
  return [...incomes].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  );
}

export interface FinanceCashflowSnapshot {
  monthlySubBurn: number;
  expensesLast30: number;
  incomeLast30: number;
  ledgerWillGive: number;
  ledgerWillGet: number;
  netPosition: number;
}

export function buildFinanceCashflow(
  ledgerWillGive: number,
  ledgerWillGet: number,
  subscriptions: Subscription[],
  expenses: Expense[],
  incomes: Income[],
): FinanceCashflowSnapshot {
  const monthlySubBurn = monthlySubscriptionBurn(subscriptions);
  const expensesLast30 = expenseTotalForPeriod(expenses, 30);
  const incomeLast30 = incomeTotalForPeriod(incomes, 30);
  const netPosition = incomeLast30 - expensesLast30 - monthlySubBurn + ledgerWillGet - ledgerWillGive;

  return {
    monthlySubBurn,
    expensesLast30,
    incomeLast30,
    ledgerWillGive,
    ledgerWillGet,
    netPosition,
  };
}
