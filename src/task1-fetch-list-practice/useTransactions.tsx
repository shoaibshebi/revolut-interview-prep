import { useEffect, useState } from 'react';
import { ITransaction } from './types';
import { fetchTrans } from './api';

// type StateType = 'pending' | 'success' |'error';

export type TxState<TTransaction> =
  | {
      status: 'pending';
    }
  | { status: 'success'; data: TTransaction }
  | { status: 'error'; error: string | unknown };

export function useTransactions() {
  const [state, setState] = useState<TxState<ITransaction[]>>({
    status: 'pending',
  });

  // failed, succes, pending
  useEffect(() => {
    // fetch the data

    fetchTrans({ delay: 1000 })
      .then((data) => {
        if (state.status === 'success') setState(data);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError')
          return;
        setState({
          status: 'error',
          error,
        });
      });
  }, []);

  return state;
}
