import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 * YUKI AUTOMATION BRIDGE (NUCLEAR LOGIC 2026)
 * 
 * Vertaalt de legacy PHP Yuki SOAP client naar een moderne TypeScript service.
 * Verantwoordelijk voor:
 * 1. Synchroniseren van verkoopfacturen naar Yuki.
 * 2. Aanmaken/bijwerken van contacten in Yuki.
 * 3. Status-updates van betalingen.
 */

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json().catch(() => ({}));
    const orderId = Number(body?.orderId);

    return NextResponse.json({
      success: false,
      orderId: Number.isFinite(orderId) ? orderId : null,
      error: 'Deprecated endpoint',
      message:
        'Deze route is uitgeschakeld om valse Yuki-bevestigingen te voorkomen. Gebruik de admin order flow met geverifieerde sync.',
      mode: 'disabled',
    });

  } catch (error) {
    console.error(' Yuki Sync Error:', error);
    return NextResponse.json({ error: 'Yuki synchronization failed' }, { status: 500 });
  }
}
