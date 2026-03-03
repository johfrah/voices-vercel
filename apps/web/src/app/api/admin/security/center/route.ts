import { requireAdmin } from '@/lib/auth/api-auth';
import { appConfigs, db } from '@/lib/system/voices-config';
import {
  DEFAULT_SECURITY_CENTER_SETTINGS,
  SECURITY_SETTINGS_KEY,
  merge_security_settings,
  run_security_audit,
  sanitize_security_settings,
  type SecurityCenterSettings,
} from '@/lib/system/security/security-center';
import { createClient } from '@supabase/supabase-js';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabase_key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const supabase = supabase_url && supabase_key ? createClient(supabase_url, supabase_key) : null;

async function fetch_security_settings_from_db(): Promise<SecurityCenterSettings> {
  try {
    if (db && appConfigs) {
      const rows = await db
        .select({ value: appConfigs.value })
        .from(appConfigs)
        .where(eq(appConfigs.key, SECURITY_SETTINGS_KEY))
        .limit(1);

      const stored = rows[0]?.value;
      if (stored) return sanitize_security_settings(stored);
    }
  } catch (error) {
    console.warn('[Security Center] Drizzle fetch failed, falling back to SDK.', error);
  }

  if (supabase) {
    const { data, error } = await supabase
      .from('app_configs')
      .select('value')
      .eq('key', SECURITY_SETTINGS_KEY)
      .maybeSingle();

    if (!error && data?.value) {
      return sanitize_security_settings(data.value);
    }
  }

  return { ...DEFAULT_SECURITY_CENTER_SETTINGS };
}

async function store_security_settings(settings: SecurityCenterSettings): Promise<void> {
  try {
    if (db && appConfigs) {
      await db
        .insert(appConfigs)
        .values({
          key: SECURITY_SETTINGS_KEY,
          value: settings,
          description: 'Centralized Security Center settings',
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: appConfigs.key,
          set: {
            value: settings,
            description: 'Centralized Security Center settings',
            updatedAt: new Date(),
          },
        });
      return;
    }
  } catch (error) {
    console.warn('[Security Center] Drizzle save failed, falling back to SDK.', error);
  }

  if (!supabase) {
    throw new Error('Supabase client is not configured');
  }

  const { error } = await supabase.from('app_configs').upsert(
    {
      key: SECURITY_SETTINGS_KEY,
      value: settings,
      description: 'Centralized Security Center settings',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' }
  );

  if (error) throw error;
}

function make_audit_payload(settings: SecurityCenterSettings) {
  return run_security_audit(settings, {
    node_env: process.env.NODE_ENV,
    has_supabase_service_role_key: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    has_admin_email: Boolean(process.env.ADMIN_EMAIL),
  });
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const settings = await fetch_security_settings_from_db();
    const audit = make_audit_payload(settings);

    return NextResponse.json({
      success: true,
      key: SECURITY_SETTINGS_KEY,
      settings,
      audit,
      _version: '2.28.1',
    });
  } catch (error) {
    console.error('[Security Center GET Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load security center settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const current = await fetch_security_settings_from_db();
    const patch = typeof body === 'object' && body !== null && 'settings' in body
      ? (body as { settings?: unknown }).settings
      : body;

    const merged = merge_security_settings(current, patch);
    await store_security_settings(merged);

    const audit = make_audit_payload(merged);

    return NextResponse.json({
      success: true,
      key: SECURITY_SETTINGS_KEY,
      settings: merged,
      audit,
      _version: '2.28.1',
    });
  } catch (error) {
    console.error('[Security Center POST Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save security center settings' },
      { status: 500 }
    );
  }
}
