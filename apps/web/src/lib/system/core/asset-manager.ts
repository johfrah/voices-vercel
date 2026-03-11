import { createClient } from '@supabase/supabase-js';

/**
 * 🧬 ID-FIRST ASSET MANAGER (2026)
 * 
 * Doel: De Handshake herstellen tussen Database en Browser.
 * Dit is de enige plek die weet hoe een media_id of demo_id 
 * wordt omgezet naar een robuuste, geproxiede URL.
 */
export class AssetManager {
  private static supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  /**
   * 🛡️ CHRIS-PROTOCOL: Resolve Media URL (v3.0.0)
   * Zet een media_id of ruwe URL om naar een veilige proxy-URL.
   */
  public static async resolveMediaUrl(params: {
    mediaId?: number | null;
    demoId?: number | null;
    fallbackUrl?: string;
    baseUrl?: string;
  }): Promise<string> {
    const { mediaId, demoId, fallbackUrl, baseUrl = '' } = params;

    // 1. ID-First: Als we een mediaId hebben, is dat de gouden bron
    if (mediaId) {
      const proxyUrl = new URL('/api/proxy', baseUrl || 'https://www.voices.be');
      proxyUrl.searchParams.set('media_id', mediaId.toString());
      return proxyUrl.toString();
    }

    // 2. Demo-First Handshake: Als we een demoId hebben, gebruiken we de stream route
    if (demoId) {
      const streamUrl = new URL(`/api/admin/actors/demos/${demoId}/stream`, baseUrl || 'https://www.voices.be');
      return streamUrl.toString();
    }

    // 3. Legacy Fallback: Als we alleen een URL hebben, gebruiken we de path-gebaseerde proxy
    if (fallbackUrl) {
      const proxyUrl = new URL('/api/proxy', baseUrl || 'https://www.voices.be');
      proxyUrl.searchParams.set('path', fallbackUrl);
      return proxyUrl.toString();
    }

    return '';
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: Get Media Metadata (v3.0.0)
   * Haalt metadata op direct uit de media tabel voor de proxy.
   */
  public static async getMediaMetadata(mediaId: number) {
    const { data, error } = await this.supabase
      .from('media')
      .select('file_path, file_type')
      .eq('id', mediaId)
      // SECURITY: public proxy may never resolve private media rows.
      .eq('is_public', true)
      .single();

    if (error || !data) return null;

    return {
      filePath: data.file_path,
      fileType: data.file_type
    };
  }
}
