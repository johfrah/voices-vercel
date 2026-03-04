import { db, users, ordersV2 } from '@/lib/system/voices-config';
import { desc, eq, sql } from 'drizzle-orm';
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

  try {
    // Construct the base query with aggregations
    // We use a raw SQL selection to efficiently aggregate order data
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
      activeWorlds: sql<number[]>`array_agg(distinct ${ordersV2.worldId}) filter (where ${ordersV2.worldId} is not null)`
    })
    .from(users)
    .leftJoin(ordersV2, eq(users.id, ordersV2.userId))
    .groupBy(users.id);

    // Filter by World if requested
    if (worldCode) {
      // 🌍 World-Aware filtering
      // We filter users who have at least one order in the requested world
      // Note: The HAVING clause would be more appropriate for aggregated data, 
      // but for performance on large datasets, a WHERE IN subquery is often better.
      // However, since we are already joining, we can use the aggregated array in the application layer 
      // or add a WHERE clause before aggregation if we only want users *with* orders in that world.
      
      // Strategy: Filter the main query to only include users who have a matching order
      // We use a subquery approach to keep the aggregation correct (total spent across ALL worlds, but filtered by specific world presence)
      query = query.where(
        sql`${users.id} IN (
          SELECT user_id FROM orders_v2 
          WHERE world_id = (SELECT id FROM worlds WHERE code = ${worldCode})
        )`
      );
    }

    // Execute query with limit
    const allUsers = await query.orderBy(desc(users.createdAt)).limit(500);

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
        stats: {
          orders: user.orderCount,
          totalSpent: parseFloat(user.totalSpent),
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
