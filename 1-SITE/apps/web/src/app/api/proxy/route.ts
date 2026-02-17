import { NextRequest, NextResponse } from 'next/server';

/**
 * NUCLEAR ASSET PROXY - 2026 EDITION
 * 
 * Doel: Omzeilen van de Next.js interceptie op www.voices.be door assets 
 * direct van de Combell backend (PHP layer) of Supabase Storage te fetchen.
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const assetPath = searchParams.get('path');
  const fallbackPath = searchParams.get('fallback');
  console.log(`[Proxy] Request received for path: ${assetPath}${fallbackPath ? ` (fallback: ${fallbackPath})` : ''}`);

  if (!assetPath) {
    return new NextResponse('Missing asset path', { status: 400 });
  }

  const fetchAsset = async (path: string) => {
    // Beveiliging: Alleen lokale assets toestaan (WordPress-vrij)
    let cleanPath = path;
    
    //  FIX: Als het pad al een volledige Supabase URL is, haal dan alleen het pad deel eruit
    // MAAR: Behoud de volledige URL voor Supabase Storage direct fetch
    const isSupabaseUrl = cleanPath.includes('supabase.co/storage/v1/object/public/voices/');
    
    if (cleanPath.startsWith('http') && !isSupabaseUrl) {
      try {
        const url = new URL(cleanPath);
        // Als het van onze eigen domein komt, haal dan het pad eruit
        if (url.hostname === 'www.voices.be' || url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname.includes('vercel.app')) {
          cleanPath = url.pathname + url.search;
        }
      } catch (e) {
        // Geen geldige URL, ga door met originele pad
      }
    }

    //  ASSET MANDATE 2026: Alle assets MOETEN in /assets/ staan.
    // We staan /wp-content/ tijdelijk nog toe voor legacy fallbacks, 
    // maar de proxy logt dit als een waarschuwing.
    if (cleanPath.startsWith('https://www.voices.be')) {
      cleanPath = cleanPath.replace('https://www.voices.be', '');
    }

    //  ALLOWED PATHS: /assets/, /wp-content/, or Supabase agency/ and active/ paths
    const isAllowed = 
      cleanPath.startsWith('/assets/') || 
      cleanPath.startsWith('/wp-content/') || 
      cleanPath.startsWith('agency/') || 
      cleanPath.startsWith('active/') ||
      cleanPath.startsWith('common/') || 
      cleanPath.startsWith('studio/') || 
      cleanPath.includes('supabase.co/storage/v1/object/public/voices/') ||
      cleanPath.endsWith('.mp3') ||
      cleanPath.endsWith('.wav');

    if (!isAllowed) {
      throw new Error('Forbidden asset path: ' + cleanPath);
    }

    // De backend URL (Combell PHP server of Supabase Storage)
    let BACKEND_URL = process.env.BACKEND_URL || 'https://www.voices.be'; 
    
    //  DEV-MODE FIX: Als we lokaal draaien en het pad begint met /assets/, fetch dan van localhost
    if (process.env.NODE_ENV === 'development' && cleanPath.startsWith('/assets/')) {
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      const host = request.headers.get('host') || 'localhost:3000';
      BACKEND_URL = `${protocol}://${host}`;
    }

    let normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

    //  SUPABASE STORAGE REDIRECT: Als het pad begint met 'agency/', 'active/', 'common/' of 'studio/', fetch het dan van Supabase Storage
    if (cleanPath.startsWith('agency/') || cleanPath.startsWith('active/') || cleanPath.startsWith('common/') || cleanPath.startsWith('studio/')) {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcbxyyjsxuquytcsskpj.supabase.co';
      const SUPABASE_STORAGE_URL = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/voices`;
      
      //  FIX: Zorg dat er geen dubbele slashes ontstaan en encodeer het pad segment per segment
      // Alleen encoderen als het nog niet encoded is (check voor % in segmenten)
      const pathSegments = cleanPath.split('/').map(segment => {
        if (segment.includes('%')) return segment; // Al encoded
        return encodeURIComponent(segment);
      });
      const targetUrl = `${SUPABASE_STORAGE_URL}/${pathSegments.join('/')}`;
      
      console.log(`[Proxy Supabase] Fetching: ${targetUrl}`);

      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Voices-Asset-Proxy/1.0',
          'Cache-Control': 'no-cache'
        },
        next: { revalidate: 0 }
      });

      if (!response.ok) {
        console.error(`[Proxy Supabase Error] Failed to fetch ${targetUrl}: ${response.status} ${response.statusText}`);
        return null;
      }

      const blob = await response.blob();
      const contentType = response.headers.get('content-type') || 'application/octet-stream';

      return { blob, contentType, source: 'Voices-Core-2026-Supabase' };
    }

    //  FIX: Als het pad al een volledige Supabase URL is, fetch deze dan direct
    if (cleanPath.includes('supabase.co/storage/v1/object/public/voices/')) {
      console.log(`[Proxy Direct] Supabase URL detected: ${cleanPath}`);
      const url = new URL(cleanPath);
      const response = await fetch(url.toString(), {
        headers: { 
          'User-Agent': 'Voices-Asset-Proxy/1.0',
          'Cache-Control': 'no-cache'
        },
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        console.error(`[Proxy Direct Error] Supabase fetch failed: ${response.status} ${response.statusText}`);
        return null;
      }

      const blob = await response.blob();
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      
      return { blob, contentType, source: 'Voices-Core-2026-Direct' };
    }

    const targetUrl = `${BACKEND_URL}${normalizedPath}`;
    console.log(`[Proxy] Fetching: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Voices-Asset-Proxy/1.0',
      },
      next: { revalidate: 3600 } 
    });

    if (!response.ok) {
      console.error(`[Proxy Error] Failed to fetch ${targetUrl}: ${response.statusText}`);
      return null;
    }

    const blob = await response.blob();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    return { blob, contentType, source: 'Voices-Core-2026' };
  };

  try {
    let result = await fetchAsset(assetPath);
    
    //  CHRIS-PROTOCOL: Smart Fallback if primary path fails
    if (!result && fallbackPath) {
      console.log(`[Proxy Fallback] Primary failed, trying fallback: ${fallbackPath}`);
      result = await fetchAsset(fallbackPath);
    }

    if (!result) {
      //  SELF-HEALING: Rapporteer kapotte asset (HITL)
      try {
        const { SelfHealingService } = await import('@/lib/system/self-healing-service');
        await SelfHealingService.reportBrokenAsset(assetPath, request.headers.get('referer') || 'direct');
      } catch (e) {
        // Ignore self-healing errors
      }
      
      return new NextResponse(null, { status: 404, statusText: 'Asset not found' });
    }

    return new NextResponse(result.blob, {
      headers: {
        'Content-Type': result.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Voices-Proxy': result.source,
      },
    });
  } catch (error: any) {
    console.error('[Proxy Critical Error]:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: error.message?.includes('Forbidden') ? 403 : 500 });
  }
}
