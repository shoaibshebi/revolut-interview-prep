import { useCallback, useState } from 'react';
import { getErrorMessage } from '../shared/mockApi';
import { submitSendMoney } from './api';
import { isFormValid, validateAll, validateField } from './validation';
import type { FormErrors, SendMoneyFormValues, SendMoneyResult } from './types';

const initialValues: SendMoneyFormValues = {
  recipientEmail: '',
  amount: '',
  currency: 'USD',
  note: '',
};

/**
 * Everything the form needs lives in one state object rather than 4+ separate
 * `useState` calls. That keeps updates atomic (values + errors always change
 * together) and mirrors how you'd model this with `useReducer` if it grew.
 */
interface FormState {
  values: SendMoneyFormValues;
  errors: FormErrors;
  isSubmitting: boolean;
  submitError: string | null;
  result: SendMoneyResult | null;
}

export function useSendMoneyForm() {
  const [state, setState] = useState<FormState>({
    values: initialValues,
    errors: {},
    isSubmitting: false,
    submitError: null,
    result: null,
  });

  // Real-time validation: re-validate just the field that changed, on every keystroke.
  const setField = useCallback(<K extends keyof SendMoneyFormValues>(field: K, value: SendMoneyFormValues[K]) => {
    setState((prev) => {
      const values = { ...prev.values, [field]: value };
      const error = validateField(field, values);
      return {
        ...prev,
        values,
        errors: { ...prev.errors, [field]: error },
      };
    });
  }, []);

  // Depends on `state.values` so the closure always validates/submits the
  // latest values — the useCallback dependency array is what keeps this correct
  // (an empty array here would silently submit stale data, a classic bug).
  const submit = useCallback(async () => {
    const errors = validateAll(state.values);

    if (!isFormValid(errors)) {
      setState((prev) => ({ ...prev, errors }));
      return;
    }

    // `isSubmitting` guards against a double-submit (double-click, double Enter).
    if (state.isSubmitting) return;
    setState((prev) => ({ ...prev, isSubmitting: true, submitError: null, errors: {} }));

    try {
      const result = await submitSendMoney(state.values);
      setState((prev) => ({ ...prev, isSubmitting: false, result, values: initialValues, errors: {} }));
    } catch (error: unknown) {
      setState((prev) => ({ ...prev, isSubmitting: false, submitError: getErrorMessage(error) }));
    }
  }, [state.values, state.isSubmitting]);

  return { ...state, setField, submit };
}
