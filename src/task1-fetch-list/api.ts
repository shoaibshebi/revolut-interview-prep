import { simulateRequest } from '../shared/mockApi';
import type { Transaction } from './types';

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', amount: 250, type: 'credit', status: 'completed', date: '2026-09-01', description: 'Salary' },
  { id: 't2', amount: 42.5, type: 'debit', status: 'completed', date: '2026-09-02', description: 'Groceries' },
  { id: 't3', amount: 1200, type: 'transfer', status: 'pending', date: '2026-09-03', description: 'Rent transfer' },
  { id: 't4', amount: 15.99, type: 'debit', status: 'failed', date: '2026-09-04', description: 'Subscription' },
];

interface FetchTransactionsOptions {
  signal?: AbortSignal;
  /** Injectable so tests can force the error path deterministically. */
  failureRate?: number;
}

// Return type is written explicitly (`Promise<Transaction[]>`) rather than left to
// inference. On an exported function this is good practice: it documents the
// contract and stops an accidental change to the body from silently changing the
// public return type.
export function fetchTransactions({
  signal,
  failureRate = 0,
}: FetchTransactionsOptions = {}): Promise<Transaction[]> {
  return simulateRequest(MOCK_TRANSACTIONS, { delayMs: 400, failureRate, signal });
}
