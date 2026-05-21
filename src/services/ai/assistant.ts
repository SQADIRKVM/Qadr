import type { AssistantReply } from './types';
import { chatCompletion, hasAIConfigured } from './client';
import { parseAIJson } from '../../utils/parseAIJson';
import {
  buildLocalAssistantReply,
  type LocalInsightContext,
} from '../../utils/localInsights';

const SYSTEM = `You are Qadr, a personal productivity assistant. Return JSON only with keys:
- message (string): direct, insightful reply to the user
- suggestion (optional object): { title: string, bullets: [{ text: string, icon: "timer"|"notifications_paused"|"block", tone?: "default"|"danger" }] }
- followUp (optional string): short closing question

Be concise. Tie advice to the user's context when provided.`;

function parseAssistantContext(contextPayload: string): LocalInsightContext {
  try {
    const snap = JSON.parse(contextPayload) as Record<string, unknown>;
    return {
      habitsPercent:
        typeof snap.habitCompletionPct === 'number' ? snap.habitCompletionPct : undefined,
      sleepScore:
        typeof snap.sleepScore === 'number'
          ? snap.sleepScore
          : snap.sleepScore === null
            ? null
            : undefined,
      activeProjectName:
        typeof snap.activeProjectName === 'string' ? snap.activeProjectName : null,
      focusMinutesToday:
        typeof snap.focusMinutesToday === 'number' ? snap.focusMinutesToday : undefined,
      oneThing: typeof snap.oneThing === 'string' ? snap.oneThing : undefined,
      oneThingDone: typeof snap.oneThingDone === 'boolean' ? snap.oneThingDone : undefined,
      mood: typeof snap.mood === 'string' ? snap.mood : snap.mood === null ? null : undefined,
      userName: typeof snap.userName === 'string' ? snap.userName : undefined,
      openTaskCount:
        typeof snap.openTaskCount === 'number' ? snap.openTaskCount : undefined,
    };
  } catch {
    return {};
  }
}

export interface AskAssistantResult {
  reply: AssistantReply;
  fromStub: boolean;
  error?: string;
}

export const askAssistant = async (
  userMessage: string,
  contextPayload: string,
): Promise<AskAssistantResult> => {
  const ctx = parseAssistantContext(contextPayload);

  if (!hasAIConfigured()) {
    return { reply: buildLocalAssistantReply(userMessage, ctx), fromStub: true };
  }

  try {
    const raw = await chatCompletion(
      SYSTEM,
      `Context: ${contextPayload}\n\nUser: ${userMessage}`,
    );
    const parsed = parseAIJson(raw) as AssistantReply;
    if (!parsed.message) {
      return {
        reply: buildLocalAssistantReply(userMessage, ctx),
        fromStub: true,
        error: 'Invalid AI response',
      };
    }
    return { reply: parsed, fromStub: false };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'AI request failed';
    return { reply: buildLocalAssistantReply(userMessage, ctx), fromStub: true, error: message };
  }
};
