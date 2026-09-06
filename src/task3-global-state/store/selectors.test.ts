import { configureStore } from '@reduxjs/toolkit';
import { watchlistReducer, addSymbol, updatePrice } from './watchlistSlice';
import { selectAllWatchlistItems, selectAveragePrice, selectWatchlistCount } from './selectors';
import type { RootState } from './store';

// A tiny real store (not the app's singleton `store.ts`) — isolates each test
// and lets us dispatch real actions instead of hand-building RootState objects,
// which is what actually exercises the selectors' memoization behaviour.
function makeTestStore() {
  return configureStore({ reducer: { watchlist: watchlistReducer } });
}

describe('watchlist selectors', () => {
  it('selectAllWatchlistItems returns items in allIds order (seeded items first, then newly added ones)', () => {
    const store = makeTestStore();
    store.dispatch(addSymbol({ symbol: 'B', price: 2, changePercent: 0 }));
    store.dispatch(addSymbol({ symbol: 'A', price: 1, changePercent: 0 }));

    const items = selectAllWatchlistItems(store.getState() as RootState);
    expect(items.map((i) => i.symbol)).toEqual(['EUR/USD', 'GBP/USD', 'B', 'A']);
  });

  it('selectWatchlistCount reflects the number of tracked symbols', () => {
    const store = makeTestStore();
    expect(selectWatchlistCount(store.getState() as RootState)).toBe(2); // seeded initial state

    store.dispatch(addSymbol({ symbol: 'USD/JPY', price: 150, changePercent: 0 }));
    expect(selectWatchlistCount(store.getState() as RootState)).toBe(3);
  });

  it('selectAveragePrice computes the mean, and returns 0 for an empty watchlist', () => {
    const store = makeTestStore();
    // Empty edge case: build state manually since the slice seeds 2 items by default.
    const emptyState = { watchlist: { byId: {}, allIds: [] } } as RootState;
    expect(selectAveragePrice(emptyState)).toBe(0);

    store.dispatch(addSymbol({ symbol: 'A', price: 10, changePercent: 0 }));
    store.dispatch(addSymbol({ symbol: 'B', price: 20, changePercent: 0 }));
    const onlyAB = {
      watchlist: {
        byId: { A: { symbol: 'A', price: 10, changePercent: 0 }, B: { symbol: 'B', price: 20, changePercent: 0 } },
        allIds: ['A', 'B'],
      },
    } as RootState;
    expect(selectAveragePrice(onlyAB)).toBe(15);
  });

  it('memoizes: returns the same array reference when the watchlist slice is unchanged', () => {
    const store = makeTestStore();
    const first = selectAllWatchlistItems(store.getState() as RootState);
    const second = selectAllWatchlistItems(store.getState() as RootState);

    // Same reference proves the selector skipped recomputation — this is the
    // behaviour that stops unrelated re-renders in components using it.
    expect(first).toBe(second);
  });

  it('recomputes only when the watchlist slice actually changes', () => {
    const store = makeTestStore();
    const before = selectAllWatchlistItems(store.getState() as RootState);

    store.dispatch(updatePrice({ symbol: 'EUR/USD', price: 1.5, changePercent: 5 }));
    const after = selectAllWatchlistItems(store.getState() as RootState);

    expect(after).not.toBe(before);
    expect(after.find((i) => i.symbol === 'EUR/USD')?.price).toBe(1.5);
  });
});
