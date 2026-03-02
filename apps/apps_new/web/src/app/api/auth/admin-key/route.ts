import { db, users } from '@/lib/system/voices-config';
import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 *  ADMIN KEY BRIDGE (VOICES 2026)
 * 
 * Route: /api/auth/admin-key?key=...
 * 
 * Herbruikbare login bridge voor admin smartphone (PWA modus).
 * Zet een langdurige sessie op basis van een unieke admin_key.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const redirectPath = searchParams.get('redirect') || '/admin/live-chat';

    if (!key) {
      return NextResponse.redirect(new URL('/login?error=no_key', request.url));
    }

    // 1. Zoek admin op basis van key via Raw SQL (Chris-Protocol: Anti-Drift)
    const postgres = require('postgres');
    const connectionString = process.env.DATABASE_URL!.replace('?pgbouncer=true', '');
    const sqlDirect = postgres(connectionString, {
      ssl: 'require',
    });
    
    const [admin] = await sqlDirect`
      SELECT id, email, role FROM users WHERE admin_key = ${key} LIMIT 1
    `;
    await sqlDirect.end();

    if (!admin || (admin.role !== 'admin' && admin.role !== 'ademing_admin')) {
      console.warn(`[Admin Key] Invalid key attempt: ${key.substring(0, 5)}...`);
      return NextResponse.redirect(new URL('/login?error=invalid_key', request.url));
    }

    // 2. Zet sessie cookies (Voices 2026 Standard)
    // We simuleren hier de Supabase sessie door onze eigen admin cookies te zetten
    // die door requireAdmin() worden herkend via de Legacy Bridge fallback.
    const response = NextResponse.redirect(new URL(redirectPath, request.url));
    
    // Zet de admin rol cookie (via response object voor Next.js 15 compatibiliteit)
    response.cookies.set('voices_role', 'admin', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 jaar (voor smartphone gemak)
      path: '/',
    });

    // Zet een 'pseudo' access token voor de bridge
    response.cookies.set('sb-access-token', `admin-bridge-${admin.id}`, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });

    // 🛡️ CHRIS-PROTOCOL: Force same-site lax for cross-domain redirects (v2.15.093)
    // Dit zorgt ervoor dat de cookies behouden blijven bij de redirect naar de admin pagina.
    console.log(`[Admin Key] Persistent session established for: ${admin.email}`);
    
    // 🛡️ NUCLEAR CACHE BUSTER: Forceer een refresh door een timestamp toe te voegen indien nodig
    // Maar we houden de URL schoon voor de gebruiker.
    return response;

  } catch (error: any) {
    console.error(' ADMIN KEY BRIDGE ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
