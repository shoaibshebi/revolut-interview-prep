/**
 * Discriminated union modelling every state an async request can be in.
 *
 * Why a union of 4 separate object shapes instead of one object with optional
 * fields (`{ loading: boolean; data？: T; error?: Error }`)?
 * Because with a single flat shape, invalid combinations compile fine
 * (e.g. `loading: true` AND `error` set AND `data` set at the same time) — the
 * type system can't stop that bug. With a discriminated union, TypeScript narrows
 * automatically on `state.status`, and only the fields valid for that status exist.
 * This is the "make invalid states unrepresentable" idea mentioned in the roadmap.
 */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// Small factory helpers so call sites don't repeat `{ status: 'x', ... }` literals.
// (Not strictly necessary, but keeps reducers/hooks readable — see useAsyncData.ts.)
export const idle = (): AsyncState<never> => ({ status: 'idle' });
export const loading = (): AsyncState<never> => ({ status: 'loading' });
export const success = <T,>(data: T): AsyncState<T> => ({ status: 'success', data });
export const failure = (error: string): AsyncState<never> => ({ status: 'error', error });
