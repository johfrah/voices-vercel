import { db, systemEvents } from '@/lib/system/voices-config';
import { NextRequest, NextResponse } from 'next/server';
import { VoicesMailEngine } from '@/lib/services/voices-mail-engine';
import { TelegramService } from '@/lib/services/telegram-service';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { desc, gte, and, eq, sql } from 'drizzle-orm';

/**
 *  API: SYSTEM WATCHDOG (SELF-HEALING 2026)
 * 
 * Doel: Ontvangt client-side of server-side errors, logt deze in de database
 * en stuurt een "One-Click Repair" mail naar de admin bij kritieke fouten.
 */

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('[Watchdog] Incoming error report...');
  try {
    const body = await request.json();
    const error = body.error || body.message || 'Unknown Error';
    const stack = body.stack || body.details?.stack;
    const component = body.component || body.source || 'Watchdog';
    const url = body.url || body.details?.url;
    const level = body.level || 'error';
    const details = body.details || {};
    const payload = body.payload || details.payload;

    if (!error) {
      return NextResponse.json({ error: 'Error message required' }, { status: 400 });
    }

    console.log(`[Watchdog] Error detected: ${error.substring(0, 100)}`);

    // 🛡️ CHRIS-PROTOCOL: Nuclear Telegram Alert for Critical Errors
    if (level === 'critical' || level === 'error') {
      try {
        await TelegramService.reportCriticalError({
          error,
          component,
          url,
          payload
        });
        console.log('[Watchdog] 🚀 Telegram alert sent.');
      } catch (tgErr: any) {
        console.error('[Watchdog] Telegram alert failed:', tgErr.message);
      }
    }

    // 1. Log het event in de database - EXTRA SAFE
    let eventId = 0;
    try {
      if (db && systemEvents) {
        const nowIso = new Date().toISOString();
        const [event] = await db.insert(systemEvents).values({
          level,
          source: component || 'Watchdog',
          message: error,
          details: {
            ...details,
            stack,
            url,
            userAgent: request.headers.get('user-agent'),
            timestamp: nowIso
          },
          createdAt: nowIso
        }).returning({ id: systemEvents.id });
        eventId = event.id;
        console.log(`[Watchdog] Event logged to DB: #${eventId}`);
      }
    } catch (dbErr: any) {
      console.error('[Watchdog] Database logging failed (continuing to mail):', dbErr.message);
    }

    // 2. Classificeer de fout: Is dit een "Safe Auto-Heal" kandidaat?
    const isSafeAutoHeal = (
      error.includes('is not defined') || 
      error.includes('cannot read properties of null') || 
      error.includes('useAuth must be used within') || 
      error.includes('router is not defined')
    );

    const host = request.headers.get('host') || (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || MarketManager.getMarketDomains()['BE']?.replace('https://', ''));
    const market = MarketManager.getCurrentMarket(host);
    const adminEmail = market.email;
    
    //  CHRIS-PROTOCOL: Safe Mail Engine initialization
    let mailEngine;
    try {
      mailEngine = VoicesMailEngine.getInstance();
    } catch (mailInitErr: any) {
      console.error('[Watchdog] Mail engine initialization failed:', mailInitErr.message);
    }

    if (mailEngine) {
      // CHRIS-PROTOCOL: Skip emails if requested by user (logging to watchdog only)
      // 🛡️ VOICES-MANDATE: DISABLE_ADMIN_EMAILS is true by default to prevent spam during development
      const skipEmails = process.env.DISABLE_ADMIN_EMAILS !== 'false';

      // 🛡️ CHRIS-PROTOCOL: Filter out common noise to prevent mail spam
      const isNoise = (
        level === 'info' ||                           // Skip info logs
        error.includes('Minified React error #419') || // Hydration mismatch (common in Next.js/Browser extensions)
        error.includes('Server Components render') || // Generic Next.js error often paired with others
        error.includes('/api/translations/heal') ||   // Network noise/aborted requests
        error.includes('Failed to fetch') ||          // Network noise
        error.includes('Load failed') ||              // Network noise
        error.includes('Self-healing failed') ||      // Noise from the healer itself
        error.includes('504') ||                      // Timeout noise
        error.includes('503') ||                      // Service unavailable noise
        error.includes('429') ||                      // Rate limit noise
        error.includes('AbortError') ||               // Aborted requests
        error.includes('TypeError: S is not a function') || // Known auth noise
        error.includes('toggleActorSelection')        // Known UI noise
      );

      if (isNoise || skipEmails) {
        console.log(`[Watchdog] 🤫 Noise or Skip detected: "${error.substring(0, 50)}...". Logged to DB but no mail sent.`);
        return NextResponse.json({ success: true, eventId, mailSent: false });
      }

      //  BOB'S MANDATE: Rate limiting voor mails (max 1 per 10 minuten)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      
      let recentMailSent = false;
      try {
        const recentEvents = await db
          .select()
          .from(systemEvents)
          .where(
            and(
              eq(systemEvents.source, 'WatchdogMail'),
              gte(systemEvents.createdAt, tenMinutesAgo),
              eq(systemEvents.message, `Watchdog summary mail sent: ${error.substring(0, 50)}`)
            )
          )
          .limit(1);
        
        recentMailSent = recentEvents.length > 0;
      } catch (e) {
        console.error('[Watchdog] Failed to check recent mails:', e);
      }

      if (recentMailSent) {
        console.log('[Watchdog] 🤫 Identical mail rate-limited. Error logged to DB but no mail sent.');
        return NextResponse.json({ success: true, eventId, mailSent: false });
      }

      // Als we hier zijn, sturen we een mail en loggen we dat we dat gedaan hebben
      try {
        await db.insert(systemEvents).values({
          level: 'info',
          source: 'WatchdogMail',
          message: `Watchdog summary mail sent: ${error.substring(0, 50)}`,
          createdAt: sql`now()`
        });
      } catch (e) {
        console.error('[Watchdog] Failed to log mail event:', e);
      }

      if (isSafeAutoHeal) {
        console.log(`[Watchdog] 🛡️ SAFE AUTO-HEAL TRIGGERED for: ${error}`);
        
        try {
          await mailEngine.sendVoicesMail({
            to: adminEmail,
            subject: `✅ Systeem Auto-Heal Geactiveerd: ${error.substring(0, 40)}...`,
            title: 'Auto-Heal Actief',
            body: `
              De site heeft een bekende fout gedetecteerd en is gestart met een <strong>autonome reparatie</strong>.<br/><br/>
              <div style="background: #fff; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <p style="margin: 0 0 10px 0; font-weight: bold; color: #15803d;">GEDETECTEERDE FOUT:</p>
                <code style="font-family: monospace; font-size: 14px; color: #000; display: block; word-break: break-all;">
                  ${error}
                </code>
              </div>
              De AI-Healer analyseert de broncode en pusht binnen enkele minuten een fix naar GitHub. Geen actie vereist.
            `,
            host
          });
        } catch (mailErr: any) {
          console.error('[Watchdog] Auto-Heal mail failed:', mailErr.message);
        }
      } else if (level === 'error' || level === 'critical') {
        // 3. Bij onbekende kritieke fouten: Stuur een One-Click Repair mail
        const siteUrl = MarketManager.getMarketDomains()[market.market_code] || `https://${host}`;
        const repairUrl = `${siteUrl}/api/admin/system/repair?eventId=${eventId}`;

        try {
          await mailEngine.sendVoicesMail({
            to: adminEmail,
            subject: `🚨 Systeemfout gedetecteerd: ${error.substring(0, 50)}`,
            title: 'Systeem Watchdog',
            body: `
              Er is een kritieke fout opgetreden in de <strong>${component || 'frontend'}</strong>.<br/><br/>
              <div style="background: #fdf2f8; border-left: 4px solid #ff007a; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <p style="margin: 0 0 10px 0; font-weight: bold; color: #ff007a;">FOUTMELDING:</p>
                <code style="font-family: monospace; font-size: 14px; color: #000; display: block; word-break: break-all;">
                  ${error}
                </code>
                ${stack ? `
                  <p style="margin: 15px 0 5px 0; font-weight: bold; color: #ff007a; font-size: 12px;">STACK TRACE:</p>
                  <pre style="font-family: monospace; font-size: 11px; color: #666; background: #fff; padding: 10px; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; max-height: 200px;">${stack}</pre>
                ` : ''}
              </div>
              ${details && Object.keys(details).length > 0 ? `
                <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 15px 0; border-radius: 8px; font-size: 13px;">
                  <p style="margin: 0 0 5px 0; font-weight: bold; color: #0ea5e9;">FORENSIC DETAILS:</p>
                  <pre style="font-family: monospace; font-size: 11px; color: #444; margin: 0;">${JSON.stringify(details, null, 2)}</pre>
                </div>
              ` : ''}
              Klik op de onderstaande knop om de AI-Healer te activeren. Het systeem zal proberen de broncode te analyseren en een automatische fix te pushen naar GitHub.<br/><br/>
              <table style="width: 100%; font-size: 12px; color: #999;">
                <tr>
                  <td style="padding: 4px 0;"><strong>URL:</strong></td>
                  <td style="padding: 4px 0;">${url || 'Onbekend'}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;"><strong>Event ID:</strong></td>
                  <td style="padding: 4px 0;">#${eventId}</td>
                </tr>
              </table>
            `,
            buttonText: 'GENEES SYSTEEM (ONE-CLICK)',
            buttonUrl: repairUrl,
            host
          });
        } catch (mailErr: any) {
          console.error('[Watchdog] Critical error mail failed:', mailErr.message);
        }
      }
    }

    return NextResponse.json({ success: true, eventId, mailSent: true });

  } catch (err: any) {
    console.error('[Watchdog FATAL]:', err.message);
    //  STABILITEIT: Geef altijd 200 terug aan de client om loops te voorkomen
    return NextResponse.json({ success: false, error: err.message }, { status: 200 });
  }
}
