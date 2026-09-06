import { useState, type FormEvent } from 'react';
import { useAsyncData } from './useAsyncData';
import { searchCards } from './api';
import type { Card } from './types';

interface CardSearchProps {
  failureRate?: number;
}

export function CardSearch({ failureRate = 0 }: CardSearchProps) {
  const [query, setQuery] = useState('');
  // Tracks the query that produced the CURRENT results — needed so the empty
  // state can say "No cards match 'travel'" instead of a generic message.
  const [searchedQuery, setSearchedQuery] = useState<string | null>(null);
  const { state, run, isLoading } = useAsyncData<Card[]>();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Prevent redundant actions: ignore a second submit while one is in flight
    // (covers double-click / rapid double Enter on the search button).
    if (isLoading) return;
    setSearchedQuery(query);
    run((signal) => searchCards(query, { signal, failureRate }));
  };

  const handleRetry = () => {
    run((signal) => searchCards(query, { signal, failureRate }));
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="card-query">Search cards</label>
        <input id="card-query" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="travel" />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <CardSearchResults state={state} query={searchedQuery} onRetry={handleRetry} />
    </div>
  );
}

interface CardSearchResultsProps {
  state: ReturnType<typeof useAsyncData<Card[]>>['state'];
  query: string | null;
  onRetry: () => void;
}

// Split out from CardSearch so each of the 4 states is one clear `if` — this is
// the "all three states handled" requirement made explicit, plus the 4th
// (idle, before any search has run) that's easy to forget.
function CardSearchResults({ state, query, onRetry }: CardSearchResultsProps) {
  if (state.status === 'idle') {
    return <p>Search for a card by name to get started.</p>;
  }

  if (state.status === 'loading') {
    return (
      <p role="status" aria-live="polite">
        Searching...
      </p>
    );
  }

  if (state.status === 'error') {
    return (
      <div role="alert">
        <p>Search failed: {state.error}</p>
        <button onClick={onRetry}>Retry</button>
      </div>
    );
  }

  if (state.data.length === 0) {
    return <p>No cards match &quot;{query}&quot;.</p>;
  }

  return (
    <ul>
      {state.data.map((card) => (
        <li key={card.id}>
          {card.label} •••• {card.last4}
          {card.frozen && ' (frozen)'}
        </li>
      ))}
    </ul>
  );
}
