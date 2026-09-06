import { isFormValid, isValidAmount, isValidEmail, validateAll, validateField } from './validation';
import type { SendMoneyFormValues } from './types';

const buildValues = (overrides: Partial<SendMoneyFormValues> = {}): SendMoneyFormValues => ({
  recipientEmail: 'friend@example.com',
  amount: '100',
  currency: 'USD',
  note: '',
  ...overrides,
});

describe('isValidEmail', () => {
  it.each(['a@b.com', 'first.last@sub.domain.co'])('accepts %s', (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  it.each(['', 'not-an-email', 'a@b', '@b.com'])('rejects %s', (email) => {
    expect(isValidEmail(email)).toBe(false);
  });
});

describe('isValidAmount', () => {
  it.each(['1', '0.01', '10000'])('accepts %s', (amount) => {
    expect(isValidAmount(amount)).toBe(true);
  });

  it.each(['0', '-5', 'abc', '', '10001'])('rejects %s (edge cases: zero, negative, NaN, empty, over limit)', (amount) => {
    expect(isValidAmount(amount)).toBe(false);
  });
});

describe('validateField', () => {
  it('requires recipientEmail', () => {
    const error = validateField('recipientEmail', buildValues({ recipientEmail: '' }));
    expect(error).toMatch(/required/i);
  });

  it('rejects a malformed recipientEmail', () => {
    const error = validateField('recipientEmail', buildValues({ recipientEmail: 'nope' }));
    expect(error).toMatch(/valid email/i);
  });

  it('passes a valid field with no error', () => {
    const error = validateField('amount', buildValues({ amount: '50' }));
    expect(error).toBeUndefined();
  });

  it('caps note length at 140 characters', () => {
    const error = validateField('note', buildValues({ note: 'x'.repeat(141) }));
    expect(error).toMatch(/140/);
  });
});

describe('validateAll + isFormValid', () => {
  it('returns no errors and isFormValid=true for a fully valid form', () => {
    const errors = validateAll(buildValues());
    expect(errors).toEqual({});
    expect(isFormValid(errors)).toBe(true);
  });

  it('collects one error per invalid field', () => {
    const errors = validateAll(buildValues({ recipientEmail: '', amount: '-1' }));
    expect(Object.keys(errors).sort()).toEqual(['amount', 'recipientEmail']);
    expect(isFormValid(errors)).toBe(false);
  });
});
