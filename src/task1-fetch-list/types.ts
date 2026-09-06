/**
 * TASK 1: Fetch + Display List
 * Domain: a transaction history list (classic fintech interview scenario).
 */

// A union of string literals ("string enum" without the runtime `enum` overhead).
// Prefer this over TS `enum` for simple cases: enums generate real JS objects at
// runtime and don't structurally match plain strings coming back from an API.
export type TransactionType = 'debit' | 'credit' | 'transfer';

export type TransactionStatus = 'pending' | 'completed' | 'failed';

// A plain `interface` for the core data shape. Interfaces and `type` aliases are
// almost interchangeable for object shapes; interfaces are extendable via
// `interface X extends Y` and give slightly better error messages, so they're a
// common default for "data model" objects. Unions/intersections need `type`.
export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  date: string; // ISO string — kept as string, converted to Date only where displayed
  description: string;
}
