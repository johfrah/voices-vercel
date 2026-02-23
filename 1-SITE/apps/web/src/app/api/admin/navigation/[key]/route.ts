import { ConfigBridge } from '@/lib/utils/utils/config-bridge';
import { requireAdmin } from '@/lib/auth/api-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 *  API: ADMIN NAVIGATION (2026)
 * GET: Haalt de config op voor een specifieke journey
 * POST: Slaat de config op voor een specifieke journey
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  // CHRIS-PROTOCOL: Internal bypass for public config bridge
  const internalBypass = request.headers.get('x-internal-bypass');
  const isInternal = internalBypass && internalBypass === process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!isInternal) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  }

  const config = await ConfigBridge.getNavConfig(params.key);
  return NextResponse.json(config || { links: [], icons: {} });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const result = await ConfigBridge.saveNavConfig(params.key, body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
