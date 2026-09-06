import { simulateRequest, simulateRequestSimple, ApiError, isApiError, isError, getErrorMessage } from './mockApi';

describe('simulateRequest', () => {
  it('resolves with the given data after the delay', async () => {
    const result = await simulateRequest({ id: 1 }, { delayMs: 10 });
    expect(result).toEqual({ id: 1 });
  });

  it('rejects with ApiError when failureRate forces a failure', async () => {
    await expect(simulateRequest('data', { delayMs: 10, failureRate: 1 })).rejects.toBeInstanceOf(ApiError);
  });

  it('rejects immediately with AbortError when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(simulateRequest('data', { signal: controller.signal })).rejects.toMatchObject({
      name: 'AbortError',
    });
  });

  it('rejects with AbortError if aborted while the request is still pending', async () => {
    const controller = new AbortController();
    const promise = simulateRequest('data', { delayMs: 1000, signal: controller.signal });

    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });
});

describe('simulateRequestSimple', () => {
  it('resolves with the given data after the default delay', async () => {
    const result = await simulateRequestSimple({ id: 1 }, 10);
    expect(result).toEqual({ id: 1 });
  });

  it('has no way to fail or be cancelled — always resolves (that is the point of the simple version)', async () => {
    await expect(simulateRequestSimple('always works', 5)).resolves.toBe('always works');
  });
});

describe('type guards', () => {
  it('isApiError distinguishes ApiError from a plain Error', () => {
    expect(isApiError(new ApiError('failed', 500))).toBe(true);
    expect(isApiError(new Error('failed'))).toBe(false);
    expect(isApiError('failed')).toBe(false);
  });

  it('isError distinguishes any Error from a non-Error thrown value', () => {
    expect(isError(new Error('x'))).toBe(true);
    expect(isError('just a string')).toBe(false);
    expect(isError(undefined)).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('extracts the message from an ApiError', () => {
    expect(getErrorMessage(new ApiError('rate limited', 429))).toBe('rate limited');
  });

  it('extracts the message from a plain Error', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('falls back to a generic message for a non-Error catch value (edge case)', () => {
    expect(getErrorMessage('some string was thrown')).toBe('Something went wrong. Please try again.');
    expect(getErrorMessage(undefined)).toBe('Something went wrong. Please try again.');
  });
});
