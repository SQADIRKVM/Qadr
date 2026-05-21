import { format } from 'date-fns';
import type {
  WeeklyReviewResponse,
  BrainDumpClassification,
  AssistantReply,
} from '../services/ai/types';

export type LocalInsightContext = {
  userName?: string;
  oneThing?: string;
  oneThingDone?: boolean;
  mood?: string | null;
  habitsPercent?: number;
  sleepScore?: number | null;
  focusMinutesToday?: number;
  activeProjectName?: string | null;
  openTaskCount?: number;
};

export function buildLocalBrainDumpClassify(text: string): BrainDumpClassification[] {
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 8);
  if (lines.length === 0) {
    return [{ type: 'random', text: text.slice(0, 80) || 'Note' }];
  }
  return lines.map((line) => {
    const lower = line.toLowerCase();
    let type: BrainDumpClassification['type'] = 'idea';
    if (lower.includes('remind') || lower.includes('tomorrow') || lower.includes('call')) {
      type = 'reminder';
    } else if (lower.includes('task') || lower.includes('fix') || lower.includes('ship')) {
      type = 'task';
    } else if (line.length < 12) {
      type = 'random';
    }
    return { type, text: line.slice(0, 120) };
  });
}

export function buildLocalAssistantReply(
  userMessage: string,
  ctx: LocalInsightContext,
): AssistantReply {
  const name = ctx.userName?.trim() || 'there';
  const parts: string[] = [];
  if (ctx.oneThing?.trim()) {
    parts.push(
      ctx.oneThingDone
        ? `You already marked "${ctx.oneThing}" done today.`
        : `Your one thing today is "${ctx.oneThing}".`,
    );
  }
  if (ctx.habitsPercent != null) {
    parts.push(`Habits are at ${ctx.habitsPercent}% for today.`);
  }
  if (ctx.sleepScore != null) {
    parts.push(`Latest sleep score is ${ctx.sleepScore}.`);
  }
  if (ctx.focusMinutesToday != null && ctx.focusMinutesToday > 0) {
    parts.push(`You have ${ctx.focusMinutesToday} minutes of focus logged today.`);
  }
  if (ctx.activeProjectName) {
    parts.push(
      `Active project: ${ctx.activeProjectName}${ctx.openTaskCount ? ` (${ctx.openTaskCount} open tasks)` : ''}.`,
    );
  }
  const summary =
    parts.length > 0
      ? parts.join(' ')
      : 'Log sleep, habits, and a one thing to unlock richer local guidance.';
  return {
    message: `${name}, here's what your data shows: ${summary} You asked: "${userMessage.slice(0, 200)}". Add EXPO_PUBLIC_GROQ_API_KEY in .env for full AI coaching.`,
    suggestion: {
      title: 'From your workspace',
      bullets: [
        { text: 'Start a 25-minute focus block', icon: 'timer' },
        { text: 'Log sleep in Habits if you have not today', icon: 'notifications_paused' },
      ],
    },
    followUp: 'What would you like to tackle next?',
  };
}

export function buildLocalWeeklyReview(ctx: LocalInsightContext): WeeklyReviewResponse {
  const focus = ctx.focusMinutesToday ?? 0;
  const habits = ctx.habitsPercent ?? 0;
  const sleep = ctx.sleepScore;
  const priority = ctx.oneThing?.trim() || ctx.activeProjectName || 'your top priority';

  return {
    summary: `Week snapshot for ${format(new Date(), 'MMM d')}: habits at ${habits}% today, ${focus} focus minutes logged. ${
      sleep != null ? `Sleep score ${sleep}.` : 'Add sleep logs for recovery insights.'
    }`,
    wins: [
      ctx.oneThingDone && ctx.oneThing
        ? `You completed your one thing: ${ctx.oneThing}.`
        : `You set a clear priority: ${priority}.`,
      habits >= 50 ? `Habit completion is at ${habits}% today.` : 'You have habit data to build consistency.',
    ],
    fixes: [
      sleep != null && sleep < 70
        ? 'Sleep score suggests protecting an earlier wind-down.'
        : 'Log sleep nightly for sharper Bio-Sync insights.',
      focus < 60 ? 'Schedule one protected focus block tomorrow.' : 'Keep stacking focus sessions.',
    ],
    suggestion: priority,
    insights: [
      `Mood today: ${ctx.mood ?? 'not logged'}.`,
      ctx.activeProjectName
        ? `Project focus: ${ctx.activeProjectName}.`
        : 'Create or activate a project for task flow.',
    ],
    directive: {
      title: 'Next focus block',
      subtitle: `Protect time for ${priority}`,
    },
    sleepGrade: sleep == null ? 'C' : sleep >= 85 ? 'A' : sleep >= 70 ? 'B' : 'C',
    focusScore: Math.min(100, Math.round(focus * 2)),
    momentumScore: Math.min(100, Math.round((habits + (sleep ?? 50)) / 2)),
  };
}

export function buildWeeklyReviewFallbackFields(ctx: LocalInsightContext) {
  const local = buildLocalWeeklyReview(ctx);
  return {
    wins: local.wins,
    fixes: local.fixes,
    insights: local.insights,
    summary: local.summary,
    suggestion: local.suggestion,
    directive: local.directive,
  };
}
