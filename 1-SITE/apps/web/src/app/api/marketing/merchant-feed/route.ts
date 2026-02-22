import { NextResponse } from 'next/server';
import { db } from "@db";
import { actors, workshops, courses } from "@db/schema";
import { eq, and, asc } from "drizzle-orm";

/**
 * GOOGLE MERCHANT CENTER FEED (NUCLEAR 2026)
 * 
 * Doel: Genereert een XML feed voor Google Merchant Center.
 * Voldoet aan: IAP (Intelligent Architecture Protocol) & Chris-Protocol.
 * 
 * Inclusief:
 * - Stemacteurs (als diensten/producten)
 * - Workshops (Studio Journey)
 * - Online Cursussen (Academy Journey)
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return new NextResponse('Skipping merchant feed during build', { status: 200 });
  }

  try {
    const { MarketManagerServer: MarketManager } = await import('@/lib/system/market-manager-server');
    const host = process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || 'www.voices.be';
    const market = MarketManager.getCurrentMarket(host);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.voices.be';

    // 1. Haal alle data op in parallel
    const [allActors, allWorkshops, allCourses] = await Promise.all([
      db.query.actors.findMany({
        where: eq(actors.status, 'live'),
        with: {
          actorLanguages: { with: { language: true } },
          actorTones: { with: { tone: true } }
        }
      }),
      db.query.workshops.findMany({
        where: eq(workshops.status, 'upcoming')
      }),
      db.query.courses.findMany()
    ]);

    // 2. Bouw de XML
    let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${market.name} - Google Merchant Feed</title>
    <link>${baseUrl}</link>
    <description>De stemmen van ${market.name} - Stemacteurs, Workshops en Cursussen</description>`;

    // --- STEMACTEURS ---
    allActors.forEach(actor => {
      const nativeLang = actor.actorLanguages?.find(al => al.isNative)?.language?.label || actor.nativeLang;
      const tones = actor.actorTones?.map(at => at.tone?.label).join(', ');
      const title = `Stemacteur: ${actor.firstName} (${nativeLang})`;
      const description = actor.tagline || actor.bio || `Professionele stemacteur voor al uw projecten.`;
      
      xml += `
    <item>
      <g:id>actor_${actor.id}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${baseUrl}/voice/${actor.slug}</g:link>
      <g:image_link>${actor.photoId ? `${baseUrl}/api/proxy?path=media/${actor.photoId}` : ''}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>${actor.priceUnpaid || '0'} EUR</g:price>
      <g:google_product_category>Diensten > Media-ontwerp en -productie</g:google_product_category>
      <g:custom_label_0>Voice Actor</g:custom_label_0>
      <g:custom_label_1>${escapeXml(nativeLang)}</g:custom_label_1>
      <g:custom_label_2>${escapeXml(tones)}</g:custom_label_2>
    </item>`;
    });

    // --- WORKSHOPS ---
    allWorkshops.forEach(ws => {
      xml += `
    <item>
      <g:id>workshop_${ws.id}</g:id>
      <g:title>${escapeXml(ws.title)}</g:title>
      <g:description>${escapeXml(ws.description || 'Voices Studio Workshop')}</g:description>
      <g:link>${baseUrl}/studio/${ws.slug}</g:link>
      <g:image_link>${ws.mediaId ? `${baseUrl}/api/proxy?path=media/${ws.mediaId}` : ''}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>${ws.price || '0'} EUR</g:price>
      <g:google_product_category>Onderwijs > Workshops</g:google_product_category>
      <g:custom_label_0>Workshop</g:custom_label_0>
    </item>`;
    });

    // --- COURSES ---
    allCourses.forEach(course => {
      xml += `
    <item>
      <g:id>course_${course.id}</g:id>
      <g:title>${escapeXml(course.title)}</g:title>
      <g:description>${escapeXml(course.description || 'Voices Academy Online Course')}</g:description>
      <g:link>${baseUrl}/academy/${course.slug}</g:link>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>0 EUR</g:price>
      <g:google_product_category>Onderwijs > Online cursus</g:google_product_category>
      <g:custom_label_0>Academy Course</g:custom_label_0>
    </item>`;
    });

    xml += `
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59'
      }
    });
  } catch (error) {
    console.error('[MERCHANT FEED ERROR]:', error);
    return NextResponse.json({ error: 'Failed to generate feed' }, { status: 500 });
  }
}

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
      default: return c;
    }
  });
}
