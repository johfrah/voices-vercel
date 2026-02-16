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

  if (!assetPath) {
    return new NextResponse('Missing asset path', { status: 400 });
  }

  // Beveiliging: Alleen lokale assets toestaan (WordPress-vrij)
  let cleanPath = assetPath;
  
  // 🛡️ FIX: Als het een volledige URL is, haal dan alleen het pad deel eruit
  if (cleanPath.startsWith('http')) {
    try {
      const url = new URL(cleanPath);
      cleanPath = url.pathname + url.search;
    } catch (e) {
      // Geen geldige URL, ga door met originele pad
    }
  }

  // 🛡️ ASSET MANDATE 2026: Alle assets MOETEN in /assets/ staan.
  // We staan /wp-content/ tijdelijk nog toe voor legacy fallbacks, 
  // maar de proxy logt dit als een waarschuwing.
  if (cleanPath.startsWith('https://www.voices.be')) {
    cleanPath = cleanPath.replace('https://www.voices.be', '');
  }

  // 🛡️ ALLOWED PATHS: /assets/, /wp-content/, or Supabase agency/ and active/ paths
  const isAllowed = 
    cleanPath.startsWith('/assets/') || 
    cleanPath.startsWith('/wp-content/') || 
    cleanPath.startsWith('agency/') || 
    cleanPath.startsWith('active/') ||
    cleanPath.endsWith('.mp3') ||
    cleanPath.endsWith('.wav');

  if (!isAllowed) {
    return new NextResponse('Forbidden asset path: ' + cleanPath, { status: 403 });
  }

  // De backend URL (Combell PHP server of Supabase Storage)
  let BACKEND_URL = process.env.BACKEND_URL || 'https://www.voices.be'; 
  let normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  // 🛡️ SUPABASE STORAGE REDIRECT: Als het pad begint met 'agency/' of 'active/', fetch het dan van Supabase Storage
  if (cleanPath.startsWith('agency/') || cleanPath.startsWith('active/')) {
    const SUPABASE_STORAGE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/voices`;
    BACKEND_URL = SUPABASE_STORAGE_URL;
    // Bij Supabase Storage hebben we de leidende slash NIET nodig in de URL na de base
    normalizedPath = `/${cleanPath}`; 
  }

  try {
    const targetUrl = `${BACKEND_URL}${normalizedPath}`;
    console.log(`[Proxy] Fetching: ${targetUrl}`);

    // Fetch het bestand van de backend
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Voices-Asset-Proxy/1.0',
      },
      // Cache de response voor betere performance
      next: { revalidate: 3600 } 
    });

    if (!response.ok) {
      console.error(`[Proxy Error] Failed to fetch ${targetUrl}: ${response.statusText}`);
      
      // 🩹 SELF-HEALING: Rapporteer kapotte asset (HITL)
      const { SelfHealingService } = await import('@/lib/system/self-healing-service');
      await SelfHealingService.reportBrokenAsset(normalizedPath, request.headers.get('referer') || 'direct');
      
      return new NextResponse(`Asset not found: ${response.status}`, { status: 404 });
    }

    // Haal de data en content-type op
    const blob = await response.blob();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    // Stuur het bestand terug naar de browser
    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Voices-Proxy': 'Voices-Core-2026',
      },
    });
  } catch (error) {
    console.error('[Proxy Critical Error]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
