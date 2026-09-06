import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState } from './store';

/**
 * Pre-typed versions of the plain react-redux hooks. Without these, every
 * `useSelector` call site would need `(state: RootState) => ...` written out,
 * and `useDispatch()` would return a loosely-typed `Dispatch` that doesn't know
 * about thunks. Defining them once here means every component just imports
 * `useAppSelector`/`useAppDispatch` and gets full inference for free.
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
