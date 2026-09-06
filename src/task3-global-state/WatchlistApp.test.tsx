import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WatchlistApp } from './WatchlistApp';
import { watchlistReducer } from './store/watchlistSlice';

// Renders against a REAL Redux store (not mocked) — this is what proves
// "multiple components sharing state" actually works end-to-end: the form,
// the table, and the summary all read/write the same store instance.
function renderWithStore() {
  const store = configureStore({ reducer: { watchlist: watchlistReducer } });
  return render(
    <Provider store={store}>
      <WatchlistApp />
    </Provider>,
  );
}

describe('<WatchlistApp /> (integration)', () => {
  it('shows the seeded watchlist and count on first render', () => {
    renderWithStore();

    expect(screen.getByText(/tracking 2 pairs/i)).toBeInTheDocument();
    expect(screen.getByText('EUR/USD')).toBeInTheDocument();
  });

  it('adding a symbol via the form updates the table AND the summary count', async () => {
    const user = userEvent.setup();
    renderWithStore();

    await user.type(screen.getByLabelText(/symbol/i), 'usd/jpy');
    await user.type(screen.getByLabelText(/price/i), '150.25');
    await user.click(screen.getByRole('button', { name: /add to watchlist/i }));

    expect(await screen.findByText('USD/JPY')).toBeInTheDocument();
    expect(screen.getByText(/tracking 3 pairs/i)).toBeInTheDocument();
  });

  it('ignores an add-form submit with an invalid price (edge case)', async () => {
    const user = userEvent.setup();
    renderWithStore();

    await user.type(screen.getByLabelText(/symbol/i), 'AUD/USD');
    await user.type(screen.getByLabelText(/price/i), 'not-a-number');
    await user.click(screen.getByRole('button', { name: /add to watchlist/i }));

    expect(screen.queryByText('AUD/USD')).not.toBeInTheDocument();
    expect(screen.getByText(/tracking 2 pairs/i)).toBeInTheDocument();
  });

  it('removing the last remaining symbol shows the empty state', async () => {
    const user = userEvent.setup();
    renderWithStore();

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await user.click(removeButtons[0]);
    await user.click(screen.getAllByRole('button', { name: /remove/i })[0]);

    expect(await screen.findByText(/your watchlist is empty/i)).toBeInTheDocument();
  });
});
