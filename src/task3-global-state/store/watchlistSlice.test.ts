import { watchlistReducer, addSymbol, removeSymbol, updatePrice } from './watchlistSlice';
import type { WatchlistState } from '../types';

// Building a minimal, explicit starting state per test (rather than importing
// the slice's real initialState) keeps each test self-contained and immune to
// someone changing the default seed data later.
const buildState = (overrides: Partial<WatchlistState> = {}): WatchlistState => ({
  byId: {},
  allIds: [],
  ...overrides,
});

describe('watchlistReducer', () => {
  it('addSymbol adds a new entity and appends its id to allIds', () => {
    const state = buildState();

    const next = watchlistReducer(state, addSymbol({ symbol: 'USD/JPY', price: 149.5, changePercent: 0.1 }));

    expect(next.allIds).toEqual(['USD/JPY']);
    expect(next.byId['USD/JPY']).toEqual({ symbol: 'USD/JPY', price: 149.5, changePercent: 0.1 });
  });

  it('addSymbol is idempotent: adding the same symbol twice does not duplicate it in allIds', () => {
    const state = buildState({
      byId: { 'USD/JPY': { symbol: 'USD/JPY', price: 149.5, changePercent: 0.1 } },
      allIds: ['USD/JPY'],
    });

    const next = watchlistReducer(state, addSymbol({ symbol: 'USD/JPY', price: 150.0, changePercent: 0.3 }));

    expect(next.allIds).toEqual(['USD/JPY']);
    expect(next.byId['USD/JPY'].price).toBe(150.0);
  });

  it('removeSymbol deletes the entity and its id', () => {
    const state = buildState({
      byId: {
        'USD/JPY': { symbol: 'USD/JPY', price: 149.5, changePercent: 0.1 },
        'EUR/USD': { symbol: 'EUR/USD', price: 1.09, changePercent: 0.4 },
      },
      allIds: ['USD/JPY', 'EUR/USD'],
    });

    const next = watchlistReducer(state, removeSymbol({ symbol: 'USD/JPY' }));

    expect(next.allIds).toEqual(['EUR/USD']);
    expect(next.byId['USD/JPY']).toBeUndefined();
    // The untouched entity must be unaffected.
    expect(next.byId['EUR/USD']).toEqual({ symbol: 'EUR/USD', price: 1.09, changePercent: 0.4 });
  });

  it('removeSymbol on an id that does not exist is a safe no-op', () => {
    const state = buildState({
      byId: { 'EUR/USD': { symbol: 'EUR/USD', price: 1.09, changePercent: 0.4 } },
      allIds: ['EUR/USD'],
    });

    const next = watchlistReducer(state, removeSymbol({ symbol: 'GBP/USD' }));

    expect(next).toEqual(state);
  });

  it('updatePrice updates only the targeted entity', () => {
    const state = buildState({
      byId: {
        'EUR/USD': { symbol: 'EUR/USD', price: 1.09, changePercent: 0.4 },
        'GBP/USD': { symbol: 'GBP/USD', price: 1.27, changePercent: -0.2 },
      },
      allIds: ['EUR/USD', 'GBP/USD'],
    });

    const next = watchlistReducer(state, updatePrice({ symbol: 'EUR/USD', price: 1.11, changePercent: 1.8 }));

    expect(next.byId['EUR/USD']).toEqual({ symbol: 'EUR/USD', price: 1.11, changePercent: 1.8 });
    expect(next.byId['GBP/USD']).toEqual({ symbol: 'GBP/USD', price: 1.27, changePercent: -0.2 });
  });

  it('updatePrice on an unknown symbol does not create a new entity (edge case)', () => {
    const state = buildState({
      byId: { 'EUR/USD': { symbol: 'EUR/USD', price: 1.09, changePercent: 0.4 } },
      allIds: ['EUR/USD'],
    });

    const next = watchlistReducer(state, updatePrice({ symbol: 'GBP/USD', price: 1.3, changePercent: 2 }));

    expect(next.byId['GBP/USD']).toBeUndefined();
    expect(next.allIds).toEqual(['EUR/USD']);
  });
});
