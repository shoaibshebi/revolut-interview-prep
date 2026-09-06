import { useCallback, useRef, useState } from 'react';
import { type AsyncState, idle, loading, success, failure } from '../shared/asyncState';
import { getErrorMessage } from '../shared/mockApi';

/**
 * Generic, on-demand async runner: `<T>` is decided by whoever calls `run`,
 * so this one hook works for cards, search results, or anything else — unlike
 * task1's `useTransactions`, which is hardcoded to `Transaction[]` because it
 * always fetches on mount. This version only fetches when told to.
 */
export function useAsyncData<T>() {
  const [state, setState] = useState<AsyncState<T>>(idle());
  const abortControllerRef = useRef<AbortController | null>(null);

  // `fetcher` takes the AbortSignal so cancellation is wired in automatically —
  // callers never have to think about AbortController themselves.
  const run = useCallback((fetcher: (signal: AbortSignal) => Promise<T>) => {
    // Prevent redundant actions: a request already in flight is cancelled
    // before starting the new one, so two rapid calls to `run` can never race
    // and leave the UI showing a stale result.
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState(loading());

    fetcher(controller.signal)
      .then((data) => setState(success(data)))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState(failure(getErrorMessage(error)));
      });
  }, []);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setState(idle());
  }, []);

  return { state, run, reset, isLoading: state.status === 'loading' };
}
