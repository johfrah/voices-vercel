const SUPABASE_VOICES_PUBLIC_BASE = 'https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/';

const toCleanString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
};

const toNumericKey = (value: unknown): string | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^\d+$/.test(trimmed)) return trimmed;
  }
  return null;
};

export const normalizeWorkshopImageUrl = (rawSource: unknown): string | null => {
  const source = toCleanString(rawSource);
  if (!source) return null;

  if (source.startsWith('http://') || source.startsWith('https://') || source.startsWith('/')) {
    return source;
  }

  return `${SUPABASE_VOICES_PUBLIC_BASE}${source.replace(/^\/+/, '')}`;
};

export const resolveWorkshopImageFromItem = (
  workshopItem: Record<string, unknown>,
  workshopImageMap?: Record<string, string>
): string | null => {
  const nestedFeaturedImage = toRecord(workshopItem.featured_image);
  const nestedMedia = toRecord(workshopItem.media);

  const directSource =
    workshopItem.image_url ||
    workshopItem.thumbnail_url ||
    workshopItem.featured_image_url ||
    workshopItem.media_url ||
    workshopItem.imageUrl ||
    workshopItem.thumbnailUrl ||
    nestedFeaturedImage?.file_path ||
    nestedMedia?.file_path ||
    nestedMedia?.filePath;

  const normalizedDirectSource = normalizeWorkshopImageUrl(directSource);
  if (normalizedDirectSource) return normalizedDirectSource;

  if (!workshopImageMap) return null;

  const workshopId = toNumericKey(workshopItem.workshop_id ?? workshopItem.workshopId);
  const editionId = toNumericKey(workshopItem.edition_id ?? workshopItem.editionId);
  const itemIdRaw = toCleanString(workshopItem.id);
  const parsedItemId = itemIdRaw?.match(/workshop-(\d+)/i)?.[1] || null;
  const titleKey = toCleanString(workshopItem.name)?.toLowerCase() || null;
  const slugKey = toCleanString(workshopItem.slug)?.toLowerCase() || null;

  const mappedSource =
    (workshopId ? workshopImageMap[`workshop:${workshopId}`] : undefined) ||
    (editionId ? workshopImageMap[`edition:${editionId}`] : undefined) ||
    (parsedItemId ? workshopImageMap[`workshop:${parsedItemId}`] : undefined) ||
    (parsedItemId ? workshopImageMap[`edition:${parsedItemId}`] : undefined) ||
    (slugKey ? workshopImageMap[`slug:${slugKey}`] : undefined) ||
    (titleKey ? workshopImageMap[`title:${titleKey}`] : undefined);

  return normalizeWorkshopImageUrl(mappedSource);
};
