import { simulateRequest } from '../shared/mockApi';
import type { Card } from './types';

const ALL_CARDS: Card[] = [
  { id: 'c1', label: 'Everyday spending', last4: '4242', frozen: false },
  { id: 'c2', label: 'Travel card', last4: '1881', frozen: false },
  { id: 'c3', label: 'Savings vault', last4: '0099', frozen: true },
];

export function searchCards(
  query: string,
  options: { signal?: AbortSignal; failureRate?: number } = {},
): Promise<Card[]> {
  const matches = ALL_CARDS.filter((card) => card.label.toLowerCase().includes(query.trim().toLowerCase()));
  return simulateRequest(matches, { delayMs: 350, failureRate: options.failureRate ?? 0, signal: options.signal });
}
