import { db, chatPushSubscriptions, users } from '@/lib/system/voices-config';
import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';
import postgres from 'postgres';

export const dynamic = 'force-dynamic';

/**
 * 🔔 PUSH SUBSCRIPTION API (VOICES 2026)
 * 
 * Beheert Web Push subscriptions voor admin notificaties op iPhone/Smartphone.
 */
export async function POST(request: Request) {
  try {
    // 1. Auth check (Alleen admins mogen push meldingen ontvangen)
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { subscription, action } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }

    // 🛡️ CHRIS-PROTOCOL: Raw SQL voor schema-stabiliteit
    const connectionString = process.env.DATABASE_URL!.replace('?pgbouncer=true', '');
    const sqlDirect = postgres(connectionString, { ssl: 'require' });

    // Self-healing: Tabel aanmaken als deze niet bestaat (hoewel deze in schema.ts staat)
    await sqlDirect`
      CREATE TABLE IF NOT EXISTS chat_push_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        endpoint TEXT NOT NULL UNIQUE,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        user_agent TEXT,
        enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    if (action === 'subscribe') {
      const admin = await auth as any; // requireAdmin returns the user if successful
      
      // Upsert subscription
      await sqlDirect`
        INSERT INTO chat_push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
        VALUES (
          ${admin.id}, 
          ${subscription.endpoint}, 
          ${subscription.keys.p256dh}, 
          ${subscription.keys.auth},
          ${request.headers.get('user-agent')}
        )
        ON CONFLICT (endpoint) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          enabled = TRUE
      `;

      console.log(`[Push] New subscription registered for admin: ${admin.email}`);
      await sqlDirect.end();
      return NextResponse.json({ success: true, message: 'Subscription saved' });
    } 
    
    if (action === 'unsubscribe') {
      await sqlDirect`
        UPDATE chat_push_subscriptions SET enabled = FALSE WHERE endpoint = ${subscription.endpoint}
      `;
      await sqlDirect.end();
      return NextResponse.json({ success: true, message: 'Unsubscribed' });
    }

    await sqlDirect.end();
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error(' PUSH API ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
