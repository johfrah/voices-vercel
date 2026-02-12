import { StudioDataBridge } from '@/lib/studio-bridge';
import { NextResponse } from 'next/server';

/**
 * ⚡ NUCLEAR STUDIO DASHBOARD API (2026)
 * 
 * Doel: Native Node.js/TypeScript service met Drizzle ORM.
 * Vrij van legacy-bridge of legacyApiBaseUrl.
 * 
 * @protocol FULL NUCLEAR
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get('tab') || 'funnel';

  try {
    // 🚀 NUCLEAR DATA: Direct uit Supabase via StudioDataBridge
    const data = await StudioDataBridge.getDashboardData(tab);

    return NextResponse.json({
      ...data,
      _llm_context: {
        experience_layer: 'nextjs',
        protocol: 'VOICES-OS-2026',
        status: 'FULL-NUCLEAR',
        timestamp: new Date().toISOString()
      },
      _atomic_mapping: {
        journey: 'studio',
        persona: 'partner',
        intent: 'management'
      }
    });
  } catch (error) {
    console.error('[Studio Dashboard Error]:', error);
    return NextResponse.json({ 
      error: 'Studio service failure',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
