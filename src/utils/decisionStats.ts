import type { Decision } from '../types';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function formatDecisionDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.toUpperCase();
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function getDecisionDisplayDate(decision: Decision): string {
  return formatDecisionDate(decision.createdAt || decision.deadline);
}

export function getConfidenceAggregatePercent(decisions: Decision[]): number {
  if (decisions.length === 0) return 0;
  const sum = decisions.reduce((acc, d) => acc + Math.min(10, Math.max(0, d.confidence)), 0);
  return Math.round((sum / decisions.length / 10) * 100);
}

export function getPendingCount(decisions: Decision[]): number {
  return decisions.filter((d) => d.status === 'pending').length;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getDecisionsAddedThisWeek(decisions: Decision[]): number {
  const weekStart = startOfWeek(new Date()).getTime();
  return decisions.filter((d) => new Date(d.createdAt).getTime() >= weekStart).length;
}
