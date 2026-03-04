export type NormalizedMollieStatus = 'pending' | 'paid' | 'cancelled' | 'expired' | 'failed';

export function normalizeMollieStatus(statusCode: string): NormalizedMollieStatus {
  const normalized = String(statusCode || '').toLowerCase();
  if (normalized === 'paid' || normalized === 'completed') return 'paid';
  if (normalized === 'canceled' || normalized === 'cancelled') return 'cancelled';
  if (normalized === 'expired') return 'expired';
  if (normalized === 'failed') return 'failed';
  return 'pending';
}

export function mapMollieOrderToPaymentLike(order: any, fallbackId: string) {
  return {
    id: order?.id || fallbackId,
    status: order?.status || 'pending',
    metadata: order?.metadata || {},
    method: order?.method || order?.paymentMethod || 'online',
    amount: order?.amount || order?.amountCaptured || order?.amountPaid || { value: '0.00' },
  };
}
