import { db, users, ordersV2 } from '@/lib/system/voices-config';
import { desc, eq, sql, and, or, isNull } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  API: ADMIN USERS (2026)
 *  Enriched with Customer Intelligence (LTV, Activity, Worlds)
 */

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const worldCode = searchParams.get('world');
  const filter = searchParams.get('filter');

  try {
    // 1. Base Query (Select + From + Join)
    // We use $dynamic() to allow chaining .where() conditionally before .groupBy()
    let query = db.select({
      id: users.id,
      first_name: users.first_name,
      last_name: users.last_name,
      email: users.email,
      companyName: users.companyName,
      createdAt: users.createdAt,
      lastActive: users.lastActive,
      role: users.role,
      // Aggregated fields
      orderCount: sql<number>`count(${ordersV2.id})::int`,
      totalSpent: sql<string>`coalesce(sum(${ordersV2.amountNet}), 0)::text`,
      activeWorlds: sql<any[]>`array_agg(distinct jsonb_build_object('id', ${ordersV2.worldId}, 'code', (SELECT code FROM worlds WHERE id = ${ordersV2.worldId}), 'icon', (SELECT icon FROM worlds WHERE id = ${ordersV2.worldId}))) filter (where ${ordersV2.worldId} is not null)`,
      subroles: users.subroles,
      totalEarned: sql<string>`(SELECT coalesce(sum(cost), 0)::text FROM order_items WHERE actor_id = (SELECT id FROM actors WHERE user_id = ${users.id} LIMIT 1))`,
      profit: sql<string>`coalesce(sum(${ordersV2.amountNet} - (SELECT coalesce(sum(oi.cost), 0) FROM order_items oi WHERE oi.order_id = ${ordersV2.id})), 0)::text`
    })
    .from(users)
    .leftJoin(ordersV2, eq(users.id, ordersV2.userId))
    .$dynamic();

    // 2. Apply Filters (Where Clauses)
    const filters = [];

    // Filter by World if requested
    if (worldCode) {
      // 🌍 World-Aware filtering
      filters.push(
        sql`${users.id} IN (
          SELECT user_id FROM orders_v2 
          WHERE world_id = (SELECT id FROM worlds WHERE code = ${worldCode})
        )`
      );
    }

    // 🕵️ Data Quality Filter (Incomplete Profiles)
    if (filter === 'incomplete') {
      // Find users where first_name AND last_name are empty/null
      // AND companyName is empty/null (otherwise they are corporate users)
      filters.push(
        and(
          or(isNull(users.first_name), eq(users.first_name, '')),
          or(isNull(users.last_name), eq(users.last_name, '')),
          // We also check companyName, because if they have a company name, they are not "incomplete" per se
          or(isNull(users.companyName), eq(users.companyName, ''))
        )
      );
    }

    if (filters.length > 0) {
      query = query.where(and(...filters));
    }

    // 3. Finalize Query (Group By + Order By + Limit)
    // CRITICAL: .groupBy() must be called AFTER .where()
    const allUsers = await query
      .groupBy(users.id)
      .orderBy(desc(sql`COALESCE(sum(${ordersV2.amountNet}), 0)`), desc(users.createdAt))
      .limit(500);

    // Map the results to a clean format
    const enrichedUsers = allUsers.map((user: any) => {
      // 🧠 Smart Name Logic (No more 'Onbekend')
      let displayName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      
      if (!displayName) {
        if (user.companyName) {
          displayName = user.companyName;
        } else if (user.email) {
          const [localPart] = user.email.split('@');
          // Capitalize first letter for a friendlier look
          displayName = localPart.charAt(0).toUpperCase() + localPart.slice(1);
        } else {
          displayName = `Gastgebruiker #${user.id}`;
        }
      }

      return {
        id: user.id,
        name: displayName,
        email: user.email,
        companyName: user.companyName,
        role: user.role,
        createdAt: user.createdAt,
        lastActive: user.lastActive,
        subroles: user.subroles || [],
        stats: {
          orders: user.orderCount,
          totalSpent: parseFloat(user.totalSpent),
          totalEarned: parseFloat(user.totalEarned || '0'),
          profit: parseFloat(user.profit || '0'),
          activeWorlds: user.activeWorlds || []
        }
      };
    });

    return NextResponse.json(enrichedUsers);
  } catch (error) {
    console.error('[Admin Users GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
