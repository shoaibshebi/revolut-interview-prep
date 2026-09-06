/**
 * TASK 2: Form with Validation
 * Domain: a "Send Money" form (recipient, amount, currency, note).
 */

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'PKR';

// Every field the form collects. Kept as one flat interface — the form is small
// enough that splitting it wouldn't clarify anything.
export interface SendMoneyFormValues {
  recipientEmail: string;
  amount: string; // kept as string while editing (inputs are always strings); parsed to number on submit
  currency: CurrencyCode;
  note: string;
}

// `keyof` produces a union of a type's property names as string literals:
// FormField = 'recipientEmail' | 'amount' | 'currency' | 'note'.
// Using this instead of hand-writing that union means it can never drift out of
// sync with SendMoneyFormValues — add a field there and FormField updates itself.
export type FormField = keyof SendMoneyFormValues;

// `Partial<Record<K, V>>` = an object that *may* have any subset of keys K, each
// mapped to V. Perfect for an errors bag: most fields have no error (key absent),
// not `null`/`undefined` sitting there taking up shape.
export type FormErrors = Partial<Record<FormField, string>>;

export interface SendMoneyResult {
  confirmationId: string;
  amountSent: number;
  fee: number;
}
