import type { ChangeEvent, FormEvent } from 'react';
import { useSendMoneyForm } from './useSendMoneyForm';
import type { CurrencyCode } from './types';

const CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'PKR'];

export function SendMoneyForm() {
  const { values, errors, isSubmitting, submitError, result, setField, submit } = useSendMoneyForm();

  // Typing the DOM event explicitly (`ChangeEvent<HTMLInputElement>`) instead of
  // leaving it implicit/`any` is what "type-safe event handlers" means in practice —
  // it's how you get autocomplete on `e.target.value` and catch typos like `e.target.valeu`.
  const handleTextChange = (field: 'recipientEmail' | 'amount' | 'note') => (e: ChangeEvent<HTMLInputElement>) => {
    setField(field, e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit();
  };

  if (result) {
    return (
      <div role="status">
        <p>Sent! Confirmation: {result.confirmationId}</p>
        <p>
          Amount: {result.amountSent} (fee: {result.fee})
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="recipientEmail">Recipient email</label>
        <input
          id="recipientEmail"
          type="email"
          value={values.recipientEmail}
          onChange={handleTextChange('recipientEmail')}
          aria-invalid={Boolean(errors.recipientEmail)}
          aria-describedby={errors.recipientEmail ? 'recipientEmail-error' : undefined}
        />
        {errors.recipientEmail && <span id="recipientEmail-error">{errors.recipientEmail}</span>}
      </div>

      <div>
        <label htmlFor="amount">Amount</label>
        <input
          id="amount"
          type="text"
          inputMode="decimal"
          value={values.amount}
          onChange={handleTextChange('amount')}
          aria-invalid={Boolean(errors.amount)}
          aria-describedby={errors.amount ? 'amount-error' : undefined}
        />
        {errors.amount && <span id="amount-error">{errors.amount}</span>}
      </div>

      <div>
        <label htmlFor="currency">Currency</label>
        <select
          id="currency"
          value={values.currency}
          onChange={(e) => setField('currency', e.target.value as CurrencyCode)}
        >
          {CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="note">Note (optional)</label>
        <input id="note" type="text" value={values.note} onChange={handleTextChange('note')} />
        {errors.note && <span>{errors.note}</span>}
      </div>

      {submitError && <div role="alert">{submitError}</div>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send money'}
      </button>
    </form>
  );
}
