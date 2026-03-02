import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * NUCLEAR ASSET PROXY - 2026 EDITION
 * 
 * Doel: Omzeilen van de Next.js interceptie op de hoofdsite door assets 
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
    let isSupabaseUrl = cleanPath.includes('supabase.co/storage/v1/object/public/voices/');
    
    // 🛡️ CHRIS-PROTOCOL: Forensic double-proxy strip (v2.14.408)
    // If the path already contains /api/proxy/, strip it to get the raw path.
    if (cleanPath.includes('/api/proxy/')) {
      console.log(`[Proxy Forensic] Stripping nested proxy prefix from: ${cleanPath}`);
      // Handle both ?path= and just /api/proxy/
      if (cleanPath.includes('?path=')) {
        cleanPath = decodeURIComponent(cleanPath.split('?path=')[1]);
      } else {
        cleanPath = cleanPath.split('/api/proxy/')[1];
      }
      
      // If it's still a proxied URL (triple encoding), keep stripping until we get a raw path
      while (cleanPath.includes('/api/proxy/')) {
        if (cleanPath.includes('?path=')) {
          cleanPath = decodeURIComponent(cleanPath.split('?path=')[1]);
        } else {
          cleanPath = cleanPath.split('/api/proxy/')[1];
        }
      }
      isSupabaseUrl = cleanPath.includes('supabase.co/storage/v1/object/public/voices/');
    }
    
    if (cleanPath.startsWith('http') && !isSupabaseUrl) {
      try {
        const url = new URL(cleanPath);
        // Als het van onze eigen domein komt, haal dan het pad eruit
        // 🛡️ CHRIS-PROTOCOL: Use MarketManager for domain checks
        const { MarketManagerServer } = require('@/lib/system/core/market-manager');
        const currentMarket = MarketManagerServer.getCurrentMarket();
        const marketDomains = Object.values(MarketManagerServer.getMarketDomains());

        if (marketDomains.some(d => url.hostname.includes(d.replace('https://', ''))) || url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname.includes('vercel.app')) {
          cleanPath = url.pathname + url.search;
        }
      } catch (e) {
        // Geen geldige URL, ga door met originele pad
      }
    }

    //  ASSET MANDATE 2026: Alle assets MOETEN in /assets/ staan.
    // We staan /wp-content/ tijdelijk nog toe voor legacy fallbacks, 
    // maar de proxy logt dit als een waarschuwing.
    const { MarketManagerServer } = require('@/lib/system/core/market-manager');
    const marketDomains = Object.values(MarketManagerServer.getMarketDomains());
    
    marketDomains.forEach(d => {
      const domain = d.replace('https://', '').replace('www.', '');
      const regex = new RegExp(`https?:\/\/(www\.)?${domain.replace('.', '\\.')}`, 'g');
      cleanPath = cleanPath.replace(regex, '');
    });

    //  ALLOWED PATHS: /assets/, /wp-content/, or Supabase agency/ and active/ paths
    const isAllowed = 
      cleanPath.startsWith('/assets/') || 
      cleanPath.startsWith('/wp-content/') || 
      cleanPath.startsWith('/api/') ||
      cleanPath.startsWith('api/') ||
      cleanPath.startsWith('agency/') || 
      cleanPath.startsWith('active/') ||
      cleanPath.startsWith('common/') || 
      cleanPath.startsWith('studio/') || 
      cleanPath.startsWith('visuals/') ||
      cleanPath.startsWith('reviews/') ||
      cleanPath.startsWith('portfolio/') ||
      cleanPath.startsWith('artists/') ||
      cleanPath.startsWith('ademing/') ||
      cleanPath.includes('supabase.co/storage/v1/object/public/voices/') ||
      cleanPath.includes('googleusercontent.com') ||
      cleanPath.endsWith('.mp3') ||
      cleanPath.endsWith('.wav');

    if (!isAllowed) {
      throw new Error('Forbidden asset path: ' + cleanPath);
    }

    // De backend URL (Combell PHP server of Supabase Storage)
    const { MarketManagerServer: MarketManagerInstance } = require('@/lib/system/core/market-manager');
    const requestHost = request.headers.get('host') || MarketManagerInstance.getCurrentMarket().market_code.toLowerCase() + '.be';
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    let BACKEND_URL = process.env.BACKEND_URL || `${protocol}://${requestHost}`; 
    
    //  DEV-MODE FIX: Als we lokaal draaien en het pad begint met /assets/, fetch dan van localhost
    if (process.env.NODE_ENV === 'development' && cleanPath.startsWith('/assets/')) {
      BACKEND_URL = `${protocol}://${requestHost}`;
    }

    let normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

    //  SUPABASE & GOOGLE STORAGE REDIRECT: Als het pad begint met 'agency/', 'active/', 'common/', 'studio/', 'ademing/', 'portfolio/', 'artists/', 'visuals/' of 'reviews/', fetch het dan van Supabase Storage
    if (cleanPath.startsWith('agency/') || cleanPath.startsWith('active/') || cleanPath.startsWith('common/') || cleanPath.startsWith('studio/') || cleanPath.startsWith('ademing/') || cleanPath.startsWith('portfolio/') || cleanPath.startsWith('artists/') || cleanPath.startsWith('visuals/') || cleanPath.startsWith('reviews/') || cleanPath.startsWith('https://vcbxyyjsxuquytcsskpj.supabase.co') || cleanPath.includes('googleusercontent.com') || cleanPath.startsWith('voices/')) {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcbxyyjsxuquytcsskpj.supabase.co';
      const SUPABASE_STORAGE_URL = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1`;
      
      //  FIX: Zorg dat er geen dubbele slashes ontstaan en encodeer het pad segment per segment
      let storagePath = cleanPath;
      
      // If it's a Google URL, fetch it directly
      if (cleanPath.includes('googleusercontent.com')) {
        const response = await fetch(cleanPath, {
          headers: { 
            'User-Agent': 'Voices-Asset-Proxy/1.0',
            'Cache-Control': 'no-cache'
          },
          next: { revalidate: 3600 }
        });
        
        if (!response.ok) return null;
        const blob = await response.blob();
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        return { blob, contentType, source: 'Google-User-Content' };
      }

      if (storagePath.startsWith('https://')) {
        // Extract path after /public/voices/ or /public/
        const match = storagePath.match(/\/public\/(?:voices\/)?(.*)/);
        if (match) storagePath = match[1];
      }

      // 🛡️ CHRIS-PROTOCOL: Strip 'voices/' prefix if it's already there to prevent double prefixing
      if (storagePath.startsWith('voices/')) {
        storagePath = storagePath.replace('voices/', '');
      }

      // 🛡️ CHRIS-PROTOCOL: Forensic strip for direct Supabase URLs that leaked into the path
      if (storagePath.includes('supabase.co/storage/v1/object/public/voices/')) {
        storagePath = storagePath.split('supabase.co/storage/v1/object/public/voices/')[1];
      }

      const pathSegments = storagePath.split('/').filter(Boolean).map(segment => {
        if (segment.includes('%')) return segment; // Al encoded
        return encodeURIComponent(segment);
      });
      
      //  CHRIS-PROTOCOL: Forensische fix voor dubbele taal-segments (bijv. nl/nl/)
      // Sommige legacy paths in de DB hebben per ongeluk dubbele segments.
      let finalSegments = pathSegments;
      if (pathSegments[0] === 'agency' && pathSegments[1] === 'voices') {
        // Check voor patronen als agency/voices/nl/nl/
        if (pathSegments[2] === pathSegments[3] && pathSegments[2].length === 2) {
          console.log(`[Proxy Fix] Removing duplicate language segment: ${pathSegments[2]}`);
          finalSegments = [pathSegments[0], pathSegments[1], pathSegments[2], ...pathSegments.slice(4)];
        }
      }

      const isImage = !!cleanPath.match(/\.(jpg|jpeg|png|webp|gif)$/i);
      const isAlreadyWebP = cleanPath.toLowerCase().endsWith('.webp');

      //  CHRIS-PROTOCOL: Smart WebP Transformation with Fallback
      // If it's already a WebP, we fetch raw to avoid redundant transformation latency.
      // If it's NOT an image (e.g. .mp3), we MUST fetch raw from the object storage.
      const optimizedUrl = (isAlreadyWebP || !isImage)
        ? `${SUPABASE_STORAGE_URL}/object/public/voices/${finalSegments.join('/')}`
        : `${SUPABASE_STORAGE_URL}/render/image/public/voices/${finalSegments.join('/')}?width=1080&format=webp&quality=75`;
      
      const rawUrl = `${SUPABASE_STORAGE_URL}/object/public/voices/${finalSegments.join('/')}`;
      
      let response = await fetch(optimizedUrl, {
        headers: {
          'User-Agent': 'Voices-Asset-Proxy/1.0',
          'Cache-Control': 'no-cache'
        },
        next: { revalidate: 0 }
      });

      //  CHRIS-PROTOCOL: Fallback to Raw if Optimization fails (e.g. new uploads not yet in CDN)
      if (!response.ok && isImage && !isAlreadyWebP) {
        console.log(`[Proxy Fallback] Optimization failed, fetching raw: ${rawUrl}`);
        response = await fetch(rawUrl, {
          headers: {
            'User-Agent': 'Voices-Asset-Proxy/1.0',
            'Cache-Control': 'no-cache'
          },
          next: { revalidate: 0 }
        });
      }

      if (!response.ok) {
        console.error(`[Proxy Supabase Error] Failed to fetch ${rawUrl}: ${response.status} ${response.statusText}`);
        return null;
      }

      const blob = await response.blob();
      const contentType = response.headers.get('content-type') || 'application/octet-stream';

      return { blob, contentType, source: response.url.includes('render/image') ? 'Voices-Core-2026-Supabase-Optimized' : 'Voices-Core-2026-Supabase' };
    }

    //  CHRIS-PROTOCOL: Smart WebP Transformation for Combell/Legacy Assets
    const isImage = !!cleanPath.match(/\.(jpg|jpeg|png)$/i);
    const isAlreadyWebP = cleanPath.toLowerCase().endsWith('.webp');
    
    if (isImage && !isAlreadyWebP) {
      // We could potentially use a service here, but for now we just log it
      // and ensure the Next.js Image component handles the format conversion.
      console.log(`[Proxy] Legacy image detected: ${cleanPath}. Relying on Next.js Image component for WebP conversion.`);
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
      console.log(`[Proxy 404] Asset not found: ${assetPath}`);
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
