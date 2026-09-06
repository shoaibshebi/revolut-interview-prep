/**
 * A fake network layer used by every task in this project.
 * No real backend is needed — `simulateRequest` resolves/rejects like `fetch` would,
 * including honouring `AbortSignal`, so the hooks/components you write here behave
 * exactly like they would against a real API.
 */

// A dedicated error class (instead of throwing a plain string/object) lets callers
// use `instanceof ApiError` as a type guard, and carries a `status` the UI can branch on.
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface SimulateOptions {
  /** ms before resolving/rejecting. Lets tests/UI show a real loading state. */
  delayMs?: number;
  /** 0..1 chance the request fails with ApiError. Defaults to 0 (never fails). */
  failureRate?: number;
  /** Wire this up to fetch's AbortController.signal to support cancellation. */
  signal?: AbortSignal;
}

/**
 * Resolves with `data` after `delayMs`, unless:
 * - the signal is already aborted / gets aborted while waiting -> rejects with a DOMException named "AbortError"
 * - the random roll is below `failureRate` -> rejects with ApiError
 *
 * Generic `<T>` means this one function works for a list of transactions, a single
 * form-submit response, or anything else — the caller decides what T is by how they use it.
 */
export function simulateRequest<T>(
  data: T,
  options: SimulateOptions = {},
): Promise<T> {
  const { delayMs = 400, failureRate = 0, signal } = options;

  return new Promise<T>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timer = setTimeout(() => {
      if (Math.random() < failureRate) {
        reject(new ApiError('Request failed. Please try again.', 500));
        return;
      }
      resolve(data);
    }, delayMs);

    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

/**
 * Simpler version of `simulateRequest` — no `AbortSignal`, no injectable
 * failure rate. Just "wait `delayMs`, then resolve with `data`."
 *
 * This is what a fake-API helper looks like BEFORE you add cancellation and
 * error-injection support. Useful to see side-by-side with the full version
 * above: the extra options in `simulateRequest` aren't complexity for its own
 * sake — each one exists to support a specific requirement (abort = cleanup
 * on unmount/race conditions, failureRate = being able to demo/test the error
 * UI on demand). Prefer this simple version for quick throwaway examples;
 * use the full `simulateRequest` for anything that needs a real loading/retry
 * flow, which is every task in this project.
 */
export function simulateRequestSimple<T>(data: T, delayMs = 400): Promise<T> {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(data), delayMs);
  });
}

/** Type guard used across tasks to decide whether a caught value is our ApiError. */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** Type guard: narrows `unknown` (from a catch block) down to a real Error. */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/** Best-effort human-readable message extraction from an unknown catch value. */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (isError(error)) return error.message;
  return 'Something went wrong. Please try again.';
}
