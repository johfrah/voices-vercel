import { VoicesMailEngine } from '@/lib/services/voices-mail-engine';
import { ServerWatchdog } from '@/lib/services/server-watchdog';
import { normalizeLocale } from '@/lib/system/locale-utils';
import { MarketManagerServer as MarketManager } from '@/lib/system/core/market-manager';
import { createAdminClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type MagicLinkRequestPayload = {
  request_id: string;
  email: string;
  redirect_path: string;
  requested_language?: string;
  request_url: string;
  cookie_header?: string | null;
  accept_language?: string | null;
  voices_language_header?: string | null;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function launchMagicLinkPipeline(payload: MagicLinkRequestPayload) {
  setTimeout(() => {
    void processMagicLinkRequest(payload).catch(async (error: any) => {
      console.error(`[Auth API] [${payload.request_id}] Background pipeline crash:`, error);
      await ServerWatchdog.report({
        error: `Magic link background crash: ${error?.message || 'Unknown error'}`,
        stack: error?.stack,
        component: 'AuthAPI',
        url: payload.request_url,
        level: 'critical',
        payload: {
          request_id: payload.request_id,
          email: payload.email,
        },
      });
    });
  }, 0);
}

async function processMagicLinkRequest(payload: MagicLinkRequestPayload) {
  const {
    request_id,
    email,
    redirect_path,
    requested_language,
    request_url,
    cookie_header,
    accept_language,
    voices_language_header,
  } = payload;

  console.log(`[Auth API] [${request_id}] Background processing started for: ${email}`);

  const supabase = createAdminClient();
  if (!supabase) {
    await ServerWatchdog.report({
      error: 'Auth service niet beschikbaar (Service role key missing)',
      component: 'AuthAPI',
      url: request_url,
      level: 'critical',
      payload: { request_id, email },
    });
    return;
  }

  const origin_url = new URL(request_url).origin;
  const supabase_redirect_to = `${origin_url}/account/confirm`;

  let { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: supabase_redirect_to },
  });

  if (error && (error.message.includes('User not found') || error.status === 422)) {
    console.log(`[Auth API] [${request_id}] User not found, creating signup link for ${email}`);
    const signup_result = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      options: { redirectTo: supabase_redirect_to },
    });

    if (signup_result.error) {
      await ServerWatchdog.report({
        error: `Signup link generation failed: ${signup_result.error.message}`,
        component: 'AuthAPI',
        url: request_url,
        level: 'error',
        payload: {
          request_id,
          email,
          error: signup_result.error,
        },
      });
      return;
    }

    data = signup_result.data;
    error = null;
  }

  if (error || !data) {
    await ServerWatchdog.report({
      error: `Supabase generateLink error: ${error?.message || 'Unknown error'}`,
      component: 'AuthAPI',
      url: request_url,
      level: 'error',
      payload: { request_id, email, error },
    });
    return;
  }

  const supabase_link = new URL(data.properties.action_link);
  const token = supabase_link.searchParams.get('token');
  const type = supabase_link.searchParams.get('type') || 'magiclink';

  if (!token) {
    await ServerWatchdog.report({
      error: 'No token found in action link',
      component: 'AuthAPI',
      url: request_url,
      level: 'critical',
      payload: {
        request_id,
        action_link: data.properties.action_link,
      },
    });
    return;
  }

  const host = new URL(request_url).host;
  const market = MarketManager.getCurrentMarket(host);
  const site_url =
    MarketManager.getMarketDomains()[market.market_code] ||
    `https://${MarketManager.getMarketDomains().BE?.replace('https://', '') || 'www.voices.be'}`;
  const origin = host.includes('localhost') ? `http://${host}` : site_url;
  const voices_link = `${origin}/account/confirm?token=${token}&type=${type}&redirect=${encodeURIComponent(redirect_path)}`;

  void ServerWatchdog.report({
    error: `Magic link generated for ${email}`,
    component: 'AuthAPI',
    url: request_url,
    level: 'info',
    payload: { request_id, email, link: voices_link },
  });

  const mail_engine = VoicesMailEngine.getInstance();
  const cookie_lang = cookie_header
    ?.split('; ')
    .find((part) => part.startsWith('voices_lang='))
    ?.split('=')[1];
  const lang = normalizeLocale(
    requested_language ||
      cookie_lang ||
      voices_language_header ||
      accept_language?.split(',')[0] ||
      market.primary_language ||
      'nl-be'
  );

  try {
    await Promise.race([
      mail_engine.sendMagicLink(email, voices_link, lang, host),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Mailserver Timeout')), 5000)),
    ]);
    console.log(`[Auth API] [${request_id}] Mail successfully sent to: ${email}`);
    return;
  } catch (mail_error: any) {
    console.warn(
      `[Auth API] [${request_id}] Primary mail failed/timed out, trying fallback:`,
      mail_error?.message || mail_error
    );
  }

  const fallback_redirect = `${origin_url}/account/confirm?redirect=${encodeURIComponent(redirect_path)}`;
  const fallback = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: fallback_redirect,
    },
  });

  if (fallback.error) {
    const is_rate_limit =
      fallback.error.message.includes('rate limit') || fallback.error.message.includes('security purposes');
    await ServerWatchdog.report({
      error: `Magic link failed (Custom & Fallback): ${fallback.error.message} (Status: ${fallback.error.status})`,
      component: 'AuthAPI',
      url: request_url,
      level: is_rate_limit ? 'info' : 'critical',
      payload: {
        request_id,
        email,
        fallback_error: fallback.error.message,
        fallback_status: fallback.error.status,
      },
    });
    return;
  }

  console.log(`[Auth API] [${request_id}] Fallback magic link sent successfully to: ${email}`);
}

/**
 * CUSTOM AUTH API (BOB-METHOD 2026)
 * 
 * Verstuurt een magic link via onze eigen VoicesMailEngine.
 * De link wijst nu DIRECT naar de juiste market voor maximale betrouwbaarheid.
 */
export async function POST(req: Request) {
  const started_at = Date.now();
  console.log('🚀 [Auth API] Magic Link request started');
  try {
    const body = await req.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const redirect_path = typeof body?.redirect === 'string' ? body.redirect : '/account';
    const requested_language = typeof body?.language === 'string' ? body.language : undefined;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Geef een geldig e-mailadres op.' }, { status: 400 });
    }

    // Fast preflight check: fail direct if admin client cannot be created.
    if (!createAdminClient()) {
      await ServerWatchdog.report({
        error: 'Auth service niet beschikbaar (Service role key missing)',
        component: 'AuthAPI',
        url: req.url,
        level: 'critical',
      });
      return NextResponse.json({ error: 'Auth service niet beschikbaar (Service role key missing)' }, { status: 500 });
    }

    const request_id = crypto.randomUUID();
    launchMagicLinkPipeline({
      request_id,
      email,
      redirect_path,
      requested_language,
      request_url: req.url,
      cookie_header: req.headers.get('cookie'),
      accept_language: req.headers.get('accept-language'),
      voices_language_header: req.headers.get('x-voices-lang'),
    });

    const queued_in_ms = Date.now() - started_at;
    console.log(`[Auth API] [${request_id}] Request queued in ${queued_in_ms}ms for ${email}`);

    return NextResponse.json(
      {
        success: true,
        queued: true,
        request_id,
        queued_in_ms,
      },
      {
        status: 202,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (err: any) {
    console.error('[Auth API] Unexpected error:', err);
    await ServerWatchdog.report({
      error: `Unexpected Auth API error: ${err.message}`,
      stack: err.stack,
      component: 'AuthAPI',
      url: req.url,
      level: 'critical'
    });
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
