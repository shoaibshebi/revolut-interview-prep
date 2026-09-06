import { useCallback, useEffect, useRef, useState } from 'react';
import { type AsyncState, idle, loading, success, failure } from '../shared/asyncState';
import { getErrorMessage } from '../shared/mockApi';
import { fetchTransactions } from './api';
import type { Transaction } from './types';

/**
 * Custom hook wrapping fetch + loading/error state + cancellation + retry.
 *
 * Generic-free here (the hook is specific to Transaction[]), but the *shape*
 * generalises — see task4-complex-ux/useAsyncData.ts for the generic version.
 */
export function useTransactions(failureRate = 0) {
  const [state, setState] = useState<AsyncState<Transaction[]>>(idle());

  // AbortController stored in a ref (not state) because updating it must never
  // trigger a re-render — it's an imperative escape hatch, not UI state.
  const abortControllerRef = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    // Cancel any in-flight request before starting a new one — prevents a slow
    // earlier response from overwriting a newer one ("race condition" guard).
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState(loading());

    fetchTransactions({ signal: controller.signal, failureRate })
      .then((data) => setState(success(data)))
      .catch((error: unknown) => {
        // AbortError means *we* cancelled it deliberately — not a real failure,
        // so it must not overwrite state with an error message.
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState(failure(getErrorMessage(error)));
      });
  }, [failureRate]);

  useEffect(() => {
    load();
    // Cleanup: abort the request if the component unmounts mid-flight.
    return () => abortControllerRef.current?.abort();
  }, [load]);

  return { state, retry: load };
}
