import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { WatchlistItem, WatchlistState } from '../types';

const initialState: WatchlistState = {
  byId: {
    'EUR/USD': { symbol: 'EUR/USD', price: 1.09, changePercent: 0.4 },
    'GBP/USD': { symbol: 'GBP/USD', price: 1.27, changePercent: -0.2 },
  },
  allIds: ['EUR/USD', 'GBP/USD'],
};

// `createSlice` lets reducers "mutate" `state` directly (Immer produces the real
// immutable update under the hood) — this is RTK's answer to the classic
// hand-written-reducer boilerplate of `return { ...state, ... }` everywhere.
const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {
    // `PayloadAction<T>` types `action.payload` as T — without it, payload would be `any`.
    addSymbol: (state, action: PayloadAction<WatchlistItem>) => {
      const { symbol } = action.payload;
      // Idempotent: adding a symbol that's already tracked just updates it,
      // and never duplicates it in allIds.
      if (!(symbol in state.byId)) {
        state.allIds.push(symbol);
      }
      state.byId[symbol] = action.payload;
    },

    removeSymbol: (state, action: PayloadAction<{ symbol: string }>) => {
      const { symbol } = action.payload;
      delete state.byId[symbol];
      state.allIds = state.allIds.filter((id) => id !== symbol);
    },

    updatePrice: (state, action: PayloadAction<{ symbol: string; price: number; changePercent: number }>) => {
      const existing = state.byId[action.payload.symbol];
      // Guard: ignore price ticks for a symbol that was removed in the meantime.
      if (!existing) return;
      existing.price = action.payload.price;
      existing.changePercent = action.payload.changePercent;
    },
  },
});

export const { addSymbol, removeSymbol, updatePrice } = watchlistSlice.actions;
export const watchlistReducer = watchlistSlice.reducer;
