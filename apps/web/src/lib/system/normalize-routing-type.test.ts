import { describe, expect, it } from 'vitest';
import { normalizeRoutingType } from './normalize-routing-type';

describe('normalizeRoutingType', () => {
  it('maps single_product studio workshops to workshop routing', () => {
    expect(
      normalizeRoutingType({
        routing_type: 'single_product',
        entity_type_id: 5,
        world_id: 2,
        journey: 'studio',
        slug: 'studio/voice-overs-voor-beginners',
      })
    ).toBe('workshop');
  });

  it('maps single_product agency entries to actor routing', () => {
    expect(
      normalizeRoutingType({
        routing_type: 'single_product',
        entity_type_id: 1,
        world_id: 1,
        journey: 'agency',
        slug: 'aleksander',
      })
    ).toBe('actor');
  });

  it('keeps non-product routing types unchanged', () => {
    expect(normalizeRoutingType({ routing_type: 'single_post' })).toBe('single_post');
    expect(normalizeRoutingType({ routing_type: 'archive_product' })).toBe('archive_product');
  });
});
