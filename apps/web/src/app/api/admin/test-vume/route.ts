// @ts-nocheck
import { requireAdmin } from '@/lib/auth/api-auth';
import { VumeEngine } from '@/lib/mail/VumeEngine';
import { MarketManagerServer as MarketManager } from '@/lib/system/core/market-manager';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SEND_TEMPLATES = ['magic-link', 'studio-experience', 'invoice-reply'] as const;

/** Default subject en context per template voor testmail. */
const DEFAULT_SUBJECT: Record<string, string> = {
  'magic-link': 'Inloggen op Voices (test)',
  'studio-experience': 'Je plek in de studio is gereserveerd (test)',
  'invoice-reply': 'Factuur goed ontvangen (test)'
};

function defaultContext(templateId: string, host: string): Record<string, any> {
  return {
    'magic-link': { name: 'Admin', link: `https://${host}/account/callback?token=test` },
    'studio-experience': {
      name: 'Johfrah',
      workshopName: 'Masterclass Stemacteren',
      date: '25 februari 2026',
      time: '14:00',
      optOutToken: 'test-token'
    },
    'invoice-reply': { userName: 'Johfrah', invoiceNumber: 'INV-2026-001', amount: 1250.5 }
  }[templateId] || {};
}

/**
 *  API: VUME TEST VERZENDEN (2026)
 *
 * Verstuurt één testmail voor de gekozen template naar de opgegeven ontvanger.
 * Gebruikt dezelfde layout als de preview; na preview kan hierop "Verzenden" geklikt worden.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json().catch(() => ({}));
    const { templateId, recipient } = body;

    if (!recipient || typeof recipient !== 'string' || !recipient.includes('@')) {
      return NextResponse.json({ error: 'recipient (e-mailadres) verplicht' }, { status: 400 });
    }
    if (!templateId || !SEND_TEMPLATES.includes(templateId)) {
      return NextResponse.json(
        { error: 'templateId verplicht; geldige waarden: magic-link, studio-experience, invoice-reply' },
        { status: 400 }
      );
    }

    const path = request.url ? new URL(request.url).pathname : '';
    const host = request.headers.get('host') || MarketManager.getMarketDomains()['BE']?.replace('https://', '') || 'www.voices.be';
    const context = defaultContext(templateId, host);
    const subject = DEFAULT_SUBJECT[templateId] || 'Testmail Voices';

    await VumeEngine.send({
      to: recipient,
      subject,
      template: templateId,
      context,
      host,
      path
    });

    return NextResponse.json({ success: true, to: recipient });
  } catch (e: any) {
    console.error('[test-vume]', e?.message || e);
    return NextResponse.json({ error: e?.message || 'Verzenden mislukt' }, { status: 500 });
  }
}
