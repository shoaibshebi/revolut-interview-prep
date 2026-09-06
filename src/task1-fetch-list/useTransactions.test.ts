import { renderHook, waitFor, act } from '@testing-library/react';
import { useTransactions } from './useTransactions';
import * as api from './api';
import type { Transaction } from './types';

// Factory method (Arrange helper) — every test builds its data through this,
// only overriding the fields it cares about. Keeps tests short and resilient
// to unrelated fields being added to Transaction later.
const buildTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: '1',
  amount: 100,
  type: 'credit',
  status: 'completed',
  date: '2026-01-01',
  description: 'Test transaction',
  ...overrides,
});

// Mocking the api module (not global fetch) keeps the test decoupled from how
// the request is made internally — only the public contract of api.ts is mocked.
jest.mock('./api');
const mockedFetchTransactions = jest.mocked(api.fetchTransactions);

describe('useTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts in loading state, then resolves to success with fetched data', async () => {
    // Arrange
    const transactions = [buildTransaction({ id: 't1' }), buildTransaction({ id: 't2' })];
    mockedFetchTransactions.mockResolvedValueOnce(transactions);

    // Act
    const { result } = renderHook(() => useTransactions());

    // Assert: loading is shown first
    expect(result.current.state.status).toBe('loading');

    await waitFor(() => expect(result.current.state.status).toBe('success'));

    if (result.current.state.status !== 'success') throw new Error('expected success');
    expect(result.current.state.data).toEqual(transactions);
  });

  it('moves to error state with a readable message when the request fails', async () => {
    mockedFetchTransactions.mockRejectedValueOnce(new Error('Network down'));

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => expect(result.current.state.status).toBe('error'));

    if (result.current.state.status !== 'error') throw new Error('expected error');
    expect(result.current.state.error).toBe('Network down');
  });


  
  it('retry() re-fetches and can recover from a previous error', async () => {
    mockedFetchTransactions.mockRejectedValueOnce(new Error('Network down'));
    const transactions = [buildTransaction()];
    mockedFetchTransactions.mockResolvedValueOnce(transactions);

    const { result } = renderHook(() => useTransactions());
    await waitFor(() => expect(result.current.state.status).toBe('error'));

    act(() => {
      result.current.retry();
    });

    await waitFor(() => expect(result.current.state.status).toBe('success'));
    expect(mockedFetchTransactions).toHaveBeenCalledTimes(2);
  });

  it('returns an empty list without error when the API returns no transactions', async () => {
    mockedFetchTransactions.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => expect(result.current.state.status).toBe('success'));
    if (result.current.state.status !== 'success') throw new Error('expected success');
    expect(result.current.state.data).toHaveLength(0);
  });
});
