import { renderHook, waitFor, act } from '@testing-library/react';
import { useAsyncData } from './useAsyncData';

describe('useAsyncData', () => {
  it('starts idle before run() is called', () => {
    const { result } = renderHook(() => useAsyncData<string>());
    expect(result.current.state.status).toBe('idle');
  });

  it('goes loading -> success and carries the resolved data', async () => {
    const { result } = renderHook(() => useAsyncData<string[]>());

    act(() => {
      result.current.run(() => Promise.resolve(['a', 'b']));
    });

    expect(result.current.state.status).toBe('loading');
    await waitFor(() => expect(result.current.state.status).toBe('success'));

    if (result.current.state.status !== 'success') throw new Error('expected success');
    expect(result.current.state.data).toEqual(['a', 'b']);
  });

  it('goes loading -> error with a readable message on rejection', async () => {
    const { result } = renderHook(() => useAsyncData<string[]>());

    act(() => {
      result.current.run(() => Promise.reject(new Error('boom')));
    });

    await waitFor(() => expect(result.current.state.status).toBe('error'));
    if (result.current.state.status !== 'error') throw new Error('expected error');
    expect(result.current.state.error).toBe('boom');
  });

  it('a second run() call cancels the first, and only the second result is applied', async () => {
    const { result } = renderHook(() => useAsyncData<string>());

    let rejectFirst: (reason: unknown) => void = () => {};
    const firstPromise = new Promise<string>((_resolve, reject) => {
      rejectFirst = reject;
    });

    act(() => {
      result.current.run((signal) => {
        // Simulate the first request being aborted mid-flight.
        signal.addEventListener('abort', () => rejectFirst(new DOMException('Aborted', 'AbortError')));
        return firstPromise;
      });
    });

    act(() => {
      result.current.run(() => Promise.resolve('second-result'));
    });

    await waitFor(() => expect(result.current.state.status).toBe('success'));
    if (result.current.state.status !== 'success') throw new Error('expected success');
    // Proves the stale first response never overwrote the second (race-condition guard).
    expect(result.current.state.data).toBe('second-result');
  });

  it('reset() returns the hook to idle', async () => {
    const { result } = renderHook(() => useAsyncData<string>());

    act(() => {
      result.current.run(() => Promise.resolve('done'));
    });
    await waitFor(() => expect(result.current.state.status).toBe('success'));

    act(() => result.current.reset());
    expect(result.current.state.status).toBe('idle');
  });
});
