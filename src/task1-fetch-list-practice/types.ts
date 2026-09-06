


export type TransactionStatus = 'completed' | 'failed' | 'pending';
export type TransactionType = 'credit' | 'debit';

export interface ITransaction{
    id: string;
    amount: number;
    type: TransactionType;
    status: TransactionStatus;
    date: string; // convert to date when needed
    description: string;
}