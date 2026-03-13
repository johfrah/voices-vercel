import { describe, expect, it } from 'vitest';
import {
  calculateDeliveryDate,
  formatOpeningHours,
  getNextWorkingDay,
  isOfficeOpen,
} from './delivery-logic';

describe('delivery-logic', () => {
  it('skips weekends and actor availability blocks for next working day', () => {
    const startDate = new Date(2026, 2, 13, 10, 0, 0, 0); // Friday
    const availability = [
      {
        start: '2026-03-16T12:00:00',
        end: '2026-03-16T12:00:00',
      },
    ];

    const next = getNextWorkingDay(startDate, [], availability, ['mon', 'tue', 'wed', 'thu', 'fri']);

    expect(next.getDay()).toBe(2); // Tuesday
    expect(next.getDate()).toBe(17);
  });

  it('uses next workday baseline when order arrives after cutoff', () => {
    const result = calculateDeliveryDate(
      {
        delivery_days_min: 1,
        delivery_days_max: 1,
        cutoff_time: '18:00',
        delivery_config: {
          type: '24h',
          cutoff: '18:00',
          weekly_on: ['mon', 'tue', 'wed', 'thu', 'fri'],
        },
      },
      new Date(2026, 2, 13, 19, 30, 0, 0), // Friday after cutoff
      ['mon', 'tue', 'wed', 'thu', 'fri']
    );

    expect(result.delivery_days_min).toBe(1);
    expect(result.delivery_days_max).toBe(1);
    expect(result.dateMin.getDay()).toBe(2); // Tuesday
    expect(result.dateMin.getDate()).toBe(17);
  });

  it('shifts same-day promise to next system workday for HITL validation', () => {
    const result = calculateDeliveryDate(
      {
        delivery_days_min: 0,
        delivery_days_max: 0,
        cutoff_time: '18:00',
        delivery_config: {
          type: 'sameday',
          cutoff: '18:00',
          weekly_on: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
        },
      },
      new Date(2026, 2, 14, 10, 0, 0, 0), // Saturday
      ['mon', 'tue', 'wed', 'thu', 'fri']
    );

    expect(result.dateMin.getDay()).toBe(1); // Monday
    expect(result.dateMin.getDate()).toBe(16);
    expect(result.dateMin.getHours()).toBe(9);
  });

  it('treats opening hours as start-inclusive and end-exclusive', () => {
    const openingHours = {
      mon: { active: true, start: '09:00', end: '17:00' },
    };

    expect(isOfficeOpen(openingHours, new Date(2026, 2, 16, 9, 0, 0, 0))).toBe(true);
    expect(isOfficeOpen(openingHours, new Date(2026, 2, 16, 17, 0, 0, 0))).toBe(false);
  });

  it('returns compact weekday range when all weekdays share same hours', () => {
    const openingHours = {
      mon: { active: true, start: '09:00', end: '17:00' },
      tue: { active: true, start: '09:00', end: '17:00' },
      wed: { active: true, start: '09:00', end: '17:00' },
      thu: { active: true, start: '09:00', end: '17:00' },
      fri: { active: true, start: '09:00', end: '17:00' },
    };

    expect(formatOpeningHours(openingHours, 'nl')).toBe('Ma-Vr: 09:00 - 17:00');
    expect(formatOpeningHours(openingHours, 'en')).toBe('Mon-Fri: 09:00 - 17:00');
  });
});
