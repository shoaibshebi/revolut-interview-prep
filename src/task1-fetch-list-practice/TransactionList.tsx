
import { ITransaction } from './types';
import { useTransactions } from './useTransactions';

export default function TransactionListPrac() {
    // hoook to fetch — poora state lo, destructure mat karo (data sirf
    // 'success' branch mein hi hai, isliye pehle status narrow karna padega).
    const state = useTransactions()

    if(state.status==='pending'){
        return(<h5>Loading...</h5>)
    }

    if(state.status==='error'){
        // show retry button
        return(<h1>Error to fetch</h1>)
    }

    // Yahan TS ko pata hai state.status === 'success' hai, isliye state.data
    // ab safely T (ITransaction[]) type ka hai — koi cast/any nahi chahiye.
    const txs = state.data;

  return (
    <table>
        <thead>
            <tr>
                <th>Data</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            {txs.map((x: ITransaction)=>{
                return(<TransactionRow tx={x} key={x.id} />)
            })}
        </tbody>
    </table>
  )
}




function TransactionRow({tx}:{tx: ITransaction}) {
 return (
    <tr>
      <td>{new Date(tx.date).toLocaleDateString()}</td>
      <td>{tx.description}</td>
      <td>{tx.type}</td>
      <td>
        
        {tx.amount.toFixed(2)}
        
      </td>
    </tr>
  );
}
