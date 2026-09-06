import { simulateRequest } from '../shared/mockApi';
import type { SendMoneyFormValues, SendMoneyResult } from './types';

const FEE_PERCENT = 0.02;

export function submitSendMoney(
  values: SendMoneyFormValues,
  options: { signal?: AbortSignal; failureRate?: number } = {},
): Promise<SendMoneyResult> {
  const amount = Number(values.amount);
  const result: SendMoneyResult = {
    confirmationId: `conf_${Date.now()}`,
    amountSent: amount,
    fee: Number((amount * FEE_PERCENT).toFixed(2)),
  };

  return simulateRequest(result, { delayMs: 500, failureRate: options.failureRate ?? 0, signal: options.signal });
}
