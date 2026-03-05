import { describe, expect, it } from 'vitest';
import {
  DEFAULT_COMMERCIAL_MEDIA_CODE,
  normalizeCommercialMediaCode,
  sanitizeCommercialDetailMap,
} from './commercial-media';

describe('commercial media constants', () => {
  it('normalizes supported aliases to canonical media codes', () => {
    expect(normalizeCommercialMediaCode('social')).toBe('social_media');
    expect(normalizeCommercialMediaCode('TV')).toBe('tv_national');
    expect(normalizeCommercialMediaCode('podcast')).toBe('podcast');
    expect(normalizeCommercialMediaCode('unknown')).toBeNull();
  });

  it('sanitizes detail maps per selected media codes', () => {
    const result = sanitizeCommercialDetailMap(
      { podcast: 3, online: 0 },
      ['podcast', DEFAULT_COMMERCIAL_MEDIA_CODE],
      1
    );

    expect(result).toEqual({
      podcast: 3,
      online: 1,
    });
  });
});
