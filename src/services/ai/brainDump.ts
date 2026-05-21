import type { BrainDumpClassification } from './types';
import { chatCompletion, hasAIConfigured } from './client';
import { parseAIJson } from '../../utils/parseAIJson';
import { buildLocalBrainDumpClassify } from '../../utils/localInsights';

const SYSTEM = `You classify brain dump lines. Return JSON only: { "items": [{ "text": string, "type": "idea"|"task"|"reminder"|"random" }] }. One entry per non-empty line.`;

export interface ClassifyBrainDumpResult {
  items: BrainDumpClassification[];
  fromStub: boolean;
  error?: string;
}

export const classifyBrainDump = async (text: string): Promise<ClassifyBrainDumpResult> => {
  if (!hasAIConfigured()) {
    return { items: buildLocalBrainDumpClassify(text), fromStub: true };
  }
  try {
    const raw = await chatCompletion(SYSTEM, text);
    const parsed = parseAIJson(raw) as { items?: BrainDumpClassification[] };
    const items = parsed.items ?? parsed;
    if (Array.isArray(items)) {
      return { items, fromStub: false };
    }
    return {
      items: buildLocalBrainDumpClassify(text),
      fromStub: true,
      error: 'Invalid AI response',
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'AI request failed';
    return { items: buildLocalBrainDumpClassify(text), fromStub: true, error: message };
  }
};
