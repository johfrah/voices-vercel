import { db } from '@/lib/system/voices-config';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

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

    // Self-healing: Tabel aanmaken als deze niet bestaat (hoewel deze in schema.ts staat)
    await db.execute(sql`
      create table if not exists chat_push_subscriptions (
        id serial primary key,
        user_id integer references users(id),
        endpoint text not null unique,
        p256dh text not null,
        auth text not null,
        user_agent text,
        enabled boolean default true,
        created_at timestamp default now()
      )
    `);

    if (action === 'subscribe') {
      const admin = auth as any; // requireAdmin returns auth user when available
      const cookieHeader = request.headers.get('cookie') || '';
      const bridgeMatch = cookieHeader.match(/sb-access-token=admin-bridge-(\d+)/i);

      let adminDbId: number | null = null;
      if (bridgeMatch?.[1]) {
        const parsed = Number.parseInt(bridgeMatch[1], 10);
        if (Number.isFinite(parsed) && parsed > 0) {
          adminDbId = parsed;
        }
      }

      if (!adminDbId && admin?.user?.email) {
        const userRowsResult: any = await db.execute(sql`
          select id
          from users
          where lower(email) = lower(${admin.user.email})
          limit 1
        `);
        const userRows = Array.isArray(userRowsResult)
          ? userRowsResult
          : Array.isArray(userRowsResult?.rows)
            ? userRowsResult.rows
            : [];
        const parsed = Number(userRows[0]?.id || 0);
        if (Number.isFinite(parsed) && parsed > 0) {
          adminDbId = parsed;
        }
      }
      
      // Upsert subscription
      await db.execute(sql`
        insert into chat_push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
        values (
          ${adminDbId},
          ${subscription.endpoint},
          ${subscription.keys.p256dh},
          ${subscription.keys.auth},
          ${request.headers.get('user-agent')}
        )
        on conflict (endpoint) do update set
          user_id = excluded.user_id,
          enabled = true
      `);

      console.log(`[Push] New subscription registered for admin.`);
      return NextResponse.json({ success: true, message: 'Subscription saved' });
    } 
    
    if (action === 'unsubscribe') {
      await db.execute(sql`
        update chat_push_subscriptions
        set enabled = false
        where endpoint = ${subscription.endpoint}
      `);
      return NextResponse.json({ success: true, message: 'Unsubscribed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error(' PUSH API ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
