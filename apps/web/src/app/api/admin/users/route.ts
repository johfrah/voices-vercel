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
      query = query.where(
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
      query = query.where(
        and(
          or(isNull(users.first_name), eq(users.first_name, '')),
          or(isNull(users.last_name), eq(users.last_name, '')),
          // We also check companyName, because if they have a company name, they are not "incomplete" per se
          or(isNull(users.companyName), eq(users.companyName, ''))
        )
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
