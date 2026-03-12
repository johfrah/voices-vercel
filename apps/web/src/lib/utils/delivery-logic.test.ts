import { describe, expect, it } from 'vitest';
import { calculateDeliveryDate } from './delivery-logic';

describe('delivery-logic', () => {
  const actorBase = {
    delivery_days_min: 1,
    delivery_days_max: 1,
    cutoff_time: '18:00',
  };

  it('uses only delivery_days_max as customer promise and never returns ranges', () => {
    const result = calculateDeliveryDate(
      {
        ...actorBase,
        delivery_days_min: 1,
        delivery_days_max: 3,
      },
      new Date(2026, 2, 9, 10, 0, 0),
    );

    expect(result.delivery_days_min).toBe(3);
    expect(result.delivery_days_max).toBe(3);
    expect(result.dateMax).toBeNull();
    expect(result.isRange).toBe(false);
  });

  it('formats next-day delivery as morgen with MORGEN short label', () => {
    const result = calculateDeliveryDate(actorBase, new Date(2026, 2, 9, 10, 0, 0));

    expect(result.formatted).toBe('morgen');
    expect(result.formattedShort).toBe('MORGEN');
    expect(result.isTomorrow).toBe(true);
    expect(result.isToday).toBe(false);
  });

  it('starts counting from next working day after cutoff time', () => {
    const result = calculateDeliveryDate(actorBase, new Date(2026, 2, 9, 19, 0, 0));

    expect(result.dateMin.getDay()).toBe(3); // Wednesday
    expect(result.isTomorrow).toBe(false);
  });

  it('skips weekend days for 24h promises', () => {
    const result = calculateDeliveryDate(actorBase, new Date(2026, 2, 13, 10, 0, 0));

    expect(result.dateMin.getDay()).toBe(1); // Monday
  });
});
