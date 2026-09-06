import type { FormErrors, SendMoneyFormValues } from './types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_AMOUNT = 10_000;

/**
 * Type guard: narrows `string` down to "a string that parses to a finite,
 * positive number". Named with an `is` prefix (convention, not required) and
 * returns a type predicate (`value is ...`) — TS doesn't actually narrow the
 * *string* type here (it stays a string), but the pattern below is used the
 * same way real type guards are: callers branch on the boolean and TS trusts
 * the guard's promise about what's safe to do next.
 */
export function isValidAmount(value: string): boolean {
  const parsed = Number(value);
  return value.trim() !== '' && Number.isFinite(parsed) && parsed > 0 && parsed <= MAX_AMOUNT;
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

/**
 * Validates a single field. Called on every keystroke (real-time validation)
 * AND on submit (validating all fields at once) — one source of truth for the
 * rules instead of duplicating them in two places.
 */
export function validateField(field: keyof SendMoneyFormValues, values: SendMoneyFormValues): string | undefined {
  switch (field) {
    case 'recipientEmail':
      if (!values.recipientEmail.trim()) return 'Recipient email is required';
      if (!isValidEmail(values.recipientEmail)) return 'Enter a valid email address';
      return undefined;

    case 'amount':
      if (!values.amount.trim()) return 'Amount is required';
      if (!isValidAmount(values.amount)) return `Enter an amount between 0 and ${MAX_AMOUNT}`;
      return undefined;

    case 'currency':
      return values.currency ? undefined : 'Select a currency';

    case 'note':
      // Optional field — 140 char cap is the only rule.
      return values.note.length > 140 ? 'Note must be 140 characters or fewer' : undefined;

    default:
      return undefined;
  }
}

/** Validates every field at once (used on submit). Returns an errors bag with only the failing fields present. */
export function validateAll(values: SendMoneyFormValues): FormErrors {
  const errors: FormErrors = {};
  (Object.keys(values) as Array<keyof SendMoneyFormValues>).forEach((field) => {
    const error = validateField(field, values);
    if (error) errors[field] = error;
  });
  return errors;
}

/** True when the errors bag has no entries — `Object.values` + `every` avoids caring about which keys exist. */
export function isFormValid(errors: FormErrors): boolean {
  return Object.values(errors).every((message) => !message);
}
