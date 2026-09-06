import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionList } from './TransactionList';
import * as api from './api';
import type { Transaction } from './types';

const buildTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: '1',
  amount: 100,
  type: 'credit',
  status: 'completed',
  date: '2026-01-01',
  description: 'Sample transaction',
  ...overrides,
});

jest.mock('./api');
const mockedFetchTransactions = jest.mocked(api.fetchTransactions);

describe('<TransactionList />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading state before data arrives', () => {
    mockedFetchTransactions.mockReturnValue(new Promise(() => {})); // never resolves

    render(<TransactionList />);

    expect(screen.getByRole('status')).toHaveTextContent(/loading/i);
  });

  it('renders each transaction once loaded', async () => {
    mockedFetchTransactions.mockResolvedValueOnce([
      buildTransaction({ id: 't1', description: 'Coffee' }),
      buildTransaction({ id: 't2', description: 'Rent' }),
    ]);

    render(<TransactionList />);

    expect(await screen.findByText('Coffee')).toBeInTheDocument();
    expect(screen.getByText('Rent')).toBeInTheDocument();
  });

  it('shows an empty-state message when there are no transactions', async () => {
    mockedFetchTransactions.mockResolvedValueOnce([]);

    render(<TransactionList />);

    expect(await screen.findByText(/no transactions yet/i)).toBeInTheDocument();
  });

  it('shows a contextual error message with a working retry button', async () => {
    mockedFetchTransactions.mockRejectedValueOnce(new Error('Server unavailable'));
    mockedFetchTransactions.mockResolvedValueOnce([buildTransaction({ description: 'Groceries' })]);

    const user = userEvent.setup();
    render(<TransactionList />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Server unavailable');

    await user.click(screen.getByRole('button', { name: /retry/i }));

    expect(await screen.findByText('Groceries')).toBeInTheDocument();
  });
});
