const ALLOWED_PROXY_PREFIXES = [
  '/assets/',
  '/wp-content/',
  '/api/',
  'api/',
  'agency/',
  'active/',
  'common/',
  'studio/',
  'visuals/',
  'reviews/',
  'voicecards/',
  'portfolio/',
  'artists/',
  'ademing/',
];

const SUPABASE_REDIRECT_PREFIXES = [
  'agency/',
  'active/',
  'common/',
  'studio/',
  'ademing/',
  'portfolio/',
  'artists/',
  'visuals/',
  'reviews/',
  'voicecards/',
];

export function isAllowedProxyPath(cleanPath: string, storageBaseUrl: string): boolean {
  const storageHost = storageBaseUrl.replace('https://', '');
  return (
    ALLOWED_PROXY_PREFIXES.some((prefix) => cleanPath.startsWith(prefix)) ||
    cleanPath.includes(storageHost) ||
    cleanPath.includes('googleusercontent.com') ||
    cleanPath.endsWith('.mp3') ||
    cleanPath.endsWith('.wav')
  );
}

export function shouldUseSupabaseStorage(cleanPath: string, storageBaseUrl: string): boolean {
  const storageApiBase = storageBaseUrl.replace('/object/public/voices', '');
  return (
    SUPABASE_REDIRECT_PREFIXES.some((prefix) => cleanPath.startsWith(prefix)) ||
    cleanPath.startsWith(storageApiBase) ||
    cleanPath.includes('googleusercontent.com') ||
    cleanPath.startsWith('voices/')
  );
}
