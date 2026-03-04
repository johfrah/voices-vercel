import { db, users } from '@/lib/system/voices-config';
import { createClient } from '@supabase/supabase-js';
import { eq } from 'drizzle-orm';
import { verify } from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const redirectPath = searchParams.get('redirect') || '/account';

    if (!token || token === 'undefined') {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // 1. Verify JWT
    const secret = process.env.JWT_SECRET || 'voices-secret-2026';
    let payload: any;
    try {
      payload = verify(token, secret);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    let { userId, email: tokenEmail } = payload;
    
    // 🛡️ CHRIS-PROTOCOL: Robust user lookup (v2.14.312)
    // If userId is missing but we have an email, we can still proceed
    let userRecord: any = null;

    if (userId) {
      const [u] = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
      userRecord = u;
    } 
    
    if (!userRecord && tokenEmail) {
      const [u] = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.email, tokenEmail)).limit(1);
      userRecord = u;
    }

    if (!userRecord || !userRecord.email) {
      return NextResponse.json({ error: 'User not found or invalid token payload' }, { status: 404 });
    }

    // 3. Initialize Supabase Admin
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ error: 'Auth service not configured' }, { status: 503 });
    }
    const supabaseAdmin = createClient(url, key);

    const { MarketManagerServer: MarketManager } = require('@/lib/system/core/market-manager');
    const host = request.headers.get('host') || MarketManager.getMarketDomains()['BE']?.replace('https://', '');
    const market = MarketManager.getCurrentMarket(host);
    const siteUrl = MarketManager.getMarketDomains()[market.market_code] || `https://${MarketManager.getMarketDomains()['BE']?.replace('https://', '') || 'www.voices.be'}`;
    const currentBaseUrl = host.includes('localhost') ? `http://${host}` : siteUrl;

    // 4. Generate Magic Link (Action Link) and always finalize via /account/confirm
    // to let server-side verifyOtp establish a stable session.
    let { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: userRecord.email,
      options: {
        redirectTo: `${currentBaseUrl}/account/confirm`,
      }
    });

    if (error && (error.message.includes('User not found') || error.status === 422)) {
      const signupResult = await supabaseAdmin.auth.admin.generateLink({
        type: 'signup' as any,
        email: userRecord.email,
        options: {
          redirectTo: `${currentBaseUrl}/account/confirm`,
        }
      });
      data = signupResult.data;
      error = signupResult.error;
    }

    if (error || !data?.properties?.action_link) {
      console.error('Supabase GenerateLink Error:', error);
      throw error || new Error('Failed to generate action link');
    }

    const supabaseLink = new URL(data.properties.action_link);
    const confirmToken = supabaseLink.searchParams.get('token');
    const confirmType = supabaseLink.searchParams.get('type') || 'magiclink';

    if (!confirmToken) {
      throw new Error('No token found in generated action link');
    }

    const confirmUrl =
      `${currentBaseUrl}/account/confirm?token=${encodeURIComponent(confirmToken)}` +
      `&type=${encodeURIComponent(confirmType)}` +
      `&redirect=${encodeURIComponent(redirectPath)}`;

    // 5. Redirect to our own confirm route for cookie-based session establishment.
    return NextResponse.redirect(confirmUrl);

  } catch (error: any) {
    console.error(' MAGIC LOGIN ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
