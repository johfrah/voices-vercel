interface WatchdogNoiseInput {
  error?: string;
  stack?: string;
  component?: string;
  details?: Record<string, unknown>;
}

function toSafeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function serializeArgs(args: unknown): string {
  if (!Array.isArray(args)) return '';
  return args
    .map((entry) => {
      if (typeof entry === 'string') return entry;
      if (!entry || typeof entry !== 'object') return '';
      const candidate = entry as Record<string, unknown>;
      return [toSafeString(candidate.name), toSafeString(candidate.message), toSafeString(candidate.stack)]
        .filter(Boolean)
        .join(' ');
    })
    .join(' ');
}

function serializeBreadcrumbs(breadcrumbs: unknown): string {
  if (!Array.isArray(breadcrumbs)) return '';
  return breadcrumbs
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return '';
      const candidate = entry as Record<string, unknown>;
      return [toSafeString(candidate.type), toSafeString(candidate.message)].filter(Boolean).join(' ');
    })
    .join(' ');
}

export function isExpectedBrowserNetworkNoise({
  error,
  stack,
  component,
  details
}: WatchdogNoiseInput): boolean {
  const source = toSafeString(component).toLowerCase();
  const eventDetails = details ?? {};
  const looksLikeBrowserEvent =
    source.includes('browser') ||
    source.includes('client') ||
    Boolean(eventDetails.userAgent) ||
    Boolean(eventDetails.location) ||
    Boolean(eventDetails.pathname);

  if (!looksLikeBrowserEvent) {
    return false;
  }

  const fingerprint = [
    toSafeString(error),
    toSafeString(stack),
    toSafeString(eventDetails.full_console_output),
    toSafeString(eventDetails.stack),
    serializeArgs(eventDetails.args),
    serializeBreadcrumbs(eventDetails.breadcrumbs)
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const networkSignals = [
    'typeerror: network error',
    'network error',
    'failed to fetch',
    'load failed',
    'networkerror when attempting to fetch resource',
    'the internet connection appears to be offline',
    'aborterror'
  ];

  const hasNetworkSignal = networkSignals.some((signal) => fingerprint.includes(signal));
  const hasFetchTrail =
    fingerprint.includes(' fetch ') ||
    fingerprint.startsWith('fetch ') ||
    fingerprint.includes(' /api/') ||
    fingerprint.includes(' https://');

  return hasNetworkSignal && hasFetchTrail;
}
