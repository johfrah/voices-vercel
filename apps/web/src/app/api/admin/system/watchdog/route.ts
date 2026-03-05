import { db, systemEvents } from '@/lib/system/voices-config';
import { NextRequest, NextResponse } from 'next/server';
import { VoicesMailEngine } from '@/lib/services/voices-mail-engine';
import { TelegramService } from '@/lib/services/telegram-service';
import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";
import { isExpectedBrowserNetworkNoise } from '@/lib/system/watchdog/noise-filter';
import { desc, gte, and, eq, sql } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';

/**
 *  API: SYSTEM WATCHDOG (SELF-HEALING 2026)
 * 
 * Doel: Ontvangt client-side of server-side errors, logt deze in de database
 * en stuurt een "One-Click Repair" mail naar de admin bij kritieke fouten.
 */

export const dynamic = 'force-dynamic';

function resolveAdminRecipients(...candidates: Array<string | undefined | null>): string[] {
  const recipients = new Set<string>();

  candidates
    .filter(Boolean)
    .flatMap((value) => String(value).split(','))
    .map((value) => value.trim())
    .filter((value) => value.includes('@'))
    .forEach((value) => recipients.add(value));

  return Array.from(recipients);
}

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

    const normalizedError = String(error || '').toUpperCase();
    const normalizedErrorLower = String(error || '').toLowerCase();
    const detailsLocation = String(details?.location || '');
    const detailsPathname = String(details?.pathname || '');
    const normalizedUrl = String(url || '');
    const isLocalDevEvent = [detailsLocation, detailsPathname, normalizedUrl, String(error)]
      .some((value) => /localhost:3000|127\.0\.0\.1:3000/i.test(value));
    const isBrowserNetworkNoise = isExpectedBrowserNetworkNoise({
      error: String(error || ''),
      stack: typeof stack === 'string' ? stack : undefined,
      component: String(component || ''),
      details: details as Record<string, unknown>
    });

    // Ignore expected not-found throws and local dev noise.
    if (
      normalizedError.includes('NEXT_NOT_FOUND') ||
      normalizedError.includes('NEXT_HTTP_ERROR_FALLBACK') ||
      isLocalDevEvent
    ) {
      return NextResponse.json({ success: true, ignored: true });
    }

    if (!error) {
      return NextResponse.json({ error: 'Error message required' }, { status: 400 });
    }

    console.log(`[Watchdog] Error detected: ${error.substring(0, 100)}`);

    // 🛡️ CHRIS-PROTOCOL: Nuclear Telegram Alert for Critical Errors
    if ((level === 'critical' || level === 'error') && !isBrowserNetworkNoise) {
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

    // 2. Log het event in de database - EXTRA SAFE
    let eventId = 0;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
      if (db && systemEvents) {
        const [event] = await db.insert(systemEvents).values({
          level,
          source: component || 'Watchdog',
          message: error,
          details: {
            ...details,
            stack,
            url,
            userAgent: request.headers.get('user-agent'),
            timestamp: new Date()
          },
          createdAt: new Date()
        }).returning({ id: systemEvents.id });
        eventId = event.id;
        console.log(`[Watchdog] Event logged to DB: #${eventId}`);
      }
    } catch (dbErr: any) {
      console.warn('[Watchdog] Drizzle failed, falling back to Supabase SDK:', dbErr.message);
      try {
        const { data: sdkEvent, error: sdkErr } = await supabase.from('system_events').insert({
          level,
          source: component || 'Watchdog',
          message: error,
          details: {
            ...details,
            stack,
            url,
            userAgent: request.headers.get('user-agent'),
            timestamp: new Date()
          },
          created_at: new Date()
        }).select().single();
        
        if (!sdkErr && sdkEvent) {
          eventId = sdkEvent.id;
          console.log(`[Watchdog] Event logged via SDK: #${eventId}`);
        }
      } catch (e) {
        console.error('[Watchdog] SDK fallback also failed:', e);
      }
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
    const adminRecipients = resolveAdminRecipients(
      process.env.ADMIN_ALERT_EMAILS,
      process.env.ADMIN_EMAIL,
      market.email
    );
    
    //  CHRIS-PROTOCOL: Safe Mail Engine initialization
    let mailEngine;
    try {
      mailEngine = VoicesMailEngine.getInstance();
    } catch (mailInitErr: any) {
      console.error('[Watchdog] Mail engine initialization failed:', mailInitErr.message);
    }

    if (mailEngine) {
      // CHRIS-PROTOCOL: Skip emails if requested by user (logging to watchdog only)
      const skipEmails = process.env.DISABLE_ADMIN_EMAILS === 'true';
      const aggressiveAlerts = process.env.ADMIN_ALERT_VERBOSE === 'true' || process.env.NODE_ENV !== 'production';

      const sendMailToAdmins = async (payload: {
        subject: string;
        title: string;
        body: string;
        buttonText?: string;
        buttonUrl?: string;
      }) => {
        if (adminRecipients.length === 0) {
          console.warn('[Watchdog] No admin recipients configured.');
          return;
        }

        for (const recipient of adminRecipients) {
          await mailEngine.sendVoicesMail({
            to: recipient,
            subject: payload.subject,
            title: payload.title,
            body: payload.body,
            buttonText: payload.buttonText,
            buttonUrl: payload.buttonUrl,
            host
          });
        }
      };

      // 🛡️ CHRIS-PROTOCOL: Filter out common noise to prevent mail spam
      const isNoise = !aggressiveAlerts && (
        level === 'info' ||                           // Skip info logs
        isBrowserNetworkNoise ||
        normalizedErrorLower.includes('minified react error #419') || // Hydration mismatch (common in Next.js/Browser extensions)
        normalizedErrorLower.includes('server components render') || // Generic Next.js error often paired with others
        normalizedErrorLower.includes('/api/translations/heal') ||   // Network noise/aborted requests
        normalizedErrorLower.includes('failed to fetch') ||          // Network noise
        normalizedErrorLower.includes('load failed') ||              // Network noise
        normalizedErrorLower.includes('self-healing failed') ||      // Noise from the healer itself
        normalizedErrorLower.includes('504') ||                      // Timeout noise
        normalizedErrorLower.includes('503') ||                      // Service unavailable noise
        normalizedErrorLower.includes('429') ||                      // Rate limit noise
        normalizedErrorLower.includes('aborterror') ||               // Aborted requests
        normalizedErrorLower.includes('typeerror: s is not a function') || // Known auth noise
        normalizedErrorLower.includes('toggleactorselection')        // Known UI noise
      );

      if (isNoise || skipEmails) {
        console.log(`[Watchdog] 🤫 Noise or Skip detected: "${error.substring(0, 50)}...". Logged to DB but no mail sent.`);
        return NextResponse.json({ success: true, eventId, mailSent: false });
      }

      //  BOB'S MANDATE: Rate limiting voor mails (max 1 per 10 minuten)
      const rateLimitMs = aggressiveAlerts ? 2 * 60 * 1000 : 10 * 60 * 1000;
      const thresholdDate = new Date(Date.now() - rateLimitMs);
      
      let recentMailSent = false;
      try {
        const recentEvents = await db
          .select()
          .from(systemEvents)
          .where(
            and(
              eq(systemEvents.source, 'WatchdogMail'),
              gte(systemEvents.createdAt, thresholdDate),
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
          createdAt: new Date()
        });
      } catch (e) {
        console.warn('[Watchdog] Failed to log mail event via Drizzle, trying SDK...');
        try {
          await supabase.from('system_events').insert({
            level: 'info',
            source: 'WatchdogMail',
            message: `Watchdog summary mail sent: ${error.substring(0, 50)}`,
            created_at: new Date()
          });
        } catch (sdkE) {
          console.error('[Watchdog] SDK mail log failed:', sdkE);
        }
      }

      if (isSafeAutoHeal) {
        console.log(`[Watchdog] 🛡️ SAFE AUTO-HEAL TRIGGERED for: ${error}`);
        
        try {
          await sendMailToAdmins({
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
            `
          });
        } catch (mailErr: any) {
          console.error('[Watchdog] Auto-Heal mail failed:', mailErr.message);
        }
      } else if (level === 'error' || level === 'critical' || (aggressiveAlerts && level === 'warn')) {
        // 3. Bij onbekende kritieke fouten: Stuur een One-Click Repair mail
        const siteUrl = MarketManager.getMarketDomains()[market.market_code] || `https://${MarketManager.getMarketDomains()['BE']?.replace('https://', '') || 'www.voices.be'}`;
        const repairUrl = `${siteUrl}/api/admin/system/repair?eventId=${eventId}`;

        try {
          await sendMailToAdmins({
            subject: level === 'warn'
              ? `⚠️ Systeemwaarschuwing: ${error.substring(0, 50)}`
              : `🚨 Systeemfout gedetecteerd: ${error.substring(0, 50)}`,
            title: level === 'warn' ? 'Systeem Waarschuwing' : 'Systeem Watchdog',
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
            buttonUrl: repairUrl
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
