import { ITransaction } from "./types";
import { TxState } from "./useTransactions";


export const MOCK_TRANSACTIONS: ITransaction[] = [
  { id: 't1', amount: 250, type: 'credit', status: 'completed', date: '2026-09-01', description: 'Salary' },
  { id: 't2', amount: 42.5, type: 'debit', status: 'completed', date: '2026-09-02', description: 'Groceries' },
  { id: 't3', amount: 1200, type: 'debit', status: 'pending', date: '2026-09-03', description: 'Rent transfer' },
  { id: 't4', amount: 15.99, type: 'debit', status: 'failed', date: '2026-09-04', description: 'Subscription' },
];


interface IFetchTxs {
    delay: number
}

export const fetchTrans = ({delay}:IFetchTxs): Promise<TxState<ITransaction[]>>  => {
    return new Promise((resolve)=>{
        setTimeout(()=>resolve({status: 'success', data:MOCK_TRANSACTIONS}),delay)
    }
    )
}