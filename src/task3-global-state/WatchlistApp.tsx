import { useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { addSymbol, removeSymbol } from './store/watchlistSlice';
import { selectAllWatchlistItems, selectAveragePrice, selectWatchlistCount } from './store/selectors';

/**
 * Three components below all read from / write to the SAME Redux slice
 * without any props passed between them — that's the "multiple components
 * sharing state" requirement. `<WatchlistApp>` only lays them out; it holds
 * no shared state of its own.
 */
export function WatchlistApp() {
  return (
    <div>
      <WatchlistSummary />
      <AddSymbolForm />
      <WatchlistTable />
    </div>
  );
}

function WatchlistSummary() {
  // Each `useAppSelector` call subscribes independently — this component only
  // re-renders when `count` or `average` actually change (thanks to the
  // memoized selectors), not on every unrelated store update.
  const count = useAppSelector(selectWatchlistCount);
  const average = useAppSelector(selectAveragePrice);

  return (
    <p>
      Tracking {count} pair{count === 1 ? '' : 's'} — average price {average}
    </p>
  );
}

function AddSymbolForm() {
  const dispatch = useAppDispatch();
  const [symbol, setSymbol] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsedPrice = Number(price);
    if (!symbol.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) return;

    dispatch(addSymbol({ symbol: symbol.trim().toUpperCase(), price: parsedPrice, changePercent: 0 }));
    setSymbol('');
    setPrice('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="symbol">Symbol</label>
      <input id="symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="EUR/GBP" />

      <label htmlFor="price">Price</label>
      <input id="price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.86" />

      <button type="submit">Add to watchlist</button>
    </form>
  );
}

function WatchlistTable() {
  const items = useAppSelector(selectAllWatchlistItems);
  const dispatch = useAppDispatch();

  if (items.length === 0) {
    return <p>Your watchlist is empty. Add a currency pair above.</p>;
  }

  return (
    <table>
      <tbody>
        {items.map((item) => (
          <tr key={item.symbol}>
            <td>{item.symbol}</td>
            <td>{item.price}</td>
            <td className={item.changePercent >= 0 ? 'positive' : 'negative'}>{item.changePercent}%</td>
            <td>
              <button onClick={() => dispatch(removeSymbol({ symbol: item.symbol }))}>Remove</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
