export const COMMERCIAL_MEDIA_ALIAS_MAP: Record<string, string> = {
  online: 'online',
  podcast: 'podcast',
  radio: 'radio_national',
  radio_national: 'radio_national',
  radio_regional: 'radio_regional',
  radio_local: 'radio_local',
  tv: 'tv_national',
  tv_national: 'tv_national',
  tv_regional: 'tv_regional',
  tv_local: 'tv_local',
  social: 'social_media',
  socials: 'social_media',
  social_media: 'social_media',
  cinema: 'cinema',
  pos: 'pos',
};

export const DEFAULT_COMMERCIAL_MEDIA_CODE = 'online';

export const normalizeCommercialMediaCode = (
  rawCode: string | null | undefined
): string | null => {
  const normalized = String(rawCode || '').toLowerCase().trim();
  if (!normalized) return null;
  return COMMERCIAL_MEDIA_ALIAS_MAP[normalized] || null;
};

export const sanitizeCommercialDetailMap = (
  detailMap: Record<string, number> | undefined,
  mediaCodes: string[],
  fallbackValue: number
): Record<string, number> => {
  const sanitized: Record<string, number> = {};

  mediaCodes.forEach((mediaCode) => {
    const value = detailMap?.[mediaCode];
    sanitized[mediaCode] =
      typeof value === 'number' && Number.isFinite(value) && value > 0
        ? value
        : fallbackValue;
  });

  return sanitized;
};
