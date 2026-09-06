import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CardSearch } from './CardSearch';
import * as api from './api';

jest.mock('./api');
const mockedSearchCards = jest.mocked(api.searchCards);

describe('<CardSearch /> (all 4 UX states)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows an idle prompt before any search runs', () => {
    render(<CardSearch />);
    expect(screen.getByText(/search for a card by name/i)).toBeInTheDocument();
  });

  it('shows a loading state while the search is in flight', async () => {
    mockedSearchCards.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(<CardSearch />);

    await user.type(screen.getByLabelText(/search cards/i), 'travel');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(screen.getByRole('status')).toHaveTextContent(/searching/i);
  });

  it('renders matching cards on success', async () => {
    mockedSearchCards.mockResolvedValueOnce([{ id: 'c2', label: 'Travel card', last4: '1881', frozen: false }]);
    const user = userEvent.setup();
    render(<CardSearch />);

    await user.type(screen.getByLabelText(/search cards/i), 'travel');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(await screen.findByText(/travel card/i)).toBeInTheDocument();
  });

  it('shows a contextual empty-state message naming the search term', async () => {
    mockedSearchCards.mockResolvedValueOnce([]);
    const user = userEvent.setup();
    render(<CardSearch />);

    await user.type(screen.getByLabelText(/search cards/i), 'crypto');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(await screen.findByText(/no cards match "crypto"/i)).toBeInTheDocument();
  });

  it('shows a contextual error message with a working retry button', async () => {
    mockedSearchCards.mockRejectedValueOnce(new Error('Timed out'));
    mockedSearchCards.mockResolvedValueOnce([{ id: 'c1', label: 'Everyday spending', last4: '4242', frozen: false }]);
    const user = userEvent.setup();
    render(<CardSearch />);

    await user.type(screen.getByLabelText(/search cards/i), 'everyday');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/timed out/i);

    await user.click(screen.getByRole('button', { name: /retry/i }));

    expect(await screen.findByText(/everyday spending/i)).toBeInTheDocument();
  });

  it('prevents a redundant second search while one is already in flight', async () => {
    mockedSearchCards.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(<CardSearch />);

    await user.type(screen.getByLabelText(/search cards/i), 'travel');
    const searchButton = screen.getByRole('button', { name: /search/i });

    await user.click(searchButton);
    // Button is now disabled and shows "Searching..." — clicking again should not fire another request.
    await user.click(screen.getByRole('button', { name: /searching/i }));

    expect(mockedSearchCards).toHaveBeenCalledTimes(1);
  });
});
