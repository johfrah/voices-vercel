import { describe, expect, it } from 'vitest';
import { mapMollieOrderToPaymentLike, normalizeMollieStatus } from './mollie-webhook-utils';

describe('mollie-webhook-utils', () => {
  it('normalizes Mollie order/payment states to internal checkout states', () => {
    expect(normalizeMollieStatus('paid')).toBe('paid');
    expect(normalizeMollieStatus('completed')).toBe('paid');
    expect(normalizeMollieStatus('canceled')).toBe('cancelled');
    expect(normalizeMollieStatus('expired')).toBe('expired');
    expect(normalizeMollieStatus('failed')).toBe('failed');
    expect(normalizeMollieStatus('authorized')).toBe('pending');
  });

  it('maps order payloads to payment-like structure for webhook compatibility', () => {
    const mapped = mapMollieOrderToPaymentLike(
      {
        id: 'ord_123',
        status: 'completed',
        metadata: { orderId: 7788 },
        paymentMethod: 'bancontact',
        amountCaptured: { value: '299.00', currency: 'EUR' },
      },
      'ord_fallback',
    );

    expect(mapped.id).toBe('ord_123');
    expect(mapped.status).toBe('completed');
    expect(mapped.metadata.orderId).toBe(7788);
    expect(mapped.method).toBe('bancontact');
    expect(mapped.amount.value).toBe('299.00');
  });
});
