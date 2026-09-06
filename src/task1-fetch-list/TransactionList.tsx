import { useTransactions } from './useTransactions';
import type { Transaction } from './types';

// Props typed with an `interface` — even though this component takes no props
// today, declaring the (empty) contract up front is a habit worth keeping so
// adding a prop later is a one-line diff instead of a refactor.
interface TransactionListProps {
  /** 0..1 — probability each fetch fails. Defaults to 0. Exists so this can be demoed failing. */
  failureRate?: number;
}

// `React.FC` is intentionally NOT used here — see TYPESCRIPT_GUIDE.md
// ("React.FC vs a plain function") for why a plain typed function is preferred.
export function TransactionList({ failureRate = 0 }: TransactionListProps) {
  const { state, retry } = useTransactions(failureRate);

  if (state.status === 'idle' || state.status === 'loading') {
    return (
      <div role="status" aria-live="polite">
        Loading transactions...
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div role="alert">
        <p>Couldn't load your transactions: {state.error}</p>
        <button onClick={retry}>Retry</button>
      </div>
    );
  }

  // At this point TypeScript has narrowed `state` to `{ status: 'success'; data: Transaction[] }` —
  // no cast needed, `state.data` is fully typed as Transaction[].
  if (state.data.length === 0) {
    return <p>No transactions yet.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Type</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {state.data.map((tx) => (
          <TransactionRow key={tx.id} transaction={tx} />
        ))}
      </tbody>
    </table>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const sign = transaction.type === 'credit' ? '+' : '-';
  return (
    <tr>
      <td>{new Date(transaction.date).toLocaleDateString()}</td>
      <td>{transaction.description}</td>
      <td>{transaction.type}</td>
      <td>
        {sign}
        {transaction.amount.toFixed(2)}
        {transaction.status === 'pending' && ' (pending)'}
      </td>
    </tr>
  );
}
