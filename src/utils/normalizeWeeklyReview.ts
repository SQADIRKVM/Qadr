import type { WeeklyReviewResponse } from '../services/ai/types';
import type { SleepGrade } from '../types';
import { parseAIJson } from './parseAIJson';
import {
  buildWeeklyReviewFallbackFields,
  type LocalInsightContext,
} from './localInsights';

export { parseAIJson };

/** Payload / metric keys the model sometimes echoes instead of coach copy */
const METRIC_LABELS = new Set([
  'sleep',
  'habits',
  'ideas',
  'projects',
  'blocks',
  'overrides',
  'energy',
  'decisions',
  'expenses',
  'postmortems',
  'postmortem',
  'ledgercontacts',
  'ledgerentries',
]);

const GENERIC_SUGGESTION =
  /^focus on addressing the identified areas for improvement\.?$/i;

/** Coach copy when AI returns only metric keys and no workspace context is passed */
const DEFAULT_COACH_WINS = [
  'You showed up and logged activity in your workspace this week.',
  'Keep stacking small wins on habits and focus blocks.',
];
const DEFAULT_COACH_FIXES = [
  'Log sleep nightly for sharper Bio-Sync recovery insights.',
  'Protect one focus block tomorrow for deep work.',
];
const DEFAULT_COACH_SUGGESTION = 'Pick one priority and block time for it tomorrow.';

const GRADES: SleepGrade[] = ['A', 'B', 'C', 'D'];

function normalizeKey(label: string): string {
  return label.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

export function isMetricLabel(text: string): boolean {
  const norm = normalizeKey(text);
  if (!norm) return true;
  return METRIC_LABELS.has(norm);
}

export function ensureStringArray(value: unknown): string[] {
  if (typeof value === 'string') {
    const t = value.trim();
    return t ? [t] : [];
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (typeof item === 'number' && Number.isFinite(item)) return String(item);
        return '';
      })
      .filter((s) => s.length > 0);
  }
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>)
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((s) => s.length > 0);
  }
  return [];
}

export function filterCoachStrings(items: string[]): string[] {
  return items.filter((s) => !isMetricLabel(s));
}

function clampScore(n: unknown, fallback: number): number {
  const num = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(100, Math.max(0, Math.round(num)));
}

function normalizeGrade(value: unknown): SleepGrade {
  const g = typeof value === 'string' ? value.trim().toUpperCase() : '';
  return GRADES.includes(g as SleepGrade) ? (g as SleepGrade) : 'B';
}

function normalizeDirective(
  raw: unknown,
  suggestion: string,
): WeeklyReviewResponse['directive'] | undefined {
  if (raw && typeof raw === 'object' && 'title' in raw) {
    const d = raw as { title?: unknown; subtitle?: unknown };
    const title = typeof d.title === 'string' ? d.title.trim() : '';
    if (title && !GENERIC_SUGGESTION.test(title)) {
      return {
        title,
        subtitle:
          typeof d.subtitle === 'string' && d.subtitle.trim()
            ? d.subtitle.trim()
            : 'Next focus',
      };
    }
  }
  if (suggestion && !GENERIC_SUGGESTION.test(suggestion)) {
    return { title: suggestion, subtitle: 'Next focus' };
  }
  return undefined;
}

export function normalizeWeeklyReviewResponse(
  parsed: unknown,
  ctx?: LocalInsightContext,
): WeeklyReviewResponse {
  const fallback = ctx ? buildWeeklyReviewFallbackFields(ctx) : null;
  const src =
    parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};

  let wins = filterCoachStrings(ensureStringArray(src.wins));
  let fixes = filterCoachStrings(ensureStringArray(src.fixes));
  let insights = filterCoachStrings(ensureStringArray(src.insights));

  if (wins.length === 0) wins = fallback ? [...fallback.wins] : [...DEFAULT_COACH_WINS];
  if (fixes.length === 0) fixes = fallback ? [...fallback.fixes] : [...DEFAULT_COACH_FIXES];
  if (insights.length === 0 && fallback?.insights?.length) {
    insights = [...fallback.insights];
  }

  const rawSummary = typeof src.summary === 'string' ? src.summary.trim() : '';
  const summary = rawSummary || fallback?.summary || 'Add more data for a sharper weekly review.';

  let suggestion =
    typeof src.suggestion === 'string' ? src.suggestion.trim() : fallback?.suggestion ?? '';
  if (GENERIC_SUGGESTION.test(suggestion)) {
    suggestion = fallback?.suggestion ?? DEFAULT_COACH_SUGGESTION;
  }

  const directive = normalizeDirective(src.directive, suggestion) ??
    fallback?.directive ?? {
      title: suggestion || 'Next week',
      subtitle: 'Review your priorities',
    };

  return {
    summary,
    wins,
    fixes,
    insights,
    suggestion,
    directive,
    sleepGrade: normalizeGrade(src.sleepGrade),
    focusScore: clampScore(src.focusScore, 72),
    momentumScore: clampScore(src.momentumScore, 60),
  };
}

/** Sanitize persisted reviews (older bad AI parses) for display */
export function sanitizeStoredWeeklyReview<T extends WeeklyReviewResponse>(review: T): T {
  const normalized = normalizeWeeklyReviewResponse(review);
  return { ...review, ...normalized };
}
