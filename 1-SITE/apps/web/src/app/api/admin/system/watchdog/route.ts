import { db } from '@db';
import { systemEvents } from '@db/schema';
import { NextRequest, NextResponse } from 'next/server';
import { DirectMailService } from '@/services/DirectMailService';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { desc, gte, and, eq } from 'drizzle-orm';

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
    const { error, stack, component, url, level = 'error' } = body;

    if (!error) {
      return NextResponse.json({ error: 'Error message required' }, { status: 400 });
    }

    console.log(`[Watchdog] Error detected: ${error.substring(0, 100)}`);

    // 1. Log het event in de database - EXTRA SAFE
    let eventId = 0;
    try {
      if (db && systemEvents) {
        const [event] = await db.insert(systemEvents).values({
          level,
          source: component || 'Watchdog',
          message: error,
          details: {
            stack,
            url,
            userAgent: request.headers.get('user-agent'),
            timestamp: new Date().toISOString()
          },
          createdAt: new Date().toISOString()
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

    const host = request.headers.get('host') || (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || 'voices.be');
    const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    
    //  CHRIS-PROTOCOL: Safe Mail Service initialization
    let mailService;
    try {
      mailService = DirectMailService.getInstance();
    } catch (mailInitErr: any) {
      console.error('[Watchdog] Mail service initialization failed:', mailInitErr.message);
    }

    if (mailService) {
      //  BOB'S MANDATE: Rate limiting voor mails (max 1 per 10 minuten)
      // We checken of er in de afgelopen 10 minuten al een mail is gestuurd.
      // We gebruiken een speciaal 'source' label voor watchdog mails in de DB.
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      
      let recentMailSent = false;
      try {
        const recentEvents = await db
          .select()
          .from(systemEvents)
          .where(
            and(
              eq(systemEvents.source, 'WatchdogMail'),
              gte(systemEvents.createdAt, tenMinutesAgo)
            )
          )
          .limit(1);
        
        recentMailSent = recentEvents.length > 0;
      } catch (e) {
        console.error('[Watchdog] Failed to check recent mails:', e);
      }

      if (recentMailSent) {
        console.log('[Watchdog] 🤫 Mail rate-limited. Error logged to DB but no mail sent.');
        return NextResponse.json({ success: true, eventId, mailSent: false });
      }

      // Als we hier zijn, sturen we een mail en loggen we dat we dat gedaan hebben
      try {
        await db.insert(systemEvents).values({
          level: 'info',
          source: 'WatchdogMail',
          message: 'Watchdog summary mail sent',
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        console.error('[Watchdog] Failed to log mail event:', e);
      }

      if (isSafeAutoHeal) {
        console.log(`[Watchdog] 🛡️ SAFE AUTO-HEAL TRIGGERED for: ${error}`);
        
        try {
          await mailService.sendMail({
            to: adminEmail,
            subject: `✅ Systeem Auto-Heal Geactiveerd: ${error.substring(0, 40)}...`,
            html: `
              <div style="font-family: sans-serif; padding: 40px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 24px; max-width: 600px; margin: 0 auto;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                  <span style="font-size: 24px;">🛡️</span>
                  <h2 style="margin: 0; color: #15803d; letter-spacing: -0.02em;">Auto-Heal Actief</h2>
                </div>
                
                <p style="font-size: 16px; color: #166534; line-height: 1.5;">
                  De site heeft een bekende fout gedetecteerd en is gestart met een <strong>autonome reparatie</strong>.
                </p>

                <div style="background: #fff; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0; border-radius: 8px;">
                  <p style="margin: 0 0 10px 0; font-weight: bold; color: #15803d;">GEDETECTEERDE FOUT:</p>
                  <code style="font-family: monospace; font-size: 14px; color: #000; display: block; word-break: break-all;">
                    ${error}
                  </code>
                </div>

                <p style="font-size: 14px; color: #666;">
                  De AI-Healer analyseert de broncode en pusht binnen enkele minuten een fix naar GitHub. Geen actie vereist.
                </p>

                <hr style="border: none; border-top: 1px solid #dcfce7; margin: 30px 0;" />
                <p style="font-size: 10px; color: #999; text-align: center;">Voices OS 2026 - Zero Touch Maintenance (Mails limited to 1 per 10m)</p>
              </div>
            `
          });
        } catch (mailErr: any) {
          console.error('[Watchdog] Auto-Heal mail failed:', mailErr.message);
        }
      } else if (level === 'error' || level === 'critical') {
        // 3. Bij onbekende kritieke fouten: Stuur een One-Click Repair mail
        const repairUrl = `${process.env.NEXT_PUBLIC_SITE_URL || `https://${host}`}/api/admin/system/repair?eventId=${eventId}`;

        try {
          await mailService.sendMail({
            to: adminEmail,
            subject: `🚨 Systeemfout gedetecteerd: ${error.substring(0, 50)}`,
            html: `
              <div style="font-family: sans-serif; padding: 40px; background: #fff; border: 1px solid #eee; border-radius: 24px; max-width: 600px; margin: 0 auto;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                  <span style="font-size: 24px;">🚨</span>
                  <h2 style="margin: 0; color: #ff007a; letter-spacing: -0.02em;">Systeem Watchdog</h2>
                </div>
                
                <p style="font-size: 16px; color: #333; line-height: 1.5;">
                  Er is een kritieke fout opgetreden in de <strong>${component || 'frontend'}</strong>.
                </p>

                <div style="background: #fdf2f8; border-left: 4px solid #ff007a; padding: 20px; margin: 20px 0; border-radius: 8px;">
                  <p style="margin: 0 0 10px 0; font-weight: bold; color: #ff007a;">FOUTMELDING:</p>
                  <code style="font-family: monospace; font-size: 14px; color: #000; display: block; word-break: break-all;">
                    ${error}
                  </code>
                </div>

                <div style="margin: 30px 0;">
                  <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                    Klik op de onderstaande knop om de AI-Healer te activeren. Het systeem zal proberen de broncode te analyseren en een automatische fix te pushen naar GitHub.
                  </p>
                  
                  <a href="${repairUrl}" style="background: #ff007a; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(255, 0, 122, 0.39);">
                    GENEES SYSTEEM (ONE-CLICK)
                  </a>
                </div>

                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                
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

                <p style="font-size: 10px; color: #ccc; margin-top: 40px; text-align: center;">
                  Voices OS 2026 - Antifragile Infrastructure (Mails limited to 1 per 10m)
                </p>
              </div>
            `
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
