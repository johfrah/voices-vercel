import { db } from '@/lib/system/voices-config';
import { systemEvents } from '@/lib/system/voices-config';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';
import { triggerWorkflow } from '@/lib/services/github-api';

/**
 *  API: SYSTEM REPAIR (AI-HEALER 2026)
 * 
 * Doel: Wordt aangeroepen vanuit de "One-Click Repair" mail.
 * Analyseert de fout uit de database en stuurt een signaal naar de 
 * AI-agent (Cursor/GitHub Actions) om de broncode te patchen.
 */

export const dynamic = 'force-dynamic';
const AUTO_HEAL_WORKFLOW_ID = process.env.AUTO_HEAL_WORKFLOW_ID || 'bob-concert.yml';
const AUTO_HEAL_AGENT = process.env.AUTO_HEAL_AGENT || 'bob';

export async function GET(request: NextRequest) {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, message: 'Skipping repair during build' });
  }

  // 🛡️ CHRIS-PROTOCOL: Veiligheid eerst. Alleen admins mogen repareren.
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) {
    // Als niet ingelogd, redirect naar login met return URL
    const { MarketManagerServer: MarketManager } = require('@/lib/system/core/market-manager');
    const host = request.headers.get('host') || (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || MarketManager.getMarketDomains()['BE']?.replace('https://', ''));
    const market = MarketManager.getCurrentMarket(host);
    const siteUrl = MarketManager.getMarketDomains()[market.market_code] || `https://${MarketManager.getMarketDomains()['BE']?.replace('https://', '') || 'www.voices.be'}`;
    
    const loginUrl = new URL('/account', siteUrl);
    loginUrl.searchParams.set('returnTo', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  const eventId = request.nextUrl.searchParams.get('eventId');
  if (!eventId) {
    return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
  }

  try {
    // 1. Haal de foutdetails op
    const [event] = await db.select().from(systemEvents).where(eq(systemEvents.id, parseInt(eventId))).limit(1);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // 2. Log de start van de reparatie
    await db.insert(systemEvents).values({
      level: 'info',
      source: 'AI-Healer',
      message: `Reparatie gestart voor event #${eventId}`,
      details: { originalEvent: event },
      createdAt: new Date()
    });

    // 3. NUCLEAR ACTION: Trigger echte GitHub workflow voor autonome reparatie.
    let dispatchSucceeded = false;
    let dispatchError: string | null = null;
    try {
      await triggerWorkflow(AUTO_HEAL_WORKFLOW_ID, {
        agent: AUTO_HEAL_AGENT,
        event_id: String(event.id),
        level: String(event.level || 'error'),
        source: String(event.source || 'AI-Healer'),
        error_message: String(event.message || '').substring(0, 240),
        event_url: String((event.details as any)?.url || ''),
        mode: 'manual_repair'
      });
      dispatchSucceeded = true;
    } catch (workflowErr: any) {
      dispatchError = workflowErr?.message || 'Onbekende workflow-fout';
      console.error('[Repair Error] Workflow dispatch failed:', dispatchError);
    }

    await db.insert(systemEvents).values({
      level: dispatchSucceeded ? 'info' : 'error',
      source: 'AI-Healer',
      message: dispatchSucceeded
        ? `Reparatie-dispatch verzonden voor event #${eventId}`
        : `Reparatie-dispatch mislukt voor event #${eventId}`,
      details: {
        workflow_id: AUTO_HEAL_WORKFLOW_ID,
        agent: AUTO_HEAL_AGENT,
        dispatch_succeeded: dispatchSucceeded,
        dispatch_error: dispatchError
      },
      createdAt: new Date()
    });

    return new NextResponse(`
      <html>
        <head>
          <title>Voices AI-Healer</title>
          <style>
            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f9f9f9; margin: 0; }
            .card { background: white; padding: 40px; border-radius: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); text-align: center; max-width: 500px; }
            .icon { font-size: 48px; margin-bottom: 20px; }
            h1 { color: #ff007a; margin-bottom: 10px; letter-spacing: -0.02em; }
            p { color: #666; line-height: 1.6; }
            .status { margin-top: 30px; padding: 12px; background: #fdf2f8; color: #ff007a; border-radius: 12px; font-weight: bold; font-size: 14px; }
            .loader { border: 3px solid #f3f3f3; border-top: 3px solid #ff007a; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite; display: inline-block; margin-right: 10px; vertical-align: middle; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">🧬</div>
            <h1>AI-Healer Geactiveerd</h1>
            <p>Het systeem analyseert momenteel de fout in <strong>${event.source}</strong>.</p>
            <div class="status">
              <div class="loader"></div>
              ${dispatchSucceeded ? 'Reparatie-signaal verzonden naar GitHub.' : `Dispatch mislukt: ${dispatchError || 'Onbekende fout'}`}
            </div>
            <p style="font-size: 12px; margin-top: 20px; color: #999;">
              ${dispatchSucceeded
                ? 'De workflow draait nu autonoom op GitHub. Je ontvangt een update na de run.'
                : 'Controleer de workflow-token en GitHub Actions-configuratie voor herstel.'}
            </p>
          </div>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });

  } catch (err) {
    console.error('[Repair Error]:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
