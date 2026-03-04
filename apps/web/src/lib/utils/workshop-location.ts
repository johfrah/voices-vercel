type WorkshopLocationParts = {
  fallback: string | null;
  name: string | null;
  address: string | null;
  city: string | null;
  zip: string | null;
  country: string | null;
};

const toCleanString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const getRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
};

const uniqParts = (parts: string[]): string[] => {
  return parts.filter((part, index, arr) => {
    const normalized = part.toLowerCase();
    return arr.findIndex((entry) => entry.toLowerCase() === normalized) === index;
  });
};

const extractLocationParts = (source: unknown): WorkshopLocationParts => {
  if (typeof source === 'string') {
    return {
      fallback: toCleanString(source),
      name: null,
      address: null,
      city: null,
      zip: null,
      country: null
    };
  }

  const record = getRecord(source);
  if (!record) {
    return {
      fallback: null,
      name: null,
      address: null,
      city: null,
      zip: null,
      country: null
    };
  }

  const nestedLocation = getRecord(record.location);

  const fallback =
    toCleanString(record.location_full) ||
    toCleanString(record.location_label) ||
    toCleanString(record.location) ||
    toCleanString(record.fallback);

  const name =
    toCleanString(record.location_name) ||
    toCleanString(record.name) ||
    toCleanString(nestedLocation?.name);

  const address =
    toCleanString(record.location_address) ||
    toCleanString(record.address) ||
    toCleanString(nestedLocation?.address);

  const city =
    toCleanString(record.location_city) ||
    toCleanString(record.city) ||
    toCleanString(nestedLocation?.city);

  const zip =
    toCleanString(record.location_zip) ||
    toCleanString(record.location_postal_code) ||
    toCleanString(record.zip) ||
    toCleanString(record.postal_code) ||
    toCleanString(nestedLocation?.zip) ||
    toCleanString(nestedLocation?.postal_code);

  const country =
    toCleanString(record.location_country) ||
    toCleanString(record.country) ||
    toCleanString(nestedLocation?.country);

  return { fallback, name, address, city, zip, country };
};

export const formatWorkshopLocationLabel = (source: unknown): string | null => {
  const parts = extractLocationParts(source);
  const zipCity = [parts.zip, parts.city].filter((value): value is string => !!value).join(' ');
  const composed = uniqParts(
    [parts.name, parts.address, zipCity, parts.country].filter((value): value is string => !!value)
  );

  if (composed.length > 0) return composed.join(', ');
  return parts.fallback;
};

export const buildWorkshopLocationPayload = (
  source: unknown
): {
  location: string | null;
  location_full: string | null;
  location_name: string | null;
  location_address: string | null;
  location_city: string | null;
  location_zip: string | null;
  location_country: string | null;
} => {
  const parts = extractLocationParts(source);
  const locationLabel = formatWorkshopLocationLabel(source);

  return {
    location: locationLabel,
    location_full: locationLabel,
    location_name: parts.name,
    location_address: parts.address,
    location_city: parts.city,
    location_zip: parts.zip,
    location_country: parts.country
  };
};
