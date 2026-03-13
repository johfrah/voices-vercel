export type RoutingTypeInput = {
  routing_type?: string | null;
  entity_type_id?: number | null;
  journey?: string | null;
  world_id?: number | null;
  slug?: string | null;
};

export function normalizeRoutingType(resolved: RoutingTypeInput): string | undefined {
  if (resolved?.routing_type === 'single_product') {
    const looksLikeWorkshop =
      resolved?.entity_type_id === 5 ||
      resolved?.journey === 'studio' ||
      resolved?.world_id === 2 ||
      (resolved?.slug || '').startsWith('studio/');

    return looksLikeWorkshop ? 'workshop' : 'actor';
  }

  return resolved?.routing_type ?? undefined;
}
