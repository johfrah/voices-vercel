import { NextRequest, NextResponse } from 'next/server';
import { SlimmeKassa } from '@/lib/pricing-engine';

/**
 *  TOKEN GENERATOR & RESOLVER (2026)
 *  Doel: Maakt korte tokens voor script-persistence in de URL.
 */

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // In een echte productie-omgeving zouden we dit in een Redis of DB opslaan.
    // Voor nu gebruiken we een Base64 encoding van de essentiële data als 'token'.
    // BOB-METHODE: We houden het simpel en robuust.
    
    const payload = JSON.stringify({
      b: data.briefing,
      u: data.usage,
      m: data.media,
      c: data.country,
      s: data.spots,
      y: data.years,
      ts: Date.now()
    });
    
    const token = Buffer.from(payload).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('t');
  if (!token) return NextResponse.json({ error: 'No token provided' }, { status: 400 });

  try {
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
    
    return NextResponse.json({
      briefing: payload.b,
      usage: payload.u,
      media: payload.m,
      country: payload.c,
      spots: payload.s,
      years: payload.y
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }
}
