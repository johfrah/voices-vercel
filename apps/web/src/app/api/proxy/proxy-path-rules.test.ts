import { describe, expect, it } from 'vitest';
import { isAllowedProxyPath, shouldUseSupabaseStorage } from './proxy-path-rules';

const STORAGE_BASE_URL = 'https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices';

describe('proxy-path-rules', () => {
  it('allows voicecards paths in proxy whitelist', () => {
    expect(isAllowedProxyPath('voicecards/nl-be/actor-123.webp', STORAGE_BASE_URL)).toBe(true);
  });

  it('routes voicecards paths to Supabase storage branch', () => {
    expect(shouldUseSupabaseStorage('voicecards/nl-be/actor-123.webp', STORAGE_BASE_URL)).toBe(true);
  });

  it('keeps unknown path prefixes blocked', () => {
    expect(isAllowedProxyPath('private/secrets/document.pdf', STORAGE_BASE_URL)).toBe(false);
  });

  it('keeps direct storage gateway URLs routable', () => {
    expect(
      shouldUseSupabaseStorage(
        'https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/voicecards/nl-be/actor-123.webp',
        STORAGE_BASE_URL,
      ),
    ).toBe(true);
  });
});
