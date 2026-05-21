import type { WeeklyReviewResponse } from './types';
import { chatCompletion, hasAIConfigured } from './client';
import { normalizeWeeklyReviewResponse } from '../../utils/normalizeWeeklyReview';
import { parseAIJson } from '../../utils/parseAIJson';
import {
  buildLocalWeeklyReview,
  type LocalInsightContext,
} from '../../utils/localInsights';

const SYSTEM = `You are a founder coach. Return JSON only with keys: summary (string, warm paragraph), wins (string[] of full-sentence highlights — never metric or field names), fixes (string[] of full-sentence improvements), suggestion (string, one concrete next-week priority), insights (string[], optional extra coach bullets as sentences), directive ({ title: string, subtitle: string } for next week focus), sleepGrade ("A"|"B"|"C"|"D"), focusScore (0-100 number), momentumScore (0-100 number). Do not list data field names like projects or blocks. Be direct, encouraging, no fluff.`;

function parseInsightContext(payload: string): LocalInsightContext {
  try {
    const data = JSON.parse(payload) as Record<string, unknown>;
    const dashboard = data.dashboard as { oneThing?: string; oneThingDone?: boolean } | undefined;
    const projects = data.projects as { active?: { name?: string; openTasks?: number } } | undefined;
    const habits = data.habits as { percent?: number } | undefined;
    const sleep = data.sleep as { latestScore?: number } | undefined;
    const blocks = data.blocks as { focusMinutesToday?: number } | undefined;
    return {
      oneThing: dashboard?.oneThing,
      oneThingDone: dashboard?.oneThingDone,
      activeProjectName: projects?.active?.name ?? null,
      openTaskCount: projects?.active?.openTasks,
      habitsPercent: habits?.percent,
      sleepScore: sleep?.latestScore ?? null,
      focusMinutesToday: blocks?.focusMinutesToday,
    };
  } catch {
    return {};
  }
}

export interface GenerateWeeklyReviewResult {
  review: WeeklyReviewResponse;
  fromStub: boolean;
  error?: string;
}

export const generateWeeklyReview = async (
  dataPayload: string,
): Promise<GenerateWeeklyReviewResult> => {
  const ctx = parseInsightContext(dataPayload);
  if (!hasAIConfigured()) {
    return { review: buildLocalWeeklyReview(ctx), fromStub: true };
  }
  try {
    const raw = await chatCompletion(SYSTEM, dataPayload);
    return {
      review: normalizeWeeklyReviewResponse(parseAIJson(raw), ctx),
      fromStub: false,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'AI request failed';
    return { review: buildLocalWeeklyReview(ctx), fromStub: true, error: message };
  }
};

export const generatePostMortemPattern = async (
  mortems: string,
): Promise<{ pattern: string; fromStub: boolean; error?: string }> => {
  if (!hasAIConfigured()) {
    return {
      pattern: 'Momentum drops when scope expands without killing old tasks first.',
      fromStub: true,
    };
  }
  try {
    const raw = await chatCompletion(
      'Return JSON: { "pattern": string } — one recurring pattern from post-mortems.',
      mortems,
    );
    const parsed = parseAIJson(raw) as { pattern?: string };
    return {
      pattern: parsed.pattern ?? 'Review your post-mortems for recurring blockers.',
      fromStub: false,
    };
  } catch (e) {
    return {
      pattern: 'Review your post-mortems for recurring blockers.',
      fromStub: true,
      error: e instanceof Error ? e.message : 'AI request failed',
    };
  }
};
