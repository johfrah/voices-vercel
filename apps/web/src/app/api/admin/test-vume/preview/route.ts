import { requireAdmin } from '@/lib/auth/api-auth';
import { VumeEngine } from '@/lib/mail/VumeEngine';
import { MarketManagerServer as MarketManager } from '@/lib/system/core/market-manager';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Template IDs die in admin preview ondersteund zijn. */
const PREVIEW_TEMPLATES = ['magic-link', 'studio-experience', 'invoice-reply'] as const;

/**
 *  API: VUME PREVIEW (2026)
 *
 * Genereert alleen de HTML van een mailtemplate. Geen verzending.
 * Voor de admin mailpreview-box: layout en tekst zichtbaar, daarna kan op Verzenden geklikt worden.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json().catch(() => ({}));
    const { templateId, context: bodyContext } = body;

    if (!templateId || !PREVIEW_TEMPLATES.includes(templateId)) {
      return NextResponse.json(
        { error: 'templateId verplicht; geldige waarden: magic-link, studio-experience, invoice-reply' },
        { status: 400 }
      );
    }

    const path = request.url ? new URL(request.url).pathname : '';
    const host = request.headers.get('host') || MarketManager.getMarketDomains()['BE']?.replace('https://', '') || 'www.voices.be';

    const defaultContext: Record<string, any> = {
      'magic-link': { name: 'Admin', link: `https://${host}/account/callback?token=test` },
      'studio-experience': {
        name: 'Johfrah',
        workshopName: 'Masterclass Stemacteren',
        date: '25 februari 2026',
        time: '14:00',
        optOutToken: 'test-token'
      },
      'invoice-reply': { userName: 'Johfrah', invoiceNumber: 'INV-2026-001', amount: 1250.5 }
    };

    const context = { ...defaultContext[templateId], ...bodyContext };

    const html = VumeEngine.getHtml({
      template: templateId,
      subject: '',
      context,
      host,
      path
    });

    return NextResponse.json({ html });
  } catch (e: any) {
    console.error('[test-vume/preview]', e?.message || e);
    return NextResponse.json({ error: e?.message || 'Preview failed' }, { status: 500 });
  }
}
