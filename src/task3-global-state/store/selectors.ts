import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';
import type { WatchlistItem } from '../types';

// "Input selectors" — cheap, direct reads off the store. No computation here,
// so nothing needs memoizing yet.
const selectWatchlistState = (state: RootState) => state.watchlist;
const selectById = (state: RootState) => state.watchlist.byId;
const selectAllIds = (state: RootState) => state.watchlist.allIds;

/**
 * `createSelector` builds a MEMOIZED selector: it only recomputes the array
 * below when `selectById` or `selectAllIds` actually return a new reference
 * (i.e. the watchlist slice changed). If some unrelated slice of the store
 * updates, this returns the *same* array reference as last time — which matters
 * because components using `useSelector` re-render when the selected value
 * changes by reference. Without memoization, `.map()` would build a brand new
 * array on every single store update, and every list item would needlessly
 * re-render on every action, no matter which slice it touched.
 */
export const selectAllWatchlistItems = createSelector(
  [selectById, selectAllIds],
  (byId, allIds): WatchlistItem[] => allIds.map((id) => byId[id]),
);

export const selectWatchlistCount = createSelector([selectAllIds], (allIds) => allIds.length);

/** Derived/computed value — exactly the kind of thing that benefits most from memoization. */
export const selectAveragePrice = createSelector([selectAllWatchlistItems], (items): number => {
  if (items.length === 0) return 0;
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return Number((total / items.length).toFixed(4));
});

/**
 * A selector *factory* — returns a new selector per call, closing over `symbol`.
 * Needed because a plain `createSelector` can't take extra arguments at call time
 * the way a function can; this pattern is the standard workaround, commonly used
 * for "give me the selector for THIS one id" inside a list item component.
 */
export const makeSelectItemBySymbol = (symbol: string) =>
  createSelector([selectById], (byId): WatchlistItem | undefined => byId[symbol]);

export const selectWatchlistSlice = selectWatchlistState;
