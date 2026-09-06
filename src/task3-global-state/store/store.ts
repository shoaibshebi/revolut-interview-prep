import { configureStore } from '@reduxjs/toolkit';
import { watchlistReducer } from './watchlistSlice';

export const store = configureStore({
  reducer: {
    watchlist: watchlistReducer,
  },
});

// Deriving these two types FROM the store (instead of writing them by hand)
// means they can never drift: add a new slice to `reducer` above and
// `RootState`/`AppDispatch` pick it up automatically on the next compile.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
