/**
 * TASK 3: Global State (Redux Toolkit)
 * Domain: a currency watchlist shared across multiple components (a list, an
 * add-form, and a summary bar all read/write the same store).
 */

export interface WatchlistItem {
  symbol: string; // e.g. "EUR/USD" — used as the normalized entity's id
  price: number;
  changePercent: number; // e.g. 1.25 means +1.25%
}

/**
 * Normalized shape: entities keyed by id (`byId`) + an ordered list of ids
 * (`allIds`), instead of a plain `WatchlistItem[]`.
 *
 * Why normalize:
 * - O(1) lookup/update by symbol instead of `array.find`/`array.map` scans.
 * - Adding/removing/updating one item never requires touching the others —
 *   fewer accidental re-renders for components that only care about one entity.
 * - `allIds` keeps a stable display order independent of insertion into `byId`.
 * This is the same shape `@reduxjs/toolkit`'s `createEntityAdapter` generates —
 * written by hand here so the concept is visible rather than hidden by a helper.
 */
export interface WatchlistState {
  byId: Record<string, WatchlistItem>;
  allIds: string[];
}
