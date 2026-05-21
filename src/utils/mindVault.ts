import { subDays, parseISO, isBefore } from 'date-fns';
import type { MindContentType, MindItem } from '../types';

export type MindTypeFilter = 'all' | 'note' | 'url' | 'image' | 'quote';

const URL_TYPES: MindContentType[] = [
  'url',
  'article',
  'product',
  'recipe',
  'book',
  'video',
  'other',
];

export function getMindTypeBadgeLabel(type: MindContentType): string {
  switch (type) {
    case 'article':
      return 'Article';
    case 'product':
      return 'Product';
    case 'recipe':
      return 'Recipe';
    case 'book':
      return 'Book';
    case 'video':
      return 'Video';
    case 'quote':
      return 'Quote';
    case 'image':
      return 'Image';
    case 'url':
      return 'URL';
    case 'note':
      return 'Note';
    default:
      return 'Other';
  }
}

export function matchesMindType(item: MindItem, filter: MindTypeFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'note') return item.type === 'note';
  if (filter === 'image') return item.type === 'image';
  if (filter === 'quote') return item.type === 'quote';
  if (filter === 'url') return URL_TYPES.includes(item.type);
  return true;
}

export function matchesMindSearch(item: MindItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    item.title,
    item.summary ?? '',
    item.rawContent,
    item.url ?? '',
    item.autoTags.join(' '),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

export function getActiveMindItems(items: MindItem[]): MindItem[] {
  return items.filter((i) => !i.isArchived);
}

export function getPinnedMindItems(items: MindItem[]): MindItem[] {
  return getActiveMindItems(items)
    .filter((i) => i.isPinned)
    .slice(0, 5);
}

export function pickSerendipityItem(items: MindItem[]): MindItem | null {
  const cutoff = subDays(new Date(), 30);
  const pool = getActiveMindItems(items).filter((i) =>
    isBefore(parseISO(i.createdAt), cutoff),
  );
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export const MAX_PINNED = 5;
