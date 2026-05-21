export type LifestyleMode = 'founder' | 'student';
export type MoodLevel = 'dead' | 'low' | 'neutral' | 'good' | 'charged';
export type BlockMode = 'off' | 'work' | 'exam' | 'night';
export type IdeaCategory = 'app' | 'business' | 'content' | 'agency' | 'crypto' | 'other';
export type IdeaStatus = 'active' | 'locked' | 'sunday' | 'in_progress' | 'archived';
export type BrainDumpType = 'idea' | 'task' | 'reminder' | 'random';
export type HabitFrequency = 'daily' | 'weekly' | 'monthly';
export type SkipReason = 'tired' | 'sick' | 'forgot' | 'busy' | 'other';
export type ProjectStatus = 'active' | 'paused' | 'completed' | 'killed' | 'queued';
export type DecisionStatus = 'pending' | 'decided' | 'revisited';
export type SleepGrade = 'A' | 'B' | 'C' | 'D';
export type ContactType = 'customer' | 'supplier';
export type LedgerEntryType = 'gave' | 'got';

export type MindContentType =
  | 'note'
  | 'url'
  | 'image'
  | 'quote'
  | 'article'
  | 'product'
  | 'recipe'
  | 'book'
  | 'video'
  | 'other';

export type MindPlatform =
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'twitter'
  | 'linkedin'
  | 'vimeo'
  | 'reddit'
  | 'telegram'
  | 'generic';

/** How the capture should be presented and enriched (dynamic, not filter pills). */
export type MindContentKind = 'reel' | 'video' | 'article' | 'social' | 'link';

export interface MindItem {
  id: string;
  type: MindContentType;
  rawContent: string;
  url?: string;
  imageUri?: string;
  previewImageUrl?: string;
  /** Carousel slides; first entry mirrors previewImageUrl when set. */
  previewImages?: string[];
  /** Instagram oEmbed blockquote HTML for native carousel WebView. */
  embedHtml?: string;
  previewTitle?: string;
  previewDescription?: string;
  contentExcerpt?: string;
  /** Visible text from vision analysis (search + enrich input). */
  imageText?: string;
  transcript?: string;
  contentKind?: MindContentKind;
  watchedAt?: string | null;
  platform?: MindPlatform;
  isReel?: boolean;
  userNotes?: string;
  title: string;
  summary?: string;
  autoTags: string[];
  dominantColor?: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  enrichPending?: boolean;
  aiEnriched?: boolean;
  /** Last content-extract failure message (cleared on success). */
  extractError?: string;
  /** Mind Space collection id */
  spaceId?: string | null;
}

export interface MindSpace {
  id: string;
  name: string;
  createdAt: string;
}

export interface Idea {
  id: string;
  title: string;
  description?: string;
  category: IdeaCategory;
  priority: 'high' | 'low';
  status: IdeaStatus;
  lockedUntil?: string;
  sundayReview: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  frequency: HabitFrequency;
  reminderTime?: string;
  startDate: string;
  createdAt: string;
}

export interface HabitCompletion {
  habitId: string;
  date: string;
  skipped?: boolean;
  skipReason?: SkipReason;
}

export interface SleepLog {
  id: string;
  date: string;
  sleptAt: string;
  wokeAt: string;
  quality: number;
  lateReasons: string[];
  nightDistraction: boolean;
  score: number;
}

export interface ProjectTask {
  id: string;
  title: string;
  done: boolean;
  lastTouched: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  status: ProjectStatus;
  targetDays: number;
  startDate: string;
  tasks: ProjectTask[];
  quickNote: string;
  createdAt: string;
  completedAt?: string;
}

export interface PostMortem {
  id: string;
  projectId: string;
  projectName: string;
  worked: string;
  killedMomentum: string;
  differently: string;
  createdAt: string;
}

export interface MoneyContact {
  id: string;
  name: string;
  type: ContactType;
  phone?: string;
  deviceContactId?: string;
  /** yyyy-MM-dd target collection date */
  collectionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddMoneyContactInput {
  name: string;
  type: ContactType;
  phone?: string;
  deviceContactId?: string;
}

export interface LedgerEntry {
  id: string;
  contactId: string;
  type: LedgerEntryType;
  amount: number;
  note?: string;
  createdAt: string;
}

export type MoneyMode = 'ledger' | 'subscriptions' | 'expenses' | 'income';

export type BillingCycle = 'weekly' | 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  cycle: BillingCycle;
  nextDueDate: string;
  active: boolean;
  note?: string;
  createdAt: string;
}

export interface AddSubscriptionInput {
  name: string;
  amount: number;
  cycle: BillingCycle;
  nextDueDate: string;
  note?: string;
}

export interface Expense {
  id: string;
  amount: number;
  category?: string;
  note?: string;
  date: string;
  createdAt: string;
}

export interface AddExpenseInput {
  amount: number;
  category?: string;
  note?: string;
  date?: string;
}

export interface Income {
  id: string;
  amount: number;
  source?: string;
  note?: string;
  date: string;
  createdAt: string;
}

export interface AddIncomeInput {
  amount: number;
  source?: string;
  note?: string;
  date?: string;
}

export interface BlockSession {
  id: string;
  mode: BlockMode;
  startedAt: string;
  endedAt?: string;
  breaks: { startedAt: string; endedAt?: string }[];
  /** Total paused ms during session (excluded from logged duration). */
  pausedMs?: number;
}

export interface BlockOverride {
  id: string;
  mode: BlockMode;
  reason: string;
  durationMinutes: number;
  timestamp: string;
}

export interface Decision {
  id: string;
  title: string;
  reasoning: string;
  deadline: string;
  confidence: number;
  status: DecisionStatus;
  outcome?: string;
  wasRight?: 'yes' | 'no' | 'unsure';
  createdAt: string;
  revisitedAt?: string;
}

export interface WeeklyReviewDirective {
  title: string;
  subtitle: string;
}

export interface WeeklyReview {
  id: string;
  weekNumber: number;
  year: number;
  summary: string;
  wins: string[];
  fixes: string[];
  suggestion: string;
  insights?: string[];
  directive?: WeeklyReviewDirective;
  sleepGrade: SleepGrade;
  focusScore: number;
  momentumScore: number;
  createdAt: string;
}

export interface BrainDumpItem {
  text: string;
  type: BrainDumpType;
}

export interface NudgeLog {
  id: string;
  response: 'going_now' | 'thirty_more';
  timestamp: string;
}
