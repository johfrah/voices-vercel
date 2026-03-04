import { db, users } from '@/lib/system/voices-config';
import { createClient } from '@supabase/supabase-js';
import { eq } from 'drizzle-orm';
import { decode, verify } from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function extractOrderIdFromRedirect(redirectPath: string | null, payloadOrderId?: unknown): string | null {
  if (payloadOrderId && Number.isFinite(Number(payloadOrderId))) {
    return String(Number(payloadOrderId));
  }

  if (!redirectPath) return null;

  try {
    const parsed = redirectPath.startsWith('http')
      ? new URL(redirectPath)
      : new URL(redirectPath, 'http://voices.local');
    const orderId = parsed.searchParams.get('orderId') || parsed.searchParams.get('orderid');
    if (orderId && /^\d+$/.test(orderId)) return orderId;
  } catch {
    // no-op, we still have regex fallback
  }

  const regexMatch = redirectPath.match(/orderId=(\d+)/i);
  return regexMatch?.[1] || null;
}

function buildVerificationUrl(baseUrl: string, redirectPath: string | null, email?: string | null, payloadOrderId?: unknown, reason: string = 'magic_login_failed'): string {
  const orderId = extractOrderIdFromRedirect(redirectPath, payloadOrderId);
  const params = new URLSearchParams();
  params.set('verify', 'true');
  params.set('reason', reason);
  if (orderId) params.set('orderId', orderId);
  if (email && email.includes('@')) params.set('email', email);
  return `${baseUrl}/checkout/success?${params.toString()}`;
}

export async function GET(request: Request) {
  const { MarketManagerServer: MarketManager } = require('@/lib/system/core/market-manager');
  const host = request.headers.get('host') || MarketManager.getMarketDomains()['BE']?.replace('https://', '');
  const market = MarketManager.getCurrentMarket(host);
  const siteUrl = MarketManager.getMarketDomains()[market.market_code] || `https://${MarketManager.getMarketDomains()['BE']?.replace('https://', '') || 'www.voices.be'}`;
  const currentBaseUrl = host.includes('localhost') ? `http://${host}` : siteUrl;

  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const redirectPath = searchParams.get('redirect') || '/account';
    const fallbackEmailParam = searchParams.get('email');

    if (!token || token === 'undefined') {
      return NextResponse.redirect(
        buildVerificationUrl(currentBaseUrl, redirectPath, fallbackEmailParam, null, 'missing_token')
      );
    }

    // 1. Verify JWT
    const secret = process.env.JWT_SECRET || 'voices-secret-2026';
    let payload: any;
    try {
      // 🛡️ CHRIS-PROTOCOL: Support for Permanent Admin Key (v6.0.7)
      const adminKey = process.env.ADMIN_AUTOLOGIN_KEY;
      if (adminKey && token === adminKey) {
        // Hardcoded fallback for the owner (Johfrah)
        payload = { email: 'johfrah@voices.be', isPermanent: true };
      } else {
        payload = verify(token, secret);
      }
    } catch (e) {
      // 🛡️ CHRIS-PROTOCOL: Final fallback for master key if JWT fails
      const adminKey = process.env.ADMIN_AUTOLOGIN_KEY;
      if (adminKey && token === adminKey) {
        payload = { email: 'johfrah@voices.be', isPermanent: true };
      } else {
        const decodedPayload = decode(token) as any;
        return NextResponse.redirect(
          buildVerificationUrl(
            currentBaseUrl,
            redirectPath,
            fallbackEmailParam || decodedPayload?.email || null,
            decodedPayload?.orderId,
            'invalid_or_expired_token'
          )
        );
      }
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
      return NextResponse.redirect(
        buildVerificationUrl(
          currentBaseUrl,
          redirectPath,
          fallbackEmailParam || tokenEmail || null,
          payload?.orderId,
          'user_not_found'
        )
      );
    }

    // 3. Initialize Supabase Admin
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.redirect(
        buildVerificationUrl(currentBaseUrl, redirectPath, userRecord.email, payload?.orderId, 'auth_service_unavailable')
      );
    }
    const supabaseAdmin = createClient(url, key);

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
      return NextResponse.redirect(
        buildVerificationUrl(currentBaseUrl, redirectPath, userRecord.email, payload?.orderId, 'generate_link_failed')
      );
    }

    const supabaseLink = new URL(data.properties.action_link);
    const confirmToken = supabaseLink.searchParams.get('token');
    const confirmType = supabaseLink.searchParams.get('type') || 'magiclink';

    if (!confirmToken) {
      return NextResponse.redirect(
        buildVerificationUrl(currentBaseUrl, redirectPath, userRecord.email, payload?.orderId, 'missing_confirm_token')
      );
    }

    const confirmUrl =
      `${currentBaseUrl}/account/confirm?token=${encodeURIComponent(confirmToken)}` +
      `&type=${encodeURIComponent(confirmType)}` +
      `&redirect=${encodeURIComponent(redirectPath)}` +
      `&email=${encodeURIComponent(userRecord.email)}`;

    // 5. Redirect to our own confirm route for cookie-based session establishment.
    return NextResponse.redirect(confirmUrl);

  } catch (error: any) {
    console.error(' MAGIC LOGIN ERROR:', error);
    const { searchParams } = new URL(request.url);
    const redirectPath = searchParams.get('redirect');
    const token = searchParams.get('token');
    const fallbackEmailParam = searchParams.get('email');
    const decodedPayload = token ? (decode(token) as any) : null;
    return NextResponse.redirect(
      buildVerificationUrl(
        currentBaseUrl,
        redirectPath,
        fallbackEmailParam || decodedPayload?.email || null,
        decodedPayload?.orderId,
        'magic_login_exception'
      )
    );
  }
}
