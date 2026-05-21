import { parseISO, isAfter } from 'date-fns';
import type { Idea, IdeaCategory } from '../types';

export type VaultCategoryFilter = 'all' | 'business' | 'content' | 'personal';

const PERSONAL_CATEGORIES: IdeaCategory[] = ['app', 'agency', 'crypto', 'other'];

export const VAULT_CATEGORY_PILLS: { value: VaultCategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'business', label: 'Business' },
  { value: 'content', label: 'Content' },
  { value: 'personal', label: 'Personal' },
];

export function getCategoryDisplayLabel(category: IdeaCategory): string {
  switch (category) {
    case 'business':
      return 'Business';
    case 'content':
      return 'Content';
    case 'app':
      return 'App';
    case 'agency':
      return 'Agency';
    case 'crypto':
      return 'Crypto';
    default:
      return 'Personal';
  }
}

export function matchesVaultCategory(idea: Idea, filter: VaultCategoryFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'personal') return PERSONAL_CATEGORIES.includes(idea.category);
  return idea.category === filter;
}

export function isIdeaLocked(idea: Idea): boolean {
  if (idea.status === 'locked') return true;
  if (idea.lockedUntil) {
    return isAfter(parseISO(idea.lockedUntil), new Date());
  }
  return false;
}

export function matchesVaultSearch(idea: Idea, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const desc = idea.description?.toLowerCase() ?? '';
  return idea.title.toLowerCase().includes(q) || desc.includes(q);
}

export function hasSundayReviewIdeas(ideas: Idea[]): boolean {
  return ideas.some(
    (i) => i.status !== 'archived' && (i.sundayReview || i.status === 'sunday'),
  );
}
