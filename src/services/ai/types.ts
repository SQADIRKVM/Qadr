import type { BrainDumpType, SleepGrade } from '../../types';

export type { BrainDumpType };

export interface BrainDumpClassification {
  text: string;
  type: BrainDumpType;
}

export interface WeeklyReviewDirective {
  title: string;
  subtitle: string;
}

export interface WeeklyReviewResponse {
  summary: string;
  wins: string[];
  fixes: string[];
  suggestion: string;
  insights?: string[];
  directive?: WeeklyReviewDirective;
  sleepGrade: SleepGrade;
  focusScore: number;
  momentumScore: number;
}

export type AIProvider = 'groq' | 'ollama';

export interface AssistantBullet {
  text: string;
  icon: 'timer' | 'notifications_paused' | 'block';
  tone?: 'default' | 'danger';
}

export interface AssistantReply {
  message: string;
  suggestion?: {
    title: string;
    bullets: AssistantBullet[];
  };
  followUp?: string;
}
