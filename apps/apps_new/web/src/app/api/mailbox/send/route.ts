import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 });
  }
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Admin Check
  // We allow requests if they are authenticated as admin OR if they provide a system secret
  const systemSecret = process.env.SYSTEM_SECRET;
  const authHeader = request.headers.get('x-system-secret');
  const isSystemAction = systemSecret && authHeader === systemSecret;

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!isSystemAction && (!user || user.email !== adminEmail)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { to, subject, body } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Call Email Service
    const { VoicesMailEngine } = await import('@/lib/services/voices-mail-engine');
    const { MarketManagerServer: MarketManager } = await import('@/lib/system/core/market-manager');
    const mailEngine = VoicesMailEngine.getInstance();
    const host = request.headers.get('host') || (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || MarketManager.getMarketDomains()['BE']?.replace('https://', ''));

    await mailEngine.sendVoicesMail({
      to,
      subject,
      title: subject,
      body,
      host
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Mailbox API] Error sending email:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
